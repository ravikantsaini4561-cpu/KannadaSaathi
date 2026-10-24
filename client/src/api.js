const BASE = import.meta.env.VITE_API_URL || '';
const json = { 'Content-Type': 'application/json' };
const DOWN = 'Cannot reach the server. Start the server terminal (npm run dev) and reload the page';

async function request(path, options = {}, timeoutMs = 30000) {
  let res;
  try { res = await fetch(`${BASE}/api${path}`, { ...options, signal: AbortSignal.timeout(timeoutMs) }); } catch { throw new Error(DOWN); }
  const body = await res.json().catch(() => null);
  if (!res.ok || body === null) throw new Error(body?.error || (res.status >= 500 ? DOWN : 'Server error'));
  return body;
}

export const getCategories = () => request('/categories');
export const getHealth = () => request('/health');
export const getPhrases = ({ category, search } = {}) => {
  const q = new URLSearchParams();
  if (category) q.set('category', category);
  if (search) q.set('search', search);
  return request(`/phrases?${q}`);
};
// Scan a photo and ask the backend to read and translate it.
export const scanImage = (image) =>
  request(
    '/vision',
    {
      method: 'POST',
      headers: json,
      body: JSON.stringify({ image })
    },
    50000
  );
  // Get available Kannada role-play scenarios.
export const getScenarios = () =>
  request('/scenarios');

// Send a message to the role-play conversation.
export const roleplay = (
  scenario,
  history = [],
  message = ''
) =>
  request('/roleplay', {
    method: 'POST',
    headers: json,
    body: JSON.stringify({
      scenario,
      history,
      message
    })
  });
  
export const sendChat = (message, history = []) => request('/chat', { method: 'POST', headers: json, body: JSON.stringify({ message, history }) });
export const translate = (text, from, to) => request('/translate', { method: 'POST', headers: json, body: JSON.stringify({ text, from, to }) });
export async function transcribe(blob, lang) {
  let res;
  try { res = await fetch(`${BASE}/api/stt?lang=${lang}`, { method: 'POST', headers: { 'Content-Type': blob.type || 'audio/webm' }, body: blob, signal: AbortSignal.timeout(40000) }); } catch { throw new Error(DOWN); }
  const body = await res.json().catch(() => null);
  if (!res.ok || !body) throw new Error(body?.error || 'Could not turn your voice into text. Try again or type.');
  return body.text || '';
}
