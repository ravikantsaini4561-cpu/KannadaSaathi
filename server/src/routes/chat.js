import { Router } from 'express';
import { getAll, categories, score } from '../store.js';
import { aiEnabled, gemini, limited } from '../ai.js';

const router = Router();

const topics = {
  college: [
    'library', 'class', 'classroom', 'exam', 'professor',
    'teacher', 'lecture', 'office', 'fees', 'timetable',
    'college', 'study'
  ],
  food: [
    'food', 'canteen', 'mess', 'hostel', 'coffee', 'tea',
    'hungry', 'water', 'spicy', 'eat', 'lunch', 'dinner'
  ],
  transport: [
    'bus', 'auto', 'rickshaw', 'metro', 'train', 'station',
    'fare', 'ticket', 'route', 'ride', 'drop', 'bargain'
  ],
  healthcare: [
    'sick', 'fever', 'doctor', 'hospital', 'medicine',
    'pharmacy', 'pain', 'headache', 'ambulance', 'clinic',
    'stomach'
  ],
  village: [
    'village', 'villager', 'farm', 'farmer', 'rural',
    'homestay', 'photo'
  ],
  beach: ['beach', 'sea', 'swim', 'boat', 'sand', 'sunset'],
  hills: [
    'hill', 'hills', 'trek', 'trekking', 'viewpoint',
    'cold', 'ghat', 'coorg', 'chikmagalur'
  ],
  mall: [
    'mall', 'shop', 'shopping', 'size', 'discount',
    'upi', 'trial', 'clothes'
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

const system = `You are Saathi, a friendly assistant helping people communicate in Kannada.

Return valid JSON only, without markdown:
{
  "message": "1-2 friendly sentences in the user's language",
  "kannada": "the most useful Kannada sentence to say, or empty string",
  "reading": "Roman transliteration of the Kannada sentence",
  "meaning": "English meaning",
  "words": [{"kn":"","roman":"","en":""}],
  "tip": "one short etiquette tip or an empty string"
}

Use Hindi when the user writes in Hindi. Always provide Kannada in Kannada script and its reading in Roman script. Use the supplied phrase library when relevant, and do not invent prices, timings, or facts. You are not a doctor. For a medical emergency, include "Call 112 or 108 now" in the message.`;

function extractWords(message) {
  const rawWords =
    message.toLowerCase().match(
      /[a-z0-9]+|[\u0900-\u097f]+|[\u0c80-\u0cff]+/gu
    ) || [];

  const words = new Set();
  let hasHindiMapping = false;

  for (const word of rawWords) {
    if (hindiTerms[word]) {
      words.add(hindiTerms[word]);
      hasHindiMapping = true;
      continue;
    }

    // Ignore unmatched Hindi words; keep English and Kannada words.
    if (/^[\u0900-\u097f]+$/u.test(word)) continue;

    if (word.length > 1) {
      words.add(word);
    }
  }

  return {
    words: [...words],
    hasHindiMapping
  };
}

function parse(raw) {
  try {
    const match = String(raw).match(/\{[\s\S]*\}/);

    if (!match) {
      throw new Error('Gemini response did not contain JSON.');
    }

    const result = JSON.parse(match[0]);
    const str = (value) =>
      typeof value === 'string' ? value : String(value || '');

    const card = result.kannada
      ? {
          kannada: str(result.kannada),
          reading: str(result.reading),
          meaning: str(result.meaning),
          tip: str(result.tip),
          words: (Array.isArray(result.words) ? result.words : [])
            .slice(0, 4)
            .map((word) => ({
              kn: str(word.kn),
              roman: str(word.roman),
              en: str(word.en)
            }))
        }
      : null;

    return {
      message: str(result.message) || 'Here you go.',
      card
    };
  } catch {
    return {
      message: 'Sorry, I could not prepare that answer. Please try again.',
      card: null
    };
  }
}

router.post('/chat', async (req, res) => {
  try {
    const message = String(req.body?.message || '')
      .trim()
      .slice(0, 200);

    if (!message) {
      return res.json({
        reply: 'Tell me what you need, and I will help you say it in Kannada.',
        phrases: [],
        card: null
      });
    }

    const hindiInput = /[\u0900-\u097f]/u.test(message);
    const { words, hasHindiMapping } = extractWords(message);

    if (
      /^(hi|hello|hey|namaste|namaskara)\b/i.test(message) ||
      /^नमस्ते/u.test(message.trim())
    ) {
      return res.json({
        reply: hindiInput
          ? 'आप यह दोस्ताना कन्नड़ अभिवादन कह सकते हैं:'
          : 'Here is a friendly Kannada greeting you can say.',
        card: {
          kannada: 'ನಮಸ್ಕಾರ! ನನ್ನ ಹೆಸರು ಸಾಥಿ.',
          reading: 'Namaskāra! Nanna hesaru Saathi.',
          meaning: 'Hello! My name is Saathi.',
          words: [
            { kn: 'ನಮಸ್ಕಾರ', roman: 'Namaskāra', en: 'Hello' },
            { kn: 'ನನ್ನ', roman: 'Nanna', en: 'My' },
            { kn: 'ಹೆಸರು', roman: 'hesaru', en: 'name' }
          ],
          tip: 'Use Namaskara as a polite greeting.'
        },
        phrases: [],
        ai: false
      });
    }

    if (!words.length) {
      return res.json({
        reply: hindiInput
          ? 'कृपया अपनी ज़रूरत बताइए, जैसे डॉक्टर, अस्पताल, बस या खाना।'
          : 'Tell me what you need, such as a doctor, hospital, bus or food.',
        phrases: [],
        card: null,
        ai: false
      });
    }

    const all = await getAll();

    const hits = Object.entries(topics)
      .map(([topic, keywords]) => [
        topic,
        words.filter((word) => keywords.includes(word)).length
      ])
      .sort((a, b) => b[1] - a[1]);

    const topic = hits[0]?.[1] > 0 ? hits[0][0] : undefined;

    const pool = topic
      ? all.filter((phrase) => phrase.category === topic)
      : all;

    const ranked = pool
      .map((phrase) => ({
        phrase,
        score: score(phrase, words)
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map((item) => item.phrase);

    const label =
      categories.find((category) => category.id === topic)?.name ||
      'your message';

    // Return useful saved phrases directly for mapped Hindi queries.
    if (hindiInput && hasHindiMapping && ranked.length > 0) {
      return res.json({
        reply: 'आपके लिए ये कन्नड़ वाक्य उपयोगी हो सकते हैं।',
        phrases: ranked,
        card: null,
        ai: false
      });
    }

    if (aiEnabled() && !limited(req.ip)) {
      try {
        const history = (
          Array.isArray(req.body?.history) ? req.body.history : []
        )
          .filter(
            (item) =>
              ['user', 'assistant'].includes(item.role) &&
              typeof item.content === 'string' &&
              item.content.trim()
          )
          .slice(-6)
          .map((item) => ({
            role: item.role,
            content: item.content.slice(0, 500)
          }));

        while (history.length && history[0].role !== 'user') {
          history.shift();
        }

        const known = ranked
          .map(
            (phrase) =>
              `${phrase.english} = ${phrase.kannada} (${phrase.transliteration})`
          )
          .join('; ');

        const raw = await gemini(
          `${system}\nPhrases from our library that may fit: ${known || 'none'}`,
          [...history, { role: 'user', content: message }],
          700
        );

        const { message: reply, card } = parse(raw);

        return res.json({
          reply,
          card,
          phrases: [],
          ai: true
        });
      } catch (error) {
        console.error('Gemini chat failed:', error.message);
      }
    }

    const reply = ranked.length
      ? hindiInput
        ? `आपके लिए ${label} से जुड़े कन्नड़ वाक्य मिले हैं।`
        : `Here are phrases for ${label}. Tap Show to display one to the other person.`
      : hindiInput
        ? 'मुझे अभी इसके लिए कोई वाक्य नहीं मिला। डॉक्टर, अस्पताल, बस या भोजन जैसी ज़रूरत बताकर पूछें।'
        : 'I could not find a phrase for that yet. Try a place or a need: bus, village, beach, canteen, doctor.';

    return res.json({
      reply,
      card: null,
      phrases: ranked,
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