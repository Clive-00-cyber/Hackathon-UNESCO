const GAME_DATA = {
  meta: {
    title: "Ombres d'Encre",
    subtitle: "Un roman visuel",
    version: "projet original — v0.1"
  },

  // Prologue cinématique : ne s'affiche qu'au tout premier lancement.
  // Rendu par un écran dédié (voir sceneManager.playPrologue), au ton
  // délibérément plus sombre et solennel que le reste du jeu.
  prologue: {
    lines: [
      "Avant la vérité, il y a toujours le mensonge.",
      "Il ne crie pas. Il ne s'annonce pas. Il se glisse, discret, dans une rumeur, une image, une voix trop parfaite pour être honnête.",
      "Et pendant qu'on doute, qu'on hésite, qu'on partage sans vérifier… il grandit.",
      "Quelque part, une intelligence sans visage observe. Elle apprend. Elle teste. Elle choisit ses champs de bataille.",
      "Ce soir, elle a choisi un campus. Une rumeur. Une accusation.",
      "Un seul étudiant, encore, ignore qu'il vient d'être désigné comme adversaire.",
      "Il s'appelle Kirito."
    ]
  },

  chapters: [
      // CHAPITRE I L'ÉVEIL  (Actes I & II du scénario)
  
    {
      id: 'chap1',
      number: 'I',
      title: "L'Éveil",
      locked: false,
      startScene: 'acte1_decouverte',
      // Repères narratifs affichés sur la carte de progression (vue "Ma progression")
      progressPath: [
        { id: 'acte1_decouverte', label: 'La découverte' },
        { id: 'carte_acte2', label: "L'enquête de terrain" },
        { id: 'analyse_etape2', label: 'Le tri des faits' }
      ],
      scenes: {

        acte1_decouverte: {
          type: 'dialogue',
          background: 'bibliotheque',
          lines: [
            { who: '', text: "Kirito n'aimait pas les jours de grand vent sur l'Université centrale." },
            { who: '', text: "Non pas à cause du froid ou du bruit dans les feuillages, mais parce que les jours de vent, les rumeurs semblaient se répandre deux fois plus vite." },
            { who: '', text: "Ce matin-là, alors qu'il travaillait au fond de la bibliothèque, le bruissement des notifications autour de lui suffit à lui faire comprendre qu'un problème venait de se déclarer." },
            { who: '', text: "Il ne releva pas les yeux tout de suite. Il attendit. Il savait qu'Alpha allait venir." },
            { who: 'Alpha', text: "Regarde ça. La boucle Telegram de la promotion s'est enflammée d'un coup." },
            { who: 'Kirito', text: "Un dossier anonyme… un faux ordre de virement de cinq millions de francs CFA du BDE vers un compte secret." },
            { who: 'Kirito', text: "Et un fichier audio, soi-disant envoyé par Musashi elle-même." },
            { who: 'Extrait audio suspect', text: "« Transférez l'argent en cachette, l'administration ne verra rien. Vos diplômes sont assurés. »" },
            { who: 'Alpha', text: "On a environ quarante-cinq minutes avant que l'administration ne supprime le BDE et ne renvoie Musashi. Si on arrive à prouver le contraire avant…" },
            { who: 'Kirito', text: "Alors ne perdons pas une seconde. Premiers indices : les numéros du reçu ressemblent à ceux de la banque de l'école, et la voix… ressemble exactement à celle de Musashi." },
            { who: 'Kirito', text: "À première vue, tout ça a l'air vrai. Et c'est bien ce qui m'inquiète." }
          ],
          next: 'carte_acte2'
        },

        carte_acte2: {
          type: 'map',
          background: 'carte',
          intro: "Trois pistes s'ouvrent à Kirito. Où enquêter en premier ?",
          points: [
            { id: 'zenitsu', label: 'Zenitsu — Couloir principal', x: 22, y: 62, goto: 'temoin_zenitsu' },
            { id: 'goemon', label: 'Goemon — Salle informatique', x: 55, y: 40, goto: 'temoin_goemon' },
            { id: 'musashi', label: 'Musashi — Bureau du BDE', x: 80, y: 68, goto: 'temoin_musashi' }
          ],
          // la carte ne passe à la suite que lorsque les 3 points ont été visités
          requireAll: true,
          next: 'analyse_etape2'
        },

        temoin_zenitsu: {
          type: 'dialogue',
          background: 'couloir',
          lines: [
            { who: 'Zenitsu', text: "(en bégayant) C'est pas moi ! Je t'assure, c'est Goemon qui a partagé le lien depuis un forum !" },
            { who: 'Zenitsu', text: "Tout le monde a entendu la voix de Musashi ! Comment veux-tu que ce soit faux ?!" }
          ],
          next: 'retour_carte'
        },

        temoin_goemon: {
          type: 'dialogue',
          background: 'salle_info',
          lines: [
            { who: 'Goemon', text: "J'ai vérifié ce que j'ai pu sur le serveur Discord CampusTruth, où un profil nommé Shadow_01 a posté ça." },
            { who: 'Goemon', text: "Les numéros de la banque avaient l'air corrects. Ça m'a paru assez crédible pour que je le partage." }
          ],
          next: 'retour_carte'
        },

        temoin_musashi: {
          type: 'dialogue',
          background: 'bureau_bde',
          lines: [
            { who: 'Musashi', text: "C'est un piège. Je n'ai jamais dit ça. Ce virement est un faux." },
            { who: 'Musashi', text: "Hier soir, à l'heure exacte écrite sur ce faux reçu, j'étais en réunion avec le directeur. Je n'avais même pas accès aux comptes de l'école." }
          ],
          next: 'retour_carte'
        },

        // scène technique invisible : renvoie vers la carte tant que tout n'est pas visité
        retour_carte: { type: 'map', redirectTo: 'carte_acte2' },

        analyse_etape2: {
          type: 'dialogue',
          background: 'bibliotheque',
          lines: [
            { who: 'Kirito', text: "Récapitulons. Le message vient d'une source cachée sur internet — Shadow_01." },
            { who: 'Kirito', text: "Et l'alibi de Musashi montre qu'il était impossible qu'elle fasse ce virement à cette heure-là." },
            { who: 'Alpha', text: "Un compte anonyme combiné à un alibi en béton… La rumeur commence sérieusement à vaciller." },
            { who: 'Kirito', text: "Ça sent le coup monté. Mais il nous faut des preuves techniques, irréfutables. Direction la salle d'étude." }
          ],
          next: 'chap2:acte3_intro',
          unlocks: 'chap2'
        }
      }
    },

    // CHAPITRE II — LE SILENCE  (Acte III du scénario)

    {
      id: 'chap2',
      number: 'II',
      title: 'Le Silence',
      locked: true,
      startScene: 'acte3_intro',
      progressPath: [
        { id: 'acte3_intro', label: 'Retour au calme' },
        { id: 'preuves_acte3', label: 'Analyse technique' },
        { id: 'analyse_etape3', label: 'Conclusion technique' }
      ],
      scenes: {

        acte3_intro: {
          type: 'dialogue',
          background: 'salle_etude',
          lines: [
            { who: 'Alpha', text: "De retour dans la salle d'étude. Cette fois, on vérifie chaque élément de manière scientifique." },
            { who: 'Kirito', text: "Le reçu, l'audio, et le compte Shadow_01. Trois preuves à décortiquer." }
          ],
          next: 'preuves_acte3'
        },

        preuves_acte3: {
          type: 'evidence',
          background: 'salle_etude',
          intro: 'Examine chaque preuve pour révéler ce que Kirito et Alpha ont découvert.',
          items: [
            {
              id: 'recu',
              label: 'Le reçu de banque',
              detail: "Le fond du document vient d'un modèle gratuit de facture. Des défauts carrés autour du montant et du nom de Musashi prouvent que le texte a été ajouté par-dessus, après coup."
            },
            {
              id: 'audio',
              label: 'Le fichier audio',
              detail: "Aucun bruit de respiration humaine, des coupures bizarres entre les mots : le logiciel détecte la marque d'une IA qui a copié la voix de Musashi à partir de ses anciens discours."
            },
            {
              id: 'compte',
              label: "Le compte Shadow_01",
              detail: "Le compte a été créé le jour même à trois heures du matin, et a envoyé le même message à quarante-cinq groupes en moins de dix secondes. Le travail d'un bot automatique."
            }
          ],
          next: 'analyse_etape3'
        },

        analyse_etape3: {
          type: 'dialogue',
          background: 'salle_etude',
          lines: [
            { who: 'Kirito', text: "Montage sur l'image, fausse voix générée par ordinateur, envoi automatique par des robots…" },
            { who: 'Alpha', text: "Des preuves techniques impossibles à nier. Le dossier et l'audio sont totalement faux, à cent pour cent." },
            { who: 'Kirito', text: "Il ne reste plus qu'à tout présenter avant que le directeur ne commette l'irréparable." }
          ],
          next: 'chap3:acte4_intro',
          unlocks: 'chap3'
        }
      }
    },


    // CHAPITRE III  LA TRAHISON  (Acte IV + Épilogue)

    {
      id: 'chap3',
      number: 'III',
      title: 'La Trahison',
      locked: true,
      startScene: 'acte4_intro',
      progressPath: [
        { id: 'acte4_intro', label: 'Le tribunal' },
        { id: 'decision_verdict', label: 'Le verdict' },
        { id: 'resultat_victoire', label: 'La vérité éclate' },
        { id: 'epilogue', label: 'Épilogue' }
      ],
      scenes: {

        acte4_intro: {
          type: 'dialogue',
          background: 'bureau_directeur',
          lines: [
            { who: '', text: "Le directeur s'apprêtait à punir Musashi à cause de la panique générale. C'est le moment qu'a choisi Kirito pour présenter la vérité." }
          ],
          next: 'decision_verdict'
        },

        decision_verdict: {
          type: 'decision',
          background: 'bureau_directeur',
          prompt: "Kirito rassemble toutes les pièces du puzzle. Quel est le verdict ?",
          choices: [
            {
              label: "Le dossier est un faux fabriqué par un groupe de robots informatiques.",
              correct: true,
              goto: 'resultat_victoire'
            },
            {
              label: "Musashi est bien coupable, les preuves sont accablantes.",
              correct: false,
              goto: 'resultat_erreur'
            }
          ]
        },

        resultat_erreur: {
          type: 'dialogue',
          background: 'bureau_directeur',
          lines: [
            { who: 'Alpha', text: "Attends, Kirito… relis les preuves. L'alibi, le montage sur l'image, la fausse voix. Rien de tout ça n'accable Musashi." },
            { who: 'Kirito', text: "Tu as raison. Reprenons, posément, avec ce qu'on sait vraiment." }
          ],
          next: 'decision_verdict'
        },

        resultat_victoire: {
          type: 'result',
          background: 'bureau_directeur',
          title: 'Le verdict',
          text: "En combinant la façon dont la rumeur s'est propagée, l'alibi de Musashi et les preuves informatiques, la conclusion est certaine : le dossier complet est un mensonge fabriqué par un groupe de robots informatiques.\n\nAlpha diffusa l'article de vérité sur le réseau de l'école. La rumeur disparut aussitôt, la punition de Musashi fut annulée, et les étudiants comprirent qu'ils avaient été trompés.",
          next: 'epilogue'
        },

        epilogue: {
          type: 'dialogue',
          background: 'exterieur_nuit',
          lines: [
            { who: '', text: "Kirito rangea ses affaires, fatigué mais soulagé. L'écran de son téléphone s'alluma tout seul, affichant un message de menace :" },
            { who: 'Message inconnu', text: "« Tu as de très bons réflexes, Kirito. Tu as sauvé ton petit campus. Mais c'était juste un entraînement pour tester notre programme sur vos réactions humaines. »" },
            { who: 'Message inconnu', text: "« Voyons comment tu t'en sortiras quand ce sera tout un pays qui croira à nos mensonges. Prépare-toi. »" }
          ],
          next: 'fin'
        },

        fin: {
          type: 'result',
          background: 'exterieur_nuit',
          title: 'Fin du chapitre III',
          text: "À suivre…",
          next: null
        }
      }
    }
  ]
};

// Export global (pas de bundler : chargement via <script> classique)
window.GAME_DATA = GAME_DATA;
