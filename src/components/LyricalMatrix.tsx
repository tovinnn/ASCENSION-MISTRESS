import { useState } from 'react';
import {
  Sparkles,
  Play,
  Copy,
  Check,
  Flame,
  Volume2,
  BookOpen,
  Mic2,
  Share2,
} from 'lucide-react';
import { GhostwriteResult } from '../types/ascension';
import { getAscensionDspEngine } from '../audio/dspEngine';

interface LyricalMatrixProps {
  activeKey: string;
}

export function LyricalMatrix({ activeKey }: LyricalMatrixProps) {
  const dsp = getAscensionDspEngine();

  const [topic, setTopic] = useState('Institutional Survival & Cold Faders');
  const [flowStyle, setFlowStyle] = useState('Wayne-Tier Metaphor Matrix');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  // Active Ghostwrite Bar Matrix
  const [lyricsData, setLyricsData] = useState<GhostwriteResult>({
    title: 'Cold Faders & Consecrated Dirt',
    genrePocket: 'Southern Trap Blues / Gospel Master',
    bpm: 136,
    key: activeKey || 'Eb Minor',
    flowStyle: 'Wayne-Tier Metaphor Matrix',
    bars: [
      {
        line: 'Real Gs move in silent frequency like ultrasonic tape',
        syllableCount: 16,
        rhymeScheme: 'A',
        metaphorBreakdown: "Wordplay on Lil Wayne classic 'lasagna' extended to analog studio tape saturation.",
        deliveryCue: "Aggressive pocket, rasp on 'tape'",
        vocalTone: 'Chest Voice Grit',
      },
      {
        line: 'Cell block concrete cold, but the 808s shape my escape',
        syllableCount: 15,
        rhymeScheme: 'A',
        metaphorBreakdown: 'Penitentiary concrete juxtaposition with audio waveform sculpting.',
        deliveryCue: 'Behind the beat, dynamic chest push',
        vocalTone: 'Rod Wave Emotional Rasp',
      },
      {
        line: 'They put my brother under dirt, I put his name across the board',
        syllableCount: 16,
        rhymeScheme: 'B',
        metaphorBreakdown: 'Dual meaning: Mixing console faders / Billboard charting legacy.',
        deliveryCue: 'Vocal crack, heavy grief emotion',
        vocalTone: 'Southern Gospel Swell',
      },
      {
        line: 'Every scar a gold fader, every tear an uncompressed chord',
        syllableCount: 16,
        rhymeScheme: 'B',
        metaphorBreakdown: 'Physical trauma converted directly into studio mastering hardware.',
        deliveryCue: "Gospel blues run on 'chord'",
        vocalTone: 'Micro-Tonal Bends',
      },
      {
        line: 'Feds looking for paper trails, we printing frequency charts',
        syllableCount: 15,
        rhymeScheme: 'C',
        metaphorBreakdown: 'Financial subpoena audit flipped into DAW EQ frequency analyzers.',
        deliveryCue: 'Wayne smirk, rapid multi-syllabic bounce',
        vocalTone: 'High-IQ Street Intellect',
      },
      {
        line: 'Iron gates locked the body up, but never quarantined the art',
        syllableCount: 16,
        rhymeScheme: 'C',
        metaphorBreakdown: 'Solitary confinement contrasted against unbounded creative synthesis.',
        deliveryCue: 'Deep resonant chest projection',
        vocalTone: 'Kevin Gates Penitentiary Truth',
      },
    ],
    vocalHook: [
      'Lord, wipe the static off my frequency tonight (Oh Lord!)',
      'We survived the cage, now we walking in the master light',
      'Turn my heavy tears to gold on the mixing board',
      "Ain't no prison made by man could silence what is consecrated, Lord",
    ],
    philosophicalNote:
      "Vocal pocket syncopated at 136 BPM in Eb Minor. Lil Wayne multi-syllabic cadence locks the verse, while Rod Wave gospel choir chords resolve the trauma in the hook.",
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('/api/ghostwrite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic,
          key: activeKey,
          bpm: dsp.getBpm(),
          flowStyle,
          barsCount: 6,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setLyricsData(data);
      }
    } catch (err) {
      console.warn('Ghostwrite request fallback:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAuditionInDaw = async () => {
    await dsp.initContext();
    // Play DAW playback so the user hears the track
    if (!dsp.getPlaybackState()) {
      await dsp.togglePlayback();
    }
  };

  const copyToClipboard = () => {
    const text = `=== ${lyricsData.title} ===
Key: ${lyricsData.key} | BPM: ${lyricsData.bpm}
Flow: ${lyricsData.flowStyle}

[VERSE]
${lyricsData.bars.map((b) => `${b.line}  (${b.syllableCount} syl)`).join('\n')}

[VOCAL HOOK - GOSPEL / ROD WAVE]
${lyricsData.vocalHook.join('\n')}

Note: ${lyricsData.philosophicalNote}
`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Top Banner: Lyrical Metaphor Matrix */}
      <div className="bg-[#090b0e] border border-amber-500/40 rounded-xl p-4 shadow-[0_0_20px_rgba(245,158,11,0.08)]">
        <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500" />
            <h2 className="font-mono text-sm sm:text-base font-extrabold uppercase tracking-wider text-slate-100">
              LYRICAL METAPHOR MATRIX &amp; VOCAL ENGINE
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30">
              Lil Wayne Metaphor Tier
            </span>
            <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/30 hidden sm:inline">
              Rod Wave Soul Resonance
            </span>
          </div>
        </div>

        {/* Generator Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-3 font-mono text-xs">
          <div>
            <label className="text-slate-400 block mb-1">Theme / Street Vent:</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Paranoia, Loss, Structural Struggle"
              className="w-full bg-[#161b22] border border-slate-700 px-3 py-1.5 rounded text-slate-200 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Persona DNA Style:</label>
            <select
              value={flowStyle}
              onChange={(e) => setFlowStyle(e.target.value)}
              className="w-full bg-[#161b22] border border-slate-700 px-3 py-1.5 rounded text-amber-300 focus:outline-none focus:border-amber-500"
            >
              <option value="Wayne-Tier Metaphor Matrix">Lil Wayne High-IQ Punchlines &amp; Double Entendres</option>
              <option value="Kevin-Gates-Clarity">Kevin Gates Concrete Psychology &amp; Penitentiary Lore</option>
              <option value="Rod-Wave-Soul-Gospel">Rod Wave Soul Resonance &amp; Southern Gospel Vocal Riffs</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="flex-1 py-1.5 px-4 rounded bg-amber-500 hover:bg-amber-400 text-black font-bold flex items-center justify-center gap-1.5 transition-all shadow-[0_0_12px_rgba(245,158,11,0.3)] disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {isGenerating ? 'Synthesizing...' : 'GENERATE BARS'}
            </button>
            <button
              onClick={handleAuditionInDaw}
              className="py-1.5 px-3 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1 transition-all"
              title="Play live track with vocal guide in DAW"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Audition
            </button>
          </div>
        </div>
      </div>

      {/* Generated Verse & Multi-syllabic Breakdown */}
      <div className="bg-[#0d1117] border border-[#21262d] rounded-xl p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-mono font-black text-amber-400">
              "{lyricsData.title}"
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              Pocket: {lyricsData.genrePocket} • Key: {lyricsData.key} • {lyricsData.bpm} BPM
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#161b22] hover:bg-[#1f242c] text-slate-300 font-mono text-xs border border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'COPIED' : 'COPY'}
            </button>
          </div>
        </div>

        {/* Quota Protected Status Pill */}
        <div className="my-3 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 flex flex-wrap items-center justify-between text-[11px] font-mono text-amber-300">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <strong className="text-white">ASCENSION Metaphor Matrix:</strong>
            <span>Active &amp; Bypasses Cloud Quota Limits</span>
          </div>
          <span className="text-slate-400 text-[10px]">
            {lyricsData.philosophicalNote}
          </span>
        </div>

        {/* Bars Breakdown */}
        <div className="space-y-3 my-4 font-mono">
          {lyricsData.bars.map((bar, idx) => (
            <div
              key={idx}
              className="p-3 rounded-lg bg-[#12161f] border border-slate-800 hover:border-amber-500/40 transition-colors group"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500 font-bold">BAR {idx + 1 < 10 ? `0${idx + 1}` : idx + 1}</span>
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold">
                    Rhyme {bar.rhymeScheme}
                  </span>
                  <span className="text-slate-400">{bar.syllableCount} Syllables</span>
                </div>
                {bar.vocalTone && (
                  <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px]">
                    {bar.vocalTone}
                  </span>
                )}
              </div>

              {/* The Lyric Line */}
              <p className="text-sm sm:text-base font-bold text-white tracking-wide">
                "{bar.line}"
              </p>

              {/* High-IQ Metaphor Annotation & Delivery Cue */}
              <div className="mt-2 pt-2 border-t border-slate-800/80 grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                {bar.metaphorBreakdown && (
                  <div className="text-amber-300/90 flex items-start gap-1">
                    <BookOpen className="w-3 h-3 text-amber-400 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-amber-400">Metaphor Logic:</strong> {bar.metaphorBreakdown}
                    </span>
                  </div>
                )}
                {bar.deliveryCue && (
                  <div className="text-slate-400 flex items-start gap-1">
                    <Mic2 className="w-3 h-3 text-red-400 mt-0.5 flex-shrink-0" />
                    <span>
                      <strong className="text-slate-300">Delivery Pocket:</strong> {bar.deliveryCue}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Featured Vocalist: Gospel / Soul Hook Section */}
        <div className="bg-[#12171f] border border-purple-500/30 rounded-xl p-4 mt-4 font-mono">
          <div className="flex items-center justify-between pb-2 border-b border-purple-500/30">
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-purple-400" />
              FEATURED VOCALIST HOOK (GOSPEL / ROD WAVE SOUL)
            </span>
            <span className="text-[10px] text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded">
              Multi-Octave Chest &amp; Head Voice
            </span>
          </div>

          <div className="space-y-1.5 my-3">
            {lyricsData.vocalHook.map((line, i) => (
              <p key={i} className="text-sm font-semibold text-slate-200 italic pl-3 border-l-2 border-purple-500">
                "{line}"
              </p>
            ))}
          </div>

          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800">
            <strong>Co-Producer Insight:</strong> {lyricsData.philosophicalNote}
          </div>
        </div>
      </div>
    </div>
  );
}
