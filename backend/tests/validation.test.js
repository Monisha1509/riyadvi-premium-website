import test from 'node:test';import assert from 'node:assert/strict';import {validateLead,isAllowedResume,calculateHealthScore,isResumeSignature} from '../src/services/validation.js';
test('valid contact lead passes validation',()=>{const r=validateLead({name:'Nova Example',email:'nova@example.com',message:'I need a website redesign'});assert.equal(r.success,true);assert.equal(r.data.email,'nova@example.com')});
test('invalid email is rejected',()=>{const r=validateLead({name:'Nova Example',email:'not-an-email',message:'I need a website redesign'});assert.equal(r.success,false);assert.ok(r.errors.some(e=>e.field==='email'))});
test('short non-empty message is rejected',()=>{const r=validateLead({name:'Nova Example',email:'nova@example.com',message:'hey'});assert.equal(r.success,false)});
test('name must have at least two characters',()=>{const r=validateLead({name:'N',email:'nova@example.com'});assert.equal(r.success,false)});
test('resume mime type and size are checked',()=>{assert.equal(isAllowedResume({originalname:'resume.pdf',mimetype:'application/pdf',size:1024}),true);assert.equal(isAllowedResume({originalname:'resume.png',mimetype:'image/png',size:1024}),false);assert.equal(isAllowedResume({originalname:'resume.docx',mimetype:'application/pdf',size:1024}),false);assert.equal(isAllowedResume({originalname:'resume.pdf',mimetype:'application/pdf',size:6*1024*1024}),false)});

test('health score is transparent and calculated only from scored answers',()=>{assert.equal(calculateHealthScore({website:'Strong',marketing:'Developing',technology:'Needs attention'}),50);assert.equal(calculateHealthScore({priority:'Website & experience'}),0)});

test('resume signature must match the extension',()=>{assert.equal(isResumeSignature(Buffer.from('%PDF-1.7'), 'resume.pdf'),true);assert.equal(isResumeSignature(Buffer.from('not a pdf file'), 'resume.pdf'),false);assert.equal(isResumeSignature(Buffer.from([0x50,0x4B,0x03,0x04,0,0,0,0]), 'resume.docx'),true)});
