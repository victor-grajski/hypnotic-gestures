import * as Tone from 'tone';
import type { InstrumentType, EffectType } from '../types';

export class AudioEngine {
  private instruments: Map<InstrumentType, any> = new Map();
  private effects: Map<EffectType, Tone.ToneAudioNode> = new Map();
  private loops: Map<InstrumentType, Tone.Loop> = new Map();
  private isInitialized = false;
  private masterGain: Tone.Gain;

  constructor() {
    this.masterGain = new Tone.Gain(0.7).toDestination();
    this.initializeInstruments();
    this.initializeEffects();
  }

  private initializeInstruments() {
    // Kick drum - deep, punchy
    const kick = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 6,
      oscillator: { type: 'sine' },
      envelope: {
        attack: 0.001,
        decay: 0.4,
        sustain: 0.01,
        release: 0.4,
        attackCurve: 'exponential',
      },
    }).connect(this.masterGain);
    this.instruments.set('kick', kick);

    // Hi-hat - metallic, crisp
    const hihat = new Tone.MetalSynth({
      envelope: {
        attack: 0.001,
        decay: 0.1,
        release: 0.01,
      },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5,
    }).connect(this.masterGain);
    this.instruments.set('hihat', hihat);

    // Bass synth - deep, pulsing
    const bass = new Tone.MonoSynth({
      oscillator: { type: 'sawtooth' },
      filter: {
        Q: 3,
        type: 'lowpass',
        rolloff: -24,
      },
      envelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.3,
        release: 0.8,
      },
      filterEnvelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.4,
        release: 0.8,
        baseFrequency: 100,
        octaves: 2.5,
      },
    }).connect(this.masterGain);
    this.instruments.set('bass', bass);

    // Lead synth - bright, melodic
    const lead = new Tone.Synth({
      oscillator: { type: 'square' },
      envelope: {
        attack: 0.005,
        decay: 0.1,
        sustain: 0.3,
        release: 0.5,
      },
    }).connect(this.masterGain);
    this.instruments.set('lead', lead);

    // Create patterns
    this.createKickPattern();
    this.createHihatPattern();
    this.createBassPattern();
    this.createLeadPattern();
  }

  private initializeEffects() {
    // Reverb
    const reverb = new Tone.Reverb({
      decay: 2.5,
      preDelay: 0.01,
      wet: 0.3,
    });
    this.effects.set('reverb', reverb);

    // Delay
    const delay = new Tone.FeedbackDelay({
      delayTime: '8n',
      feedback: 0.4,
      wet: 0.2,
    });
    this.effects.set('delay', delay);

    // Filter
    const filter = new Tone.AutoFilter({
      frequency: '4n',
      type: 'sine',
      depth: 0.6,
      baseFrequency: 200,
      octaves: 2.6,
      wet: 0.5,
    });
    this.effects.set('filter', filter);

    // Connect effects to master
    reverb.connect(this.masterGain);
    delay.connect(this.masterGain);
    filter.connect(this.masterGain);
  }

  private createKickPattern() {
    const kick = this.instruments.get('kick') as Tone.MembraneSynth;
    const loop = new Tone.Loop((time) => {
      kick.triggerAttackRelease('C1', '8n', time);
    }, '4n');
    this.loops.set('kick', loop);
  }

  private createHihatPattern() {
    const hihat = this.instruments.get('hihat') as Tone.MetalSynth;
    const loop = new Tone.Loop((time) => {
      hihat.triggerAttackRelease('16n', time);
    }, '8n');
    this.loops.set('hihat', loop);
  }

  private createBassPattern() {
    const bass = this.instruments.get('bass') as Tone.MonoSynth;
    const notes = ['C2', 'C2', 'G1', 'C2'];
    let noteIndex = 0;

    const loop = new Tone.Loop((time) => {
      bass.triggerAttackRelease(notes[noteIndex % notes.length], '8n', time);
      noteIndex++;
    }, '4n');
    this.loops.set('bass', loop);
  }

  private createLeadPattern() {
    const lead = this.instruments.get('lead') as Tone.Synth;
    const notes = ['C4', 'E4', 'G4', 'A4', 'G4', 'E4'];
    let noteIndex = 0;

    const loop = new Tone.Loop((time) => {
      lead.triggerAttackRelease(notes[noteIndex % notes.length], '16n', time);
      noteIndex++;
    }, '8n');
    this.loops.set('lead', loop);
  }

  async initialize() {
    if (this.isInitialized) return;
    
    await Tone.start();
    Tone.getTransport().bpm.value = 128;
    this.isInitialized = true;
  }

  async play() {
    await this.initialize();
    Tone.getTransport().start();
  }

  pause() {
    Tone.getTransport().pause();
  }

  reset() {
    Tone.getTransport().stop();
    Tone.getTransport().position = 0;
  }

  toggleInstrument(id: InstrumentType, isOn: boolean) {
    const loop = this.loops.get(id);
    if (!loop) return;

    if (isOn) {
      loop.start(0);
    } else {
      loop.stop();
    }
  }

  setInstrumentVolume(id: InstrumentType, volume: number) {
    const instrument = this.instruments.get(id);
    if (!instrument) return;

    // Convert 0-1 to decibels (-60 to 0)
    const db = volume === 0 ? -Infinity : (volume * 60) - 60;
    instrument.volume.value = db;
  }

  adjustTempo(bpm: number) {
    Tone.getTransport().bpm.value = bpm;
  }

  setMasterVolume(volume: number) {
    const db = volume === 0 ? -Infinity : (volume * 60) - 60;
    this.masterGain.gain.value = Math.pow(10, db / 20);
  }

  toggleEffect(id: EffectType, isOn: boolean) {
    const effect = this.effects.get(id);
    if (!effect) return;

    if (id === 'filter' && effect instanceof Tone.AutoFilter) {
      if (isOn) {
        effect.start();
      } else {
        effect.stop();
      }
    }

    // Set wet/dry based on on/off state
    if ('wet' in effect) {
      (effect as any).wet.value = isOn ? 0.5 : 0;
    }
  }

  setEffectParameter(id: EffectType, param: string, value: number) {
    const effect = this.effects.get(id);
    if (!effect) return;

    try {
      if (param === 'wet' && 'wet' in effect) {
        (effect as any).wet.value = value;
      } else if (param === 'feedback' && 'feedback' in effect) {
        (effect as any).feedback.value = value;
      } else if (param === 'delayTime' && 'delayTime' in effect) {
        (effect as any).delayTime.value = value;
      } else if (param === 'frequency' && 'frequency' in effect) {
        (effect as any).frequency.value = value;
      } else if (param === 'depth' && 'depth' in effect) {
        (effect as any).depth.value = value;
      }
    } catch (err) {
      console.error(`Failed to set ${param} on ${id}:`, err);
    }
  }

  randomize() {
    // Randomize tempo
    const bpm = Math.floor(Math.random() * 40) + 110; // 110-150 BPM
    this.adjustTempo(bpm);

    // Randomize effect parameters
    const reverb = this.effects.get('reverb') as Tone.Reverb;
    if (reverb) {
      (reverb as any).wet.value = Math.random() * 0.5;
    }

    const delay = this.effects.get('delay') as Tone.FeedbackDelay;
    if (delay) {
      delay.feedback.value = Math.random() * 0.6;
      (delay as any).wet.value = Math.random() * 0.4;
    }

    const filter = this.effects.get('filter') as Tone.AutoFilter;
    if (filter) {
      filter.depth.value = Math.random();
      filter.baseFrequency = Math.random() * 800 + 200;
    }

    console.log('Randomized audio parameters!');
  }

  getInstrument(id: InstrumentType): any {
    return this.instruments.get(id);
  }

  getEffect(id: EffectType): Tone.ToneAudioNode | undefined {
    return this.effects.get(id);
  }

  dispose() {
    this.loops.forEach((loop) => loop.dispose());
    this.instruments.forEach((instrument) => instrument.dispose());
    this.effects.forEach((effect) => effect.dispose());
    this.masterGain.dispose();
  }
}
