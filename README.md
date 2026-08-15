# Ombres d'Encre — Un roman visuel

Visual novel web (HTML5 / CSS3 / JavaScript ES6+, sans framework) adapté du
scénario « Ombres d'Encre ».

## Lancer le projet

Aucune dépendance, aucun build. Ouvrir `index.html` dans un navigateur,
ou servir le dossier localement :


## Architecture

```
index.html                  → structure de tous les écrans (voir <section class="screen">)
css/style.css                → identité visuelle complète (palette, typo, animations)
js/main.js                   → point d'entrée, démarre SceneManager
js/engine/dialogue.js        → moteur de dialogue (machine à écrire, avance au clic/Espace)
js/engine/sceneManager.js    → orchestrateur : navigation entre écrans, résolution des scènes
js/engine/mapManager.js      → rendu de la carte interactive à points d'intérêt
js/engine/saveManager.js     → sauvegarde locale (localStorage)
js/data/script.js            → TOUTE la donnée narrative (scénario transcrit en scènes)
assets/                      → dossiers prêts, actuellement vides (placeholders CSS utilisés)
```
