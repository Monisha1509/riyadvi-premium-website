import mongoose from 'mongoose';

const contentSchema = new mongoose.Schema({
  slug: { type: String, required: true, trim: true, lowercase: true, unique: true, index: true },
  name: { type: String, trim: true },
  title: { type: String, trim: true },
  type: { type: String, trim: true },
  status: { type: String, enum: ['draft', 'published'], default: 'published', index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { strict: false, timestamps: true, minimize: false });

const Service = mongoose.models.Service || mongoose.model('Service', contentSchema.clone(), 'services');
const Project = mongoose.models.Project || mongoose.model('Project', contentSchema.clone(), 'projects');
const Post = mongoose.models.Post || mongoose.model('Post', contentSchema.clone(), 'posts');
const Job = mongoose.models.Job || mongoose.model('Job', contentSchema.clone(), 'jobs');

export { Service, Project, Post, Job };
