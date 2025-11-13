import { useState } from 'react';
import { WaveformCanvas } from './components/WaveformCanvas';
import { RecordingControls } from './components/RecordingControls';
import { AudioPlayer } from './components/AudioPlayer';
import { RecordingsList } from './components/RecordingsList';
import { VoiceMetrics } from './components/VoiceMetrics';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import { triggerHaptic } from './utils/haptics';

function App() {
  const {
    recordingState,
    samples,
    duration,
    audioUrl,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    reset,
  } = useAudioRecorder();

  const [playbackTime, setPlaybackTime] = useState<number>(0);
  const [userSeekTime, setUserSeekTime] = useState<number | null>(null);
  const [showRecordings, setShowRecordings] = useState(false);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const milliseconds = Math.floor((ms % 1000) / 10);
    
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-apple-gray flex flex-col">
      <div className="flex-1 flex flex-col max-w-2xl mx-auto w-full p-4 sm:p-6">
        <div className="flex items-center justify-between mb-4 pt-4">
          <button 
            onClick={() => {
              triggerHaptic('selection');
              setShowRecordings(true);
            }}
            className="w-10 h-10 rounded-full hover:bg-gray-200 active:bg-gray-300 transition-colors flex items-center justify-center touch-manipulation"
          >
            <span className="text-2xl text-gray-600">⋯</span>
          </button>
          
          {recordingState === 'stopped' && (
            <button className="w-10 h-10 rounded-full bg-blue-500 hover:bg-blue-600 active:bg-blue-700 transition-colors flex items-center justify-center shadow-md touch-manipulation">
              <span className="text-white text-xl">✓</span>
            </button>
          )}
        </div>

        <div className="flex-1 mb-6 min-h-0">
          <WaveformCanvas 
            samples={samples} 
            currentTime={recordingState === 'stopped' ? playbackTime : undefined}
            onSeek={recordingState === 'stopped' ? (time) => {
              setUserSeekTime(time);
              setPlaybackTime(time);
            } : undefined}
            isPlaying={recordingState === 'recording'}
          />
        </div>

        {(recordingState === 'recording' || recordingState === 'paused') && samples.length > 0 && (
          <div className="mb-4">
            <VoiceMetrics samples={samples} />
          </div>
        )}

        <div className="text-center mb-6">
          <div className="text-6xl font-light tracking-tight text-gray-900">
            {formatTime(recordingState === 'stopped' ? playbackTime : duration)}
          </div>
        </div>

        {recordingState === 'stopped' && audioUrl && (
          <AudioPlayer 
            audioUrl={audioUrl} 
            onTimeUpdate={setPlaybackTime}
            seekTime={userSeekTime}
            onSeekComplete={() => setUserSeekTime(null)}
          />
        )}

        <div className="pt-6">
          <RecordingControls
            recordingState={recordingState}
            onStart={startRecording}
            onPause={pauseRecording}
            onResume={resumeRecording}
            onStop={stopRecording}
            onReset={reset}
          />
        </div>
      </div>

      <RecordingsList 
        isOpen={showRecordings} 
        onClose={() => setShowRecordings(false)} 
      />
    </div>
  );
}

export default App;
