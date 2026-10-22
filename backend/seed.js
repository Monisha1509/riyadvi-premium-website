import mongoose from 'mongoose';
import { validateEnv } from './src/config/env.js';
import { Service, Project, Post, Job } from './src/models/Content.js';
import { services, projects, posts, jobs } from '../frontend/src/data/content.js';

const env = validateEnv();
const clean = (item) => ({ ...item, type: item.type?.replace(/Illustrative portfolio entry/i, 'Sample content — concept for review').replace(/Demonstration listing/i, 'Sample content — role details to confirm'), status: 'published' });
try {
  await mongoose.connect(env.mongoUri);
  for (const [Model, rows] of [[Service, services], [Project, projects], [Post, posts], [Job, jobs]]) {
    for (const row of rows) await Model.updateOne({ slug: row.slug }, { $set: clean(row) }, { upsert: true, runValidators: true });
    console.log(`Seeded ${rows.length} ${Model.collection.collectionName}`);
  }
} catch (error) {
  console.error('Seed failed:', error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect().catch(() => {});
}
