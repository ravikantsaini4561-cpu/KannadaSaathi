import { Router } from 'express';

import {
  aiEnabled,
  gemini,
  parseJson,
  str,
  limited
} from '../ai.js';

const router = Router();

// Practice scenes and their opening lines.
const scenes = {
  auto: {
    title: 'Auto ride',
    icon: '🛺',
    goal: 'Tell the driver where to go, ask the fare, and ask him to stop.',
    role: 'an auto-rickshaw driver in Bengaluru',
    opener: {
      kannada: 'ಎಲ್ಲಿಗೆ ಹೋಗಬೇಕು?',
      reading: 'Ellige hogabeku?',
      english: 'Where do you want to go?'
    },
    suggestions: [
      {
        kannada: 'ಕಾಲೇಜಿಗೆ ಹೋಗಬೇಕು.',
        reading: 'Collegige hogabeku.',
        english: 'I need to go to the college.'
      },
      {
        kannada: 'ದಯವಿಟ್ಟು ಮೀಟರ್ ಹಾಕಿ.',
        reading: 'Dayavittu meter haaki.',
        english: 'Please turn on the meter.'
      }
    ]
  },

  canteen: {
    title: 'Canteen',
    icon: '🍛',
    goal: 'Order a coffee and a snack, and ask the price.',
    role: 'a friendly canteen server in a college',
    opener: {
      kannada: 'ಏನು ಬೇಕು?',
      reading: 'Enu beku?',
      english: 'What would you like?'
    },
    suggestions: [
      {
        kannada: 'ಒಂದು ಕಾಫಿ ಕೊಡಿ.',
        reading: 'Ondu coffee kodi.',
        english: 'One coffee, please.'
      },
      {
        kannada: 'ಇದು ಎಷ್ಟು?',
        reading: 'Idu eshtu?',
        english: 'How much is this?'
      }
    ]
  },

  market: {
    title: 'Vegetable market',
    icon: '🥬',
    goal: 'Ask the price, bargain politely and pay.',
    role: 'a vegetable seller in a local market',
    opener: {
      kannada: 'ಬನ್ನಿ, ಏನು ಬೇಕು?',
      reading: 'Banni, enu beku?',
      english: 'Come, what do you need?'
    },
    suggestions: [
      {
        kannada: 'ಒಂದು ಕೇಜಿ ಎಷ್ಟು?',
        reading: 'Ondu kg eshtu?',
        english: 'How much is one kilo?'
      },
      {
        kannada: 'ಸ್ವಲ್ಪ ಕಡಿಮೆ ಮಾಡಿ.',
        reading: 'Swalpa kadime maadi.',
        english: 'Please reduce the price a little.'
      }
    ]
  },

  clinic: {
    title: 'Clinic',
    icon: '🏥',
    goal: 'Explain what is wrong and ask for a doctor.',
    role: 'a receptionist at a small clinic',
    opener: {
      kannada: 'ನಿಮಗೆ ಏನು ತೊಂದರೆ?',
      reading: 'Nimage enu tondare?',
      english: 'What is your problem?'
    },
    suggestions: [
      {
        kannada: 'ನನಗೆ ಜ್ವರ ಇದೆ.',
        reading: 'Nanage jwara ide.',
        english: 'I have a fever.'
      },
      {
        kannada: 'ನನಗೆ ವೈದ್ಯರು ಬೇಕು.',
        reading: 'Nanage vaidyaru beku.',
        english: 'I need a doctor.'
      }
    ]
  },

  village: {
    title: 'Village visit',
    icon: '🌾',
    goal: 'Greet a villager, introduce yourself and ask for water or directions.',
    role: 'a kind elderly villager who speaks only Kannada',
    opener: {
      kannada: 'ನಮಸ್ಕಾರ! ನೀವು ಎಲ್ಲಿಂದ ಬಂದಿದ್ದೀರಿ?',
      reading: 'Namaskara! Neevu ellinda bandiddeeri?',
      english: 'Hello! Where have you come from?'
    },
    suggestions: [
      {
        kannada: 'ನಾನು ಪ್ರವಾಸಿ.',
        reading: 'Naanu pravaasi.',
        english: 'I am a tourist.'
      },
      {
        kannada: 'ಸ್ವಲ್ಪ ನೀರು ಸಿಗಬಹುದೇ?',
        reading: 'Swalpa neeru sigabahude?',
        english: 'Can I have some water?'
      }
    ]
  },

  office: {
    title: 'First day at work',
    icon: '💼',
    goal: 'Introduce yourself, find the meeting room, and ask a colleague to speak slowly.',
    role: 'a helpful colleague at a Bengaluru office',
    opener: {
      kannada: 'ನಮಸ್ಕಾರ, ನೀವು ಹೊಸಬರೇ?',
      reading: 'Namaskara, neevu hosabare?',
      english: 'Hello, are you new?'
    },
    suggestions: [
      {
        kannada: 'ನಾನು ಇಲ್ಲಿ ಹೊಸದಾಗಿ ಬಂದಿದ್ದೇನೆ.',
        reading: 'Naanu illi hosadaagi bandiddene.',
        english: 'I have recently joined here.'
      },
      {
        kannada: 'ಮೀಟಿಂಗ್ ರೂಮ್ ಎಲ್ಲಿದೆ?',
        reading: 'Meeting room ellide?',
        english: 'Where is the meeting room?'
      }
    ]
  }
};

// Return available practice scenes.
router.get('/scenarios', (req, res) => {
  res.json(
    Object.entries(scenes).map(([id, scene]) => ({
      id,
      title: scene.title,
      icon: scene.icon,
      goal: scene.goal
    }))
  );
});

// Instructions for the AI conversation partner.
const makeSystemPrompt = (scene) => `
You are role-playing ${scene.role} so a beginner can practise Kannada.

Learner goal: ${scene.goal}

Speak only short, simple, polite, natural spoken Kannada.
Use Kannada script and stay in character.
The learner may reply in English, Hindi or Kannada,
including Kannada written in Roman letters.

Return valid JSON only:
{
  "kannada": "Your Kannada reply",
  "reading": "Roman transliteration",
  "english": "English meaning",
  "feedback": "Short friendly feedback, or an empty string",
  "suggestions": [
    {
      "kannada": "Suggested reply in Kannada",
      "reading": "Roman transliteration",
      "english": "English meaning"
    }
  ],
  "done": false
}

Provide two or three short suggestions.
Set done to true only when the learner's goal is complete.
When complete, give a short, friendly goodbye.
`;

// Generate the practice response.
// Try Gemini first, then Groq if Gemini fails.
async function generatePracticeReply(systemPrompt, messages) {
  let geminiError = null;

  // Primary provider: Gemini.
  if (aiEnabled()) {
    try {
      const raw = await gemini(
        systemPrompt,
        messages,
        900
      );

      const result = parseJson(raw);

      if (result?.kannada) {
        return result;
      }

      throw new Error('Gemini returned no Kannada reply.');
    } catch (error) {
      geminiError = error;

      if (!process.env.GROQ_API_KEY) {
        throw error;
      }

      console.warn(
        'Gemini failed; trying Groq fallback:',
        error.message
      );
    }
  }

  // Fallback provider: Groq.
  if (!process.env.GROQ_API_KEY) {
    throw geminiError || new Error(
      'No AI provider is configured.'
    );
  }

  const response = await fetch(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model:
          process.env.GROQ_MODEL ||
          'openai/gpt-oss-20b',

        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          ...messages
        ],

        temperature: 0.4,
        max_completion_tokens: 900,

        response_format: {
          type: 'json_object'
        }
      }),
      signal: AbortSignal.timeout(30000)
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      `Groq API error ${response.status}: ${
        data?.error?.message || 'Request failed'
      }`
    );
  }

  const raw = data?.choices?.[0]?.message?.content;

  if (typeof raw !== 'string' || !raw.trim()) {
    throw new Error('Groq returned an empty reply.');
  }

  const result = parseJson(raw);

  if (!result?.kannada) {
    throw new Error('Groq returned invalid practice JSON.');
  }

  return result;
}

// Handle one role-play turn.
router.post('/roleplay', async (req, res) => {
  try {
    const scene = scenes[req.body?.scenario];

    if (!scene) {
      return res.status(400).json({
        error: 'Choose a practice scene.'
      });
    }

    const message = str(
      req.body?.message,
      200
    ).trim();

    const history = (
      Array.isArray(req.body?.history)
        ? req.body.history
        : []
    )
      .filter(
        (item) =>
          ['user', 'assistant'].includes(item?.role) &&
          typeof item.content === 'string' &&
          item.content.trim()
      )
      .slice(-10)
      .map((item) => ({
        role: item.role,
        content: item.content.slice(0, 400)
      }));

    // Allow the scene to start using its built-in opener
    // if neither AI provider is configured.
    if (
      !message &&
      !history.length &&
      !aiEnabled() &&
      !process.env.GROQ_API_KEY
    ) {
      return res.json({
        ...scene.opener,
        feedback: '',
        suggestions: scene.suggestions,
        done: false,
        ai: false
      });
    }

    // Require at least one configured AI provider.
    if (
      !aiEnabled() &&
      !process.env.GROQ_API_KEY
    ) {
      return res.status(503).json({
        error: 'Conversation practice needs an AI key on the server.'
      });
    }

    // Prevent excessive practice requests.
    if (limited(req.ip, 'roleplay', 25)) {
      return res.status(429).json({
        error: 'Too many messages. Wait a minute.'
      });
    }

    const userTurn = message ||
      'Start the scene with a short greeting or question.';

    const result = await generatePracticeReply(
      makeSystemPrompt(scene),
      [
        ...history,
        {
          role: 'user',
          content: userTurn
        }
      ]
    );

    return res.json({
      kannada: str(result.kannada, 300),
      reading: str(result.reading, 300),
      english: str(result.english, 300),
      feedback: str(result.feedback, 200),

      suggestions: (
        Array.isArray(result.suggestions)
          ? result.suggestions
          : []
      )
        .slice(0, 3)
        .map((item) => ({
          kannada: str(item.kannada, 200),
          reading: str(item.reading, 200),
          english: str(item.english, 200)
        }))
        .filter((item) => item.kannada),

      done: Boolean(result.done),
      ai: true
    });
  } catch (error) {
    console.error(
      'Roleplay failed:',
      error.message
    );

    return res.status(502).json({
      error: 'The practice partner could not answer. Please try again.'
    });
  }
});

export default router;