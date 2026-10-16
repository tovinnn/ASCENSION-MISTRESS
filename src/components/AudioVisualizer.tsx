import { useEffect, useRef, useState } from 'react';
import { getAscensionDspEngine } from '../audio/dspEngine';
import { Activity, BarChart3, Radio } from 'lucide-react';

interface AudioVisualizerProps {
  className?: string;
}

export function AudioVisualizer({ className = '' }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mode, setMode] = useState<'transient' | 'spectrum'>('transient');
  const dsp = getAscensionDspEngine();

  useEffect(() => {
    let animId: number;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      ctx.clearRect(0, 0, width, height);

      // Background grid lines (DAW pocket grid)
      ctx.strokeStyle = '#151b23';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw mode
      if (mode === 'transient') {
        // Transient / Pocket Scanner (Oscilloscope)
        const analyser = dsp.transientAnalyser;
        if (analyser) {
          const bufferLength = analyser.fftSize;
          const dataArray = new Uint8Array(bufferLength);
          analyser.getByteTimeDomainData(dataArray);

          ctx.lineWidth = 2.5;
          ctx.strokeStyle = '#f59e0b'; // Amber glow
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#f59e0b88';

          ctx.beginPath();
          const sliceWidth = width / bufferLength;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            const v = dataArray[i] / 128.0;
            const y = (v * height) / 2;

            if (i === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
            x += sliceWidth;
          }

          ctx.lineTo(width, height / 2);
          ctx.stroke();
          ctx.shadowBlur = 0; // reset
        } else {
          // Idle ambient sine wave
          ctx.strokeStyle = '#374151';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          const t = Date.now() / 800;
          for (let x = 0; x < width; x++) {
            const y = height / 2 + Math.sin(x * 0.03 + t) * 8;
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      } else {
        // Spectral Subtraction & Master Frequency Spectrum (FFT)
        const analyser = dsp.spectrumAnalyser;
        if (analyser) {
          const bufferLength = analyser.frequencyBinCount;
          const dataArray = new Uint8Array(bufferLength);
          analyser.getByteFrequencyData(dataArray);

          const barWidth = (width / bufferLength) * 2.2;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            const barHeight = (dataArray[i] / 255) * height * 0.95;

            // Gradient: Red for 30-90Hz sub-bass, Amber for mid vocal, Cyan for air
            let barColor = '#3b82f6';
            if (i < 8) {
              barColor = '#ef4444'; // 30-90Hz Sub Bass
            } else if (i < 24) {
              barColor = '#f59e0b'; // Vocal Body / Rasp
            } else if (i > 45) {
              barColor = '#06b6d4'; // Air sheen
            }

            ctx.fillStyle = barColor;
            ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);

            x += barWidth;
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [mode, dsp]);

  return (
    <div className={`relative bg-[#0d1117] border border-[#21262d] rounded-lg p-3 overflow-hidden ${className}`}>
      {/* Header bar */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="text-[11px] font-mono tracking-wider uppercase text-slate-300 font-semibold">
            {mode === 'transient' ? 'Transient / Pocket Scanner' : 'Spectral FFT Frequency Bus'}
          </span>
          <span className="text-[10px] font-mono text-slate-500 border border-slate-800 px-1.5 py-0.5 rounded">
            {mode === 'transient' ? '512 samples' : '30Hz - 20kHz'}
          </span>
        </div>

        <div className="flex items-center gap-1 bg-[#161b22] p-0.5 rounded border border-slate-800">
          <button
            onClick={() => setMode('transient')}
            className={`flex items-center gap-1 px-2 py-1 text-[10px] font-mono rounded transition-colors ${
              mode === 'transient'
                ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Transient / Pocket Scanner"
          >
            <Activity className="w-3 h-3" />
            Pocket Scope
          </button>
          <button
            onClick={() => setMode('spectrum')}
            className={`flex items-center gap-1 px-2 py-1 text-[10px] font-mono rounded transition-colors ${
              mode === 'spectrum'
                ? 'bg-amber-500/20 text-amber-400 font-bold border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Spectral FFT Analyzer"
          >
            <BarChart3 className="w-3 h-3" />
            Spectral FFT
          </button>
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        width={720}
        height={130}
        className="w-full h-[120px] bg-[#090b0e] rounded border border-slate-800/80 block"
      />

      {/* Frequency / Time axis footer */}
      <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 mt-1 px-1">
        {mode === 'transient' ? (
          <>
            <span>-20ms (Pre-attack)</span>
            <span>0ms (Transient Peak)</span>
            <span>+25ms (Sustain)</span>
            <span>+80ms (Decay Pocket)</span>
          </>
        ) : (
          <>
            <span className="text-red-400 font-bold">30Hz (808 Sub)</span>
            <span className="text-red-400">90Hz (Kick Punch)</span>
            <span className="text-amber-400 font-bold">1kHz - 3kHz (Tube Rasp)</span>
            <span className="text-cyan-400">10kHz+ (Air Sheen)</span>
          </>
        )}
      </div>
    </div>
  );
}
