export type EmotionalState = 'grief' | 'aggression' | 'paranoia' | 'redemption' | 'neutral';

export interface PersonaMatrix {
  identity: string;
  affiliation_lore: string;
  tone: string;
  vocal_dna: {
    gospel_blues_range: string;
    lyrical_tier: string;
    wisdom_tier: string;
    emotional_tier: string;
  };
}

export interface DSPRoutingConfig {
  noise_floor_threshold_db: number;
  autotune_default_retune_ms: number;
  low_end_phase_alignment: boolean;
  spatial_reverb_type: 'Hollywood_Concert_Plate' | 'Scoring_Stage_A' | 'Analog_Gold_Chamber';
}

export interface YardMatrixConfig {
  unfiltered_mode: boolean;
  street_counsel_dial: number; // 0.0 (Pure Logic) to 1.0 (Raw Catharsis)
  trauma_key_mapping: {
    grief: string;
    aggression: string;
    paranoia: string;
    redemption: string;
  };
}

export interface AscensionSystemConfig {
  system_identifier: string;
  version: string;
  persona_matrix: PersonaMatrix;
  dsp_routing: DSPRoutingConfig;
  yard_matrix_config: YardMatrixConfig;
}

export interface TraumaAnalysisResult {
  dominantEmotion: EmotionalState;
  intensity: number; // 0 to 1
  mappedKey: string;
  scale: string;
  tubeRaspDb: number;
  autotuneRetuneMs: number;
  dynamicCompression: string;
  harmonies: string[];
  dspRoutingNotes: string;
  ogCounsel: string;
}

export interface DSPChainSettings {
  silenceThresholdDb: number; // e.g. -48 dB
  spectralNoiseIsolationDb: number; // e.g. -45 dB
  autotuneRetuneMs: number; // 0ms to 50ms
  autotuneHardTune: boolean;
  microTonalBends: number; // 0 to 100%
  lowEndPhaseAlignment: boolean;
  phaseInvert808: boolean;
  phaseDelayMs: number; // 0 to 25ms
  spatialReverbType: 'Hollywood_Concert_Plate' | 'Scoring_Stage_A' | 'Analog_Gold_Chamber';
  reverbWetPercent: number;
  masterLimiterCeilingDb: number; // e.g. -0.2 dB
  masterThresholdDb: number; // e.g. -14 dB
  tubeRaspDb: number; // 0 to +8 dB
  masterBypass: boolean;
}

export interface TrackStem {
  id: string;
  name: string;
  type: 'vocal' | '808' | 'kick' | 'beat' | 'harmony';
  volume: number; // 0 to 1
  pan: number; // -1 to 1
  muted: boolean;
  soloed: boolean;
  activeDsp: boolean;
  frequencyHz?: number;
  color: string;
}

export interface GhostwriteBar {
  line: string;
  syllableCount: number;
  rhymeScheme: string;
  metaphorBreakdown?: string;
  deliveryCue?: string;
  vocalTone?: string;
}

export interface GhostwriteResult {
  title: string;
  genrePocket: string;
  bpm: number;
  key: string;
  flowStyle: string;
  bars: GhostwriteBar[];
  vocalHook: string[];
  philosophicalNote: string;
}

export interface ConfessionalMessage {
  id: string;
  sender: 'user' | 'ascension-plus';
  timestamp: string;
  text: string;
  audioGenerated?: boolean;
  emotionDetected?: EmotionalState;
  mappedKey?: string;
  counselType?: 'strategic-logic' | 'raw-catharsis' | 'balanced';
}
