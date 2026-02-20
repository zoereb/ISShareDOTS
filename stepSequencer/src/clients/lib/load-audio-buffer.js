import {OfflineAudioContext} from 'node-web-audio-api'
import path from 'path';
import fs from 'fs';

const contexts = new Map();

export default async function loadAudioBuffer(pathname, sampleRate = 48000) {
  //console.log('Loading audio file:', pathname);

  if (!contexts.has(sampleRate)) {
    const context = new OfflineAudioContext(1, 1, sampleRate);
    contexts.set(sampleRate, context);
  }

  // Récupère le contexte existant
  const audioContext = contexts.get(sampleRate);

  // Charge le fichier depuis le système de fichiers
  const filePath = path.resolve(pathname);
  const arrayBuffer = fs.readFileSync(filePath).buffer;

  // Décode le buffer audio
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  return audioBuffer;
}
