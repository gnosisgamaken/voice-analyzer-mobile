import { NativeModules, NativeEventEmitter } from 'react-native';

const { VoicePCMStreamer } = NativeModules;

const voiceEventEmitter = new NativeEventEmitter(VoicePCMStreamer);

export default {
  startStreaming: () => VoicePCMStreamer.startStreaming(),
  stopStreaming: () => VoicePCMStreamer.stopStreaming(),
  addListener: (callback) => voiceEventEmitter.addListener('onAudioPCM', callback),
  removeAllListeners: () => voiceEventEmitter.removeAllListeners('onAudioPCM'),
};
