const SceneManager = (() => {
  let state = null; // état de sauvegarde courant (voir saveManager.js)
  let screens = {};
  let history = [];   // pile {chapterId, sceneId} pour le bouton "retour"
  let pauseOpen = false;

  function bindDOM() {
    document.querySelectorAll('.screen').forEach(el => {
      screens[el.dataset.screen] = el;
    });
  }

  const SCREEN_MOOD = {
    menu: 'menu', chapters: 'menu', worldmap: 'menu', options: 'menu',
    galerie: 'menu', credits: 'menu', history: 'menu',
    dialogue: 'investigation', map: 'investigation', evidence: 'investigation',
    decision: 'tension', prologue: 'tension',
    result: 'result'
  };

  function showScreen(name) {
    // La lecture automatique (voix) ne doit vivre que dans l'écran de
    // dialogue : dès qu'on le quitte (menu, carte, preuves, etc.), on
    // coupe la voix et les minuteurs en cours.
    if (name !== 'dialogue') {
      DialogueEngine.stop();
    }
    Object.values(screens).forEach(el => el.classList.remove('active'));
    if (screens[name]) screens[name].classList.add('active');
    document.getElementById('app').dataset.currentScreen = name;
    if (window.AudioManager) AudioManager.playMood(SCREEN_MOOD[name] || 'menu');
  }

  function setBackground(bgId) {
    const bgEl = document.getElementById('scene-background');
    bgEl.dataset.bg = bgId || 'default';
    const photo = window.ASSET_BACKGROUNDS && window.ASSET_BACKGROUNDS[bgId];
    if (photo) {
      bgEl.style.backgroundImage = `url("${photo}")`;
      bgEl.classList.add('has-photo');
    } else {
      bgEl.style.backgroundImage = '';
      bgEl.classList.remove('has-photo');
    }
  }

  function setupCharacterStage(scene) {
    const slots = { left: document.getElementById('char-slot-left'), right: document.getElementById('char-slot-right') };
    const imgs = { left: document.getElementById('char-img-left'), right: document.getElementById('char-img-right') };

    // réinitialise les deux emplacements
    ['left', 'right'].forEach(side => {
      slots[side].classList.remove('present', 'active', 'inactive');
      imgs[side].removeAttribute('src');
    });

    const chars = scene.characters || [];
    chars.forEach(c => {
      const side = c.side === 'right' ? 'right' : 'left';
      const sprites = window.ASSET_CHARACTERS && window.ASSET_CHARACTERS[c.id];
      const src = sprites ? (sprites.neutre || Object.values(sprites)[0]) : null;
      slots[side].classList.add('present');
      slots[side].dataset.characterId = c.id;
      if (src) {
        imgs[side].src = src;
        slots[side].classList.add('has-image');
      } else {
        slots[side].classList.remove('has-image');
      }
    });
  }

  function updateCharacterStageForLine(scene, line) {
    const slots = { left: document.getElementById('char-slot-left'), right: document.getElementById('char-slot-right') };
    const imgs = { left: document.getElementById('char-img-left'), right: document.getElementById('char-img-right') };
    const chars = scene.characters || [];
    if (!chars.length) return;

    chars.forEach(c => {
      const side = c.side === 'right' ? 'right' : 'left';
      const isSpeaking = line.speaker === c.id;
      slots[side].classList.toggle('active', isSpeaking);
      slots[side].classList.toggle('inactive', chars.length > 1 && !isSpeaking);

      if (isSpeaking) {
        const sprites = window.ASSET_CHARACTERS && window.ASSET_CHARACTERS[c.id];
        const poseKey = line.pose || 'neutre';
        const src = sprites ? (sprites[poseKey] || sprites.neutre) : null;
        if (src) imgs[side].src = src;
      }
    });
  }


  // Cycle de vie de l'application

  function init() {
    bindDOM();
    DialogueEngine.bindDOM();
    MapManager.bindDOM();
    ProgressMap.bindDOM();
    ProgressionTrail.bindDOM();
    state = SaveManager.load();
    I18n.applyStaticUI();
    if (window.AudioManager) AudioManager.init();

    if (!state.hasSeenIntro) {
      playPrologue();
    } else {
      showMenu();
    }

    bindGlobalControls();
  }




  function playPrologue() {
    showScreen('prologue');
    setBackground('prologue');

    const lines = window.GAME_DATA.prologue.lines;
    const lineEl = document.getElementById('prologue-line');
    const eyebrowEl = document.getElementById('prologue-eyebrow');
    const screenEl = document.querySelector('[data-screen="prologue"]');
    let i = -1;         // -1 = carte-titre "PROLOGUE" affichée seule
    let typing = false;
    let typeTimer = null;
    let waitTimer = null;

    
    let prologueVoice = null;
    let voicePicked = false;
    let speechToken = 0;
    let speakDelayTimer = null;
    let keepAliveTimer = null;

    function pickProlgueVoice() {
      if (voicePicked || !('speechSynthesis' in window)) return;
      const voices = window.speechSynthesis.getVoices();
      if (!voices.length) return; // pas encore chargées, on réessaiera
      voicePicked = true;
      const french = voices.filter(v => v.lang && v.lang.toLowerCase().startsWith('fr'));
      prologueVoice = french.find(v => /femme|female|amelie|amélie|audrey|marie|julie|celine|léa|lea/i.test(v.name))
        || french.find((v, idx) => idx > 0) // à défaut, une voix différente de la première (souvent celle du jeu)
        || french[0]
        || null;
    }
    pickProlgueVoice();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.addEventListener
        ? window.speechSynthesis.addEventListener('voiceschanged', pickProlgueVoice)
        : (window.speechSynthesis.onvoiceschanged = pickProlgueVoice);
    }

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

    function stopPrologueSpeech() {
      speechToken++; // invalide tout speak()/onend encore en vol (skip rapide)
      clearTimeout(speakDelayTimer);
      speakDelayTimer = null;
      stopKeepAlive();
      if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    }

    function speakLine(text) {
      if (!('speechSynthesis' in window)) return;
      stopPrologueSpeech();
      const myToken = speechToken; // stopPrologueSpeech vient d'incrémenter
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = 'fr-FR';
      if (prologueVoice) utter.voice = prologueVoice;
      utter.pitch = 1.12;
      utter.rate = 0.82;
      utter.onend = () => { if (myToken === speechToken) stopKeepAlive(); };
      utter.onerror = () => { if (myToken === speechToken) stopKeepAlive(); };
      startKeepAlive();
      speakDelayTimer = setTimeout(() => {
        speakDelayTimer = null;
        if (myToken !== speechToken) return; // ligne dépassée entre-temps
        window.speechSynthesis.speak(utter);
      }, 30);
    }

    function endPrologue() {
      clearTimeout(typeTimer);
      clearTimeout(waitTimer);
      stopPrologueSpeech();
      state.hasSeenIntro = true;
      SaveManager.save(state);
      screenEl.removeEventListener('click', advanceStep);
      window.removeEventListener('keydown', keyHandler);
      showMenu();
    }

    function typeLine(rawText) {
      const text = window.I18n ? I18n.text(rawText) : rawText;
      typing = true;
      lineEl.classList.add('visible');
      lineEl.textContent = '';
      speakLine(text);
      let c = 0;
      function tick() {
        if (!typing) return;
        lineEl.textContent = text.slice(0, c + 1);
        c++;
        if (c < text.length) {
          typeTimer = setTimeout(tick, 38);
        } else {
          finishTyping(text);
        }
      }
      tick();
    }

    function finishTyping(text) {
      typing = false;
      lineEl.textContent = text;
      const pause = Math.max(1600, text.length * 45);
      waitTimer = setTimeout(() => advanceStep(), pause);
    }

    function showStep() {
      clearTimeout(typeTimer);
      clearTimeout(waitTimer);
      if (i === -1) {
        eyebrowEl.classList.add('visible');
        lineEl.classList.remove('visible');
        lineEl.textContent = '';
        waitTimer = setTimeout(() => advanceStep(), 1800);
      } else if (i < lines.length) {
        eyebrowEl.classList.remove('visible');
        typeLine(lines[i]);
      } else {
        endPrologue();
      }
    }

    function advanceStep(e) {
      if (e && e.target && e.target.id === 'btn-skip-prologue') return; // géré séparément
      if (typing) {
        // premier clic pendant la frappe : affiche la ligne en entier
        typing = false;
        clearTimeout(typeTimer);
        lineEl.textContent = window.I18n ? I18n.text(lines[i]) : lines[i];
        clearTimeout(waitTimer);
        waitTimer = setTimeout(() => advanceStep(), 1200);
        return;
      }
      stopPrologueSpeech(); // on quitte cette ligne : coupe la voix avant la suivante
      clearTimeout(waitTimer);
      i++;
      showStep();
    }

    function keyHandler(e) {
      if (e.code === 'Space') { e.preventDefault(); advanceStep(); }
    }

    document.getElementById('btn-skip-prologue').onclick = endPrologue;
    screenEl.addEventListener('click', advanceStep);
    window.addEventListener('keydown', keyHandler);

    showStep();
  }

 
  // Menu principal
  
  function showMenu() {
    showScreen('menu');
    setBackground('menu');
  }

  
  // Sélection des chapitres

  function showChapterSelect() {
    showScreen('chapters');
    setBackground('menu');
    const grid = document.getElementById('chapter-grid');
    grid.innerHTML = '';

    window.GAME_DATA.chapters.forEach(chapter => {
      const unlocked = state.unlockedChapters.includes(chapter.id);
      const title = window.I18n ? I18n.text(chapter.title) : chapter.title;
      const card = document.createElement('button');
      card.className = 'chapter-card' + (unlocked ? '' : ' locked');
      card.innerHTML = `
        <div class="chapter-number">${chapter.number}</div>
        <div class="chapter-title">${title}</div>
        ${unlocked ? '' : '<div class="chapter-lock">🔒</div>'}
      `;
      if (unlocked) {
        card.addEventListener('click', () => startChapter(chapter.id));
      }
      grid.appendChild(card);
    });
  }

  function startChapter(chapterId) {
    const chapter = getChapter(chapterId);
    playScene(chapterId, chapter.startScene);
  }

  function getChapter(id) {
    return window.GAME_DATA.chapters.find(c => c.id === id);
  }

  function markChapterCompleted(chapterId) {
    if (!state.completedChapters.includes(chapterId)) {
      state.completedChapters.push(chapterId);
    }
    SaveManager.save(state);
  }



  function playScene(chapterId, sceneId, opts = {}) {
    const chapter = getChapter(chapterId);
    const scene = chapter.scenes[sceneId];

    if (!scene) {
      console.error(`Scène introuvable: ${chapterId}/${sceneId}`);
      return;
    }

    // redirection technique (utilisée par la carte pour revenir sur elle-même)
    if (scene.redirectTo) {
      playScene(chapterId, scene.redirectTo, opts);
      return;
    }

    if (!opts.skipHistory && state.current && state.current.sceneId) {
      history.push({ chapterId: state.current.chapterId, sceneId: state.current.sceneId });
    }

    const sceneKey = `${chapterId}:${sceneId}`;
    if (!state.visitedScenes.includes(sceneKey)) state.visitedScenes.push(sceneKey);

    state.current = { chapterId, sceneId };
    SaveManager.save(state);

    switch (scene.type) {
      case 'dialogue': return renderDialogue(chapterId, scene);
      case 'map': return renderMap(chapterId, sceneId, scene);
      case 'evidence': return renderEvidence(chapterId, scene);
      case 'decision': return renderDecision(chapterId, scene);
      case 'result': return renderResult(chapterId, scene);
      default:
        console.error(`Type de scène inconnu: ${scene.type}`);
    }
  }

  // Retour à la scène précédente (bouton "‹" ou pause > Revenir en arrière)
  function goBack() {
    closePause();
    if (history.length > 0) {
      const prev = history.pop();
      playScene(prev.chapterId, prev.sceneId, { skipHistory: true });
    } else {
      showChapterSelect();
    }
  }

  function goNext(chapterId, scene) {
    if (scene.unlocks && !state.unlockedChapters.includes(scene.unlocks)) {
      state.unlockedChapters.push(scene.unlocks);
      markChapterCompleted(chapterId);
    }
    if (!scene.next) {
      markChapterCompleted(chapterId);
      showChapterSelect();
      return;
    }
    if (scene.next.includes(':')) {
      const [nextChap, nextScene] = scene.next.split(':');
      playScene(nextChap, nextScene);
    } else {
      playScene(chapterId, scene.next);
    }
  }

  //  Dialogue 
  function renderDialogue(chapterId, scene) {
    showScreen('dialogue');
    setBackground(scene.background);
    document.getElementById('dlg-hud').style.visibility = 'visible';
    setupCharacterStage(scene);
    DialogueEngine.start(
      scene.lines,
      () => goNext(chapterId, scene),
      (line) => updateCharacterStageForLine(scene, line)
    );
  }

  //  Carte / enquête 
  function renderMap(chapterId, sceneId, scene) {
    showScreen('map');
    setBackground(scene.background);
    const key = `${chapterId}:${sceneId}`;
    if (!state.visitedMapPoints[key]) state.visitedMapPoints[key] = [];
    const visited = new Set(state.visitedMapPoints[key]);

    MapManager.render(
      scene,
      visited,
      (point) => {
        if (!visited.has(point.id)) {
          state.visitedMapPoints[key].push(point.id);
          SaveManager.save(state);
        }
        playScene(chapterId, point.goto);
      },
      () => {
        document.getElementById('map-continue').classList.add('visible');
      }
    );

    const continueBtn = document.getElementById('map-continue');
    continueBtn.classList.toggle('visible', !scene.requireAll || scene.points.every(p => visited.has(p.id)));
    continueBtn.onclick = () => goNext(chapterId, scene);
  }

  //  Analyse de preuves 
  function renderEvidence(chapterId, scene) {
    showScreen('evidence');
    setBackground(scene.background);
    document.getElementById('evidence-intro').textContent = window.I18n ? I18n.text(scene.intro) : (scene.intro || '');

    const list = document.getElementById('evidence-list');
    const detailBox = document.getElementById('evidence-detail');
    list.innerHTML = '';
    detailBox.textContent = I18n.t('evidence_placeholder');
    const examined = new Set();

    scene.items.forEach(item => {
      const btn = document.createElement('button');
      btn.className = 'evidence-item';
      btn.textContent = I18n.text(item.label);
      btn.addEventListener('click', () => {
        detailBox.textContent = I18n.text(item.detail);
        btn.classList.add('examined');
        examined.add(item.id);
        continueBtn.classList.toggle('visible', examined.size === scene.items.length);
        setBackground(item.background || scene.background);
      });
      list.appendChild(btn);
    });

    const continueBtn = document.getElementById('evidence-continue');
    continueBtn.classList.remove('visible');
    continueBtn.onclick = () => goNext(chapterId, scene);
  }

  // Décision 
  function renderDecision(chapterId, scene) {
    showScreen('decision');
    setBackground(scene.background);
    document.getElementById('decision-prompt').textContent = I18n.text(scene.prompt);

    const list = document.getElementById('decision-choices');
    list.innerHTML = '';
    scene.choices.forEach(choice => {
      const btn = document.createElement('button');
      btn.className = 'decision-choice';
      btn.textContent = I18n.text(choice.label);
      btn.addEventListener('click', () => playScene(chapterId, choice.goto));
      list.appendChild(btn);
    });
  }

  //  Résultat
  function renderResult(chapterId, scene) {
    showScreen('result');
    setBackground(scene.background);
    document.getElementById('result-title').textContent = I18n.text(scene.title);
    document.getElementById('result-text').textContent = I18n.text(scene.text);

    const btn = document.getElementById('result-continue');
    btn.textContent = scene.next ? I18n.t('result_continue') : I18n.t('result_back_chapters');
    btn.onclick = () => goNext(chapterId, scene);
  }

  // Carte du jeu : deux vues (Scénario / Progression), sous onglets

  function showWorldMap(initialTab) {
    showScreen('worldmap');
    setBackground('menu');
    switchMapTab(initialTab || 'scenario');
  }

  function switchMapTab(tab) {
    document.getElementById('tab-scenario').classList.toggle('active', tab === 'scenario');
    document.getElementById('tab-progression').classList.toggle('active', tab === 'progression');
    document.getElementById('view-scenario').classList.toggle('active', tab === 'scenario');
    document.getElementById('view-progression').classList.toggle('active', tab === 'progression');

    if (tab === 'scenario') {
      ProgressMap.render(window.GAME_DATA.chapters, state, (chapterId) => {
        const alreadyStarted = state.current && state.current.chapterId === chapterId && state.current.sceneId;
        if (alreadyStarted) {
          playScene(chapterId, state.current.sceneId);
        } else {
          startChapter(chapterId);
        }
      });
    } else {
      ProgressionTrail.render(window.GAME_DATA.chapters, state, (chapterId, sceneId) => {
        playScene(chapterId, sceneId);
      });
    }
  }


  // Overlay de pause (accessible depuis tous les écrans de jeu)

  function openPause() {
    if (pauseOpen) return;
    pauseOpen = true;
    DialogueEngine.stop(); // coupe la voix pendant la pause
    if (window.AudioManager) AudioManager.duck(true);
    document.getElementById('pause-overlay').classList.add('visible');
  }


  function closePause() {
    if (!pauseOpen) return;
    pauseOpen = false;
    if (window.AudioManager) AudioManager.duck(false);
    document.getElementById('pause-overlay').classList.remove('visible');
    // en mode lecture automatique, on relance la ligne de dialogue en cours
    if (document.getElementById('app').dataset.currentScreen === 'dialogue') {
      DialogueEngine.resume();
    }
  }

  // Contrôles globaux (avance du dialogue, boutons Auto/Hist/Sauv…)

  function bindGlobalControls() {
    const dlgBox = document.getElementById('dialogue-box');
    dlgBox.addEventListener('click', () => DialogueEngine.advance());
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && screens.dialogue.classList.contains('active') && !pauseOpen) {
        e.preventDefault();
        DialogueEngine.advance();
      }
      if (e.code === 'Escape') {
        pauseOpen ? closePause() : openPause();
      }
    });

    document.getElementById('btn-save').addEventListener('click', () => {
      SaveManager.save(state);
      flashToast(I18n.t('toast_saved'));
    });

    document.querySelectorAll('[data-nav]').forEach(el => {
      el.addEventListener('click', () => {
        const target = el.dataset.nav;
        if (target === 'menu') showMenu();
        if (target === 'chapters') showChapterSelect();
        if (target === 'resume') resumeGame();
      });
    });

    // Écrans simples (Options / Galerie / Crédits / Historique)
    document.querySelectorAll('[data-simple-screen]').forEach(el => {
      el.addEventListener('click', () => showScreen(el.dataset.simpleScreen));
    });

    // Bouton pause (☰) et bouton retour (‹), présents sur tous les écrans de jeu
    document.querySelectorAll('.pause-trigger').forEach(el => {
      el.addEventListener('click', openPause);
    });
    document.querySelectorAll('.back-scene-btn').forEach(el => {
      el.addEventListener('click', goBack);
    });

    // Panneau de pause
    document.getElementById('pause-resume').addEventListener('click', closePause);
    document.getElementById('pause-back').addEventListener('click', goBack);
    document.getElementById('pause-save').addEventListener('click', () => {
      SaveManager.save(state);
      flashToast(I18n.t('toast_saved'));
      closePause();
    });
    document.getElementById('pause-chapters').addEventListener('click', () => {
      closePause();
      showChapterSelect();
    });
    document.getElementById('pause-menu').addEventListener('click', () => {
      closePause();
      showMenu();
    });

    // Onglets de la carte du jeu
    document.getElementById('tab-scenario').addEventListener('click', () => switchMapTab('scenario'));
    document.getElementById('tab-progression').addEventListener('click', () => switchMapTab('progression'));

    // Menu principal : Commencer / Carte / Prologue / Quitter
    document.getElementById('btn-commencer').addEventListener('click', () => {
      showChapterSelect();
    });
    document.getElementById('btn-carte').addEventListener('click', () => {
      showWorldMap();
    });
    document.getElementById('btn-prologue').addEventListener('click', () => {
      playPrologue();
    });
    document.getElementById('btn-quitter').addEventListener('click', () => {
      flashToast(I18n.t('toast_quit'));
    });

    // Options : vitesse du texte, volumes, lecture automatique
    const options = SaveManager.loadOptions();
    const speedSelect = document.getElementById('opt-text-speed');
    const musicRange = document.getElementById('opt-music');
    const sfxRange = document.getElementById('opt-sfx');
    const autoReadCheckbox = document.getElementById('opt-auto-read');
    speedSelect.value = options.textSpeed;
    musicRange.value = options.musicVolume;
    sfxRange.value = options.sfxVolume;
    autoReadCheckbox.checked = options.autoRead;
    [speedSelect, musicRange, sfxRange].forEach(el => {
      el.addEventListener('change', () => {
        const current = SaveManager.loadOptions();
        SaveManager.saveOptions({
          ...current,
          textSpeed: speedSelect.value,
          musicVolume: parseFloat(musicRange.value),
          sfxVolume: parseFloat(sfxRange.value)
        });
      });
    });
    musicRange.addEventListener('input', () => {
      if (window.AudioManager) AudioManager.setVolume(parseFloat(musicRange.value));
    });
    autoReadCheckbox.addEventListener('change', () => {
      DialogueEngine.setAutoRead(autoReadCheckbox.checked);
    });

    // Langue (Français / English) : pas de rechargement de page, tout se
    // retraduit en direct au prochain rendu (les écrans dynamiques lisent
    // I18n à chaque affichage) ; on ne force que les libellés statiques.
    const langButtons = { fr: document.getElementById('lang-fr'), en: document.getElementById('lang-en') };
    function refreshLangButtons() {
      const current = I18n.getLang();
      langButtons.fr.classList.toggle('active', current === 'fr');
      langButtons.en.classList.toggle('active', current === 'en');
    }
    refreshLangButtons();
    Object.entries(langButtons).forEach(([lang, btn]) => {
      btn.addEventListener('click', () => {
        if (I18n.getLang() === lang) return;
        I18n.setLang(lang);
        refreshLangButtons();
        I18n.applyStaticUI();
        // réaffiche l'écran courant pour que son contenu dynamique (s'il y
        // en a) bascule immédiatement dans la nouvelle langue
        const current = document.getElementById('app').dataset.currentScreen;
        if (current === 'chapters') showChapterSelect();
        if (current === 'worldmap') switchMapTab(document.getElementById('tab-progression').classList.contains('active') ? 'progression' : 'scenario');
      });
    });

    const resetBtn = document.getElementById('btn-reset-save');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        SaveManager.reset();
        flashToast(I18n.t('toast_reset'));
      });
    }

    generateParticles();
  }

  // Particules dorées flottantes, communes à tous les écrans (voir maquettes)
  function generateParticles() {
    const field = document.getElementById('particles');
    const count = 24;
    for (let i = 0; i < count; i++) {
      const dot = document.createElement('span');
      dot.className = 'particle';
      dot.style.left = Math.random() * 100 + '%';
      dot.style.top = Math.random() * 100 + '%';
      dot.style.animationDelay = (Math.random() * 8) + 's';
      dot.style.animationDuration = (6 + Math.random() * 6) + 's';
      field.appendChild(dot);
    }
  }

  function resumeGame() {
    if (state.current && state.current.sceneId) {
      playScene(state.current.chapterId, state.current.sceneId, { skipHistory: true });
    } else {
      showChapterSelect();
    }
  }

  function flashToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 1800);
  }

  return { init, showMenu, showChapterSelect, showWorldMap, startChapter, resumeGame };
})();

window.SceneManager = SceneManager;
