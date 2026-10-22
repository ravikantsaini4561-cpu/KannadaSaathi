import mongoose from 'mongoose';
import Phrase from './models/Phrase.js';
import seed, { categories } from './data/phrases.js';

const memory = seed.map((p, i) => ({ ...p, _id: String(i + 1) }));
export { categories };
export const dbReady = () => mongoose.connection.readyState === 1;

export async function getAll() {
  return dbReady() ? Phrase.find().lean() : memory;
}

export async function getOne(id) {
  if (!dbReady()) return memory.find((p) => p._id === id) || null;
  return mongoose.isValidObjectId(id) ? Phrase.findById(id).lean() : null;
}

const STOP = new Set(['the', 'is', 'am', 'are', 'was', 'to', 'in', 'at', 'my', 'me', 'you', 'can', 'do', 'how', 'what', 'where', 'of', 'and', 'for', 'it', 'this', 'that', 'please', 'want', 'need', 'have', 'get', 'an', 'on', 'with']);

const split = (s = '') =>
  s.toLowerCase()
    .split(/[^a-z0-9\u0900-\u097F\u0C80-\u0CFF]+/)
    .filter((w) => w.length > 1);

export const tokenize = (s) => split(s).filter((w) => !STOP.has(w));

// Whole-word or prefix match over English, Hindi, reading, Kannada and tags. Tags weigh more.
export function score(phrase, words) {
  const tags = phrase.tags || [];
  const toks = split([phrase.english, phrase.hindi, phrase.transliteration, phrase.kannada, ...tags].join(' '));
  return words.reduce((n, w) => n + (tags.includes(w) ? 3 : toks.some((t) => t === w || (w.length >= 4 && t.startsWith(w))) ? 1 : 0), 0);
}
