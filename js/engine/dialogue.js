const DialogueEngine = (() => {
  let lines = [];
  let index = 0;
  let typing = false;
  let typeTimer = null;
  let autoAdvanceTimer = null;
  let onComplete = null;


  const SPEEDS = { lent: 45, normal: 24, rapide: 10 };
  const AUTO_PAUSE_MS = 900; 
  const FALLBACK_MS_PER_CHAR = 55; 

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
        frenchVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('fr')) || null;
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
      utter.rate = 1;
      utter.onend = () => scheduleAutoAdvance();
      utter.onerror = () => scheduleAutoAdvance();
      window.speechSynthesis.speak(utter);
    } else {
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

  function advance() {
    if (isAutoReadEnabled()) {

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

  return { start, advance, isTyping, bindDOM, setAutoRead, toggleAutoRead, isAutoReadEnabled, stop };
})();

window.DialogueEngine = DialogueEngine;
