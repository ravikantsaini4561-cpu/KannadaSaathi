import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import phrases from './routes/phrases.js';
import chat from './routes/chat.js';
import translate from './routes/translate.js';
import voice, { sttConfig } from './routes/voice.js';
import Phrase from './models/Phrase.js';
import seed from './data/phrases.js';
import { aiEnabled, aiState, aiPing, limited } from './ai.js';
import { dbReady } from './store.js';

const app = express();
app.use(cors({ origin: process.env.CLIENT_ORIGIN || '*' }));
app.use(express.json());

app.get('/api/health', (req, res) => res.json({
  ok: true, database: dbReady() ? 'mongodb' : 'built-in list',
  ai: aiEnabled(), aiOk: aiState.ok, aiError: aiState.error, stt: Boolean(sttConfig())
}));
// Open http://localhost:5000/api/health/ai to test your Gemini key and model.
app.get('/api/health/ai', async (req, res) => {
  if (!aiEnabled()) return res.json({ ok: false, error: 'GEMINI_API_KEY is not set in server/.env' });
  if (limited(req.ip, 'ping', 10)) return res.status(429).json({ ok: false, error: 'Too many tests. Wait a minute.' });
  res.json(await aiPing());
});
app.use('/api', phrases);
app.use('/api', chat);
app.use('/api', translate);
app.use('/api', voice);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));
app.use((err, req, res, next) => { console.error(err); res.status(500).json({ error: 'Something went wrong on the server' }); });

process.on('unhandledRejection', (e) => console.error('Unhandled rejection:', e));
process.on('uncaughtException', (e) => console.error('Uncaught exception:', e));

const port = process.env.PORT || 5000;
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 8000 })
    .then(async () => {
      console.log('MongoDB connected');
      // Keep the database in sync with server/src/data/phrases.js (it is the source of truth).
      if ((await Phrase.countDocuments()) !== seed.length) { await Phrase.deleteMany({}); await Phrase.insertMany(seed); console.log(`Seeded ${seed.length} phrases`); }
    })
    .catch((e) => console.error('MongoDB connection failed, using the built-in phrase list:', e.message));
} else {
  console.log('MONGO_URI is empty: using the built-in phrase list (fine for demos). To use MongoDB, see "MongoDB Atlas setup" in README.md.');
}
app.listen(port, () => console.log(`KannadaSaathi API on port ${port}`));
