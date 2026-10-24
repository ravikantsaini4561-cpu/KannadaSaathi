
export const aiState = {
  ok: null,
  error: ''
};

// Default Gemini model.
// The server/.env value takes priority.
const model = () =>
  process.env.GEMINI_MODEL || 'gemini-3.6-flash';

// True when a Gemini API key is configured.
export const aiEnabled = () =>
  Boolean(process.env.GEMINI_API_KEY);

// Delay used for temporary server-error retries.
const wait = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export async function gemini(
  system,
  messages,
  maxTokens = 400,
  opts = {}
) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY is missing from the server environment.'
    );
  }

  // Prepare text conversation for Gemini.
  const contents = [];

  for (const item of messages || []) {
    if (!['user', 'assistant', 'model'].includes(item.role)) {
      continue;
    }

    if (
      typeof item.content !== 'string' ||
      !item.content.trim()
    ) {
      continue;
    }

    const role =
      item.role === 'assistant' ? 'model' : item.role;

    const content = item.content.trim();
    const previous = contents[contents.length - 1];

    // Merge consecutive messages with the same role.
    if (previous && previous.role === role) {
      previous.parts[0].text += '\n' + content;
    } else {
      contents.push({
        role,
        parts: [{ text: content }]
      });
    }
  }

  // Gemini conversation must begin with a user message.
  while (contents.length && contents[0].role !== 'user') {
    contents.shift();
  }

  if (
    !contents.length ||
    contents[contents.length - 1].role !== 'user'
  ) {
    throw new Error(
      'Gemini needs a conversation ending with a user message.'
    );
  }

  // Optional image or audio input.
  for (const media of opts.media || []) {
    if (!media?.mime || !media?.data) {
      throw new Error('Invalid media input.');
    }

    contents[contents.length - 1].parts.push({
      inlineData: {
        mimeType: media.mime,
        data: media.data
      }
    });
  }

  // Preserve JSON responses by default.
  const generationConfig = {
    maxOutputTokens: maxTokens
  };

  if (opts.temperature !== undefined) {
    generationConfig.temperature = opts.temperature;
  }

  if (opts.json !== false) {
    generationConfig.responseMimeType = 'application/json';
  }

  try {
    let response;
    let data = {};

    // Initial request plus up to 2 retries for HTTP 5xx only.
    // HTTP 429 returns immediately so fallback providers can run.
    const maxAttempts = 3;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model()}:generateContent`,
        {
          method: 'POST',
          signal: AbortSignal.timeout(
            opts.timeout || 60000
          ),
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [{ text: system }]
            },
            contents,
            generationConfig
          })
        }
      );

      data = await response.json().catch(() => ({}));

      // A 429 may indicate exhausted quota.
      // Do not retry it: let the caller handle the error
      // and immediately try an alternative provider if available.
      if (response.status === 429) {
        console.warn(
          'Gemini returned HTTP 429. Skipping retries; ' +
          'the caller can try a fallback provider.'
        );
        break;
      }

      // Retry temporary server failures only.
      const retryable = response.status >= 500;

      if (!retryable || attempt === maxAttempts - 1) {
        break;
      }

      // Backoff: approximately 1 second, then 2 seconds.
      const delay =
        1000 * (2 ** attempt) +
        Math.floor(Math.random() * 300);

      console.warn(
        `Gemini returned HTTP ${response.status}. ` +
        `Retrying in ${delay} ms ` +
        `(${attempt + 1}/${maxAttempts - 1}).`
      );

      await wait(delay);
    }

    if (!response.ok) {
      throw new Error(
        `Gemini API error ${response.status}: ${
          data?.error?.message || 'Unknown error'
        }`
      );
    }

    const output = (
      data.candidates?.[0]?.content?.parts || []
    )
      .map((part) => part.text || '')
      .join('')
      .trim();

    if (!output) {
      throw new Error(
        'Gemini returned an empty response.'
      );
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

// Extract and parse JSON returned by the AI.
export function parseJson(raw) {
  const text = String(raw).trim();

  try {
    return JSON.parse(text);
  } catch {
    // Handle a response wrapped in a Markdown code block.
    const cleaned = text
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/, '')
      .trim();

    try {
      return JSON.parse(cleaned);
    } catch {
      throw new Error(
        'The AI reply did not contain valid JSON.'
      );
    }
  }
}

// Safely convert output values to bounded strings.
export const str = (value, max = 400) =>
  (typeof value === 'string'
    ? value
    : String(value ?? '')
  ).slice(0, max);

// Test the configured Gemini API and model.
export async function aiPing() {
  try {
    await gemini(
      'Reply with the single word OK.',
      [{ role: 'user', content: 'ping' }],
      20
    );

    return {
      ok: true,
      model: model()
    };
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

  const recent = (hits.get(key) || []).filter(
    (timestamp) => now - timestamp < 60000
  );

  recent.push(now);
  hits.set(key, recent);

  return recent.length > max;
}
