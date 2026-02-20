import '@soundworks/helpers/polyfills.js';
import { Client } from '@soundworks/core/client.js';
import { loadConfig, launcher } from '@soundworks/helpers/node.js';
import pluginCheckin from '@soundworks/plugin-checkin/client.js'; 
import { AudioContext,
  GainNode
 } from 'node-web-audio-api'; 
//import GranularSynth from '../../src/clients/Granular.js' ;
//import automation from '../../src/clients/funcAudio/automation.js' ;
//import duration_automation from './funcAudio/duration.js';
//import period_automation from './funcAudio/period.js';
import fetchAudio from '../../src/clients/audio/fetchAudio.js' ;
import fs from 'fs' ;
import { prechargerCSV }  from './API/fetchISSCSV.js';
import { CsvLatLon } from './API/chargeLineCSV.js';
import GranularSynthFond from '../../src/clients/funcFondAudio/GranularFond.js' ;
import {faire_listes} from '../../src/clients/audio/list_files.js'  ;
import { VolumePlanet } from './funcFondAudio/VolumePlanet.js' ;
import { decibelToLinear } from '@ircam/sc-utils';

async function loadAudio(pathToFile, audioContext) { 
  const audioData = await fs.promises.readFile(pathToFile);
  const audioBuffers = await audioContext.decodeAudioData(audioData.buffer);
  return audioBuffers;
}

function modulo(a,b) { 
  return ((a % b) + b ) % b
}

async function bootstrap() {
  const config = loadConfig(process.env.ENV, import.meta.url);
  const client = new Client(config);
  launcher.register(client);
  await client.start();

  const audioContext = new AudioContext();

  client.pluginManager.register('checkin', pluginCheckin);
  
  const  listeAudio  = await faire_listes();
  let csvData = await prechargerCSV('./src/clients/API/api_1_data.csv');

  const global = await client.stateManager.attach('global');
  const player = await client.stateManager.create('player',  {id: client.id, }) ;

  const id_mod = modulo(client.id, 8); 
  player.set({ id_modulo: id_mod }) ;

  const gainAllFond = new GainNode(audioContext, {
      gain: decibelToLinear(player.get('volumeAllFond'))
  });

  gainAllFond.connect(audioContext.destination) ;

  const [bufferFont1, bufferFont2, bufferFont3 , bufferFont4, bufferFont5, bufferFont6, bufferFont7, bufferFont8] = await Promise.all([
  loadAudio('./src/clients/audio/audio_nappe/Bresil_4.mp3', audioContext),
  loadAudio('./src/clients/audio/audio_nappe/Maroc_2.mp3', audioContext),
  loadAudio('./src/clients/audio/audio_nappe/Italie_3.mp3', audioContext),
  loadAudio('./src/clients/audio/audio_nappe/Russie_1.mp3', audioContext),
  loadAudio('./src/clients/audio/audio_nappe/Chine_3.mp3', audioContext),
  loadAudio('./src/clients/audio/audio_nappe/Philippines_Papouasie_5.mp3', audioContext),
  loadAudio('./src/clients/audio/audio_nappe/Australie_5.mp3', audioContext),
  loadAudio('./src/clients/audio/audio_nappe/Nouvelle_Zelande_2.mp3', audioContext)
 ]);

  /*Notre folie des 8 géné : , bufferFont3, bufferFont4, bufferFont5, bufferFont6, bufferFont7, bufferFont8
*/
 
  //const granularFont1 = new GranularSynthFond(audioContext, gainAllFond, bufferFont1, player.get('volumeClient_1'), player.get('period_1') , 900 ,player.get('duration_1') , player.get('position_1') ,0.4, null , 1000, 3, null  , 1 , 1 , null ); // period = 0.2 , detune = 0 , duration = 0.1, position = 0 , spray = 0 frequence low pass
  const granularFont1 = new GranularSynthFond(audioContext, gainAllFond, bufferFont2, player.get('volumeClient_2'), player.get('period_2') , 1000 ,player.get('duration_2') , player.get('position_2') , player.get('Spray_2'),null, null , null, null ,null, null, 0.25 ) ;  
  //const granularFont3 = new GranularSynthFond(audioContext, gainAllFond, bufferFont3 ,player.get('volumeClient_3'), player.get('period_3') , 0 ,player.get('duration_3') , player.get('position_3') , player.get('Spray_3'), null, 1500 , 10 , null, 0.1 , 0.1) ; //400 et 3 fm au dela de 85 % ( va jusqu'à 30 secondes ) 
  //const granularFont1 = new GranularSynthFond(audioContext, gainAllFond, bufferFont4, player.get('volumeClient_4'), player.get('period_4') , 0 ,player.get('duration_4') , player.get('position_4') , player.get('Spray_4') , null, 400 , 3 , null,  null , null  ) ; // 400 et 3 
  //const granularFont2 = new GranularSynthFond(audioContext, gainAllFond, bufferFont5, player.get('volumeClient_5'), player.get('period_5') , 0 ,player.get('duration_5') , player.get('position_5') , player.get('Spray_5') , 250, null, null, null,  1.5 , 1.2 , 0.6) ; //
  //const granularFont2 = new GranularSynthFond(audioContext, gainAllFond, bufferFont6, player.get('volumeClient_6'), player.get('period_6') , 0 ,player.get('duration_6') , player.get('position_6') , player.get('Spray_6')) ;  
  const granularFont2 = new GranularSynthFond(audioContext, gainAllFond, bufferFont7, player.get('volumeClient_7'), 0.5 , 0 , 0.5 , 1 , 0.4) ;  
  //const granularFont2 = new GranularSynthFond(audioContext, gainAllFond, bufferFont8, player.get('volumeClient_8'), player.get('period_8') , 0 ,player.get('duration_8') , player.get('position_8') , player.get('Spray_8') , null, null, null, null , null, null ) ;
  

  let src ;
  //let syntheGranular ;
  let existAudio = false ;
  let debut ;

  const gainISS = new GainNode(audioContext, {
      gain: decibelToLinear(player.get('VolumeISS'))
  });

  global.onUpdate(async updates => {
    for (let [key, value] of Object.entries(updates)) {
      switch (key) {
        case 'position_01' : {
          const { latitude, longitude } = CsvLatLon(csvData, global.get('timer_position_csv'));
          global.set({ position_coordonnee_latitude: latitude });
          global.set({ position_coordonnee_longitude: longitude });

          if (existAudio == false) {
            fetchAudio(id_mod, { lat: latitude, lon: longitude }, audioContext, listeAudio).then((audioBuffers) => {
              if (audioBuffers !== false) {
                if (!src) {
                  console.log("Audio buffer loaded successfully.");
                  //syntheGranular = new GranularSynth(audioContext, audioBuffers);
                  gainISS.gain.setValueAtTime(0, audioContext.currentTime);
                  gainISS.gain.linearRampToValueAtTime(0.5, audioContext.currentTime + 5) ;
                  gainISS.gain.linearRampToValueAtTime(0, audioContext.currentTime + 25 ) ;

                  src = audioContext.createBufferSource() ; //un buffer
                  src.buffer = audioBuffers ;
                  src.connect(gainISS) ;
                  gainISS.connect(audioContext.destination) ;
                  src.start();
                
                  existAudio = true ;
                  debut = value ;
                }
              }
            });
          }
          else if (existAudio==true) {
            /*automation(value, debut).then((volumeValue) => {
              syntheGranular.setVolume(volumeValue);
            });
              duration_automation(value, debut).then((durationValue) => {
              syntheGranular.setDuration(durationValue);
            });
              period_automation(value, debut).then((periodValue) => {
              syntheGranular.setPeriod(periodValue);
            });*/    
          }
          break;
        }
        case 'mute' : { // mute uniquement le fond sonore
          if (value == true) {
            granularFont1.setClientMute(true) ;
            granularFont2.setClientMute(true) ;
            /*granularFont3.setClientMute(true) ;
            granularFont4.setClientMute(true) ;
            granularFont5.setClientMute(true) ;
            granularFont6.setClientMute(true) ;
            granularFont7.setClientMute(true) ;
            granularFont8.setClientMute(true) ;*/
          }
          else {
            granularFont1.setClientMute(false) ;
            granularFont2.setClientMute(false) ;
            /*granularFont3.setClientMute(false) ;
            granularFont4.setClientMute(false) ;
            granularFont5.setClientMute(false) ;
            granularFont6.setClientMute(false) ;
            granularFont7.setClientMute(false) ;
            granularFont8.setClientMute(false) ;*/
          }
          break;
        }
        /*case 'mute_ISS' : { // mute uniquement le son de l'ISS
          if (value == true) {
            if (syntheGranular) {
              syntheGranular.setClientMute(true) ;
            }
          }
          else {
            if (syntheGranular) {
              syntheGranular.setClientMute(false) ;
            }
          }
        }*/
        case 'distance' : {
          VolumePlanet(value).then(([G1, G2]) => {
          granularFont1.setClientVolume(G1) ; 
          granularFont2.setClientVolume(G2) ;
          /*granularFont3.setClientVolume(G3) ;
          granularFont4.setClientVolume(G4) ;
          granularFont5.setClientVolume(G5) ;
          granularFont6.setClientVolume(G6) ;
          granularFont7.setClientVolume(G7) ;
          granularFont8.setClientVolume(G8) ;*/
          });
          break;
        }
      }
    }
  }, true);
  
  player.onUpdate(updates => {
      for (let [key, value] of Object.entries(updates)) {
        switch (key) { 
          case 'volumeAllFond': {
            gainAllFond.gain.setValueAtTime(value, audioContext.currentTime);
            break;
          }
          case 'VolumeISS': {
            if (src) {
              gainISS.gain.setValueAtTime(value, audioContext.currentTime);            
            }
            break;
          }
          case 'period_1': {
            granularFont1.setPeriod(value) ;
            break;
          }
          case 'position_1': {
            granularFont1.setPosition(value) ;
            break;
          }
          case 'duration_1': {
            granularFont1.setDuration(value) ;
            break;
          }
          case 'Spray_1': {
            granularFont1.setSpray(value) ;
            break;
          }
          case 'volumeClient_1': {
            granularFont1.setClientVolume(value) ;
            break;
          }

          /////////// granular 2
          case 'period_2': {
            granularFont2.setPeriod(value) ;
            break;
          }
          case 'position_2': {
            granularFont2.setPosition(value) ;
            break;
          }
          case 'duration_2': {
            granularFont2.setDuration(value) ;
            break;
          }
          case 'Spray_2': {
            granularFont2.setSpray(value) ;
            break;
          }
          case 'volumeClient_2': {
            granularFont2.setClientVolume(value) ;
            break;
          }

          /*//////////// granular 3
          case 'period_3': {
            granularFont3.setPeriod(value) ;
            break;
          }
          case 'position_3': {
            granularFont3.setPosition(value) ;
            break;
          }
          case 'duration_3': {
            granularFont3.setDuration(value) ;
            break;
          }
          case 'Spray_3': {
            granularFont3.setSpray(value) ;
            break;
          }
          case 'volumeClient_3': {
            granularFont3.setClientVolume(value) ;
            break;
          }

          /////////// granular 4
          case 'period_4': {
            granularFont4.setPeriod(value) ;
            break;
          }
          case 'position_4': {
            granularFont4.setPosition(value) ;
            break;
          }
          case 'duration_4': {
            granularFont4.setDuration(value) ;
            break;
          }
          case 'Spray_4': {
            granularFont4.setSpray(value) ;
            break;
          }
          case 'volumeClient_4': {
            granularFont4.setClientVolume(value) ;
            break;
          }

          /////////// granular 5
          case 'period_5': {
            granularFont5.setPeriod(value) ;
            break;
          }
          case 'position_5': {
            granularFont5.setPosition(value) ;
            break;
          }
          case 'duration_5': {
            granularFont5.setDuration(value) ;
            break;
          }
          case 'Spray_5': {
            granularFont5.setSpray(value) ;
            break;
          }
          case 'volumeClient_5': {
            granularFont5.setClientVolume(value) ;
            break;
          }

          /////////// granular 6
          case 'period_6': {
            granularFont6.setPeriod(value) ;
            break;
          }
          case 'position_6': {
            granularFont6.setPosition(value) ;
            break;
          }
          case 'duration_6': {
            granularFont6.setDuration(value) ;
            break;
          }
          case 'Spray_6': {
            granularFont6.setSpray(value) ;
            break;
          }
          case 'volumeClient_6': {
            granularFont6.setClientVolume(value) ;
            break;
          }

          /////////// granular 7
          case 'period_7': {
            granularFont7.setPeriod(value) ;
            break;
          }
          case 'position_7': {
            granularFont7.setPosition(value) ;
            break;
          }
          case 'duration_7': {
            granularFont7.setDuration(value) ;
            break;
          }
          case 'Spray_7': {
            granularFont7.setSpray(value) ;
            break;
          }
          case 'volumeClient_7': {
            granularFont7.setClientVolume(value) ;
            break;
          }

          /////////// granular 8
          case 'period_8': {
            granularFont8.setPeriod(value) ;
            break;
          }
          case 'position_8': {
            granularFont8.setPosition(value) ;
            break;
          }
          case 'duration_8': {
            granularFont8.setDuration(value) ;
            break;
          }
          case 'Spray_8': {
            granularFont8.setSpray(value) ;
            break;
          }
          case 'volumeClient_8': {
            granularFont8.setClientVolume(value) ;
            break;
          }
            */
        }
      }
  }, true)
  
}

launcher.execute(bootstrap, {
  numClients: process.env.EMULATE ? parseInt(process.env.EMULATE) : 1,
  moduleURL: import.meta.url,
});
