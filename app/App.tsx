import 'react-native-gesture-handler';
import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BlurView } from '@react-native-community/blur';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import MainRecordingScreen from './src/screens/MainRecordingScreen';
import RecordingsListScreen from './src/screens/RecordingsListScreen';
import RecordingDetailsScreen from './src/screens/RecordingDetailsScreen';
import NotificationSettingsScreen from './src/screens/NotificationSettingsScreen';
import DesignSystemGalleryScreen from './src/screens/DesignSystemGalleryScreen';
import PCMMonitorScreen from './src/screens/PCMMonitorScreen';

import SFSymbol from './src/components/SFSymbol';
import { useReduceTransparency } from './src/hooks/useReduceTransparency';
import { useHaptics } from './src/hooks/useHaptics';
import { DesignTokens } from './src/design/tokens';
import {
  RecorderStackParamList,
  HistoryStackParamList,
  NotificationsStackParamList,
  DevStackParamList,
  RootTabParamList,
} from './src/navigation/types';

const RecorderStack = createNativeStackNavigator<RecorderStackParamList>();
const HistoryStack = createNativeStackNavigator<HistoryStackParamList>();
const NotificationsStack = createNativeStackNavigator<NotificationsStackParamList>();
const DevStack = createNativeStackNavigator<DevStackParamList>();
const Tab = createBottomTabNavigator<RootTabParamList>();

function RecorderStackScreen() {
  return (
    <RecorderStack.Navigator screenOptions={{ headerShown: false }}>
      <RecorderStack.Screen name="MainRecording" component={MainRecordingScreen} />
    </RecorderStack.Navigator>
  );
}

function HistoryStackScreen() {
  return (
    <HistoryStack.Navigator screenOptions={{ headerShown: false }}>
      <HistoryStack.Screen name="RecordingsList" component={RecordingsListScreen} />
      <HistoryStack.Screen name="RecordingDetails" component={RecordingDetailsScreen} />
    </HistoryStack.Navigator>
  );
}

function NotificationsStackScreen() {
  return (
    <NotificationsStack.Navigator screenOptions={{ headerShown: false }}>
      <NotificationsStack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
      <NotificationsStack.Screen name="PCMMonitor" component={PCMMonitorScreen} />
    </NotificationsStack.Navigator>
  );
}

function DevStackScreen() {
  return (
    <DevStack.Navigator screenOptions={{ headerShown: false }}>
      <DevStack.Screen name="DesignSystemGallery" component={DesignSystemGalleryScreen} />
    </DevStack.Navigator>
  );
}

const TAB_CONFIG: Record<string, { label: string; icon: string }> = {
  RecorderStack: { label: 'Recorder', icon: 'mic.circle.fill' },
  HistoryStack: { label: 'History', icon: 'chart.bar.fill' },
  NotificationsStack: { label: 'Notifications', icon: 'bell.fill' },
  DevStack: { label: 'Gallery', icon: 'paintpalette.fill' },
};

function LiquidTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const reduceTransparency = useReduceTransparency();
  const haptics = useHaptics();

  return (
    <View style={[tabStyles.container, { paddingBottom: 24 }]} pointerEvents="box-none">
      <View style={[tabStyles.wrapper, reduceTransparency && tabStyles.wrapperSolid]}>
        {!reduceTransparency && (
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType={DesignTokens.isDarkMode ? 'dark' : 'light'}
            blurAmount={28}
            reducedTransparencyFallbackColor={DesignTokens.colors.bgGlass}
          />
        )}
        <View style={tabStyles.content}>
          {state.routes.map((route, index) => {
            if (!TAB_CONFIG[route.name]) {
              return null;
            }
            const { label, icon } = TAB_CONFIG[route.name];
            const isFocused = state.index === index;

            const onPress = () => {
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!isFocused && !event.defaultPrevented) {
                haptics.selection();
                navigation.navigate(route.name as never);
              }
            };

            return (
              <TouchableOpacity
                key={route.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: isFocused }}
                accessibilityLabel={label}
                onPress={onPress}
                style={tabStyles.button}
                activeOpacity={0.85}
              >
                <SFSymbol
                  name={icon}
                  size={22}
                  color={isFocused ? DesignTokens.colors.tint : DesignTokens.colors.textSecondary}
                />
                <Text style={[tabStyles.label, isFocused && tabStyles.labelActive]}>{label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

function AppTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }} tabBar={(props) => <LiquidTabBar {...props} />}>
      <Tab.Screen name="RecorderStack" component={RecorderStackScreen} />
      <Tab.Screen name="HistoryStack" component={HistoryStackScreen} />
      <Tab.Screen name="NotificationsStack" component={NotificationsStackScreen} />
      {__DEV__ && <Tab.Screen name="DevStack" component={DevStackScreen} />}
    </Tab.Navigator>
  );
}

export default function App() {
  const navigationTheme = useMemo(() => {
    return {
      dark: true,
      colors: {
        ...DarkTheme.colors,
        primary: DesignTokens.colors.tint,
        background: DesignTokens.colors.bgPrimary,
        card: DesignTokens.colors.bgSecondary,
        text: DesignTokens.colors.textPrimary,
        border: DesignTokens.colors.separator,
        notification: DesignTokens.colors.tint,
      },
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <NavigationContainer theme={navigationTheme}>
        <AppTabs />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const tabStyles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: DesignTokens.spacing.md,
    right: DesignTokens.spacing.md,
    bottom: DesignTokens.spacing.md,
  },
  wrapper: {
    borderRadius: DesignTokens.radii.xl,
    paddingHorizontal: DesignTokens.spacing.xs,
    paddingVertical: DesignTokens.spacing.xs,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: DesignTokens.colors.bgGlass,
    overflow: 'hidden',
  },
  wrapperSolid: {
    backgroundColor: DesignTokens.colors.bgCard,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: DesignTokens.spacing.sm,
    gap: 4,
  },
  label: {
    fontSize: 12,
    color: DesignTokens.colors.textSecondary,
    fontWeight: '600',
  },
  labelActive: {
    color: DesignTokens.colors.tint,
  },
});
