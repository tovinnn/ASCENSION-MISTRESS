import { useState } from 'react';
import {
  Sliders,
  Flame,
  Volume2,
  Wand2,
  Layers,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  Zap,
  Check,
} from 'lucide-react';
import { DSPChainSettings } from '../types/ascension';
import { getAscensionDspEngine } from '../audio/dspEngine';

interface HollywoodDspRackProps {
  activeKey: string;
}

export function HollywoodDspRack({ activeKey }: HollywoodDspRackProps) {
  const dsp = getAscensionDspEngine();
  const [settings, setSettings] = useState<DSPChainSettings>(dsp.settings);
  const [activePreset, setActivePreset] = useState<string>('Custom');

  const updateSetting = <K extends keyof DSPChainSettings>(key: K, value: DSPChainSettings[K]) => {
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    dsp.updateSettings({ [key]: value });
  };

  const applyPreset = (presetName: string) => {
    setActivePreset(presetName);
    if (presetName === 'Hollywood Master Gold') {
      const p: Partial<DSPChainSettings> = {
        silenceThresholdDb: -48,
        spectralNoiseIsolationDb: -45,
        autotuneRetuneMs: 8,
        autotuneHardTune: false,
        microTonalBends: 70,
        lowEndPhaseAlignment: true,
        phaseInvert808: false,
        phaseDelayMs: 2.1,
        spatialReverbType: 'Hollywood_Concert_Plate',
        reverbWetPercent: 28,
        tubeRaspDb: 4.2,
      };
      setSettings((prev) => ({ ...prev, ...p }));
      dsp.updateSettings(p);
    } else if (presetName === 'Street Drill Hard Tune (0ms)') {
      const p: Partial<DSPChainSettings> = {
        silenceThresholdDb: -42,
        spectralNoiseIsolationDb: -45,
        autotuneRetuneMs: 0,
        autotuneHardTune: true,
        microTonalBends: 10,
        lowEndPhaseAlignment: true,
        phaseInvert808: true,
        phaseDelayMs: 1.2,
        spatialReverbType: 'Analog_Gold_Chamber',
        reverbWetPercent: 18,
        tubeRaspDb: 6.5,
      };
      setSettings((prev) => ({ ...prev, ...p }));
      dsp.updateSettings(p);
    } else if (presetName === 'Sunday Gospel Choir Swell') {
      const p: Partial<DSPChainSettings> = {
        silenceThresholdDb: -52,
        spectralNoiseIsolationDb: -45,
        autotuneRetuneMs: 22,
        autotuneHardTune: false,
        microTonalBends: 85,
        lowEndPhaseAlignment: true,
        phaseInvert808: false,
        phaseDelayMs: 3.5,
        spatialReverbType: 'Scoring_Stage_A',
        reverbWetPercent: 42,
        tubeRaspDb: 2.5,
      };
      setSettings((prev) => ({ ...prev, ...p }));
      dsp.updateSettings(p);
    }
  };

  const correlation = dsp.getPhaseCorrelation();

  return (
    <div className="space-y-4">
      {/* Topology Signal Flow Banner matching prompt Section 4 */}
      <div className="bg-[#090b0e] border border-amber-500/40 rounded-xl p-4 shadow-[0_0_20px_rgba(245,158,11,0.08)]">
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 gap-2">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-amber-500" />
            <h2 className="font-mono text-sm sm:text-base font-extrabold uppercase tracking-wider text-slate-100">
              HOLLYWOOD STUDIO DSP MASTER CHAIN
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Current Key:</span>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono font-bold text-xs border border-amber-500/30">
              {activeKey}
            </span>
          </div>
        </div>

        {/* ASCII Flow Diagram */}
        <div className="mt-3 overflow-x-auto pb-1">
          <div className="flex items-center justify-between min-w-[640px] text-xs font-mono py-2 px-3 bg-[#12161f] rounded-lg border border-slate-800 text-slate-300">
            <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 font-bold border border-slate-700">
              [Raw Stem]
            </span>
            <span className="text-amber-500 font-bold">──►</span>
            <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
              [Silence Stripper]
            </span>
            <span className="text-amber-500 font-bold">──►</span>
            <span className="px-2 py-1 rounded bg-blue-500/10 text-blue-300 border border-blue-500/30">
              [Spectral Subtraction]
            </span>
            <span className="text-amber-500 font-bold">──►</span>
            <span className="px-2 py-1 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
              [Pitch &amp; Autotune]
            </span>
            <span className="text-amber-500 font-bold">──►</span>
            <span className="px-2 py-1 rounded bg-red-500/10 text-red-300 border border-red-500/30">
              [808 Phase Alignment]
            </span>
            <span className="text-amber-500 font-bold">──►</span>
            <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/40">
              [Master Limiter]
            </span>
          </div>
        </div>

        {/* Quick Presets Bar */}
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-3 border-t border-slate-800/80 font-mono text-xs">
          <span className="text-slate-400">Master Presets:</span>
          {['Hollywood Master Gold', 'Street Drill Hard Tune (0ms)', 'Sunday Gospel Choir Swell'].map((p) => (
            <button
              key={p}
              onClick={() => applyPreset(p)}
              className={`px-3 py-1 rounded-md transition-all ${
                activePreset === p
                  ? 'bg-amber-500 text-black font-bold shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                  : 'bg-[#161b22] text-slate-300 hover:text-white border border-slate-800'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* DSP Hardware Rack Units Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Unit 1: Dynamic Silence Stripper */}
        <div className="bg-[#0d1117] border border-[#21262d] rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-wider">
                1. Silence Stripper
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-2">
              Scans vocal stems to drop silence gaps, clicks, and breath artifacts without cutting attack transients.
            </p>

            <div className="mt-4 space-y-3 font-mono text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Threshold:</span>
                  <span className="text-amber-400 font-bold">{settings.silenceThresholdDb} dB</span>
                </div>
                <input
                  type="range"
                  min="-65"
                  max="-25"
                  value={settings.silenceThresholdDb}
                  onChange={(e) => updateSetting('silenceThresholdDb', Number(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-[#161b22] border border-slate-800">
                <span className="text-slate-400 text-[11px]">Breath Artifact Dropper:</span>
                <span className="text-emerald-400 text-[11px] font-bold">ENGAGED</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>Attack: 2.1 ms</span>
            <span>Release: 85 ms</span>
          </div>
        </div>

        {/* Unit 2: Spectral Noise Isolation */}
        <div className="bg-[#0d1117] border border-[#21262d] rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-mono text-xs font-bold text-blue-400 uppercase tracking-wider">
                2. Spectral Subtraction
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                -45 dB Floor
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-2">
              Real-time noise floor attenuation removing ambient room hums, fan noise, and hiss while preserving warmth.
            </p>

            <div className="mt-4 space-y-2.5 font-mono text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-[#161b22] border border-slate-800">
                <span className="text-slate-300">60Hz AC Hum Notch:</span>
                <span className="text-emerald-400 font-bold text-[11px]">-36 dB Attenuated</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#161b22] border border-slate-800">
                <span className="text-slate-300">75Hz Sub-Rumble Highpass:</span>
                <span className="text-emerald-400 font-bold text-[11px]">18 dB/Oct Locked</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded bg-[#161b22] border border-slate-800">
                <span className="text-slate-300">Air Preserver (&gt;10kHz):</span>
                <span className="text-amber-400 font-bold text-[11px]">+2.5 dB Studio Sheen</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>Noise Floor: -45 dB</span>
            <span>Vocal Warmth: 100% Retained</span>
          </div>
        </div>

        {/* Unit 3: Pitch Correction & Autotune */}
        <div className="bg-[#0d1117] border border-[#21262d] rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-mono text-xs font-bold text-purple-400 uppercase tracking-wider">
                3. Pitch &amp; Autotune Engine
              </span>
              <button
                onClick={() => updateSetting('autotuneRetuneMs', 0)}
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold transition-all ${
                  settings.autotuneRetuneMs === 0
                    ? 'bg-red-500 text-white shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                    : 'bg-[#161b22] text-slate-400 border border-slate-700'
                }`}
                title="Clamps retune speed to 0ms for hard-tuned street drill effect"
              >
                0ms Hard Tune
              </button>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-2">
              Sample-accurate pitch alignment alongside ultra-fast 0ms autotune and Rod Wave micro-tonal bends.
            </p>

            <div className="mt-4 space-y-3 font-mono text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Retune Speed:</span>
                  <span className="text-purple-400 font-bold">
                    {settings.autotuneRetuneMs} ms {settings.autotuneRetuneMs === 0 && '⚡ HARD TUNE'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="45"
                  value={settings.autotuneRetuneMs}
                  onChange={(e) => updateSetting('autotuneRetuneMs', Number(e.target.value))}
                  className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Micro-tonal Emotional Bend:</span>
                  <span className="text-amber-400 font-bold">{settings.microTonalBends}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.microTonalBends}
                  onChange={(e) => updateSetting('microTonalBends', Number(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>Scale: {activeKey}</span>
            <span>Formants: Natural Chest</span>
          </div>
        </div>

        {/* Unit 4: 808 & Kick Low-End Phase Alignment (30-90Hz) */}
        <div className="bg-[#0d1117] border border-[#21262d] rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-mono text-xs font-bold text-red-400 uppercase tracking-wider">
                4. 808 Low-End Phase Alignment
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/30">
                30 Hz - 90 Hz
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-2">
              Aligns phase markers between 808 sub-bass and kick drums in 30-90 Hz to eliminate phase cancellation.
            </p>

            <div className="mt-4 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between p-2 rounded bg-[#161b22] border border-slate-800">
                <span className="text-slate-300">Phase Inversion (180° Flip):</span>
                <button
                  onClick={() => updateSetting('phaseInvert808', !settings.phaseInvert808)}
                  className={`px-2 py-1 rounded font-bold text-[10px] transition-all ${
                    settings.phaseInvert808
                      ? 'bg-red-500 text-white'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {settings.phaseInvert808 ? 'INVERTED (180°)' : 'NORMAL (0°)'}
                </button>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Sub Delay Compensation:</span>
                  <span className="text-red-400 font-bold">{settings.phaseDelayMs} ms</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  step="0.1"
                  value={settings.phaseDelayMs}
                  onChange={(e) => updateSetting('phaseDelayMs', Number(e.target.value))}
                  className="w-full accent-red-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              {/* Real-time Correlation Meter */}
              <div className="p-2 rounded bg-[#12161f] border border-slate-800 text-[11px]">
                <div className="flex justify-between mb-1">
                  <span className="text-slate-400">Phase Correlation:</span>
                  <span className="text-emerald-400 font-bold">+{(correlation * 100).toFixed(0)}% (LOCKED)</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                  <div className="bg-red-500 h-full w-1/4 opacity-30" />
                  <div className="bg-amber-500 h-full w-1/4 opacity-40" />
                  <div className="bg-emerald-500 h-full w-1/2 rounded-r-full shadow-[0_0_8px_#10b981]" />
                </div>
                <div className="flex justify-between text-[9px] text-slate-500 mt-1">
                  <span>-1.0 (Cancel)</span>
                  <span>0.0</span>
                  <span className="text-emerald-400 font-bold">+1.0 (Maximum Punch)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>Target Band: 30 - 90 Hz</span>
            <span className="text-emerald-400">+5.8 dB Punch Gain</span>
          </div>
        </div>

        {/* Unit 5: Spatial Convolution Reverb */}
        <div className="bg-[#0d1117] border border-[#21262d] rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-mono text-xs font-bold text-amber-400 uppercase tracking-wider">
                5. Spatial Convolution Reverb
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                BPM Synced
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-2">
              Algorithmic convolution emulation of premier Hollywood scoring stages, analog chambers, and vintage plate reverbs.
            </p>

            <div className="mt-4 space-y-3 font-mono text-xs">
              <div>
                <span className="text-slate-400 block mb-1">Acoustic Space / Chamber:</span>
                <select
                  value={settings.spatialReverbType}
                  onChange={(e) =>
                    updateSetting(
                      'spatialReverbType',
                      e.target.value as DSPChainSettings['spatialReverbType']
                    )
                  }
                  className="w-full bg-[#161b22] border border-slate-700 rounded p-1.5 text-xs text-amber-300 font-mono focus:outline-none focus:border-amber-500"
                >
                  <option value="Hollywood_Concert_Plate">Hollywood Concert Plate (2.8s Gold Vintage)</option>
                  <option value="Scoring_Stage_A">Hollywood Scoring Stage A (4.2s Cinematic Hall)</option>
                  <option value="Analog_Gold_Chamber">Vintage Analog Gold Chamber (1.6s Warm Tube)</option>
                </select>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span>Reverb Wet Mix:</span>
                  <span className="text-amber-400 font-bold">{settings.reverbWetPercent}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="70"
                  value={settings.reverbWetPercent}
                  onChange={(e) => updateSetting('reverbWetPercent', Number(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>Decay: 2.8s</span>
            <span>Early Reflections: Preserved</span>
          </div>
        </div>

        {/* Unit 6: One-Tap Master Limiter & Tube Rasp */}
        <div className="bg-[#0d1117] border border-[#21262d] rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="font-mono text-xs font-bold text-emerald-400 uppercase tracking-wider">
                6. One-Tap Master Chain
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                -0.2 dB True Peak
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-2">
              Multi-band dynamic compressor, dynamic EQ, analog tube rasp, and brickwall limiter for commercial streaming loudness.
            </p>

            <div className="mt-4 space-y-3 font-mono text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span className="flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-500" />
                    Tube Rasp Drive:
                  </span>
                  <span className="text-amber-400 font-bold">+{settings.tubeRaspDb} dB</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="8"
                  step="0.1"
                  value={settings.tubeRaspDb}
                  onChange={(e) => updateSetting('tubeRaspDb', Number(e.target.value))}
                  className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-[#161b22] border border-slate-800">
                <span className="text-slate-300">Brickwall True Peak Ceiling:</span>
                <span className="text-emerald-400 font-bold text-[11px]">-0.2 dB FS</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded bg-[#161b22] border border-slate-800">
                <span className="text-slate-300">Commercial Loudness Target:</span>
                <span className="text-amber-400 font-bold text-[11px]">-9.0 LUFS Integrated</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
            <span>Ratio: 4:1 VCA</span>
            <span>Limiter: Brickwall Lookahead</span>
          </div>
        </div>
      </div>
    </div>
  );
}
