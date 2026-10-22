
export const LANGS = {
  en: ['English', 'en-IN', 'English'],
  hi: ['Hindi', 'hi-IN', 'हिन्दी'],
  kn: ['Kannada', 'kn-IN', 'ಕನ್ನಡ'],
  ta: ['Tamil', 'ta-IN', 'தமிழ்'],
  te: ['Telugu', 'te-IN', 'తెలుగు'],
  ml: ['Malayalam', 'ml-IN', 'മലയാളം'],
  mr: ['Marathi', 'mr-IN', 'मराठी']
};

import { transcribe } from './api.js';

const w = typeof window !== 'undefined' ? window : {};
const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
const synth = w.speechSynthesis;
const BASE = import.meta.env?.VITE_API_URL || '';

export const canSpeak = true;

const toast = (msg) =>
  w.dispatchEvent?.(new CustomEvent('ks-toast', { detail: msg }));

let audio = null;

synth?.getVoices();

export function stopSpeaking() {
  synth?.cancel();

  if (audio) {
    const currentAudio = audio;
    audio = null;
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
}

function findVoice(lang) {
  const base = lang.split('-')[0].toLowerCase();
  const voices = synth?.getVoices() || [];

  const voice =
    voices.find(
      (v) =>
        v.lang.replace('_', '-').toLowerCase() === lang.toLowerCase()
    ) ||
    voices.find((v) => v.lang.toLowerCase().startsWith(base));

  return { voices, voice };
}

// Wait until the remote audio finishes before resolving.
function playRemote(text, lang, rate) {
  return new Promise((resolve) => {
    const currentAudio = new Audio(
      `${BASE}/api/tts?lang=${lang.split('-')[0]}&text=${encodeURIComponent(
        text.slice(0, 200)
      )}`
    );

    audio = currentAudio;
    currentAudio.playbackRate = rate;

    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;

      currentAudio.onended = null;
      currentAudio.onerror = null;
      currentAudio.onpause = null;

      if (audio === currentAudio) {
        audio = null;
      }

      resolve();
    };

    currentAudio.onended = finish;

    currentAudio.onerror = () => {
      toast('Could not play this audio. Check your internet connection.');
      finish();
    };

    currentAudio.onpause = finish;

    currentAudio.play().catch(() => {
      toast('Could not play this audio. Check your internet connection.');
      finish();
    });
  });
}

// Speak one phrase and wait for it to finish.
export async function speak(text, lang = 'kn-IN', rate = 1) {
  if (!text || !text.trim()) return;

  stopSpeaking();

  // Use server audio directly for Kannada.
  if (lang.toLowerCase().startsWith('kn')) {
    await playRemote(text, lang, rate);
    return;
  }

  const { voice } = findVoice(lang);

  if (synth && voice) {
    await new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = voice.lang || lang;
      utterance.voice = voice;
      utterance.rate = rate;

      let finished = false;

      const finish = () => {
        if (finished) return;
        finished = true;
        resolve();
      };

      utterance.onend = finish;

      utterance.onerror = (event) => {
        if (
          event.error === 'canceled' ||
          event.error === 'interrupted'
        ) {
          finish();
          return;
        }

        playRemote(text, lang, rate).finally(finish);
      };

      synth.speak(utterance);
    });

    return;
  }

  await playRemote(text, lang, rate);
}

const BLOCKED =
  'Microphone is blocked. Click the lock icon in the address bar, allow the microphone, then try again.';

const ERRORS = {
  'not-allowed': BLOCKED,
  'service-not-allowed': BLOCKED,
  'no-speech': 'I did not hear anything. Tap the mic and speak right away.',
  'audio-capture': 'No microphone was found.',
  network:
    "Your browser's speech service is not reachable. Use Chrome or Edge (not Brave), check your internet, and turn off VPN or ad-block. You can also type, or ask the server owner to set GROQ_API_KEY.",
  'language-not-supported':
    'This browser cannot recognise that language by voice. Please type instead.',
  aborted: ''
};

function recognize(lang, { onText, onError, onEnd }) {
  const r = new SR();

  r.lang = lang;
  r.interimResults = false;
  r.maxAlternatives = 1;

  r.onresult = (e) => {
    const t = e.results?.[0]?.[0]?.transcript;
    if (t) onText(t);
  };

  r.onerror = (e) => {
    const message =
      ERRORS[e.error] ?? 'Voice input failed. Try again or type.';

    if (message) onError(message);
  };

  r.onend = onEnd;

  try {
    r.start();
  } catch {
    onError('The microphone is busy. Wait a second and try again.');
    onEnd();
    return null;
  }

  return r;
}

// Record up to 10 seconds and send the audio to the server for transcription.
async function record(
  lang,
  { onText, onError, onEnd, onProcessing }
) {
  if (
    typeof MediaRecorder === 'undefined' ||
    !navigator.mediaDevices?.getUserMedia
  ) {
    onError('This browser cannot record audio. Please type instead.');
    onEnd();
    return null;
  }

  let stream;

  try {
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch {
    onError(BLOCKED);
    onEnd();
    return null;
  }

  const rec = new MediaRecorder(stream);
  const chunks = [];

  const timer = setTimeout(() => {
    if (rec.state === 'recording') rec.stop();
  }, 10000);

  rec.ondataavailable = (e) => {
    if (e.data.size) chunks.push(e.data);
  };

  rec.onstop = async () => {
    clearTimeout(timer);
    stream.getTracks().forEach((track) => track.stop());

    onProcessing?.();

    try {
      const text = await transcribe(
        new Blob(chunks, {
          type: rec.mimeType || 'audio/webm'
        }),
        lang.split('-')[0]
      );

      if (text) {
        onText(text);
      } else {
        onError('I could not hear any words. Try again.');
      }
    } catch (e) {
      onError(e.message);
    }

    onEnd();
  };

  rec.start();
  return rec;
}

export function listenAuto(
  handlers,
  serverStt = false,
  lang = 'hi'
) {
  if (serverStt) {
    listenOnce(lang, handlers, true);
    return null;
  }

  if (!SR) {
    handlers.onError(
      'Voice input needs Chrome or Edge. You can type instead.'
    );
    handlers.onEnd();
    return null;
  }

  return listenOnce(
    lang === 'en' ? 'en-IN' : 'hi-IN',
    handlers,
    false
  );
}

// serverStt is true when the server can transcribe audio using GROQ_API_KEY.
export function listenOnce(
  lang,
  handlers,
  serverStt = false
) {
  if (serverStt) {
    record(lang, handlers)
      .then((r) => handlers.onStarted?.(r))
      .catch(() => {
        handlers.onError(
          'Could not start recording. Please type instead.'
        );
        handlers.onEnd();
      });

    return null;
  }

  if (!SR) {
    handlers.onError(
      'Voice input needs Chrome or Edge. You can type instead.'
    );
    handlers.onEnd();
    return null;
  }

  return recognize(lang, handlers);
}
