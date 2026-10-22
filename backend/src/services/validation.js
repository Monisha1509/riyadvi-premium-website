import { z } from 'zod';
const optionalText = (max=500) => z.string().trim().max(max).optional().or(z.literal(''));
export const leadSchema = z.object({
  name:z.string().trim().min(2,'Name must contain at least 2 characters').max(120),
  email:z.string().trim().email('Enter a valid email address').max(254),
  phone:optionalText(40), company:optionalText(160), requirement:optionalText(120), message:optionalText(5000),
  website:optionalText(500), challenge:optionalText(2000), marketing:optionalText(100), technology:optionalText(200), position:optionalText(160),
  healthAnswers:z.record(z.string().trim().max(80)).optional(), healthScore:z.number().min(0).max(100).optional(),
});
export function validateLead(body) {
  const parsed=leadSchema.safeParse(body);
  if(!parsed.success)return {success:false,errors:parsed.error.issues.map(i=>({field:i.path.join('.'),message:i.message}))};
  if(parsed.data.message&&parsed.data.message.length<8)return {success:false,errors:[{field:'message',message:'Message must contain at least 8 characters'}]};
  if(parsed.data.healthAnswers && Object.keys(parsed.data.healthAnswers).length>30)return {success:false,errors:[{field:'healthAnswers',message:'Too many assessment answers'}]};
  return {success:true,data:parsed.data};
}
export function calculateHealthScore(answers={}) {
  const values=Object.values(answers).filter(v=>['Strong','Developing','Needs attention'].includes(v));
  if(!values.length)return 0;
  const total=values.reduce((sum,value)=>sum+({Strong:2,Developing:1,'Needs attention':0}[value]),0);
  return Math.round((total/(values.length*2))*100);
}
export function isAllowedResume(file) {
  if(!file||file.size>5*1024*1024)return false;
  const ext=(file.originalname||'').toLowerCase().split('.').pop();
  
const byMime = {
  'application/pdf': ['pdf'],
  'application/msword': ['doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['docx']
};

  return !!byMime[file.mimetype]?.includes(ext);
}

export function isResumeSignature(buffer, filename) {
  if (!Buffer.isBuffer(buffer)) return false;
  const ext = (filename || '').toLowerCase().split('.').pop();
  if (ext === 'pdf') return buffer.subarray(0, 5).toString('ascii') === '%PDF-';
  if (ext === 'doc') return buffer.subarray(0, 8).equals(Buffer.from([0xD0,0xCF,0x11,0xE0,0xA1,0xB1,0x1A,0xE1]));
  if (ext === 'docx') return buffer.subarray(0, 4).equals(Buffer.from([0x50,0x4B,0x03,0x04]));
  return false;
}
