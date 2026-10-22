import test from 'node:test';import assert from 'node:assert/strict';import request from 'supertest';import {createApp} from '../src/app.js';
const app=createApp();
test('health endpoint reports service and database state',async()=>{const r=await request(app).get('/api/health');assert.equal(r.status,200);assert.equal(r.body.service,'riyadvi-api');assert.equal(r.body.database,'disconnected')});
test('unknown API route returns JSON 404',async()=>{const r=await request(app).get('/api/does-not-exist');assert.equal(r.status,404);assert.equal(r.body.message,'Route not found')});
test('admin dashboard requires authentication',async()=>{const r=await request(app).get('/api/admin/dashboard');assert.equal(r.status,401)});
test('contact submission clearly reports unavailable database',async()=>{const r=await request(app).post('/api/contact').send({name:'Nova Example',email:'nova@example.com',message:'A website project enquiry'});assert.equal(r.status,503);assert.match(r.body.message,/Database is not connected/)});
