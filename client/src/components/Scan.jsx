import { useRef, useState } from 'react';
import { scanImage } from '../api.js';
import { canSpeak, speak } from '../speech.js';
import { useLang } from '../i18n.jsx';
import Icon from './Icon.jsx';

// Compress the selected photo before sending it to the AI.
function compress(file, max = 1280) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      const scale = Math.min(
        1,
        max / Math.max(img.width, img.height)
      );

      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);

      const context = canvas.getContext('2d');

      if (!context) {
        URL.revokeObjectURL(url);
        reject(new Error('Could not process this photo.'));
        return;
      }

      context.drawImage(
        img,
        0,
        0,
        canvas.width,
        canvas.height
      );

      URL.revokeObjectURL(url);

      resolve(canvas.toDataURL('image/jpeg', 0.82));
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not open that photo.'));
    };

    img.src = url;
  });
}

export default function Scan({ onShow, rate }) {
  const { t } = useLang();

  const cam = useRef(null);
  const gal = useRef(null);

  const [preview, setPreview] = useState('');
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState(null);
  const [err, setErr] = useState('');

  async function pick(e) {
    const file = e.target.files?.[0];

    e.target.value = '';

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErr('Please select an image file.');
      return;
    }

    setErr('');
    setRes(null);
    setBusy(true);

    try {
      const data = await compress(file);

      setPreview(data);

      const result = await scanImage(data);

      setRes(result);
    } catch (error) {
      setErr(
        error.message || 'Something went wrong. Try again.'
      );
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setPreview('');
    setRes(null);
    setErr('');
  }

  return (
    <section
      aria-label={t('scan_h')}
      className="x-wrap"
    >
      <div className="hero-card">
        <h2>{t('scan_h')}</h2>

        <p>{t('scan_sub')}</p>

        <div className="row gap x-wrapbtn">
          <button
            className="btn primary"
            onClick={() => cam.current?.click()}
            disabled={busy}
          >
            <Icon name="camera" size={16} />
            {t('scan_take')}
          </button>

          <button
            className="btn soft"
            onClick={() => gal.current?.click()}
            disabled={busy}
          >
            {t('scan_pick')}
          </button>
        </div>

        <input
          ref={cam}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={pick}
        />

        <input
          ref={gal}
          type="file"
          accept="image/*"
          hidden
          onChange={pick}
        />
      </div>

      {preview && (
        <img
          className="x-preview"
          src={preview}
          alt="Selected photo"
        />
      )}

      {busy && (
        <p className="note" role="status">
          {t('scan_busy')}
        </p>
      )}

      {err && (
        <p className="note err" role="alert">
          {err}
        </p>
      )}

      {res && (
        <>
          {res.scene && (
            <h3 className="sec">{res.scene}</h3>
          )}

          {res.items?.length === 0 && (
            <p className="note">
              {res.advice || t('scan_none')}
            </p>
          )}

          {res.items?.map((item, index) => (
            <article className="card" key={index}>
              <p className="kn">{item.kannada}</p>

              {item.reading && (
                <p className="roman">{item.reading}</p>
              )}

              <div className="box">
                {item.english && (
                  <p>
                    <b>EN</b> {item.english}
                  </p>
                )}

                {item.hindi && (
                  <p>
                    <b>HI</b> {item.hindi}
                  </p>
                )}
              </div>

              <div className="row gap">
                {canSpeak && (
                  <button
                    className="btn primary"
                    onClick={() =>
                      speak(item.kannada, 'kn-IN', rate)
                    }
                  >
                    <Icon name="volume" size={16} />
                    {t('listen')}
                  </button>
                )}

                <button
                  className="btn soft"
                  onClick={() =>
                    onShow({
                      kannada: item.kannada,
                      english: item.english
                    })
                  }
                >
                  <Icon name="expand" size={16} />
                  {t('show')}
                </button>
              </div>
            </article>
          ))}

          {res.items?.length > 0 && res.advice && (
            <div className="magic">
              <Icon name="bulb" size={24} />
              <p>{res.advice}</p>
            </div>
          )}

          {res.warning && (
            <p className="note err">{res.warning}</p>
          )}

          <p className="hint">{t('ai_note')}</p>

          <button
            className="btn soft"
            onClick={reset}
          >
            {t('scan_again')}
          </button>
        </>
      )}
    </section>
  );
}