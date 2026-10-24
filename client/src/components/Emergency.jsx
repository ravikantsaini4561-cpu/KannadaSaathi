import { useEffect, useState } from 'react';
import { getPhrases } from '../api.js';
import { canSpeak, speak } from '../speech.js';
import { useLang } from '../i18n.jsx';
import Icon from './Icon.jsx';

const KEY = 'ks-sos';

const load = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
};

export default function Emergency({ onShow, rate }) {
  const { t } = useLang();

  const [phrases, setPhrases] = useState([]);
  const [me, setMe] = useState(load);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getPhrases({ category: 'emergency' })
      .then(setPhrases)
      .catch(() => {
        setError('Could not load emergency phrases. Check your connection.');
      });
  }, []);

  const set = (key) => (event) => {
    setMe((previous) => ({
      ...previous,
      [key]: event.target.value
    }));
    setSaved(false);
  };

  const save = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify(me));
      setSaved(true);
      setError('');
    } catch {
      setError('Could not save details on this device.');
    }
  };

  const hasInfo = me.name || me.blood || me.allergy || me.contact;

  return (
    <section
      aria-label={t('sos_h')}
      className="x-wrap"
    >
      <div className="x-sos">
        <h2>{t('sos_h')}</h2>

        <p>
          Keep these emergency contacts available.
          Confirm the correct service number for your location.
        </p>

        <div className="x-calls">
          <a className="btn big x-call" href="tel:112">
            <Icon name="phone" size={20} />
            Emergency 112
          </a>

          <a className="btn big x-call" href="tel:100">
            {t('sos_police')} 100
          </a>

          <a className="btn big x-call" href="tel:108">
            {t('sos_amb')} 108
          </a>
        </div>
      </div>

      {error && (
        <p className="note err" role="alert">
          {error}
        </p>
      )}

      {hasInfo && (
        <div className="x-me">
          {me.name && (
            <p>
              <b>{t('sos_name')}:</b> {me.name}
            </p>
          )}

          {me.blood && (
            <p>
              <b>{t('sos_blood')}:</b> {me.blood}
            </p>
          )}

          {me.allergy && (
            <p>
              <b>{t('sos_allergy')}:</b> {me.allergy}
            </p>
          )}

          {me.contact && (
            <p>
              <b>{t('sos_contact')}:</b> {me.contact}
            </p>
          )}
        </div>
      )}

      <h3 className="sec">{t('sos_phr')}</h3>

      {phrases.map((phrase) => (
        <article className="card" key={phrase._id}>
          <p className="kn">{phrase.kannada}</p>

          <p className="roman">
            {phrase.transliteration}
          </p>

          <div className="box">
            <p>
              <b>EN</b> {phrase.english}
            </p>

            {phrase.hindi && (
              <p>
                <b>HI</b> {phrase.hindi}
              </p>
            )}
          </div>

          <div className="row gap">
            <button
              className="btn primary"
              onClick={() => onShow(phrase)}
            >
              <Icon name="expand" size={16} />
              {t('show')}
            </button>

            {canSpeak && (
              <button
                className="btn soft"
                onClick={() =>
                  speak(phrase.kannada, 'kn-IN', rate)
                }
              >
                <Icon name="volume" size={16} />
                {t('listen')}
              </button>
            )}
          </div>
        </article>
      ))}

      <h3 className="sec">{t('sos_me')}</h3>

      <div className="x-form">
        <label>
          {t('sos_name')}
          <input
            value={me.name || ''}
            onChange={set('name')}
            maxLength={60}
          />
        </label>

        <label>
          {t('sos_blood')}
          <input
            value={me.blood || ''}
            onChange={set('blood')}
            maxLength={10}
            placeholder="O+"
          />
        </label>

        <label>
          {t('sos_allergy')}
          <input
            value={me.allergy || ''}
            onChange={set('allergy')}
            maxLength={80}
          />
        </label>

        <label>
          {t('sos_contact')}
          <input
            value={me.contact || ''}
            onChange={set('contact')}
            maxLength={60}
            inputMode="tel"
          />
        </label>

        <div className="row gap">
          <button
            className="btn primary"
            onClick={save}
          >
            {t('sos_save')}
          </button>

          {saved && (
            <span className="hint">
              {t('sos_saved')}
            </span>
          )}
        </div>

        <p className="hint">
          Personal details are stored in this browser's local storage.
          Avoid entering information on a shared device.
        </p>
      </div>
    </section>
  );
}
