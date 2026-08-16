const fs = require('fs');
const path = require('path');
const vm = require('vm');

function buildFakeAudioContext(log) {
  let idCounter = 0;
  function node(type) {
    const n = {
      id: ++idCounter, type,
      connect() { return n; },
      disconnect() {},
    };
    if (type === 'gain') {
      n.gain = {
        value: 1,
        setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {}, cancelScheduledValues() {}
      };
    }
    if (type === 'oscillator' || type === 'bufferSource') {
      n.frequency = { value: 0 };
      n.detune = { value: 0 };
      n.type = 'sine';
      n.loop = false;
      n.started = false;
      n.stopped = false;
      n.start = () => { n.started = true; log.push({ ev: 'start', id: n.id }); };
      n.stop = () => {
        if (n.stopped) log.push({ ev: 'double-stop!', id: n.id }); // signalerait une fuite/bug
        n.stopped = true;
        log.push({ ev: 'stop', id: n.id });
      };
    }
    if (type === 'biquadFilter') {
      n.frequency = { value: 0 };
      n.Q = { value: 0 };
      n.type = 'lowpass';
    }
    return n;
  }

  return {
    sampleRate: 44100,
    currentTime: 0,
    state: 'running',
    destination: {},
    createGain: () => node('gain'),
    createOscillator: () => node('oscillator'),
    createBiquadFilter: () => node('biquadFilter'),
    createBufferSource: () => node('bufferSource'),
    createBuffer: (channels, length) => ({ getChannelData: () => new Float32Array(length) }),
    resume() {},
  };
}

function buildSandbox() {
  const log = [];
  const sandbox = {
    console, setTimeout, clearTimeout, setInterval, clearInterval,
    Math,
    document: { addEventListener() {} },
    SaveManager: { loadOptions: () => ({ musicVolume: 0.6 }) },
  };
  sandbox.window = {
    AudioContext: function () { return buildFakeAudioContext(log); },
    document: sandbox.document,
    SaveManager: sandbox.SaveManager,
  };
  vm.createContext(sandbox);
  const code = fs.readFileSync(path.join(__dirname, 'js/engine/audioManager.js'), 'utf8');
  vm.runInContext(code, sandbox, { filename: 'audioManager.js' });
  return { sandbox, log };
}

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

async function testAllMoodsBuildWithoutError() {
  const { sandbox } = buildSandbox();
  const AM = sandbox.window.AudioManager;
  let ok = true;
  try {
    AM.init();
    ['menu', 'investigation', 'tension', 'result'].forEach(m => AM.playMood(m));
    AM.setVolume(0.8);
    AM.duck(true);
    AM.duck(false);
    AM.stopAll();
  } catch (e) {
    console.error('Exception:', e);
    ok = false;
  }
  console.log('Test A (4 ambiances + volume + duck + stopAll, sans exception) :', ok ? 'PASS ' : 'FAIL ');
  return ok;
}

async function testMoodSwitchStopsPreviousOscillators() {
  const { sandbox, log } = buildSandbox();
  const AM = sandbox.window.AudioManager;
  AM.init();
  AM.playMood('menu');
  const startsAfterMenu = log.filter(e => e.ev === 'start').length;
  AM.playMood('tension'); // doit programmer l'arrêt des oscillateurs de 'menu'
  await wait(1700); // le fondu de sortie dure 1.4s + marge
  const stops = log.filter(e => e.ev === 'stop').length;
  const doubleStops = log.filter(e => e.ev === 'double-stop!').length;
  console.log(`Test B — oscillateurs démarrés pour 'menu': ${startsAfterMenu}, stoppés après changement d'ambiance: ${stops}, doubles-stop: ${doubleStops}`);
  return stops >= startsAfterMenu && doubleStops === 0;
}

(async () => {
  const a = await testAllMoodsBuildWithoutError();
  const b = await testMoodSwitchStopsPreviousOscillators();
  console.log('\n=== RÉSULTATS ===');
  console.log('Test A (construction des 4 ambiances) :', a ? 'PASS ✅' : 'FAIL ❌');
  console.log('Test B (changement d\'ambiance nettoie les oscillateurs précédents) :', b ? 'PASS ✅' : 'FAIL ❌');
  process.exit(a && b ? 0 : 1);
})();
