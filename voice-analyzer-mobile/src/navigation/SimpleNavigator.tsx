import React, { useState, ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { StoredRecording } from '../types';

type Screen = 'MainRecording' | 'RecordingsList' | 'RecordingDetails';

interface NavigationState {
  screen: Screen;
  params?: any;
}

export interface NavigationProp {
  navigate: (screen: Screen, params?: any) => void;
  goBack: () => void;
}

interface SimpleNavigatorProps {
  screens: {
    MainRecording: React.ComponentType<{ navigation: NavigationProp }>;
    RecordingsList: React.ComponentType<{ navigation: NavigationProp }>;
    RecordingDetails: React.ComponentType<{ navigation: NavigationProp; route: { params: { recording: StoredRecording } } }>;
  };
}

export const SimpleNavigator: React.FC<SimpleNavigatorProps> = ({ screens }) => {
  const [history, setHistory] = useState<NavigationState[]>([
    { screen: 'MainRecording' }
  ]);

  const currentState = history[history.length - 1];

  const navigation: NavigationProp = {
    navigate: (screen, params) => {
      setHistory(prev => [...prev, { screen, params }]);
    },
    goBack: () => {
      if (history.length > 1) {
        setHistory(prev => prev.slice(0, -1));
      }
    },
  };

  const renderScreen = () => {
    const ScreenComponent = screens[currentState.screen];
    
    if (currentState.screen === 'RecordingDetails' && currentState.params) {
      const DetailScreen = ScreenComponent as React.ComponentType<any>;
      return (
        <DetailScreen
          navigation={navigation}
          route={{ params: currentState.params }}
        />
      );
    }
    
    const RegularScreen = ScreenComponent as React.ComponentType<{ navigation: NavigationProp }>;
    return <RegularScreen navigation={navigation} />;
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
