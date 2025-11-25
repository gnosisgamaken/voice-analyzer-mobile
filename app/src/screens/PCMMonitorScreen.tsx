import React, { useCallback, useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { startPCMStreaming, isPCMStreamingSupported } from '../native/pcmStreamer';
import { Typography } from '../design/typography';
import { DesignTokens } from '../design/tokens';

export default function PCMMonitorScreen() {
  const [logs, setLogs] = useState<string[]>([]);
  const [status, setStatus] = useState<'idle' | 'streaming' | 'unsupported'>('idle');
  const cleanupRef = useRef<null | (() => Promise<void> | void)>(null);

  useEffect(() => {
    if (!isPCMStreamingSupported()) {
      setStatus('unsupported');
    }
    return () => {
      if (cleanupRef.current) {
        void cleanupRef.current();
      }
    };
  }, []);

  const appendLog = useCallback((message: string) => {
    setLogs((prev) => [message, ...prev].slice(0, 50));
  }, []);

  const handleStart = useCallback(async () => {
    if (!isPCMStreamingSupported()) {
      appendLog('PCM streaming not supported on this build.');
      return;
    }
    if (cleanupRef.current) {
      await cleanupRef.current();
      cleanupRef.current = null;
    }
    try {
      const cleanup = await startPCMStreaming(({ samples, sampleRate }) => {
        appendLog(`frame len=${samples.length} sr=${sampleRate}`);
      });
      if (cleanup) {
        cleanupRef.current = cleanup;
        setStatus('streaming');
      }
    } catch (error) {
      appendLog(`start failed: ${String(error)}`);
    }
  }, [appendLog]);

  const handleStop = useCallback(async () => {
    if (cleanupRef.current) {
      await cleanupRef.current();
      cleanupRef.current = null;
      setStatus('idle');
      appendLog('PCM streaming stopped.');
    }
  }, [appendLog]);

  return (
    <View style={styles.screen}>
      <Text style={styles.title}>PCM Monitor</Text>
      <Text style={styles.subtitle}>Status: {status}</Text>
      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={handleStart}>
          <Text style={styles.buttonText}>Start</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={handleStop}>
          <Text style={styles.buttonText}>Stop</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.logArea} contentContainerStyle={styles.logContent}>
        {logs.map((line, index) => (
          <Text style={styles.logLine} key={`${line}-${index}`}>
            {line}
          </Text>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: DesignTokens.colors.bgPrimary,
    padding: DesignTokens.spacing.md,
  },
  title: {
    ...Typography.largeTitle,
    color: DesignTokens.colors.textPrimary,
  },
  subtitle: {
    ...Typography.body,
    color: DesignTokens.colors.textSecondary,
    marginBottom: DesignTokens.spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: DesignTokens.spacing.sm,
    marginBottom: DesignTokens.spacing.md,
  },
  button: {
    flex: 1,
    backgroundColor: DesignTokens.colors.tint,
    paddingVertical: DesignTokens.spacing.sm,
    borderRadius: DesignTokens.radii.md,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
  logArea: {
    flex: 1,
    borderRadius: DesignTokens.radii.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: DesignTokens.isDarkMode ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.1)',
    backgroundColor: DesignTokens.colors.bgCard,
  },
  logContent: {
    padding: DesignTokens.spacing.sm,
    gap: DesignTokens.spacing.xs,
  },
  logLine: {
    ...Typography.caption2,
    color: DesignTokens.colors.textSecondary,
  },
});
