import { useState } from 'react';
import {
  Layers,
  Volume2,
  VolumeX,
  Radio,
  Download,
  Check,
  Zap,
  Sliders,
  AudioWaveform,
} from 'lucide-react';
import { TrackStem } from '../types/ascension';
import { getAscensionDspEngine } from '../audio/dspEngine';

export function DawStemsMatrix() {
  const dsp = getAscensionDspEngine();
  const [stems, setStems] = useState<TrackStem[]>(dsp.stems);
  const [exported, setExported] = useState(false);

  const toggleMute = (id: string) => {
    const updated = stems.map((s) => {
      if (s.id === id) {
        const next = !s.muted;
        dsp.setStemMute(id, next);
        return { ...s, muted: next };
      }
      return s;
    });
    setStems(updated);
  };

  const toggleSolo = (id: string) => {
    const updated = stems.map((s) => {
      if (s.id === id) {
        const next = !s.soloed;
        dsp.setStemSolo(id, next);
        return { ...s, soloed: next };
      }
      return s;
    });
    setStems(updated);
  };

  const updateVolume = (id: string, vol: number) => {
    const updated = stems.map((s) => {
      if (s.id === id) {
        dsp.setStemVolume(id, vol);
        return { ...s, volume: vol };
      }
      return s;
    });
    setStems(updated);
  };

  const updatePan = (id: string, pan: number) => {
    const updated = stems.map((s) => {
      if (s.id === id) {
        dsp.setStemPan(id, pan);
        return { ...s, pan };
      }
      return s;
    });
    setStems(updated);
  };

  const exportMasterStems = () => {
    const manifest = {
      project: 'ASCENSION_PLUS_MASTER_SESSION',
      sampleRate: 48000,
      bitDepth: '24-Bit Float',
      bpm: dsp.getBpm(),
      key: dsp.getKey(),
      stems: stems.map((s) => ({
        id: s.id,
        name: s.name,
        type: s.type,
        volumeDb: (20 * Math.log10(s.volume || 0.001)).toFixed(1),
        pan: s.pan,
        muted: s.muted,
        soloed: s.soloed,
        routedThroughHollywoodDsp: s.activeDsp,
      })),
      dspChainSettings: dsp.settings,
    };

    const blob = new Blob([JSON.stringify(manifest, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ASCENSION_PLUS_STEMS_${dsp.getKey().replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setExported(true);
    setTimeout(() => setExported(false), 2500);
  };

  const correlation = dsp.getPhaseCorrelation();

  return (
    <div className="space-y-4 font-mono">
      {/* Top Console Bar */}
      <div className="bg-[#090b0e] border border-amber-500/40 rounded-xl p-4 shadow-[0_0_20px_rgba(245,158,11,0.08)]">
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 gap-2">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-500" />
            <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-slate-100">
              DAW STEMS &amp; BUS ROUTING CONSOLE
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={exportMasterStems}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all shadow-[0_0_12px_rgba(245,158,11,0.3)]"
            >
              {exported ? <Check className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
              {exported ? 'MANIFEST EXPORTED' : 'EXPORT MASTER STEMS'}
            </button>
          </div>
        </div>

        {/* 808 & Kick Phase Status Banner */}
        <div className="mt-3 p-2.5 rounded-lg bg-[#12161f] border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <AudioWaveform className="w-4 h-4 text-red-400" />
            <span className="text-slate-300">
              808 &amp; Kick Low-End Phase Bus:
            </span>
            <span className="text-emerald-400 font-bold">
              +{(correlation * 100).toFixed(0)}% In-Phase Alignment
            </span>
          </div>

          <span className="text-[11px] text-slate-400">
            Routing: Low-end 30-90Hz summing directly into One-Tap Master Limiter
          </span>
        </div>
      </div>

      {/* Multi-Track Channel Strips */}
      <div className="space-y-3">
        {stems.map((stem, idx) => (
          <div
            key={stem.id}
            className={`p-3.5 rounded-xl border transition-all ${
              stem.muted
                ? 'bg-[#0d1117]/60 border-slate-800 opacity-60'
                : 'bg-[#0d1117] border-slate-700/80 hover:border-amber-500/40'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Track Info */}
              <div className="flex items-center gap-3 min-w-[200px]">
                <div
                  className="w-3.5 h-10 rounded-sm"
                  style={{ backgroundColor: stem.color }}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">CH 0{idx + 1}</span>
                    <h3 className="text-xs sm:text-sm font-bold text-white">
                      {stem.name}
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-400 uppercase">
                    Type: {stem.type} {stem.frequencyHz ? `(${stem.frequencyHz}Hz Root)` : ''}
                  </span>
                </div>
              </div>

              {/* Mute & Solo */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleMute(stem.id)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded transition-all ${
                    stem.muted
                      ? 'bg-red-500 text-white shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                      : 'bg-[#161b22] text-slate-400 border border-slate-700 hover:text-slate-200'
                  }`}
                >
                  MUTE
                </button>
                <button
                  onClick={() => toggleSolo(stem.id)}
                  className={`px-2.5 py-1 text-[11px] font-bold rounded transition-all ${
                    stem.soloed
                      ? 'bg-amber-500 text-black shadow-[0_0_8px_rgba(245,158,11,0.4)]'
                      : 'bg-[#161b22] text-slate-400 border border-slate-700 hover:text-slate-200'
                  }`}
                >
                  SOLO
                </button>
              </div>

              {/* Volume Fader */}
              <div className="flex items-center gap-2 min-w-[160px]">
                <span className="text-[11px] text-slate-400 w-8">VOL:</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={stem.muted ? 0 : stem.volume}
                  onChange={(e) => updateVolume(stem.id, parseFloat(e.target.value))}
                  className="w-24 accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <span className="text-[11px] text-amber-400 font-bold w-12 text-right">
                  {stem.muted ? '-∞' : `${(20 * Math.log10(stem.volume || 0.001)).toFixed(1)} dB`}
                </span>
              </div>

              {/* Pan Knob */}
              <div className="flex items-center gap-2 min-w-[130px]">
                <span className="text-[11px] text-slate-400">PAN:</span>
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.05"
                  value={stem.pan}
                  onChange={(e) => updatePan(stem.id, parseFloat(e.target.value))}
                  className="w-16 accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-slate-300 w-8 text-right">
                  {stem.pan === 0 ? 'C' : stem.pan < 0 ? `L${Math.abs(Math.round(stem.pan * 100))}` : `R${Math.round(stem.pan * 100)}`}
                </span>
              </div>

              {/* DSP Status */}
              <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                <Zap className="w-3 h-3 text-emerald-400" />
                <span>DSP ROUTED</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
