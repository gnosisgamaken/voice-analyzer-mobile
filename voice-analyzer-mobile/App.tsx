import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import MainRecordingScreen from './src/screens/MainRecordingScreen';
import RecordingsListScreen from './src/screens/RecordingsListScreen';

export type RootStackParamList = {
  MainRecording: undefined;
  RecordingsList: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

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
      </Stack.Navigator>
    </NavigationContainer>
  );
}
