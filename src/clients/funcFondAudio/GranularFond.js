import { Scheduler } from '@ircam/sc-scheduling';
import { Spray } from './Spray.js';
import { impulseResponse} from './reverb.js';

class GranularSynthFond {
  constructor(audioContext, gainExt , buffer, volume, period = 0.2, detune = 0, duration = 0.1, position = 0, spray = 0, fl = null, fm = null, Q = null, fh = null, reverb= null, decay = null, del=null) {
    this.audioContext = audioContext;
    this.buffer = buffer;
    this.volume = volume;

    // propriétés du granulaire
    this.period = period;
    this.detune = detune;
    this.duration = duration;
    this.position = position;
    this.spray = spray;

    // propriétés des filtres
    this.fl = fl;
    this.fm = fm;
    this.Q = Q ;
    this.fh = fh ;

    // la reverb 
    this.reverb = reverb;
    this.decay = decay;
  
    // delay
    this.del = del

    // https://developer.mozilla.org/fr/docs/Web/API/BiquadFilterNode --> filtres types de filtres
    this.output = this.audioContext.createGain();
    
    this.VolumeClient = this.audioContext.createGain();
    this.VolumeGlobal = this.audioContext.createGain();
    this.VolumeClient.gain.value = this.volume;
    
    ////////////// --> passe bas
    if (this.fl!=null) {
      this.biquadFilter = this.audioContext.createBiquadFilter();
      this.biquadFilter.type = 'lowpass' ; // lowpass est 0 

      this.biquadFilter.frequency.setValueAtTime(this.fl, this.audioContext.currentTime);
      this.biquadFilter.gain.setValueAtTime(10, this.audioContext.currentTime); // +10 dB

      // Connexions : source → filtre → VolumeClient → VolumeGlobal → destination
      this.output.connect(this.biquadFilter);
      this.biquadFilter.connect(this.VolumeClient);
    }

    ////////// basse bande
    else if (fm!=null) {
      this.biquadFilter = this.audioContext.createBiquadFilter();
      this.biquadFilter.type = 'bandpass' ; // lowpass est 0 

      this.biquadFilter.frequency.setValueAtTime(this.fm, this.audioContext.currentTime);
      this.biquadFilter.Q.value = this.Q;
      this.biquadFilter.gain.setValueAtTime(10, this.audioContext.currentTime); // +10 dB

      this.output.connect(this.biquadFilter);
      this.biquadFilter.connect(this.VolumeClient);
    }

    ///////// Passe haut
    else if (fh!=null) {
      this.biquadFilter = this.audioContext.createBiquadFilter();
      this.biquadFilter.type = 'highpass' ; 

      this.biquadFilter.frequency.setValueAtTime(this.fh, this.audioContext.currentTime);
      this.biquadFilter.gain.setValueAtTime(10, this.audioContext.currentTime); // +10 dB

      this.output.connect(this.biquadFilter);
      this.biquadFilter.connect(this.VolumeClient);
    }

    else {
      this.output.connect(this.VolumeClient);
    }

    this.VG = this.volume; // Valeur par défaut pour le volume global
    this.VolumeClient.connect(this.VolumeGlobal);

    /////// reverb et delai !!! c'est le bazard faudrait refaire ça ?
    if (this.reverb != null) {
      var impulse_1 = impulseResponse(this.audioContext, this.reverb, this.decay);
      const convolver_1 = this.audioContext.createConvolver();
      convolver_1.buffer = impulse_1;
      this.VolumeGlobal.connect(convolver_1);
      
      if (this.del!=null){
        const delay = this.audioContext.createDelay();
        delay.delayTime.value = this.del;
        
        const feedback = this.audioContext.createGain();
        feedback.gain.value = 0.3;

        convolver_1.connect(delay); 
        delay.connect(feedback);    
        feedback.connect(delay);    
        delay.connect(gainExt); // là a changé  : this.audioContext.destination
      }
      else  {
      convolver_1.connect(gainExt);// là a changé  : this.audioContext.destination
      }
      
    } else {

      if (this.del!=null){
        const delay = this.audioContext.createDelay();
        delay.delayTime.value = this.del;
        
        const feedback = this.audioContext.createGain();
        feedback.gain.value = 0.3;

        delay.connect(feedback);
        feedback.connect(delay);
        this.VolumeGlobal.connect(delay);
        delay.connect(gainExt);// là a changé  : this.audioContext.destination
      }
      else  {
      this.VolumeGlobal.connect(gainExt); // là a changé  : this.audioContext.destination
      }
    }

    // Scheduler pour les grains
    this.scheduler = new Scheduler(() => this.audioContext.currentTime);
    this.render = this.render.bind(this);
    this.currentEngine = this.scheduler.add(this.render, this.audioContext.currentTime);
  }

  render(currentTime) {
    const jitter = Math.random() * 0.02;
    const grainTime = currentTime + jitter;

    const env = this.audioContext.createGain();

    env.gain.value = 1;
    
    const src = this.audioContext.createBufferSource();
    src.buffer = this.buffer;
    src.detune.value = this.detune;
    src.connect(env);
    env.connect(this.output);

    src.start(grainTime, this.position, this.duration);

    // Mise à jour de la position pour le prochain grain --> en fonction de Spray.
    this.position = Spray(this.spray , this.position) ;
    if (this.position + this.duration >= this.buffer.duration) {
      this.position = 0;
    }

    return grainTime + this.period;
  }

  setPeriod(value) {
    this.period = value;
  }

  setDetune(value) {
    this.detune = value;
  }

  setDuration(value) {
    this.duration = value;
  }

  setPosition(value) {
    this.position = value;
  }

  setSpray(value) {
    this.spray = value;
  }

  setClientVolume(value) {
    const now = this.audioContext.currentTime;
    this.VolumeClient.gain.setValueAtTime(value, now);
    this.VG = value;
  }

  setGlobalVolume(value) {
    const now = this.audioContext.currentTime;
    this.VolumeGlobal.gain.setValueAtTime(value, now);
    this.VG = value; // Met à jour la valeur globale
  }

  setGlobalMute(isMuted) {
    this.mute = isMuted;
    const now = this.audioContext.currentTime;
    this.VolumeGlobal.gain.setValueAtTime(isMuted ? 0 : this.VG, now);
  }

  setClientMute(isMuted) {
    this.mute = isMuted;
    const now = this.audioContext.currentTime;
    this.VolumeGlobal.gain.setValueAtTime(isMuted ? 0 : 1, now);
  }
}

export default GranularSynthFond;

// let Spray1 = Spray(0.5, 0.2) ;
