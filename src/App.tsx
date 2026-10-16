/**
 * ASCENSION-plus: Complete System Architecture & Persona Blueprint
 * Native Virtual Co-Producer, Featured Vocalist, Ghostwriter, and FX Plugin
 * Enhanced with 10 Core Persona Visual Scenes, Menu Images, Dynamic Backgrounds,
 * and Auto-Protected Local DSP/Metaphor Engine (Bypasses Quota Limits).
 */

import { useState, useEffect } from 'react';
import { HeaderNav } from './components/HeaderNav';
import { AudioVisualizer } from './components/AudioVisualizer';
import { YardMatrixHud } from './components/YardMatrixHud';
import { HollywoodDspRack } from './components/HollywoodDspRack';
import { LyricalMatrix } from './components/LyricalMatrix';
import { DawStemsMatrix } from './components/DawStemsMatrix';
import { PersonaBlueprintModal } from './components/PersonaBlueprintModal';
import { PersonaVisualGallery } from './components/PersonaVisualGallery';
import { TraumaAnalysisResult } from './types/ascension';
import { getAscensionDspEngine } from './audio/dspEngine';
import { ASCENSION_SCENES, PersonaScene } from './data/ascensionVisuals';
import {
  loadAllCustomImages,
  saveCustomImage,
  getSceneDisplayUrl,
  getSceneDataUri,
} from './utils/imageStore';
import {
  Sparkles,
  Layers,
  Image as ImageIcon,
  Sliders,
  Play,
  RotateCw,
  Eye,
  ShieldCheck,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'yard' | 'dsp' | 'ghostwriter' | 'stems' | 'blueprint'>('yard');
  const [activeKey, setActiveKey] = useState<string>('Eb Minor');
  const [activeScene, setActiveScene] = useState<PersonaScene>(ASCENSION_SCENES[1]); // Default: 107 Hoover OG (IMG_0577)
  const [customImages, setCustomImages] = useState<Record<string, string>>({});
  const [isVisualGalleryOpen, setIsVisualGalleryOpen] = useState(false);

  // Background Customization Controls
  const [bgOpacity, setBgOpacity] = useState<number>(24);
  const [bgBlur, setBgBlur] = useState<number>(3);
  const [autoCycleBg, setAutoCycleBg] = useState<boolean>(false);
  const [isBgControlsOpen, setIsBgControlsOpen] = useState<boolean>(false);

  const dsp = getAscensionDspEngine();

  useEffect(() => {
    // Check for autostart query parameter (Ultra mode requirement)
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      dsp.initContext();
    }

    // Load any persisted custom uploaded images
    loadAllCustomImages().then((imgs) => {
      setCustomImages(imgs);
    });
  }, [dsp]);

  // Auto-Cycle Background Slideshow (cycles through the 10 ASCENSION scenes)
  useEffect(() => {
    if (!autoCycleBg) return;

    const interval = setInterval(() => {
      setActiveScene((current) => {
        const currentIndex = ASCENSION_SCENES.findIndex((s) => s.id === current.id);
        const nextIndex = (currentIndex + 1) % ASCENSION_SCENES.length;
        const nextScene = ASCENSION_SCENES[nextIndex];
        setActiveKey(nextScene.traumaKey);
        dsp.setKey(nextScene.traumaKey);
        return nextScene;
      });
    }, 15000); // 15 seconds per background

    return () => clearInterval(interval);
  }, [autoCycleBg, dsp]);

  const handleTraumaApplied = (result: TraumaAnalysisResult) => {
    setActiveKey(result.mappedKey);
    dsp.setKey(result.mappedKey);

    // Contextually suggest or auto-sync corresponding scene
    if (result.dominantEmotion === 'grief') {
      const griefScene = ASCENSION_SCENES.find((s) => s.id === 'scene-0585-studio') || ASCENSION_SCENES[0];
      setActiveScene(griefScene);
    } else if (result.dominantEmotion === 'aggression') {
      const aggScene = ASCENSION_SCENES.find((s) => s.id === 'scene-0577-hoover') || ASCENSION_SCENES[1];
      setActiveScene(aggScene);
    } else if (result.dominantEmotion === 'paranoia') {
      const paranoiaScene = ASCENSION_SCENES.find((s) => s.id === 'scene-0566-winter-puffer') || ASCENSION_SCENES[7];
      setActiveScene(paranoiaScene);
    } else if (result.dominantEmotion === 'redemption') {
      const redScene = ASCENSION_SCENES.find((s) => s.id === 'scene-0590-fireworks') || ASCENSION_SCENES[5];
      setActiveScene(redScene);
    }
  };

  const handleSelectScene = (scene: PersonaScene) => {
    setActiveScene(scene);
    setActiveKey(scene.traumaKey);
    dsp.setKey(scene.traumaKey);
  };

  const handleImageUploaded = (sceneId: string, url: string) => {
    setCustomImages((prev) => ({ ...prev, [sceneId]: url }));
    saveCustomImage(sceneId, url);
  };

  const bgDisplayUrl = getSceneDisplayUrl(activeScene, customImages);
  const bgFallbackDataUri = getSceneDataUri(activeScene);

  return (
    <div className="min-h-screen bg-[#090b0e] text-slate-100 flex flex-col font-sans selection:bg-amber-500/30 selection:text-amber-200 relative overflow-x-hidden">
      {/* Full-bleed Dynamic Persona Background Layer */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src={bgDisplayUrl}
          alt={activeScene.title}
          onError={(e) => {
            e.currentTarget.src = bgFallbackDataUri;
          }}
          style={{
            opacity: bgOpacity / 100,
            filter: `blur(${bgBlur}px)`,
          }}
          className="w-full h-full object-cover scale-105 transition-all duration-700"
        />

        {/* Cinematic Vignette & Ambient Color Wash */}
        <div
          className={`absolute inset-0 bg-gradient-to-b ${activeScene.bgGradient} mix-blend-multiply opacity-85`}
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-transparent via-[#090b0e]/70 to-[#090b0e]" />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header and Transport Controls with Menu Images */}
        <HeaderNav
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          activeKey={activeKey}
          activeScene={activeScene}
          onSelectScene={handleSelectScene}
          onOpenVisuals={() => setIsVisualGalleryOpen(true)}
          customImages={customImages}
          isQuotaProtected={true}
        />

        {/* Main Studio Viewport */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-4">
          {/* Transient / Pocket Scanner Visualizer (Always visible in DAW Studio) */}
          <section aria-label="Audio Visualizer">
            <AudioVisualizer />
          </section>

          {/* Background Wallpaper & Atmosphere HUD Controller */}
          <div className="bg-[#0d1117]/90 backdrop-blur-md border border-[#21262d] rounded-xl px-4 py-2 flex flex-wrap items-center justify-between gap-3 font-mono text-xs shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-amber-500/50 bg-black flex-shrink-0">
                <img
                  src={bgDisplayUrl}
                  alt={activeScene.title}
                  onError={(e) => {
                    e.currentTarget.src = bgFallbackDataUri;
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[10px]">CURRENT BACKGROUND:</span>
                  <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                    {activeScene.originalFilename}
                  </span>
                </div>
                <div className="text-slate-200 text-[11px] font-bold truncate max-w-[280px]">
                  {activeScene.title}
                </div>
              </div>
            </div>

            {/* Quick Controls */}
            <div className="flex items-center gap-4 flex-wrap">
              {/* Opacity Slider */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400">BG OPACITY:</span>
                <input
                  type="range"
                  min="5"
                  max="60"
                  value={bgOpacity}
                  onChange={(e) => setBgOpacity(Number(e.target.value))}
                  className="w-16 accent-amber-500 h-1.5 bg-slate-800 rounded cursor-pointer"
                />
                <span className="text-[10px] text-amber-400 w-6 font-bold">{bgOpacity}%</span>
              </div>

              {/* Blur Slider */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] text-slate-400">BLUR:</span>
                <input
                  type="range"
                  min="0"
                  max="16"
                  value={bgBlur}
                  onChange={(e) => setBgBlur(Number(e.target.value))}
                  className="w-14 accent-amber-500 h-1.5 bg-slate-800 rounded cursor-pointer"
                />
                <span className="text-[10px] text-amber-400 w-6 font-bold">{bgBlur}px</span>
              </div>

              {/* Auto Cycle Slideshow Toggle */}
              <button
                onClick={() => setAutoCycleBg(!autoCycleBg)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-bold border transition-all ${
                  autoCycleBg
                    ? 'bg-amber-500 text-black border-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                    : 'bg-[#161b22] text-slate-400 border-slate-700 hover:text-white'
                }`}
                title="Automatically cycle through all 10 ASCENSION background scenes every 15s"
              >
                <RotateCw className={`w-3 h-3 ${autoCycleBg ? 'animate-spin' : ''}`} />
                <span>SLIDESHOW {autoCycleBg ? 'ON' : 'OFF'}</span>
              </button>

              {/* Full Gallery Button */}
              <button
                onClick={() => setIsVisualGalleryOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold transition-all"
              >
                <ImageIcon className="w-3 h-3 text-amber-400" />
                <span>GALLERY &amp; UPLOAD</span>
              </button>
            </div>
          </div>

          {/* Dynamic Studio Modules */}
          <div className="transition-all duration-200">
            {activeTab === 'yard' && (
              <section aria-label="The Yard Matrix Control HUD">
                <YardMatrixHud onTraumaApplied={handleTraumaApplied} activeKey={activeKey} />
              </section>
            )}

            {activeTab === 'dsp' && (
              <section aria-label="Hollywood Studio DSP Master Chain">
                <HollywoodDspRack activeKey={activeKey} />
              </section>
            )}

            {activeTab === 'ghostwriter' && (
              <section aria-label="Lyrical Metaphor Matrix">
                <LyricalMatrix activeKey={activeKey} />
              </section>
            )}

            {activeTab === 'stems' && (
              <section aria-label="DAW Stems & Bus Routing">
                <DawStemsMatrix />
              </section>
            )}

            {activeTab === 'blueprint' && (
              <section aria-label="System Topology & Blueprint">
                <PersonaBlueprintModal />
              </section>
            )}
          </div>
        </main>

        {/* Quick Persona Background Carousel Strip at Bottom */}
        <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 pb-2">
          <div className="bg-[#0d1117]/80 backdrop-blur-md border border-slate-800/80 rounded-xl p-2.5 flex items-center justify-between gap-3 overflow-x-auto font-mono text-[11px]">
            <div className="flex items-center gap-2 flex-shrink-0 text-slate-400">
              <ImageIcon className="w-3.5 h-3.5 text-amber-500" />
              <span className="font-bold text-slate-300">10 ASCENSION SCENES:</span>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {ASCENSION_SCENES.map((scene) => {
                const isSelected = activeScene.id === scene.id;
                const thumbUrl = getSceneDisplayUrl(scene, customImages);
                const fallbackUri = getSceneDataUri(scene);

                return (
                  <button
                    key={scene.id}
                    onClick={() => handleSelectScene(scene)}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg border flex-shrink-0 transition-all ${
                      isSelected
                        ? 'bg-amber-500 text-black font-bold border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.35)]'
                        : 'bg-[#161b22] text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <div className="w-5 h-5 rounded-md overflow-hidden bg-black flex-shrink-0 border border-slate-700">
                      <img
                        src={thumbUrl}
                        alt={scene.title}
                        onError={(e) => {
                          e.currentTarget.src = fallbackUri;
                        }}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="truncate max-w-[130px]">{scene.originalFilename}</span>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setIsVisualGalleryOpen(true)}
              className="px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold flex-shrink-0"
            >
              ALL 10 SCENES
            </button>
          </div>
        </div>

        {/* Studio Daemon Footer */}
        <footer className="border-t border-[#1b2129] bg-[#090b0e]/95 backdrop-blur-md px-4 py-3 text-[11px] font-mono text-slate-500 flex flex-wrap items-center justify-between gap-2 mt-auto">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            <span>ASCENSION-plus Core Daemon</span>
            <span>•</span>
            <span className="text-amber-400 font-semibold">{activeScene.title}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-amber-400 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Quota-Protected Local Matrix Engine Active
            </span>
            <span>•</span>
            <span>Key: {activeKey}</span>
            <span>•</span>
            <span>Target: iOS / Android / macOS / Win</span>
          </div>
        </footer>
      </div>

      {/* Persona Visual Gallery Modal */}
      <PersonaVisualGallery
        isOpen={isVisualGalleryOpen}
        onClose={() => setIsVisualGalleryOpen(false)}
        activeScene={activeScene}
        onSelectScene={handleSelectScene}
        customImages={customImages}
        onImageUploaded={handleImageUploaded}
      />
    </div>
  );
}
