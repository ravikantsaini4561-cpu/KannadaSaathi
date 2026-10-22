import { canSpeak, speak } from '../speech.js';
import Icon from './Icon.jsx';

export default function PhraseCard({ phrase, name, isFav, onFav, onShow, rate }) {
  return (
    <article className="card">
      <div className="row between">
        <span className="chip lav">{name || phrase.category}</span>
        <div className="row">
          <button className={`iconbtn ${isFav ? 'on' : ''}`} onClick={() => onFav(phrase._id)} aria-pressed={isFav} aria-label={isFav ? 'Remove from saved' : 'Save phrase'}><Icon name="heart" size={18} /></button>
          <button className="iconbtn" onClick={() => onShow(phrase)} aria-label="Show full screen"><Icon name="expand" size={18} /></button>
        </div>
      </div>
      <p className="kn">{phrase.kannada}</p>
      <p className="roman">{phrase.transliteration}</p>
      <div className="box">
        <p><b>EN</b> {phrase.english}</p>
        {phrase.hindi && <p><b>HI</b> {phrase.hindi}</p>}
      </div>
      <div className="row between">
        {canSpeak ? <button className="btn primary" onClick={() => speak(phrase.kannada, 'kn-IN', rate)}><Icon name="volume" size={16} /> Listen {rate === 1 ? '1.0' : '0.75'}x</button> : <span />}
        {!phrase.verified && <span className="hint">Awaiting review</span>}
      </div>
    </article>
  );
}
