# Intégration des voix enregistrées des personnages

Ce document explique comment, plus tard, remplacer la voix de synthèse
(actuelle) par de vrais enregistrements audio pour chaque personnage 
sans rien casser entre-temps : tant qu'un fichier audio n'est pas fourni
pour une ligne donnée, le jeu continue d'utiliser la voix de synthèse du
navigateur automatiquement. on peut donc ajouter les voix
progressivement, personnage par personnage, scène par scène.

## 1. Où déposer les fichiers

Même logique que pour les images (`assets/images/characters/<nom>/`) :

```
assets/audio/characters/
  kirito/
    chap1_acte1_l05.mp3
    chap1_acte1_l06.mp3
    ...
  alpha/
    chap1_acte1_l05.mp3
    ...
  musashi/
  zenitsu/
  goemon/
  directeur/
  shadow/
```

## 2. Convention de nom de fichier

Un fichier = une ligne de dialogue précise. Convention recommandée :

```
<chapitre>_<scène>_l<numéro de ligne>.mp3
```

Exemple : `chap1_acte1_decouverte_l05.mp3` pour la 5ᵉ ligne (index 4,
en comptant à partir de 0) de la scène `acte1_decouverte` du chapitre 1.

Le numéro de ligne correspond à sa position dans le tableau `lines: [...]`
de `js/data/script.js` (la première ligne du tableau = `l01`, peu importe
si elle a un `speaker` ou non — ça évite tout décalage si une ligne de
narration est ajoutée/retirée entre deux personnages).

## 3. Format recommandé

- **Format** : MP3 (le plus compatible universellement) ou OGG en repli.
- **Mono** (pas besoin de stéréo pour de la voix).
- **44.1 kHz, 96–128 kbps** : largement suffisant pour de la voix, garde
  les fichiers légers (important pour le chargement web).
- **Volume normalisé** : à peu près le même niveau sonore d'un fichier à
  l'autre, sinon certains personnages paraîtront plus forts que d'autres.
- Pas de blanc long au début/à la fin du fichier (sinon le jeu semble en
  retard pour démarrer/avancer).

## 4. Comment le référencer dans le scénario

Une fois qu'un fichier existe, il suffit d'ajouter un champ `audio` sur
la ligne concernée dans `js/data/script.js` :

```js
{
  who: 'Kirito',
  speaker: 'kirito',
  pose: 'neutre',
  audio: 'assets/audio/characters/kirito/chap1_acte1_decouverte_l05.mp3',
  text: {
    fr: "Un dossier anonyme… un faux ordre de virement...",
    en: "An anonymous file… a fake transfer order..."
  }
}
```

**Note langue** : si on enregistre aussi une version anglaise plus
tard, on pourra faire `audio: { fr: '...mp3', en: '...en.mp3' }` de la
même manière que les champs `text`/`who` — le moteur choisira le bon
fichier selon la langue active. Pas besoin d'y penser maintenant, une
simple chaîne de caractères suffit tant qu'il n'y a qu'une seule langue
enregistrée.

## 5. Ce que je dois modifier côté code (quand vous m'envoyez les fichiers)

Je n'ai pas encore branché cette partie dans `dialogue.js`,   Voici ce qui sera fait à ce moment-là :

1. Ajout d'un élément `<audio>` caché dans `index.html`.
2. `dialogue.js` : quand une ligne a un champ `audio`, on joue ce fichier
   à la place de la synthèse vocale. Si le fichier est absent ou ne se
   charge pas, repli automatique sur la voix de synthèse (donc aucun
   risque de "silence" si un fichier manque ou a une faute dans son nom).
3. Réutilisation du même mécanisme anti-fragmentation qu'on vient de
   mettre en place pour la synthèse vocale (jeton de génération + nettoyage
   systématique des minuteurs), pour que les mêmes bugs ne réapparaissent
   pas avec de vrais fichiers audio.

## 6. Décisions à prendre ensemble à ce moment-là


1. **La voix doit-elle jouer uniquement quand "Lecture automatique" est
   activée (comme la synthèse vocale aujourd'hui), ou toujours, comme un
   jeu entièrement doublé** (indépendamment de l'avance automatique) ?
   Cette deuxième option est plus proche d'un vrai visual novel commercial,
   mais demande un peu plus de travail (gérer le cas où le joueur avance
   au clic avant la fin de la voix).
2. **Doit-on garder le narrateur/texte sans voix pour certaines lignes**
   (par ex. les lignes de narration sans personnage, ou l'extrait audio
   suspect qui est déjà "un audio" dans l'histoire) ?


