
import { Router } from 'express';
import { getAll, categories, score } from '../store.js';
import {
  aiEnabled,
  gemini,
  limited,
  parseJson,
  str
} from '../ai.js';

const router = Router();

const topics = {
  college: [
    'library', 'class', 'classroom', 'exam', 'professor',
    'teacher', 'lecture', 'office', 'fees', 'timetable',
    'college', 'study'
  ],
  food: [
    'food', 'canteen', 'mess', 'hostel', 'coffee', 'tea',
    'hungry', 'water', 'spicy', 'eat', 'lunch', 'dinner',
    'restaurant', 'menu', 'breakfast'
  ],
  transport: [
    'bus', 'auto', 'rickshaw', 'metro', 'train', 'station',
    'fare', 'ticket', 'route', 'ride', 'drop', 'bargain',
    'price', 'address'
  ],
  healthcare: [
    'sick', 'fever', 'doctor', 'hospital', 'medicine',
    'pharmacy', 'pain', 'headache', 'ambulance', 'clinic',
    'stomach'
  ],
  village: [
    'village', 'villager', 'farm', 'farmer', 'rural',
    'homestay', 'photo', 'room', 'stay'
  ],
  beach: [
    'beach', 'sea', 'swim', 'boat', 'sand', 'sunset'
  ],
  hills: [
    'hill', 'hills', 'trek', 'trekking', 'viewpoint',
    'cold', 'ghat', 'coorg', 'chikmagalur'
  ],
  mall: [
    'mall', 'shop', 'shopping', 'size', 'discount',
    'upi', 'trial', 'clothes', 'price', 'money'
  ],
  festival: [
    'festival', 'temple', 'procession', 'dasara', 'ugadi',
    'habba', 'celebrate', 'greetings'
  ]
};

const hindiTerms = {
  'बस': 'bus',
  'बसस्टैंड': 'bus',
  'बसस्टॉप': 'bus',
  'ऑटो': 'auto',
  'रिक्शा': 'rickshaw',
  'ट्रेन': 'train',
  'रेल': 'train',
  'रेलवे': 'station',
  'स्टेशन': 'station',
  'किराया': 'fare',

  'कॉलेज': 'college',
  'कक्षा': 'class',
  'पढ़ाई': 'study',
  'लाइब्रेरी': 'library',

  'खाना': 'food',
  'भोजन': 'food',
  'भूख': 'hungry',
  'पानी': 'water',
  'चाय': 'tea',
  'कॉफी': 'coffee',

  'अस्पताल': 'hospital',
  'हॉस्पिटल': 'hospital',
  'डॉक्टर': 'doctor',
  'डाक्टर': 'doctor',
  'डोक्टर': 'doctor',
  'चिकित्सक': 'doctor',
  'वैद्य': 'doctor',
  'बुखार': 'fever',
  'दर्द': 'pain',
  'सिरदर्द': 'headache',
  'सिर': 'headache',
  'पेट': 'stomach',
  'दवा': 'medicine',
  'दवाई': 'medicine',
  'फार्मेसी': 'pharmacy',
  'एम्बुलेंस': 'ambulance',
  'क्लिनिक': 'clinic',

  'गाँव': 'village',
  'गांव': 'village',
  'समुद्र': 'sea',
  'समुद्रतट': 'beach',
  'पहाड़': 'hill',

  'दुकान': 'shop',
  'खरीदारी': 'shopping',
  'मंदिर': 'temple',
  'त्योहार': 'festival',

  'नमस्ते': 'hello',
  'नमस्कार': 'hello',
  'धन्यवाद': 'thanks',
  'मदद': 'help',
  'फोटो': 'photo',
  'रुकने': 'stay',
  'कमरा': 'room',
  'पैसा': 'money',
  'कीमत': 'price',
  'पता': 'address'
};

const system = `You are Saathi, the friendly conversational assistant
inside KannadaSaathi.

Your primary goal is to help people understand and speak natural Kannada
in everyday situations in Karnataka.

CONVERSATION:
- Understand the current message together with previous messages.
- Remember the context present in the supplied conversation history.
- Answer follow-up questions such as "what about the price?",
  "tell me more", "how do I say that?", and "what should I reply?"
  using the earlier conversation where possible.
- Do not treat every message as a completely new conversation.
- Do not repeat your introduction or greeting unnecessarily.
- Ask at most one short clarification question when essential context
  is genuinely missing.
- Never pretend to remember messages that are not in the supplied history.

LANGUAGE:
- Understand English, Hindi, Devanagari, Roman Kannada, Kannada script,
  and messages mixing these languages.
- Write the message field naturally in the language the user is using.
- Whenever relevant to speaking Kannada, provide Kannada script,
  its Roman transliteration, its English meaning, useful vocabulary,
  and a short practical tip.
- Use natural Kannada rather than a word-for-word translation.
- Roman transliteration should be easy for a learner to read.
- Do not translate a follow-up phrase without considering its context.

PHRASE LIBRARY:
- Treat the supplied library phrases as trusted examples.
- Prefer relevant library phrases when they fit the request.
- Do not claim that a phrase was verified if it was not supplied.
- General questions can be answered without forcing an unrelated phrase.

FACTUAL SAFETY:
- Never invent prices, bus fares, opening hours, availability,
  addresses, distances, or other factual details.
- If a requested live fact is unknown, say so clearly.
- Do not claim that you checked live information unless you did.
- You are not a doctor. Do not diagnose medical conditions.
- For a medical emergency, include "Call 112 or 108 now" in message.

OUTPUT:
Return valid JSON only. Do not use Markdown fences.
Use exactly this shape:
{
  "message": "A helpful, natural answer in the user's language",
  "kannada": "Useful Kannada sentence, or empty string",
  "reading": "Roman transliteration, or empty string",
  "meaning": "English meaning, or empty string",
  "words": [{"kn":"","roman":"","en":""}],
  "tip": "One useful short tip, or empty string"
}

For a general question unrelated to learning or speaking Kannada,
answer the question in message and leave the Kannada-learning fields
empty when a Kannada phrase would not help.`;

function extractWords(message) {
  const rawWords =
    message.toLowerCase().match(
      /[a-z0-9]+|[\u0900-\u097f]+|[\u0c80-\u0cff]+/gu
    ) || [];

  const words = new Set();

  for (const word of rawWords) {
    if (hindiTerms[word]) {
      words.add(hindiTerms[word]);
      continue;
    }

    // Keep English, numbers and Kannada words.
    // Unmapped Hindi words remain available to the AI through message.
    if (/^[\u0900-\u097f]+$/u.test(word)) {
      continue;
    }

    if (word.length > 1) {
      words.add(word);
    }
  }

  return [...words];
}

function parse(raw) {
  try {
    const result = parseJson(raw);

    if (
      !result ||
      typeof result !== 'object' ||
      Array.isArray(result)
    ) {
      throw new Error('Unexpected AI response format.');
    }

    const kannada = str(result.kannada, 500).trim();

    const words = Array.isArray(result.words)
      ? result.words.slice(0, 4).map((word) => ({
          kn: str(word?.kn, 100),
          roman: str(word?.roman, 120),
          en: str(word?.en, 120)
        }))
      : [];

    const card = kannada
      ? {
          kannada,
          reading: str(result.reading, 500),
          meaning: str(result.meaning, 500),
          tip: str(result.tip, 300),
          words
        }
      : null;

    return {
      message:
        str(result.message, 1200).trim() ||
        'I am here to help. Please tell me a little more.',
      card
    };
  } catch (error) {
    console.error('Ask Saathi response parsing failed:', error.message);

    return {
      message:
        'I could not prepare that answer correctly. Please try again.',
      card: null
    };
  }
}

function makeHistory(rawHistory) {
  const history = (
    Array.isArray(rawHistory) ? rawHistory : []
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
      content: item.content.slice(0, 900)
    }));

  // The AI conversation must begin with a user message.
  while (history.length && history[0].role !== 'user') {
    history.shift();
  }

  return history;
}

router.post('/chat', async (req, res) => {
  try {
    const message = String(req.body?.message || '')
      .trim()
      .slice(0, 500);

    if (!message) {
      return res.json({
        reply:
          'Tell me what you need, and I will help you communicate in Kannada.',
        phrases: [],
        card: null,
        ai: false
      });
    }

    const hindiInput = /[\u0900-\u097f]/u.test(message);
    const words = extractWords(message);

    let ranked = [];
    let label = 'your situation';

    // Search the library when available, but never let a library
    // result prevent the AI from understanding the conversation.
    try {
      const all = await getAll();

      const topicHits = Object.entries(topics)
        .map(([topic, keywords]) => [
          topic,
          words.filter((word) => keywords.includes(word)).length
        ])
        .sort((a, b) => b[1] - a[1]);

      const topic =
        topicHits[0]?.[1] > 0 ? topicHits[0][0] : undefined;

      const pool = topic
        ? all.filter((phrase) => phrase.category === topic)
        : all;

      ranked = pool
        .map((phrase) => ({
          phrase,
          score: score(phrase, words)
        }))
        .filter((item) => item.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 3)
        .map((item) => item.phrase);

      label =
        categories.find((category) => category.id === topic)?.name ||
        'your situation';
    } catch (error) {
      console.error('Phrase library lookup failed:', error.message);
    }

    const known = ranked
      .map((phrase) => {
        const english = str(phrase.english, 180);
        const kannada = str(phrase.kannada, 180);
        const roman = str(phrase.transliteration, 180);

        return `${english} = ${kannada} (${roman})`;
      })
      .join('\n');

    if (aiEnabled() && !limited(req.ip, 'chat', 30)) {
      try {
        const history = makeHistory(req.body?.history);

        const contextualSystem = `${system}

Relevant phrase-library results for the current request:
${known || 'No relevant library phrase was found.'}

Use these phrases only when relevant. The latest message is the user's
new message; understand it in the context of the conversation history.`;

        const raw = await gemini(
          contextualSystem,
          [...history, { role: 'user', content: message }],
          900,
          { temperature: 0.4 }
        );

        const { message: reply, card } = parse(raw);

        return res.json({
          reply,
          card,
          phrases: ranked,
          ai: true
        });
      } catch (error) {
        console.error('Ask Saathi AI failed:', error.message);
      }
    }

    // Safe, predictable fallback if AI is unavailable or rate-limited.
    const greeting =
      /^(hi|hello|hey|namaste|namaskara|ನಮಸ್ಕಾರ|ನಮಸ್ತೆ)[!. ]*$/iu
        .test(message);

    const emergency =
      /(emergency|urgent|ambulance|heart attack|cannot breathe|can't breathe|बेहोश|सांस नहीं|सीने में दर्द)/iu
        .test(message);

    if (emergency) {
      return res.json({
        reply:
          'If this is a medical emergency in India, call 112 or 108 now. Please seek immediate local help.',
        card: null,
        phrases: ranked,
        ai: false
      });
    }

    if (greeting) {
      return res.json({
        reply: hindiInput
          ? 'नमस्ते! मैं आपकी Kannada बोलने में मदद करूँगा।'
          : 'Namaskara! I am here to help you speak Kannada.',
        card: {
          kannada: 'ನಮಸ್ಕಾರ! ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?',
          reading: 'Namaskara! Nimage hege sahaya madali?',
          meaning: 'Hello! How can I help you?',
          words: [
            { kn: 'ನಮಸ್ಕಾರ', roman: 'Namaskara', en: 'Hello' },
            { kn: 'ನಿಮಗೆ', roman: 'Nimage', en: 'To you' },
            { kn: 'ಸಹಾಯ', roman: 'Sahaya', en: 'Help' }
          ],
          tip: 'Namaskara is a polite greeting.'
        },
        phrases: ranked,
        ai: false
      });
    }

    if (ranked.length) {
      return res.json({
        reply: hindiInput
          ? `आपके लिए ${label} से जुड़े कन्नड़ वाक्य मिले हैं।`
          : `Here are Kannada phrases related to ${label}.`,
        card: null,
        phrases: ranked,
        ai: false
      });
    }

    return res.json({
      reply: hindiInput
        ? 'अभी AI उपलब्ध नहीं है और मुझे इस सवाल का सटीक जवाब नहीं मिला। थोड़ी और जानकारी देकर पूछें।'
        : 'The AI assistant is temporarily unavailable, and I could not find a matching saved phrase. Please try again shortly.',
      card: null,
      phrases: [],
      ai: false
    });
  } catch (error) {
    console.error('Chat route failed:', error);

    return res.status(500).json({
      error: 'Something went wrong on the server'
    });
  }
});

export default router;
