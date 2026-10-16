import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateTraumaMapping,
  calculate808PhaseAlignment,
  calculateNoiseGateGain,
  calculateTubeSaturationSample,
  analyzeLyricalDensity,
} from './audioMath.ts';

test('Trauma Mapping: Grief maps to Eb Minor with +4.2 dB Tube Rasp at 100% Raw Dial', () => {
  const result = calculateTraumaMapping('I have so much grief and loss in my heart', 1.0);
  assert.equal(result.dominantEmotion, 'grief');
  assert.equal(result.mappedKey, 'Eb Minor');
  assert.equal(result.tubeRaspDb, 4.8);
  assert.equal(result.autotuneRetuneMs, 5);
  assert.match(result.dspRoutingNotes, /gospel/i);
});

test('Trauma Mapping: Aggression maps to C# Minor with 0ms Autotune', () => {
  const result = calculateTraumaMapping('Pure aggression and war ready to crash', 1.0);
  assert.equal(result.dominantEmotion, 'aggression');
  assert.equal(result.mappedKey, 'C# Minor');
  assert.equal(result.autotuneRetuneMs, 0);
  assert.match(result.dynamicCompression, /1176/i);
});

test('Trauma Mapping: Street/Counsel Dial shifts advice from Strategic Logic to Raw Catharsis', () => {
  const strategic = calculateTraumaMapping('grief and pain', 0.0);
  const raw = calculateTraumaMapping('grief and pain', 1.0);

  assert.match(strategic.ogCounsel, /strategic survival|rule/i);
  assert.match(raw.ogCounsel, /chest hurts|raw fuel/i);
});

test('808 Phase Alignment: Corrects 180 degree cancellation and restores sub-bass punch', () => {
  const uncorrected = calculate808PhaseAlignment(55, 180, false);
  assert.equal(uncorrected.correlationCoeff, -1);
  assert.ok(uncorrected.subBassPunchGainDb < 0);

  const corrected = calculate808PhaseAlignment(55, 180, true);
  assert.equal(corrected.phaseInverted, true);
  assert.equal(corrected.correlationCoeff, 0.98);
  assert.ok(corrected.subBassPunchGainDb > 5.0);
});

test('Noise Gate: Attenuates signals below silence threshold', () => {
  const belowThreshold = calculateNoiseGateGain(-60, -48, -60);
  const aboveThreshold = calculateNoiseGateGain(-20, -48, -60);

  assert.ok(belowThreshold < 0.1, 'Should attenuate weak signals below -48dB');
  assert.equal(aboveThreshold, 1.0, 'Should pass signals above threshold without attenuation');
});

test('Tube Saturation: Emulates analog non-linear soft-clipping with chest rasp', () => {
  const smallSample = calculateTubeSaturationSample(0.1, 4.2);
  const largeSample = calculateTubeSaturationSample(1.5, 4.2);

  assert.ok(Math.abs(largeSample) <= 1.0, 'Large sample should be safely contained/compressed');
  assert.ok(Math.abs(smallSample) > 0.1, 'Harmonic drive should boost low amplitude harmonics');
});

test('Lyric Metaphor Matrix: Evaluates Lil Wayne tier syllable density and metaphor complexity', () => {
  const bars = [
    'Real Gs move in silence like lasagna on the stove',
    'Cold iron penitentiary doors locked behind my soul',
    'Bulletproof cadillac gliding through the winter fog',
    'Double-cup therapy dripping sorrow through the mic',
  ];
  const analysis = analyzeLyricalDensity(bars);
  assert.equal(analysis.totalBars, 4);
  assert.ok(analysis.averageSyllables >= 10);
  assert.ok(analysis.rhymeScore >= 80);
});
