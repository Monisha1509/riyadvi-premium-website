import { Router } from 'express';
import rateLimit from 'express-rate-limit';

const router = Router();
const assistantLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 25, standardHeaders: true, legacyHeaders: false, message: { message: 'Assistant request limit reached. Please try again later.' } });
const SYSTEM_PROMPT = `You are Riyadvi Software Technologies' helpful website assistant. Be clear, concise, warm, and professional. Help visitors understand the company's listed services, plan project requirements, navigate pages, and find the contact form. Never invent pricing, client outcomes, awards, testimonials, live job openings, phone numbers, or guarantees. Portfolio examples and metrics may be sample content and must not be described as verified results. For quotes or specific business commitments, direct the visitor to the contact/consultation form. Do not request passwords, API keys, or unnecessary sensitive personal data.`;

function guidedReply(message) {
  const q = message.toLowerCase();
  if (/\b(hi|hii|hello|hey|vanakkam)\b/.test(q)) return "Hi! 👋 Welcome to Riyadvi Software Technologies. I can help you explore our services, portfolio, website development process, or careers. What are you planning to build?";
  if (q.includes('service') || q.includes('idea')) return "Riyadvi can help with website and web application development, UI/UX design, software solutions, and digital transformation needs. Tell me your idea, target users, and the main problem you want to solve, and I’ll help you narrow down the right approach. For a confirmed scope and quote, use the Contact or consultation form.";
  if (q.includes('portfolio') || q.includes('project') || q.includes('work')) return "You can explore project examples on the Portfolio page. Open Portfolio from the main navigation to review the available case studies and technologies. Please treat any sample projects or metrics as illustrative unless the website explicitly verifies them.";
  if (q.includes('plan a website') || q.includes('website') || q.includes('build')) return "A good website plan starts with: (1) business goal, (2) target audience, (3) pages and features, (4) content and brand assets, (5) integrations, and (6) launch and maintenance needs. Tell me your business type and the features you need, or submit a consultation request so the team can discuss scope and pricing.";
  if (q.includes('job') || q.includes('career') || q.includes('opening') || q.includes('apply')) return "Please open Careers from the main navigation to see currently published openings. Select a job to read its requirements and apply using the form on that page. I can’t confirm a specific vacancy unless it appears in the published Careers listings.";
  if (q.includes('contact') || q.includes('quote') || q.includes('price') || q.includes('cost')) return "For an accurate quote or project commitment, use the Contact or consultation form on this website and share your goals, required features, and expected timeline. The team can review your requirements and respond with the appropriate next steps.";
  if (q.includes('about') || q.includes('company') || q.includes('riyadvi')) return "Riyadvi Software Technologies presents itself as a technology and digital solutions partner. You can learn more through the About page and explore the available services and portfolio from the main navigation. For company-specific commitments, please contact the team directly.";
  return "I can help you explore Riyadvi’s services, portfolio, website planning, careers, and contact options. Could you share a little more about what you’re trying to do? For a tailored project discussion, use the Contact or consultation form.";
}

router.get('/status', (_req, res) => {
  const configured = Boolean(process.env.GEMINI_API_KEY || process.env.AI_API_KEY);
  const model = (process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite').replace(/[^a-zA-Z0-9._-]/g, '');
  res.json({ configured, model, mode: configured ? 'gemini-configured' : 'guided-fallback', message: configured ? 'AI provider key is present; live provider connectivity is checked when a chat message is sent.' : 'No AI provider key found. Guided assistant replies are enabled; configure GEMINI_API_KEY for real AI responses.' });
});

router.post('/chat', assistantLimiter, async (req, res) => {
  const message = typeof req.body?.message === 'string' ? req.body.message.trim().slice(0, 2000) : '';
  if (!message) return res.status(400).json({ message: 'Enter a message to continue' });
  const apiKey = (process.env.GEMINI_API_KEY || process.env.AI_API_KEY || '').trim();
  const model = (process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite').replace(/[^a-zA-Z0-9._-]/g, '');
  const history = Array.isArray(req.body?.history) ? req.body.history.slice(-8).filter(x => ['user', 'model'].includes(x?.role) && typeof x?.text === 'string').map(x => ({ role: x.role, parts: [{ text: x.text.slice(0, 1200) }] })) : [];
  while (history.length && history[0].role !== 'user') history.shift();

  // Keep the assistant useful during local setup. This is explicitly labelled as guided mode,
  // never represented as a real AI-provider response.
  if (!apiKey) return res.json({ reply: guidedReply(message), mode: 'guided_fallback', notice: 'Guided reply — configure GEMINI_API_KEY in backend/.env to enable live AI responses.' });

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] }, contents: [...history, { role: 'user', parts: [{ text: message }] }], generationConfig: { temperature: 0.35, maxOutputTokens: 500 } }),
      signal: AbortSignal.timeout(20000)
    });
    if (!response.ok) {
      const status = response.status;
      const providerError = await response.json().catch(() => ({}));
      const providerMessage = String(providerError?.error?.message || 'No provider error detail').replaceAll(apiKey, '[REDACTED]').slice(0, 300);
      // Log sanitized provider diagnostics only; never log the API key or request URL.
      console.error(`Gemini provider returned HTTP ${status}: ${providerMessage}`);
      if (status === 429) return res.json({ reply: guidedReply(message), mode: 'guided_fallback', notice: 'The AI provider is rate-limited right now. This is a guided reply; please try live AI again shortly.' });
      if (status === 404) return res.json({ reply: guidedReply(message), mode: 'guided_fallback', notice: `Gemini could not find or enable model "${model}" for this key. Set GEMINI_MODEL=gemini-3.5-flash-lite in backend/.env, restart the backend, and retry. This is a guided reply until live AI connects.` });
      if ([400, 401, 403].includes(status)) return res.json({ reply: guidedReply(message), mode: 'guided_fallback', notice: `Gemini rejected the request (HTTP ${status}). Check the API key, Generative Language API access, and model setting in backend/.env. This is a guided reply.` });
      return res.json({ reply: guidedReply(message), mode: 'guided_fallback', notice: `The AI provider returned HTTP ${status}. Check the backend terminal for sanitized provider details, then try again.` });
    }
    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.map(part => part.text || '').join('\n').trim();
    if (!reply) return res.json({ reply: guidedReply(message), mode: 'guided_fallback', notice: 'The AI provider returned no text. This is a guided reply.' });
    return res.json({ reply, mode: 'gemini', model });
  } catch (error) {
    console.error('Gemini assistant error:', error.name || 'ProviderError');
    return res.json({ reply: guidedReply(message), mode: 'guided_fallback', notice: error.name === 'TimeoutError' ? 'Live AI timed out. This is a guided reply; please try again.' : 'Live AI could not be reached. This is a guided reply; check backend connectivity and API configuration.' });
  }
});
export default router;
