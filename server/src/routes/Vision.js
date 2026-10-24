import { Router } from 'express';

import {
  aiEnabled,
  gemini,
  parseJson,
  str,
  limited
} from '../ai.js';

const router = Router();

const ALLOWED_MIMES = [
  'image/jpeg',
  'image/png',
  'image/webp'
];

const system = `
You help travellers and students who cannot read Kannada.

Look at the uploaded photo. It may contain a signboard,
shop name, menu, bus board, notice, bill, medicine strip,
or another document.

Identify readable text and explain it to a person who
speaks English or Hindi.

Return valid JSON only, using this structure:

{
  "scene": "Short description of the photo",
  "items": [
    {
      "original": "Text exactly as seen",
      "kannada": "Text in Kannada script",
      "reading": "Roman transliteration",
      "english": "Meaning in English",
      "hindi": "Meaning in Hindi using Devanagari"
    }
  ],
  "advice": "One short practical tip or an empty string",
  "warning": "Safety warning when needed, otherwise empty"
}

Rules:
- Return at most 6 items, most important first.
- Never invent text that cannot be read.
- If the original is already Kannada, preserve its wording.
- If the original is in another language, provide an
  appropriate Kannada translation.
- Do not invent prices, names, times, or instructions.
- If nothing is readable, return an empty items array
  and explain the issue in advice.
- For medicine, dosage, or legal text, advise the user
  to ask a qualified pharmacist, doctor, or professional
  to confirm the interpretation.
`;

// Analyze the photo with Gemini first, then Groq if necessary.
async function analyzePhoto(mime, base64) {
  let geminiError = null;

  // Primary provider: Gemini.
  if (aiEnabled()) {
    try {
      const raw = await gemini(
        system,
        [
          {
            role: 'user',
            content: 'Read and translate the text in this photo.'
          }
        ],
        1500,
        {
          media: [
            {
              mime,
              data: base64
            }
          ],
          timeout: 40000
        }
      );

      const result = parseJson(raw);

      return {
        result,
        provider: 'Gemini'
      };
    } catch (error) {
      geminiError = error;

      if (!process.env.GROQ_API_KEY) {
        throw error;
      }

      console.warn(
        'Gemini vision failed; trying Groq fallback:',
        error.message
      );
    }
  }

  // Fallback provider: Groq vision.
  const groqApiKey = process.env.GROQ_API_KEY;

  if (!groqApiKey) {
    throw geminiError ||
      new Error('No vision AI provider is configured.');
  }

  const model =
    process.env.GROQ_VISION_MODEL ||
    'qwen/qwen3.8-27b';

  // Groq accepts images through a data URL.
  const imageUrl = `data:${mime};base64,${base64}`;

  const response = await fetch(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: system
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Read and translate the text in this photo.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        temperature: 0.2,
        max_completion_tokens: 1500,
        response_format: {
          type: 'json_object'
        }
      }),
      signal: AbortSignal.timeout(40000)
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      `Groq vision API error ${response.status}: ${
        data?.error?.message || 'Request failed'
      }`
    );
  }

  const raw = data?.choices?.[0]?.message?.content;

  if (typeof raw !== 'string' || !raw.trim()) {
    throw new Error('Groq vision returned an empty response.');
  }

  const result = parseJson(raw);

  return {
    result,
    provider: 'Groq'
  };
}

// Analyze and translate text from the uploaded photo.
router.post('/vision', async (req, res) => {
  try {
    // Accept either configured AI provider.
    if (!aiEnabled() && !process.env.GROQ_API_KEY) {
      return res.status(503).json({
        error: 'Photo translation requires a Gemini or Groq API key.'
      });
    }

    if (limited(req.ip, 'vision', 10)) {
      return res.status(429).json({
        error: 'Too many photos. Wait a minute and try again.'
      });
    }

    const image = req.body?.image;

    if (typeof image !== 'string') {
      return res.status(400).json({
        error: 'Please select a photo first.'
      });
    }

    // Validate JPEG, PNG, or WebP data URLs.
    const match = image.match(
      /^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/]*={0,2})$/
    );

    if (!match || !ALLOWED_MIMES.includes(match[1])) {
      return res.status(400).json({
        error: 'Please send a JPEG, PNG, or WebP photo.'
      });
    }

    const mime = match[1];
    const base64 = match[2];

    if (!base64 || base64.length > 5_500_000) {
      return res.status(413).json({
        error: 'Photo is too large. Try a smaller one.'
      });
    }

    const { result } = await analyzePhoto(mime, base64);

    const items = (
      Array.isArray(result.items) ? result.items : []
    )
      .slice(0, 6)
      .map((item) => ({
        original: str(item.original, 200),
        kannada: str(item.kannada, 300),
        reading: str(item.reading, 300),
        english: str(item.english, 300),
        hindi: str(item.hindi, 300)
      }))
      .filter((item) => item.kannada || item.original);

    return res.json({
      scene: str(result.scene, 80),
      items,
      advice: str(result.advice, 300),
      warning: str(result.warning, 200),
      source: 'AI'
    });
  } catch (error) {
    console.error('Vision failed:', error.message);

    return res.status(502).json({
      error: 'Photo reading is temporarily unavailable. Please try again later.'
    });
  }
});

export default router;