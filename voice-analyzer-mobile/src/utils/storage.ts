import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { File, Directory, Paths } from 'expo-file-system';
import { StoredRecording } from '../types';

const RECORDINGS_KEY = '@voice_analyzer_recordings';
const RECORDINGS_FOLDER = 'recordings';

const getRecordingsDir = (): Directory | null => {
  if (Platform.OS === 'web') {
    return null;
  }
  return new Directory(Paths.document, RECORDINGS_FOLDER);
};

export async function initializeStorage(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }
  
  try {
    const recordingsDir = getRecordingsDir();
    if (recordingsDir && !recordingsDir.exists) {
      recordingsDir.create();
      console.log('[STORAGE] Created recordings directory');
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
}

export async function saveRecordingMetadata(recording: StoredRecording): Promise<void> {
  try {
    const recordings = await getAllRecordings();
    recordings.push(recording);
    
    await AsyncStorage.setItem(RECORDINGS_KEY, JSON.stringify(recordings));
    console.log('[STORAGE] Saved recording metadata:', recording.name);
  } catch (error) {
    console.error('Error saving recording metadata:', error);
    throw error;
  }
}

export async function getAllRecordings(): Promise<StoredRecording[]> {
  try {
    const data = await AsyncStorage.getItem(RECORDINGS_KEY);
    
    if (!data) {
      return [];
    }
    
    return JSON.parse(data);
  } catch (error) {
    console.error('Error getting recordings:', error);
    return [];
  }
}

export async function getRecordingById(id: string): Promise<StoredRecording | null> {
  try {
    const recordings = await getAllRecordings();
    return recordings.find(r => r.id === id) || null;
  } catch (error) {
    console.error('Error getting recording by ID:', error);
    return null;
  }
}

export async function deleteRecording(id: string): Promise<void> {
  try {
    const recordings = await getAllRecordings();
    const recording = recordings.find(r => r.id === id);
    
    if (!recording) {
      throw new Error('Recording not found');
    }

    if (recording.audioUri && Platform.OS !== 'web') {
      const file = new File(recording.audioUri);
      if (file.exists) {
        file.delete();
      }
    }

    const updatedRecordings = recordings.filter(r => r.id !== id);
    await AsyncStorage.setItem(RECORDINGS_KEY, JSON.stringify(updatedRecordings));
  } catch (error) {
    console.error('Error deleting recording:', error);
    throw error;
  }
}

export async function saveAudioFile(uri: string, recordingId: string): Promise<string> {
  if (Platform.OS === 'web') {
    return uri;
  }
  
  try {
    await initializeStorage();
    
    const filename = `${recordingId}.m4a`;
    const recordingsDir = getRecordingsDir();
    
    if (!recordingsDir) {
      throw new Error('Recordings directory not available');
    }
    
    const sourceFile = new File(uri);
    const destinationFile = new File(recordingsDir, filename);
    
    if (destinationFile.exists) {
      destinationFile.delete();
    }
    
    sourceFile.copy(recordingsDir);
    
    const finalUri = `${Paths.document}${RECORDINGS_FOLDER}/${filename}`;
    
    console.log('[STORAGE] Saved audio file:', finalUri);
    return finalUri;
  } catch (error) {
    console.error('Error saving audio file:', error);
    throw error;
  }
}

export async function clearAllRecordings(): Promise<void> {
  try {
    await AsyncStorage.removeItem(RECORDINGS_KEY);
    
    if (Platform.OS !== 'web') {
      const recordingsDir = getRecordingsDir();
      if (recordingsDir && recordingsDir.exists) {
        recordingsDir.delete();
      }
    }
    
    await initializeStorage();
  } catch (error) {
    console.error('Error clearing recordings:', error);
    throw error;
  }
}
