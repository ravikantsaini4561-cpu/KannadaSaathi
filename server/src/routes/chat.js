import { Router } from 'express';
import { getAll, categories, tokenize, score } from '../store.js';
import { aiEnabled, gemini, limited } from '../ai.js';

const router = Router();

// Words that point to a situation, so "I missed my bus" still finds transport phrases.
const topics = {
  college: ['library', 'class', 'classroom', 'exam', 'professor', 'teacher', 'lecture', 'office', 'fees', 'timetable', 'college', 'study'],
  food: ['food', 'canteen', 'mess', 'hostel', 'coffee', 'tea', 'hungry', 'water', 'spicy', 'eat', 'lunch', 'dinner'],
  transport: ['bus', 'auto', 'rickshaw', 'metro', 'train', 'station', 'fare', 'ticket', 'route', 'ride', 'drop', 'bargain'],
  healthcare: ['sick', 'fever', 'doctor', 'hospital', 'medicine', 'pharmacy', 'pain', 'headache', 'ambulance', 'clinic'],
  village: ['village', 'villager', 'farm', 'farmer', 'rural', 'homestay', 'photo'],
  beach: ['beach', 'sea', 'swim', 'boat', 'sand', 'sunset'],
  hills: ['hill', 'hills', 'trek', 'trekking', 'viewpoint', 'cold', 'ghat', 'coorg', 'chikmagalur'],
  mall: ['mall', 'shop', 'shopping', 'size', 'discount', 'upi', 'trial', 'clothes'],
  festival: ['festival', 'temple', 'procession', 'dasara', 'ugadi', 'habba', 'celebrate', 'greetings']
};

const system = `You are Saathi, a friendly assistant for people who do not speak Kannada and are in Karnataka: students, travellers, village, beach, hill station, mall and festival visitors. Reply with JSON only, no markdown: {"message":"1-2 friendly sentences","kannada":"the best Kannada sentence to say, or empty string","reading":"Roman reading of that sentence","meaning":"English meaning","words":[{"kn":"","roman":"","en":""}],"tip":"one short etiquette tip or empty string"}. At most 4 words in "words". Do not invent prices, timings or facts. You are not a doctor: for a medical emergency, put "Call 112 or 108 now" in "message".`;

function parse(raw) {
  try {
    const j = JSON.parse(raw.match(/\{[\s\S]*\}/)[0]);
    const str = (v) => String(v || '');
    const card = j.kannada ? {
      kannada: str(j.kannada), reading: str(j.reading), meaning: str(j.meaning), tip: str(j.tip),
      words: (Array.isArray(j.words) ? j.words : []).slice(0, 4).map((w) => ({ kn: str(w.kn), roman: str(w.roman), en: str(w.en) }))
    } : null;
    return { message: str(j.message) || 'Here you go.', card };
  } catch { return { message: raw, card: null }; }
}

router.post('/chat', async (req, res) => {
  try {
    const message = String(req.body?.message || '').slice(0, 200);
    const words = tokenize(message);
    if (!words.length) return res.json({ reply: 'Tell me where you are or what you need, and I will find the Kannada for it.', phrases: [], card: null });
   if (/^(hi|hello|hey|namaste|namaskara)\b/i.test(message.trim())) {
  return res.json({
    reply: 'Here is a friendly Kannada introduction you can say:',
    card: {
      kannada: 'ನಮಸ್ಕಾರ! ನನ್ನ ಹೆಸರು ಸಾಥಿ.',
      reading: 'Namaskāra! Nanna hesaru Saathi.',
      meaning: 'Hello! My name is Saathi.',
      words: [
        { kn: 'ನಮಸ್ಕಾರ', roman: 'Namaskāra', en: 'Hello' },
        { kn: 'ನನ್ನ', roman: 'Nanna', en: 'My' },
        { kn: 'ಹೆಸರು', roman: 'hesaru', en: 'name' }
      ],
      tip: 'Use Namaskara as a polite greeting.'
    },
    phrases: [],
    ai: false
  });
}
    const all = await getAll();
    // Pick the situation with the most matching words ("auto fare to college" is transport, not college).
    const hits = Object.entries(topics).map(([t, ks]) => [t, words.filter((w) => ks.includes(w)).length]).sort((a, b) => b[1] - a[1]);
    const topic = hits[0][1] > 0 ? hits[0][0] : undefined;
    const pool = topic ? all.filter((p) => p.category === topic) : all;
    let ranked = pool.map((p) => ({ p, s: score(p, words) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, 3).map((x) => x.p);
    if (!ranked.length && topic) ranked = pool.slice(0, 3);
    const label = topic ? categories.find((c) => c.id === topic).name : 'your message';

    if (aiEnabled() && !limited(req.ip)) {
      try {
        const history = (Array.isArray(req.body?.history) ? req.body.history : [])
          .filter((h) => ['user', 'assistant'].includes(h.role) && typeof h.content === 'string' && h.content.trim())
          .slice(-6).map((h) => ({ role: h.role, content: h.content.slice(0, 500) }));
        while (history.length && history[0].role !== 'user') history.shift();
        const known = ranked.map((p) => `${p.english} = ${p.kannada} (${p.transliteration})`).join('; ');
        const raw = await gemini(`${system}\nPhrases from our library that may fit: ${known || 'none'}`, [...history, { role: 'user', content: message }], 700);
        const { message: reply, card } = parse(raw);
        return res.json({ reply, card, phrases: [], ai: true });
      } catch (e) { console.error('Gemini chat failed:', e.message); }
    }
    const reply = ranked.length
      ? `Here are phrases for ${label}. Tap Show to display one to the other person.`
      : 'I could not find a phrase for that yet. Try a place or a need: bus, village, beach, canteen, doctor.';
    res.json({ reply, card: null, phrases: ranked, ai: false });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Something went wrong on the server' });
  }
});

export default router;
