import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import phrases from './routes/phrases.js';
import chat from './routes/chat.js';
import translate from './routes/translate.js';
import voice, { sttConfig } from './routes/voice.js';
import vision from './routes/Vision.js';
import roleplay from './routes/roleplay.js';

import Phrase from './models/Phrase.js';
import seed from './data/phrases.js';

import {
  aiEnabled,
  aiState,
  aiPing,
  limited
} from './ai.js';

import { dbReady } from './store.js';

const app = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*'
}));

app.use(express.json({ limit: '8mb' }));

// API health check
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    database: dbReady() ? 'mongodb' : 'built-in list',
    ai: aiEnabled(),
    aiOk: aiState.ok,
    aiError: aiState.error,
    stt: Boolean(sttConfig())
  });
});

// Test Gemini API and model
app.get('/api/health/ai', async (req, res) => {
  if (!aiEnabled()) {
    return res.json({
      ok: false,
      error: 'GEMINI_API_KEY is not set in server/.env'
    });
  }

  if (limited(req.ip, 'ping', 10)) {
    return res.status(429).json({
      ok: false,
      error: 'Too many tests. Wait a minute.'
    });
  }

  res.json(await aiPing());
});

// API routes
app.use('/api', phrases);
app.use('/api', chat);
app.use('/api', translate);
app.use('/api', voice);
app.use('/api',vision);
app.use('/api',roleplay);

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found'
  });
});

// Handle server errors
app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    error: 'Something went wrong on the server'
  });
});

// Log unexpected errors
process.on('unhandledRejection', (e) => {
  console.error('Unhandled rejection:', e);
});

process.on('uncaughtException', (e) => {
  console.error('Uncaught exception:', e);
});

// Server port
const port = process.env.PORT || 5000;

// Connect to MongoDB and add only missing phrases
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 8000
  })
    .then(async () => {
      console.log('MongoDB connected');

      let addedCount = 0;

      for (const phrase of seed) {
        const existing = await Phrase.findOne({
          category: phrase.category,
          english: phrase.english
        })
          .select('_id')
          .lean();

        if (!existing) {
          await Phrase.create(phrase);
          addedCount++;
        }
      }

      if (addedCount > 0) {
        console.log(
          `Added ${addedCount} new phrases; existing records preserved.`
        );
      } else {
        console.log('Phrase database is already up to date.');
      }
    })
    .catch((e) => {
      console.error(
        'MongoDB connection failed, using the built-in phrase list:',
        e.message
      );
    });
} else {
  console.log(
    'MONGO_URI is empty: using the built-in phrase list (fine for demos). To use MongoDB, see "MongoDB Atlas setup" in README.md.'
  );
}

// Start server
app.listen(port, () => {
  console.log(`KannadaSaathi API on port ${port}`);
});