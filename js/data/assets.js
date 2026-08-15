const ASSET_BACKGROUNDS = {
  bibliotheque: "assets/images/backgrounds/processed/bibliotheque_de_l'universite.png",
  couloir: "assets/images/backgrounds/processed/couloir_de_l'universite.png",
.
  salle_info: "assets/images/backgrounds/processed/image_de_l'interface_discord_de_kirito.png",

  bureau_bde: 'assets/images/backgrounds/processed/bureau_du_directeur_vue_moins_zoomer.png',
  bureau_directeur: 'assets/images/backgrounds/processed/bureau_du_directeur.png',
  salle_etude: "assets/images/backgrounds/processed/salle_d'etude.png",

  exterieur_nuit: "assets/images/backgrounds/processed/image_de_texte_ecris_par_l'antagoniste.png",
  // Repères additionnels disponibles pour un usage futur
  salle_serveur: 'assets/images/backgrounds/processed/salle_des_serveur.png',
  salle_multimedia: 'assets/images/backgrounds/processed/salle_mutimedia.png',
  salle_archives: 'assets/images/backgrounds/processed/salle_des_archive.png',
  cafeteria: 'assets/images/backgrounds/processed/cafeteria.png',
  jardin: 'assets/images/backgrounds/processed/jardin_du_campus.png',
  toit: "assets/images/backgrounds/processed/toit_de_l'universite.png",
  campus_jour: 'assets/images/backgrounds/processed/image_du_batiment_principal_du_campus_de_jour.png',
  campus_nuit: 'assets/images/backgrounds/processed/image_du_batiment_principal_du_campus_de_nuit.png',
  portail_nuit: "assets/images/backgrounds/processed/portail_du_campus_vue_exterieure_de_nuit.png",
  salle_reunion: 'assets/images/backgrounds/processed/salle_de_reunion.png',
  salle_commune: 'assets/images/backgrounds/processed/salle_commune_etudiante.png',
  chambre_etudiant: "assets/images/backgrounds/processed/chambre_d'un_etudiant.png",
  rue_campus: 'assets/images/backgrounds/processed/rue_pres_du_campus.png',
  campus_vent: 'assets/images/backgrounds/processed/campus_sous_le_vent.png',
  // Prologue : ambiance campus balayé par le vent, ton solennel
  prologue: 'assets/images/backgrounds/processed/campus_sous_le_vent.png',

  carte: 'assets/images/backgrounds/processed/jardin_du_campus.png',
  // Utilisé spécifiquement pour l'item "audio" de l'écran de preuves
  interface_audio: "assets/images/backgrounds/processed/interface_du_logiciel_d'analyse_audio_durant_la_verification_de_l'audio.png",
  interface_whatsapp: "assets/images/backgrounds/processed/image_de_telephone_dans_l'interface_whatzapp_de_la_promo.png"

};


const ASSET_CHARACTERS = {
  kirito: {
    neutre: 'assets/images/characters/kirito/kirito_posture_1.png',
    buste: "assets/images/characters/kirito/kirito_posture_2_du_desuus_de_la_poitrine_a_la_tete.png",
    reflexion: "assets/images/characters/kirito/kirito_posture_3_du_desuus_de_la_poitrine_a_la_tete_posture_de_reflextion.png",
    corps_entier: 'assets/images/characters/kirito/kirito_posture_4_tete_au_pied.png'
  },
  alpha: {
    neutre: 'assets/images/characters/alpha/alpha_posture_1.png',
    reflexion: 'assets/images/characters/alpha/alpha_posture_2.png',
    portrait: 'assets/images/characters/alpha/alpha_posture3.png',
    corps_entier: 'assets/images/characters/alpha/alpha_posture_vue_global_tete_au_pied.png'
  },
  musashi: {
    neutre: 'assets/images/characters/musashi/musashi_posture_1_confiant.png',
    portrait: 'assets/images/characters/musashi/musashi_posture_2_portrait.png',
    reflexion: 'assets/images/characters/musashi/musashi_posture_3_complete_reflexion.png',
    confiante: 'assets/images/characters/musashi/musashi_posture_4_complete_confiante.png',
    confiante2: 'assets/images/characters/musashi/musashi_posture_5_confiante.png'
  },
  zenitsu: {
    // Seule pose "calme" disponible pour l'instant : le portrait pensif
    neutre: 'assets/images/characters/zenitu/zenitu_posture_portrait_de_reflexion.png',
    inquiet: 'assets/images/characters/zenitu/zenitu_posture_semi_complete_intiguer.png',
    reflexion: 'assets/images/characters/zenitu/zenitu_posture_complete_reflexion.png'
  },
  // Une seule pose disponible : utilisée pour toutes ses lignes (validé)
  goemon: {
    neutre: 'assets/images/characters/ishikawa/ishikawa_posture.png'
  },
  directeur: {
    neutre: 'assets/images/characters/leDirecteur/processed/directeur_face.png'
  },
  shadow: {
    neutre: 'assets/images/characters/shadow/processed/shadow_debout.png',
    tablette: 'assets/images/characters/shadow/processed/shadow_tablette.png'
  }
};

window.ASSET_BACKGROUNDS = ASSET_BACKGROUNDS;
window.ASSET_CHARACTERS = ASSET_CHARACTERS;
