const SaveManager = (() => {
  const STORAGE_KEY = 'ombresDEncre_save';
  const OPTIONS_KEY = 'ombresDEncre_options';

  const defaultSave = () => ({
    hasSeenIntro: false,
    unlockedChapters: ['chap1'],
    current: { chapterId: 'chap1', sceneId: null },
    visitedMapPoints: {},   
    visitedScenes: [],      
    completedChapters: []
  });

  const defaultOptions = () => ({
    textSpeed: 'normal',   
    musicVolume: 0.6,
    sfxVolume: 0.8,
    autoRead: false,       
    language: 'fr'         
  });

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultSave();
      return { ...defaultSave(), ...JSON.parse(raw) };
    } catch (e) {
      console.warn('SaveManager: lecture impossible, réinitialisation.', e);
      return defaultSave();
    }
  }

  function save(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      console.error('SaveManager: écriture impossible.', e);
      return false;
    }
  }

  function loadOptions() {
    try {
      const raw = localStorage.getItem(OPTIONS_KEY);
      if (!raw) return defaultOptions();
      return { ...defaultOptions(), ...JSON.parse(raw) };
    } catch (e) {
      return defaultOptions();
    }
  }

  function saveOptions(options) {
    try {
      localStorage.setItem(OPTIONS_KEY, JSON.stringify(options));
      return true;
    } catch (e) {
      console.error('SaveManager: écriture options impossible.', e);
      return false;
    }
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
  }

  return { load, save, loadOptions, saveOptions, reset, defaultSave };
})();

window.SaveManager = SaveManager;
