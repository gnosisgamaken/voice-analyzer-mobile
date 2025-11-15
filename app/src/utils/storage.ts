import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import RNFS from 'react-native-fs';
import { StoredRecording } from '../types';
import { logger } from './logger';

const RECORDINGS_KEY = '@voice_analyzer_recordings';
const RECORDINGS_DIR = `${RNFS.DocumentDirectoryPath}/recordings`;

const ensureRecordingsDir = async (): Promise<void> => {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    const exists = await RNFS.exists(RECORDINGS_DIR);
    if (!exists) {
      await RNFS.mkdir(RECORDINGS_DIR);
      logger.debug('Created recordings directory');
    }
  } catch (error) {
    logger.error('Error ensuring recordings directory:', error);
    throw error;
  }
};

const stripFileScheme = (uri: string): string => {
  if (uri.startsWith('file://')) {
    return uri.replace('file://', '');
  }
  return uri;
};

export async function initializeStorage(): Promise<void> {
  if (Platform.OS === 'web') {
    return;
  }

  try {
    await ensureRecordingsDir();
  } catch (error) {
    logger.error('Error initializing storage:', error);
  }
}

export async function saveRecordingMetadata(recording: StoredRecording): Promise<void> {
  try {
    const recordings = await getAllRecordings();
    recordings.push(recording);
    
    await AsyncStorage.setItem(RECORDINGS_KEY, JSON.stringify(recordings));
    logger.debug('Saved recording metadata:', recording.name);
  } catch (error) {
    logger.error('Error saving recording metadata:', error);
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
    logger.error('Error getting recordings:', error);
    return [];
  }
}

export async function getRecordingById(id: string): Promise<StoredRecording | null> {
  try {
    const recordings = await getAllRecordings();
    return recordings.find(r => r.id === id) || null;
  } catch (error) {
    logger.error('Error getting recording by ID:', error);
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
      const path = stripFileScheme(recording.audioUri);
      const exists = await RNFS.exists(path);
      if (exists) {
        await RNFS.unlink(path);
      }
    }

    const updatedRecordings = recordings.filter(r => r.id !== id);
    await AsyncStorage.setItem(RECORDINGS_KEY, JSON.stringify(updatedRecordings));
    logger.debug('Deleted recording:', id);
  } catch (error) {
    logger.error('Error deleting recording:', error);
    throw error;
  }
}

export async function saveAudioFile(uri: string, recordingId: string): Promise<string> {
  if (Platform.OS === 'web') {
    return uri;
  }
  
  try {
    await ensureRecordingsDir();

    const filename = `${recordingId}.wav`;
    const sourcePath = stripFileScheme(uri);
    const destinationPath = `${RECORDINGS_DIR}/${filename}`;

    const sourceExists = await RNFS.exists(sourcePath);
    if (!sourceExists) {
      throw new Error('Source audio file not found');
    }

    const destinationExists = await RNFS.exists(destinationPath);
    if (destinationExists) {
      await RNFS.unlink(destinationPath);
    }

    await RNFS.copyFile(sourcePath, destinationPath);

    const finalUri = destinationPath.startsWith('file://') ? destinationPath : `file://${destinationPath}`;
    logger.debug('Saved audio file:', finalUri);
    return finalUri;
  } catch (error) {
    logger.error('Error saving audio file:', error);
    throw error;
  }
}

export async function clearAllRecordings(): Promise<void> {
  try {
    await AsyncStorage.removeItem(RECORDINGS_KEY);
    
    if (Platform.OS !== 'web') {
      const exists = await RNFS.exists(RECORDINGS_DIR);
      if (exists) {
        await RNFS.unlink(RECORDINGS_DIR);
      }
    }
    
    await initializeStorage();
    logger.debug('Cleared all recordings');
  } catch (error) {
    logger.error('Error clearing recordings:', error);
    throw error;
  }
}
