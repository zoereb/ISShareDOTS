import fs from 'fs';
// Ariane stolfi

async function loadAudio(pathToFile, audioContext) {
  const audioData = fs.readFileSync(pathToFile);
  const audioBuffers = await audioContext.decodeAudioData(audioData.buffer);
  return audioBuffers;
}

// index --> doit deja etre en mode modulo (de 0 à 8) !
export async function fetchAudio(index, coordonnee_ISS, audioContext, listeAudio) {

    let index_pp = 0 ; // index du point le plus proche

    //Choix au plus simple !!! approximation de la distance sur une surface "plate" --> loxodromique
    //Choix compliqué : distance orthodromique sur une sphère (formule de haversine) à voir plus tard si vraiment ça fout la merde
    let distance_loxodromique = 1000000 ; // grande valeur de départ
    let new_distance_loxodromique = 1000000;

    for (let i=0; i< listeAudio.length; i++){
         new_distance_loxodromique = Math.abs( coordonnee_ISS.lat - listeAudio[i].coordinates.latitude) + Math.abs( coordonnee_ISS.lon - listeAudio[i].coordinates.longitude) ; // coo[i].lat coo[i].lon
        if ( distance_loxodromique > new_distance_loxodromique ){
            distance_loxodromique = new_distance_loxodromique ; // changement de la distance aussi faut pas être con
            index_pp = i ; // changement d'index si la distance est plus petite !
        }
    }

    if ( distance_loxodromique <50) {
        const audioBuffers = await loadAudio(listeAudio[index_pp].audioPath, audioContext) ;  
        return audioBuffers;
    }
    else {
        return false ;
    }
}

export default fetchAudio ; 