import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import rateLimit from 'express-rate-limit';
import { validateEnv } from '../config/env.js';
import Lead from '../models/Lead.js';
import { Service, Project, Post, Job } from '../models/Content.js';
import { validateLead, calculateHealthScore, isAllowedResume, isResumeSignature } from '../services/validation.js';
import { sendLeadNotification } from '../services/notifications.js';

const router = Router();
const env = validateEnv();
const formLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false, message: { message: 'Too many submissions. Please try again later.' } });
const uploadPath = path.resolve(process.cwd(), env.uploadDir);
fs.mkdirSync(uploadPath, { recursive: true });
const storage = multer.diskStorage({ destination: (_req, _file, cb) => cb(null, uploadPath), filename: (_req, file, cb) => cb(null, `${crypto.randomUUID()}${path.extname(file.originalname).toLowerCase()}`) });
const upload = multer({ storage, limits: { fileSize: env.maxUploadMb * 1024 * 1024, files: 1 }, fileFilter: (_req, file, cb) => isAllowedResume({ originalname: file.originalname, mimetype: file.mimetype, size: 0 }) ? cb(null, true) : cb(new Error('Resume must be a PDF or Word document with a matching extension')) });

async function createLead(req, res, type) {
  if (!req.app.locals.dbReady) { if (req.file) fs.unlink(req.file.path, () => {}); return res.status(503).json({ message: 'Database is not connected. Please try again later.' }); }
  const result = validateLead(req.body);
  if (!result.success) { if (req.file) fs.unlink(req.file.path, () => {}); return res.status(400).json({ message: 'Please check the submitted fields', errors: result.errors }); }
  if (type === 'lead-magnet' && (!result.data.name || !result.data.company || !result.data.phone || !result.data.email)) return res.status(400).json({ message: 'Name, company, email and phone are required' });
  if (type === 'application' && (!req.file || !result.data.position || !result.data.phone)) { if (req.file) fs.unlink(req.file.path, () => {}); return res.status(400).json({ message: 'Phone, position and a valid resume are required' }); }
  if (type === 'application' && req.file) { const header = Buffer.alloc(8); const fd = fs.openSync(req.file.path, 'r'); try { fs.readSync(fd, header, 0, 8, 0); } finally { fs.closeSync(fd); } if (!isResumeSignature(header, req.file.originalname)) { fs.unlink(req.file.path, () => {}); return res.status(400).json({ message: 'Resume file contents do not match the selected file type.' }); } }
  const { healthScore: _clientScore, ...safeData } = result.data;
  const healthData = type === 'health-checkup' ? { healthAnswers: safeData.healthAnswers || {}, healthScore: calculateHealthScore(safeData.healthAnswers || {}) } : {};
  try {
    const lead = await Lead.create({ ...safeData, ...healthData, type, ...(req.file ? { resume: { originalName: path.basename(req.file.originalname), filename: req.file.filename, mimetype: req.file.mimetype, size: req.file.size } } : {}) });
    sendLeadNotification(lead).catch(error => console.warn('Email notification failed:', error.message));
    return res.status(201).json({ message: type === 'lead-magnet' ? 'Your request was received. Guide access is ready.' : 'Your submission was received successfully.', id: lead._id, ...(type === 'health-checkup' ? { healthScore: lead.healthScore } : {}) });
  } catch (error) {
    if (req.file) fs.unlink(req.file.path, () => {});
    if (error.name === 'ValidationError') return res.status(400).json({ message: 'Please check the submitted fields' });
    req.log?.error?.({ err: error }, 'Lead creation failed');
    return res.status(500).json({ message: 'Unable to save your submission right now.' });
  }
}

for (const [route, type] of [['/contact', 'contact'], ['/consultation', 'consultation'], ['/health-checkup', 'health-checkup'], ['/lead-magnet', 'lead-magnet']]) router.post(route, formLimiter, (req, res) => createLead(req, res, type));
router.post('/applications', formLimiter, upload.single('resume'), (req, res) => createLead(req, res, 'application'));

const contentRoutes = [
  ['/services', Service], ['/portfolio', Project], ['/blog', Post], ['/careers', Job],
];
for (const [base, Model] of contentRoutes) {
  router.get(base, async (req, res, next) => {
    if (!req.app.locals.dbReady) return res.status(503).json({ message: 'Database is not connected', items: [] });
    try {
      const query = { status: { $ne: 'draft' } };
      if (req.query.department) query.department = req.query.department;
      if (req.query.designation) query.designation = req.query.designation;
      if (req.query.experience) query.experience = req.query.experience;
      if (req.query.category) query.category = req.query.category;
      const search = typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 80) : '';
      if (search) { const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); query.$or = ['name', 'title', 'slug', 'category', 'excerpt', 'description'].map(field => ({ [field]: { $regex: escaped, $options: 'i' } })); }
      const items = await Model.find(query).sort({ createdAt: -1 }).lean();
      return res.json({ items });
    } catch (error) { return next(error); }
  });
  router.get(`${base}/:slug`, async (req, res, next) => {
    if (!req.app.locals.dbReady) return res.status(503).json({ message: 'Database is not connected' });
    try {
      const item = await Model.findOne({ slug: req.params.slug.toLowerCase(), status: { $ne: 'draft' } }).lean();
      return item ? res.json({ item }) : res.status(404).json({ message: 'Content not found' });
    } catch (error) { return next(error); }
  });
}

export default router;
