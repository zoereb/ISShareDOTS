import { promisify } from 'util';
import fs from 'fs';

const readFile = promisify(fs.readFile);
/* que des promesses mais il est appelé une fois dans le client au tout début de lancement du code.
ça marche 
Cette fonction est appelée une fois dans le fichier client des raspberrys pi */

async function faire_listes() {
  const path = './src/clients/audio/audio_synth/audio_';
  const result = [];
  const promises = [];

  for (let i = 1; i < 6; i++) {
    const audioPath = path + i + '.mp3';
    const coorPath = path + i + '_gps.txt';
    promises.push(
      readFile(coorPath, 'utf8')
        .then(data => {
          const lines = data.split('\n');
          const matchLat = lines[0].match(/(-?\d+\.\d+)/);
          const matchLon = lines[1].match(/(-?\d+\.\d+)/);

          const latitude = matchLat ? parseFloat(matchLat[1]) : null;
          const longitude = matchLon ? parseFloat(matchLon[1]) : null;

          result.push({
            audioPath,
            coordinates: { latitude, longitude } // je recupere les coordonnées latitudes et longitudes dans l'ordre des fichiers audios.
          });
        })
    );
  }

  await Promise.all(promises);

  return result;
}

export { faire_listes };
