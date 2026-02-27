export default {
id: {
  type:'integer',
  required: true,
},
muteClient:{
  type:'boolean',
  default: false,
  },
volumeClient:{
  type:'float',
  min:0.,
  max:1.,
  default:0.,
  },
volumeAllFond:{
  type:'float',
  min: 0,
  max: 1.,
  default: 0,
  },
VolumeISS:{
  type:'float',
  min: 0.,
  max:1. ,
  default: 0,
  },


///// granular fond 1 
duration_1:{
    type:'float',
    min: 1.,
    max: 2.,
    default: 1.,
  },
volumeClient_1:{
    type:'float',
    min:0,
    max:1,
    default:0.5, // il est très fort il prend  le pas sur tout !
  },

///   granulaire fond 2
duration_2:{
    type:'float',
    min: 1.,
    max: 2.,
    default: 1.,
    },

volumeClient_2:{
    type:'float',
    min:0,
    max:1,
    default:0.5,
  }
};