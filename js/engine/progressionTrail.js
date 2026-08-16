const ProgressionTrail = (() => {
  let container = null;

  function bindDOM() {
    container = document.getElementById('trail-path');
  }

  /**
   * @param {Array} chapters - GAME_DATA.chapters
   * @param {object} state - état de sauvegarde
   * @param {function(string,string)} onSelect - callback(chapterId, sceneId)
   */
  function render(chapters, state, onSelect) {
    if (!container) bindDOM();
    container.innerHTML = '';
    const visited = new Set(state.visitedScenes || []);

    chapters.forEach(chapter => {
      const unlocked = state.unlockedChapters.includes(chapter.id);
      const completed = state.completedChapters.includes(chapter.id);
      const path = chapter.progressPath || [];

      const heading = document.createElement('div');
      heading.className = 'trail-chapter-heading';
      const chapTitle = window.I18n ? I18n.text(chapter.title) : chapter.title;
      const chapWord = window.I18n ? I18n.t('trail_progress_label') : 'Chapitre';
      heading.textContent = `${chapWord} ${chapter.number} — ${chapTitle}`;
      container.appendChild(heading);

      // index du dernier repère visité dans CE chapitre (progression courante)
      let lastVisitedIndex = -1;
      path.forEach((step, i) => {
        if (visited.has(`${chapter.id}:${step.id}`)) lastVisitedIndex = i;
      });

      path.forEach((step, i) => {
        let status = 'locked';
        if (!unlocked) {
          status = 'locked';
        } else if (completed) {
          status = 'done';
        } else if (i < lastVisitedIndex) {
          status = 'done';
        } else if (i === lastVisitedIndex) {
          status = 'current';
        } else if (i === lastVisitedIndex + 1) {
          status = 'next';
        } else {
          status = 'locked';
        }

        const node = document.createElement('button');
        node.className = `trail-node ${status} ${i % 2 === 0 ? 'align-left' : 'align-right'}`;
        const icon = status === 'done' ? '✓' : status === 'locked' ? '🔒' : (i + 1);
        const label = window.I18n ? I18n.text(step.label) : step.label;
        node.innerHTML = `
          <span class="trail-node-bubble">${icon}</span>
          <span class="trail-node-label">${label}</span>
        `;
        if (status === 'done' || status === 'current') {
          node.addEventListener('click', () => onSelect(chapter.id, step.id));
        }
        container.appendChild(node);
      });
    });
  }

  return { render, bindDOM };
})();

window.ProgressionTrail = ProgressionTrail;
