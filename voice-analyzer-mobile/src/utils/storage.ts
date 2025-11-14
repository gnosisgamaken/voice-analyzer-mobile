import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { StoredRecording } from '../types';

const RECORDINGS_KEY = '@voice_analyzer_recordings';

const getRecordingsDir = (): string => {
  if (Platform.OS === 'web') {
    return '';
  }
  const docDir = (FileSystem as any).documentDirectory;
  if (!docDir) {
    return '';
  }
  return `${docDir}recordings/`;
};

export async function initializeStorage(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }
  
  try {
    const recordingsDir = getRecordingsDir();
    const dirInfo = await FileSystem.getInfoAsync(recordingsDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(recordingsDir, { intermediates: true });
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
      const fileInfo = await FileSystem.getInfoAsync(recording.audioUri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(recording.audioUri);
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
    const destination = `${getRecordingsDir()}${filename}`;
    
    await FileSystem.copyAsync({
      from: uri,
      to: destination,
    });
    
    return destination;
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
      const dirInfo = await FileSystem.getInfoAsync(recordingsDir);
      if (dirInfo.exists) {
        await FileSystem.deleteAsync(recordingsDir, { idempotent: true });
      }
    }
    
    await initializeStorage();
  } catch (error) {
    console.error('Error clearing recordings:', error);
    throw error;
  }
}
