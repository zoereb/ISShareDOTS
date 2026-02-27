import '@soundworks/helpers/polyfills.js';
import { Client } from '@soundworks/core/client.js';
import { loadConfig, launcher } from '@soundworks/helpers/node.js';
import pluginCheckin from '@soundworks/plugin-checkin/client.js'; 
import { AudioContext,
  GainNode
 } from 'node-web-audio-api'; 
import fetchAudio from '../../src/clients/audio/fetchAudio.js' ;
import fs from 'fs' ;
import { prechargerCSV }  from './API/fetchISSCSV.js';
import { CsvLatLon } from './API/chargeLineCSV.js';
import GranularSynthFond from '../../src/clients/funcFondAudio/GranularFond.js' ;
import {faire_listes} from '../../src/clients/audio/list_files.js'  ;
import { VolumePlanet } from './funcFondAudio/VolumePlanet.js' ;

async function loadAudio(pathToFile, audioContext) { 
  const audioData = await fs.promises.readFile(pathToFile);
  const audioBuffers = await audioContext.decodeAudioData(audioData.buffer);
  return audioBuffers;
}

async function bootstrap() {
  const config = loadConfig(process.env.ENV, import.meta.url);
  const client = new Client(config);
  launcher.register(client);
  await client.start();

  const audioContext = new AudioContext();

  client.pluginManager.register('checkin', pluginCheckin);
  const global = await client.stateManager.attach('global');
  const player = await client.stateManager.create('player',  {id: client.id, }) ;

  /* 
  Instanciation d'une couche de synthétiseurs granulaires (2) composant le fond sonore,
  Création d'un volume spécifiquement pour le fond sonore (gainAllFond)
  Nous appelons la classe GranularSynthFond dans le dossier funcFondAudio toute fonction relative au fond sonore s'y trouvant
  */
  
  const gainAllFond = new GainNode(audioContext, {
      gain: Math.exp(player.get('volumeAllFond')) -1
  });

  gainAllFond.connect(audioContext.destination) ;

  const [bufferFont1, bufferFont2] = await Promise.all([
  loadAudio('./src/clients/audio/audio_nappe/Maroc_2.mp3', audioContext),
  loadAudio('./src/clients/audio/audio_nappe/Australie_5.mp3', audioContext)
 ]);

  const granularFont1 = new GranularSynthFond(audioContext, gainAllFond, bufferFont1, player.get('volumeClient_2'), global.get('period_1') , 1000 , player.get('duration_1') , global.get('position_1') , global.get('Spray_1'),null, null , null, null ,null, null, 0.25 ) ;  
  const granularFont2 = new GranularSynthFond(audioContext, gainAllFond, bufferFont2, player.get('volumeClient_2'),  global.get('period_2') , 0 , player.get('duration_2') , global.get('position_2') , global.get('Spray_2')) ;  
  
  /* 
  Pour réaliser une apparition automatique des interventions sonores reliées à la position de l'ISS nous avons 
  une instantiation de 2 valeurs 
  -> src = futur AudioBufferSourceNode qui permettra de jouer l'audio de l'ISS
  -> existAudio = condition d'existence d'une intervention sonore proche de la position de l'ISS, si oui alors existAudio = true et src est instancié, sinon existAudio = false et src = null
  Cela permet de ne pas lancer plusieurs interventions sonores en même temps. 
  Le tableau h est tableau qui permet à la fonciton fetchAUdio de ne pas choisir deux fois le même audio lorsque l'ISS passe deux fois vers le même endroit (càd plus d'une révolution)
  */

  let src ;
  let existAudio = false ;

  const gainISS = new GainNode(audioContext, {
      gain: 0
  });

  const  listeAudio  = await faire_listes(); // mise en forme des geo données des audios 
  let csvData = await prechargerCSV('./src/clients/API/api_1_data.csv'); // récupération de la position de l'ISS à partir d'un CSV.

  const h = [10] ; // permet de stocker les index des audios deja joués.
  global.onUpdate(async updates => {
    for (let [key, value] of Object.entries(updates)) {
      switch (key) {
        case 'position_01' : {
          /* 
          -> récupération des coordonnées de l'ISS à partir du CSV 
          et stockage dans le global state pour pouvoir les réutiliser dans d'autres fonctions
          */
          const { latitude, longitude } = CsvLatLon(csvData, global.get('timer_position_csv'));
          global.set({ position_coordonnee_latitude: latitude });
          global.set({ position_coordonnee_longitude: longitude });

          if (existAudio == false) {
            /* Verification de l'existence d'une intervention sonore proche de la position  de l'ISS  avec fetchAudio 
            si oui alors la fonction fetchAudio renvoie le bon audioBuffer */
            fetchAudio( { lat: latitude, lon: longitude }, audioContext, listeAudio, h).then(( audioBuffers) => {
              if (audioBuffers !== false) {
                if (!src) {
                  gainISS.gain.setValueAtTime(0, audioContext.currentTime);
                  gainISS.gain.linearRampToValueAtTime(Math.exp(player.get('VolumeISS')) -1, audioContext.currentTime + 5) ;
                  gainISS.gain.linearRampToValueAtTime(0, audioContext.currentTime + 30 ) ;

                  src = audioContext.createBufferSource() ; 
                  src.buffer = audioBuffers ;
                  src.connect(gainISS) ;
                  gainISS.connect(audioContext.destination) ;
                  src.start();
                
                  existAudio = true ;

                  /* fonction setTimeout pour remettre à zéro les variables après un certain temps (> 30 sec minimum ici 100 sec), 
                  afin de pouvoir relancer une nouvelle lecture audio si besoin (chaque révo). */
                  setTimeout(() => {
                    existAudio = false ;
                    src = null ;
                    audioBuffers = null ;
                  }, 100000);
                }
              }
            });
          }
          break;
        }
        case 'mute' : { // mute uniquement le fond sonore
          if (value == true) {
            granularFont1.setClientMute(true) ;
            granularFont2.setClientMute(true) ;
          }
          else {
            granularFont1.setClientMute(false) ;
            granularFont2.setClientMute(false) ;
          }
          break;
        }
        case 'mute_ISS' : { // mute uniquement le son de l'ISS 
          if (value == true) {
            if (src) {
              gainISS.gain.setValueAtTime(0, audioContext.currentTime) ;
            }
          }
          else {
            if (src) {
              gainISS.gain.setValueAtTime(Math.exp(player.get('VolumeISS')) -1, audioContext.currentTime) ;         
            }
          }
        }
        case 'distance' : { // Automation de volume du fond sonore (corssfade) en fonction de l'état du client Planet
          VolumePlanet(value).then(([G1, G2]) => {
          granularFont1.setClientVolume(G1) ; 
          granularFont2.setClientVolume(G2) ;
          });
          break;
        }
        case 'position_1': {
          granularFont1.setPosition(value) ;
          break;
        }
        case 'period_2': {
          granularFont2.setPeriod(value) ;
          break;
        }
        case 'Spray_1': {
          granularFont1.setSpray(value) ;
          break;
        }
        case 'position_2': {
          granularFont2.setPosition(value) ;
          break;
        }
        case 'period_1': {
          granularFont1.setPeriod(value) ;
          break;
        }
        case 'Spray_2': {
          granularFont2.setSpray(value) ;
          break;
        }
        case 'chooseAudio': {
          if (value == true) {
            h.length = 0 ; // réinitialisation de h. 
          }
          break;
        }
      }
    }
  }, true);
  
  /* 
  -> Changement du volume global du fond sonore ainsi que de l'audio attaché à l'ISS
   de chaque raspberry pour le controller (mastering sur le controleur)
  -> Changement des paramètres en fonction des changements d'état du player :  le volume de chaque couche (granularFont1 et 2) 
  change en fonction du client Planet et le paramètre de duration change pour chaque granulaire en fonction du client Panneau Control
  */

  player.onUpdate(updates => {
      for (let [key, value] of Object.entries(updates)) {
        switch (key) { 
          case 'volumeAllFond': {
            gainAllFond.gain.setValueAtTime(Math.exp(value) -1, audioContext.currentTime);
            break;
          }
          case 'VolumeISS': {
            if (src) {
              gainISS.gain.setValueAtTime(Math.exp(value) -1, audioContext.currentTime) ;            
            }
            break;
          }

          ////////// granular 1
          case 'volumeClient_1': {
            granularFont1.setClientVolume(value) ;
            break;
          }
          case 'duration_1': {
            granularFont1.setDuration(value) ;
            break;
          }

          /////////// granular 2
          case 'volumeClient_2': {
            granularFont2.setClientVolume(value) ;
            break;
          }
          case 'duration_2': {
            granularFont2.setDuration(value) ;
            break;
          }  
        }
      }
  }, true)
  
}

launcher.execute(bootstrap, {
  numClients: process.env.EMULATE ? parseInt(process.env.EMULATE) : 1,
  moduleURL: import.meta.url,
});
