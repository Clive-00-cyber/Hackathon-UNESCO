const MapManager = (() => {
  let container = null;

  function bindDOM() {
    container = document.getElementById('map-points');
  }

  /**
   * @param {object} scene - scène de type "map" issue de GAME_DATA
   * @param {Set<string>} visited - ids déjà visités (persistant via SaveManager)
   * @param {function(string)} onPointClick - callback(pointId)
   * @param {function()} onAllVisited - callback quand requireAll est satisfait
   */
  function render(scene, visited, onPointClick, onAllVisited) {
    if (!container) bindDOM();
    container.innerHTML = '';

    document.getElementById('map-intro').textContent = window.I18n ? I18n.text(scene.intro) : (scene.intro || '');

    scene.points.forEach(point => {
      const label = window.I18n ? I18n.text(point.label) : point.label;
      const btn = document.createElement('button');
      btn.className = 'map-point' + (visited.has(point.id) ? ' visited' : '');
      btn.style.left = point.x + '%';
      btn.style.top = point.y + '%';
      btn.setAttribute('aria-label', label);
      btn.innerHTML = `<span class="map-point-dot"></span><span class="map-point-label">${label}</span>`;
      btn.addEventListener('click', () => onPointClick(point));
      container.appendChild(btn);
    });

    if (scene.requireAll && scene.points.every(p => visited.has(p.id))) {
      if (onAllVisited) onAllVisited();
    }
  }

  return { render, bindDOM };
})();

window.MapManager = MapManager;
