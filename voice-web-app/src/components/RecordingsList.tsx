import { useState, useEffect } from 'react';
import { recordingsDB, type StoredRecording } from '../utils/storage';
import { RecordingCard } from './RecordingCard';
import { triggerHaptic } from '../utils/haptics';

interface RecordingsListProps {
  isOpen: boolean;
  onClose: () => void;
}

export function RecordingsList({ isOpen, onClose }: RecordingsListProps) {
  const [recordings, setRecordings] = useState<StoredRecording[]>([]);
  const [selectedRecording, setSelectedRecording] = useState<StoredRecording | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadRecordings();
    }
  }, [isOpen]);

  const loadRecordings = async () => {
    try {
      const allRecordings = await recordingsDB.getAllRecordings();
      setRecordings(allRecordings);
    } catch (error) {
      console.error('Failed to load recordings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRename = async (id: string, newName: string) => {
    try {
      await recordingsDB.updateRecordingName(id, newName);
      await loadRecordings();
      if (selectedRecording?.id === id) {
        const updated = await recordingsDB.getRecording(id);
        if (updated) setSelectedRecording(updated);
      }
    } catch (error) {
      console.error('Failed to rename recording:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await recordingsDB.deleteRecording(id);
      await loadRecordings();
    } catch (error) {
      console.error('Failed to delete recording:', error);
    }
  };

  const handleShare = async (id: string) => {
    const recording = recordings.find(r => r.id === id);
    if (!recording) return;

    if (navigator.share && navigator.canShare) {
      try {
        const file = new File([recording.audioBlob], `${recording.name}.webm`, {
          type: recording.audioBlob.type,
        });

        if (navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: recording.name,
          });
        }
      } catch (error) {
        console.error('Share failed:', error);
        fallbackDownload(recording);
      }
    } else {
      fallbackDownload(recording);
    }
  };

  const fallbackDownload = (recording: StoredRecording) => {
    const url = URL.createObjectURL(recording.audioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${recording.name}.webm`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
      });
    }
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-40 p-4"
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Recordings</h2>
            <button 
              onClick={onClose}
              className="text-blue-500 font-medium touch-manipulation"
            >
              Done
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-gray-400">Loading recordings...</div>
              </div>
            ) : recordings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="text-6xl mb-4">🎙️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Recordings Yet</h3>
                <p className="text-gray-500">Your recordings will appear here</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {recordings.map((recording) => (
                  <button
                    key={recording.id}
                    onClick={() => {
                      triggerHaptic('selection');
                      setSelectedRecording(recording);
                    }}
                    className="w-full px-6 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors text-left touch-manipulation"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-medium text-gray-900 truncate">
                          {recording.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(recording.timestamp)} • {formatDuration(recording.duration)}
                        </p>
                      </div>
                      <span className="text-gray-400 ml-3">›</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {selectedRecording && (
        <RecordingCard
          recording={selectedRecording}
          onClose={() => setSelectedRecording(null)}
          onRename={handleRename}
          onDelete={handleDelete}
          onShare={handleShare}
        />
      )}
    </>
  );
}
