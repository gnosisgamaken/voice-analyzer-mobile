/**
 * Tests for Branded Metrics Engine
 */

import { VoiceMetrics } from '../../types';
import {
  calculateBrandedMetrics,
  calculateClarity,
  calculatePower,
  calculateHealth,
  calculateWarmth,
  calculateConfidence,
  calculateExpressiveness,
  calculateVoiceIQ,
  getMetricLabel,
  getBrandedMetricDetails,
  getTrendIndicator,
} from '../brandedMetricsEngine';

describe('Branded Metrics Engine', () => {
  // Sample voice metrics for testing
  const sampleMetrics: VoiceMetrics = {
    brightness: 2500,
    clarity: 75,
    richness: 80,
    energy: 0.7,
    pitchStability: 85,
    pitchRange: 8,
  };

  describe('Individual Metric Calculations', () => {
    it('should calculate clarity correctly', () => {
      const clarity = calculateClarity(sampleMetrics);
      expect(clarity).toBeGreaterThanOrEqual(0);
      expect(clarity).toBeLessThanOrEqual(100);
      expect(typeof clarity).toBe('number');
    });

    it('should calculate power correctly', () => {
      const power = calculatePower(sampleMetrics);
      expect(power).toBeGreaterThanOrEqual(0);
      expect(power).toBeLessThanOrEqual(100);
    });

    it('should calculate health correctly', () => {
      const health = calculateHealth(sampleMetrics);
      expect(health).toBeGreaterThanOrEqual(0);
      expect(health).toBeLessThanOrEqual(100);
    });

    it('should calculate warmth correctly', () => {
      const warmth = calculateWarmth(sampleMetrics);
      expect(warmth).toBeGreaterThanOrEqual(0);
      expect(warmth).toBeLessThanOrEqual(100);
    });

    it('should calculate confidence correctly', () => {
      const confidence = calculateConfidence(sampleMetrics);
      expect(confidence).toBeGreaterThanOrEqual(0);
      expect(confidence).toBeLessThanOrEqual(100);
    });

    it('should calculate expressiveness correctly', () => {
      const expressiveness = calculateExpressiveness(sampleMetrics);
      expect(expressiveness).toBeGreaterThanOrEqual(0);
      expect(expressiveness).toBeLessThanOrEqual(100);
    });
  });

  describe('Voice IQ Calculation', () => {
    it('should calculate Voice IQ composite correctly', () => {
      const brandedMetrics = calculateBrandedMetrics(sampleMetrics);
      expect(brandedMetrics.voiceIQ).toBeGreaterThanOrEqual(0);
      expect(brandedMetrics.voiceIQ).toBeLessThanOrEqual(100);
    });

    it('should apply consistency bonus when all metrics are healthy', () => {
      const highMetrics: VoiceMetrics = {
        brightness: 2800,
        clarity: 90,
        richness: 90,
        energy: 0.9,
        pitchStability: 90,
        pitchRange: 10,
      };
      
      const branded = calculateBrandedMetrics(highMetrics);
      
      // Verify metrics are being calculated
      expect(branded.clarity).toBeGreaterThanOrEqual(0);
      expect(branded.power).toBeGreaterThanOrEqual(0);
      expect(branded.health).toBeGreaterThanOrEqual(0);
      expect(branded.warmth).toBeGreaterThanOrEqual(0);
      expect(branded.confidence).toBeGreaterThanOrEqual(0);
      expect(branded.expressiveness).toBeGreaterThanOrEqual(0);
      
      // Voice IQ should be calculated and reasonable
      expect(branded.voiceIQ).toBeGreaterThan(50);
      expect(branded.voiceIQ).toBeLessThanOrEqual(100);
    });
  });

  describe('Complete Branded Metrics', () => {
    it('should calculate all branded metrics from voice metrics', () => {
      const branded = calculateBrandedMetrics(sampleMetrics);
      
      expect(branded).toHaveProperty('clarity');
      expect(branded).toHaveProperty('power');
      expect(branded).toHaveProperty('health');
      expect(branded).toHaveProperty('warmth');
      expect(branded).toHaveProperty('confidence');
      expect(branded).toHaveProperty('expressiveness');
      expect(branded).toHaveProperty('voiceIQ');
      
      // All should be valid 0-100 scores
      Object.values(branded).forEach(score => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
        expect(Number.isInteger(score)).toBe(true);
      });
    });

    it('should handle edge cases with missing metrics', () => {
      const emptyMetrics: VoiceMetrics = {};
      const branded = calculateBrandedMetrics(emptyMetrics);
      
      // Should still produce valid scores (defaulting to 0)
      Object.values(branded).forEach(score => {
        expect(score).toBeGreaterThanOrEqual(0);
        expect(score).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Metric Labels', () => {
    it('should return correct labels for different score ranges', () => {
      expect(getMetricLabel('clarity', 10)).toBe('Muffled');
      expect(getMetricLabel('clarity', 40)).toBe('Unclear');
      expect(getMetricLabel('clarity', 60)).toBe('Clear');
      expect(getMetricLabel('clarity', 80)).toBe('Very Clear');
      expect(getMetricLabel('clarity', 95)).toBe('Crystal Clear');
    });

    it('should return labels for all metric types', () => {
      const score = 75;
      
      expect(getMetricLabel('clarity', score)).toBe('Very Clear');
      expect(getMetricLabel('power', score)).toBe('Powerful');
      expect(getMetricLabel('health', score)).toBe('Very Healthy');
      expect(getMetricLabel('warmth', score)).toBe('Rich');
      expect(getMetricLabel('confidence', score)).toBe('Confident');
      expect(getMetricLabel('expressiveness', score)).toBe('Very Expressive');
      expect(getMetricLabel('voiceIQ', score)).toBe('Excellent');
    });
  });

  describe('Metric Details', () => {
    it('should return complete details for a metric', () => {
      const details = getBrandedMetricDetails('clarity', 85);
      
      expect(details).toHaveProperty('score', 85);
      expect(details).toHaveProperty('label', 'Very Clear');
      expect(details).toHaveProperty('description');
      expect(details).toHaveProperty('icon', '💎');
      expect(details).toHaveProperty('color');
      expect(details.description).toContain('understand');
    });

    it('should provide unique icons for each metric', () => {
      const clarity = getBrandedMetricDetails('clarity', 70);
      const power = getBrandedMetricDetails('power', 70);
      const health = getBrandedMetricDetails('health', 70);
      const warmth = getBrandedMetricDetails('warmth', 70);
      const confidence = getBrandedMetricDetails('confidence', 70);
      const expressiveness = getBrandedMetricDetails('expressiveness', 70);
      
      const icons = [
        clarity.icon,
        power.icon,
        health.icon,
        warmth.icon,
        confidence.icon,
        expressiveness.icon,
      ];
      
      // All icons should be unique
      const uniqueIcons = new Set(icons);
      expect(uniqueIcons.size).toBe(6);
    });
  });

  describe('Trend Indicators', () => {
    it('should identify upward trend', () => {
      const trend = getTrendIndicator(85, 75);
      
      expect(trend.direction).toBe('up');
      expect(trend.change).toBe(10);
      expect(trend.label).toContain('↑');
      expect(trend.label).toContain('+10');
    });

    it('should identify downward trend', () => {
      const trend = getTrendIndicator(65, 80);
      
      expect(trend.direction).toBe('down');
      expect(trend.change).toBe(-15);
      expect(trend.label).toContain('↓');
      expect(trend.label).toContain('-15');
    });

    it('should identify stable trend for small changes', () => {
      const trend = getTrendIndicator(75, 77);
      
      expect(trend.direction).toBe('stable');
      expect(trend.change).toBe(0);
      expect(trend.label).toContain('→');
      expect(trend.label).toContain('Stable');
    });

    it('should treat changes less than 3 points as stable', () => {
      expect(getTrendIndicator(75, 73).direction).toBe('stable');
      expect(getTrendIndicator(75, 76).direction).toBe('stable');
      expect(getTrendIndicator(78, 75).direction).toBe('up');
      expect(getTrendIndicator(72, 75).direction).toBe('down');
    });
  });

  describe('Score Normalization', () => {
    it('should produce scores that reflect voice quality', () => {
      // Poor voice metrics
      const poorMetrics: VoiceMetrics = {
        brightness: 1000,
        clarity: 20,
        richness: 15,
        energy: 0.2,
        pitchStability: 25,
        pitchRange: 2,
      };
      
      const poorBranded = calculateBrandedMetrics(poorMetrics);
      
      // Should produce generally low scores
      expect(poorBranded.voiceIQ).toBeLessThan(50);
    });

    it('should produce higher scores for excellent voice metrics', () => {
      const excellentMetrics: VoiceMetrics = {
        brightness: 3000,
        clarity: 95,
        richness: 95,
        energy: 0.9,
        pitchStability: 95,
        pitchRange: 12,
      };
      
      const excellentBranded = calculateBrandedMetrics(excellentMetrics);
      
      // Should produce generally high scores
      expect(excellentBranded.voiceIQ).toBeGreaterThan(70);
    });
  });
});
