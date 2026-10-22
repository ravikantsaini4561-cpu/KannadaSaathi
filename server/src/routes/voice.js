import express, { Router } from 'express';
import { limited } from '../ai.js';

const router = Router();
const codes = ['en', 'hi', 'kn', 'ta', 'te', 'ml', 'mr'];

// Speech-to-text provider for browsers whose built-in recognition fails. Groq (free tier) or OpenAI Whisper.
export function sttConfig() {
  if (process.env.GROQ_API_KEY) return { url: 'https://api.groq.com/openai/v1/audio/transcriptions', key: process.env.GROQ_API_KEY, model: process.env.STT_MODEL || 'whisper-large-v3' };
  if (process.env.OPENAI_API_KEY) return { url: 'https://api.openai.com/v1/audio/transcriptions', key: process.env.OPENAI_API_KEY, model: process.env.STT_MODEL || 'whisper-1' };
  return null;
}

// Audio fallback for devices with no Kannada voice (unofficial Google Translate audio; may be rate limited).
router.get('/tts', async (req, res) => {
  const lang = String(req.query.lang || '');
  const text = String(req.query.text || '').trim().slice(0, 200);
  if (!codes.includes(lang) || !text) return res.status(400).json({ error: 'Bad request' });
  if (limited(req.ip, 'tts', 60)) return res.status(429).json({ error: 'Too many audio requests. Wait a minute.' });
  try {
    const r = await fetch(`https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&tl=${lang}&q=${encodeURIComponent(text)}`, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(10000) });
    if (!r.ok) throw new Error(`audio source returned ${r.status}`);
    res.set({ 'Content-Type': 'audio/mpeg', 'Cache-Control': 'public, max-age=86400' });
    res.send(Buffer.from(await r.arrayBuffer()));
  } catch (e) {
    console.error('TTS failed:', e.message);
    res.status(502).json({ error: 'Audio service unavailable' });
  }
});

router.post('/stt', express.raw({ type: () => true, limit: '5mb' }), async (req, res) => {
  const cfg = sttConfig();
  const lang = String(req.query.lang || '');
  if (!cfg) return res.status(503).json({ error: 'Server speech recognition is not set up. Add GROQ_API_KEY to server/.env.' });
  if ((!codes.includes(lang) && lang !== 'auto') || !Buffer.isBuffer(req.body) || !req.body.length) return res.status(400).json({ error: 'Bad request' });
  if (limited(req.ip, 'stt', 20)) return res.status(429).json({ error: 'Too many voice requests. Wait a minute.' });
  try {
    const form = new FormData();
    form.append('file', new Blob([req.body], { type: req.headers['content-type'] || 'audio/webm' }), 'speech.webm');
    form.append('model', cfg.model);
    if (lang !== 'auto') form.append('language', lang);
    form.append('temperature', '0');
    const r = await fetch(cfg.url, { method: 'POST', headers: { Authorization: `Bearer ${cfg.key}` }, body: form, signal: AbortSignal.timeout(30000) });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data?.error?.message || `speech service returned ${r.status}`);
    res.json({ text: String(data.text || '').trim() });
  } catch (e) {
    console.error('STT failed:', e.message);
    res.status(502).json({ error: 'Could not turn your voice into text. Try again or type.' });
  }
});

export default router;
