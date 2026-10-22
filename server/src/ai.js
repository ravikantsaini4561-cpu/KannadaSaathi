
const model = () => process.env.GEMINI_MODEL || 'gemini-3.6-flash';

export const aiEnabled = () => Boolean(process.env.GEMINI_API_KEY);

export const aiState = { ok: null, error: '' };

export async function gemini(system, messages, maxTokens = 400) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not set in server/.env');
    }

    const contents = messages.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

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
            temperature: 0.3,
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

    const candidate = data?.candidates?.[0];

const result = candidate?.content?.parts
  ?.map((part) => part.text || '')
  .join('')
  .trim();

if (!result) {
  const reason =
    candidate?.finishReason ||
    data?.promptFeedback?.blockReason ||
    'No candidate or text returned';

  throw new Error(
    `Gemini returned no text. Reason: ${reason}`
  );
}

    aiState.ok = true;
    aiState.error = '';

    return result;
  } catch (error) {
    aiState.ok = false;
    aiState.error = error.message;
    throw error;
  }
}

export async function aiPing() {
  try {
    await gemini(
      'Reply with a JSON object containing status set to OK.',
      [{ role: 'user', content: 'ping' }],
      1024
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

const hits = new Map();

export function limited(ip, bucket = 'ai', max = 30) {
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const recent = (hits.get(key) || []).filter(
    (time) => now - time < 60000
  );

  recent.push(now);
  hits.set(key, recent);

  return recent.length > max;
}
