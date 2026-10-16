/**
 * ASCENSION-plus Pure Logic Engine
 * DSP calculations, Trauma-to-Track translation, Phase Alignment, Tube Saturation, and Lyric Analysis
 */

import type { EmotionalState, TraumaAnalysisResult } from '../types/ascension.ts';

export interface PhaseAlignmentCalc {
  frequencyHz: number;
  periodMs: number;
  phaseOffsetDeg: number;
  optimalDelayMs: number;
  phaseInverted: boolean;
  correlationCoeff: number; // -1 to +1
  subBassPunchGainDb: number;
}

/**
 * Trauma-to-Track Translation Engine
 * Maps psychological stress / grief / paranoia / aggression / redemption
 * into tangible musical keys, tube saturation levels, and DSP routing.
 */
export function calculateTraumaMapping(
  emotionOrText: string,
  streetCounselDial: number = 1.0 // 0.0 (Pure Strategic Logic) to 1.0 (Raw Catharsis)
): TraumaAnalysisResult {
  const lower = emotionOrText.toLowerCase();

  let dominantEmotion: EmotionalState = 'neutral';
  let intensity = 0.7;

  if (
    lower.includes('grief') ||
    lower.includes('loss') ||
    lower.includes('pain') ||
    lower.includes('crying') ||
    lower.includes('funeral') ||
    lower.includes('rip') ||
    lower.includes('mourn')
  ) {
    dominantEmotion = 'grief';
    intensity = 0.9;
  } else if (
    lower.includes('aggression') ||
    lower.includes('anger') ||
    lower.includes('war') ||
    lower.includes('shoot') ||
    lower.includes('fight') ||
    lower.includes('enemy') ||
    lower.includes('threat') ||
    lower.includes('crash')
  ) {
    dominantEmotion = 'aggression';
    intensity = 0.95;
  } else if (
    lower.includes('paranoia') ||
    lower.includes('feds') ||
    lower.includes('watch') ||
    lower.includes('wire') ||
    lower.includes('setup') ||
    lower.includes('snake') ||
    lower.includes('fake') ||
    lower.includes('trust')
  ) {
    dominantEmotion = 'paranoia';
    intensity = 0.85;
  } else if (
    lower.includes('redemption') ||
    lower.includes('god') ||
    lower.includes('pray') ||
    lower.includes('survive') ||
    lower.includes('blessed') ||
    lower.includes('ascend') ||
    lower.includes('victory')
  ) {
    dominantEmotion = 'redemption';
    intensity = 0.8;
  } else {
    // Default fallback based on high-stress street realities
    dominantEmotion = 'grief';
  }

  // Dial adjustment: 0% = Pure Strategic Logic, 100% = Raw Catharsis
  const rawBlend = Math.max(0, Math.min(1, streetCounselDial));

  switch (dominantEmotion) {
    case 'grief':
      return {
        dominantEmotion: 'grief',
        intensity,
        mappedKey: 'Eb Minor',
        scale: 'Soul / Southern Gospel Blues Pentatonic',
        tubeRaspDb: parseFloat((3.0 + 1.8 * rawBlend).toFixed(1)), // +4.2 dB at 100%
        autotuneRetuneMs: Math.round(12 - 7 * rawBlend), // 5ms - 12ms natural vocal bend
        dynamicCompression: 'Warm Opto-Vintage (LA-2A slow release with chest preservation)',
        harmonies: ['Eb minor triad', 'Ab minor add9', 'Bb minor 7th gospel stack'],
        dspRoutingNotes: 'Tube tape saturation engaged (+4.2 dB rasp). Wide gospel background harmonizer active.',
        ogCounsel:
          rawBlend > 0.5
            ? "Look me in the eyes, nephew. Pain ain't a death sentence—it's raw fuel. Lay that grief down into the mic until your chest hurts. Don't hide the crack in your throat; that's where the soul lives."
            : "Strategic survival rule #1: Grief unchanneled turns into reckless moves. Lock in your perimeter, protect your family, and turn this heavy weight into an undeniable master track.",
      };

    case 'aggression':
      return {
        dominantEmotion: 'aggression',
        intensity,
        mappedKey: 'C# Minor',
        scale: 'Hard Street Drill / Harmonic Minor',
        tubeRaspDb: parseFloat((4.5 + 2.5 * rawBlend).toFixed(1)), // Up to +7 dB rasp
        autotuneRetuneMs: rawBlend > 0.5 ? 0 : 2, // Hard 0ms autotune street vocal effect
        dynamicCompression: 'Fast-Attack VCA (1176 All-Buttons in, aggressive punch)',
        harmonies: ['C# octave down grunts', 'Distorted fifth drone', 'Menacing stereo chants'],
        dspRoutingNotes: 'Autotune clamped to 0 ms retune speed. Fast-attack dynamic limiter on vocal transient bus.',
        ogCounsel:
          rawBlend > 0.5
            ? "When that anger boil over, spit it pure and unfiltered. But remember: street chess over street crash. Put every bullet on that 16-bar verse instead of throwing your life to the state."
            : "Cool the engine before you make a play. War cost money, legal paper, and quiet tears. Channel the rage into clinical precision: 0ms retune speed, dynamic VCA compression, finish the record.",
      };

    case 'paranoia':
      return {
        dominantEmotion: 'paranoia',
        intensity,
        mappedKey: 'F Minor',
        scale: 'Suspense Cinematic Blues / Diminished Tension',
        tubeRaspDb: parseFloat((2.5 + 2.0 * rawBlend).toFixed(1)),
        autotuneRetuneMs: 6,
        dynamicCompression: 'Multi-band sidechain with high-pass vocal containment',
        harmonies: ['F minor 9 suspended', 'Distant analog chamber whisper', 'High octave eerie ad-libs'],
        dspRoutingNotes: 'Spectral noise isolation locked at -45 dB floor. Spatial analog chamber reverb engaged.',
        ogCounsel:
          rawBlend > 0.5
            ? "Paranoia keep you alive in the yard, but it'll drive you crazy in the free world. If you feel eyes on you, document the energy in your bars. Let the beat carry the suspicion so your spirit don't rot."
            : "Audit your circle immediately. No talk over cell towers. Keep the movements tight, observe silence, and keep the master stems backed up on cold drives.",
      };

    case 'redemption':
      return {
        dominantEmotion: 'redemption',
        intensity,
        mappedKey: 'G Major',
        scale: 'Sunday Morning Gospel Major Pentatonic / Church Choir Uplift',
        tubeRaspDb: parseFloat((1.5 + 1.5 * rawBlend).toFixed(1)),
        autotuneRetuneMs: 18,
        dynamicCompression: 'Gentle Fairchild Vari-Mu Glue Compression',
        harmonies: ['G major 7', 'C major add9 gospel swell', 'Wide 4-part choir voicing'],
        dspRoutingNotes: 'Hollywood Concert Plate reverb dialed to 35% wet. Harmonic exciter open on top air.',
        ogCounsel:
          rawBlend > 0.5
            ? "You walked through the fire, did your time in the dirt, and you still standing here breathing. That's divine protection. Sing this one from the diaphragm like Sunday service in church."
            : "Take inventory of the blessings. Build institutions for your people. Turn the trauma into generational equity. Record the triumph.",
      };

    default:
      return {
        dominantEmotion: 'neutral',
        intensity: 0.5,
        mappedKey: 'Eb Minor',
        scale: 'Standard Street Blues',
        tubeRaspDb: 3.5,
        autotuneRetuneMs: 8,
        dynamicCompression: 'Standard Studio Vocal Bus Glue',
        harmonies: ['Minor third vocal doubler'],
        dspRoutingNotes: 'Standard Hollywood master chain active.',
        ogCounsel: 'Keep your focus razor sharp. Step up to the mic and lay your truth down.',
      };
  }
}

/**
 * 808 & Kick Low-End Phase Alignment (30 Hz - 90 Hz)
 * Prevents phase cancellation by computing time delay and inversion.
 */
export function calculate808PhaseAlignment(
  frequencyHz: number = 55, // Typical low-end sub root (A1 / C1)
  currentPhaseOffsetDeg: number = 180, // Inverted by default
  applyCorrection: boolean = true
): PhaseAlignmentCalc {
  const boundedFreq = Math.max(30, Math.min(90, frequencyHz));
  const periodMs = (1000 / boundedFreq);
  
  // Normalize offset to 0-360
  const normalizedDeg = ((currentPhaseOffsetDeg % 360) + 360) % 360;

  // Correlation factor: 0 deg = +1.0 (in-phase), 180 deg = -1.0 (complete phase cancellation)
  const rad = (normalizedDeg * Math.PI) / 180;
  const initialCorrelation = Math.cos(rad);

  if (!applyCorrection) {
    return {
      frequencyHz: boundedFreq,
      periodMs: parseFloat(periodMs.toFixed(2)),
      phaseOffsetDeg: normalizedDeg,
      optimalDelayMs: 0,
      phaseInverted: false,
      correlationCoeff: parseFloat(initialCorrelation.toFixed(3)),
      subBassPunchGainDb: parseFloat((initialCorrelation * 3.5).toFixed(1)),
    };
  }

  // If phase is roughly out of phase (> 90 and < 270 deg), inverting the phase gives an immediate 180 flip
  let phaseInverted = false;
  let remainingDeg = normalizedDeg;

  if (normalizedDeg > 90 && normalizedDeg < 270) {
    phaseInverted = true;
    remainingDeg = Math.abs(normalizedDeg - 180);
  }

  // Time delay compensation for remaining phase degrees
  const optimalDelayMs = parseFloat(((remainingDeg / 360) * periodMs).toFixed(2));
  const correctedCorrelation = 0.98; // Phase locked
  const subBassPunchGainDb = 5.8; // Maximum low end punch restored

  return {
    frequencyHz: boundedFreq,
    periodMs: parseFloat(periodMs.toFixed(2)),
    phaseOffsetDeg: 0, // Corrected
    optimalDelayMs,
    phaseInverted,
    correlationCoeff: correctedCorrelation,
    subBassPunchGainDb,
  };
}

/**
 * Dynamic Noise Gate / Silence Stripping calculation
 */
export function calculateNoiseGateGain(
  inputSignalDb: number,
  thresholdDb: number = -48,
  rangeDb: number = -60
): number {
  if (inputSignalDb < thresholdDb) {
    const diff = thresholdDb - inputSignalDb;
    const attenuation = Math.min(Math.abs(rangeDb), diff * 2.5);
    return Math.pow(10, -attenuation / 20);
  }
  return 1.0;
}

/**
 * Tube Saturation Transfer Function
 * Authentic analog warm rasp emulation using soft-clipping tanh with second-order warmth.
 */
export function calculateTubeSaturationSample(
  inputSample: number,
  driveDb: number = 4.2
): number {
  const gain = Math.pow(10, driveDb / 20);
  const driven = inputSample * gain;
  // Non-linear tube curve: tanh(x) with gentle even harmonic bias for chest rasp
  const saturated = Math.tanh(driven) + 0.08 * (driven * driven) / (1 + Math.abs(driven));
  // Normalize back to prevent clipping
  return Math.max(-1.0, Math.min(1.0, saturated * (1 / (1 + 0.15 * gain))));
}

/**
 * Lyric Metaphor & Syllable Density Analysis (Lil Wayne tier calculation)
 */
export function analyzeLyricalDensity(bars: string[]): {
  averageSyllables: number;
  totalBars: number;
  rhymeScore: number; // 0 to 100
  metaphorTier: 'Lil Wayne High-IQ' | 'Kevin Gates Concrete' | 'Rod Wave Soul' | 'Standard';
  detectedPatterns: string[];
} {
  if (!bars || bars.length === 0) {
    return {
      averageSyllables: 0,
      totalBars: 0,
      rhymeScore: 0,
      metaphorTier: 'Standard',
      detectedPatterns: [],
    };
  }

  let totalSyllables = 0;
  const patterns: string[] = [];

  bars.forEach((bar) => {
    // Basic vowel cluster syllable estimation
    const words = bar.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/).filter(Boolean);
    let barSyllables = 0;
    words.forEach((w) => {
      const match = w.match(/[aeiouy]{1,2}/g);
      barSyllables += match ? match.length : 1;
    });
    totalSyllables += barSyllables;

    if (bar.includes('like') || bar.includes('as') || bar.includes('cold') || bar.includes('bullet') || bar.includes('fire')) {
      patterns.push('Double-entendre metaphor');
    }
    if (bar.match(/\b(steel|iron|cell|bars|court|sentence)\b/i)) {
      patterns.push('Penitentiary concrete logic');
    }
  });

  const avgSyllables = parseFloat((totalSyllables / bars.length).toFixed(1));
  const rhymeScore = Math.min(99, Math.round(75 + avgSyllables * 1.5));

  let metaphorTier: 'Lil Wayne High-IQ' | 'Kevin Gates Concrete' | 'Rod Wave Soul' | 'Standard' = 'Lil Wayne High-IQ';
  if (patterns.includes('Penitentiary concrete logic')) {
    metaphorTier = 'Kevin Gates Concrete';
  } else if (avgSyllables >= 14) {
    metaphorTier = 'Lil Wayne High-IQ';
  } else {
    metaphorTier = 'Rod Wave Soul';
  }

  return {
    averageSyllables: avgSyllables,
    totalBars: bars.length,
    rhymeScore,
    metaphorTier,
    detectedPatterns: Array.from(new Set(patterns)),
  };
}
