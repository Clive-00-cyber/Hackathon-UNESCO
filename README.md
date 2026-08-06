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

Séparation stricte : **`js/data/script.js` est la seule source de vérité narrative.**
Modifier l'histoire, ajouter un chapitre ou une scène ne touche jamais au moteur.

## Écrans implémentés (module par module)

| Écran | Statut | Fichier(s) clé(s) |
|---|---|---|
| Splash / Menu principal | Fusionnés (voir note ci-dessous) | `index.html` (#menu), `style.css` |
| Introduction (1er lancement uniquement) || `script.js` (`GAME_DATA.intro`), `sceneManager.js` |
| Sélection des chapitres |  | `sceneManager.js` → `showChapterSelect()` |
| Carte interactive (points d'intérêt) | | `mapManager.js` |
| Interface de dialogue |  | `dialogue.js` |
| Enquête (carte + témoignages) | | `mapManager.js` + `sceneManager.js` |
| Analyse de preuves || `sceneManager.js` → `renderEvidence()` |
| Décision | | `sceneManager.js` → `renderDecision()` |
| Résultat |  | `sceneManager.js` → `renderResult()` |
| Sauvegarde locale |  | `saveManager.js` (localStorage) |
| Options / Galerie / Crédits / Historique |  Écrans fonctionnels minimaux | `index.html` |

## Décisions prises (à valider avec vous)

1. **Splash + Menu principal fusionnés.** La maquette `dark_visual_novel_menu.png`
   sert à la fois d'écran-titre (logo, version) et de menu — je n'ai pas créé
   d'écran splash séparé pour éviter une redondance visuelle. Dites-moi si vous
   souhaitez un splash animé distinct avant le menu.
2. **Découpage narratif en 3 chapitres** (conforme à la maquette `chapter_select_screen.png`) :
   - **I — L'Éveil** : Acte I (découverte) + Acte II (enquête de terrain / carte à 3 points)
   - **II — Le Silence** : Acte III (analyse technique des preuves)
   - **III — La Trahison** *(verrouillé au départ)* : Acte IV (décision/verdict) + épilogue
3. **Personnage « Elara »** de la maquette gameplay : absent du scénario actuel,
   traité comme personnage d'un futur chapitre/prologue, en attente de précisions.
4. **Placeholders graphiques** : en l'absence d'assets, les personnages sont
   représentés par une silhouette CSS (cercle + buste), et les décors par des
   variations de teinte du fond dégradé (`data-bg="..."` sur chaque scène).
   Dès que vous fournirez des images (`assets/images/characters`,
   `assets/images/backgrounds`), il suffira de les référencer dans `script.js`.

## Ajouts récents (itération 2)

1. **Lecture automatique (voix).** Nouvelle option dans *Options* (et
   raccourci via le bouton « Auto » du HUD en jeu) : quand elle est activée,
   chaque ligne de dialogue est lue à voix haute via la **Web Speech API**
   du navigateur (`speechSynthesis`, voix française si disponible), puis la
   ligne suivante s'enchaîne automatiquement — le joueur peut alors
   simplement écouter. Sans synthèse vocale disponible (navigateur non
   compatible), un minuteur de repli estime le temps de lecture. Voir
   `js/engine/dialogue.js`.
2. **Prologue cinématique.** Un tout nouvel écran (`data-screen="prologue"`),
   distinct de l'interface de dialogue en jeu, s'affiche uniquement au
   premier lancement : carte-titre « PROLOGUE », puis des lignes au ton
   sombre et solennel qui posent l'enjeu global (une intelligence sans
   visage qui teste ses mensonges sur le campus) avant de plonger dans
   l'histoire de Kirito. Avance au clic/Espace ou automatiquement après un
   délai ; un bouton « Passer » reste disponible. Voir
   `sceneManager.playPrologue()` et `GAME_DATA.prologue` dans `script.js`.
3. **Carte du jeu / progression.** Nouvel écran accessible depuis le menu
   (bouton « Carte ») : une carte stylisée reprenant l'identité visuelle du
   jeu (chemin en pointillés dorés, nœuds lumineux) montrant les 3
   chapitres, leur état (verrouillé / en cours / terminé) et permettant d'y
   accéder directement. Voir `js/engine/progressMap.js`. Le suivi de
   progression (`completedChapters`) est calculé automatiquement à chaque
   fin de chapitre dans `sceneManager.js`.

## Itération 3 — Navigation, pause, carte enrichie, voix

1. **Deux vues de carte, sous onglets** (écran « Carte », depuis le menu) :
   - **Carte du scénario** : vue d'ensemble des 3 chapitres (inchangée depuis l'itération 1).
   - **Ma progression** *(nouveau)* : parcours de leçons façon Duolingo — une
     bulle par repère narratif (`chapter.progressPath` dans `script.js`),
     zigzag vertical, états verrouillé / en cours (pulsant) / terminé
     (coché), rendu plus doux (bulles arrondies, tons pastel-or). Cliquer
     une bulle terminée ou en cours y ramène directement. Voir
     `js/engine/progressionTrail.js`.
2. **Accès au prologue à tout moment** : bouton « Revoir le prologue » dans
   le menu principal, rejoue la séquence sans toucher à la progression en cours.
3. **Bouton pause** sur tous les écrans de jeu (dialogue, carte d'enquête,
   preuves, décision, résultat) : icône ☰ ou touche **Échap**. Ouvre un
   overlay avec Reprendre / Revenir en arrière / Sauvegarder / Chapitres /
   Menu principal. Coupe automatiquement la voix pendant la pause.
4. **Navigation arrière** : chaque écran de jeu (y compris l'écran
   *Décision*, qui en était dépourvu) a maintenant un bouton « ‹ » dédié,
   en plus de l'option dans le menu pause. Repose sur une pile d'historique
   interne (`sceneManager.js`), donc un retour ramène toujours à l'écran
   réellement précédent.
5. **Voix plus grave et plus lente** (`js/engine/dialogue.js`) : `pitch`
   et `rate` réglés pour un rendu plus pesant et intrigant, quelle que soit
   la voix française choisie par le navigateur (masculine ou féminine).
   *Décision prise sans vous consulter, pour ne pas bloquer l'avancement* :
   sélection automatique de la meilleure voix disponible plutôt qu'un
   sélecteur manuel dans les Options — dites-moi si vous en voulez un.
6. **Prologue en défilement** (machine à écrire), plus en bloc de texte —
   même mécanique que l'interface de dialogue classique, avec clic pour
   accélérer.
7. **Lecture automatique confinée à l'interface de dialogue** : la voix et
   les minuteurs s'arrêtent immédiatement dès qu'on quitte l'écran de
   dialogue (menu, carte, pause…), via `showScreen()` dans `sceneManager.js`.
   Elle reprend automatiquement la ligne en cours si on referme la pause
   tout en étant encore dans le dialogue.
8. **Réinitialisation de la progression** : bouton dans *Options*, utile
   pour retester le prologue ou le déblocage des chapitres sans vider le
   cache du navigateur à la main.

### À propos des placeholders personnages

L'architecture (`assets/images/characters/`, silhouette CSS dans
`.character-placeholder`) est déjà prête à recevoir les visuels de l'équipe
design : il suffira d'ajouter les fichiers dans ce dossier et de les
référencer depuis `script.js`. Pas de changement de structure nécessaire
pour ça — je peux câbler l'affichage réel dès que les premiers visuels
seront prêts.

### Idée notée pour plus tard (non implémentée)

Afficher un message directement sur un objet de la scène (ex. l'écran d'un
téléphone dans l'épilogue) — techniquement simple à ajouter sur la même
architecture de placeholders une fois qu'on y arrive. Dites-moi quand vous
voulez qu'on s'y attaque.

## Prochaines étapes suggérées

- Intégrer les vrais assets (personnages, fonds, logo) quand disponibles
- Ajouter la musique/SFX (Howler.js recommandé, non ajouté tant qu'aucun asset audio n'existe)
- Étoffer l'écran Historique (liste défilante des lignes déjà lues)
- Chapitre du prologue avec Elara, une fois le contexte narratif précisé
- Transitions animées entre scènes (GSAP) si souhaité
