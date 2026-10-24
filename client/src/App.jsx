import { useEffect, useState } from 'react';
import { getCategories, getHealth, getPhrases } from './api.js';
import PhraseCard from './components/PhraseCard.jsx';
import ShowMode from './components/ShowMode.jsx';
import Chat from './components/Chat.jsx';
import Interpreter from './components/Interpreter.jsx';
import Learn from './components/Learn.jsx';
import Scan from './components/Scan.jsx';
import Practice from './components/Practice.jsx';
import Icon from './components/Icon.jsx';
import Emergency from './components/Emergency.jsx';
import More from './components/More.jsx';
import { useLang } from './i18n.jsx';

const TABS = [
  ['browse', 'n_browse', 'book'],
  ['interpreter', 'n_interpreter', 'swap'],
  ['scan', 'n_scan', 'camera'],
  ['ask', 't_ask', 'chat'],
  ['sos', 't_sos', 'shield']
];

const SUB = ['saved', 'practice', 'learn'];

const TITLES = {
  browse: 'n_browse',
  interpreter: 'n_interpreter',
  scan: 'n_scan',
  learn: 'n_learn',
  more: 'n_more',
  ask: 't_ask',
  saved: 't_saved',
  practice: 't_practice',
  sos: 't_sos'
};
const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage blocked */ } };

export default function App() {
  const {t} = useLang();

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
  const [menuOpen, setMenuOpen] = useState(false);
  const { lang, setLang } = useLang();

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
  const title = t(TITLES[tab] || 'n_browse');
  const padding = tab === 'ask' ? 'pad' : tab === 'interpreter' ? 'padi' : '';
  const openDrawerTab = (nextTab) => {
    setMenuOpen(false);
    setTab(nextTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`app${tab === 'ask' ? ' ask-active' : ''}`}>
      <header className={`top${tab === 'ask' ? ' ask-mode' : ''}`}>
        <div className="logo"><Icon name="translate" size={22} /></div>
        <div className="top-title"><h1>KannadaSaathi <span className="chip mint">Karnataka</span></h1><p><span className="kn-s">ಕನ್ನಡ ಸಾಥಿ</span> · {title}</p></div>
        <button className="hamburger iconbtn" onClick={() => setMenuOpen(true)} aria-label="Open menu">
          <Icon name="menu" size={22} />
        </button>
        {tab === 'ask' && (
          <button className="btn soft return-btn" onClick={() => setTab('browse')} aria-label="Return back">
            <Icon name="arrowLeft" size={16} /> <span>Return</span>
          </button>
        )}
        {SUB.includes(tab) && tab !== 'learn' && (
          <button className="btn soft return-btn secondary-return" onClick={() => setTab('browse')} aria-label="Return to phrases">
            <Icon name="arrowLeft" size={16} /> <span>Return</span>
          </button>
        )}
      </header>

      <main className={padding}>
        <div style={{ display: tab === 'ask' ? 'block' : 'none', width: '100%', minWidth: 0, maxWidth: '100%' }}>
          <Chat {...shared} onBack={() => setTab('more')} />
        </div>
        {tab === 'interpreter' && <Interpreter onShow={setShowing} rate={rate} toggleRate={toggleRate} stt={caps.stt} />}
        {tab === 'learn' && <Learn rate={rate} />}
        {tab === 'practice' && <Practice rate={rate} />}
        {tab === 'scan' && <Scan onShow={setShowing} rate={rate} />}

        {tab === 'sos' && (
  <Emergency onShow={setShowing} rate={rate} />
)}

{SUB.includes(tab) && (
  <button
    className="btn soft x-backmore"
    onClick={() => setTab('more')}
  >
    <Icon name="arrowLeft" size={16} />
    {t('back_more')}
  </button>
)}

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

      <nav className="nav" aria-label="Sections">
      {TABS.map(([id, label, icon]) => {
  const active = tab === id;

  return (
    <button
      key={id}
      className={active ? 'on' : ''}
      onClick={() => setTab(id)}
      aria-current={active ? 'page' : undefined}
    >
      <Icon name={icon} size={21} />
      <span>{t(label)}</span>
    </button>
  );
})}
      </nav>

      {menuOpen && (
        <>
          <button className="menu-backdrop" onClick={() => setMenuOpen(false)} aria-label="Close menu" />
          <aside className="hamburger-menu menu-left" aria-label="More options">
            <div className="menu-head">
              <b>Menu</b>
              <button className="iconbtn" onClick={() => setMenuOpen(false)} aria-label="Close menu"><Icon name="x" size={20} /></button>
            </div>
            <button className="menu-row" onClick={() => openDrawerTab('learn')}><span className="menu-icon"><Icon name="book" size={20} /></span><span><b>Learn</b><small>Kannada words and lessons</small></span></button>
            <button className="menu-row" onClick={() => openDrawerTab('practice')}><span className="menu-icon"><Icon name="mic" size={20} /></span><span><b>Practice Talking</b><small>Role-play everyday situations</small></span></button>
            <button className="menu-row" onClick={() => openDrawerTab('saved')}><span className="menu-icon"><Icon name="heart" size={20} /></span><span><b>Saved Phrases</b><small>{favs.length} saved phrase{favs.length === 1 ? '' : 's'}</small></span></button>
            <button className="menu-row" onClick={() => openDrawerTab('browse')}><span className="menu-icon"><Icon name="wifiOff" size={20} /></span><span><b>Works Offline</b><small>Use saved content without internet</small></span></button>
            <div className="menu-language">
              <b><Icon name="globe" size={18} /> App Language</b>
              <div className="x-seg" role="group" aria-label="App Language">
                <button className={lang === 'en' ? 'on' : ''} onClick={() => setLang('en')} aria-pressed={lang === 'en'}>English</button>
                <button className={lang === 'kn' ? 'on' : ''} onClick={() => setLang('kn')} aria-pressed={lang === 'kn'}>ಕನ್ನಡ</button>
              </div>
            </div>
          </aside>
        </>
      )}

      {toast && <div className="toast" role="status">{toast}</div>}
      {showing && <ShowMode phrase={showing} contrast={auto} onClose={() => setShowing(null)} />}
    </div>
  );
}
