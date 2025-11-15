import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, SafeAreaView, StatusBar } from 'react-native';
import { StoredRecording } from '../types';
import { getAllRecordings, deleteRecording } from '../utils/storage';
import type { NavigationProp } from '../navigation/SimpleNavigator';
import { formatTime, formatDate } from '../utils/formatting';
import { logger } from '../utils/logger';

interface RecordingsListScreenProps {
  navigation: NavigationProp;
}

export default function RecordingsListScreen({ navigation }: RecordingsListScreenProps) {
  const [recordings, setRecordings] = useState<StoredRecording[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRecordings = useCallback(async () => {
    try {
      const data = await getAllRecordings();
      setRecordings(data.sort((a, b) => b.timestamp - a.timestamp));
    } catch (error) {
      logger.error('Error loading recordings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRecordings();
  }, [loadRecordings]);

  const handleDelete = useCallback((recording: StoredRecording) => {
    Alert.alert(
      'Delete Recording',
      `Are you sure you want to delete "${recording.name}"?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRecording(recording.id);
              await loadRecordings();
            } catch (error) {
              logger.error('Error deleting recording:', error);
              Alert.alert('Error', 'Failed to delete recording');
            }
          },
        },
      ]
    );
  }, [loadRecordings]);

  const handleRecordingPress = useCallback((recording: StoredRecording) => {
    navigation.navigate('RecordingDetails', { recording });
  }, [navigation]);

  const renderRecording = ({ item }: { item: StoredRecording }) => (
    <TouchableOpacity 
      style={styles.recordingCard}
      onPress={() => handleRecordingPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.recordingInfo}>
        <Text style={styles.recordingName} numberOfLines={1}>
          {item.name}
        </Text>
        {item.averageBrandedMetrics?.voiceIQ ? (
          <View style={styles.voiceIqRow}>
            <Text style={styles.voiceIqLabel}>Voice IQ™</Text>
            <Text style={styles.voiceIqScore}>
              {item.averageBrandedMetrics.voiceIQ.value}
            </Text>
            <Text style={styles.voiceIqDescriptor}>
              {item.averageBrandedMetrics.voiceIQ.label}
            </Text>
          </View>
        ) : null}
        <Text style={styles.recordingDetails}>
          {formatDate(item.timestamp)} • {formatTime(item.duration)}
        </Text>
        {item.location?.formattedAddress && (
          <Text style={styles.recordingLocation} numberOfLines={1}>
            📍 {item.location.formattedAddress}
          </Text>
        )}
        <View style={styles.metricsPreview}>
          <MetricBadge label="Brightness" value={item.averageMetrics.brightness} />
          <MetricBadge label="Clarity" value={item.averageMetrics.clarity} />
          <MetricBadge label="Energy" value={item.averageMetrics.energy} />
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={(e) => {
          e.stopPropagation();
          handleDelete(item);
        }}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🎤</Text>
      <Text style={styles.emptyTitle}>No Recordings Yet</Text>
      <Text style={styles.emptySubtitle}>
        Start recording to see your voice analysis history
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <View style={styles.topBar}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>Recordings</Text>
        <Text style={styles.subtitle}>
          {recordings.length} {recordings.length === 1 ? 'recording' : 'recordings'}
        </Text>
      </View>

      <FlatList
        data={recordings}
        renderItem={renderRecording}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.listContent,
          recordings.length === 0 && styles.listContentEmpty,
        ]}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

function MetricBadge({ label, value }: { label: string; value: number }) {
  const percentage = Math.round(value * 100);
  
  return (
    <View style={styles.metricBadge}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{percentage}%</Text>
    </View>
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
  header: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  listContentEmpty: {
    flexGrow: 1,
  },
  recordingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  recordingInfo: {
    marginBottom: 12,
  },
  recordingName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 4,
  },
  recordingDetails: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 4,
  },
  recordingLocation: {
    fontSize: 13,
    color: '#007AFF',
    marginBottom: 8,
  },
  metricsPreview: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  voiceIqRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 4,
  },
  voiceIqLabel: {
    fontSize: 12,
    color: '#8E8E93',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  voiceIqScore: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
  },
  voiceIqDescriptor: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  metricBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  metricLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },
  metricValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000000',
    fontVariant: ['tabular-nums'],
  },
  deleteButton: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FF3B30',
    borderRadius: 8,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#8E8E93',
    textAlign: 'center',
  },
});
