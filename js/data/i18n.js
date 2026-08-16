const UI_STRINGS = {
  fr: {
    prologue_skip: 'Passer ›',
    prologue_hint: 'cliquez pour continuer',
    game_subtitle: 'Un roman visuel',
    menu_start: 'Commencer',
    menu_map: 'Carte',
    menu_replay_prologue: 'Revoir le prologue',
    menu_options: 'Options',
    menu_gallery: 'Galerie',
    menu_credits: 'Crédits',
    menu_quit: 'Quitter',
    version_tag: 'projet original — v0.1',
    chapters_title: 'Chapitres',
    back: '‹ Retour',
    back_chapters: '‹ Chapitres',
    tab_scenario: 'Carte du scénario',
    tab_progression: 'Ma progression',
    pause_title: 'Pause',
    continue_investigation: "Continuer l'enquête",
    evidence_title: 'Analyse des preuves',
    evidence_placeholder: 'Sélectionne une preuve à examiner.',
    continue: 'Continuer',
    verdict_title: 'Le verdict',
    hud_auto: 'Auto',
    hud_history: 'Hist.',
    hud_save: 'Sauv.',
    options_title: 'Options',
    opt_autoread: 'Lecture automatique (voix)',
    opt_autoread_hint: "Le texte est lu à voix haute et s'enchaîne seul : vous pouvez simplement écouter.",
    opt_speed: 'Vitesse du texte',
    opt_speed_slow: 'Lent',
    opt_speed_normal: 'Normal',
    opt_speed_fast: 'Rapide',
    opt_music: 'Musique',
    opt_sfx: 'Effets sonores',
    opt_language: 'Langue',
    opt_reset: 'Réinitialiser la progression',
    gallery_title: 'Galerie',
    gallery_text: 'Les illustrations débloquées apparaîtront ici au fil de votre progression.',
    credits_title: 'Crédits',
    credits_text: "Ombres d'Encre — projet original<br/>Scénario, code et direction artistique en développement.",
    history_title: 'Historique',
    history_text: "L'historique des dialogues sera disponible dans une prochaine itération.",
    pause_heading: 'Pause',
    pause_resume: 'Reprendre',
    pause_back: '‹ Revenir en arrière',
    pause_save: 'Sauvegarder',
    pause_chapters: 'Chapitres',
    pause_mainmenu: 'Menu principal',
    toast_saved: 'Partie sauvegardée.',
    toast_quit: "Merci d'avoir joué à Ombres d'Encre.",
    toast_reset: 'Progression réinitialisée. Rechargez la page.',
    result_continue: 'Continuer',
    result_back_chapters: 'Retour aux chapitres',
    trail_progress_label: 'Chapitre'
  },
  en: {
    prologue_skip: 'Skip ›',
    prologue_hint: 'click to continue',
    game_subtitle: 'A visual novel',
    menu_start: 'Start',
    menu_map: 'Map',
    menu_replay_prologue: 'Replay prologue',
    menu_options: 'Options',
    menu_gallery: 'Gallery',
    menu_credits: 'Credits',
    menu_quit: 'Quit',
    version_tag: 'original project — v0.1',
    chapters_title: 'Chapters',
    back: '‹ Back',
    back_chapters: '‹ Chapters',
    tab_scenario: 'Story map',
    tab_progression: 'My progress',
    pause_title: 'Pause',
    continue_investigation: 'Continue investigating',
    evidence_title: 'Evidence review',
    evidence_placeholder: 'Select a piece of evidence to examine.',
    continue: 'Continue',
    verdict_title: 'The verdict',
    hud_auto: 'Auto',
    hud_history: 'Log',
    hud_save: 'Save',
    options_title: 'Options',
    opt_autoread: 'Auto-read (voice)',
    opt_autoread_hint: "Text is read aloud and advances on its own: you can just listen.",
    opt_speed: 'Text speed',
    opt_speed_slow: 'Slow',
    opt_speed_normal: 'Normal',
    opt_speed_fast: 'Fast',
    opt_music: 'Music',
    opt_sfx: 'Sound effects',
    opt_language: 'Language',
    opt_reset: 'Reset progress',
    gallery_title: 'Gallery',
    gallery_text: 'Unlocked illustrations will appear here as you progress.',
    credits_title: 'Credits',
    credits_text: "Ombres d'Encre — original project<br/>Story, code, and art direction in progress.",
    history_title: 'Log',
    history_text: 'The dialogue log will be available in a future update.',
    pause_heading: 'Pause',
    pause_resume: 'Resume',
    pause_back: '‹ Go back',
    pause_save: 'Save',
    pause_chapters: 'Chapters',
    pause_mainmenu: 'Main menu',
    toast_saved: 'Game saved.',
    toast_quit: 'Thanks for playing Ombres d\u2019Encre.',
    toast_reset: 'Progress reset. Reload the page.',
    result_continue: 'Continue',
    result_back_chapters: 'Back to chapters',
    trail_progress_label: 'Chapter'
  }
};

const I18n = (() => {
  function getLang() {
    try {
      return SaveManager.loadOptions().language === 'en' ? 'en' : 'fr';
    } catch (e) {
      return 'fr';
    }
  }

  function setLang(lang) {
    const options = SaveManager.loadOptions();
    options.language = lang === 'en' ? 'en' : 'fr';
    SaveManager.saveOptions(options);
  }

  function t(key) {
    const lang = getLang();
    return (UI_STRINGS[lang] && UI_STRINGS[lang][key]) || UI_STRINGS.fr[key] || key;
  }

  function text(field) {
    if (field == null) return '';
    if (typeof field === 'string') return field;
    const lang = getLang();
    return field[lang] || field.fr || '';
  }

  function applyStaticUI() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.innerHTML = t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      el.setAttribute('title', t(el.dataset.i18nTitle));
    });
    document.documentElement.lang = getLang();
  }

  return { getLang, setLang, t, text, applyStaticUI };
})();

window.I18n = I18n;
