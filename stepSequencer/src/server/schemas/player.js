export default {
id: {
  type:'integer',
  required: true,
},
id_modulo:{
  type:'integer',
  min: 0,
  max: 8, // 8 raspberry
  default: 0,
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
  max: 40.,
  default: 0,
  },
VolumeISS:{
  type:'float',
  min: 0.,
  max:40. ,
  default: 0,
  },
///// granular fond 1 
period_1:{
    type:'float',
    min: 1,
    max: 2,
    default: 2,
  },
position_1:{
    type:'float',
    min: 0,
    max: 3,
    default: 0.5,
    },
duration_1:{
    type:'float',
    min: 0.1,
    max: 0.5,
    default: 0.25,
    },
Spray_1:{
    type:'float',
    min: 0.,
    max: 0.2,
    default: 0.,
    },
volumeClient_1:{
    type:'float',
    min:0,
    max:0.5,
    default:0.1, // il est très fort il prend  le pas sur tout !
  },

///   granulaire fond 2
period_2:{
    type:'float',
    min: 1.,
    max: 2.,
    default: 1.,
    },
position_2:{
    type:'float',
    min: 0.48,
    max: 2.43,
    default: 0,
  },
duration_2:{
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
  },
volumeClient_2:{
    type:'float',
    min:0,
    max:1,
    default:0.5,
  },

//// granualire fond 3 ---> celui là est pas mal mais il reste quand meme pleins d'ajustements
period_3:{
    type:'float',
    min: 0.05,
    max: 2.,
    default: 0.08,
    },
position_3:{
    type:'float',
    min: 2.43,
    max: 3.,
    default: 2.45,
  },
duration_3:{
    type:'float',
    min: 0.1,
    max: 3,
    default: 1.75,
  },
Spray_3:{
    type:'float',
    min: 0.,
    max: 1.,
    default: 0.85,
  },
volumeClient_3:{
    type:'float',
    min:0,
    max:1,
    default:0, // 0.6 !! on l'entend beaucoup et meme beaucoup trop
  },

  ///// granulaire fond 4
period_4:{
    type:'float',
    min: 0.04,
    max: 0.15,
    default: 0.1,
  },
position_4:{
    type:'float',
    min: 0.,
    max: 3.,
    default: 1.,
  },
duration_4:{
    type:'float',
    min: 0.01,
    max: 3,
    default: 0.06,
  },
Spray_4:{
    type:'float',
    min: 0.,
    max: 1.,
    default: 0.71,
  },
volumeClient_4:{
    type:'float',
    min:0,
    max:1,
    default:0.3, // 
  },

  //// granulaire fond 5
period_5:{
    type:'float',
    min: 0.04,
    max: 2,
    default: 1.36,
    },
position_5:{
    type:'float',
    min: 0.,
    max: 3.,
    default: 2.24,
  },
duration_5:{
    type:'float',
    min: 0.1,
    max: 3,
    default: 2.62,
  },
Spray_5:{
    type:'float',
    min: 0.,
    max: 1.,
    default: 1.,
  },
volumeClient_5:{
    type:'float',
    min:0,
    max:1,
    default:0, // 0.5
  },

  /// granulaire fond 6
period_6:{
    type:'float',
    min: 0.004,
    max: 2.,
    default: 2.,
    },
position_6:{
    type:'float',
    min: 0.,
    max: 3.,
    default: 1.5,
  },
duration_6:{
    type:'float',
    min: 0.1,
    max: 3,
    default: 0.3,
  },
Spray_6:{
    type:'float',
    min: 0.2,
    max: 1.,
    default: 0.,
  },
volumeClient_6:{
    type:'float',
    min:0,
    max:1,
    default:0,
  },

  //// granulaire fond 7
period_7:{
    type:'float',
    min: 0.055,
    max: 2.,
    default: 0.3,
    },
position_7:{
    type:'float',
    min: 0.,
    max: 3.,
    default: 0.,
  },
duration_7:{
    type:'float',
    min: 0.1,
    max: 3,
    default: 0.3,
  },
Spray_7:{
    type:'float',
    min: 0.1,
    max: 1.,
    default: 0.,
  },
volumeClient_7:{
    type:'float',
    min:0,
    max:1,
    default:0,
  } ,

  //// granulaire fond 8 ---> celui là est plutot bon
period_8:{
    type:'float',
    min: 0.004,
    max: 0.01,
    default: 0.004,
    },
position_8:{
    type:'float',
    min: 0.,
    max: 3.,
    default: 0.29,
  },
duration_8:{
    type:'float',
    min: 0.004,
    max: 0.01,
    default: 0.004,
  },
Spray_8:{
    type:'float',
    min: 0.3,
    max: 1.,
    default: 1.,
  },
volumeClient_8:{
    type:'float',
    min:0,
    max:1,
    default:0, //
  }
};