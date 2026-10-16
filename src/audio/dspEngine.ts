/**
 * ASCENSION-plus Hollywood Studio Engine (DSP Core) & Sound Synthesizer
 * Implements the 5-stage processing chain:
 * [Raw Stem] -> [Silence Stripper] -> [Spectral Subtraction] -> [Pitch & Autotune] -> [808 Phase Alignment] -> [Master Limiter]
 */

import { DSPChainSettings, TrackStem } from '../types/ascension';
import { calculateTubeSaturationSample, calculate808PhaseAlignment } from '../utils/audioMath';

export class AscensionDspEngine {
  private ctx: AudioContext | null = null;
  private isRunning: boolean = false;
  private isPlayingAudio: boolean = false;

  // Master Gain & Output
  private masterGain: GainNode | null = null;
  private limiterNode: DynamicsCompressorNode | null = null;

  // Analysers
  public transientAnalyser: AnalyserNode | null = null;
  public spectrumAnalyser: AnalyserNode | null = null;
  public phaseCorrelationAnalyser: AnalyserNode | null = null;

  // DSP Stage Nodes
  private silenceGateGain: GainNode | null = null;
  private spectralHighPass: BiquadFilterNode | null = null;
  private spectralHumNotch: BiquadFilterNode | null = null;
  private spectralAirShelf: BiquadFilterNode | null = null;
  private autotuneVibrato: OscillatorNode | null = null;
  private autotuneVibratoGain: GainNode | null = null;
  private autotuneFormantFilter: BiquadFilterNode | null = null;
  private phaseDelayNode: DelayNode | null = null;
  private phaseInvertGain: GainNode | null = null;
  private tubeShaper: WaveShaperNode | null = null;
  private convolverReverb: ConvolverNode | null = null;
  private reverbWetGain: GainNode | null = null;
  private reverbDryGain: GainNode | null = null;
  private masterCompressor: DynamicsCompressorNode | null = null;

  // Mic Input
  private micStream: MediaStream | null = null;
  private micSourceNode: MediaStreamAudioSourceNode | null = null;
  private isMicActive: boolean = false;

  // DAW Sequencer Timers & Stem Nodes
  private sequencerInterval: number | null = null;
  private currentStep: number = 0;
  private bpm: number = 136;
  private activeKey: string = 'Eb Minor';

  // Stems
  public stems: TrackStem[] = [
    {
      id: 'vocal-lead',
      name: 'Vocal Lead (Gospel Soul)',
      type: 'vocal',
      volume: 0.85,
      pan: 0,
      muted: false,
      soloed: false,
      activeDsp: true,
      color: '#f59e0b',
    },
    {
      id: 'sub-808',
      name: '808 Sub-Bass (30-90Hz)',
      type: '808',
      volume: 0.9,
      pan: 0,
      muted: false,
      soloed: false,
      activeDsp: true,
      frequencyHz: 55,
      color: '#ef4444',
    },
    {
      id: 'kick-drum',
      name: 'Hollywood Punch Kick',
      type: 'kick',
      volume: 0.88,
      pan: 0,
      muted: false,
      soloed: false,
      activeDsp: true,
      frequencyHz: 85,
      color: '#3b82f6',
    },
    {
      id: 'gospel-pad',
      name: 'Yard Gospel Rhodes & Chants',
      type: 'harmony',
      volume: 0.65,
      pan: -0.2,
      muted: false,
      soloed: false,
      activeDsp: true,
      color: '#a855f7',
    },
    {
      id: 'trap-hats',
      name: 'Syncopated Perc & Snare',
      type: 'beat',
      volume: 0.7,
      pan: 0.2,
      muted: false,
      soloed: false,
      activeDsp: false,
      color: '#10b981',
    },
  ];

  // Current DSP Settings
  public settings: DSPChainSettings = {
    silenceThresholdDb: -48,
    spectralNoiseIsolationDb: -45,
    autotuneRetuneMs: 5,
    autotuneHardTune: false,
    microTonalBends: 65,
    lowEndPhaseAlignment: true,
    phaseInvert808: false,
    phaseDelayMs: 2.3,
    spatialReverbType: 'Hollywood_Concert_Plate',
    reverbWetPercent: 28,
    masterLimiterCeilingDb: -0.2,
    masterThresholdDb: -14,
    tubeRaspDb: 4.2,
    masterBypass: false,
  };

  constructor() {
    // Lazy AudioContext init on first interaction
  }

  public async initContext(): Promise<boolean> {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }
    this.buildDspChain();
    this.isRunning = true;
    return true;
  }

  private buildDspChain() {
    if (!this.ctx) return;

    // 1. Transient and Spectrum Analysers
    this.transientAnalyser = this.ctx.createAnalyser();
    this.transientAnalyser.fftSize = 512;
    this.transientAnalyser.smoothingTimeConstant = 0.3;

    this.spectrumAnalyser = this.ctx.createAnalyser();
    this.spectrumAnalyser.fftSize = 256;
    this.spectrumAnalyser.smoothingTimeConstant = 0.8;

    this.phaseCorrelationAnalyser = this.ctx.createAnalyser();
    this.phaseCorrelationAnalyser.fftSize = 128;

    // 2. Stage 1: Silence Stripper (Gate)
    this.silenceGateGain = this.ctx.createGain();
    this.silenceGateGain.gain.value = 1.0;

    // 3. Stage 2: Spectral Noise Isolation
    this.spectralHighPass = this.ctx.createBiquadFilter();
    this.spectralHighPass.type = 'highpass';
    this.spectralHighPass.frequency.value = 75; // Cut stage rumble

    this.spectralHumNotch = this.ctx.createBiquadFilter();
    this.spectralHumNotch.type = 'notch';
    this.spectralHumNotch.frequency.value = 60; // 60Hz AC hum removal
    this.spectralHumNotch.Q.value = 10;

    this.spectralAirShelf = this.ctx.createBiquadFilter();
    this.spectralAirShelf.type = 'highshelf';
    this.spectralAirShelf.frequency.value = 10000;
    this.spectralAirShelf.gain.value = 2.5; // Studio air sheen

    // 4. Stage 3: Pitch & Autotune Emulation (Formant & Retune)
    this.autotuneFormantFilter = this.ctx.createBiquadFilter();
    this.autotuneFormantFilter.type = 'peaking';
    this.autotuneFormantFilter.frequency.value = 2600; // Human vocal presence peak
    this.autotuneFormantFilter.gain.value = 3.5;
    this.autotuneFormantFilter.Q.value = 1.2;

    // Vibrato LFO for Rod Wave micro-tonal bends
    this.autotuneVibrato = this.ctx.createOscillator();
    this.autotuneVibrato.frequency.value = 5.2; // 5.2 Hz vocal flutter
    this.autotuneVibratoGain = this.ctx.createGain();
    this.autotuneVibratoGain.gain.value = 40;
    this.autotuneVibrato.connect(this.autotuneVibratoGain);
    this.autotuneVibratoGain.connect(this.autotuneFormantFilter.frequency);
    this.autotuneVibrato.start();

    // 5. Stage 4: 808 Low-End Phase Alignment (Delay & Invert)
    this.phaseDelayNode = this.ctx.createDelay(0.05); // Up to 50ms delay
    this.phaseDelayNode.delayTime.value = this.settings.phaseDelayMs / 1000;

    this.phaseInvertGain = this.ctx.createGain();
    this.phaseInvertGain.gain.value = this.settings.phaseInvert808 ? -1 : 1;

    // 6. Tube Saturation WaveShaper
    this.tubeShaper = this.ctx.createWaveShaper();
    this.updateTubeCurve(this.settings.tubeRaspDb);

    // 7. Spatial Convolution Reverb
    this.convolverReverb = this.ctx.createConvolver();
    this.generateSyntheticImpulseResponse(this.settings.spatialReverbType);
    this.reverbWetGain = this.ctx.createGain();
    this.reverbWetGain.gain.value = this.settings.reverbWetPercent / 100;
    this.reverbDryGain = this.ctx.createGain();
    this.reverbDryGain.gain.value = 1 - this.settings.reverbWetPercent / 100;

    // 8. One-Tap Master Dynamic Compressor
    this.masterCompressor = this.ctx.createDynamicsCompressor();
    this.masterCompressor.threshold.value = this.settings.masterThresholdDb;
    this.masterCompressor.knee.value = 12;
    this.masterCompressor.ratio.value = 4;
    this.masterCompressor.attack.value = 0.015;
    this.masterCompressor.release.value = 0.12;

    // 9. Peak Limiter
    this.limiterNode = this.ctx.createDynamicsCompressor();
    this.limiterNode.threshold.value = this.settings.masterLimiterCeilingDb;
    this.limiterNode.knee.value = 0;
    this.limiterNode.ratio.value = 20;
    this.limiterNode.attack.value = 0.001;
    this.limiterNode.release.value = 0.05;

    // 10. Master Output Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0.85;

    // Connect DSP Chain
    // silenceGate -> highPass -> notch -> airShelf -> formantFilter -> tubeShaper ->
    // (dry + wet reverb) -> masterCompressor -> limiter -> masterGain -> analysers -> destination
    this.silenceGateGain.connect(this.spectralHighPass);
    this.spectralHighPass.connect(this.spectralHumNotch);
    this.spectralHumNotch.connect(this.spectralAirShelf);
    this.spectralAirShelf.connect(this.autotuneFormantFilter);
    this.autotuneFormantFilter.connect(this.tubeShaper);

    // Split to dry/wet reverb
    this.tubeShaper.connect(this.reverbDryGain);
    this.tubeShaper.connect(this.convolverReverb);
    this.convolverReverb.connect(this.reverbWetGain);

    this.reverbDryGain.connect(this.masterCompressor);
    this.reverbWetGain.connect(this.masterCompressor);

    this.masterCompressor.connect(this.limiterNode);
    this.limiterNode.connect(this.masterGain);

    this.masterGain.connect(this.transientAnalyser);
    this.masterGain.connect(this.spectrumAnalyser);
    this.masterGain.connect(this.phaseCorrelationAnalyser);

    this.masterGain.connect(this.ctx.destination);
  }

  private updateTubeCurve(driveDb: number) {
    if (!this.tubeShaper || !this.ctx) return;
    const n = 1024;
    const curve = new Float32Array(n);
    for (let i = 0; i < n; i++) {
      const x = (i * 2) / n - 1;
      curve[i] = calculateTubeSaturationSample(x, driveDb);
    }
    this.tubeShaper.curve = curve;
  }

  private generateSyntheticImpulseResponse(reverbType: string) {
    if (!this.ctx || !this.convolverReverb) return;
    const sampleRate = this.ctx.sampleRate;
    let duration = 2.5;
    let decay = 3.0;

    if (reverbType === 'Scoring_Stage_A') {
      duration = 4.2;
      decay = 2.0;
    } else if (reverbType === 'Analog_Gold_Chamber') {
      duration = 1.6;
      decay = 4.5;
    }

    const length = sampleRate * duration;
    const impulse = this.ctx.createBuffer(2, length, sampleRate);
    const left = impulse.getChannelData(0);
    const right = impulse.getChannelData(1);

    for (let i = 0; i < length; i++) {
      const t = i / length;
      const env = Math.pow(1 - t, decay);
      left[i] = (Math.random() * 2 - 1) * env;
      right[i] = (Math.random() * 2 - 1) * env;
    }

    this.convolverReverb.buffer = impulse;
  }

  public updateSettings(newSettings: Partial<DSPChainSettings>) {
    this.settings = { ...this.settings, ...newSettings };

    if (!this.ctx) return;

    if (newSettings.tubeRaspDb !== undefined) {
      this.updateTubeCurve(newSettings.tubeRaspDb);
    }

    if (newSettings.spatialReverbType !== undefined) {
      this.generateSyntheticImpulseResponse(newSettings.spatialReverbType);
    }

    if (newSettings.reverbWetPercent !== undefined && this.reverbWetGain && this.reverbDryGain) {
      const wet = newSettings.reverbWetPercent / 100;
      this.reverbWetGain.gain.setValueAtTime(wet, this.ctx.currentTime);
      this.reverbDryGain.gain.setValueAtTime(1 - wet, this.ctx.currentTime);
    }

    if (newSettings.phaseDelayMs !== undefined && this.phaseDelayNode) {
      this.phaseDelayNode.delayTime.setValueAtTime(newSettings.phaseDelayMs / 1000, this.ctx.currentTime);
    }

    if (newSettings.phaseInvert808 !== undefined && this.phaseInvertGain) {
      this.phaseInvertGain.gain.setValueAtTime(newSettings.phaseInvert808 ? -1 : 1, this.ctx.currentTime);
    }

    if (newSettings.autotuneRetuneMs !== undefined && this.autotuneVibratoGain) {
      // 0ms = hard street tune (zero vibrato/pitch bend, instantaneous retune)
      const bendFactor = newSettings.autotuneRetuneMs === 0 ? 0 : (newSettings.autotuneRetuneMs / 25) * 50;
      this.autotuneVibratoGain.gain.setValueAtTime(bendFactor, this.ctx.currentTime);
    }
  }

  /**
   * Apply emotional state directly to DSP chain
   */
  public applyTraumaParameters(
    key: string,
    tubeRaspDb: number,
    retuneMs: number,
    reverbWet: number = 32
  ) {
    this.activeKey = key;
    this.updateSettings({
      tubeRaspDb,
      autotuneRetuneMs: retuneMs,
      autotuneHardTune: retuneMs === 0,
      reverbWetPercent: reverbWet,
    });
  }

  /**
   * Toggle Real Microphone Input
   */
  public async toggleMicrophone(): Promise<boolean> {
    await this.initContext();
    if (!this.ctx) return false;

    if (this.isMicActive) {
      if (this.micStream) {
        this.micStream.getTracks().forEach((track) => track.stop());
        this.micStream = null;
      }
      if (this.micSourceNode) {
        this.micSourceNode.disconnect();
        this.micSourceNode = null;
      }
      this.isMicActive = false;
      return false;
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: false,
            noiseSuppression: false,
            autoGainControl: false,
          },
        });
        this.micStream = stream;
        this.micSourceNode = this.ctx.createMediaStreamSource(stream);

        // Route mic through the DSP chain
        if (this.silenceGateGain) {
          this.micSourceNode.connect(this.silenceGateGain);
        }
        this.isMicActive = true;
        return true;
      } catch (err) {
        console.warn('Microphone permission or hardware access denied/not available:', err);
        return false;
      }
    }
  }

  public getMicState(): boolean {
    return this.isMicActive;
  }

  /**
   * Multi-track DAW Synthesizer Playback (Gospel chords, 808 Sub-Bass, Punch Kick, Vocal riffs)
   */
  public async togglePlayback(): Promise<boolean> {
    await this.initContext();
    if (this.isPlayingAudio) {
      this.stopPlayback();
      return false;
    } else {
      this.startPlayback();
      return true;
    }
  }

  public getPlaybackState(): boolean {
    return this.isPlayingAudio;
  }

  private startPlayback() {
    if (!this.ctx) return;
    this.isPlayingAudio = true;
    this.currentStep = 0;
    const stepDurationMs = (60 / this.bpm / 4) * 1000; // 16th notes

    this.sequencerInterval = window.setInterval(() => {
      this.playStep(this.currentStep);
      this.currentStep = (this.currentStep + 1) % 32; // 2-bar loop
    }, stepDurationMs);
  }

  private stopPlayback() {
    if (this.sequencerInterval !== null) {
      clearInterval(this.sequencerInterval);
      this.sequencerInterval = null;
    }
    this.isPlayingAudio = false;
  }

  private isStemAudible(type: TrackStem['type']): boolean {
    const hasSolo = this.stems.some((s) => s.soloed);
    const stem = this.stems.find((s) => s.type === type);
    if (!stem) return true;
    if (stem.muted) return false;
    if (hasSolo && !stem.soloed) return false;
    return true;
  }

  private getStemVolume(type: TrackStem['type']): number {
    const stem = this.stems.find((s) => s.type === type);
    return stem ? stem.volume : 0.8;
  }

  private playStep(step: number) {
    if (!this.ctx || !this.silenceGateGain) return;
    const now = this.ctx.currentTime;

    // 1. Kick Drum pattern (beats 0, 8, 16, 24 with syncopated 22)
    if (
      this.isStemAudible('kick') &&
      (step === 0 || step === 8 || step === 16 || step === 22 || step === 24)
    ) {
      this.triggerKick(now, this.getStemVolume('kick'));
    }

    // 2. 808 Sub-Bass pattern (30-90Hz) aligned with Kick
    if (
      this.isStemAudible('808') &&
      (step === 0 || step === 6 || step === 12 || step === 16 || step === 26)
    ) {
      const rootFreq = this.activeKey.includes('C#') ? 69.3 : 51.91; // C#1 or Eb1 (38.89 - 55 Hz)
      this.trigger808(now, rootFreq, this.getStemVolume('808'));
    }

    // 3. Gospel Rhodes Chord swells (every 8 steps)
    if (this.isStemAudible('harmony') && step % 8 === 0) {
      this.triggerGospelChord(now, this.activeKey, this.getStemVolume('harmony'));
    }

    // 4. Trap Percussion & Snare (beats 4, 12, 20, 28)
    if (this.isStemAudible('beat') && (step % 2 === 0 || step === 4 || step === 12 || step === 20 || step === 28)) {
      this.triggerPerc(now, step, this.getStemVolume('beat'));
    }

    // 5. Vocal Lead Soul Run (Rod Wave / Gospel blues riff)
    if (this.isStemAudible('vocal') && (step === 2 || step === 10 || step === 18 || step === 28)) {
      this.triggerVocalRiff(now, step, this.getStemVolume('vocal'));
    }
  }

  private triggerKick(time: number, vol: number) {
    if (!this.ctx || !this.silenceGateGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Pitch envelope: 130 Hz down to 42 Hz for Hollywood punch
    osc.frequency.setValueAtTime(130, time);
    osc.frequency.exponentialRampToValueAtTime(42, time + 0.08);

    gain.gain.setValueAtTime(vol * 0.9, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.28);

    osc.connect(gain);
    gain.connect(this.silenceGateGain);

    osc.start(time);
    osc.stop(time + 0.3);
  }

  private trigger808(time: number, freq: number, vol: number) {
    if (!this.ctx || !this.silenceGateGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    // Glide down into fundamental
    osc.frequency.setValueAtTime(freq * 1.5, time);
    osc.frequency.exponentialRampToValueAtTime(freq, time + 0.04);

    gain.gain.setValueAtTime(vol * 0.95, time);
    gain.gain.linearRampToValueAtTime(vol * 0.7, time + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.6);

    // Apply 808 Phase Invert & Delay if Low-End Phase Alignment is enabled
    if (this.settings.lowEndPhaseAlignment && this.phaseDelayNode && this.phaseInvertGain) {
      osc.connect(this.phaseDelayNode);
      this.phaseDelayNode.connect(this.phaseInvertGain);
      this.phaseInvertGain.connect(gain);
    } else {
      osc.connect(gain);
    }

    gain.connect(this.silenceGateGain);

    osc.start(time);
    osc.stop(time + 0.65);
  }

  private triggerGospelChord(time: number, key: string, vol: number) {
    if (!this.ctx || !this.silenceGateGain) return;
    // Southern Gospel chord frequencies based on key
    const chordFreqs = key.includes('C#')
      ? [138.59, 164.81, 207.65, 246.94] // C#m7
      : [155.56, 185.0, 233.08, 277.18]; // Ebm7

    chordFreqs.forEach((f) => {
      const osc = this.ctx!.createOscillator();
      const filter = this.ctx!.createBiquadFilter();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.value = f;

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(600, time);
      filter.frequency.linearRampToValueAtTime(1400, time + 0.3);
      filter.frequency.exponentialRampToValueAtTime(450, time + 0.9);

      gain.gain.setValueAtTime(0.001, time);
      gain.gain.linearRampToValueAtTime(vol * 0.25, time + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 1.1);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.silenceGateGain!);

      osc.start(time);
      osc.stop(time + 1.2);
    });
  }

  private triggerPerc(time: number, step: number, vol: number) {
    if (!this.ctx || !this.silenceGateGain) return;
    const isSnare = step === 8 || step === 24;
    const node = this.ctx.createBufferSource();
    const length = this.ctx.sampleRate * (isSnare ? 0.15 : 0.04);
    const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.03));
    }
    node.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = isSnare ? 'bandpass' : 'highpass';
    filter.frequency.value = isSnare ? 2200 : 7000;

    const gain = this.ctx.createGain();
    gain.gain.value = vol * (isSnare ? 0.7 : 0.35);

    node.connect(filter);
    filter.connect(gain);
    gain.connect(this.silenceGateGain);

    node.start(time);
  }

  private triggerVocalRiff(time: number, step: number, vol: number) {
    if (!this.ctx || !this.silenceGateGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    // Soul vocal notes with pitch bend
    const baseFreq = this.activeKey.includes('C#') ? 277.18 : 311.13;
    const stepOffsets = [0, 3, 5, 7, 10];
    const targetFreq = baseFreq * Math.pow(2, stepOffsets[(step / 2) % stepOffsets.length] / 12);

    // Dynamic micro-tonal bend
    osc.frequency.setValueAtTime(targetFreq * 0.95, time);
    osc.frequency.exponentialRampToValueAtTime(targetFreq, time + 0.06);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(vol * 0.45, time + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.45);

    osc.connect(gain);
    gain.connect(this.silenceGateGain);

    osc.start(time);
    osc.stop(time + 0.5);
  }

  public setStemMute(id: string, muted: boolean) {
    const s = this.stems.find((item) => item.id === id);
    if (s) s.muted = muted;
  }

  public setStemSolo(id: string, soloed: boolean) {
    const s = this.stems.find((item) => item.id === id);
    if (s) s.soloed = soloed;
  }

  public setStemVolume(id: string, vol: number) {
    const s = this.stems.find((item) => item.id === id);
    if (s) s.volume = Math.max(0, Math.min(1, vol));
  }

  public setStemPan(id: string, pan: number) {
    const s = this.stems.find((item) => item.id === id);
    if (s) s.pan = Math.max(-1, Math.min(1, pan));
  }

  public setBpm(newBpm: number) {
    this.bpm = Math.max(60, Math.min(180, newBpm));
  }

  public getBpm(): number {
    return this.bpm;
  }

  public setKey(newKey: string) {
    this.activeKey = newKey;
  }

  public getKey(): string {
    return this.activeKey;
  }

  public setMasterVolume(vol: number) {
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(Math.max(0, Math.min(1.2, vol)), this.ctx.currentTime);
    }
  }

  public getPhaseCorrelation(): number {
    const calc = calculate808PhaseAlignment(
      55,
      this.settings.phaseInvert808 ? 180 : 0,
      this.settings.lowEndPhaseAlignment
    );
    return calc.correlationCoeff;
  }
}

// Global Singleton
let dspInstance: AscensionDspEngine | null = null;
export function getAscensionDspEngine(): AscensionDspEngine {
  if (!dspInstance) {
    dspInstance = new AscensionDspEngine();
  }
  return dspInstance;
}
