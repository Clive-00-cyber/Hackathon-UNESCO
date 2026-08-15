const fs = require('fs');
const path = require('path');
const vm = require('vm');

function makeElement() {
  return {
    classList: { add() {}, remove() {}, toggle() {}, contains() { return false; } },
    style: {},
    textContent: '',
    innerHTML: '',
    checked: false,
    addEventListener() {},
    setAttribute() {},
  };
}

function buildSandbox() {
  const elements = {};
  ['dlg-name', 'dlg-name-box', 'dlg-text', 'dialogue-box', 'dlg-advance-hint', 'btn-auto']
    .forEach(id => elements[id] = makeElement());


  const audioLog = [];
  const audioEl = {
    _src: '', _endTimer: null, _shouldFail: false,
    onended: null, onerror: null, currentTime: 0,
    set src(v) { this._src = v; audioLog.push({ type: 'src', value: v }); },
    get src() { return this._src; },
    pause() { clearTimeout(this._endTimer); audioLog.push({ type: 'pause' }); },
    play() {
      audioLog.push({ type: 'play', src: this._src });
      return new Promise((resolve, reject) => {
        if (this._shouldFail) { reject(new Error('simulated failure')); return; }
        resolve();
        this._endTimer = setTimeout(() => { if (this.onended) this.onended(); }, 150);
      });
    },
  };
  elements['dlg-voice-audio'] = audioEl;

  const speechLog = [];
  let currentUtter = null;
  let currentTimer = null;
  let autoReadEnabled = true;

  const sandbox = {
    console,
    setTimeout, clearTimeout, setInterval, clearInterval,
    document: {
      getElementById: (id) => elements[id] || makeElement(),
      querySelectorAll: () => [],
    },
    SaveManager: {
      loadOptions: () => ({ textSpeed: 'normal', autoRead: autoReadEnabled }),
      saveOptions: (o) => { autoReadEnabled = o.autoRead; },
    },
    I18n: { text: (f) => (typeof f === 'string' ? f : (f && (f.fr || f.en)) || '') },
  };

  sandbox.SpeechSynthesisUtterance = function (text) {
    this.text = text; this.onend = null; this.onerror = null;
    this.lang = ''; this.voice = null; this.pitch = 1; this.rate = 1;
  };

  sandbox.window = {
    SpeechSynthesisUtterance: sandbox.SpeechSynthesisUtterance,
    document: sandbox.document,
    SaveManager: sandbox.SaveManager,
    I18n: sandbox.I18n,
    speechSynthesis: {
      speaking: false,
      getVoices: () => [],
      onvoiceschanged: null,
      speak(utter) {
        speechLog.push({ type: 'speak', text: utter.text, at: Date.now() });
        currentUtter = utter;
        this.speaking = true;
        currentTimer = setTimeout(() => {
          if (currentUtter === utter) {
            this.speaking = false;
            if (utter.onend) utter.onend();
          }
        }, 150);
      },
      cancel() {
        speechLog.push({ type: 'cancel', at: Date.now() });
        clearTimeout(currentTimer);
        this.speaking = false;
        currentUtter = null;
      },
      pause() { speechLog.push({ type: 'pause', at: Date.now() }); },
      resume() { speechLog.push({ type: 'resume', at: Date.now() }); },
    },
  };

  vm.createContext(sandbox);
  const code = fs.readFileSync(path.join(__dirname, 'js/engine/dialogue.js'), 'utf8');
  vm.runInContext(code, sandbox, { filename: 'dialogue.js' });

  return { sandbox, speechLog, audioLog, audioEl, setAutoRead: (v) => { autoReadEnabled = v; } };
}

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

async function testStopCancelsPendingSpeak() {
  const { sandbox, speechLog } = buildSandbox();
  const DialogueEngine = sandbox.window.DialogueEngine;
  const lines = [{ who: 'A', text: 'Ligne un' }, { who: 'B', text: 'Ligne deux' }];
  DialogueEngine.start(lines, () => {}, () => {});

  DialogueEngine.stop();
  await wait(250);
  const speaks = speechLog.filter(e => e.type === 'speak');
  console.log(`Test A — appels speak() après stop() immédiat : ${speaks.length} (attendu: 0)`);
  return speaks.length === 0;
}

async function testRapidSkipNoFragmentation() {
  const { sandbox, speechLog } = buildSandbox();
  const DialogueEngine = sandbox.window.DialogueEngine;
  const lines = [
    { who: 'A', text: 'Ligne un' },
    { who: 'B', text: 'Ligne deux' },
    { who: 'C', text: 'Ligne trois' },
    { who: 'D', text: 'Ligne quatre' }
  ];
  let completed = false;
  DialogueEngine.start(lines, () => { completed = true; }, () => {});
  DialogueEngine.advance();
  await wait(10);
  DialogueEngine.advance();
  await wait(10);
  DialogueEngine.advance();
  await wait(1200); 
  console.log('Test B — textes réellement passés à speak() :', speaks.map(s => s.text));
  const last = speaks[speaks.length - 1];
  const onlyOneReachedEngine = speaks.length === 1; // les 3 premières doivent être annulées avant de parler
  return last && last.text === 'Ligne quatre' && completed && onlyOneReachedEngine;
}

async function testRealAudioPlaysAndAdvances() {
  const { sandbox, audioLog } = buildSandbox();
  const DialogueEngine = sandbox.window.DialogueEngine;
  const lines = [{ who: 'Kirito', text: 'Ligne un', audio: 'assets/audio/characters/kirito/test1.mp3' }];
  let completed = false;
  DialogueEngine.start(lines, () => { completed = true; }, () => {});
  await wait(400); 
  const plays = audioLog.filter(e => e.type === 'play');
  console.log('Test C — fichier(s) réellement joué(s) :', plays.map(p => p.src));
  return plays.length === 1 && plays[0].src === 'assets/audio/characters/kirito/test1.mp3';
}

async function testAudioErrorFallsBackToTTS() {
  const { sandbox, audioEl, speechLog } = buildSandbox();
  audioEl._shouldFail = true; 
  const DialogueEngine = sandbox.window.DialogueEngine;
  const lines = [{ who: 'Kirito', text: 'Ligne de secours', audio: 'assets/audio/characters/kirito/absent.mp3' }];
  DialogueEngine.start(lines, () => {}, () => {});
  await wait(200);
  const speaks = speechLog.filter(e => e.type === 'speak');
  console.log('Test D — repli sur la synthèse vocale après échec du fichier :', speaks.map(s => s.text));
  return speaks.length === 1 && speaks[0].text === 'Ligne de secours';
}

(async () => {
  const a = await testStopCancelsPendingSpeak();
  const b = await testRapidSkipNoFragmentation();
  const c = await testRealAudioPlaysAndAdvances();
  const d = await testAudioErrorFallsBackToTTS();
  console.log('\n=== RÉSULTATS ===');
  console.log('Test A (pause/changement d\'écran ne laisse plus de voix fantôme) :', a ? 'PASS ✅' : 'FAIL ❌');
  console.log('Test B (skip rapide ne fragmente plus la lecture) :', b ? 'PASS ✅' : 'FAIL ❌');
  console.log('Test C (fichier audio réel joué et avance bien) :', c ? 'PASS ✅' : 'FAIL ❌');
  console.log('Test D (repli sur la voix de synthèse si fichier en échec) :', d ? 'PASS ✅' : 'FAIL ❌');
  process.exit(a && b && c && d ? 0 : 1);
})();
