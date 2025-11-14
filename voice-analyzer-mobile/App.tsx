import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import MainRecordingScreen from './src/screens/MainRecordingScreen';
import RecordingsListScreen from './src/screens/RecordingsListScreen';
import RecordingDetailsScreen from './src/screens/RecordingDetailsScreen';
import { StoredRecording } from './src/types';

export type RootStackParamList = {
  MainRecording: undefined;
  RecordingsList: undefined;
  RecordingDetails: { recording: StoredRecording };
};

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="MainRecording" component={MainRecordingScreen} />
        <Stack.Screen name="RecordingsList" component={RecordingsListScreen} />
        <Stack.Screen name="RecordingDetails" component={RecordingDetailsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
