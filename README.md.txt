# KannadaSaathi 🇮🇳

**AI-Powered Kannada Learning Assistant for Hindi and English Speakers**

## 📌 Problem Statement

**Problem Statement 1: Kannada for Everyone**

Learning Kannada can be challenging for people who primarily speak Hindi or English. KannadaSaathi aims to make everyday Kannada learning more accessible through AI-assisted conversations, pronunciation support, and simple explanations.

## 💡 Our Solution

KannadaSaathi is a web-based language-learning assistant designed to help users understand and practice Kannada using familiar languages such as Hindi and English.

## ✨ Key Features

- **AI-powered conversations:** Practice Kannada through interactive responses.
- **Multilingual input:** Designed for Hindi and English speakers.
- **Kannada script:** View Kannada text alongside its Roman reading.
- **Meaning and vocabulary:** Understand English meanings and word breakdowns.
- **Voice interaction:** Microphone-based input where supported.
- **Kannada audio playback:** Listen to spoken Kannada where supported.

## 🛠️ Tech Stack

- **Frontend:** React, Vite, JavaScript
- **Backend:** Node.js, Express.js
- **Database:** MongoDB
- **AI integrations:** GROQ API and/or Google Gemini, depending on the configured backend
- **Voice features:** Browser speech capabilities and the project's configured voice services

## 📁 Project Structure

```text
KannadaSaathi/
├── client/       # Frontend application
├── server/       # Backend application
├── .gitignore
└── README.md
```

## ⚙️ Setup and Installation

### Prerequisites

- Node.js and npm
- MongoDB connection
- API credentials for the AI services enabled in the backend

### 1. Clone the repository

```bash
git clone YOUR_PUBLIC_GITHUB_REPOSITORY_URL
cd KannadaSaathi
```

Replace `YOUR_PUBLIC_GITHUB_REPOSITORY_URL` with the actual repository URL.

### 2. Configure the backend

Navigate to the server directory:

```bash
cd server
npm install
```

Create a `.env` file using the variable names expected by your backend code. For example:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
```

**Important:** These are example variable names. Check your backend code and existing environment configuration to confirm the exact names and which variables are required. Never commit your real `.env` file.

### 3. Start the backend

Use the start command defined in `server/package.json`. For example, if the project has a `dev` script:

```bash
npm run dev
```

### 4. Configure and start the frontend

Open a separate terminal:

```bash
cd client
npm install
npm run dev
```

Open the local URL displayed by Vite in your terminal.

## 🔐 Security

- API keys and database credentials must remain in environment variables.
- Never commit `.env` files or `node_modules`.
- Use `.env.example` with placeholder values to document required configuration.
- Configure environment variables securely on the deployment platform.

## 🚀 Deployment

Deployment instructions and the live application URL will be added after deployment is completed.

## 🎯 Hackathon Goal

KannadaSaathi aims to reduce language barriers and make learning everyday Kannada easier for Hindi and English speakers through accessible AI-assisted learning.

## 👥 Project Status

Hackathon project — development and deployment in progress.
