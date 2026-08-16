const AudioManager = (() => {
  let ctx = null;
  let masterGain = null;
  let currentMoodGain = null;
  let currentMood = null;
  let currentNodes = [];
  let moodGeneration = 0;
  let duckFactor = 1; // 1 = normal, <1 = atténué (ex: pendant la pause)
  let unlocked = false;

  const MAX_LEVEL = 0.5; // plafond de volume ("en retrait" mais réellement audible)

  const PRESETS = {
    menu: {
      notes: [110.00, 164.81, 220.00],     
      subNote: 55.00,                      
      noteLevel: [0.30, 0.22, 0.14],
      waveform: 'sine',
      detune: 3,
      filterFreq: 1600,
      filterQ: 0.6,
      lfoRate: [0.045, 0.05, 0.04],
      lfoDepth: 0.05
    },
    investigation: {
      notes: [116.54, 138.59, 174.61],     
      subNote: 58.27,
      noteLevel: [0.28, 0.20, 0.16],
      waveform: 'sine',
      detune: 5,
      filterFreq: 1200,
      filterQ: 0.7,
      lfoRate: [0.07, 0.06, 0.08],
      lfoDepth: 0.07,
      noise: true,
      noiseFreq: 500,
      noiseLevel: 0.012,
      sparkle: true                       
    },
    tension: {
      notes: [123.47, 146.83, 174.61],      
      noteLevel: [0.28, 0.19, 0.16],
      waveform: 'triangle',
      detune: 7,
      filterFreq: 900,
      filterQ: 0.8,
      lfoRate: [0.11, 0.13, 0.09],
      lfoDepth: 0.08,
      heartbeat: true                      
    },
    result: {
      notes: [110.00, 220.00, 329.63],      
      subNote: 55.00,
      noteLevel: [0.27, 0.18, 0.12],
      waveform: 'sine',
      detune: 3,
      filterFreq: 2000,
      filterQ: 0.5,
      lfoRate: [0.04, 0.045, 0.05],
      lfoDepth: 0.05,
      shimmer: true                      
    }
  };

  function ensureContext() {
    if (ctx) return true;
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return false;
      ctx = new Ctx();
      masterGain = ctx.createGain();
      masterGain.gain.value = readVolume() * duckFactor;
      masterGain.connect(ctx.destination);
      return true;
    } catch (e) {
      ctx = null;
      return false;
    }
  }

  function readVolume() {
    try {
      const opts = SaveManager.loadOptions();
      const raw = typeof opts.musicVolume === 'number' ? opts.musicVolume : 0.6;
      return raw * MAX_LEVEL;
    } catch (e) {
      return 0.2;
    }
  }


  function bindUnlock() {
    if (unlocked) return;
    unlocked = true;
    const unlock = () => {
      if (ensureContext() && ctx.state === 'suspended') ctx.resume();
    };
    document.addEventListener('pointerdown', unlock, { once: true });
    document.addEventListener('keydown', unlock, { once: true });
  }

  function init() {
    bindUnlock();
  }

  function setVolume(raw01) {
    if (!masterGain || !ctx) return;
    masterGain.gain.linearRampToValueAtTime(raw01 * MAX_LEVEL * duckFactor, ctx.currentTime + 0.25);
  }

  function duck(active) {
    duckFactor = active ? 0.45 : 1;
    if (masterGain && ctx) {
      masterGain.gain.linearRampToValueAtTime(readVolume() * duckFactor, ctx.currentTime + 0.4);
    }
  }

  function stopCurrent() {
    if (!ctx || !currentMoodGain) { currentNodes = []; currentMoodGain = null; return; }
    const now = ctx.currentTime;
    const fadeGain = currentMoodGain;
    fadeGain.gain.cancelScheduledValues(now);
    fadeGain.gain.setValueAtTime(fadeGain.gain.value, now);
    fadeGain.gain.linearRampToValueAtTime(0, now + 1.4);
    const nodesToStop = currentNodes;
    setTimeout(() => {
      nodesToStop.forEach(n => {
        try { n.stop && n.stop(); } catch (e) {}
      });
    }, 1500);
    currentNodes = [];
    currentMoodGain = null;
  }

  function playMood(mood) {
    if (!ensureContext()) return;
    if (ctx.state === 'suspended') ctx.resume();
    if (mood === currentMood) return; // déjà en cours
    currentMood = mood;
    moodGeneration++;
    const myGeneration = moodGeneration;
    stopCurrent();

    const preset = PRESETS[mood] || PRESETS.menu;
    const now = ctx.currentTime;

    const moodGain = ctx.createGain();
    moodGain.gain.value = 0;
    moodGain.connect(masterGain);
    moodGain.gain.linearRampToValueAtTime(1, now + 2.5); // fondu d'entrée
    currentMoodGain = moodGain;

    preset.notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      osc.type = preset.waveform || 'sine';
      osc.frequency.value = freq;
      osc.detune.value = (i % 2 === 0 ? -1 : 1) * (preset.detune || 4) * (i + 1);

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = preset.filterFreq || 800;
      filter.Q.value = preset.filterQ || 0.7;

      const noteGain = ctx.createGain();
      const baseLevel = (preset.noteLevel && preset.noteLevel[i]) || 0.15;
      noteGain.gain.value = baseLevel;

      // LFO lent : respiration du volume de la note
      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.value = (preset.lfoRate && preset.lfoRate[i]) || 0.05;
      const lfoGain = ctx.createGain();
      lfoGain.gain.value = baseLevel * (preset.lfoDepth || 0.06) * 3;
      lfo.connect(lfoGain);
      lfoGain.connect(noteGain.gain);

      osc.connect(filter);
      filter.connect(noteGain);
      noteGain.connect(moodGain);

      osc.start(now);
      lfo.start(now);

      currentNodes.push({ stop: () => { osc.stop(); lfo.stop(); } });
    });

    // Couche sub-grave très discrète (une octave sous la fondamentale) :
    // quasi imperceptible sur petits haut-parleurs, ajoute du corps sur
    // casque/subwoofer sans nuire à l'audibilité sur le reste.
    if (preset.subNote) {
      const subOsc = ctx.createOscillator();
      subOsc.type = 'sine';
      subOsc.frequency.value = preset.subNote;
      const subGain = ctx.createGain();
      subGain.gain.value = 0.09;
      subOsc.connect(subGain);
      subGain.connect(moodGain);
      subOsc.start(now);
      currentNodes.push({ stop: () => subOsc.stop() });
    }

    // Texture de bruit très ténue (façon vent), utilisée par 'investigation'
    if (preset.noise) {
      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) output[i] = Math.random() * 2 - 1;
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = noiseBuffer;
      noiseSource.loop = true;
      const noiseFilter = ctx.createBiquadFilter();
      noiseFilter.type = 'bandpass';
      noiseFilter.frequency.value = preset.noiseFreq || 500;
      noiseFilter.Q.value = 0.6;
      const noiseGain = ctx.createGain();
      noiseGain.gain.value = preset.noiseLevel || 0.01;
      noiseSource.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(moodGain);
      noiseSource.start(now);
      currentNodes.push({ stop: () => noiseSource.stop() });
    }

    // Éclats aigus espacés aléatoirement ("indices") pour 'investigation'
    if (preset.sparkle) scheduleSparkle(moodGain, myGeneration);

    // Pouls grave lent ("cœur qui bat") pour 'tension'
    if (preset.heartbeat) scheduleHeartbeat(moodGain, myGeneration);

    // Scintillement aigu discret et continu pour 'result'
    if (preset.shimmer) addShimmer(moodGain, now);
  }

  function scheduleSparkle(moodGain, generation) {
    const trigger = () => {
      if (generation !== moodGeneration || !ctx) return; // ambiance changée entre-temps
      const now = ctx.currentTime;
      const freq = [1046.5, 1174.7, 1318.5][Math.floor(Math.random() * 3)]; // C6/D6/E6
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(0.035, now + 0.6);
      g.gain.linearRampToValueAtTime(0, now + 3.5);
      osc.connect(g);
      g.connect(moodGain);
      osc.start(now);
      osc.stop(now + 4);
      const nextDelay = 8000 + Math.random() * 12000; // 8–20s
      setTimeout(trigger, nextDelay);
    };
    setTimeout(trigger, 4000 + Math.random() * 4000);
  }

  function scheduleHeartbeat(moodGain, generation) {
    const trigger = () => {
      if (generation !== moodGeneration || !ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = 42;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.09, now + 0.05);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      osc.connect(g);
      g.connect(moodGain);
      osc.start(now);
      osc.stop(now + 0.5);
      setTimeout(trigger, 1150); // ~52 bpm, lent et oppressant
    };
    trigger();
  }

  function addShimmer(moodGain, now) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 1760; // A6, très discret
    const g = ctx.createGain();
    g.gain.value = 0.012;
    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.value = 0.15;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 0.010;
    lfo.connect(lfoGain);
    lfoGain.connect(g.gain);
    osc.connect(g);
    g.connect(moodGain);
    osc.start(now);
    lfo.start(now);
    currentNodes.push({ stop: () => { osc.stop(); lfo.stop(); } });
  }

  function stopAll() {
    currentMood = null;
    moodGeneration++;
    stopCurrent();
  }

  return { init, playMood, setVolume, duck, stopAll };
})();

window.AudioManager = AudioManager;
