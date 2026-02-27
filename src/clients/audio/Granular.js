import {Scheduler} from '@ircam/sc-scheduling' ; //il faut donner une horloge au scheduler

class GranularSynth {
  constructor(audioContext, buffer) {
    this.audioContext = audioContext ; 
    this.buffy = buffer ;
    const scheduler = new Scheduler(()=> this.audioContext.currentTime); // create scheduler

    this.period = 0 ;
    this.detune = 0.1 ;
    this.duration = 0.2 ;
    this.position = 0.5 ; // position dans le buffer

    this.output = this.audioContext.createGain() ;

    this.VolumeGlobal= this.audioContext.createGain(); //creation des gains pour les volumes
    this.VolumeClient= this.audioContext.createGain();

    this.output.connect(this.VolumeClient); // attache les volumes à l'output
    this.VolumeClient.connect(this.VolumeGlobal);
    this.VolumeGlobal.connect(this.audioContext.destination);

    this.VolumeClient.gain.value = 0;
    this.VG = 0.5; // une valeur par défaut pour stocker le volume sinon elle est perdue lorsque le bouton mute est activé;
    this.render = this.render.bind(this) ; // bind the render method so we don t loose the instance contexte.
    this.currentEngine = scheduler.add(this.render, this.audioContext.currentTime) ; // add the render method to the scheduler
  }

  render(currentTime) {
    const jitter = Math.random() * 0.02 ; // rajoute un peu de bruit à la valeur 
    const grainTime = currentTime + jitter ; 

    const env = this.audioContext.createGain();
    env.connect(this.output);

    // fade in fade out
    env.gain.value  = 0 ;
    env.gain.setValueAtTime(0, grainTime);
    env.gain.linearRampToValueAtTime(1, grainTime + this.duration / 2) ;
    env.gain.linearRampToValueAtTime(0, grainTime + this.duration ) ;

    const src = this.audioContext.createBufferSource() ; //un buffer
    src.buffer = this.buffy ;
    src.detune.value = this.detune; // on detune ici
    src.connect(env) ; //l'enveloppe créee est connectée à la source
    src.start(grainTime, this.position, this.duration) ;

    if (this.position + this.duration >= this.buffy.duration) { // au cas ou on depasse le buffer
      this.position = 0 ;
    } 

    return grainTime + this.period ;
  }

  setPeriod(value) {
    this.period = value ;
  }
  setDetune(value) {
    this.detune = value ;
  }
  setDuration(value) {
    this.duration = value ;
  }
  setPosition(value) {
    this.position = value ;
  }

  setClientVolume(value) {
    const now = this.audioContext.currentTime;
    this.VolumeClient.gain.setValueAtTime(value, now);
  }

  setGlobalVolume(value){
    const now = this.audioContext.currentTime;
    this.VolumeGlobal.gain.setValueAtTime(value, now);
  }

  setGlobalMute(isMuted) {
      const now = this.audioContext.currentTime;
      this.VolumeGlobal.gain.setValueAtTime(isMuted ? 0 : this.VG, now);
  }

  setClientMute(isMuted) {
      const now = this.audioContext.currentTime;
      this.VolumeClient.gain.setValueAtTime(isMuted ? 0 : 1, now);
  }
}

export default GranularSynth;

// let Spray1 = Spray(0.5, 0.2) ;
