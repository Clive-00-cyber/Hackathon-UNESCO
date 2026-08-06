const DialogueEngine = (() => {
  let lines = [];
  let index = 0;
  let typing = false;
  let typeTimer = null;
  let autoAdvanceTimer = null;
  let onComplete = null;

  // vitesse d'affichage du texte, en ms par caractère (mode manuel)
  const SPEEDS = { lent: 45, normal: 24, rapide: 10 };
  const AUTO_PAUSE_MS = 900; // pause entre deux lignes en mode automatique
  const FALLBACK_MS_PER_CHAR = 55; // si la synthèse vocale est indisponible

  // Réglages de la voix : plus grave et plus lente = plus pesante / intrigante,
  // que la voix disponible soit masculine ou féminine.
  const VOICE_PITCH = 0.82;
  const VOICE_RATE = 0.87;

  const els = {};
  let frenchVoice = null;

  function bindDOM() {
    els.nameTag = document.getElementById('dlg-name');
    els.nameBox = document.getElementById('dlg-name-box');
    els.text = document.getElementById('dlg-text');
    els.box = document.getElementById('dialogue-box');
    els.advanceHint = document.getElementById('dlg-advance-hint');
    els.autoBtn = document.getElementById('btn-auto');

    if ('speechSynthesis' in window) {
      const pickVoice = () => {
        const voices = window.speechSynthesis.getVoices();
        const frenchVoices = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith('fr'));
        // Heuristique simple : on préfère un nom qui laisse deviner un
        // registre plus grave/posé si plusieurs voix françaises existent ;
        // à défaut, la première voix française disponible.
        frenchVoice = frenchVoices.find(v => /thomas|paul|male|homme/i.test(v.name))
          || frenchVoices[0]
          || null;
      };
      pickVoice();
      window.speechSynthesis.onvoiceschanged = pickVoice;
    }

    if (els.autoBtn) {
      els.autoBtn.addEventListener('click', () => toggleAutoRead());
      refreshAutoBtn();
    }
  }

  function isAutoReadEnabled() {
    return SaveManager.loadOptions().autoRead === true;
  }

  function setAutoRead(enabled) {
    const options = SaveManager.loadOptions();
    options.autoRead = enabled;
    SaveManager.saveOptions(options);
    refreshAutoBtn();
    const checkbox = document.getElementById('opt-auto-read');
    if (checkbox) checkbox.checked = enabled;
  }

  function toggleAutoRead() {
    setAutoRead(!isAutoReadEnabled());
    // si une ligne est déjà affichée, on relance son traitement dans le nouveau mode
    if (lines.length && index < lines.length) {
      clearTimeout(typeTimer);
      clearTimeout(autoAdvanceTimer);
      stopSpeech();
      renderLine();
    }
  }

  function refreshAutoBtn() {
    if (!els.autoBtn) return;
    els.autoBtn.classList.toggle('active', isAutoReadEnabled());
  }

  function start(lineList, completeCallback) {
    if (!els.text) bindDOM();
    lines = lineList || [];
    index = 0;
    onComplete = completeCallback || null;
    refreshAutoBtn();
    renderLine();
  }

  function currentSpeed() {
    const opts = SaveManager.loadOptions();
    return SPEEDS[opts.textSpeed] || SPEEDS.normal;
  }

  function renderLine() {
    clearTimeout(typeTimer);
    clearTimeout(autoAdvanceTimer);
    stopSpeech();

    if (index >= lines.length) {
      if (onComplete) onComplete();
      return;
    }
    const line = lines[index];

    if (line.who) {
      els.nameBox.style.visibility = 'visible';
      els.nameTag.textContent = line.who;
    } else {
      els.nameBox.style.visibility = 'hidden';
    }

    if (isAutoReadEnabled()) {
      playAutoLine(line.text);
    } else {
      typeText(line.text);
    }
  }

  //  Mode manuel : machine à écrire 
  function typeText(fullText) {
    typing = true;
    els.text.textContent = '';
    els.advanceHint.style.opacity = '0';
    let i = 0;
    const speed = currentSpeed();

    function tick() {
      if (!typing) return;
      els.text.textContent = fullText.slice(0, i + 1);
      i++;
      if (i < fullText.length) {
        typeTimer = setTimeout(tick, speed);
      } else {
        finishTyping(fullText);
      }
    }
    tick();
  }

  function finishTyping(fullText) {
    typing = false;
    els.text.textContent = fullText;
    els.advanceHint.style.opacity = '1';
  }

  // ---- Mode automatique : voix + enchaînement seul ----------------
  function playAutoLine(fullText) {
    typing = false;
    els.text.textContent = fullText;
    els.advanceHint.style.opacity = '1';
    els.advanceHint.classList.add('listening');

    const canSpeak = 'speechSynthesis' in window;
    if (canSpeak) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(fullText);
      utter.lang = 'fr-FR';
      if (frenchVoice) utter.voice = frenchVoice;
      utter.pitch = VOICE_PITCH;
      utter.rate = VOICE_RATE;
      utter.onend = () => scheduleAutoAdvance();
      utter.onerror = () => scheduleAutoAdvance();
      window.speechSynthesis.speak(utter);
    } else {
      // pas de synthèse vocale disponible : on estime un temps de lecture
      const estimated = Math.max(1200, fullText.length * FALLBACK_MS_PER_CHAR);
      autoAdvanceTimer = setTimeout(() => scheduleAutoAdvance(), estimated);
    }
  }

  function scheduleAutoAdvance() {
    els.advanceHint.classList.remove('listening');
    autoAdvanceTimer = setTimeout(() => {
      index++;
      renderLine();
    }, AUTO_PAUSE_MS);
  }

  function stopSpeech() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  // Appelé au clic / à la touche Espace sur la boîte de dialogue
  function advance() {
    if (isAutoReadEnabled()) {
      // en mode automatique, un clic saute directement à la ligne suivante
      clearTimeout(autoAdvanceTimer);
      stopSpeech();
      index++;
      renderLine();
      return;
    }
    if (typing) {
      typing = false;
      els.text.textContent = lines[index].text;
      els.advanceHint.style.opacity = '1';
      return;
    }
    index++;
    renderLine();
  }

  function isTyping() {
    return typing;
  }

  function stop() {
    clearTimeout(typeTimer);
    clearTimeout(autoAdvanceTimer);
    stopSpeech();
  }

  // Appelée à la reprise après une pause : en mode manuel, il n'y a rien
  // à relancer (le clic suivant reprend naturellement) ; en mode lecture
  // automatique, on rejoue la ligne en cours pour ne pas laisser le
  // joueur bloqué en silence.
  function resume() {
    if (isAutoReadEnabled() && lines.length && index < lines.length) {
      renderLine();
    }
  }

  return { start, advance, isTyping, bindDOM, setAutoRead, toggleAutoRead, isAutoReadEnabled, stop, resume };
})();

window.DialogueEngine = DialogueEngine;
