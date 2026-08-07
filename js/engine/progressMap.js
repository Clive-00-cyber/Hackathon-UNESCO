const ProgressMap = (() => {
  let container = null;

  function bindDOM() {
    container = document.getElementById('worldmap-nodes');
  }

  /**
   * @param {Array} chapters - GAME_DATA.chapters
   * @param {object} state - état de sauvegarde (unlockedChapters, completedChapters, current)
   * @param {function(string)} onSelect - callback(chapterId) au clic sur un nœud débloqué
   */
  function render(chapters, state, onSelect) {
    if (!container) bindDOM();
    container.innerHTML = '';

    // positions le long du chemin tracé en SVG (voir polyline #worldmap-path)
    const positions = [
      { x: 15, y: 72 },
      { x: 50, y: 32 },
      { x: 85, y: 68 }
    ];

    chapters.forEach((chapter, i) => {
      const pos = positions[i] || { x: 50, y: 50 };
      const unlocked = state.unlockedChapters.includes(chapter.id);
      const completed = state.completedChapters.includes(chapter.id);
      const isCurrent = unlocked && !completed;

      const node = document.createElement('button');
      node.className = 'worldmap-node' +
        (completed ? ' completed' : '') +
        (isCurrent ? ' current' : '') +
        (!unlocked ? ' locked' : '');
      node.style.left = pos.x + '%';
      node.style.top = pos.y + '%';
      node.setAttribute('aria-label', chapter.title);
      node.innerHTML = `
        <span class="worldmap-node-ring"></span>
        <span class="worldmap-node-number">${completed ? '✓' : (unlocked ? chapter.number : '🔒')}</span>
        <span class="worldmap-node-title">${chapter.title}</span>
      `;
      if (unlocked) {
        node.addEventListener('click', () => onSelect(chapter.id));
      }
      container.appendChild(node);
    });

    const legend = document.getElementById('worldmap-legend');
    if (legend) {
      const doneCount = state.completedChapters.length;
      legend.textContent = `${doneCount} / ${chapters.length} chapitres achevés`;
    }
  }

  return { render, bindDOM };
})();

window.ProgressMap = ProgressMap;
