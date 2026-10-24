import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';

// Interface text in English and Kannada.
// Phrase content has its own languages.
const dict = {
  en: {
    n_browse: 'Phrases',
    n_interpreter: 'Interpreter',
    n_scan: 'Scan',
    n_learn: 'Learn',
    n_more: 'More',

    t_ask: 'Ask Saathi',
    t_saved: 'Saved',
    t_practice: 'Practice',
    t_sos: 'Emergency',

    back_more: 'Back to More',
    ret: 'Return',

    search_ph: 'Search: auto, village, fever, coffee',
    daily: 'Daily essentials',
    saved_h: 'Saved phrases',
    saved_empty: 'Nothing saved yet. Tap the heart on a phrase you use often.',
    no_phrase: 'No phrase found. Try a place or a need, like bus or doctor.',
    loading: 'Loading phrases...',
    speed: 'Speed',
    all: 'All',

    magic_t: 'Ooru magic word',
    magic_b: 'Start with “ದಯವಿಟ್ಟು” (Dayavittu) = please. It softens any request or bill.',
    auto_t: 'Auto-driver mode',
    auto_b: 'Huge high-contrast Kannada when you tap Show, easy to read in sunlight.',

    offline: 'You are offline. Saved phrases and Learn still work.',
    online: 'Back online.',

    // More menu
    more_ask: 'Ask Saathi',
    more_ask_d: 'Chat for phrases and tips',
    more_practice: 'Practice talking',
    more_practice_d: 'Role-play with an auto driver, shopkeeper, doctor',
    more_sos: 'Emergency card',
    more_sos_d: 'Big Kannada help phrases and your details',
    more_saved: 'Saved phrases',
    more_saved_d: 'Your favourites, ready offline',

    lang_l: 'App language',
    pwa_l: 'Works offline',
    pwa_d: 'Add to home screen for quick access in places with weak network.',

    // Photo scan
    scan_h: 'Photo translate',
    scan_sub: 'Take a photo of a signboard, menu, bus board or notice.',
    scan_take: 'Take photo',
    scan_pick: 'Choose from gallery',
    scan_busy: 'Reading the photo...',
    scan_none: 'No readable text found. Try a closer, brighter photo.',
    scan_again: 'Scan another',

    listen: 'Listen',
    show: 'Show',
    ai_note: 'AI-generated. Please double-check important things.',

    // Practice
    pr_h: 'Practice talking',
    pr_pick: 'Choose a scene',
    pr_goal: 'Goal',
    pr_type: 'Type your reply (English or Kannada)',
    pr_try: 'You can say',
    pr_restart: 'Start again',
    pr_done: 'Scene complete. Well done!',
    pr_send: 'Send',
    pr_back: 'All scenes',

    // NEW: Practice loading message
    pr_wait: 'Preparing reply...',

    // Emergency
    sos_h: 'Emergency help',
    sos_call: 'Call',
    sos_police: 'Police',
    sos_amb: 'Ambulance',
    sos_all: 'All emergencies',
    sos_me: 'My details (saved on this phone only)',
    sos_name: 'Name',
    sos_blood: 'Blood group',
    sos_allergy: 'Allergies',
    sos_contact: 'Emergency contact',
    sos_save: 'Save',
    sos_saved: 'Saved on this phone',
    sos_phr: 'Show these to people nearby',

    // Quiz
    quiz: 'Quiz',
    quiz_q: 'What does this mean?',
    quiz_score: 'Your score',
    quiz_best: 'Best',
    quiz_again: 'Play again',
    quiz_exit: 'Back to Learn',
    quiz_next: 'Next'
  },

  kn: {
    n_browse: 'ನುಡಿಗಟ್ಟು',
    n_interpreter: 'ಅನುವಾದಕ',
    n_scan: 'ಸ್ಕ್ಯಾನ್',
    n_learn: 'ಕಲಿಯಿರಿ',
    n_more: 'ಇನ್ನಷ್ಟು',

    t_ask: 'ಸಾಥಿಯನ್ನು ಕೇಳಿ',
    t_saved: 'ಉಳಿಸಿದ್ದು',
    t_practice: 'ಅಭ್ಯಾಸ',
    t_sos: 'ತುರ್ತು',

    back_more: 'ಇನ್ನಷ್ಟು ಪುಟಕ್ಕೆ',
    ret: 'ಹಿಂದೆ',

    search_ph: 'ಹುಡುಕಿ: ಆಟೋ, ಹಳ್ಳಿ, ಜ್ವರ, ಕಾಫಿ',
    daily: 'ದೈನಂದಿನ ಅಗತ್ಯಗಳು',
    saved_h: 'ಉಳಿಸಿದ ನುಡಿಗಟ್ಟುಗಳು',
    saved_empty: 'ಇನ್ನೂ ಏನೂ ಉಳಿಸಿಲ್ಲ. ನಿಮಗೆ ಇಷ್ಟವಾದ ನುಡಿಗಟ್ಟಿನ ಹೃದಯ ಒತ್ತಿ.',
    no_phrase: 'ಯಾವುದೂ ಸಿಗಲಿಲ್ಲ. ಬಸ್ ಅಥವಾ ವೈದ್ಯ ಎಂದು ಹುಡುಕಿ.',
    loading: 'ನುಡಿಗಟ್ಟುಗಳು ಲೋಡ್ ಆಗುತ್ತಿವೆ...',
    speed: 'ವೇಗ',
    all: 'ಎಲ್ಲಾ',

    magic_t: 'ಊರ ಮಂತ್ರ ಪದ',
    magic_b: '“ದಯವಿಟ್ಟು” (Dayavittu) ಎಂದು ಶುರು ಮಾಡಿ. ಯಾವುದೇ ಕೋರಿಕೆ ಮೃದುವಾಗುತ್ತದೆ.',
    auto_t: 'ಆಟೋ ಚಾಲಕ ಮೋಡ್',
    auto_b: 'ತೋರಿಸಿ ಒತ್ತಿದಾಗ ದೊಡ್ಡ ಕನ್ನಡ ಅಕ್ಷರ, ಬಿಸಿಲಲ್ಲೂ ಓದಲು ಸುಲಭ.',

    offline: 'ನೀವು ಆಫ್‌ಲೈನ್ ಇದ್ದೀರಿ. ಉಳಿಸಿದ ನುಡಿಗಟ್ಟು ಮತ್ತು ಕಲಿಕೆ ಕೆಲಸ ಮಾಡುತ್ತವೆ.',
    online: 'ಮತ್ತೆ ಆನ್‌ಲೈನ್ ಆಗಿದ್ದೀರಿ.',

    // More menu
    more_ask: 'ಸಾಥಿಯನ್ನು ಕೇಳಿ',
    more_ask_d: 'ನುಡಿಗಟ್ಟು ಮತ್ತು ಸಲಹೆಗಳಿಗೆ ಚಾಟ್',
    more_practice: 'ಮಾತಾಡಿ ಅಭ್ಯಾಸ',
    more_practice_d: 'ಆಟೋ ಚಾಲಕ, ಅಂಗಡಿಯವರು, ವೈದ್ಯರ ಜೊತೆ ಪಾತ್ರಾಭಿನಯ',
    more_sos: 'ತುರ್ತು ಕಾರ್ಡ್',
    more_sos_d: 'ದೊಡ್ಡ ಕನ್ನಡ ಸಹಾಯ ವಾಕ್ಯಗಳು ಮತ್ತು ನಿಮ್ಮ ಮಾಹಿತಿ',
    more_saved: 'ಉಳಿಸಿದ ನುಡಿಗಟ್ಟುಗಳು',
    more_saved_d: 'ನಿಮ್ಮ ಮೆಚ್ಚಿನವು, ಆಫ್‌ಲೈನ್‌ನಲ್ಲೂ ಲಭ್ಯ',

    lang_l: 'ಆ್ಯಪ್ ಭಾಷೆ',
    pwa_l: 'ಆಫ್‌ಲೈನ್ ಕೆಲಸ ಮಾಡುತ್ತದೆ',
    pwa_d: 'ನೆಟ್‌ವರ್ಕ್ ಕಡಿಮೆ ಇರುವಲ್ಲಿ ಹೋಂ ಸ್ಕ್ರೀನ್‌ಗೆ ಸೇರಿಸಿ.',

    // Photo scan
    scan_h: 'ಫೋಟೋ ಅನುವಾದ',
    scan_sub: 'ಫಲಕ, ಮೆನು, ಬಸ್ ಬೋರ್ಡ್ ಅಥವಾ ಸೂಚನೆಯ ಫೋಟೋ ತೆಗೆಯಿರಿ.',
    scan_take: 'ಫೋಟೋ ತೆಗೆಯಿರಿ',
    scan_pick: 'ಗ್ಯಾಲರಿಯಿಂದ ಆರಿಸಿ',
    scan_busy: 'ಫೋಟೋ ಓದುತ್ತಿದೆ...',
    scan_none: 'ಓದಬಹುದಾದ ಪಠ್ಯ ಸಿಗಲಿಲ್ಲ. ಹತ್ತಿರದಿಂದ, ಬೆಳಕಿನಲ್ಲಿ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    scan_again: 'ಇನ್ನೊಂದು ಸ್ಕ್ಯಾನ್',

    listen: 'ಆಲಿಸಿ',
    show: 'ತೋರಿಸಿ',
    ai_note: 'ಇದು AI ಉತ್ತರ. ಮುಖ್ಯ ವಿಷಯಗಳನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.',

    // Practice
    pr_h: 'ಮಾತಾಡಿ ಅಭ್ಯಾಸ',
    pr_pick: 'ಒಂದು ಸನ್ನಿವೇಶ ಆರಿಸಿ',
    pr_goal: 'ಗುರಿ',
    pr_type: 'ನಿಮ್ಮ ಉತ್ತರ ಬರೆಯಿರಿ (ಇಂಗ್ಲಿಷ್ ಅಥವಾ ಕನ್ನಡ)',
    pr_try: 'ಹೀಗೆ ಹೇಳಬಹುದು',
    pr_restart: 'ಮತ್ತೆ ಶುರು',
    pr_done: 'ಸನ್ನಿವೇಶ ಮುಗಿಯಿತು. ಚೆನ್ನಾಗಿ ಮಾಡಿದ್ದೀರಿ!',
    pr_send: 'ಕಳುಹಿಸಿ',
    pr_back: 'ಎಲ್ಲಾ ಸನ್ನಿವೇಶ',

    // NEW: Practice loading message
    pr_wait: 'ಉತ್ತರ ಸಿದ್ಧಪಡಿಸಲಾಗುತ್ತಿದೆ...',

    // Emergency
    sos_h: 'ತುರ್ತು ಸಹಾಯ',
    sos_call: 'ಕರೆ ಮಾಡಿ',
    sos_police: 'ಪೊಲೀಸ್',
    sos_amb: 'ಆಂಬ್ಯುಲೆನ್ಸ್',
    sos_all: 'ಎಲ್ಲಾ ತುರ್ತು ವಾಕ್ಯಗಳು',
    sos_me: 'ನನ್ನ ಮಾಹಿತಿ (ಈ ಫೋನ್‌ನಲ್ಲಿ ಮಾತ್ರ ಉಳಿಯುತ್ತದೆ)',
    sos_name: 'ಹೆಸರು',
    sos_blood: 'ರಕ್ತದ ಗುಂಪು',
    sos_allergy: 'ಅಲರ್ಜಿ',
    sos_contact: 'ತುರ್ತು ಸಂಪರ್ಕ',
    sos_save: 'ಉಳಿಸಿ',
    sos_saved: 'ಈ ಫೋನ್‌ನಲ್ಲಿ ಉಳಿಸಲಾಗಿದೆ',
    sos_phr: 'ಹತ್ತಿರದವರಿಗೆ ಇವನ್ನು ತೋರಿಸಿ',

    // Quiz
    quiz: 'ರಸಪ್ರಶ್ನೆ',
    quiz_q: 'ಇದರ ಅರ್ಥವೇನು?',
    quiz_score: 'ನಿಮ್ಮ ಅಂಕ',
    quiz_best: 'ಅತ್ಯುತ್ತಮ',
    quiz_again: 'ಮತ್ತೆ ಆಡಿ',
    quiz_exit: 'ಕಲಿಕೆಗೆ ಹಿಂತಿರುಗಿ',
    quiz_next: 'ಮುಂದೆ'
  }
};

const Ctx = createContext({
  lang: 'en',
  setLang: () => {},
  t: (key) => key
});

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('ks-lang') === 'kn'
        ? 'kn'
        : 'en';
    } catch {
      return 'en';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('ks-lang', lang);
    } catch {
      // Storage may be unavailable.
    }

    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t: (key) => dict[lang][key] ?? dict.en[key] ?? key
    }),
    [lang]
  );

  return (
    <Ctx.Provider value={value}>
      {children}
    </Ctx.Provider>
  );
}

export const useLang = () => useContext(Ctx);