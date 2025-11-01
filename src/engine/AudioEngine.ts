import * as Tone from 'tone';
import type { InstrumentType, ADSREnvelope } from '../types';

export class AudioEngine {
  private instruments: Map<InstrumentType, any> = new Map();
  private loops: Map<InstrumentType, Tone.Loop> = new Map();
  private isInitialized = false;
  private masterGain: Tone.Gain | null = null;

  constructor() {
    // Don't create any Tone.js objects yet - wait for user interaction
  }

  private initializeInstruments() {
    if (!this.masterGain) return;

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
    
    // Now create all Tone.js objects AFTER user interaction
    this.masterGain = new Tone.Gain(0.7).toDestination();
    this.initializeInstruments();
    
    this.isInitialized = true;
  }

  async play() {
    await this.initialize();
    if (this.isInitialized) {
      Tone.getTransport().start();
    }
  }

  pause() {
    if (!this.isInitialized) return;
    Tone.getTransport().pause();
  }

  reset() {
    if (!this.isInitialized) return;
    Tone.getTransport().stop();
    Tone.getTransport().position = 0;
  }

  toggleInstrument(id: InstrumentType, isOn: boolean) {
    if (!this.isInitialized) return;
    const loop = this.loops.get(id);
    if (!loop) return;

    if (isOn) {
      loop.start(0);
    } else {
      loop.stop();
    }
  }

  setInstrumentVolume(id: InstrumentType, volume: number) {
    if (!this.isInitialized) return;
    const instrument = this.instruments.get(id);
    if (!instrument) return;

    // Convert 0-1 to decibels (-60 to 0)
    const db = volume === 0 ? -Infinity : (volume * 60) - 60;
    instrument.volume.value = db;
  }

  adjustTempo(bpm: number) {
    if (!this.isInitialized) return;
    Tone.getTransport().bpm.value = bpm;
  }

  setMasterVolume(volume: number) {
    if (!this.masterGain) return;
    const db = volume === 0 ? -Infinity : (volume * 60) - 60;
    this.masterGain.gain.value = Math.pow(10, db / 20);
  }

  setADSRParameter(id: InstrumentType, param: keyof ADSREnvelope, value: number) {
    if (!this.isInitialized) return;
    const instrument = this.instruments.get(id);
    if (!instrument) return;

    try {
      // Update the envelope parameter
      if (instrument.envelope && param in instrument.envelope) {
        instrument.envelope[param] = value;
      }
      // Also update filter envelope if it exists (for bass)
      if (instrument.filterEnvelope && param in instrument.filterEnvelope) {
        instrument.filterEnvelope[param] = value;
      }
    } catch (err) {
      console.error(`Failed to set ${param} on ${id}:`, err);
    }
  }

  getADSRParameters(id: InstrumentType): ADSREnvelope | null {
    if (!this.isInitialized) return null;
    const instrument = this.instruments.get(id);
    if (!instrument || !instrument.envelope) return null;

    return {
      attack: instrument.envelope.attack,
      decay: instrument.envelope.decay,
      sustain: instrument.envelope.sustain,
      release: instrument.envelope.release,
    };
  }

  randomize() {
    if (!this.isInitialized) {
      console.warn('Cannot randomize: Audio not initialized yet');
      return;
    }

    // Randomize tempo
    const bpm = Math.floor(Math.random() * 40) + 110; // 110-150 BPM
    this.adjustTempo(bpm);

    // Randomize ADSR parameters for each instrument
    const instrumentIds: InstrumentType[] = ['kick', 'hihat', 'bass', 'lead'];
    instrumentIds.forEach((id) => {
      this.setADSRParameter(id, 'attack', Math.random() * 0.1);
      this.setADSRParameter(id, 'decay', Math.random() * 0.5);
      this.setADSRParameter(id, 'sustain', Math.random());
      this.setADSRParameter(id, 'release', Math.random() * 1.0);
    });

    console.log('Randomized audio parameters!');
  }

  getInstrument(id: InstrumentType): any {
    return this.instruments.get(id);
  }

  dispose() {
    this.loops.forEach((loop) => loop.dispose());
    this.instruments.forEach((instrument) => instrument.dispose());
    if (this.masterGain) {
      this.masterGain.dispose();
    }
  }
}
