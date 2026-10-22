import { useEffect } from 'react';

export default function ShowMode({ phrase, onClose, contrast }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className={`show ${contrast ? 'contrast' : ''}`} role="dialog" aria-label="Phrase to show">
      <p className="show-hint">Show this screen to the other person</p>
      <p className="show-kn">{phrase.kannada}</p>
      {phrase.english && <p className="show-en">{phrase.english}</p>}
      <button className="btn primary big" onClick={onClose}>Close</button>
    </div>
  );
}
