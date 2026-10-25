
export const aiState = {
  ok: null,
  error: ''
};

const model = () =>
  process.env.GEMINI_MODEL || 'gemini-3.6-flash';

const groqModel = () =>
  process.env.GROQ_MODEL || 'qwen/qwen3.8-27b';

export const aiEnabled = () =>
  Boolean(
    process.env.GEMINI_API_KEY ||
    process.env.GROQ_API_KEY
  );

const wait = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));

function cleanMessages(messages) {
  const result = [];

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

    const role = item.role === 'model'
      ? 'assistant'
      : item.role;

    const content = item.content.trim();
    const previous = result[result.length - 1];

    if (previous && previous.role === role) {
      previous.content += '\n' + content;
    } else {
      result.push({ role, content });
    }
  }

  while (result.length && result[0].role !== 'user') {
    result.shift();
  }

  if (
    !result.length ||
    result[result.length - 1].role !== 'user'
  ) {
    throw new Error(
      'The conversation must begin and end with a user message.'
    );
  }

  return result;
}

async function callGemini(system, messages, maxTokens, opts) {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured.');
  }

  const conversation = cleanMessages(messages).map((item) => ({
    role: item.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: item.content }]
  }));

  for (const media of opts.media || []) {
    if (!media?.mime || !media?.data) {
      throw new Error('Invalid media input.');
    }

    conversation[conversation.length - 1].parts.push({
      inlineData: {
        mimeType: media.mime,
        data: media.data
      }
    });
  }

  const generationConfig = {
    maxOutputTokens: maxTokens
  };

  if (opts.temperature !== undefined) {
    generationConfig.temperature = opts.temperature;
  }

  if (opts.json !== false) {
    generationConfig.responseMimeType = 'application/json';
  }

  let response;
  let data = {};

  for (let attempt = 0; attempt < 3; attempt++) {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model()}:generateContent`,
      {
        method: 'POST',
        signal: AbortSignal.timeout(opts.timeout || 60000),
        headers: {
          'Content-Type': 'application/json',
          'x-goog-api-key': apiKey
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: system }]
          },
          contents: conversation,
          generationConfig
        })
      }
    );

    data = await response.json().catch(() => ({}));

    if (
      response.ok ||
      response.status === 429 ||
      response.status < 500 ||
      attempt === 2
    ) {
      break;
    }

    await wait(1000 * (2 ** attempt));
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
    throw new Error('Gemini returned an empty response.');
  }

  return output;
}

async function callGroq(system, messages, maxTokens, opts) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not configured.');
  }

  const conversation = cleanMessages(messages);

  const groqMessages = [
    { role: 'system', content: system },
    ...conversation
  ];

  const body = {
    model: groqModel(),
    messages: groqMessages,
    max_tokens: maxTokens
  };

  if (opts.temperature !== undefined) {
    body.temperature = opts.temperature;
  }

  if (opts.json !== false) {
    body.response_format = { type: 'json_object' };
  }

  const response = await fetch(
    'https://api.groq.com/openai/v1/chat/completions',
    {
      method: 'POST',
      signal: AbortSignal.timeout(opts.timeout || 60000),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    }
  );

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      `Groq API error ${response.status}: ${
        data?.error?.message || 'Unknown error'
      }`
    );
  }

  const output = data.choices?.[0]?.message?.content;

  const text = typeof output === 'string'
    ? output.trim()
    : Array.isArray(output)
      ? output.map((part) => part.text || '').join('').trim()
      : '';

  if (!text) {
    throw new Error('Groq returned an empty response.');
  }

  return text;
}

export async function gemini(
  system,
  messages,
  maxTokens = 400,
  opts = {}
) {
  const hasMedia = Boolean(opts.media?.length);
  let geminiError;

  if (process.env.GEMINI_API_KEY) {
    try {
      const output = await callGemini(
        system,
        messages,
        maxTokens,
        opts
      );

      aiState.ok = true;
      aiState.error = '';
      return output;
    } catch (error) {
      geminiError = error;

      console.warn(
        `Gemini request failed: ${error.message}`
      );
    }
  } else {
    geminiError = new Error(
      'GEMINI_API_KEY is not configured.'
    );
  }

  // Groq text models do not replace Gemini's current
  // image/audio processing in this implementation.
  if (hasMedia || opts.fallback === false) {
    aiState.ok = false;
    aiState.error = geminiError.message;
    throw geminiError;
  }

  if (!process.env.GROQ_API_KEY) {
    aiState.ok = false;
    aiState.error = geminiError.message;
    throw geminiError;
  }

  try {
    console.warn('Trying Groq text fallback.');

    const output = await callGroq(
      system,
      messages,
      maxTokens,
      opts
    );

    aiState.ok = true;
    aiState.error = '';
    return output;
  } catch (groqError) {
    aiState.ok = false;
    aiState.error =
      `Gemini: ${geminiError.message}; ` +
      `Groq: ${groqError.message}`;

    throw new Error(aiState.error);
  }
}

export function parseJson(raw) {
  const text = String(raw).trim();

  try {
    return JSON.parse(text);
  } catch {
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

export const str = (value, max = 400) =>
  (typeof value === 'string'
    ? value
    : String(value ?? '')
  ).slice(0, max);

export async function aiPing() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured.');
    }

    await gemini(
      'Reply with the single word OK.',
      [{ role: 'user', content: 'ping' }],
      20,
      { fallback: false, json: false }
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
    (timestamp) => now - timestamp < 60000
  );

  recent.push(now);
  hits.set(key, recent);

  return recent.length > max;
}
