import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'node:path';
import fs from 'node:fs';
import { validateEnv } from '../config/env.js';
import Lead from '../models/Lead.js';
import { Service, Project, Post, Job } from '../models/Content.js';
import { requireAdmin } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

const router = Router();
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 8, standardHeaders: true, legacyHeaders: false, message: { message: 'Too many login attempts. Please try again later.' } });
router.post('/login', loginLimiter, async (req, res) => {
  const env = validateEnv(); const { email, password } = req.body || {};
  if (typeof email !== 'string' || typeof password !== 'string') return res.status(400).json({ message: 'Email and password are required' });
  const emailMatches = email.trim().toLowerCase() === env.adminEmail.trim().toLowerCase(); let passwordMatches = false;
  if (env.adminPassword.startsWith('$2a$') || env.adminPassword.startsWith('$2b$')) passwordMatches = await bcrypt.compare(password, env.adminPassword); else passwordMatches = password === env.adminPassword;
  if (!emailMatches || !passwordMatches) return res.status(401).json({ message: 'Invalid email or password' });
  const token = jwt.sign({ role: 'admin', email: env.adminEmail }, env.jwtSecret, { expiresIn: '4h', issuer: 'riyadvi-api', audience: 'riyadvi-admin' });
  return res.json({ token, expiresIn: 14400 });
});



const cmsModels = { services: Service, portfolio: Project, blog: Post, careers: Job };
function safeCmsPayload(body = {}) {
  const source = body && typeof body === 'object' && !Array.isArray(body) ? body : {};
  const clean = { ...source };
  delete clean._id; delete clean.__v; delete clean.createdAt; delete clean.updatedAt;
  if (typeof clean.title !== 'string' && typeof clean.name === 'string') clean.title = clean.name;
  if (typeof clean.title !== 'string' && typeof clean.name !== 'string') throw new Error('A title or name is required');
  const base = String(clean.slug || clean.title || clean.name).trim().toLowerCase()
    .normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  if (!base) throw new Error('A valid slug is required');
  clean.slug = base;
  clean.status = clean.status === 'draft' ? 'draft' : 'published';
  return clean;
}
router.get('/content/:type', requireAdmin, async (req, res) => {
  if (!req.app.locals.dbReady) return res.status(503).json({ message: 'Database is not connected' });
  const Model = cmsModels[req.params.type];
  if (!Model) return res.status(404).json({ message: 'Unknown content type' });
  try {
    const items = await Model.find().sort({ updatedAt: -1, createdAt: -1 }).limit(500).lean();
    return res.json({ items });
  } catch (error) { req.log?.error?.({ err: error }, 'CMS list failed'); return res.status(500).json({ message: 'Unable to load CMS content' }); }
});
router.post('/content/:type', requireAdmin, async (req, res) => {
  if (!req.app.locals.dbReady) return res.status(503).json({ message: 'Database is not connected' });
  const Model = cmsModels[req.params.type];
  if (!Model) return res.status(404).json({ message: 'Unknown content type' });
  try {
    const payload = safeCmsPayload(req.body);
    const item = await Model.create(payload);
    return res.status(201).json({ item });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'That slug already exists. Choose a unique slug.' });
    if (error.name === 'ValidationError' || error.message === 'A title or name is required' || error.message === 'A valid slug is required') return res.status(400).json({ message: error.message || 'Please check the content fields' });
    req.log?.error?.({ err: error }, 'CMS create failed'); return res.status(500).json({ message: 'Unable to create content' });
  }
});
router.put('/content/:type/:id', requireAdmin, async (req, res) => {
  if (!req.app.locals.dbReady) return res.status(503).json({ message: 'Database is not connected' });
  const Model = cmsModels[req.params.type];
  if (!Model) return res.status(404).json({ message: 'Unknown content type' });
  try {
    const payload = safeCmsPayload(req.body);
    const item = await Model.findByIdAndUpdate(req.params.id, { $set: payload }, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: 'Content not found' });
    return res.json({ item });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ message: 'That slug already exists. Choose a unique slug.' });
    if (error.name === 'ValidationError' || error.name === 'CastError' || error.message === 'A title or name is required' || error.message === 'A valid slug is required') return res.status(400).json({ message: error.message || 'Please check the content fields' });
    req.log?.error?.({ err: error }, 'CMS update failed'); return res.status(500).json({ message: 'Unable to update content' });
  }
});
router.delete('/content/:type/:id', requireAdmin, async (req, res) => {
  if (!req.app.locals.dbReady) return res.status(503).json({ message: 'Database is not connected' });
  const Model = cmsModels[req.params.type];
  if (!Model) return res.status(404).json({ message: 'Unknown content type' });
  try {
    const item = await Model.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ message: 'Content not found' });
    return res.json({ message: 'Content deleted successfully' });
  } catch (error) { if (error.name === 'CastError') return res.status(400).json({ message: 'Invalid content ID' }); req.log?.error?.({ err: error }, 'CMS delete failed'); return res.status(500).json({ message: 'Unable to delete content' }); }
});

function csvCell(value) { const text = value == null ? '' : value instanceof Date ? value.toISOString() : String(value); return `"${text.replace(/"/g, '""')}"`; }
function normalizedStatus(status) { return status === 'reviewing' ? 'contacted' : status || 'new'; }
router.get('/dashboard', requireAdmin, async (req, res) => {
  if (!req.app.locals.dbReady) return res.status(503).json({ message: 'Database is not connected' });
  try {
    const types = ['contact', 'consultation', 'health-checkup', 'lead-magnet', 'application']; const counts = {};
    for (const type of types) counts[type.replace(/-([a-z])/g, (_m, c) => c.toUpperCase())] = await Lead.countDocuments({ type });
    counts.totalEnquiries = counts.contact;
    counts.total = await Lead.countDocuments();
    const rawRecent = await Lead.find().sort({ createdAt: -1 }).limit(100).select('name email phone company requirement message position type status statusUpdatedAt createdAt resume').lean();
    const recent = rawRecent.map(lead => ({ ...lead, status: normalizedStatus(lead.status), hasResume: Boolean(lead.resume?.filename), resume: undefined }));
    return res.json({ counts, recent });
  } catch (error) { req.log?.error?.({ err: error }, 'Admin dashboard query failed'); return res.status(500).json({ message: 'Unable to load dashboard data' }); }
});

router.get('/leads', requireAdmin, async (req, res) => {
  if (!req.app.locals.dbReady) return res.status(503).json({ message: 'Database is not connected' });
  try {
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1); const limit = req.query.format === 'csv' ? 10000 : Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 20));
    const filter = {}; if (['contact', 'consultation', 'health-checkup', 'lead-magnet', 'application'].includes(req.query.type)) filter.type = req.query.type;
    const search = typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 80) : '';
    if (search) { const safe = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); filter.$or = ['name', 'email', 'phone', 'company', 'requirement', 'position'].map(key => ({ [key]: { $regex: safe, $options: 'i' } })); }
    const total = await Lead.countDocuments(filter); const cursor = Lead.find(filter).sort({ createdAt: -1 }).select('-resume'); const leads = req.query.format === 'csv' ? await cursor.limit(limit).lean() : await cursor.skip((page - 1) * limit).limit(limit).lean();
    if (req.query.format === 'csv') {
      const columns = ['name', 'email', 'phone', 'company', 'requirement', 'type', 'status', 'createdAt', 'position', 'message'];
      const rows = [columns.join(','), ...leads.map(item => columns.map(key => csvCell(key === 'status' ? normalizedStatus(item[key]) : item[key])).join(','))].join('\r\n');
      res.setHeader('Content-Type', 'text/csv; charset=utf-8'); res.setHeader('Content-Disposition', 'attachment; filename="riyadvi-leads.csv"'); return res.send(rows);
    }
    return res.json({ items: leads.map(item => ({ ...item, status: normalizedStatus(item.status) })), page, limit, total, pages: Math.ceil(total / limit) });
  } catch (error) { req.log?.error?.({ err: error }, 'Admin lead query failed'); return res.status(500).json({ message: 'Unable to load leads' }); }
});

router.get('/applications', requireAdmin, async (req, res) => {
  if (!req.app.locals.dbReady) return res.status(503).json({ message: 'Database is not connected' });
  const applications = await Lead.find({ type: 'application' }).sort({ createdAt: -1 }).select('name email phone position message createdAt status resume').lean();
  return res.json({ items: applications.map(item => ({ ...item, hasResume: Boolean(item.resume?.filename), resume: undefined })) });
});

router.get('/applications/:id/resume', requireAdmin, async (req, res) => {
  if (!req.app.locals.dbReady) return res.status(503).json({ message: 'Database is not connected' });
  try {
    const lead = await Lead.findOne({ _id: req.params.id, type: 'application' }).select('resume').lean();
    if (!lead?.resume?.filename) return res.status(404).json({ message: 'Resume not found' });
    const filename = path.basename(lead.resume.filename); const filePath = path.resolve(process.cwd(), validateEnv().uploadDir, filename);
    if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'Resume file is no longer available' });
    return res.download(filePath, path.basename(lead.resume.originalName || 'resume'));
  } catch { return res.status(400).json({ message: 'Invalid application ID' }); }
});

router.patch('/leads/:id/status', requireAdmin, async (req, res) => {
  if (!req.app.locals.dbReady) return res.status(503).json({ message: 'Database is not connected' });
  const allowed = ['new', 'contacted', 'qualified', 'closed']; if (!allowed.includes(req.body?.status)) return res.status(400).json({ message: 'Invalid status' });
  try {
    const lead = await Lead.findById(req.params.id); if (!lead) return res.status(404).json({ message: 'Lead not found' });
    const current = normalizedStatus(lead.status); const next = { new: 'contacted', contacted: 'qualified', qualified: 'closed', closed: null }[current];
    if (req.body.status !== current && req.body.status !== next) return res.status(409).json({ message: `Invalid workflow transition from ${current} to ${req.body.status}` });
    lead.status = req.body.status; lead.statusUpdatedAt = new Date(); lead.statusUpdatedBy = req.admin?.email || 'admin'; await lead.save();
    return res.json({ lead: { _id: lead._id, name: lead.name, email: lead.email, type: lead.type, status: lead.status, statusUpdatedAt: lead.statusUpdatedAt, statusUpdatedBy: lead.statusUpdatedBy, createdAt: lead.createdAt } });
  } catch { return res.status(400).json({ message: 'Invalid lead ID' }); }
});
export default router;
