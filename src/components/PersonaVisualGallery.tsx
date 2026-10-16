import { useState, useRef } from 'react';
import {
  Image as ImageIcon,
  Check,
  Upload,
  Sparkles,
  Layers,
  Flame,
  Radio,
  Sliders,
  Maximize2,
  X,
} from 'lucide-react';
import { ASCENSION_SCENES, PersonaScene } from '../data/ascensionVisuals';
import { getSceneSvgArtwork, getSceneDisplayUrl, getSceneDataUri } from '../utils/imageStore';

interface PersonaVisualGalleryProps {
  activeScene: PersonaScene;
  onSelectScene: (scene: PersonaScene) => void;
  customImages: Record<string, string>;
  onImageUploaded: (sceneId: string, url: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function PersonaVisualGallery({
  activeScene,
  onSelectScene,
  customImages,
  onImageUploaded,
  isOpen,
  onClose,
}: PersonaVisualGalleryProps) {
  const [filter, setFilter] = useState<string>('All');
  const [expandedScene, setExpandedScene] = useState<PersonaScene | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [targetSceneForUpload, setTargetSceneForUpload] = useState<string | null>(null);

  if (!isOpen) return null;

  const categories = ['All', '107 Hoover OG', 'Studio', 'Hollywood Master', 'Street Confessional', 'Elevation', 'Victory'];

  const filteredScenes = filter === 'All'
    ? ASCENSION_SCENES
    : ASCENSION_SCENES.filter((s) => s.category === filter);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadStatus('Saving uploaded images...');

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      await new Promise<void>((resolve) => {
        reader.onload = async () => {
          const base64 = reader.result as string;

          // Find matching scene by filename or target
          let matchedScene = ASCENSION_SCENES.find(
            (s) => s.originalFilename.toLowerCase() === file.name.toLowerCase()
          );

          if (!matchedScene && targetSceneForUpload) {
            matchedScene = ASCENSION_SCENES.find((s) => s.id === targetSceneForUpload);
          }

          if (matchedScene) {
            onImageUploaded(matchedScene.id, base64);

            // Also upload to server
            try {
              await fetch('/api/upload-image', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  filename: matchedScene.originalFilename,
                  base64Data: base64,
                }),
              });
            } catch (err) {
              console.warn('Server upload note:', err);
            }
          }
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }

    setUploadStatus(`Processed ${files.length} image(s) successfully!`);
    setTimeout(() => setUploadStatus(null), 3000);
    setTargetSceneForUpload(null);
  };

  const triggerUploadForScene = (sceneId: string) => {
    setTargetSceneForUpload(sceneId);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-[#090b0e] border border-amber-500/50 rounded-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden shadow-[0_0_50px_rgba(245,158,11,0.2)] font-mono text-xs">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-[#12161f]">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
            <div>
              <h2 className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-white">
                ASCENSION-PLUS • PERSONA VISUALS &amp; BACKGROUND SELECTOR
              </h2>
              <p className="text-[11px] text-slate-400">
                10 Core Persona Outfits, Settings &amp; Street Lore (IMG_0585, IMG_0577, IMG_0583, etc.)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setTargetSceneForUpload(null);
                fileInputRef.current?.click();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all shadow-[0_0_10px_rgba(245,158,11,0.3)]"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>UPLOAD IMAGE FILES</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />

        {uploadStatus && (
          <div className="bg-emerald-500/20 border-b border-emerald-500/40 px-5 py-2 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <Check className="w-4 h-4" />
            {uploadStatus}
          </div>
        )}

        {/* Category Filter Tabs */}
        <div className="px-5 py-2.5 border-b border-slate-800/80 bg-[#0d1117] flex flex-wrap items-center gap-1.5">
          <span className="text-slate-500 text-[11px] mr-2">Filter Scenes:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-2.5 py-1 rounded text-[11px] transition-all ${
                filter === cat
                  ? 'bg-amber-500 text-black font-bold'
                  : 'bg-[#161b22] text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid of 10 Persona Scenes */}
        <div className="p-5 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredScenes.map((scene) => {
            const isActive = activeScene.id === scene.id;
            const customUrl = customImages[scene.id];
            const svgData = getSceneSvgArtwork(scene);

            return (
              <div
                key={scene.id}
                className={`rounded-xl border overflow-hidden flex flex-col justify-between transition-all group ${
                  isActive
                    ? 'border-amber-500 bg-[#12161f] shadow-[0_0_20px_rgba(245,158,11,0.25)]'
                    : 'border-slate-800 bg-[#0d1117] hover:border-slate-700'
                }`}
              >
                {/* Visual Artwork Banner */}
                <div className="relative aspect-video w-full overflow-hidden bg-black flex items-center justify-center">
                  <img
                    src={getSceneDisplayUrl(scene, customImages)}
                    alt={scene.title}
                    onError={(e) => {
                      e.currentTarget.src = getSceneDataUri(scene);
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Badges on artwork */}
                  <div className="absolute top-2 left-2 flex items-center gap-1.5">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-bold text-black shadow"
                      style={{ backgroundColor: scene.colorAccent }}
                    >
                      {scene.category}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-black/80 text-amber-400 border border-amber-500/30">
                      {scene.originalFilename}
                    </span>
                  </div>

                  {isActive && (
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-emerald-500 text-black text-[10px] font-extrabold flex items-center gap-1 shadow">
                      <Check className="w-3 h-3" />
                      ACTIVE
                    </div>
                  )}

                  <button
                    onClick={() => setExpandedScene(scene)}
                    className="absolute bottom-2 right-2 p-1.5 rounded bg-black/70 hover:bg-black text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Expand View"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Details Body */}
                <div className="p-3.5 space-y-2 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                      {scene.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2">
                      {scene.outfit}
                    </p>
                  </div>

                  <div className="space-y-1 pt-2 border-t border-slate-800/80 text-[10px] text-slate-400">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Setting:</span>
                      <span className="text-slate-300 truncate max-w-[180px]">{scene.setting}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Trauma Key:</span>
                      <span className="text-amber-400 font-bold">{scene.traumaKey}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Vibe:</span>
                      <span className="text-slate-300">{scene.vibe}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-2 flex items-center gap-2">
                    <button
                      onClick={() => onSelectScene(scene)}
                      className={`flex-1 py-1.5 px-3 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-all ${
                        isActive
                          ? 'bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.4)]'
                          : 'bg-[#161b22] hover:bg-amber-500 hover:text-black text-slate-300 border border-slate-700'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      {isActive ? 'ACTIVE THEME' : 'SET AS THEME'}
                    </button>

                    <button
                      onClick={() => triggerUploadForScene(scene.id)}
                      className="p-1.5 rounded-lg bg-[#161b22] hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-800"
                      title={`Replace with local ${scene.originalFilename}`}
                    >
                      <Upload className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info bar */}
        <div className="px-5 py-3 border-t border-slate-800 bg-[#0d1117] flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Active Scene: <strong className="text-slate-300">{activeScene.title}</strong></span>
          </div>
          <span className="text-slate-400">
            Tip: You can upload your exact <code className="text-amber-400">IMG_0585.webp</code>, <code className="text-amber-400">IMG_0577.jpeg</code> files directly to replace any scene.
          </span>
        </div>
      </div>

      {/* Expanded Modal */}
      {expandedScene && (
        <div className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-[#090b0e] border border-amber-500 rounded-2xl max-w-4xl w-full p-4 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm">{expandedScene.title}</h3>
              <button
                onClick={() => setExpandedScene(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="aspect-video w-full rounded-xl overflow-hidden bg-black flex items-center justify-center">
                <img
                  src={getSceneDisplayUrl(expandedScene, customImages)}
                  alt={expandedScene.title}
                  onError={(e) => {
                    e.currentTarget.src = getSceneDataUri(expandedScene);
                  }}
                  className="w-full h-full object-contain"
                />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
              <div>
                <strong className="text-amber-400 block mb-1">Outfit &amp; Styling:</strong>
                <p className="text-slate-400">{expandedScene.outfit}</p>
              </div>
              <div>
                <strong className="text-amber-400 block mb-1">Vocal &amp; DSP Character:</strong>
                <p className="text-slate-400">{expandedScene.vocalTone}</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  onSelectScene(expandedScene);
                  setExpandedScene(null);
                }}
                className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs"
              >
                APPLY AS ACTIVE THEME
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
