const DialogueEngine = (() => {
  let lines = [];
  let index = 0;
  let typing = false;
  let typeTimer = null;
  let autoAdvanceTimer = null;
  let onComplete = null;
  let onLineChange = null;

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
    els.audioEl = document.getElementById('dlg-voice-audio');

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

  function start(lineList, completeCallback, lineChangeCallback) {
    if (!els.text) bindDOM();
    lines = lineList || [];
    index = 0;
    onComplete = completeCallback || null;
    onLineChange = lineChangeCallback || null;
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

    if (onLineChange) onLineChange(line, index);

    const who = window.I18n ? I18n.text(line.who) : line.who;
    if (who) {
      els.nameBox.style.visibility = 'visible';
      els.nameTag.textContent = who;
    } else {
      els.nameBox.style.visibility = 'hidden';
    }

    const lineText = window.I18n ? I18n.text(line.text) : line.text;
    const lineAudio = window.I18n ? I18n.text(line.audio) : line.audio;
    if (isAutoReadEnabled()) {
      playAutoLine(lineText, lineAudio);
    } else {
      typeText(lineText);
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
  let speechToken = 0;   // incrémenté à chaque nouvelle ligne ou arrêt :
                          // invalide tout speak()/onend/audio en vol venant d'avant
  let speakDelayTimer = null;

  function playAutoLine(fullText, audioPath) {
    typing = false;
    els.text.textContent = fullText;
    els.advanceHint.style.opacity = '1';
    els.advanceHint.classList.add('listening');

    const myToken = ++speechToken;

    if (audioPath && els.audioEl) {
      playRecordedAudio(audioPath, myToken, () => speakWithTTS(fullText, myToken));
    } else {
      speakWithTTS(fullText, myToken);
    }
  }

  // Voix enregistrée (fichier réel) : priorité sur la synthèse vocale quand
  // une ligne en fournit une. Si le fichier est absent, corrompu, ou que la
  // lecture échoue pour une autre raison, on retombe silencieusement sur la
  // synthèse vocale — aucune ligne ne reste muette.
  function playRecordedAudio(path, myToken, onFallback) {
    const audioEl = els.audioEl;
    audioEl.onended = null;
    audioEl.onerror = null;
    try { audioEl.pause(); } catch (e) {}
    audioEl.currentTime = 0;
    audioEl.src = path;

    audioEl.onended = () => {
      if (myToken !== speechToken) return; // ligne dépassée entre-temps (skip)
      scheduleAutoAdvance();
    };
    audioEl.onerror = () => {
      if (myToken !== speechToken) return;
      onFallback();
    };

    const playPromise = audioEl.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        if (myToken !== speechToken) return;
        onFallback();
      });
    }
  }

  function speakWithTTS(fullText, myToken) {
    const canSpeak = 'speechSynthesis' in window;
    if (canSpeak) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(fullText);
      utter.lang = 'fr-FR';
      if (frenchVoice) utter.voice = frenchVoice;
      utter.pitch = VOICE_PITCH;
      utter.rate = VOICE_RATE;
      utter.onend = () => {
        if (myToken !== speechToken) return; // ligne dépassée entre-temps (skip)
        stopKeepAlive();
        scheduleAutoAdvance();
      };
      utter.onerror = () => {
        if (myToken !== speechToken) return;
        stopKeepAlive();
        scheduleAutoAdvance();
      };
      // Contournement d'un bug connu des navigateurs Chromium : la synthèse
      // vocale se coupe silencieusement après ~15s sans jamais déclencher
      // "onend", surtout sur les répliques longues. En mettant en pause puis
      // en reprenant régulièrement, on empêche le moteur de s'endormir.
      startKeepAlive();
      // léger délai avant de lancer : évite un conflit avec le cancel() qui
      // précède, qui peut lui aussi faire taire l'utterance suivante trop tôt.
      // Le jeton (myToken) garantit que si le joueur a déjà "skip" cette
      // ligne avant que ce délai n'expire, ce speak() ne partira jamais.
      clearTimeout(speakDelayTimer);
      speakDelayTimer = setTimeout(() => {
        speakDelayTimer = null;
        if (myToken !== speechToken) return;
        window.speechSynthesis.speak(utter);
      }, 30);
    } else {
      // pas de synthèse vocale disponible : on estime un temps de lecture
      const estimated = Math.max(1200, fullText.length * FALLBACK_MS_PER_CHAR);
      autoAdvanceTimer = setTimeout(() => {
        if (myToken !== speechToken) return;
        scheduleAutoAdvance();
      }, estimated);
    }
  }

  let keepAliveTimer = null;
  function startKeepAlive() {
    stopKeepAlive();
    keepAliveTimer = setInterval(() => {
      if (!window.speechSynthesis.speaking) { stopKeepAlive(); return; }
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    }, 4000);
  }
  function stopKeepAlive() {
    if (keepAliveTimer) { clearInterval(keepAliveTimer); keepAliveTimer = null; }
  }

  function scheduleAutoAdvance() {
    els.advanceHint.classList.remove('listening');
    autoAdvanceTimer = setTimeout(() => {
      index++;
      renderLine();
    }, AUTO_PAUSE_MS);
  }

  function stopSpeech() {
    speechToken++; // invalide tout speak()/onend/audio/estimation encore en vol
    clearTimeout(speakDelayTimer);
    speakDelayTimer = null;
    stopKeepAlive();
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    if (els.audioEl) {
      els.audioEl.onended = null;
      els.audioEl.onerror = null;
      try { els.audioEl.pause(); } catch (e) {}
    }
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
      els.text.textContent = window.I18n ? I18n.text(lines[index].text) : lines[index].text;
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
