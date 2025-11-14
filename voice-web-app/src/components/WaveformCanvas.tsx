import { useEffect, useRef } from 'react';
import type { VoiceSample } from '../types';
import { pitchToColor } from '../utils/pitchToColor';

interface WaveformCanvasProps {
  samples: VoiceSample[];
  currentTime?: number;
  onSeek?: (time: number) => void;
  isPlaying?: boolean;
}

export function WaveformCanvas({ samples, currentTime, onSeek, isPlaying }: WaveformCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    
    if (rect.width === 0 || rect.height === 0) return;
    
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.scale(dpr, dpr);

    const width = rect.width;
    const height = rect.height;

    ctx.clearRect(0, 0, width, height);

    if (samples.length === 0) return;

    const barWidth = 3;
    const barGap = 1;
    const barTotalWidth = barWidth + barGap;
    const maxBars = Math.floor(width / barTotalWidth);
    
    const startIndex = Math.max(0, samples.length - maxBars);
    const visibleSamples = samples.slice(startIndex);

    visibleSamples.forEach((sample, index) => {
      const x = index * barTotalWidth;
      const normalizedHeight = Math.max(0.02, sample.amplitude);
      const barHeight = normalizedHeight * height * 0.8;
      const y = (height - barHeight) / 2;

      ctx.fillStyle = pitchToColor(sample.pitchHz);
      ctx.fillRect(x, y, barWidth, Math.max(2, barHeight));
    });

    if (currentTime !== undefined && onSeek) {
      const playheadPosition = (currentTime / (samples[samples.length - 1]?.timestamp || 1)) * width;
      ctx.strokeStyle = '#FF3B30';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(playheadPosition, 0);
      ctx.lineTo(playheadPosition, height);
      ctx.stroke();
    }
  }, [samples, currentTime, onSeek]);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onSeek || samples.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const totalDuration = samples[samples.length - 1]?.timestamp || 0;
    const seekTime = percentage * totalDuration;

    onSeek(seekTime);
  };

  return (
    <div ref={containerRef} className="relative w-full h-48 bg-white rounded-2xl shadow-sm overflow-hidden">
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-pointer"
        onClick={handleClick}
      />
      {samples.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
          {isPlaying ? 'Recording...' : 'Tap record to begin'}
        </div>
      )}
    </div>
  );
}
