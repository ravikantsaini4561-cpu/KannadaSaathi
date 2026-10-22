import { useEffect, useRef, useState } from 'react';
import { sendChat } from '../api.js';
import { canSpeak, listenAuto, speak, stopSpeaking } from '../speech.js';
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

function Answer({ m, ctx }) {
  const [copied, setCopied] = useState(false);
  const c = m.card;
  const rate = ctx.rate;
  const copy = async () => {
    try { await navigator.clipboard.writeText(c.kannada); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* clipboard blocked */ }
  };
  return (
    <div className="answer">
      <p className="label"><Icon name="spark" size={16} /> Saathi's recommendation</p>
      <div className="abox">
        <p className={m.error ? 'err' : ''}>{m.text}</p>
        {c && (
          <>
            <div className="kcard">
              <div className="row between">
                <span className="chip mint">Say this</span>
                {canSpeak && <button className="chip ind" onClick={() => speak(c.kannada, 'kn-IN', rate)}><Icon name="volume" size={14} /> {rate === 1 ? '1.0' : '0.75'}x</button>}
              </div>
              <p className="kn big">{c.kannada}</p>
              {c.reading && <p className="roman lg">{c.reading}</p>}
              {c.meaning && <p className="mean">“{c.meaning}”</p>}
            </div>
            {c.words.length > 0 && (
              <>
                <p className="label sm">WORD BREAKDOWN</p>
                <div className="words">{c.words.map((w, i) => <div key={i} className="wtile"><b className="kn">{w.kn}</b><span className="roman">{w.roman}</span><small>{w.en}</small></div>)}</div>
              </>
            )}
            {c.tip && <div className="tip"><Icon name="bulb" size={20} /><p>{c.tip}</p></div>}
            <div className="row">
              {canSpeak && <button className="btn soft" onClick={() => speak(c.kannada, 'kn-IN', rate)}><Icon name="volume" size={16} /> Listen</button>}
              <button className="btn soft" onClick={copy}><Icon name={copied ? 'check' : 'copy'} size={16} /> {copied ? 'Copied' : 'Copy text'}</button>
              <button className="btn soft" onClick={() => ctx.onShow({ kannada: c.kannada, english: c.meaning })}><Icon name="expand" size={16} /> Show</button>
            </div>
          </>
        )}
        {m.phrases?.map((p) => <PhraseCard key={p._id} phrase={p} name={ctx.names[p.category]} isFav={ctx.favs.includes(p._id)} onFav={ctx.onFav} onShow={ctx.onShow} rate={rate} />)}
      </div>
    </div>
  );
}

export default function Chat(ctx) {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [aiLive, setAiLive] = useState(null); // what the server actually used for the last answer
  const [proc, setProc] = useState(false);
  const [live, setLive] = useState(false);
  const [speechLang, setSpeechLang] = useState('hi');
  const [err, setErr] = useState('');
  const end = useRef(null);
  const rec = useRef(null);

  const aiOn = aiLive ?? (ctx.caps.ai && ctx.caps.aiOk !== false);
  const newChat = () => { setMessages([]); setAiLive(null); setErr(''); ctx.refreshCaps(); };
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' }); }, [messages, busy]);

  async function send(raw) {
    const message = raw.trim();
    if (!message || busy) return;
    const history = messages.filter((m) => !m.error && m.text).map((m) => ({ role: m.from === 'me' ? 'user' : 'assistant', content: m.text }));
    setText(''); setErr(''); setBusy(true);
    setMessages((m) => [...m, { from: 'me', text: message }]);
    try {
     
      const r = await sendChat(message, history);

      setMessages((m) => [
        ...m,
        {
          from: 'bot',
          text: r.reply,
          card: r.card || null,
          phrases: r.phrases || []
        }
      ]);

      if (typeof r.ai === 'boolean') setAiLive(r.ai);
   
      // Automatically speak the Kannada answer
      if (r.card?.kannada) {
        window.setTimeout(() => {
          speak(r.card.kannada, 'kn-IN', ctx.rate);
        }, 300);
      }

    } catch (e) {

      setMessages((m) => [...m, { from: 'bot', error: true, text: e.message, card: null, phrases: [] }]);
    }
    setBusy(false);
  }

 
function mic() {
  if (live) {
    try {
      rec.current?.stop();
    } catch {
      /* already stopped */
    }
    return;
  }

  setErr('');
  stopSpeaking();
  setLive(true);

  rec.current = listenAuto({
    onText: send,
    onError: setErr,
    onEnd: () => {
      setLive(false);
      setProc(false);
    },
    onProcessing: () => setProc(true),
    onStarted: (r) => {
      rec.current = r;
    }
  }, ctx.caps.stt, speechLang);
}

  return (
    <section aria-label="Ask Saathi">
      {messages.length === 0 && (
        <>
          <div className="hero-card">
            <div className="row gap">
              <div className="avatar"><Icon name="spark" size={30} /></div>
              <div><h2>Saathi (ಸಾಥಿ)</h2><span className="chip lav up">AI companion</span></div>
            </div>
            <p>Your friendly Karnataka conversation helper. Ask anything: ordering food, bargaining with an auto driver, or talking to a villager.</p>
            <div className="row"><span className="chip ind">{aiOn ? 'Powered by Claude' : 'Basic mode: saved phrases'}</span></div>
            {!ctx.caps.ai && <p className="hint">Add ANTHROPIC_API_KEY on the server for full AI answers.</p>}
            {ctx.caps.ai && !aiOn && <p className="hint">The AI is not responding right now, so I am using saved phrases. Open /api/health/ai on the server to see why.</p>}
          </div>
          <div className="row between"><h3 className="sec">Daily situations</h3><span className="hint">Tap to ask</span></div>
          <div className="scroll">{ideas.map(([e, label, prompt]) => <button key={label} className="cat" onClick={() => send(prompt)}>{e} {label}</button>)}</div>
        </>
      )}
      <div className="log">
        {messages.map((m, i) => m.from === 'me' ? <div key={i} className="me-b">{m.text}</div> : <Answer key={i} m={m} ctx={ctx} />)}
        {busy && <div className="typing"><i /><i /><i /></div>}
        <div ref={end} />
      </div>
      {err && <p className="note err">{err}</p>}
      <div className="fixbar composer">
        <select
  value={speechLang}
  onChange={(e) => setSpeechLang(e.target.value)}
  aria-label="Speech language"
>
  <option value="hi">हिन्दी</option>
  <option value="en">English</option>
</select>
        <button className={`iconbtn ${live ? 'live' : ''}`} onClick={mic} aria-label={live ? (proc ? 'Transcribing' : 'Stop listening') : 'Speak your question'}><Icon name="mic" size={20} /></button>
        <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && send(text)} placeholder="Ask in English, Hindi, or ಕನ್ನಡ..." maxLength={200} aria-label="Message" />
        {messages.length > 0 && <button className="iconbtn" onClick={newChat} aria-label="New chat"><Icon name="x" size={18} /></button>}
        <button className="send" onClick={() => send(text)} disabled={busy || !text.trim()} aria-label="Send"><Icon name="send" size={18} /></button>
      </div>
    </section>
  );
}
