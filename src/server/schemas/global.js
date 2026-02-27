export default {
  running: {
    type: 'boolean',
    default: false,
  },
  startTime: {
    type: 'float',
    default: null,
    nullable: true,
  },
  position_01: { // entre 0 et 1
    type: 'float',
    default: 0.,
    min: 0.,
    max: 1.
  },
  timer_position_csv: { // Index de lecture de la position de l'iss dans le fichier csv (chez chaque client). 
    type: 'integer',
    default : 1,
    min: 1,
    max: 1395
  },
  position_coordonnee_latitude: { // Valeurs globales pour les afficher dans le controller (esthetique) entre 180 et -180
    type: 'float',
    default: 0.,
    min: -180.,
    max: 180.
  },  
  position_coordonnee_longitude: { // bah pareil
    type: 'float',
    default: 0,
    min: -180,
    max: 180
  }, 
  vitesse: { // après des tests nous fixons la vitesse de lecture à 50 pour un fichier csv contenant 2 révolutions correspondant à 1395 lignes.
    type: 'float',
    default: 50.,
    min: 2.,
    max: 100.
  },
  volume: {
    type: 'integer',
    default: -12,
  },
  mute :{
    type: 'boolean',
    default: true, // mettre à true des le debut !
  },
  mute_ISS :{
    type: 'boolean',
    default: false, // mettre à true des le debut !
  },
  chooseAudio: { // réinitialiser la mémoire des index des audios déjà choisis.
    type: 'boolean',
    default: false,
  },
  ////// pour le client Planet 
  distance: {
    type: 'float',
    default: 0.,
    min: 0.,
    max: 1.
  },
  isPlanetConnect : {
    type: 'boolean',
    default: false,
  },

  ///// valeurs paramètres de la nappe (identiques pour tous les raspberrys)
  position_1:{
    type:'float',
    min: 0.48,
    max: 2.43,
    default: 0,
    },
  period_1:{
    type:'float',
    min: 0.1,
    max: 1.02,
    default: 0.25,
    },
  Spray_1:{
    type:'float',
    min: 0.,
    max: 0.2,
    default: 0.,
    },
  position_2:{
    type:'float',
    min: 0,
    max: 3,
    default: 0.5,
    },
  period_2:{
    type:'float',
    min: 1,
    max: 3,
    default: 1,
    },
  Spray_2:{
    type:'float',
    min: 0.,
    max: 1.,
    default: 0.,
    }

};