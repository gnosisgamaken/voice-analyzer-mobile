import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAudioPlayer } from '../hooks/useAudioPlayer';
import PlaybackControls from '../components/PlaybackControls';
import VoiceMetrics from '../components/VoiceMetrics';
import type { RootStackParamList } from '../../App';

type RecordingDetailsRouteProp = RouteProp<RootStackParamList, 'RecordingDetails'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'RecordingDetails'>;

export default function RecordingDetailsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RecordingDetailsRouteProp>();
  const { recording } = route.params;

  const {
    playbackState,
    position,
    duration,
    play,
    pause,
    stop,
    seek,
    loadAudio,
    unloadAudio,
  } = useAudioPlayer();

  useEffect(() => {
    if (recording.audioUri) {
      loadAudio(recording.audioUri);
    }

    return () => {
      unloadAudio();
    };
  }, [recording.audioUri]);

  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const options: Intl.DateTimeFormatOptions = {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    };
    return date.toLocaleDateString('en-US', options);
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />
      
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{recording.name}</Text>
          <Text style={styles.subtitle}>{formatDate(recording.timestamp)}</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Duration</Text>
            <Text style={styles.infoValue}>{formatDuration(recording.duration)}</Text>
          </View>
          
          {recording.location?.formattedAddress && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Location</Text>
              <Text style={styles.infoValue}>{recording.location.formattedAddress}</Text>
            </View>
          )}

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>File</Text>
            <Text style={styles.infoValue} numberOfLines={1}>
              {recording.audioUri ? '✓ Saved' : 'No audio file'}
            </Text>
          </View>
        </View>

        {recording.audioUri && (
          <View style={styles.playbackCard}>
            <Text style={styles.sectionTitle}>Playback</Text>
            <PlaybackControls
              playbackState={playbackState}
              position={position}
              duration={duration}
              onPlay={play}
              onPause={pause}
              onStop={stop}
              onSeek={seek}
            />
          </View>
        )}

        <View style={styles.metricsCard}>
          <Text style={styles.sectionTitle}>Voice Metrics</Text>
          <Text style={styles.metricsSubtitle}>Average values from this recording</Text>
          <VoiceMetrics metrics={recording.averageMetrics} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  topBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 15,
    color: '#8E8E93',
  },
  infoCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  infoLabel: {
    fontSize: 16,
    color: '#8E8E93',
  },
  infoValue: {
    fontSize: 16,
    color: '#000000',
    fontWeight: '500',
    maxWidth: '60%',
    textAlign: 'right',
  },
  playbackCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  metricsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  metricsSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 16,
  },
});
