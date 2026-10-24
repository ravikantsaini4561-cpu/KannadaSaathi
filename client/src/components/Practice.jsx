import { useEffect, useRef, useState } from 'react';
import { getScenarios, roleplay } from '../api.js';
import { canSpeak, speak, stopSpeaking } from '../speech.js';
import { useLang } from '../i18n.jsx';
import Icon from './Icon.jsx';

// Convert visible conversation turns to backend history.
const toHistory = (turns) =>
  turns.map((turn) =>
    turn.from === 'bot'
      ? {
          role: 'assistant',
          content: `${turn.kannada} (${turn.english})`
        }
      : {
          role: 'user',
          content: turn.text
        }
  );

export default function Practice({ rate }) {
  const { t } = useLang();

  const [scenes, setScenes] = useState([]);
  const [scene, setScene] = useState(null);
  const [turns, setTurns] = useState([]);
  const [tips, setTips] = useState([]);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [err, setErr] = useState('');

  const end = useRef(null);
  const run = useRef(0);

  useEffect(() => {
    let active = true;

    getScenarios()
      .then((result) => {
        if (active) setScenes(result);
      })
      .catch((error) => {
        if (active) setErr(error.message);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    end.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end'
    });
  }, [turns, busy]);

  useEffect(() => {
    return () => {
      run.current += 1;
      stopSpeaking();
    };
  }, []);

  async function sendTurn(sceneId, history, message) {
    const requestId = ++run.current;

    setBusy(true);
    setErr('');

    try {
      const result = await roleplay(
        sceneId,
        history,
        message
      );

      if (requestId !== run.current) return;

      setTurns((previous) => {
        const next = [...previous];

        if (result.feedback) {
          for (let i = next.length - 1; i >= 0; i--) {
            if (next[i].from === 'me') {
              next[i] = {
                ...next[i],
                feedback: result.feedback
              };
              break;
            }
          }
        }

        return [
          ...next,
          {
            from: 'bot',
            kannada: result.kannada,
            reading: result.reading,
            english: result.english
          }
        ];
      });

      setTips(result.suggestions || []);
      setDone(Boolean(result.done));

      if (canSpeak && result.kannada) {
        speak(result.kannada, 'kn-IN', rate).catch(() => {});
      }
    } catch (error) {
      if (requestId === run.current) {
        setErr(error.message);
      }
    } finally {
      if (requestId === run.current) {
        setBusy(false);
      }
    }
  }

  function start(selectedScene) {
    run.current += 1;
    stopSpeaking();

    setScene(selectedScene);
    setTurns([]);
    setTips([]);
    setDone(false);
    setText('');
    setErr('');

    sendTurn(selectedScene.id, [], '');
  }

  function send(raw, reading = '') {
    const message = raw.trim();

    if (
      !message ||
      busy ||
      done ||
      !scene
    ) {
      return;
    }

    stopSpeaking();

    const history = toHistory(turns);

    setTurns((previous) => [
      ...previous,
      {
        from: 'me',
        text: message,
        reading
      }
    ]);

    setText('');
    setTips([]);

    sendTurn(scene.id, history, message);
  }

  function back() {
    run.current += 1;
    stopSpeaking();

    setScene(null);
    setTurns([]);
    setTips([]);
    setBusy(false);
    setDone(false);
    setErr('');
    setText('');
  }

  // Scene selection screen.
  if (!scene) {
    return (
      <section
        aria-label={t('pr_h')}
        className="x-wrap"
      >
        <div className="hero-card">
          <h2>{t('pr_h')}</h2>
          <p>{t('pr_pick')}</p>
        </div>

        {err && (
          <p className="note err" role="alert">
            {err}
          </p>
        )}

        <div className="x-grid">
          {scenes.map((item) => (
            <button
              key={item.id}
              className="x-tile"
              onClick={() => start(item)}
            >
              <span
                className="x-emoji"
                aria-hidden="true"
              >
                {item.icon}
              </span>

              <b>{item.title}</b>
              <small>{item.goal}</small>
            </button>
          ))}
        </div>
      </section>
    );
  }

  // Conversation screen.
  return (
    <section
      aria-label={scene.title}
      className="x-wrap"
    >
      <div className="row between">
        <button
          className="btn soft"
          onClick={back}
        >
          <Icon name="arrowLeft" size={16} />
          {t('pr_back')}
        </button>

        <button
          className="chip ind"
          onClick={() => start(scene)}
          disabled={busy}
        >
          {t('pr_restart')}
        </button>
      </div>

      <div className="hero-card">
        <b>
          {scene.icon} {scene.title}
        </b>

        <p>
          {t('pr_goal')}: {scene.goal}
        </p>
      </div>

      <div
        className="x-chat"
        aria-live="polite"
      >
        {turns.map((message, index) =>
          message.from === 'bot' ? (
            <div
              key={index}
              className="x-bubble bot"
            >
              <p className="kn">
                {message.kannada}
              </p>

              {message.reading && (
                <p className="roman">
                  {message.reading}
                </p>
              )}

              {message.english && (
                <p className="x-en">
                  {message.english}
                </p>
              )}

              {canSpeak && (
                <button
                  className="iconbtn sm"
                  onClick={() =>
                    speak(
                      message.kannada,
                      'kn-IN',
                      rate
                    ).catch(() => {})
                  }
                  aria-label={t('listen')}
                >
                  <Icon name="volume" size={16} />
                </button>
              )}
            </div>
          ) : (
            <div
              key={index}
              className="x-bubble me"
            >
              <p>{message.text}</p>

              {message.reading && (
                <p className="x-en">
                  {message.reading}
                </p>
              )}

              {message.feedback && (
                <p className="x-fb">
                  💡 {message.feedback}
                </p>
              )}
            </div>
          )
        )}

        {busy && (
          <p className="note" role="status">
            {t('pr_wait') === 'pr_wait'
              ? 'Preparing reply…'
              : t('pr_wait')}
          </p>
        )}

        {done && (
          <p className="note ok" role="status">
            {t('pr_done')}
          </p>
        )}

        {err && (
          <p className="note err" role="alert">
            {err}
          </p>
        )}

        <div ref={end} />
      </div>

      {tips.length > 0 && !done && (
        <div>
          <p className="hint">{t('pr_try')}</p>

          <div className="x-tips">
            {tips.map((tip, index) => (
              <button
                key={index}
                className="x-tip"
                onClick={() =>
                  send(tip.kannada, tip.reading)
                }
                disabled={busy}
              >
                <span className="kn-s">
                  {tip.kannada}
                </span>

                {tip.reading && (
                  <small>{tip.reading}</small>
                )}

                {tip.english && (
                  <small>{tip.english}</small>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {!done && (
        <form
          className="x-input"
          onSubmit={(event) => {
            event.preventDefault();
            send(text);
          }}
        >
          <input
            value={text}
            maxLength={200}
            onChange={(event) =>
              setText(event.target.value)
            }
            placeholder={t('pr_type')}
            aria-label={t('pr_type')}
            disabled={busy}
          />

          <button
            className="btn primary"
            type="submit"
            disabled={busy || !text.trim()}
          >
            <Icon name="send" size={16} />
            {t('pr_send')}
          </button>
        </form>
      )}
    </section>
  );
}