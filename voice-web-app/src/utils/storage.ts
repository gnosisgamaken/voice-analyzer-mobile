const DB_NAME = 'VoiceAnalyzerDB';
const DB_VERSION = 1;
const RECORDINGS_STORE = 'recordings';

export interface StoredRecording {
  id: string;
  name: string;
  locationName?: string;
  timestamp: number;
  duration: number;
  audioBlob: Blob;
  mimeType?: string;
  samples: Array<{
    timestamp: number;
    amplitude: number;
    pitchHz: number | null;
  }>;
}

class RecordingsDB {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(RECORDINGS_STORE)) {
          const store = db.createObjectStore(RECORDINGS_STORE, { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  async saveRecording(recording: StoredRecording): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([RECORDINGS_STORE], 'readwrite');
      const store = transaction.objectStore(RECORDINGS_STORE);
      const request = store.put(recording);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getAllRecordings(): Promise<StoredRecording[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([RECORDINGS_STORE], 'readonly');
      const store = transaction.objectStore(RECORDINGS_STORE);
      const request = store.getAll();

      request.onsuccess = () => {
        const recordings = request.result as StoredRecording[];
        recordings.sort((a, b) => b.timestamp - a.timestamp);
        resolve(recordings);
      };
      request.onerror = () => reject(request.error);
    });
  }

  async getRecording(id: string): Promise<StoredRecording | undefined> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([RECORDINGS_STORE], 'readonly');
      const store = transaction.objectStore(RECORDINGS_STORE);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async deleteRecording(id: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([RECORDINGS_STORE], 'readwrite');
      const store = transaction.objectStore(RECORDINGS_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async updateRecordingName(id: string, newName: string): Promise<void> {
    const recording = await this.getRecording(id);
    if (!recording) throw new Error('Recording not found');
    
    recording.name = newName;
    await this.saveRecording(recording);
  }
}

export const recordingsDB = new RecordingsDB();
