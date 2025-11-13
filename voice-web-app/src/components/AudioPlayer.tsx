import { useState, useRef, useEffect } from 'react';
import { triggerHaptic } from '../utils/haptics';

interface AudioPlayerProps {
  audioUrl: string | null;
  onTimeUpdate?: (time: number) => void;
  seekTime?: number | null;
  onSeekComplete?: () => void;
}

export function AudioPlayer({ audioUrl, onTimeUpdate, seekTime, onSeekComplete }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
    };

    const handleTimeUpdate = () => {
      onTimeUpdate?.(audio.currentTime * 1000);
    };

    const handleEnded = () => {
      setIsPlaying(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [audioUrl, onTimeUpdate]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || seekTime === null || seekTime === undefined) return;

    audio.currentTime = seekTime / 1000;
    onSeekComplete?.();
  }, [seekTime, onSeekComplete]);

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    triggerHaptic(isPlaying ? 'light' : 'medium');
    
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      try {
        await audio.play();
        setIsPlaying(true);
      } catch (error) {
        console.error('Failed to play audio:', error);
      }
    }
  };

  const skip = (seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    triggerHaptic('light');
    audio.currentTime = Math.max(0, Math.min(duration, audio.currentTime + seconds));
  };

  if (!audioUrl) return null;

  return (
    <div className="flex items-center justify-center gap-8 py-8">
      <audio ref={audioRef} src={audioUrl} />
      
      <button
        onClick={() => skip(-15)}
        className="w-12 h-12 rounded-full bg-gray-200 active:bg-gray-300 transition-colors touch-manipulation flex items-center justify-center"
      >
        <span className="text-sm font-semibold text-gray-700">-15</span>
      </button>

      <button
        onClick={togglePlayPause}
        className="w-16 h-16 rounded-full bg-gray-700 active:bg-gray-800 transition-colors touch-manipulation flex items-center justify-center shadow-lg"
      >
        {isPlaying ? (
          <div className="flex gap-1.5">
            <div className="w-1 h-5 bg-white rounded-full" />
            <div className="w-1 h-5 bg-white rounded-full" />
          </div>
        ) : (
          <div className="w-0 h-0 border-l-[10px] border-l-white border-y-[7px] border-y-transparent ml-1" />
        )}
      </button>

      <button
        onClick={() => skip(15)}
        className="w-12 h-12 rounded-full bg-gray-200 active:bg-gray-300 transition-colors touch-manipulation flex items-center justify-center"
      >
        <span className="text-sm font-semibold text-gray-700">+15</span>
      </button>
    </div>
  );
}
