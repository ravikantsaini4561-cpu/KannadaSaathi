import { useEffect, useState } from 'react';
import { getCategories, getHealth, getPhrases } from './api.js';
import PhraseCard from './components/PhraseCard.jsx';
import ShowMode from './components/ShowMode.jsx';
import Chat from './components/Chat.jsx';
import Interpreter from './components/Interpreter.jsx';
import Learn from './components/Learn.jsx';
import Icon from './components/Icon.jsx';

const TABS = [['browse', 'Phrases', 'chat'], ['interpreter', 'Interpreter', 'swap'], ['learn', 'Learn', 'book'], ['ask', 'Ask Saathi', 'spark'], ['saved', 'Saved', 'heart']];
const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage blocked */ } };

export default function App() {
  const [tab, setTab] = useState('browse');
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('');
  const [query, setQuery] = useState('');
  const [phrases, setPhrases] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('loading');
  const [favs, setFavs] = useState(() => read('ks-favs', []));
  const [saved, setSaved] = useState([]);
  const [showing, setShowing] = useState(null);
  const [rate, setRate] = useState(() => read('ks-rate', 1));
  const [auto, setAuto] = useState(() => read('ks-auto', false));
  const [caps, setCaps] = useState({ ai: false, aiOk: null, stt: false });
  const [toast, setToast] = useState('');

  const refreshCaps = () => getHealth().then((h) => setCaps({ ai: Boolean(h.ai), aiOk: h.aiOk, stt: Boolean(h.stt) })).catch(() => {});
  useEffect(() => { refreshCaps(); }, []);
  useEffect(() => {
    let t;
    const on = (e) => { setToast(e.detail); clearTimeout(t); t = setTimeout(() => setToast(''), 6000); };
    window.addEventListener('ks-toast', on);
    return () => { window.removeEventListener('ks-toast', on); clearTimeout(t); };
  }, []);

  useEffect(() => { getCategories().then(setCategories).catch(() => setStatus('error')); }, []);
  useEffect(() => {
    setStatus('loading');
    const t = setTimeout(() => {
      getPhrases({ category, search: query })
        .then((d) => { setPhrases(d); setStatus('ok'); if (!category && !query) setTotal(d.length); })
        .catch(() => setStatus('error'));
    }, 250);
    return () => clearTimeout(t);
  }, [category, query]);
  useEffect(() => write('ks-favs', favs), [favs]);
  useEffect(() => write('ks-rate', rate), [rate]);
  useEffect(() => write('ks-auto', auto), [auto]);
  useEffect(() => { if (tab === 'saved') getPhrases().then((d) => setSaved(d.filter((p) => favs.includes(p._id)))).catch(() => {}); }, [tab, favs]);

  const toggleFav = (id) => setFavs((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));
  const toggleRate = () => setRate((r) => (r === 1 ? 0.75 : 1));
  const names = Object.fromEntries(categories.map((c) => [c.id, c.name]));
  const shared = { favs, onFav: toggleFav, onShow: setShowing, rate, names, caps, refreshCaps };
  const list = tab === 'saved' ? saved : phrases;
  const title = TABS.find((t) => t[0] === tab)[1];
  const padding = tab === 'ask' ? 'pad' : tab === 'interpreter' ? 'padi' : '';

  return (
    <div className="app">
      <header className="top">
        {tab === 'ask' ? (
          <button className="iconbtn back-btn" onClick={() => setTab('browse')} aria-label="Return back to phrases" title="Return back to phrases">
            <Icon name="swap" size={20} />
          </button>
        ) : (
          <div className="logo"><Icon name="translate" size={22} /></div>
        )}
        <div><h1>KannadaSaathi <span className="chip mint">Karnataka</span></h1><p><span className="kn-s">ಕನ್ನಡ ಸಾಥಿ</span> · {title}</p></div>
        {tab === 'ask' && (
          <button className="btn soft return-btn" onClick={() => setTab('browse')} aria-label="Return back">
            <Icon name="swap" size={16} /> Return back
          </button>
        )}
      </header>

      <main className={padding}>
        <div style={{ display: tab === 'ask' ? 'contents' : 'none' }}>
          <Chat {...shared} onBack={() => setTab('browse')} />
        </div>
        {tab === 'interpreter' && <Interpreter onShow={setShowing} rate={rate} toggleRate={toggleRate} stt={caps.stt} />}
        {tab === 'learn' && <Learn rate={rate} />}

        {tab === 'browse' && (
          <>
            <div className="search">
              <Icon name="search" size={20} />
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search: auto, village, fever, coffee" aria-label="Search phrases" />
              {query && <button className="iconbtn sm" onClick={() => setQuery('')} aria-label="Clear search"><Icon name="x" size={16} /></button>}
            </div>
            <div className="scroll">
              <button className={!category ? 'cat on' : 'cat'} onClick={() => setCategory('')}>All {total > 0 && <span className="count">{total}</span>}</button>
              {categories.map((c) => <button key={c.id} className={category === c.id ? 'cat on' : 'cat'} onClick={() => setCategory(c.id)}>{c.icon} {c.name}</button>)}
            </div>
            <div className="magic"><Icon name="bulb" size={24} /><p><b>Ooru magic word</b><br />Start with <b className="kn-s">“ದಯವಿಟ್ಟು”</b> (Dayavittu) = please. It softens any request or bill.</p></div>
            <div className="row between"><h3 className="sec">{category ? names[category] : 'Daily essentials'}</h3><button className="chip ind" onClick={toggleRate}><Icon name="speed" size={14} /> Speed {rate === 1 ? '1.0' : '0.75'}x</button></div>
          </>
        )}
        {tab === 'saved' && <h3 className="sec">Saved phrases</h3>}

        {(tab === 'browse' || tab === 'saved') && (
          <div className="list">
            {status === 'loading' && tab === 'browse' && <p className="note">Loading phrases...</p>}
            {status === 'error' && <p className="note err">Cannot reach the server. Start the server terminal (npm run dev) and reload the page.</p>}
            {status === 'ok' && list.length === 0 && <p className="note">{tab === 'saved' ? 'Nothing saved yet. Tap the heart on a phrase you use often.' : 'No phrase found. Try a place or a need, like bus or doctor.'}</p>}
            {list.map((p) => <PhraseCard key={p._id} phrase={p} name={names[p.category]} isFav={favs.includes(p._id)} onFav={toggleFav} onShow={setShowing} rate={rate} />)}
          </div>
        )}

        {tab === 'browse' && (
          <div className="auto">
            <span className="avatar sm"><Icon name="eye" size={22} /></span>
            <div><b>Auto-driver mode</b><p>Huge high-contrast Kannada when you tap Show, easy to read in sunlight.</p></div>
            <button className={`toggle ${auto ? 'on' : ''}`} onClick={() => setAuto(!auto)} role="switch" aria-checked={auto} aria-label="Auto-driver mode"><i /></button>
          </div>
        )}
      </main>

      {tab !== 'ask' && (
        <nav className="nav" aria-label="Sections">
          {TABS.map(([id, label, icon]) => (
            <button key={id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)} aria-current={tab === id ? 'page' : undefined}>
              <Icon name={icon} size={21} /><span>{id === 'saved' && favs.length ? `Saved ${favs.length}` : label}</span>
            </button>
          ))}
        </nav>
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
      {showing && <ShowMode phrase={showing} contrast={auto} onClose={() => setShowing(null)} />}
    </div>
  );
}
