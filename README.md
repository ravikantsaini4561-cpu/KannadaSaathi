
KannadaSaathi
Kannada for everyday life in Karnataka. Pick a real situation, find the right phrase, speak it, show it, scan it, or practise it.

Live application: https://kannadasaathi.onrender.com
Hackathon: Kannada Digital Innovation Hackathon 2026 — HackerRank Campus Crew, The National Institute of Engineering (NIE), Mysuru
Selected problem statement: Problem Statement 3 — Kannada in Everyday Life
Built by: Ravi Kant (individual participant)
The free Render service may sleep after a period of inactivity. The first request after inactivity can take longer; wait briefly and refresh if needed.

1. The problem

Students, travellers, and other visitors who do not speak Kannada can find everyday tasks difficult in Karnataka. They may need to take an auto, order food, ask for directions, visit a clinic, read a bus board, shop, or communicate with someone who speaks mainly Kannada.

Translation tools can help with individual sentences, courses can teach vocabulary and grammar, and phrasebooks can provide expressions. However, people also need practical language support that is relevant to the situation they are facing at that moment.

2. The solution

KannadaSaathi is a mobile-first web application with installable Progressive Web App (PWA) support. It is organised around real-life situations rather than long, general lessons. Its goal is to help non-Kannada speakers find, understand, and practise useful Kannada for everyday interactions.

The application combines a situation-based phrase library with interpretation, image-based text assistance, conversational help, role-play practice, and emergency information.

3. Features

Feature	Description
Phrases	A library of 128 situation-based phrases across 11 situations, with Kannada script, Roman pronunciation, and English and Hindi meanings. Search by English, Hindi, or pronunciation.
Show Mode	Displays a selected phrase in large, full-screen Kannada text so the user can show it to another person.
Interpreter	Supports speaking or typing for translation between Kannada and English, Hindi, Tamil, Telugu, Malayalam, and Marathi. Voice input and spoken output depend on browser and device support.
Scan	Accepts a photo or uploaded image of Kannada text, such as a sign, menu, bus board, bill, or medicine strip, and helps present the text and its meaning.
Ask Saathi	A conversational assistant for everyday situations. Users can describe what they need in English or Hindi and receive assistance with relevant phrases.
Practice	AI-assisted role-play for six scenes: auto ride, canteen, vegetable market, clinic, village visit, and first day at work. Includes suggested replies and tips.
SOS	Provides emergency contact options (112, 100, and 108), emergency phrases in large Kannada text, and a personal-details card stored on the device.
Learn and Quiz	Includes starter-word flashcards and an eight-round quiz.
Extras	Saved phrases, adjustable speech speed, English/Kannada app language, light and dark themes, and installable-app support.
Situations covered
The phrase library covers these 11 situations:

College
Hostel and Food
Transport
Healthcare
Village
Beach
Hill Station
Mall
Festival
Work and Office
Emergency
These situations map to the everyday settings described in Problem Statement 3, including travel, shopping, education, healthcare, transportation, and workplaces.

4. How KannadaSaathi addresses Problem Statement 3

The selected problem statement asks for a technology solution that helps people learn and use Kannada in real-world situations such as travelling, shopping, education, healthcare, transportation, and workplaces.

Setting in the problem statement	KannadaSaathi support
Travel	Village, beach, and hill-station situations
Shopping	Mall, food, and market-related phrases
Education	College and hostel situations
Healthcare	Clinic-related phrases, image-based text assistance, and emergency information
Transportation	Bus and auto-related phrases
Workplaces	Work and office phrases, including a first-day-at-work practice scene

5. What makes it different

Situation-first experience: Users start with a real-life need and find phrases relevant to that situation.
Phrase library with AI assistance: The application can use its built-in phrase collection before relying on AI-assisted features.
Multiple ways to communicate: Users can type, use supported voice input, show a phrase in large text, or submit an image for text assistance.
Practice before a real interaction: Role-play scenes let users rehearse common conversations.
Emergency information in one place: SOS provides quick access to the emergency contact options and phrases included in the application.
No account required: The live application can be used without creating a login. API credentials are configured on the server, not placed in the public frontend source.
Fallback behaviour: The built-in phrase data can be used when the database is not configured. AI and translation fallback behaviour depends on the provider configuration and availability.

6. Technology stack

Layer	Technology	Role
Frontend	React 18, Vite	User interface and frontend build
PWA and browser features	Service worker, web manifest, Web Speech API	Installable app support and browser speech features
Backend	Node.js, Express	API and server-side application logic
Database	MongoDB Atlas, Mongoose	Phrase data storage
Built-in data	JavaScript phrase library	Phrase-data fallback when MongoDB is not configured
AI	Google Gemini; Groq as a configured backup	Supported chat, translation, vision, and role-play functionality
Speech	Browser speech recognition, Groq Whisper fallback, device voice or server text-to-speech	Speech input and audio output, depending on configuration and device support
Hosting	Render	Deployment of the live application and backend service(s)

7. Architecture
The following diagram shows the main application components and the integrations described by the project.

8. Project structure

kannadasaathi/
├── client/                       # React + Vite frontend
│   ├── src/
│   │   ├── components/            # Chat, Interpreter, Scan, Practice,
│   │   │                          # Emergency, Learn, Quiz, ShowMode, etc.
│   │   ├── speech.js              # Speech recognition and playback helpers
│   │   └── i18n.jsx               # English and Kannada app text
│   └── public/                    # Service worker, manifest, icons
│
└── server/                       # Express backend
    └── src/
        ├── routes/                # Phrases, chat, translate, voice,
        │                          # vision and role-play routes
        ├── data/phrases.js        # Built-in phrase library
        ├── ai.js                  # AI provider helpers and rate limiting
        └── seed.js                # Loads phrases into MongoDB

9. Run locally

Requirements
Node.js 18 or newer
npm
MongoDB Atlas connection string (optional when using the built-in phrase library)
AI provider keys (optional; AI-assisted features depend on provider configuration)

1. Start the backend
Open a terminal:

cd server
npm install
Copy server/.env.example to server/.env and add your own configuration values. Do not commit the .env file.

For macOS/Linux:

cp .env.example .env
For Windows PowerShell:

Copy-Item .env.example .env
If MONGO_URI is configured, seed the database when required:

npm run seed
Start the API:

npm run dev
The API is configured to run locally at http://localhost:5000 by default.

2. Start the frontend

Open a second terminal:

cd client
npm install
npm run dev
Vite runs the frontend at http://localhost:5173 by default. In local development, Vite proxies /api requests to http://127.0.0.1:5000, so VITE_API_URL can remain empty for the local setup described above.

10. Environment variables

Never commit real API keys, database credentials, or passwords. Use server/.env.example as the template and keep actual values in server/.env or the hosting provider's environment settings.

Variable	Purpose
PORT	API port; defaults to 5000 in the local setup.
MONGO_URI	MongoDB Atlas connection string. If not configured, the built-in phrase library can be used.
CLIENT_ORIGIN	Frontend origin allowed by the API's CORS configuration.
GEMINI_API_KEY	Enables configured Gemini-powered features.
GEMINI_MODEL	Gemini model name.
GROQ_API_KEY	Enables configured Groq backup and server-side speech transcription features.
GROQ_MODEL	Optional Groq model name.
STT_MODEL	Optional speech-to-text model name.
OPENAI_API_KEY	Optional alternative speech-to-text provider key, if supported by the current server configuration.
VITE_API_URL	Frontend API base URL in production; leave empty for the local Vite proxy setup.
Only set variables that are supported by the version of the application you are running. Provider availability, model names, quotas, and rate limits can change.

11. API overview

The backend exposes the following endpoints in the documented application:

Endpoint	Purpose
GET /api/health	Server, data-source, and AI status
GET /api/health/ai	Checks configured AI provider status
GET /api/categories	Lists phrase situations/categories
GET /api/phrases?category=transport&search=bus	Lists and searches phrases
GET /api/phrases/:id	Retrieves one phrase
POST /api/chat	Conversational assistant; body includes message and optional history
POST /api/translate	Translation; body includes text, from, and to
POST /api/vision	Image-based text assistance
GET /api/scenarios	Lists role-play scenes
POST /api/roleplay	Processes a role-play conversation turn
GET /api/tts	Text-to-speech audio
POST /api/stt	Speech-to-text from recorded audio
12. Deployment
Live application: https://kannadasaathi.onrender.com

The application is deployed on Render. The frontend communicates with the Express API using the configured API base URL and server routes.

For a deployment based on separate frontend and backend services:

Backend: Create a Render web service using server as the root directory. Install dependencies with npm install and use the project's production start command (for example, npm start). Configure the required environment variables in Render.
Frontend: Build the Vite application from client using npm run build, then deploy the generated dist directory using a static-site host. Set VITE_API_URL to the deployed API URL.
Configure CLIENT_ORIGIN on the backend to allow the deployed frontend origin.
After deployment, check the API health endpoint at /api/health on the backend service.
The live URL above is the project link for judges. The exact Render service layout and environment-variable values should match the current deployment configuration.

13. Test access

No account or login is required for the live application.
Allow microphone or camera access when the browser requests it for features that use them.
Voice input is best tested in a supported browser such as Chrome or Edge.
Test the live application before a presentation or evaluation, especially after the Render service has been idle.
14. Language accuracy and safety
The phrase data includes a verified field. Phrases remain marked verified: false until reviewed by a Kannada speaker. The phrase collection should therefore be treated as a practical learning aid, not as a fully native-speaker-certified reference.

AI-generated translations and image interpretations can contain mistakes. For important medical, dosage, emergency, or legal information, confirm the result with a qualified professional or a reliable official source. Do not rely solely on an automated translation for a critical decision.

Emergency contact options are provided as quick-access information. Users should confirm the appropriate emergency service for their location and circumstances.

15. Known limitations

Full offline functionality is not available yet. The cached application shell may load offline, but dynamic phrase and emergency data require a server connection.
Spoken Kannada depends on the availability of a suitable Kannada voice on the user's device. Otherwise, configured server-side text-to-speech may be used and can be subject to service limits.
Browser speech recognition and microphone support vary by browser, device, and permissions.
AI translations and image interpretations may be inaccurate. Important information should be independently verified.
Phrase entries have not all been reviewed by native Kannada speakers; the verified field indicates review status.
Free hosting and external AI or speech providers may have cold starts, rate limits, quotas, or temporary outages.

16. Future scope

Native-speaker review of the phrase library and verified audio recordings
Full offline access to phrases and essential information
Support for regional Kannada dialects and expressions
More words, lessons, situations, and quizzes

17. Acknowledgements

Built by Ravi Kant as an individual project for the Kannada Digital Innovation Hackathon 2026, organised by HackerRank Campus Crew and The National Institute of Engineering (NIE), Mysuru.

⋮⋮⋮⋮
