import { useEffect, useRef, useState } from 'react';
import { translate } from '../api.js';
import { LANGS, canSpeak, listenOnce, speak, stopSpeaking } from '../speech.js';
import Icon from './Icon.jsx';

const samples = ['Where is the bus stop?', 'How much is this?', 'May I take a photo?'];
const others = ['en', 'hi', 'ta', 'te', 'ml', 'mr'];

function Pill({ label, value, onChange }) {
  return (
    <label className="pillsel"><small>{label}</small>
      <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label}>
        {Object.entries(LANGS).map(([k, [n]]) => <option key={k} value={k}>{n}</option>)}
      </select>
    </label>
  );
}

function Pair({ m, rate, toggleRate, onShow }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText(m.translation); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* clipboard blocked */ } };
  const play = () => speak(m.translation, LANGS[m.to][1], rate);
  if (m.who === 'them') {
    return (
      <div className="pair">
        <div className="them-b"><p className="tr">{m.text}</p></div>
        <div className="mint-box"><Icon name="check" size={18} /><p>{m.translation}</p></div>
        <p className="hint">via {m.source}</p>
      </div>
    );
  }
  return (
    <div className="pair">
      <div className="me-b">{m.text}</div>
      <div className="trcard">
        <p className="label">{m.to === 'kn' ? 'SHOW TO THEM · ಕನ್ನಡ' : `TRANSLATION · ${LANGS[m.to][0].toUpperCase()}`}</p>
        <p className="tr big">{m.translation}</p>
        {m.reading && <p className="roman lg">{m.reading}</p>}
        <div className="row">
          {canSpeak && <button className="btn primary" onClick={play}><Icon name="volume" size={16} /> Play</button>}
          <button className="btn soft" onClick={toggleRate}><Icon name="speed" size={16} /> {rate === 1 ? '1.0' : '0.75'}x</button>
          <button className="iconbtn" onClick={copy} aria-label="Copy translation"><Icon name={copied ? 'check' : 'copy'} size={18} /></button>
          {m.to === 'kn' && <button className="chip lav" onClick={() => onShow({ kannada: m.translation, english: m.text })}><Icon name="expand" size={14} /> Fullscreen</button>}
        </div>
        <p className="hint">via {m.source}</p>
      </div>
    </div>
  );
}

export default function Interpreter({ onShow, rate, toggleRate, stt }) {
  const [mine, setMine] = useState('en');
  const [theirs, setTheirs] = useState('kn');
  const [log, setLog] = useState([]);
  const [text, setText] = useState('');
  const [live, setLive] = useState('');
  const [proc, setProc] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const rec = useRef(null);
  const end = useRef(null);

  useEffect(() => {
    if (log.length > 0 || busy) {
      end.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [log, busy]);
  useEffect(() => () => { try { rec.current?.abort?.(); } catch { /* ignore */ } }, []);
  const hint = (who) => (live !== who ? 'Tap to speak' : proc ? 'Transcribing...' : 'Listening... tap to stop');
  const pickMine = (v) => { if (v === theirs) setTheirs(mine); setMine(v); };
  const pickTheirs = (v) => { if (v === mine) setMine(theirs); setTheirs(v); };

  async function run(who, input) {
    const t = input.trim();
    if (!t || busy) return;
    const from = who === 'me' ? mine : theirs;
    const to = who === 'me' ? theirs : mine;
    setBusy(true); setError(''); setText('');
    try {
      const r = await translate(t, from, to);
      setLog((l) => [...l, { who, to, text: t, ...r }]);
      speak(r.translation, LANGS[to][1], rate);
    } catch (e) { setError(e.message); }
    setBusy(false);
  }

  function listen(who) {
    if (live) { try { rec.current?.stop(); } catch { /* already stopped */ } return; }
    setError(''); stopSpeaking(); setLive(who);
    rec.current = listenOnce(LANGS[who === 'me' ? mine : theirs][1], {
      onText: (t) => run(who, t), onError: setError, onEnd: () => { setLive(''); setProc(false); },
      onProcessing: () => setProc(true), onStarted: (r) => { rec.current = r; }
    }, stt);
  }

  return (
    <section aria-label="Interpreter">
      <div className="langcard">
        <Pill label="Source" value={mine} onChange={pickMine} />
        <button className="swap" onClick={() => { setMine(theirs); setTheirs(mine); }} aria-label="Swap languages"><Icon name="swap" size={20} /></button>
        <Pill label="Target" value={theirs} onChange={pickTheirs} />
      </div>
      <div className="scroll">{others.map((k) => <button key={k} className={mine === k ? 'cat on' : 'cat'} onClick={() => pickMine(k)}>{LANGS[k][2]}</button>)}</div>

      <div className="log">
        {log.length === 0 && (
          <div className="hero-card">
            <p>Speak or type one short sentence. Saathi translates it and says it aloud. Tap the other mic when the villager replies.</p>
            <div className="row">{samples.map((s) => <button key={s} className="chip lav" onClick={() => run('me', s)}>{s}</button>)}</div>
          </div>
        )}
        {log.map((m, i) => <Pair key={i} m={m} rate={rate} toggleRate={toggleRate} onShow={onShow} />)}
        {busy && <div className="typing"><i /><i /><i /></div>}
        {error && <p className="note err" role="alert">{error}</p>}
        <div ref={end} />
      </div>

      <div className="fixbar dock">
        <div className={`wave ${live ? 'on' : ''}`} aria-hidden="true">{[0, 1, 2, 3, 4, 5, 6].map((i) => <span key={i} style={{ animationDelay: `${i * 0.1}s` }} />)}</div>
        <div className="composer in">
          <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && run('me', text)} placeholder={`Type in ${LANGS[mine][0]}`} maxLength={300} aria-label="Type to translate" />
          <button className="send" onClick={() => run('me', text)} disabled={busy || !text.trim()} aria-label="Translate"><Icon name="send" size={18} /></button>
        </div>
        <div className="mics">
          <button className={`mic dark ${live === 'me' ? 'live' : ''}`} onClick={() => listen('me')}><Icon name="mic" size={20} /><span><b>{LANGS[mine][2]}</b><small>{hint('me')}</small></span></button>
          <button className={`mic ${live === 'them' ? 'live' : ''}`} onClick={() => listen('them')}><Icon name="mic" size={20} /><span><b>{LANGS[theirs][2]}</b><small>{hint('them')}</small></span></button>
        </div>
      </div>
    </section>
  );
}
