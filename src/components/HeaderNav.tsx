import { useState, useEffect } from 'react';
import {
  Play,
  Square,
  Power,
  Volume2,
  VolumeX,
  Sliders,
  Sparkles,
  Layers,
  FileCode2,
  Radio,
  Cpu,
  Mic,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Check,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { ASCENSION_SCENES, PersonaScene } from '../data/ascensionVisuals';
import { getSceneDisplayUrl } from '../utils/imageStore';
import { getAscensionDspEngine } from '../audio/dspEngine';

interface HeaderNavProps {
  activeTab: 'yard' | 'dsp' | 'ghostwriter' | 'stems' | 'blueprint';
  setActiveTab: (tab: 'yard' | 'dsp' | 'ghostwriter' | 'stems' | 'blueprint') => void;
  activeKey: string;
  activeScene: PersonaScene;
  onSelectScene: (scene: PersonaScene) => void;
  onOpenVisuals: () => void;
  customImages: Record<string, string>;
  isQuotaProtected?: boolean;
}

export function HeaderNav({
  activeTab,
  setActiveTab,
  activeKey,
  activeScene,
  onSelectScene,
  onOpenVisuals,
  customImages,
  isQuotaProtected = true,
}: HeaderNavProps) {
  const [isAudioRunning, setIsAudioRunning] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMicOn, setIsMicOn] = useState(false);
  const [masterVol, setMasterVol] = useState(85);
  const [isMuted, setIsMuted] = useState(false);
  const [bpm, setBpm] = useState(136);
  const [isMenuDrawerOpen, setIsMenuDrawerOpen] = useState(false);

  const dsp = getAscensionDspEngine();

  useEffect(() => {
    setIsPlaying(dsp.getPlaybackState());
    setIsMicOn(dsp.getMicState());
  }, [dsp]);

  const toggleAudioEngine = async () => {
    const ok = await dsp.initContext();
    setIsAudioRunning(ok);
  };

  const togglePlayback = async () => {
    const playing = await dsp.togglePlayback();
    setIsPlaying(playing);
    if (playing) setIsAudioRunning(true);
  };

  const toggleMic = async () => {
    const micActive = await dsp.toggleMicrophone();
    setIsMicOn(micActive);
    if (micActive) setIsAudioRunning(true);
  };

  const handleMasterVolChange = (val: number) => {
    setMasterVol(val);
    dsp.setMasterVolume(isMuted ? 0 : val / 100);
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    dsp.setMasterVolume(nextMute ? 0 : masterVol / 100);
  };

  const handleBpmChange = (newBpm: number) => {
    setBpm(newBpm);
    dsp.setBpm(newBpm);
  };

  // Dedicated scene images mapped to menu tabs
  const yardScene = ASCENSION_SCENES.find((s) => s.id === 'scene-0577-hoover') || ASCENSION_SCENES[1];
  const dspScene = ASCENSION_SCENES.find((s) => s.id === 'scene-0553-yellow-bomber') || ASCENSION_SCENES[3];
  const ghostwriterScene = ASCENSION_SCENES.find((s) => s.id === 'scene-0585-studio') || ASCENSION_SCENES[0];
  const stemsScene = ASCENSION_SCENES.find((s) => s.id === 'scene-0520-denim-hero') || ASCENSION_SCENES[9];
  const blueprintScene = ASCENSION_SCENES.find((s) => s.id === 'scene-0582-private-jet') || ASCENSION_SCENES[4];

  return (
    <header className="border-b border-[#21262d] bg-[#0d1117]/95 backdrop-blur-md sticky top-0 z-40">
      {/* Top Status Strip */}
      <div className="px-4 py-1.5 bg-[#090b0e] border-b border-[#1b2129] flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 gap-2">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="font-bold text-slate-200">ASCENSION_PLUS_CORE</span>
            <span className="text-amber-500 font-semibold">v2.0.0-PROD</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-slate-400 hidden sm:inline">{activeScene.title}</span>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-emerald-400 flex items-center gap-1">
            <Cpu className="w-3 h-3" />
            Daemon Active
          </span>
          <span className="text-slate-600 hidden md:inline">|</span>
          <span className="text-amber-400/90 flex items-center gap-1 text-[10px] bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
            <ShieldCheck className="w-3 h-3 text-amber-400" />
            Quota Protected: Native DSP Engine Active
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick toggle for all 10 ASCENSION Menu & Background Images */}
          <button
            onClick={() => setIsMenuDrawerOpen(!isMenuDrawerOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 transition-all font-bold text-[11px]"
            title="Open ASCENSION Menu Images & Backgrounds Tray"
          >
            <ImageIcon className="w-3.5 h-3.5 text-amber-400" />
            <span>MENU &amp; BG IMAGES (10)</span>
            {isMenuDrawerOpen ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          <span className="text-slate-500 hidden lg:inline">DSP: 48kHz / 24-Bit Float</span>
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400">POCKET KEY:</span>
            <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400 font-bold">
              {activeKey}
            </span>
          </div>
        </div>
      </div>

      {/* 10 ASCENSION Images Quick Tray / Drawer */}
      {isMenuDrawerOpen && (
        <div className="bg-[#090b0e] border-b border-amber-500/30 px-4 py-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                ASCENSION Persona Menu Images &amp; Background Wallpapers
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                (Click any image to set active background &amp; sonic key)
              </span>
            </div>
            <button
              onClick={onOpenVisuals}
              className="text-[11px] font-mono text-amber-400 hover:text-amber-300 underline font-bold flex items-center gap-1"
            >
              <span>Full Visuals Gallery &amp; Uploader &rarr;</span>
            </button>
          </div>

          {/* Horizontal scrollable image strip */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
            {ASCENSION_SCENES.map((scene) => {
              const isCurrent = activeScene.id === scene.id;
              const displayUrl = getSceneDisplayUrl(scene, customImages);

              return (
                <button
                  key={scene.id}
                  onClick={() => onSelectScene(scene)}
                  className={`flex-shrink-0 group relative rounded-lg overflow-hidden border transition-all text-left w-36 bg-[#161b22] ${
                    isCurrent
                      ? 'border-amber-400 ring-2 ring-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                      : 'border-slate-800 hover:border-slate-600'
                  }`}
                  title={`${scene.title} (${scene.originalFilename})`}
                >
                  <div className="aspect-video w-full bg-black relative overflow-hidden">
                    <img
                      src={displayUrl}
                      alt={scene.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-1 left-1 px-1 py-0.5 rounded bg-black/80 text-[9px] font-mono text-amber-400 border border-amber-500/30">
                      {scene.originalFilename}
                    </div>
                    {isCurrent && (
                      <div className="absolute top-1 right-1 p-0.5 rounded-full bg-emerald-500 text-black">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <div className="p-1.5 font-mono">
                    <div className="text-[10px] font-bold text-slate-200 truncate group-hover:text-amber-400">
                      {scene.title.split('•')[0]}
                    </div>
                    <div className="text-[9px] text-amber-500/90 flex items-center justify-between mt-0.5">
                      <span>{scene.traumaKey}</span>
                      <span className="text-[8px] text-slate-400 uppercase">{scene.category}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Bar */}
      <div className="px-4 py-2.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand / Logo + Persona Avatar */}
        <div className="flex items-center gap-3">
          {/* Clickable Persona Avatar with Diamond Glow */}
          <button
            onClick={onOpenVisuals}
            className="relative group rounded-xl overflow-hidden border-2 border-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-transform hover:scale-105 w-11 h-11 bg-black flex-shrink-0"
            title="Click to view & change ASCENSION persona images & backgrounds"
          >
            <img
              src={getSceneDisplayUrl(activeScene, customImages)}
              alt={activeScene.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-amber-500/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
          </button>

          <button
            onClick={toggleAudioEngine}
            className={`p-2 rounded-lg border flex items-center justify-center transition-all ${
              isAudioRunning
                ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.4)]'
                : 'bg-[#161b22] text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title={isAudioRunning ? 'DSP Engine Online' : 'Click to initialize Web Audio Engine'}
          >
            <Power className="w-4 h-4" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-black tracking-wider uppercase text-white font-mono">
                ASCENSION<span className="text-amber-500">+</span>
              </h1>
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">
                {activeScene.category}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono truncate max-w-[280px]">
              {activeScene.title}
            </p>
          </div>
        </div>

        {/* Transport Controls (DAW Sequencer) */}
        <div className="flex items-center gap-2 bg-[#161b22] px-3 py-1.5 rounded-lg border border-[#30363d]">
          <button
            onClick={togglePlayback}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono font-bold rounded transition-all ${
              isPlaying
                ? 'bg-red-500 text-white shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            {isPlaying ? (
              <>
                <Square className="w-3.5 h-3.5 fill-current" />
                STOP
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                AUDITION DAW
              </>
            )}
          </button>

          <button
            onClick={toggleMic}
            className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-mono rounded border transition-all ${
              isMicOn
                ? 'bg-red-500/20 text-red-400 border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)] animate-pulse'
                : 'bg-[#0d1117] text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
            title="Toggle Live Microphone Input"
          >
            <Mic className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{isMicOn ? 'MIC LIVE' : 'MIC OFF'}</span>
          </button>

          <div className="h-5 w-[1px] bg-slate-700 mx-1" />

          {/* BPM selector */}
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300">
            <span className="text-slate-500">BPM:</span>
            <input
              type="number"
              min="60"
              max="180"
              value={bpm}
              onChange={(e) => handleBpmChange(Number(e.target.value))}
              className="w-14 bg-[#0d1117] border border-slate-700 px-1.5 py-0.5 rounded text-amber-400 font-bold text-center focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="h-5 w-[1px] bg-slate-700 mx-1" />

          {/* Master Volume */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <button
              onClick={toggleMute}
              className="text-slate-400 hover:text-slate-200 transition-colors"
              title={isMuted ? 'Unmute' : 'Mute Master'}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={isMuted ? 0 : masterVol}
              onChange={(e) => handleMasterVolChange(Number(e.target.value))}
              className="w-16 accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <span className="w-7 text-[10px] text-slate-400">{isMuted ? '0%' : `${masterVol}%`}</span>
          </div>
        </div>

        {/* View Navigation Tabs with ASCENSION Menu Images */}
        <nav className="flex items-center gap-1 bg-[#161b22] p-1 rounded-lg border border-[#30363d] overflow-x-auto max-w-full">
          {/* Tab 1: The Yard Matrix */}
          <button
            onClick={() => setActiveTab('yard')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono font-medium transition-all group ${
              activeTab === 'yard'
                ? 'bg-amber-500 text-black font-bold shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <div className="w-5 h-5 rounded overflow-hidden border border-amber-500/40 flex-shrink-0 bg-black">
              <img
                src={getSceneDisplayUrl(yardScene, customImages)}
                alt="Yard"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center gap-1">
              <Radio className="w-3.5 h-3.5" />
              <span>The Yard Matrix</span>
            </div>
          </button>

          {/* Tab 2: Hollywood DSP */}
          <button
            onClick={() => setActiveTab('dsp')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono font-medium transition-all group ${
              activeTab === 'dsp'
                ? 'bg-amber-500 text-black font-bold shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <div className="w-5 h-5 rounded overflow-hidden border border-amber-500/40 flex-shrink-0 bg-black">
              <img
                src={getSceneDisplayUrl(dspScene, customImages)}
                alt="DSP"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center gap-1">
              <Sliders className="w-3.5 h-3.5" />
              <span>Hollywood DSP</span>
            </div>
          </button>

          {/* Tab 3: Ghostwriter Matrix */}
          <button
            onClick={() => setActiveTab('ghostwriter')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono font-medium transition-all group ${
              activeTab === 'ghostwriter'
                ? 'bg-amber-500 text-black font-bold shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <div className="w-5 h-5 rounded overflow-hidden border border-amber-500/40 flex-shrink-0 bg-black">
              <img
                src={getSceneDisplayUrl(ghostwriterScene, customImages)}
                alt="Ghostwriter"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ghostwriter Matrix</span>
            </div>
          </button>

          {/* Tab 4: DAW Stems */}
          <button
            onClick={() => setActiveTab('stems')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono font-medium transition-all group ${
              activeTab === 'stems'
                ? 'bg-amber-500 text-black font-bold shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <div className="w-5 h-5 rounded overflow-hidden border border-amber-500/40 flex-shrink-0 bg-black">
              <img
                src={getSceneDisplayUrl(stemsScene, customImages)}
                alt="Stems"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              <span>DAW Stems</span>
            </div>
          </button>

          {/* Tab 5: Blueprint */}
          <button
            onClick={() => setActiveTab('blueprint')}
            className={`flex items-center gap-2 px-2.5 py-1.5 rounded text-xs font-mono font-medium transition-all group ${
              activeTab === 'blueprint'
                ? 'bg-amber-500 text-black font-bold shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            <div className="w-5 h-5 rounded overflow-hidden border border-amber-500/40 flex-shrink-0 bg-black">
              <img
                src={getSceneDisplayUrl(blueprintScene, customImages)}
                alt="Blueprint"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center gap-1">
              <FileCode2 className="w-3.5 h-3.5" />
              <span>Blueprint</span>
            </div>
          </button>
        </nav>
      </div>
    </header>
  );
}
