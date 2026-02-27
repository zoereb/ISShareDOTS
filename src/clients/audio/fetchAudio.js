import fs from 'fs';
// Ariane stolfi

async function loadAudio(pathToFile, audioContext) {
  const audioData = fs.readFileSync(pathToFile);
  const audioBuffers = await audioContext.decodeAudioData(audioData.buffer);
  return audioBuffers;
}

const lst = [0,1,2,3,4] ;
export async function fetchAudio( coordonnee_ISS, audioContext, listeAudio, h) {

    let index_pp = 0 ; // index du point le plus proche

    //Choix au plus simple !!! approximation de la distance sur une surface "plate" --> loxodromique
    //Choix compliqué : distance orthodromique sur une sphère (formule de haversine) à voir plus tard si vraiment ça fout la merde
    let distance_loxodromique = 1000000 ; // grande valeur de départ
    let new_distance_loxodromique = 1000000;

    for (let i=0; i< listeAudio.length; i++){ if (h.includes(i)) { lst.splice(lst.indexOf(i),1) ; } } // suppression des index deja choisis (pour diversifier "artficiellement" la composition)

    for (let i=0; i< listeAudio.length; i++){
        if (h.includes(i)) { continue ; } // si l'index est déjà dans la liste des index choisis alors on le saute
        new_distance_loxodromique = Math.abs( coordonnee_ISS.lat - listeAudio[i].coordinates.latitude) + Math.abs( coordonnee_ISS.lon - listeAudio[i].coordinates.longitude) ; // coo[i].lat coo[i].lon
        if ( distance_loxodromique > new_distance_loxodromique ){
            distance_loxodromique = new_distance_loxodromique ; // changement de la distance aussi 
            index_pp = i ; // changement d'index en fonction de la distance la plus petite.
        }
    }

    if ( distance_loxodromique <50) {
            const audioBuffers = await loadAudio(listeAudio[index_pp].audioPath, audioContext) ;  
            h.push(index_pp) ;
            console.log("index de l'audio Choisis : " + index_pp) ;
            console.log('liste des index déjà choisis : ' + h) ;
        return  audioBuffers ;
    }
    else {
        return false ;
    }

}

export default fetchAudio ; 