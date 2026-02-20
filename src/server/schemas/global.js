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
  timer_position_csv: {
    type: 'integer',
    default : 1,
    min: 1,
    max: 595
  },
  position_coordonnee_latitude: { // entre 180 et -180
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
  vitesse: {
    type: 'float',
    default: 5.,
    min: 2.,
    max: 20.
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
  distance: {
    type: 'float',
    default: 0.,
    min: 0.,
    max: 1.
  }
};