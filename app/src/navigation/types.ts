import type { StoredRecording } from '../types';

export type RecorderStackParamList = {
  MainRecording: undefined;
  BrandedMetricsDemo: undefined;
};

export type HistoryStackParamList = {
  RecordingsList: undefined;
  RecordingDetails: { recording: StoredRecording };
};

export type NotificationsStackParamList = {
  NotificationSettings: undefined;
  PCMMonitor?: undefined;
};

export type DevStackParamList = {
  DesignSystemGallery: undefined;
};

export type RootTabParamList = {
  RecorderStack: undefined;
  HistoryStack: undefined;
  NotificationsStack: undefined;
  DevStack?: undefined;
};
