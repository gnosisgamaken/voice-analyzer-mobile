import type { RecordingState } from '../types';
import { triggerHaptic } from '../utils/haptics';

interface RecordingControlsProps {
  recordingState: RecordingState;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  onReset: () => void;
}

export function RecordingControls({
  recordingState,
  onStart,
  onPause,
  onResume,
  onStop,
  onReset,
}: RecordingControlsProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-6">
      {recordingState === 'idle' && (
        <button
          onClick={() => {
            triggerHaptic('medium');
            onStart();
          }}
          className="w-20 h-20 rounded-full bg-apple-red shadow-lg active:scale-95 transition-transform touch-manipulation flex items-center justify-center"
        >
          <div className="w-6 h-6 rounded-full bg-white" />
        </button>
      )}

      {recordingState === 'recording' && (
        <div className="flex items-center gap-8">
          <button
            onClick={() => {
              triggerHaptic('light');
              onPause();
            }}
            className="w-20 h-20 rounded-full bg-apple-red shadow-lg active:scale-95 transition-transform touch-manipulation flex items-center justify-center"
          >
            <div className="flex gap-1.5">
              <div className="w-1.5 h-6 bg-white rounded-full" />
              <div className="w-1.5 h-6 bg-white rounded-full" />
            </div>
          </button>
          <button
            onClick={() => {
              triggerHaptic('medium');
              onStop();
            }}
            className="w-14 h-14 rounded-full bg-gray-300 shadow-md active:scale-95 transition-transform touch-manipulation flex items-center justify-center"
          >
            <div className="w-5 h-5 bg-gray-600 rounded" />
          </button>
        </div>
      )}

      {recordingState === 'paused' && (
        <div className="flex items-center gap-8">
          <button
            onClick={() => {
              triggerHaptic('medium');
              onResume();
            }}
            className="w-20 h-20 rounded-full bg-apple-red shadow-lg active:scale-95 transition-transform touch-manipulation flex items-center justify-center"
          >
            <div className="w-6 h-6 rounded-full bg-white" />
          </button>
          <button
            onClick={() => {
              triggerHaptic('medium');
              onStop();
            }}
            className="w-14 h-14 rounded-full bg-gray-300 shadow-md active:scale-95 transition-transform touch-manipulation flex items-center justify-center"
          >
            <div className="w-5 h-5 bg-gray-600 rounded" />
          </button>
        </div>
      )}

      {recordingState === 'stopped' && (
        <button
          onClick={() => {
            triggerHaptic('light');
            onReset();
          }}
          className="px-8 py-3 rounded-full bg-blue-500 text-white font-medium shadow-md active:scale-95 transition-transform touch-manipulation"
        >
          New Recording
        </button>
      )}
    </div>
  );
}
