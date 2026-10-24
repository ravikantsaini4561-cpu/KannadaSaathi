
import { useState } from 'react';
import { words } from '../words.js';
import { canSpeak, speak } from '../speech.js';
import Icon from './Icon.jsx';
import Quiz from './Quiz.jsx';
import { useLang } from '../i18n.jsx';

const TARGET = 10;

const day = (d = new Date()) => d.toLocaleDateString('en-CA');

const load = () => {
  try {
    const d = JSON.parse(localStorage.getItem('ks-learn'));
    return { known: d.known || [], log: d.log || {} };
  } catch {
    return { known: [], log: {} };
  }
};

const streakOf = (log) => {
  const d = new Date();

  if (!log[day(d)]) d.setDate(d.getDate() - 1);

  let n = 0;

  while (log[day(d)]) {
    n++;
    d.setDate(d.getDate() - 1);
  }

  return n;
};

export default function Learn({ rate }) {
  const [st, setSt] = useState(load);
  const [group, setGroup] = useState('all');
  const [cur, setCur] = useState(null);

  // NEW: Quiz screen state
  const [quiz, setQuiz] = useState(false);

  // NEW: Text translation for the Quiz button
  const { t } = useLang();

  const save = (s) => {
    setSt(s);

    try {
      localStorage.setItem('ks-learn', JSON.stringify(s));
    } catch {
      /* storage blocked */
    }
  };

  const list = words.filter(
    (w) => group === 'all' || w.group === group
  );

  const left = (known) =>
    list.filter((w) => !known.includes(w.kn));

  const card =
    list.find((w) => w.kn === cur) || left(st.known)[0];

  const doneToday = st.log[day()] || 0;
  const level = 1 + Math.floor(st.known.length / 6);

  function advance(known) {
    const from = list.findIndex((w) => w.kn === card?.kn);
    const rest = left(known);

    const next =
      rest.find((w) => list.indexOf(w) > from) || rest[0];

    setCur(next ? next.kn : null);
  }

  function gotIt() {
    if (!card) return;

    const known = st.known.includes(card.kn)
      ? st.known
      : [...st.known, card.kn];

    save({
      known,
      log: {
        ...st.log,
        [day()]:
          doneToday + (st.known.includes(card.kn) ? 0 : 1),
      },
    });

    advance(known);
  }

  // NEW: Show Quiz while preserving the existing Learn screen
  if (quiz) {
    return (
      <Quiz
        rate={rate}
        onExit={() => setQuiz(false)}
      />
    );
  }

  return (
    <section aria-label="Learn">
      <div className="hero-card">
        <div className="row between">
          <div className="row gap">
            <span className="avatar sm">
              <Icon name="flame" size={22} />
            </span>

            <b>{streakOf(st.log)} day streak</b>
          </div>

          <span className="chip lav">
            Level {level}
          </span>
        </div>

        <div className="row between">
          <span>Today's practice target</span>

          <b className="ind-t">
            {Math.min(doneToday, TARGET)} / {TARGET} words
          </b>
        </div>

        <div className="bar">
          <span
            style={{
              width: `${Math.min(
                100,
                (doneToday / TARGET) * 100
              )}%`,
            }}
          />
        </div>
      </div>

      <div className="scroll">
        {[
          ['all', 'Flashcards'],
          ['essentials', 'Essentials'],
          ['numbers', 'Numbers 1–10'],
        ].map(([k, l]) => (
          <button
            key={k}
            className={group === k ? 'cat on' : 'cat'}
            onClick={() => {
              setGroup(k);
              setCur(null);
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {/* NEW: Quiz button */}
      <button
        className="btn soft"
        onClick={() => setQuiz(true)}
      >
        <Icon name="bulb" size={16} />
        {t('quiz')}
      </button>

      {card ? (
        <div className="flash">
          <span className="chip ink">
            {card.tag} · card {list.indexOf(card) + 1} of {list.length}
          </span>

          <p className="kn huge">{card.kn}</p>

          <p className="roman lg">{card.roman}</p>

          {canSpeak && (
            <button
              className="btn soft"
              onClick={() => speak(card.kn, 'kn-IN', rate)}
            >
              <Icon name="volume" size={16} />
              Listen {rate === 1 ? '1.0' : '0.75'}x
            </button>
          )}

          <div className="box wide">
            <p className="row between">
              <span>English</span>
              <b>{card.en}</b>
            </p>

            <p className="row between">
              <span>Hindi</span>
              <b>{card.hi}</b>
            </p>
          </div>

          <div className="row">
            <button
              className="btn soft"
              onClick={() => advance(st.known)}
            >
              Review
            </button>

            <button
              className="btn primary"
              onClick={gotIt}
            >
              <Icon name="check" size={16} />
              Got it!
            </button>
          </div>
        </div>
      ) : (
        <div className="hero-card">
          <p>
            <b>You know every word in this set.</b>{' '}
            Try the Interpreter in a real conversation.
          </p>

          <button
            className="btn soft"
            onClick={() => save({ ...st, known: [] })}
          >
            Start again
          </button>
        </div>
      )}

      <div className="row between">
        <h3 className="sec">
          {group === 'numbers'
            ? 'Numbers'
            : 'Survival essentials'}
        </h3>

        <span className="ind-t">
          {list.filter((w) => st.known.includes(w.kn)).length}
          {' / '}
          {list.length} complete
        </span>
      </div>

      <div className="tiles">
        {list.map((w, i) => (
          <button
            key={w.kn}
            className={`tile ${
              st.known.includes(w.kn) ? 'done' : ''
            }`}
            onClick={() => setCur(w.kn)}
          >
            <span className="chip mint">
              #{i + 1} {w.tag}
            </span>

            <b className="kn">{w.kn}</b>

            <span className="roman">{w.roman}</span>

            <small>{w.en}</small>

            <span className="tick">
              {st.known.includes(w.kn) && (
                <Icon name="check" size={14} />
              )}
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
