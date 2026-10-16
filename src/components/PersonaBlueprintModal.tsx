import { useState, useEffect } from 'react';
import {
  FileCode2,
  Copy,
  Check,
  Cpu,
  Layers,
  Terminal,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { AscensionSystemConfig } from '../types/ascension';

export function PersonaBlueprintModal() {
  const [configText, setConfigText] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        setConfigText(JSON.stringify(data, null, 2));
      })
      .catch((err) => {
        console.warn('Failed to load remote config, using embedded blueprint:', err);
        const defaultConfig: AscensionSystemConfig = {
          system_identifier: 'ASCENSION_PLUS_CORE',
          version: '2.0.0-PROD',
          persona_matrix: {
            identity: 'ASCENSION-plus',
            affiliation_lore: '107 Hoover Criminal OG',
            tone: 'Raw, unfiltered, street-smart, deeply emotional, highly intelligent',
            vocal_dna: {
              gospel_blues_range: 'Multi-octave dynamic chest and head voice',
              lyrical_tier: 'Lil Wayne metaphor density and syncopation',
              wisdom_tier: 'Kevin Gates street psychology and penitentiary knowledge',
              emotional_tier: 'Rod Wave soul resonance and micro-tonal bends',
            },
          },
          dsp_routing: {
            noise_floor_threshold_db: -45,
            autotune_default_retune_ms: 5,
            low_end_phase_alignment: true,
            spatial_reverb_type: 'Hollywood_Concert_Plate',
          },
          yard_matrix_config: {
            unfiltered_mode: true,
            street_counsel_dial: 1.0,
            trauma_key_mapping: {
              grief: 'Eb_Minor',
              aggression: 'Csharp_Minor',
              paranoia: 'F_Minor',
              redemption: 'G_Major',
            },
          },
        };
        setConfigText(JSON.stringify(defaultConfig, null, 2));
      });
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(configText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = async () => {
    setSaveError(null);
    try {
      const parsed = JSON.parse(configText);
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsed),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        setSaveError('Failed to persist configuration to server file');
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Invalid JSON';
      setSaveError(`JSON Parse Error: ${message}`);
    }
  };

  return (
    <div className="space-y-4 font-mono text-xs">
      {/* Topology Blueprint Banner */}
      <div className="bg-[#090b0e] border border-amber-500/40 rounded-xl p-4 shadow-[0_0_20px_rgba(245,158,11,0.08)]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-amber-500" />
            <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-slate-100">
              SYSTEM TOPOLOGY &amp; ARCHITECTURE BLUEPRINT
            </h2>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[11px] font-bold">
            CROSS-PLATFORM DAEMON
          </span>
        </div>

        {/* System Topology Diagram matching user prompt */}
        <div className="my-3 p-3 bg-[#12161f] rounded-lg border border-slate-800 text-[11px] leading-relaxed text-slate-300 overflow-x-auto whitespace-pre">
{`┌─────────────────────────────────────────────────────────────────────────┐
│                          ASCENSION DAW ENGINE                           │
├─────────────────────────────────────────────────────────────────────────┤
│  [User Audio Input] ──► [Transient / Pocket Scanner]                    │
│                                 │                                       │
│                                 ▼                                       │
│          ┌──────────────────────────────────────────────┐               │
│          │             ASCENSION-PLUS ENGINE            │               │
│          ├──────────────────────────────────────────────┤               │
│          │  1. Neural Vocal Engine (Gospel/Soul/Blues)   │               │
│          │  2. Lyrical Metaphor Matrix (Wayne-Level)    │               │
│          │  3. The Yard Matrix (Therapeutic Core)       │               │
│          │  4. Hollywood Studio DSP Master Chain        │               │
│          └──────────────────────────────────────────────┘               │
│                                 │                                       │
│                                 ▼                                       │
│            [Processed Master Output / Bus Routing]                      │
└─────────────────────────────────────────────────────────────────────────┘`}
        </div>

        {/* 4 Pillars Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
          <div className="p-3 bg-[#161b22] rounded-lg border border-slate-800">
            <span className="text-amber-400 font-bold block mb-1">1. Neural Vocal Engine</span>
            <p className="text-slate-400 text-[11px]">
              Multi-octave range, R&amp;B agility, chest-voice Southern gospel and raspy street-blues harmonizations.
            </p>
          </div>

          <div className="p-3 bg-[#161b22] rounded-lg border border-slate-800">
            <span className="text-amber-400 font-bold block mb-1">2. Lyrical Metaphor Matrix</span>
            <p className="text-slate-400 text-[11px]">
              Lil Wayne-level multi-syllabic rhyme schemes, double-entendres, and high-IQ metaphor structures.
            </p>
          </div>

          <div className="p-3 bg-[#161b22] rounded-lg border border-slate-800">
            <span className="text-amber-400 font-bold block mb-1">3. The Yard Matrix</span>
            <p className="text-slate-400 text-[11px]">
              Unfiltered street confessional, Street/Counsel Dial (0-100%), and automatic trauma-to-track key mapping.
            </p>
          </div>

          <div className="p-3 bg-[#161b22] rounded-lg border border-slate-800">
            <span className="text-amber-400 font-bold block mb-1">4. Hollywood Studio DSP</span>
            <p className="text-slate-400 text-[11px]">
              Silence Stripper, Spectral Noise Isolation (-45dB), 0ms Autotune, 808 Phase Align, and Brickwall Limiter.
            </p>
          </div>
        </div>
      </div>

      {/* Configuration File Editor: yard_matrix_persona.json */}
      <div className="bg-[#0d1117] border border-[#21262d] rounded-xl p-4">
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 gap-2">
          <div className="flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-amber-500" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              System Configuration: /assets/config/yard_matrix_persona.json
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#161b22] hover:bg-[#1f242c] text-slate-300 border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'COPIED' : 'COPY JSON'}
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1 px-3 py-1 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold transition-all shadow-[0_0_10px_rgba(245,158,11,0.3)]"
            >
              {saved ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              {saved ? 'SAVED TO DISK' : 'SAVE CONFIG'}
            </button>
          </div>
        </div>

        {saveError && (
          <div className="my-2 p-2 bg-red-500/20 border border-red-500 text-red-300 rounded text-xs">
            {saveError}
          </div>
        )}

        {saved && (
          <div className="my-2 p-2 bg-emerald-500/20 border border-emerald-500 text-emerald-300 rounded text-xs">
            Configuration successfully synchronized to /assets/config/yard_matrix_persona.json!
          </div>
        )}

        <div className="mt-3">
          <textarea
            value={configText}
            onChange={(e) => setConfigText(e.target.value)}
            rows={22}
            className="w-full bg-[#090b0e] text-emerald-400 border border-slate-800 rounded-lg p-3 font-mono text-xs leading-relaxed focus:outline-none focus:border-amber-500"
            spellCheck={false}
          />
        </div>

        {/* Immediate Implementation Roadmap Checklist */}
        <div className="mt-4 pt-3 border-t border-slate-800">
          <span className="text-slate-400 font-bold block mb-2 uppercase tracking-wider text-[11px]">
            Immediate Implementation Roadmap Checklist:
          </span>
          <div className="space-y-1.5 text-slate-300 text-[11px]">
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Deploy Neural Config: yard_matrix_persona.json loaded into local /assets/config/ directory</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Hook Audio DSP Pipeline: Web Audio API noise subtraction, 0ms autotune, and 808 phase alignment connected</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Bind UI HUD Controls: Street/Counsel Dial slider mapped directly to system prompt gain and vocal saturation</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
