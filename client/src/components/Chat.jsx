
import { useEffect, useRef, useState } from 'react';
import { sendChat } from '../api.js';
import {
  canSpeak,
  listenAuto,
  speak,
  stopSpeaking
} from '../speech.js';
import PhraseCard from './PhraseCard.jsx';
import Icon from './Icon.jsx';

const ideas = [
  ['🛺', 'Bargain for auto fare', 'How do I politely bargain for an auto fare in Kannada?'],
  ['☕', 'Order filter coffee', 'How do I order a filter coffee in Kannada?'],
  ['🧭', 'Ask for directions', 'How do I ask for directions in Kannada?'],
  ['🌾', 'Visit a village', 'I am visiting a village where people speak only Kannada. What should I say?'],
  ['🏥', 'At the doctor', 'I have a fever and need a doctor. What do I say?'],
  ['🪔', 'Festival greetings', 'How do I greet people at a festival in Kannada?'],
  ['🚌', 'Ask about bus routes', 'How do I ask which bus goes to my destination in Kannada?'],
  ['🚆', 'At the railway station', 'How do I ask about train timings and platform numbers in Kannada?'],
  ['🚕', 'Book a taxi', 'How do I ask a taxi driver to take me to a location in Kannada?'],
  ['🏨', 'Check into a hotel', 'How do I check into a hotel and ask about room prices in Kannada?'],
  ['🛍️', 'Shopping at a market', 'How do I ask the price and bargain politely in Kannada?'],
  ['🥗', 'Order vegetarian food', 'How do I order vegetarian food and ask whether a dish is spicy in Kannada?'],
  ['🥛', 'Ask for drinking water', 'How do I politely ask for drinking water in Kannada?'],
  ['🍽️', 'Ask for the bill', 'How do I ask for the bill at a restaurant in Kannada?'],
  ['📍', 'Find a nearby place', 'How do I ask where the nearest bus stop, shop, or ATM is in Kannada?'],
  ['📱', 'Ask for Wi-Fi', 'How do I ask for the Wi-Fi password in Kannada?'],
  ['📞', 'Make a phone call', 'How do I start a polite phone conversation in Kannada?'],
  ['🤝', 'Introduce yourself', 'How do I introduce myself and ask someone their name in Kannada?'],
  ['🙏', 'Say thank you', 'How do I say thank you, sorry, and excuse me politely in Kannada?'],
  ['👋', 'Greet local people', 'How do I greet people and make small talk in Kannada?'],
  ['🏠', 'Ask for an address', 'How do I ask someone for their home address in Kannada?'],
  ['💊', 'Buy medicine', 'How do I explain my symptoms and ask for basic medicine at a pharmacy in Kannada?'],
  ['🚑', 'Medical emergency', 'How do I ask for an ambulance or urgent medical help in Kannada?'],
  ['🚓', 'Ask the police for help', 'How do I explain that I need help to a police officer in Kannada?'],
  ['📦', 'Send a parcel', 'How do I ask about parcel delivery charges and delivery time in Kannada?'],
  ['💳', 'Make a payment', 'How do I ask whether UPI, cash, or card payment is accepted in Kannada?'],
  ['🏧', 'Find an ATM', 'How do I ask where the nearest ATM is in Kannada?'],
  ['⏰', 'Ask about timings', 'How do I ask when a shop, office, or service opens and closes in Kannada?'],
  ['🎓', 'Talk at college', 'How do I introduce myself and talk to classmates in Kannada?'],
  ['👨‍🏫', 'Talk to a teacher', 'How do I politely ask a teacher to explain something in Kannada?'],
  ['🏥', 'Explain symptoms', 'How do I tell a doctor that I have a headache, fever, or stomach pain in Kannada?'],
  ['🌧️', 'Talk about the weather', 'How do I ask about the weather and discuss rain in Kannada?'],
  ['🧳', 'Ask for travel help', 'How do I ask a local person for help with my luggage in Kannada?'],
  ['🆘', 'Lost and confused', 'How do I explain that I am lost and ask someone to guide me in Kannada?'],
  ['🗣️', 'Ask someone to speak slowly', 'How do I politely ask someone to speak slowly or repeat something in Kannada?'],
  ['🔤', 'Learn a new word', 'How do I ask what a Kannada word means and how to pronounce it?'],
  ['👨‍👩‍👧', 'Meet a local family', 'How do I greet a family and show respect when visiting their home in Kannada?'],
  ['🌙', 'Evening conversation', 'How do I say good evening and ask someone how their day went in Kannada?'],
  ['🔋', 'Phone battery problem', 'How do I ask someone where I can charge my phone in Kannada?'],
  ['🧾', 'Ask for a receipt', 'How do I ask for a receipt after buying something in Kannada?'],
  ['🚪', 'Ask permission', 'How do I politely ask permission to enter a room or place in Kannada?']
];

function buildHistoryContent(message) {
  const parts = [String(message.text || '')];

  if (message.card) {
    if (message.card.kannada) {
      parts.push(`Kannada: ${message.card.kannada}`);
    }

    if (message.card.reading) {
      parts.push(`Roman reading: ${message.card.reading}`);
    }

    if (message.card.meaning) {
      parts.push(`Meaning: ${message.card.meaning}`);
    }

    if (message.card.tip) {
      parts.push(`Learning tip: ${message.card.tip}`);
    }

    if (Array.isArray(message.card.words)) {
      const vocabulary = message.card.words
        .slice(0, 4)
        .map((word) => {
          return `${word.kn || ''} (${word.roman || ''}) = ${word.en || ''}`;
        })
        .filter(Boolean);

      if (vocabulary.length) {
        parts.push(`Vocabulary: ${vocabulary.join('; ')}`);
      }
    }
  }

  if (Array.isArray(message.phrases)) {
    const phrases = message.phrases
      .slice(0, 3)
      .map((phrase) => {
        const english = phrase.english || '';
        const kannada = phrase.kannada || '';
        const roman =
          phrase.transliteration || phrase.reading || '';

        return `${english} = ${kannada} (${roman})`;
      });

    if (phrases.length) {
      parts.push(`Suggested phrases: ${phrases.join('; ')}`);
    }
  }

  return parts.filter(Boolean).join('\n').slice(0, 1200);
}

function Answer({ m, ctx }) {
  const [copied, setCopied] = useState(false);
  const c = m.card;
  const rate = ctx.rate;

  const copy = async () => {
    if (!c?.kannada) return;

    try {
      await navigator.clipboard.writeText(c.kannada);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be unavailable.
    }
  };

  return (
    <div className="answer">
      <p className="label">
        <Icon name="spark" size={16} /> Saathi's recommendation
      </p>

      <div className="abox">
        <p className={m.error ? 'err' : ''}>{m.text}</p>

        {c && (
          <>
            <div className="kcard">
              <div className="row between">
                <span className="chip mint">Say this</span>

                {canSpeak && (
                  <button
                    className="chip ind"
                    onClick={() => speak(c.kannada, 'kn-IN', rate)}
                  >
                    <Icon name="volume" size={14} />
                    {rate === 1 ? '1.0' : '0.75'}x
                  </button>
                )}
              </div>

              <p className="kn big">{c.kannada}</p>

              {c.reading && (
                <p className="roman lg">{c.reading}</p>
              )}

              {c.meaning && (
                <p className="mean">“{c.meaning}”</p>
              )}
            </div>

            {c.words?.length > 0 && (
              <>
                <p className="label sm">WORD BREAKDOWN</p>

                <div className="words">
                  {c.words.map((word, i) => (
                    <div key={i} className="wtile">
                      <b className="kn">{word.kn}</b>
                      <span className="roman">{word.roman}</span>
                      <small>{word.en}</small>
                    </div>
                  ))}
                </div>
              </>
            )}

            {c.tip && (
              <div className="tip">
                <Icon name="bulb" size={20} />
                <p>{c.tip}</p>
              </div>
            )}

            <div className="row">
              {canSpeak && (
                <button
                  className="btn soft"
                  onClick={() => speak(c.kannada, 'kn-IN', rate)}
                >
                  <Icon name="volume" size={16} /> Listen
                </button>
              )}

              <button className="btn soft" onClick={copy}>
                <Icon name={copied ? 'check' : 'copy'} size={16} />
                {copied ? 'Copied' : 'Copy text'}
              </button>

              <button
                className="btn soft"
                onClick={() =>
                  ctx.onShow({
                    kannada: c.kannada,
                    english: c.meaning
                  })
                }
              >
                <Icon name="expand" size={16} /> Show
              </button>
            </div>
          </>
        )}

        {m.phrases?.map((phrase) => (
          <PhraseCard
            key={phrase._id}
            phrase={phrase}
            name={ctx.names[phrase.category]}
            isFav={ctx.favs.includes(phrase._id)}
            onFav={ctx.onFav}
            onShow={ctx.onShow}
            rate={rate}
          />
        ))}
      </div>
    </div>
  );
}

export default function Chat(ctx) {
  const [messages, setMessages] = useState(() => {
    try {
      return JSON.parse(sessionStorage.getItem('ks-chat')) ?? [];
    } catch {
      return [];
    }
  });

  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [aiLive, setAiLive] = useState(null);
  const [proc, setProc] = useState(false);
  const [live, setLive] = useState(false);
  const [speechLang, setSpeechLang] = useState('hi');
  const [err, setErr] = useState('');

  const end = useRef(null);
  const rec = useRef(null);
  const speechRun = useRef(0);

  const aiOn =
    aiLive ?? (ctx.caps.ai && ctx.caps.aiOk !== false);

  useEffect(() => {
    try {
      sessionStorage.setItem('ks-chat', JSON.stringify(messages));
    } catch {
      // Storage unavailable.
    }
  }, [messages]);

  const newChat = () => {
    speechRun.current += 1;
    stopSpeaking();

    setMessages([]);
    setAiLive(null);
    setErr('');

    try {
      sessionStorage.removeItem('ks-chat');
    } catch {
      // Storage unavailable.
    }

    ctx.refreshCaps();
  };

  useEffect(() => {
    if (messages.length > 0 || busy) {
      end.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'end'
      });
    }
  }, [messages, busy]);

  async function send(raw) {
    const message = raw.trim();

    if (!message || busy) return;

    speechRun.current += 1;
    stopSpeaking();

    // Include earlier messages and their Kannada-learning cards
    // so follow-up questions have more useful context.
    const history = messages
      .filter((m) => !m.error && m.text)
      .map((m) => ({
        role: m.from === 'me' ? 'user' : 'assistant',
        content: m.from === 'me'
          ? String(m.text || '').slice(0, 900)
          : buildHistoryContent(m)
      }));

    setText('');
    setErr('');
    setBusy(true);

    setMessages((previous) => [
      ...previous,
      { from: 'me', text: message }
    ]);

    const currentRun = speechRun.current;

    try {
      const r = await sendChat(message, history);
      const phrases = Array.isArray(r.phrases) ? r.phrases : [];

      setMessages((previous) => [
        ...previous,
        {
          from: 'bot',
          text: r.reply,
          card: r.card || null,
          phrases
        }
      ]);

      if (typeof r.ai === 'boolean') {
        setAiLive(r.ai);
      }

      // Speak the Kannada card or returned Kannada phrases.
      const toSpeak = r.card?.kannada
        ? [r.card.kannada]
        : phrases
            .map((phrase) => phrase.kannada)
            .filter(
              (line) =>
                typeof line === 'string' && line.trim()
            );

      if (canSpeak && toSpeak.length > 0) {
        window.setTimeout(async () => {
          for (const line of toSpeak) {
            if (currentRun !== speechRun.current) return;

            try {
              await speak(line, 'kn-IN', ctx.rate);
            } catch (error) {
              console.error('Automatic speech failed:', error);
              return;
            }
          }
        }, 300);
      }
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        {
          from: 'bot',
          error: true,
          text:
            error.message ||
            'Could not get a response. Please try again.',
          card: null,
          phrases: []
        }
      ]);
    } finally {
      setBusy(false);
    }
  }

  function mic() {
    if (live) {
      try {
        rec.current?.stop();
      } catch {
        // The recorder may already have stopped.
      }

      return;
    }

    speechRun.current += 1;
    stopSpeaking();
    setErr('');
    setLive(true);

    rec.current = listenAuto(
      {
        onText: send,
        onError: setErr,
        onEnd: () => {
          setLive(false);
          setProc(false);
        },
        onProcessing: () => setProc(true),
        onStarted: (recorder) => {
          rec.current = recorder;
        }
      },
      ctx.caps.stt,
      speechLang
    );
  }

  return (
    <section aria-label="Ask Saathi">
      {messages.length === 0 && (
        <>
          <div className="hero-card">
            <div className="row gap">
              <div className="avatar">
                <Icon name="spark" size={30} />
              </div>

              <div>
                <h2>Saathi (ಸಾಥಿ)</h2>
                <span className="chip lav up">
                  AI companion
                </span>
              </div>
            </div>

            <p>
              Your friendly Karnataka conversation helper. Ask anything:
              ordering food, bargaining with an auto driver, or talking to a villager.
            </p>

            <div className="row">
              <span className="chip ind">
                {aiOn ? 'AI assistant available' : 'Basic mode: saved phrases'}
              </span>
            </div>

            {!ctx.caps.ai && (
              <p className="hint">
                Configure GEMINI_API_KEY or GROQ_API_KEY on the server
                for AI-powered answers.
              </p>
            )}

            {ctx.caps.ai && !aiOn && (
              <p className="hint">
                AI is not responding right now, so I am using saved phrases.
                Check the server AI health endpoint for details.
              </p>
            )}
          </div>

          <div className="row between">
            <h3 className="sec">Daily situations</h3>
            <span className="hint">Tap to ask</span>
          </div>

          <div className="scroll wrap-situations">
            {ideas.map(([emoji, label, prompt]) => (
              <button
                key={label}
                className="cat"
                onClick={() => send(prompt)}
                disabled={busy}
              >
                {emoji} {label}
              </button>
            ))}
          </div>
        </>
      )}

      <div className="log">
        {messages.map((message, index) =>
          message.from === 'me' ? (
            <div key={index} className="me-b">
              {message.text}
            </div>
          ) : (
            <Answer key={index} m={message} ctx={ctx} />
          )
        )}

        {busy && (
          <div className="typing">
            <i />
            <i />
            <i />
          </div>
        )}

        <div ref={end} />
      </div>

      {err && <p className="note err">{err}</p>}

      <div className="fixbar composer">
        <select
          value={speechLang}
          onChange={(event) => setSpeechLang(event.target.value)}
          aria-label="Speech language"
        >
          <option value="hi">हिन्दी</option>
          <option value="en">English</option>
        </select>

        <button
          className={`iconbtn ${live ? 'live' : ''}`}
          onClick={mic}
          aria-label={
            live
              ? proc
                ? 'Transcribing'
                : 'Stop listening'
              : 'Speak your question'
          }
        >
          <Icon name="mic" size={20} />
        </button>

        <input
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') send(text);
          }}
          placeholder="Ask in English, Hindi, or ಕನ್ನಡ..."
          maxLength={200}
          aria-label="Message"
        />

        {messages.length > 0 && (
          <button
            className="iconbtn"
            onClick={newChat}
            aria-label="New chat"
          >
            <Icon name="x" size={18} />
          </button>
        )}

        <button
          className="send"
          onClick={() => send(text)}
          disabled={busy || !text.trim()}
          aria-label="Send"
        >
          <Icon name="send" size={18} />
        </button>
      </div>
    </section>
  );
}
