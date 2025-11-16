import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, SafeAreaView, StatusBar } from 'react-native';
import { StoredRecording } from '../types';
import { getAllRecordings, deleteRecording } from '../utils/storage';
import type { NavigationProp } from '../navigation/SimpleNavigator';
import { formatTime, formatDate } from '../utils/formatting';
import { logger } from '../utils/logger';
import { getEmptyStateCopy } from '../content/microcopy';
import { calculateBrandedMetrics } from '../utils/brandedMetricsEngine';
import { getBaselineMetrics } from '../utils/baselineMetrics';
import { getTrendAnalysis, getTrendHistory } from '../utils/trendTracking';
import { generateInsights, type Insight } from '../utils/insightsEngine';

interface RecordingsListScreenProps {
  navigation: NavigationProp;
}

export default function RecordingsListScreen({ navigation }: RecordingsListScreenProps) {
  const [recordings, setRecordings] = useState<StoredRecording[]>([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState<Insight[]>([]);

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
  useEffect(() => {
    if (recordings.length === 0) {
      setInsights([]);
      return;
    }

    let isMounted = true;
    async function loadInsights() {
      try {
        const latestRecording = recordings[0];
        if (!latestRecording?.averageMetrics) {
          setInsights([]);
          return;
        }

        const latestMetrics = calculateBrandedMetrics(latestRecording.averageMetrics);
        const [baseline, trendAnalysis, history] = await Promise.all([
          getBaselineMetrics(),
          getTrendAnalysis(),
          getTrendHistory(30),
        ]);

        const generated = generateInsights({
          latestMetrics,
          baseline,
          trendAnalysis,
          history,
        });

        if (isMounted) {
          setInsights(generated);
        }
      } catch (error) {
        logger.warn('Failed to load insights', error);
      }
    }

    loadInsights();
    return () => {
      isMounted = false;
    };
  }, [recordings]);

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
    if (recording.processingStatus === 'processing') {
      Alert.alert('Processing', 'Hold on while we finish analyzing this session.');
      return;
    }
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
        {item.processingStatus === 'processing' ? (
          <View style={styles.processingBadge}>
            <Text style={styles.processingText}>Processing metrics…</Text>
          </View>
        ) : null}
        {item.averageBrandedMetrics?.voiceIQ && item.processingStatus !== 'processing' ? (
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
          <MetricBadge label="Brightness" value={item.averageMetrics?.brightness} />
          <MetricBadge label="Clarity" value={item.averageMetrics?.clarity} />
          <MetricBadge label="Energy" value={item.averageMetrics?.energy} />
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

  const renderEmpty = () => {
    const copy = getEmptyStateCopy('noRecordings');
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🎤</Text>
        <Text style={styles.emptyTitle}>{copy.title}</Text>
        <Text style={styles.emptySubtitle}>{copy.body}</Text>
        {copy.helper && <Text style={styles.emptyHelper}>{copy.helper}</Text>}
      </View>
    );
  };

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

      {insights.length > 0 && (
        <View style={styles.insightsCard}>
          <Text style={styles.insightsTitle}>Insights</Text>
          {insights.map(insight => (
            <View key={insight.id} style={styles.insightRow}>
              <View style={styles.insightBadge}>
                <Text style={styles.insightBadgeText}>{formatInsightLabel(insight.category)}</Text>
              </View>
              <View style={styles.insightCopy}>
                <Text style={styles.insightHeading}>{insight.title}</Text>
                <Text style={styles.insightDescription}>{insight.description}</Text>
              </View>
            </View>
          ))}
        </View>
      )}

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

function MetricBadge({ label, value }: { label: string; value?: number }) {
  const percentage =
    typeof value === 'number' ? `${Math.round(value * 100)}%` : '—';
  
  return (
    <View style={styles.metricBadge}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{percentage}</Text>
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
  insightsCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
  },
  insightsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000000',
    marginBottom: 8,
  },
  insightRow: {
    flexDirection: 'row',
    gap: 12,
    paddingVertical: 6,
  },
  insightBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(36,107,253,0.12)',
    alignSelf: 'flex-start',
  },
  insightBadgeText: {
    fontSize: 12,
    color: '#246BFD',
    fontWeight: '600',
  },
  insightCopy: {
    flex: 1,
    gap: 2,
  },
  insightHeading: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000000',
  },
  insightDescription: {
    fontSize: 14,
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
  processingBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#E5E5EA',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 4,
  },
  processingText: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '600',
    letterSpacing: 0.3,
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
  emptyHelper: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 6,
  },
});

function formatInsightLabel(category: Insight['category']): string {
  switch (category) {
    case 'whatsImproving':
      return 'Improving';
    case 'whatToWatch':
      return 'Watch';
    case 'streak':
      return 'Streak';
    case 'correlation':
      return 'Pattern';
    default:
      return 'Insight';
  }
}
