/**
 * sceneManager.js — Orchestrateur principal
 * -----------------------------------------------------------------
 * Responsable de :
 *  - la navigation entre écrans (.screen dans index.html)
 *  - la résolution d'une scène GAME_DATA (dialogue / map / evidence /
 *    decision / result) vers le bon rendu
 *  - la synchronisation avec SaveManager à chaque étape clé
 * Ne contient aucune donnée narrative en dur : tout vient de script.js
 */

const SceneManager = (() => {
  let state = null; // état de sauvegarde courant (voir saveManager.js)
  let screens = {};

  function bindDOM() {
    document.querySelectorAll('.screen').forEach(el => {
      screens[el.dataset.screen] = el;
    });
  }

  function showScreen(name) {
    Object.values(screens).forEach(el => el.classList.remove('active'));
    if (screens[name]) screens[name].classList.add('active');
    document.getElementById('app').dataset.currentScreen = name;
  }

  function setBackground(bgId) {
    const bgEl = document.getElementById('scene-background');
    bgEl.dataset.bg = bgId || 'default';
  }

  // ---------------------------------------------------------------
  // Cycle de vie de l'application
  // ---------------------------------------------------------------
  function init() {
    bindDOM();
    DialogueEngine.bindDOM();
    MapManager.bindDOM();
    ProgressMap.bindDOM();
    state = SaveManager.load();

    if (!state.hasSeenIntro) {
      playPrologue();
    } else {
      showMenu();
    }

    bindGlobalControls();
  }

  // ---------------------------------------------------------------
  // Prologue cinématique (premier lancement uniquement)
  // ---------------------------------------------------------------
  function playPrologue() {
    showScreen('prologue');
    setBackground('prologue');

    const lines = window.GAME_DATA.prologue.lines;
    const lineEl = document.getElementById('prologue-line');
    const eyebrowEl = document.getElementById('prologue-eyebrow');
    const screenEl = document.querySelector('[data-screen="prologue"]');
    let i = -1; // -1 = carte-titre "PROLOGUE" affichée seule
    let waiting = false;

    function endPrologue() {
      state.hasSeenIntro = true;
      SaveManager.save(state);
      screenEl.removeEventListener('click', advanceStep);
      window.removeEventListener('keydown', keyHandler);
      showMenu();
    }

    function showStep() {
      if (i === -1) {
        eyebrowEl.classList.add('visible');
        lineEl.classList.remove('visible');
        lineEl.textContent = '';
      } else if (i < lines.length) {
        eyebrowEl.classList.remove('visible');
        lineEl.textContent = lines[i];
        // reflow pour rejouer l'animation de fondu à chaque ligne
        lineEl.classList.remove('visible');
        void lineEl.offsetWidth;
        lineEl.classList.add('visible');
      } else {
        endPrologue();
        return;
      }
      waiting = true;
      const delay = i === -1 ? 1800 : Math.max(2200, lines[i].length * 65);
      clearTimeout(screenEl._autoTimer);
      screenEl._autoTimer = setTimeout(() => { if (waiting) advanceStep(); }, delay);
    }

    function advanceStep(e) {
      if (e && e.target && e.target.id === 'btn-skip-prologue') return; // géré séparément
      clearTimeout(screenEl._autoTimer);
      waiting = false;
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

  // ---------------------------------------------------------------
  // Menu principal
  // ---------------------------------------------------------------
  function showMenu() {
    showScreen('menu');
    setBackground('menu');
  }

  // ---------------------------------------------------------------
  // Sélection des chapitres
  // ---------------------------------------------------------------
  function showChapterSelect() {
    showScreen('chapters');
    setBackground('menu');
    const grid = document.getElementById('chapter-grid');
    grid.innerHTML = '';

    window.GAME_DATA.chapters.forEach(chapter => {
      const unlocked = state.unlockedChapters.includes(chapter.id);
      const card = document.createElement('button');
      card.className = 'chapter-card' + (unlocked ? '' : ' locked');
      card.innerHTML = `
        <div class="chapter-number">${chapter.number}</div>
        <div class="chapter-title">${chapter.title}</div>
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
    state.current = { chapterId, sceneId: chapter.startScene };
    SaveManager.save(state);
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

  // ---------------------------------------------------------------
  // Résolution générique d'une scène (dialogue / map / evidence / etc.)
  // ---------------------------------------------------------------
  function playScene(chapterId, sceneId) {
    const chapter = getChapter(chapterId);
    const scene = chapter.scenes[sceneId];

    if (!scene) {
      console.error(`Scène introuvable: ${chapterId}/${sceneId}`);
      return;
    }

    // redirection technique (utilisée par la carte pour revenir sur elle-même)
    if (scene.redirectTo) {
      playScene(chapterId, scene.redirectTo);
      return;
    }

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

  // --- Dialogue -----------------------------------------------------
  function renderDialogue(chapterId, scene) {
    showScreen('dialogue');
    setBackground(scene.background);
    document.getElementById('dlg-hud').style.visibility = 'visible';
    DialogueEngine.start(scene.lines, () => goNext(chapterId, scene));
  }

  // --- Carte / enquête ------------------------------------------------
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

  // --- Analyse de preuves --------------------------------------------
  function renderEvidence(chapterId, scene) {
    showScreen('evidence');
    setBackground(scene.background);
    document.getElementById('evidence-intro').textContent = scene.intro || '';

    const list = document.getElementById('evidence-list');
    const detailBox = document.getElementById('evidence-detail');
    list.innerHTML = '';
    detailBox.textContent = 'Sélectionne une preuve à examiner.';
    const examined = new Set();

    scene.items.forEach(item => {
      const btn = document.createElement('button');
      btn.className = 'evidence-item';
      btn.textContent = item.label;
      btn.addEventListener('click', () => {
        detailBox.textContent = item.detail;
        btn.classList.add('examined');
        examined.add(item.id);
        continueBtn.classList.toggle('visible', examined.size === scene.items.length);
      });
      list.appendChild(btn);
    });

    const continueBtn = document.getElementById('evidence-continue');
    continueBtn.classList.remove('visible');
    continueBtn.onclick = () => goNext(chapterId, scene);
  }

  // --- Décision ---------------------------------------------------
  function renderDecision(chapterId, scene) {
    showScreen('decision');
    setBackground(scene.background);
    document.getElementById('decision-prompt').textContent = scene.prompt;

    const list = document.getElementById('decision-choices');
    list.innerHTML = '';
    scene.choices.forEach(choice => {
      const btn = document.createElement('button');
      btn.className = 'decision-choice';
      btn.textContent = choice.label;
      btn.addEventListener('click', () => playScene(chapterId, choice.goto));
      list.appendChild(btn);
    });
  }

  // --- Résultat -----------------------------------------------------
  function renderResult(chapterId, scene) {
    showScreen('result');
    setBackground(scene.background);
    document.getElementById('result-title').textContent = scene.title;
    document.getElementById('result-text').textContent = scene.text;

    const btn = document.getElementById('result-continue');
    btn.textContent = scene.next ? 'Continuer' : 'Retour aux chapitres';
    btn.onclick = () => goNext(chapterId, scene);
  }

  // ---------------------------------------------------------------
  // Carte du jeu / progression
  // ---------------------------------------------------------------
  function showWorldMap() {
    showScreen('worldmap');
    setBackground('menu');
    ProgressMap.render(window.GAME_DATA.chapters, state, (chapterId) => {
      const chapter = getChapter(chapterId);
      const alreadyStarted = state.current && state.current.chapterId === chapterId && state.current.sceneId;
      if (alreadyStarted) {
        playScene(chapterId, state.current.sceneId);
      } else {
        startChapter(chapterId);
      }
    });
  }

  // ---------------------------------------------------------------
  // Contrôles globaux (avance du dialogue, boutons Auto/Hist/Sauv…)
  // ---------------------------------------------------------------
  function bindGlobalControls() {
    const dlgBox = document.getElementById('dialogue-box');
    dlgBox.addEventListener('click', () => DialogueEngine.advance());
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' && screens.dialogue.classList.contains('active')) {
        e.preventDefault();
        DialogueEngine.advance();
      }
    });

    document.getElementById('btn-save').addEventListener('click', () => {
      SaveManager.save(state);
      flashToast('Partie sauvegardée.');
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

    // Menu principal : Commencer / Carte / Quitter
    document.getElementById('btn-commencer').addEventListener('click', () => {
      showChapterSelect();
    });
    document.getElementById('btn-carte').addEventListener('click', () => {
      showWorldMap();
    });
    document.getElementById('btn-quitter').addEventListener('click', () => {
      flashToast("Merci d'avoir joué à Ombres d'Encre.");
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
    autoReadCheckbox.addEventListener('change', () => {
      DialogueEngine.setAutoRead(autoReadCheckbox.checked);
    });

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
      playScene(state.current.chapterId, state.current.sceneId);
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
