# KannadaSaathi

**Kannada for everyday college life.** Pick a real situation, find the right phrase, speak it, show it, scan it, or practise it.

**Live demo:** https://kannadasaathi.onrender.com (no login needed)

**Hackathon:** Kannada Digital Innovation Hackathon 2026 (HackerRank Campus Crew, NIE Mysuru)
**Problem statement chosen:** 3. Kannada in Everyday Life
**Built by:** Ravi (individual participant)

> The free Render server sleeps when idle. If the first load is slow, wait about a minute and refresh.

---

## The problem

Students and visitors who do not speak Kannada struggle with daily tasks in Karnataka: taking an auto, ordering food, visiting a clinic, reading a bus board, or talking to a villager who speaks only Kannada. Translator apps swap words without teaching, courses are generic, and phrasebooks are static.

## The solution

KannadaSaathi is a mobile-first web app (installable as a PWA) that is built around **situations**, not grammar. Every tool answers the question "what do I say or read right now?"

## Features

| Tool | What it does |
|---|---|
| **Phrases** | 128 phrases across 11 situations, each with Kannada script, Roman pronunciation, English and Hindi. Search by English, Hindi or pronunciation. |
| **Show Mode** | Displays a phrase in large full-screen Kannada text so you can show it to the other person. |
| **Interpreter** | Speak or type and translate between Kannada and English, Hindi, Tamil, Telugu, Malayalam or Marathi, then hear the result. Two microphones let a visitor and a villager take turns. |
| **Scan** | Take or upload a photo of a signboard, menu, bus board, bill or medicine strip. It returns the Kannada text, a Roman reading, English and Hindi meaning, and a safety warning when needed. |
| **Ask Saathi** | AI chat assistant. Describe your situation in English or Hindi and get an answer with matching phrases. |
| **Practice** | AI role-play with 6 scenes: auto ride, canteen, vegetable market, clinic, village visit and first day at work. Includes suggested replies and tips. |
| **SOS** | One-tap calls to 112, 100 and 108, emergency phrases in large Kannada, and a personal details card stored only on the device. |
| **Learn and Quiz** | Flashcards for starter words and an 8-round quiz. |
| **Extras** | Saved phrases, adjustable speech speed, English / Kannada app language, light and dark themes, installable app. |

### Situations covered

College, Hostel and Food, Transport, Healthcare, Village, Beach, Hill Station, Mall, Festival, Work and Office, Emergency.

This covers the settings named in the problem statement: travel, shopping, education, healthcare, transportation and workplaces.

## How it is different

- **Curated first, AI second.** The Interpreter checks the phrase library first, then Gemini AI, then a free online translator (MyMemory). Users always get an answer.
- **Graceful fallbacks.** If MongoDB is not configured, the API serves the built-in phrase list. If no AI key is set, Ask Saathi falls back to keyword matching and the phrase features still work.
- **Voice and camera, not just text.** Speak, type or take a photo.
- **Safety built in.** SOS tools and warnings for medicine, dosage and legal text.
- **Private by design.** No login. API keys stay on the server. The server limits each IP to 30 AI calls per minute.

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, service worker and web manifest (PWA), Web Speech API |
| Backend | Node.js, Express |
| Database | MongoDB Atlas with Mongoose (built-in phrase list as backup) |
| AI | Google Gemini (chat, translation, vision, role-play), Groq as backup |
| Speech | Browser speech recognition, Groq Whisper on the server as fallback, device voice or server text-to-speech for audio |
| Hosting | Render |

## Architecture

```mermaid
flowchart LR
  U[Student] --> C[React + Vite PWA<br/>Web Speech API, camera upload]
  C -->|JSON over HTTPS| A[Express API<br/>rate limiting, keys kept private]
  A --> D[(MongoDB Atlas<br/>phrases)]
  A --> G[Gemini AI<br/>chat, translate, vision, role-play]
  G -.backup.-> Q[Groq]
  A --> V[Voice<br/>Whisper speech-to-text, text-to-speech]
  A -.fallback.-> M[MyMemory translator]
```

## Project structure

```
kannadasaathi/
  client/                 React + Vite frontend
    src/components/       Chat, Interpreter, Scan, Practice, Emergency, Learn, Quiz, ShowMode, More
    src/speech.js         Speech recognition and playback helpers
    src/i18n.jsx          English and Kannada app text
    public/               Service worker, manifest, icons
  server/                 Express API
    src/routes/           phrases, chat, translate, voice, Vision, roleplay
    src/data/phrases.js   Built-in phrase library
    src/ai.js             Gemini and Groq helpers, rate limiter
    src/seed.js           Loads phrases into MongoDB
```

## Run locally

**Requirements:** Node.js 18 or newer. A MongoDB Atlas URI and AI keys are optional.

```bash
# 1. API
cd server
npm install
cp .env.example .env      # then fill in your own values
npm run seed              # only if MONGO_URI is set
npm run dev               # http://localhost:5000/api/health

# 2. Frontend (new terminal)
cd client
npm install
npm run dev               # http://localhost:5173
```

In local development Vite proxies `/api` to `http://127.0.0.1:5000`, so `VITE_API_URL` can stay empty.

## Environment variables

Never commit real values. Copy `server/.env.example` to `server/.env`.

| Variable | Purpose |
|---|---|
| `PORT` | API port (default 5000) |
| `MONGO_URI` | MongoDB Atlas connection string. If empty, the built-in phrase list is used. |
| `CLIENT_ORIGIN` | Frontend URL allowed by CORS (`*` while testing) |
| `GEMINI_API_KEY` | Enables the AI interpreter, assistant, scan and practice |
| `GEMINI_MODEL` | Gemini model name |
| `GROQ_API_KEY` | Backup AI and server-side voice transcription |
| `GROQ_MODEL` | Optional. Groq model name |
| `STT_MODEL` | Optional. Speech-to-text model name |
| `OPENAI_API_KEY` | Optional alternative for speech-to-text |

Client: `VITE_API_URL` is the API URL in production (leave empty locally).

## API

| Endpoint | Purpose |
|---|---|
| `GET /api/health` | Server, data source and AI status |
| `GET /api/health/ai` | Tests the AI key and model |
| `GET /api/categories` | List situations |
| `GET /api/phrases?category=transport&search=bus` | List and search phrases |
| `GET /api/phrases/:id` | One phrase |
| `POST /api/chat` | AI assistant. Body: `{ message, history }` |
| `POST /api/translate` | Interpreter. Body: `{ text, from, to }` |
| `POST /api/vision` | Scan a photo |
| `GET /api/scenarios` | Practice scenes |
| `POST /api/roleplay` | Practice conversation turn |
| `GET /api/tts` | Text-to-speech audio |
| `POST /api/stt` | Speech-to-text from recorded audio |

## Deployment

- **API:** Render web service, root directory `server`, build `npm install`, start `npm start`. Set the environment variables above.
- **Frontend:** build with `npm run build` in `client` and host the `dist` folder. Set `VITE_API_URL` to the API URL.
- Set `CLIENT_ORIGIN` on the API to the frontend URL.
- Check `/api/health` after deploying.

## Test access

No account or login is needed. Open the live link and use any tab. For the Interpreter and Scan, allow microphone and camera access when the browser asks. Voice input works best in Chrome or Edge.

## Language accuracy

Every phrase is marked `verified: false` until a Kannada speaker reviews it. Medical and emergency phrases especially should be reviewed before real-world use. To mark a phrase as verified, update `server/src/data/phrases.js` and run `npm run seed`.

## Known limitations

- Spoken Kannada depends on a Kannada voice installed on the device. Otherwise the server uses a text-to-speech endpoint that can be rate limited.
- AI translations can contain mistakes. Prefer the curated phrases for important situations.
- Medicine, dosage and legal text from Scan must be confirmed with a pharmacist, doctor or professional.
- Full offline mode is not available yet.

## Future scope

- Native-speaker review of every phrase and verified audio recordings
- Full offline mode
- Regional Kannada dialects
- More words, lessons and quizzes

## Acknowledgements

Built for the Kannada Digital Innovation Hackathon 2026 by HackerRank Campus Crew, NIE Mysuru.