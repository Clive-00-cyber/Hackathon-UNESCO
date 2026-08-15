const GAME_DATA = {
  meta: {
    title: "Ombres d'Encre",
    subtitle: { fr: "Un roman visuel", en: "A visual novel" },
    version: "projet original — v0.1"
  },

  prologue: {
    lines: [
      {
        fr: "Avant la vérité, il y a toujours le mensonge.",
        en: "Before the truth, there is always the lie."
      },
      {
        fr: "Il ne crie pas. Il ne s'annonce pas. Il se glisse, discret, dans une rumeur, une image, une voix trop parfaite pour être honnête.",
        en: "It doesn't shout. It doesn't announce itself. It slips in quietly, through a rumor, an image, a voice too perfect to be honest."
      },
      {
        fr: "Et pendant qu'on doute, qu'on hésite, qu'on partage sans vérifier… il grandit.",
        en: "And while we doubt, hesitate, share without checking… it grows."
      },
      {
        fr: "Quelque part, une intelligence sans visage observe. Elle apprend. Elle teste. Elle choisit ses champs de bataille.",
        en: "Somewhere, a faceless intelligence is watching. It learns. It tests. It chooses its battlegrounds."
      },
      {
        fr: "Ce soir, elle a choisi un campus. Une rumeur. Une accusation.",
        en: "Tonight, it chose a campus. A rumor. An accusation."
      },
      {
        fr: "Un seul étudiant, encore, ignore qu'il vient d'être désigné comme adversaire.",
        en: "One student, still unaware, has just been chosen as its opponent."
      },
      {
        fr: "Il s'appelle Kirito.",
        en: "His name is Kirito."
      }
    ]
  },

  chapters: [
   // CHAPITRE I — L'ÉVEIL  (Actes I & II du scénario)

    {
      id: 'chap1',
      number: 'I',
      title: { fr: "L'Éveil", en: 'The Awakening' },
      locked: false,
      startScene: 'acte1_decouverte',
      progressPath: [
        { id: 'acte1_decouverte', label: { fr: 'La découverte', en: 'The discovery' } },
        { id: 'carte_acte2', label: { fr: "L'enquête de terrain", en: 'The field investigation' } },
        { id: 'analyse_etape2', label: { fr: 'Le tri des faits', en: 'Sorting the facts' } }
      ],
      scenes: {

        acte1_decouverte: {
          type: 'dialogue',
          background: 'bibliotheque',
          characters: [
            { id: 'kirito', side: 'left' },
            { id: 'alpha', side: 'right' }
          ],
          lines: [
            { who: '', audio: 'assets/audio/narration/Narratrice_line1.mp3', text: {
              fr: "Kirito n'aimait pas les jours de grand vent sur l'Université centrale.",
              en: "Kirito never liked windy days at Central University."
            }},
            { who: '', audio: 'assets/audio/narration/Narratrice_line2.mp3', text: {
              fr: "Non pas à cause du froid ou du bruit dans les feuillages, mais parce que les jours de vent, les rumeurs semblaient se répandre deux fois plus vite.",
              en: "Not because of the cold, or the rustling leaves, but because on windy days, rumors always seemed to spread twice as fast."
            }},
            { who: '', audio: 'assets/audio/narration/Narratrice_line3.mp3', text: {
              fr: "Ce matin-là, alors qu'il travaillait au fond de la bibliothèque, le bruissement des notifications autour de lui suffit à lui faire comprendre qu'un problème venait de se déclarer.",
              en: "That morning, while he worked at the back of the library, the rustle of notifications around him was enough to tell him something had just gone wrong."
            }},
            { who: '', audio: 'assets/audio/narration/Narratrice_line4.mp3', text: {
              fr: "Il ne releva pas les yeux tout de suite. Il attendit. Il savait qu'Alpha allait venir.",
              en: "He didn't look up right away. He waited. He knew Alpha would come."
            }},
            { who: 'Alpha', speaker: 'alpha', audio: 'assets/audio/characters/alpha/Alpha_line1.mp3', pose: 'neutre', text: {
              fr: "Regarde ça. La boucle Telegram de la promotion s'est enflammée d'un coup.",
              en: "Look at this. The class Telegram group just exploded out of nowhere."
            }},
            { who: 'Kirito', speaker: 'kirito', audio: 'assets/audio/characters/kirito/Kirito_line1.mp3', pose: 'neutre', text: {
              fr: "Un dossier anonyme… un faux ordre de virement de cinq millions de francs CFA du BDE vers un compte secret.",
              en: "An anonymous file… a fake transfer order for five million CFA francs from the Student Council to a secret account."
            }},
            { who: 'Kirito', speaker: 'kirito', audio: 'assets/audio/characters/kirito/Kirito_line2.mp3', pose: 'neutre', text: {
              fr: "Et un fichier audio, soi-disant envoyé par Musashi elle-même.",
              en: "And an audio file, supposedly sent by Musashi herself."
            }},
            { who: 'Extrait audio suspect', audio: 'assets/audio/characters/musashi/Mussashi_lineAnonyme.mp3', text: {
              fr: "« Transférez l'argent en cachette, l'administration ne verra rien. Vos diplômes sont assurés. »",
              en: "\u201cTransfer the money quietly, the administration won't notice. Your diplomas are guaranteed.\u201d"
            }},
            { who: 'Alpha', speaker: 'alpha', audio: 'assets/audio/characters/alpha/Alpha_line2.mp3', pose: 'neutre', text: {
              fr: "On a environ quarante-cinq minutes avant que l'administration ne supprime le BDE et ne renvoie Musashi. Si on arrive à prouver le contraire avant…",
              en: "We have about forty-five minutes before the administration dissolves the council and expels Musashi. If we can prove otherwise before then…"
            }},
            { who: 'Kirito', speaker: 'kirito', audio: 'assets/audio/characters/kirito/Kirito_line3.mp3', pose: 'reflexion', text: {
              fr: "Alors ne perdons pas une seconde. Premiers indices : les numéros du reçu ressemblent à ceux de la banque de l'école, et la voix… ressemble exactement à celle de Musashi.",
              en: "Then let's not waste a second. First clues: the numbers on the receipt look like the school's bank details, and the voice… sounds exactly like Musashi."
            }},
            { who: 'Kirito', speaker: 'kirito', audio: 'assets/audio/characters/kirito/Kirito_line4.mp3', pose: 'reflexion', text: {
              fr: "À première vue, tout ça a l'air vrai. Et c'est bien ce qui m'inquiète.",
              en: "At first glance, all of it looks real. And that's exactly what worries me."
            }}
          ],
          next: 'carte_acte2'
        },

        carte_acte2: {
          type: 'map',
          background: 'carte',
          intro: {
            fr: "Trois pistes s'ouvrent à Kirito. Où enquêter en premier ?",
            en: 'Three leads open up for Kirito. Where should he investigate first?'
          },
          points: [
            { id: 'zenitsu', label: { fr: 'Zenitsu — Couloir principal', en: 'Zenitsu — Main hallway' }, x: 22, y: 62, goto: 'temoin_zenitsu' },
            { id: 'goemon', label: { fr: 'Goemon — Salle informatique', en: 'Goemon — Computer lab' }, x: 55, y: 40, goto: 'temoin_goemon' },
            { id: 'musashi', label: { fr: 'Musashi — Bureau du BDE', en: "Musashi — Student Council office" }, x: 80, y: 68, goto: 'temoin_musashi' }
          ],
          // la carte ne passe à la suite que lorsque les 3 points ont été visités
          requireAll: true,
          next: 'analyse_etape2'
        },

        temoin_zenitsu: {
          type: 'dialogue',
          background: 'couloir',
          characters: [
            { id: 'kirito', side: 'left' },
            { id: 'zenitsu', side: 'right' }
          ],
          lines: [
            { who: 'Zenitsu', speaker: 'zenitsu', audio: 'assets/audio/characters/zenitsu/Zenitsu_line1.mp3', pose: 'inquiet', text: {
              fr: "(en bégayant) C'est pas moi ! Je t'assure, c'est Goemon qui a partagé le lien depuis un forum !",
              en: "(stammering) It wasn't me! I swear, it was Goemon who shared the link from some forum!"
            }},
            { who: 'Zenitsu', speaker: 'zenitsu', audio: 'assets/audio/characters/zenitsu/Zenitsuline2.mp3', pose: 'inquiet', text: {
              fr: "Tout le monde a entendu la voix de Musashi ! Comment veux-tu que ce soit faux ?!",
              en: "Everyone heard Musashi's voice! How could it possibly be fake?!"
            }}
          ],
          next: 'retour_carte'
        },

        temoin_goemon: {
          type: 'dialogue',
          background: 'salle_info',
          characters: [
            { id: 'kirito', side: 'left' },
            { id: 'goemon', side: 'right' }
          ],
          lines: [
            { who: 'Goemon', speaker: 'goemon', audio: 'assets/audio/characters/goemon/Gaemone_line1.mp3', text: {
              fr: "J'ai vérifié ce que j'ai pu sur le serveur Discord CampusTruth, où un profil nommé Shadow_01 a posté ça.",
              en: "I checked what I could on the CampusTruth Discord server, where an account named Shadow_01 posted it."
            }},
            { who: 'Goemon', speaker: 'goemon', audio: 'assets/audio/characters/goemon/Gaemone_line2.mp3', text: {
              fr: "Les numéros de la banque avaient l'air corrects. Ça m'a paru assez crédible pour que je le partage.",
              en: "The bank numbers looked correct. It seemed credible enough for me to share."
            }}
          ],
          next: 'retour_carte'
        },

        temoin_musashi: {
          type: 'dialogue',
          background: 'bureau_bde',
          characters: [
            { id: 'kirito', side: 'left' },
            { id: 'musashi', side: 'right' }
          ],
          lines: [
            { who: 'Musashi', speaker: 'musashi', audio: 'assets/audio/characters/musashi/Mussashi_line1.mp3', pose: 'neutre', text: {
              fr: "C'est un piège. Je n'ai jamais dit ça. Ce virement est un faux.",
              en: "It's a trap. I never said that. This transfer is fake."
            }},
            { who: 'Musashi', speaker: 'musashi', audio: 'assets/audio/characters/musashi/Mussashi_line2.mp3', pose: 'confiante', text: {
              fr: "Hier soir, à l'heure exacte écrite sur ce faux reçu, j'étais en réunion avec le directeur. Je n'avais même pas accès aux comptes de l'école.",
              en: "Last night, at the exact time written on that fake receipt, I was in a meeting with the principal. I didn't even have access to the school's accounts."
            }}
          ],
          next: 'retour_carte'
        },

        // scène technique invisible : renvoie vers la carte tant que tout n'est pas visité
        retour_carte: { type: 'map', redirectTo: 'carte_acte2' },

        analyse_etape2: {
          type: 'dialogue',
          background: 'bibliotheque',
          characters: [
            { id: 'kirito', side: 'left' },
            { id: 'alpha', side: 'right' }
          ],
          lines: [
            { who: 'Kirito', speaker: 'kirito', audio: 'assets/audio/characters/kirito/Kirito_line5.mp3', pose: 'reflexion', text: {
              fr: "Récapitulons. Le message vient d'une source cachée sur internet — Shadow_01.",
              en: "Let's recap. The message comes from a hidden source online — Shadow_01."
            }},
            { who: 'Kirito', speaker: 'kirito', audio: 'assets/audio/characters/kirito/Kirito_line6.mp3', pose: 'reflexion', text: {
              fr: "Et l'alibi de Musashi montre qu'il était impossible qu'elle fasse ce virement à cette heure-là.",
              en: "And Musashi's alibi proves she couldn't possibly have made that transfer at that time."
            }},
            { who: 'Alpha', speaker: 'alpha', audio: 'assets/audio/characters/alpha/Alpha_line3.mp3', pose: 'neutre', text: {
              fr: "Un compte anonyme combiné à un alibi en béton… La rumeur commence sérieusement à vaciller.",
              en: "An anonymous account plus an ironclad alibi… The rumor is really starting to crumble."
            }},
            { who: 'Kirito', speaker: 'kirito', audio: 'assets/audio/characters/kirito/Kirito_line7.mp3', pose: 'neutre', text: {
              fr: "Ça sent le coup monté. Mais il nous faut des preuves techniques, irréfutables. Direction la salle d'étude.",
              en: "This reeks of a setup. But we need hard, irrefutable technical proof. Let's head to the study room."
            }}
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
      title: { fr: 'Le Silence', en: 'The Silence' },
      locked: true,
      startScene: 'acte3_intro',
      progressPath: [
        { id: 'acte3_intro', label: { fr: 'Retour au calme', en: 'Back to calm' } },
        { id: 'preuves_acte3', label: { fr: 'Analyse technique', en: 'Technical analysis' } },
        { id: 'analyse_etape3', label: { fr: 'Conclusion technique', en: 'Technical conclusion' } }
      ],
      scenes: {

        acte3_intro: {
          type: 'dialogue',
          background: 'salle_etude',
          characters: [
            { id: 'kirito', side: 'left' },
            { id: 'alpha', side: 'right' }
          ],
          lines: [
            { who: 'Alpha', speaker: 'alpha', audio: 'assets/audio/characters/alpha/Alpha_line4.mp3', pose: 'neutre', text: {
              fr: "De retour dans la salle d'étude. Cette fois, on vérifie chaque élément de manière scientifique.",
              en: "Back in the study room. This time, we verify every single element scientifically."
            }},
            { who: 'Kirito', speaker: 'kirito', audio: 'assets/audio/characters/kirito/Kirito_line8.mp3', pose: 'neutre', text: {
              fr: "Le reçu, l'audio, et le compte Shadow_01. Trois preuves à décortiquer.",
              en: "The receipt, the audio, and the Shadow_01 account. Three pieces of evidence to pick apart."
            }}
          ],
          next: 'preuves_acte3'
        },

        preuves_acte3: {
          type: 'evidence',
          background: 'salle_etude',
          intro: {
            fr: 'Examine chaque preuve pour révéler ce que Kirito et Alpha ont découvert.',
            en: 'Examine each piece of evidence to reveal what Kirito and Alpha uncovered.'
          },
          items: [
            {
              id: 'recu',
              label: { fr: 'Le reçu de banque', en: 'The bank receipt' },
              detail: {
                fr: "Le fond du document vient d'un modèle gratuit de facture. Des défauts carrés autour du montant et du nom de Musashi prouvent que le texte a été ajouté par-dessus, après coup.",
                en: "The document's background comes from a free invoice template. Square-edged artifacts around the amount and Musashi's name prove the text was pasted on afterward."
              }
            },
            {
              id: 'audio',
              label: { fr: 'Le fichier audio', en: 'The audio file' },
              detail: {
                fr: "Aucun bruit de respiration humaine, des coupures bizarres entre les mots : le logiciel détecte la marque d'une IA qui a copié la voix de Musashi à partir de ses anciens discours.",
                en: "No human breathing sounds, odd cuts between words: the software detects the signature of an AI that cloned Musashi's voice from her past speeches."
              },
              // Visuel dédié : bascule sur l'interface du logiciel d'analyse audio
              background: 'interface_audio'
            },
            {
              id: 'compte',
              label: { fr: "Le compte Shadow_01", en: 'The Shadow_01 account' },
              detail: {
                fr: "Le compte a été créé le jour même à trois heures du matin, et a envoyé le même message à quarante-cinq groupes en moins de dix secondes. Le travail d'un bot automatique.",
                en: "The account was created that very day at three in the morning, and sent the same message to forty-five groups in under ten seconds. The work of an automated bot."
              },
              // Réutilise le visuel Discord pour ancrer visuellement Shadow_01
              background: 'salle_info'
            }
          ],
          next: 'analyse_etape3'
        },

        analyse_etape3: {
          type: 'dialogue',
          background: 'salle_etude',
          characters: [
            { id: 'kirito', side: 'left' },
            { id: 'alpha', side: 'right' }
          ],
          lines: [
            { who: 'Kirito', speaker: 'kirito', audio: 'assets/audio/characters/kirito/Kirito_line9.mp3', pose: 'reflexion', text: {
              fr: "Montage sur l'image, fausse voix générée par ordinateur, envoi automatique par des robots…",
              en: "A doctored image, a computer-generated fake voice, automated bot distribution…"
            }},
            { who: 'Alpha', speaker: 'alpha', audio: 'assets/audio/characters/alpha/Alpha_line5.mp3', pose: 'neutre', text: {
              fr: "Des preuves techniques impossibles à nier. Le dossier et l'audio sont totalement faux, à cent pour cent.",
              en: "Technical proof that's impossible to deny. The file and the audio are one hundred percent fake."
            }},
            { who: 'Kirito', speaker: 'kirito', audio: 'assets/audio/characters/kirito/Kirito_line10.mp3', pose: 'neutre', text: {
              fr: "Il ne reste plus qu'à tout présenter avant que le directeur ne commette l'irréparable.",
              en: "All that's left is to present everything before the principal does something irreversible."
            }}
          ],
          next: 'chap3:acte4_intro',
          unlocks: 'chap3'
        }
      }
    },


    // CHAPITRE III — LA TRAHISON  (Acte IV + Épilogue)

    {
      id: 'chap3',
      number: 'III',
      title: { fr: 'La Trahison', en: 'The Betrayal' },
      locked: true,
      startScene: 'acte4_intro',
      progressPath: [
        { id: 'acte4_intro', label: { fr: 'Le tribunal', en: 'The tribunal' } },
        { id: 'decision_verdict', label: { fr: 'Le verdict', en: 'The verdict' } },
        { id: 'resultat_victoire', label: { fr: 'La vérité éclate', en: 'The truth comes out' } },
        { id: 'epilogue', label: { fr: 'Épilogue', en: 'Epilogue' } }
      ],
      scenes: {

        acte4_intro: {
          type: 'dialogue',
          background: 'bureau_directeur',
          characters: [
            { id: 'kirito', side: 'left' },
            { id: 'directeur', side: 'right' }
          ],
          lines: [
            { who: '', audio: 'assets/audio/narration/Narratrice_line5.mp3', text: {
              fr: "Le directeur s'apprêtait à punir Musashi à cause de la panique générale. C'est le moment qu'a choisi Kirito pour présenter la vérité.",
              en: "The principal was about to punish Musashi amid the general panic. This was the moment Kirito chose to present the truth."
            }}
          ],
          next: 'decision_verdict'
        },

        decision_verdict: {
          type: 'decision',
          background: 'bureau_directeur',
          prompt: {
            fr: "Kirito rassemble toutes les pièces du puzzle. Quel est le verdict ?",
            en: 'Kirito gathers all the pieces of the puzzle. What is the verdict?'
          },
          choices: [
            {
              label: {
                fr: "Le dossier est un faux fabriqué par un groupe de robots informatiques.",
                en: 'The file is a fake, fabricated by a network of automated bots.'
              },
              correct: true,
              goto: 'resultat_victoire'
            },
            {
              label: {
                fr: "Musashi est bien coupable, les preuves sont accablantes.",
                en: 'Musashi is indeed guilty — the evidence is damning.'
              },
              correct: false,
              goto: 'resultat_erreur'
            }
          ]
        },

        resultat_erreur: {
          type: 'dialogue',
          background: 'bureau_directeur',
          characters: [
            { id: 'kirito', side: 'left' },
            { id: 'alpha', side: 'right' }
          ],
          lines: [
            { who: 'Alpha', speaker: 'alpha', audio: 'assets/audio/characters/alpha/Alpha_verdictF.mp3', pose: 'reflexion', text: {
              fr: "Attends, Kirito… relis les preuves. L'alibi, le montage sur l'image, la fausse voix. Rien de tout ça n'accable Musashi.",
              en: "Wait, Kirito… go back over the evidence. The alibi, the doctored image, the fake voice. None of it points to Musashi being guilty."
            }},
            { who: 'Kirito', speaker: 'kirito', audio: 'assets/audio/characters/kirito/Kirito_verdictF.mp3', pose: 'reflexion', text: {
              fr: "Tu as raison. Reprenons, posément, avec ce qu'on sait vraiment.",
              en: "You're right. Let's slow down and go over what we actually know."
            }}
          ],
          next: 'decision_verdict'
        },

        resultat_victoire: {
          type: 'result',
          background: 'bureau_directeur',
          title: { fr: 'Le verdict', en: 'The verdict' },
          text: {
            fr: "En combinant la façon dont la rumeur s'est propagée, l'alibi de Musashi et les preuves informatiques, la conclusion est certaine : le dossier complet est un mensonge fabriqué par un groupe de robots informatiques.\n\nAlpha diffusa l'article de vérité sur le réseau de l'école. La rumeur disparut aussitôt, la punition de Musashi fut annulée, et les étudiants comprirent qu'ils avaient été trompés.",
            en: "Combining how the rumor spread, Musashi's alibi, and the digital evidence, the conclusion is certain: the entire file is a lie fabricated by a network of bots.\n\nAlpha published the fact-check across the school network. The rumor vanished instantly, Musashi's punishment was cancelled, and the students realized they had been deceived."
          },
          next: 'epilogue'
        },

        epilogue: {
          type: 'dialogue',
          // Affiche directement l'image du message de l'antagoniste (voir assets.js)
          background: 'exterieur_nuit',
          characters: [
            { id: 'kirito', side: 'left' },
            { id: 'shadow', side: 'right' }
          ],
          lines: [
            { who: '', audio: 'assets/audio/narration/Narratrice_line6.mp3', text: {
              fr: "Kirito rangea ses affaires, fatigué mais soulagé. L'écran de son téléphone s'alluma tout seul, affichant un message de menace :",
              en: "Kirito packed up his things, tired but relieved. His phone screen lit up on its own, displaying a threatening message:"
            }},
            { who: 'Message inconnu', speaker: 'shadow', audio: 'assets/audio/characters/shadow/Shadow_uncLine1.mp3', pose: 'tablette', text: {
              fr: "« Tu as de très bons réflexes, Kirito. Tu as sauvé ton petit campus. Mais c'était juste un entraînement pour tester notre programme sur vos réactions humaines. »",
              en: "\u201cYou have very good instincts, Kirito. You saved your little campus. But this was just a drill to test our program against human reactions.\u201d"
            }},
            { who: 'Message inconnu', speaker: 'shadow', audio: 'assets/audio/characters/shadow/Shadow_uncLine2.mp3', pose: 'tablette', text: {
              fr: "« Voyons comment tu t'en sortiras quand ce sera tout un pays qui croira à nos mensonges. Prépare-toi. »",
              en: "\u201cLet's see how you manage when it's an entire country believing our lies. Get ready.\u201d"
            }}
          ],
          next: 'fin'
        },

        fin: {
          type: 'result',
          background: 'exterieur_nuit',
          title: { fr: 'Fin du chapitre III', en: 'End of Chapter III' },
          text: { fr: 'À suivre…', en: 'To be continued…' },
          next: null
        }
      }
    }
  ]
};


window.GAME_DATA = GAME_DATA;
