import { Router } from 'express';
import { aiEnabled, gemini, limited } from '../ai.js';
import { getAll } from '../store.js';

const router = Router();
const names = { en: 'English', hi: 'Hindi', kn: 'Kannada', ta: 'Tamil', te: 'Telugu', ml: 'Malayalam', mr: 'Marathi' };
const norm = (s) => s.toLowerCase().replace(/[^\p{L}\p{M}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim();
const decode = (s) => s.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');

// 1) Exact match with the curated phrase library (instant, free, best quality).
async function fromLibrary(text, from, to) {
  if (!((from === 'en' && to === 'kn') || (from === 'kn' && to === 'en'))) return null;
  const key = norm(text);
  const hit = (await getAll()).find((p) => norm(from === 'en' ? p.english : p.kannada) === key);
  if (!hit) return null;
  return from === 'en' ? { translation: hit.kannada, reading: hit.transliteration } : { translation: hit.english, reading: '' };
}

// 2) Claude (needs ANTHROPIC_API_KEY).
async function fromGemini(text, from, to) {
  const system = `You are a precise interpreter. Translate the user's text from ${names[from]} to ${names[to]} in natural, polite, everyday speech that a villager or shopkeeper would understand. Reply with JSON only: {"translation":"...","reading":"..."}. "reading" is the translation in Roman letters so a non-speaker can read it aloud; use an empty string if the target is English. No explanations.`;
  const raw = await gemini(system, [{ role: 'user', content: text }], 300);
  const json = JSON.parse(raw.match(/\{[\s\S]*\}/)[0]);
  if (!json.translation) throw new Error('empty translation');
  return { translation: String(json.translation), reading: String(json.reading || '') };
}

// 3) Free online translator, used when there is no API key.
async function fromOnline(text, from, to) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  const data = await res.json();
  const t = data?.responseData?.translatedText;
  if (!res.ok || !t || /MYMEMORY WARNING|INVALID|QUERY LENGTH/i.test(t)) throw new Error('online translator unavailable');
  return { translation: decode(t), reading: '' };
}

router.post('/translate', async (req, res) => {
  try {
    const { from, to } = req.body || {};
    const text = String(req.body?.text || '').trim().slice(0, 300);
    if (!names[from] || !names[to] || from === to) return res.status(400).json({ error: 'Choose two different languages.' });
    if (!text) return res.status(400).json({ error: 'Nothing to translate.' });

    const lib = await fromLibrary(text, from, to);
    if (lib) return res.json({ ...lib, source: 'phrase library' });
    if (limited(req.ip)) return res.status(429).json({ error: 'Too many requests. Wait a minute and try again.' });

    if (aiEnabled()) {
      try { return res.json({ ...(await fromGemini(text, from, to)), source: 'AI' }); } catch (e) { console.error('Gemini translate failed:', e.message); }
    }
    try { return res.json({ ...(await fromOnline(text, from, to)), source: 'online translator' }); } catch (e) { console.error('Online translate failed:', e.message); }
    res.status(502).json({ error: 'Translation is not available right now. Check your internet connection, or use the Phrases tab.' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Something went wrong on the server' });
  }
});

export default router;
