import { useEffect, useState } from 'react';
import { useLang } from '../i18n.jsx';
import Icon from './Icon.jsx';

export default function More({ go, savedCount }) {
  const { t, lang, setLang } = useLang();

  const [installEvt, setInstallEvt] = useState(
    window.__ksInstall || null
  );

  useEffect(() => {
    const onInstall = () => {
      setInstallEvt(window.__ksInstall || null);
    };

    window.addEventListener('ks-install', onInstall);

    return () => {
      window.removeEventListener('ks-install', onInstall);
    };
  }, []);

  const install = async () => {
    if (!installEvt) return;

    installEvt.prompt();

    await installEvt.userChoice.catch(() => {});

    window.__ksInstall = null;
    setInstallEvt(null);
  };

  const items = [
    ['ask', 'spark', 'more_ask', 'more_ask_d'],
    ['practice', 'mic', 'more_practice', 'more_practice_d'],
    ['sos', 'alert', 'more_sos', 'more_sos_d'],
    ['saved', 'heart', 'more_saved', 'more_saved_d']
  ];

  return (
    <section
      className="x-wrap"
      aria-label={t('n_more')}
    >
      <div className="x-list">
        {items.map(([id, icon, title, desc]) => (
          <button
            key={id}
            className={`x-row${id === 'sos' ? ' sos' : ''}`}
            onClick={() => go(id)}
          >
            <span className="avatar sm">
              <Icon name={icon} size={22} />
            </span>

            <span className="x-rowt">
              <b>
                {t(title)}
                {id === 'saved' && savedCount
                  ? ` (${savedCount})`
                  : ''}
              </b>

              <small>{t(desc)}</small>
            </span>
          </button>
        ))}
      </div>

      <div className="card">
        <div className="row between">
          <b>
            <Icon name="globe" size={16} />
            {' '}{t('lang_l')}
          </b>

          <div
            className="x-seg"
            role="group"
            aria-label={t('lang_l')}
          >
            <button
              className={lang === 'en' ? 'on' : ''}
              onClick={() => setLang('en')}
              aria-pressed={lang === 'en'}
            >
              English
            </button>

            <button
              className={lang === 'kn' ? 'on' : ''}
              onClick={() => setLang('kn')}
              aria-pressed={lang === 'kn'}
            >
              ಕನ್ನಡ
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <b>{t('pwa_l')}</b>

        <p className="hint">{t('pwa_d')}</p>

        {installEvt && (
          <button
            className="btn primary"
            onClick={install}
          >
            Install
          </button>
        )}
      </div>
    </section>
  );
}