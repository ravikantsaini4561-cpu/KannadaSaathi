import 'dotenv/config';
import mongoose from 'mongoose';
import Phrase from './models/Phrase.js';
import seed from './data/phrases.js';

if (!process.env.MONGO_URI) { console.error('Set MONGO_URI in server/.env first'); process.exit(1); }
await mongoose.connect(process.env.MONGO_URI);
await Phrase.deleteMany({});
await Phrase.insertMany(seed);
console.log(`Seeded ${seed.length} phrases`);
await mongoose.disconnect();
