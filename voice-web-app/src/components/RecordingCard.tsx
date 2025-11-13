import { useState, useEffect } from 'react';
import type { StoredRecording } from '../utils/storage';
import { WaveformCanvas } from './WaveformCanvas';
import { AudioPlayer } from './AudioPlayer';
import { triggerHaptic } from '../utils/haptics';

interface RecordingCardProps {
  recording: StoredRecording;
  onClose: () => void;
  onRename: (id: string, newName: string) => void;
  onDelete: (id: string) => void;
  onShare: (id: string) => void;
}

export function RecordingCard({ recording, onClose, onRename, onDelete, onShare }: RecordingCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(recording.name);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [userSeekTime, setUserSeekTime] = useState<number | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [showMenu, setShowMenu] = useState(false);

  const handleSaveName = () => {
    if (editedName.trim() && editedName !== recording.name) {
      onRename(recording.id, editedName.trim());
    }
    setIsEditing(false);
    triggerHaptic('light');
  };

  const handleShare = () => {
    triggerHaptic('selection');
    onShare(recording.id);
    setShowMenu(false);
  };

  const handleDelete = () => {
    triggerHaptic('warning');
    if (confirm(`Delete "${recording.name}"?`)) {
      onDelete(recording.id);
      onClose();
    }
    setShowMenu(false);
  };

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  useEffect(() => {
    const url = URL.createObjectURL(recording.audioBlob);
    setAudioUrl(url);
    
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [recording.audioBlob]);

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <button 
            onClick={onClose}
            className="text-blue-500 font-medium touch-manipulation"
          >
            Done
          </button>
          
          <div className="relative">
            <button
              onClick={() => {
                triggerHaptic('selection');
                setShowMenu(!showMenu);
              }}
              className="w-10 h-10 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-colors flex items-center justify-center touch-manipulation"
            >
              <span className="text-2xl text-gray-600">⋯</span>
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-12 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 min-w-48 z-10">
                <button
                  onClick={handleShare}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center gap-3 touch-manipulation"
                >
                  <span className="text-xl">↗️</span>
                  <span>Share</span>
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 active:bg-gray-100 transition-colors flex items-center gap-3 text-red-500 touch-manipulation"
                >
                  <span className="text-xl">🗑️</span>
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          <div>
            {isEditing ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveName();
                    if (e.key === 'Escape') {
                      setEditedName(recording.name);
                      setIsEditing(false);
                    }
                  }}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 active:bg-blue-700 transition-colors touch-manipulation"
                >
                  Save
                </button>
              </div>
            ) : (
              <h2 
                className="text-2xl font-semibold text-gray-900 cursor-pointer hover:text-blue-500 transition-colors"
                onClick={() => {
                  triggerHaptic('light');
                  setIsEditing(true);
                }}
              >
                {recording.name}
              </h2>
            )}
            
            <p className="text-sm text-gray-500 mt-1">
              {formatDate(recording.timestamp)} • {formatDuration(recording.duration)}
            </p>
          </div>

          <div className="mb-6">
            <WaveformCanvas
              samples={recording.samples}
              currentTime={playbackTime}
              onSeek={(time) => {
                setUserSeekTime(time);
                setPlaybackTime(time);
              }}
              isPlaying={false}
            />
          </div>

          {audioUrl && (
            <AudioPlayer
              audioUrl={audioUrl}
              onTimeUpdate={setPlaybackTime}
              seekTime={userSeekTime}
              onSeekComplete={() => setUserSeekTime(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
