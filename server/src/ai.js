export const aiState = { ok: null, error: '' };

const model = () =>
  process.env.GEMINI_MODEL || 'gemini-3.6-flash';

export const aiEnabled = () =>
  Boolean(process.env.GEMINI_API_KEY);

export async function gemini(system, messages, maxTokens = 400) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing from the server environment.');
  }

  // Gemini uses "model" for assistant messages.
  // Merge consecutive messages with the same role.
  const contents = [];

  for (const item of messages || []) {
    if (!['user', 'assistant', 'model'].includes(item.role)) continue;
    if (typeof item.content !== 'string' || !item.content.trim()) continue;

    const role = item.role === 'assistant' ? 'model' : item.role;
    const content = item.content.trim();
    const previous = contents[contents.length - 1];

    if (previous && previous.role === role) {
      previous.parts[0].text += '\n' + content;
    } else {
      contents.push({
        role,
        parts: [{ text: content }]
      });
    }
  }

  while (contents.length && contents[0].role !== 'user') {
    contents.shift();
  }

  if (!contents.length || contents[contents.length - 1].role !== 'user') {
    throw new Error('Gemini needs a conversation ending with a user message.');
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model()}:generateContent`,
      {
        method: 'POST',
        signal: AbortSignal.timeout(20000),
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: system }]
          },
          contents,
          generationConfig: {
            maxOutputTokens: maxTokens,
            responseMimeType: 'application/json'
          }
        })
      }
    );

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        `Gemini API error ${response.status}: ${
          data?.error?.message || 'Unknown error'
        }`
      );
    }

    const output = (data.candidates?.[0]?.content?.parts || [])
      .map((part) => part.text || '')
      .join('')
      .trim();

    if (!output) {
      throw new Error('Gemini returned an empty response.');
    }

    aiState.ok = true;
    aiState.error = '';

    return output;
  } catch (error) {
    aiState.ok = false;
    aiState.error = error.message;
    throw error;
  }
}

export async function aiPing() {
  try {
    await gemini(
      'Reply with the single word OK.',
      [{ role: 'user', content: 'ping' }],
      20
    );

    return { ok: true, model: model() };
  } catch (error) {
    return {
      ok: false,
      model: model(),
      error: error.message
    };
  }
}

// Rate limit: maximum calls per minute per IP and bucket.
const hits = new Map();

export function limited(ip, bucket = 'ai', max = 30) {
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const recent = (hits.get(key) || [])
    .filter((timestamp) => now - timestamp < 60000);

  recent.push(now);
  hits.set(key, recent);

  return recent.length > max;
}