import React from 'react';
import { View, Text, StyleSheet, StatusBar } from 'react-native';

export default function MainRecordingScreen() {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <Text style={styles.title}>Voice Analyzer</Text>
      <Text style={styles.subtitle}>Native Mobile App</Text>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderText}>🎤</Text>
        <Text style={styles.infoText}>Ready to build!</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 22,
    color: '#8E8E93',
    marginBottom: 40,
  },
  placeholder: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  placeholderText: {
    fontSize: 60,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
});
