import { useMemo, useState } from 'react';
import { words } from '../words.js';
import { canSpeak, speak } from '../speech.js';
import { useLang } from '../i18n.jsx';
import Icon from './Icon.jsx';

const ROUNDS = 8;
const shuffle = (a) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

function makeQuiz() {
  return shuffle(words).slice(0, ROUNDS).map((w) => {
    const others = shuffle(words.filter((x) => x.kn !== w.kn && x.en !== w.en));
    const same = others.filter((x) => x.tag === w.tag);
    const wrong = [...same, ...others.filter((x) => x.tag !== w.tag)].slice(0, 3);
    return { w, options: shuffle([w, ...wrong]) };
  });
}

const best = () => { try { return Number(localStorage.getItem('ks-quiz-best')) || 0; } catch { return 0; } };

export default function Quiz({ onExit, rate }) {
  const { t } = useLang();
  const [round, setRound] = useState(0);
  const [quiz, setQuiz] = useState(makeQuiz);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const finished = round >= quiz.length;
  const top = useMemo(() => (finished ? Math.max(best(), score) : best()), [finished, score]);

  if (finished && top === score && score > best()) { try { localStorage.setItem('ks-quiz-best', String(score)); } catch { /* storage blocked */ } }

  const q = quiz[round];
  const choose = (opt) => { if (picked) return; setPicked(opt); if (opt.kn === q.w.kn) setScore((s) => s + 1); };
  const next = () => { setPicked(null); setRound((r) => r + 1); };
  const again = () => { setQuiz(makeQuiz()); setRound(0); setScore(0); setPicked(null); };

  if (finished) {
    return (
      <section aria-label={t('quiz')} className="x-wrap">
        <div className="hero-card">
          <h2>{t('quiz_score')}: {score} / {quiz.length}</h2>
          <p>{t('quiz_best')}: {top} / {quiz.length}</p>
          <div className="row gap"><button className="btn primary" onClick={again}>{t('quiz_again')}</button><button className="btn soft" onClick={onExit}>{t('quiz_exit')}</button></div>
        </div>
      </section>
    );
  }

  return (
    <section aria-label={t('quiz')} className="x-wrap">
      <div className="row between"><button className="btn soft" onClick={onExit}><Icon name="arrowLeft" size={16} /> {t('quiz_exit')}</button><span className="chip lav">{round + 1} / {quiz.length}</span></div>
      <div className="flash">
        <span className="chip ink">{t('quiz_q')}</span>
        <p className="kn huge">{q.w.kn}</p>
        <p className="roman lg">{q.w.roman}</p>
        {canSpeak && <button className="btn soft" onClick={() => speak(q.w.kn, 'kn-IN', rate)}><Icon name="volume" size={16} /> {t('listen')}</button>}
      </div>
      <div className="x-opts">
        {q.options.map((o) => {
          const right = picked && o.kn === q.w.kn;
          const wrong = picked && picked.kn === o.kn && o.kn !== q.w.kn;
          return <button key={o.kn} className={`x-opt${right ? ' right' : ''}${wrong ? ' wrong' : ''}`} onClick={() => choose(o)} disabled={Boolean(picked)}>{o.en}</button>;
        })}
      </div>
      {picked && <button className="btn primary" onClick={next}>{t('quiz_next')}</button>}
    </section>
  );
}
