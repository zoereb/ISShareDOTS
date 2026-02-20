export function impulseResponse(audioContext, duration , decay) {
    if (duration!=null) {
        var length = audioContext.sampleRate * duration  ;
        var impulse = audioContext.createBuffer(1, length, audioContext.sampleRate) ;
        var IR = impulse.getChannelData(0) ;
        for (var i=0;i<length;i++) IR[i]= (2*Math.random()-1)*Math.pow(1-i/length, decay) ;
        return impulse;
    }
    else { // buffer unitaire de longueur 1 seconde --> est ce que ça pose un problème ? je l'entend pas
        var impulse = audioContext.createBuffer(1, 1, audioContext.sampleRate); // Buffer de 1 échantillon
        var IR = impulse.getChannelData(0);
        IR[0] = 1; // Seul le premier échantillon vaut 1
        return impulse
    }
}

export default impulseResponse  ;