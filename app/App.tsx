import React from 'react';
import { SimpleNavigator } from './src/navigation/SimpleNavigator';
import MainRecordingScreen from './src/screens/MainRecordingScreen';
import RecordingsListScreen from './src/screens/RecordingsListScreen';
import RecordingDetailsScreen from './src/screens/RecordingDetailsScreen';
import BrandedMetricsDemoScreen from './src/screens/BrandedMetricsDemoScreen';

export default function App() {
  return (
    <SimpleNavigator
      screens={{
        MainRecording: MainRecordingScreen,
        RecordingsList: RecordingsListScreen,
        RecordingDetails: RecordingDetailsScreen,
        BrandedMetricsDemo: BrandedMetricsDemoScreen,
      }}
    />
  );
}
