export type MetricKey =
  | 'clarity'
  | 'power'
  | 'health'
  | 'warmth'
  | 'confidence'
  | 'expressiveness'
  | 'voiceIQ';

export interface MetricDefinition {
  id: MetricKey;
  name: string;
  icon: string;
  color: string;
  tagline: string;
  description: string;
  benefits: string;
}

export const METRIC_DEFINITIONS: Record<MetricKey, MetricDefinition> = {
  clarity: {
    id: 'clarity',
    name: 'Voice Clarity',
    icon: '💎',
    color: '#5856D6',
    tagline: 'Crystal clear communication',
    description: 'Measures how crisp and easy-to-understand your voice sounds based on spectral balance and noise.',
    benefits: 'High clarity increases trust and comprehension.',
  },
  power: {
    id: 'power',
    name: 'Vocal Power',
    icon: '⚡',
    color: '#FF9500',
    tagline: 'Command the room',
    description: 'Reflects volume consistency, projection, and dynamic range of your delivery.',
    benefits: 'A strong voice captures attention and drives action.',
  },
  health: {
    id: 'health',
    name: 'Vocal Health',
    icon: '❤️',
    color: '#FF3B30',
    tagline: 'Endurance + resilience',
    description: 'Estimates vocal wellness using jitter, shimmer, and harmonic-to-noise ratio.',
    benefits: 'Healthy voices sound vibrant and sustain longer sessions.',
  },
  warmth: {
    id: 'warmth',
    name: 'Warmth',
    icon: '☀️',
    color: '#FFCC00',
    tagline: 'Friendly & approachable tone',
    description: 'Captures the perceived friendliness of your timbre via formants and spectral slope.',
    benefits: 'Warm tones create empathy and rapport.',
  },
  confidence: {
    id: 'confidence',
    name: 'Confidence',
    icon: '👑',
    color: '#AF52DE',
    tagline: 'Authoritative presence',
    description: 'Combines pitch stability, resonance, and pause cadence to infer confidence.',
    benefits: 'Confident voices inspire action and credibility.',
  },
  expressiveness: {
    id: 'expressiveness',
    name: 'Expressiveness',
    icon: '🔥',
    color: '#FF2D55',
    tagline: 'Emotion & storytelling',
    description: 'Measures vocal variety including pitch swings, tempo shifts, and intensity variance.',
    benefits: 'Expressive delivery keeps audiences engaged.',
  },
  voiceIQ: {
    id: 'voiceIQ',
    name: 'Voice IQ™',
    icon: '✨',
    color: '#007AFF',
    tagline: 'Your overall vocal effectiveness',
    description: 'Weighted composite of every metric plus consistency modifiers. 0-100 flagship score.',
    benefits: 'Track overall progression and benchmark against goals.',
  },
};
