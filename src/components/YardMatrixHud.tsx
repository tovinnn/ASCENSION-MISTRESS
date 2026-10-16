import { useState } from 'react';
import {
  Mic,
  Send,
  Sliders,
  Volume2,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  Flame,
  BrainCircuit,
  Radio,
  CheckCircle2,
} from 'lucide-react';
import { TraumaAnalysisResult, ConfessionalMessage } from '../types/ascension';
import { getAscensionDspEngine } from '../audio/dspEngine';
import { calculateTraumaMapping } from '../utils/audioMath';

interface YardMatrixHudProps {
  onTraumaApplied: (result: TraumaAnalysisResult) => void;
  activeKey: string;
}

export function YardMatrixHud({ onTraumaApplied, activeKey }: YardMatrixHudProps) {
  const dsp = getAscensionDspEngine();

  // Street / Counsel Dial (0.0 = Pure Strategic Logic, 1.0 = Raw Catharsis)
  const [dialValue, setDialValue] = useState<number>(1.0);
  const [ventInput, setVentInput] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isSpeakingTts, setIsSpeakingTts] = useState<boolean>(false);

  // Active Trauma Translation State matching user prompt diagram
  const [translationState, setTranslationState] = useState<TraumaAnalysisResult>({
    dominantEmotion: 'grief',
    intensity: 0.9,
    mappedKey: 'Eb Minor',
    scale: 'Soul / Southern Gospel Blues Pentatonic',
    tubeRaspDb: 4.2,
    autotuneRetuneMs: 5,
    dynamicCompression: 'Warm Opto-Vintage (LA-2A slow release with chest preservation)',
    harmonies: ['Eb minor triad', 'Ab minor add9', 'Bb minor 7th gospel stack'],
    dspRoutingNotes: 'Tube tape saturation engaged (+4.2 dB rasp). Wide gospel background harmonizer active.',
    ogCounsel:
      "Look me in the eyes, nephew. Pain ain't a death sentence—it's raw fuel. Lay that grief down into the mic until your chest hurts. Don't hide the crack in your throat; that's where the soul lives.",
  });

  // Confessional message log
  const [messages, setMessages] = useState<ConfessionalMessage[]>([
    {
      id: 'm1',
      sender: 'ascension-plus',
      timestamp: '22:42:01',
      text: 'Yard Matrix open-mic channel initialized. 107 Hoover OG frequency locked. Spill whatever is on your chest—paranoia, family loss, war on the block, or survivor guilt. We turning every drop of blood into a master stem.',
      emotionDetected: 'neutral',
      mappedKey: 'Eb Minor',
    },
  ]);

  const presetVents = [
    {
      label: 'Severe Grief / Kin Loss',
      text: 'Lost my day-one brother last winter. Still feel that hollow pit in my chest every time I sit in the dark. How do I survive this grief without losing my mind?',
      emotion: 'grief',
    },
    {
      label: 'High Aggression / Street Tension',
      text: 'Enemies circling our perimeter talking reckless online. Blood is boiling and I am ready to crash out and put hands on everything moving.',
      emotion: 'aggression',
    },
    {
      label: 'Paranoia / Wiretaps & Setup',
      text: 'Unmarked cruisers parked at the corner store, former associates acting unusual, feeling like everyone got a price on my freedom and the walls are closing in.',
      emotion: 'paranoia',
    },
    {
      label: 'Spiritual Redemption / Sunday Service',
      text: 'Did time behind cold steel doors and thought I was finished. But God pulled me out the dirt and gave me this voice to feed my family.',
      emotion: 'redemption',
    },
  ];

  const handleDialChange = (newVal: number) => {
    setDialValue(newVal);
    // Recalculate translation with new dial ratio
    const updated = calculateTraumaMapping(
      translationState.dominantEmotion || 'grief',
      newVal
    );
    setTranslationState((prev) => ({
      ...prev,
      tubeRaspDb: updated.tubeRaspDb,
      autotuneRetuneMs: updated.autotuneRetuneMs,
      ogCounsel: updated.ogCounsel,
    }));
  };

  const handleAnalyzeVent = async (overrideText?: string) => {
    const textToSend = overrideText || ventInput;
    if (!textToSend.trim()) return;

    setIsAnalyzing(true);

    // Optimistically update translation state and DSP parameters immediately
    const instantMapping = calculateTraumaMapping(textToSend, dialValue);
    setTranslationState(instantMapping);
    dsp.applyTraumaParameters(instantMapping.mappedKey, instantMapping.tubeRaspDb, instantMapping.autotuneRetuneMs);
    onTraumaApplied(instantMapping);

    // Add user message to log
    const userMsg: ConfessionalMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString(),
      text: textToSend,
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const res = await fetch('/api/trauma-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ventText: textToSend,
          streetCounselDial: dialValue,
        }),
      });

      if (res.ok) {
        const data: TraumaAnalysisResult = await res.json();
        setTranslationState(data);

        // Auto-apply to DSP Engine and parent
        dsp.applyTraumaParameters(data.mappedKey, data.tubeRaspDb, data.autotuneRetuneMs);
        onTraumaApplied(data);

        // Add response message
        const replyMsg: ConfessionalMessage = {
          id: `ap-${Date.now()}`,
          sender: 'ascension-plus',
          timestamp: new Date().toLocaleTimeString(),
          text: data.ogCounsel,
          emotionDetected: data.dominantEmotion,
          mappedKey: data.mappedKey,
          counselType: dialValue > 0.5 ? 'raw-catharsis' : 'strategic-logic',
        };
        setMessages((prev) => [...prev, replyMsg]);
      } else {
        // Fallback
        const fallback = calculateTraumaMapping(textToSend, dialValue);
        setTranslationState(fallback);
        dsp.applyTraumaParameters(fallback.mappedKey, fallback.tubeRaspDb, fallback.autotuneRetuneMs);
        onTraumaApplied(fallback);
      }
    } catch (err) {
      console.warn('Trauma analysis request error, falling back locally:', err);
      const fallback = calculateTraumaMapping(textToSend, dialValue);
      setTranslationState(fallback);
      dsp.applyTraumaParameters(fallback.mappedKey, fallback.tubeRaspDb, fallback.autotuneRetuneMs);
      onTraumaApplied(fallback);
    } finally {
      setIsAnalyzing(false);
      setVentInput('');
    }
  };

  const speakCounsel = async (text: string) => {
    if (isSpeakingTts) return;
    setIsSpeakingTts(true);

    try {
      // Try Gemini TTS server route first
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.available && data.audioBase64) {
          const audio = new Audio(`data:${data.mimeType};base64,${data.audioBase64}`);
          audio.onended = () => setIsSpeakingTts(false);
          await audio.play();
          return;
        }
      }

      // Web Speech API fallback with gritty/deep pitch
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.92;
        utterance.pitch = 0.75; // Deep resonance
        utterance.onend = () => setIsSpeakingTts(false);
        utterance.onerror = () => setIsSpeakingTts(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setIsSpeakingTts(false);
      }
    } catch (err) {
      console.warn('TTS playback error:', err);
      setIsSpeakingTts(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* SECTION 3 CONTROL HUD: Matches the ASCII blueprint in specification */}
      <div className="bg-[#090b0e] border-2 border-amber-500/60 rounded-xl p-5 shadow-[0_0_30px_rgba(245,158,11,0.12)]">
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-amber-500/30 gap-2">
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-amber-500 animate-pulse" />
            <span className="font-mono text-sm sm:text-base font-extrabold tracking-widest text-amber-400 uppercase">
              THE YARD MATRIX : CONTROL HUD
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
            <span className="font-mono text-xs text-emerald-400 font-bold tracking-wider">
              STATUS: UNFILTERED OPEN-MIC CHANNEL ACTIVE
            </span>
          </div>
        </div>

        {/* Translation Readout Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-4 font-mono">
          <div className="bg-[#12171f] p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider">
              Trauma-To-Track Input Vent:
            </span>
            <div className="text-sm font-bold text-white mt-1 capitalize flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              {translationState.dominantEmotion} State
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Vocal Tension: {(translationState.intensity * 100).toFixed(0)}% Jitter
            </span>
          </div>

          <div className="bg-[#12171f] p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider">
              Mapped Key &amp; Scale:
            </span>
            <div className="text-sm font-bold text-amber-400 mt-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              {translationState.mappedKey}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block truncate">
              {translationState.scale}
            </span>
          </div>

          <div className="bg-[#12171f] p-3 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 block uppercase tracking-wider">
              Vocal Saturation &amp; Retune:
            </span>
            <div className="text-sm font-bold text-red-400 mt-1 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-red-400" />
              +{translationState.tubeRaspDb} dB Tube Rasp
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              Retune: {translationState.autotuneRetuneMs} ms {translationState.autotuneRetuneMs === 0 ? '(0ms Hard Drill)' : '(Vocal Bend)'}
            </span>
          </div>
        </div>

        {/* Street / Counsel Dial */}
        <div className="bg-[#12171f] p-4 rounded-lg border border-amber-500/30">
          <div className="flex items-center justify-between font-mono text-xs mb-2">
            <span className="text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-amber-400" />
              STREET / COUNSEL DIAL:
            </span>
            <span className="text-xs text-slate-300 font-bold">
              {Math.round(dialValue * 100)}% ({dialValue <= 0.4 ? 'Pure Strategic Logic' : dialValue >= 0.7 ? 'Raw Catharsis' : 'Balanced Street Wisdom'})
            </span>
          </div>

          {/* ASCII Dial representation */}
          <div className="relative pt-1 pb-2">
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={dialValue}
              onChange={(e) => handleDialChange(parseFloat(e.target.value))}
              className="w-full accent-amber-500 h-2.5 bg-[#090b0e] rounded-lg cursor-pointer border border-slate-700"
            />
            <div className="flex justify-between font-mono text-[11px] text-slate-400 mt-1.5">
              <span className="text-blue-400 font-semibold">[0% / Pure Strategic Logic]</span>
              <span className="text-slate-500 hidden sm:inline">═══════════ ╦ ══════════</span>
              <span className="text-red-400 font-semibold">[100% / Raw Catharsis]</span>
            </div>
          </div>

          <div className="text-xs font-mono text-slate-400 mt-2 bg-[#090b0e] p-2.5 rounded border border-slate-800">
            {dialValue <= 0.4 ? (
              <span className="text-blue-300">
                <BrainCircuit className="w-3.5 h-3.5 inline mr-1 text-blue-400" />
                <strong>0% Strategic Logic:</strong> Delivering cold, clear-headed operational survival steps, conflict de-escalation, and focus-building strategies.
              </span>
            ) : (
              <span className="text-red-300">
                <Flame className="w-3.5 h-3.5 inline mr-1 text-red-400" />
                <strong>100% Raw Catharsis:</strong> Mirroring raw emotional energy, pushing the creator to lay down uninhibited, pain-drenched vocals directly on the mic.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Preset Vent Triggers */}
      <div className="bg-[#0d1117] border border-[#21262d] rounded-xl p-4">
        <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-2">
          ⚡ Quick Emotional Vent Presets (Instant Trauma Mapping):
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {presetVents.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleAnalyzeVent(p.text)}
              className="text-left p-2.5 rounded-lg bg-[#161b22] hover:bg-[#1f242c] border border-slate-800 hover:border-amber-500/50 transition-all font-mono text-xs group"
            >
              <div className="font-bold text-amber-400 flex items-center justify-between">
                <span>{p.label}</span>
                <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">{p.text}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Unfiltered Street Confessional Log & Vent Input */}
      <div className="bg-[#0d1117] border border-[#21262d] rounded-xl p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Mic className="w-4 h-4 text-red-400" />
            <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
              Unfiltered Street Confessional &amp; OG Counsel
            </h3>
          </div>
          <span className="text-[11px] font-mono text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            Quota-Protected Native Logic Active • Kevin Gates Clarity • 107 Hoover Lore
          </span>
        </div>

        {/* Messages */}
        <div className="h-64 overflow-y-auto space-y-3 py-3 pr-2 my-2 font-mono text-xs">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`p-3 rounded-lg border ${
                m.sender === 'user'
                  ? 'bg-[#161b22] border-slate-700 ml-8 text-slate-200'
                  : 'bg-[#12161f] border-amber-500/40 mr-8 text-slate-200 shadow-[0_0_15px_rgba(245,158,11,0.05)]'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5 text-[10px] text-slate-400">
                <span className="font-bold text-amber-400 uppercase">
                  {m.sender === 'user' ? 'Artist Open-Mic Vent' : 'ASCENSION-plus (107 Hoover OG)'}
                </span>
                <div className="flex items-center gap-2">
                  {m.mappedKey && (
                    <span className="px-1 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                      {m.mappedKey}
                    </span>
                  )}
                  <span>{m.timestamp}</span>
                </div>
              </div>

              <p className="leading-relaxed whitespace-pre-wrap">{m.text}</p>

              {m.sender === 'ascension-plus' && (
                <div className="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => speakCounsel(m.text)}
                    disabled={isSpeakingTts}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-mono text-[11px] transition-colors border border-amber-500/30"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    {isSpeakingTts ? 'Speaking...' : 'Audition OG Voice'}
                  </button>

                  <span className="text-[10px] text-slate-500">
                    Mode: {m.counselType === 'raw-catharsis' ? '100% Catharsis' : 'Strategic Survival'}
                  </span>
                </div>
              )}
            </div>
          ))}

          {isAnalyzing && (
            <div className="p-3 rounded-lg bg-[#12161f] border border-amber-500/30 text-amber-400 font-mono text-xs animate-pulse">
              Translating trauma frequencies... mapping vocal jitter into {translationState.mappedKey}...
            </div>
          )}
        </div>

        {/* Input box */}
        <div className="pt-2 border-t border-slate-800 flex gap-2">
          <input
            type="text"
            value={ventInput}
            onChange={(e) => setVentInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAnalyzeVent()}
            placeholder="Vent unfiltered about paranoia, grief, street pressure, loss, or survival..."
            className="flex-1 bg-[#161b22] border border-slate-700 px-3 py-2 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={() => handleAnalyzeVent()}
            disabled={isAnalyzing || !ventInput.trim()}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-black font-mono font-bold text-xs flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(245,158,11,0.3)]"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">TRANSLATE TO TRACK</span>
          </button>
        </div>
      </div>

      {/* Applied DSP Confirmation Bar */}
      <div className="bg-[#12171f] border border-emerald-500/30 rounded-lg p-3 flex flex-wrap items-center justify-between gap-2 font-mono text-xs">
        <div className="flex items-center gap-2 text-emerald-400">
          <CheckCircle2 className="w-4 h-4" />
          <span>
            DSP Core automatically synced to <strong>{translationState.mappedKey}</strong> with{' '}
            <strong>+{translationState.tubeRaspDb} dB Tube Rasp</strong> and{' '}
            <strong>{translationState.autotuneRetuneMs}ms Retune Speed</strong>.
          </span>
        </div>
        <button
          onClick={() => {
            dsp.applyTraumaParameters(
              translationState.mappedKey,
              translationState.tubeRaspDb,
              translationState.autotuneRetuneMs
            );
            onTraumaApplied(translationState);
          }}
          className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold"
        >
          RE-SYNC HOLLYWOOD DSP
        </button>
      </div>
    </div>
  );
}
