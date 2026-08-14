/*
  test_dialogue_engine.js — Vérification automatisée des bugs de voix
  Simule window.speechSynthesis pour observer précisément les appels
  speak()/cancel() de dialogue.js, sans navigateur. Deux scénarios :
 
   Test A — le joueur met en pause / change d'écran juste après le
            déclenchement d'une ligne : aucune voix ne doit démarrer
            après stop().
   Test B — le joueur fait plusieurs "skip" rapides pendant la lecture
            automatique : seule la DERNIÈRE ligne visée doit
            effectivement atteindre la synthèse vocale, sans fragments
            de lignes précédentes.
 */
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
        // simule une lecture de 150ms avant "onend" naturel
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

  return { sandbox, speechLog, setAutoRead: (v) => { autoReadEnabled = v; } };
}

function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

async function testStopCancelsPendingSpeak() {
  const { sandbox, speechLog } = buildSandbox();
  const DialogueEngine = sandbox.window.DialogueEngine;
  const lines = [{ who: 'A', text: 'Ligne un' }, { who: 'B', text: 'Ligne deux' }];
  DialogueEngine.start(lines, () => {}, () => {});
  // stop() immédiatement : avant même que le setTimeout(30ms) interne
  // n'ait eu le temps de déclencher le vrai speak()
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
  // skips plus rapides que le délai interne (30ms) et que la fin simulée (150ms)
  DialogueEngine.advance();
  await wait(10);
  DialogueEngine.advance();
  await wait(10);
  DialogueEngine.advance();
  await wait(1200); // laisse la dernière ligne se terminer + le délai d'enchaînement (900ms) avant onComplete
  const speaks = speechLog.filter(e => e.type === 'speak');
  console.log('Test B — textes réellement passés à speak() :', speaks.map(s => s.text));
  const last = speaks[speaks.length - 1];
  const onlyOneReachedEngine = speaks.length === 1; // les 3 premières doivent être annulées avant de parler
  return last && last.text === 'Ligne quatre' && completed && onlyOneReachedEngine;
}

(async () => {
  const a = await testStopCancelsPendingSpeak();
  const b = await testRapidSkipNoFragmentation();
  console.log('\n=== RÉSULTATS ===');
  console.log('Test A (pause/changement d\'écran ne laisse plus de voix fantôme) :', a ? 'PASS ✅' : 'FAIL ❌');
  console.log('Test B (skip rapide ne fragmente plus la lecture) :', b ? 'PASS ✅' : 'FAIL ❌');
  process.exit(a && b ? 0 : 1);
})();
