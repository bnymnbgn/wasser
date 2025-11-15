import { describe, it, expect } from 'vitest';
import { calculateScores } from '../src/domain/scoring';
import type { WaterAnalysisValues, ProfileType } from '../src/domain/types';

describe('calculateScores', () => {
  describe('Standard profile', () => {
    const profile: ProfileType = 'standard';

    it('should calculate high score for optimal water values', () => {
      const values: Partial<WaterAnalysisValues> = {
        ph: 7.5,
        calcium: 80,
        magnesium: 25,
        sodium: 15,
        nitrate: 5,
        bicarbonate: 300,
        totalDissolvedSolids: 450,
      };

      const result = calculateScores(values, profile);

      expect(result.totalScore).toBeGreaterThan(80);
      expect(result.metrics).toHaveLength(10); // ph, sodium, nitrate, calcium, magnesium, potassium, chloride, sulfate, bicarbonate, tds
    });

    it('should calculate lower score for suboptimal pH', () => {
      const goodValues: Partial<WaterAnalysisValues> = {
        ph: 7.5,
        calcium: 80,
      };

      const badValues: Partial<WaterAnalysisValues> = {
        ph: 5.0, // Too acidic
        calcium: 80,
      };

      const goodResult = calculateScores(goodValues, profile);
      const badResult = calculateScores(badValues, profile);

      expect(goodResult.totalScore).toBeGreaterThan(badResult.totalScore);
    });

    it('should handle missing values gracefully', () => {
      const values: Partial<WaterAnalysisValues> = {
        ph: 7.5,
        // All other values undefined
      };

      const result = calculateScores(values, profile);

      expect(result.totalScore).toBeGreaterThanOrEqual(0);
      expect(result.totalScore).toBeLessThanOrEqual(100);
      expect(result.metrics).toHaveLength(10);
    });
  });

  describe('Baby profile', () => {
    const profile: ProfileType = 'baby';

    it('should prioritize low sodium for baby profile', () => {
      const lowSodium: Partial<WaterAnalysisValues> = {
        sodium: 5, // Very low sodium
        ph: 7.5,
      };

      const highSodium: Partial<WaterAnalysisValues> = {
        sodium: 100, // High sodium
        ph: 7.5,
      };

      const lowResult = calculateScores(lowSodium, profile);
      const highResult = calculateScores(highSodium, profile);

      // Baby profile should heavily penalize high sodium
      expect(lowResult.totalScore).toBeGreaterThan(highResult.totalScore);

      // Find sodium metric
      const lowSodiumMetric = lowResult.metrics.find(m => m.metric === 'sodium');
      const highSodiumMetric = highResult.metrics.find(m => m.metric === 'sodium');

      expect(lowSodiumMetric?.weight).toBe(2); // Higher weight for baby
      expect(lowSodiumMetric?.score).toBeGreaterThan(highSodiumMetric?.score || 0);
    });

    it('should prioritize low nitrate for baby profile', () => {
      const lowNitrate: Partial<WaterAnalysisValues> = {
        nitrate: 5,
        ph: 7.5,
      };

      const highNitrate: Partial<WaterAnalysisValues> = {
        nitrate: 45,
        ph: 7.5,
      };

      const lowResult = calculateScores(lowNitrate, profile);
      const highResult = calculateScores(highNitrate, profile);

      expect(lowResult.totalScore).toBeGreaterThan(highResult.totalScore);

      const lowNitrateMetric = lowResult.metrics.find(m => m.metric === 'nitrate');
      expect(lowNitrateMetric?.weight).toBe(2); // Higher weight for baby
    });
  });

  describe('Sport profile', () => {
    const profile: ProfileType = 'sport';

    it('should favor high mineral content for sport profile', () => {
      const highMinerals: Partial<WaterAnalysisValues> = {
        calcium: 150,
        magnesium: 80,
        bicarbonate: 600,
        ph: 7.5,
      };

      const lowMinerals: Partial<WaterAnalysisValues> = {
        calcium: 10,
        magnesium: 5,
        bicarbonate: 100,
        ph: 7.5,
      };

      const highResult = calculateScores(highMinerals, profile);
      const lowResult = calculateScores(lowMinerals, profile);

      expect(highResult.totalScore).toBeGreaterThan(lowResult.totalScore);

      // Check increased weights for sport-relevant minerals
      const calciumMetric = highResult.metrics.find(m => m.metric === 'calcium');
      const magnesiumMetric = highResult.metrics.find(m => m.metric === 'magnesium');
      const bicarbonateMetric = highResult.metrics.find(m => m.metric === 'bicarbonate');

      expect(calciumMetric?.weight).toBe(1.5);
      expect(magnesiumMetric?.weight).toBe(1.5);
      expect(bicarbonateMetric?.weight).toBe(1.2);
    });
  });

  describe('Blood pressure profile', () => {
    const profile: ProfileType = 'blood_pressure';

    it('should strongly penalize high sodium', () => {
      const lowSodium: Partial<WaterAnalysisValues> = {
        sodium: 10,
        ph: 7.5,
      };

      const highSodium: Partial<WaterAnalysisValues> = {
        sodium: 150,
        ph: 7.5,
      };

      const lowResult = calculateScores(lowSodium, profile);
      const highResult = calculateScores(highSodium, profile);

      // Should have significant difference due to high sodium weight
      // With more metrics (10 instead of 7), the difference is diluted slightly
      expect(lowResult.totalScore - highResult.totalScore).toBeGreaterThan(10);

      const sodiumMetric = lowResult.metrics.find(m => m.metric === 'sodium');
      expect(sodiumMetric?.weight).toBe(2); // Double weight
    });
  });

  describe('Metric scores', () => {
    it('should include all 10 metrics in results', () => {
      const values: Partial<WaterAnalysisValues> = {
        ph: 7.5,
      };

      const result = calculateScores(values, 'standard');

      expect(result.metrics).toHaveLength(10);
      expect(result.metrics.map(m => m.metric)).toContain('ph');
      expect(result.metrics.map(m => m.metric)).toContain('calcium');
      expect(result.metrics.map(m => m.metric)).toContain('magnesium');
      expect(result.metrics.map(m => m.metric)).toContain('sodium');
      expect(result.metrics.map(m => m.metric)).toContain('potassium');
      expect(result.metrics.map(m => m.metric)).toContain('chloride');
      expect(result.metrics.map(m => m.metric)).toContain('sulfate');
      expect(result.metrics.map(m => m.metric)).toContain('nitrate');
      expect(result.metrics.map(m => m.metric)).toContain('bicarbonate');
      expect(result.metrics.map(m => m.metric)).toContain('totalDissolvedSolids');
    });

    it('should provide explanations for each metric', () => {
      const values: Partial<WaterAnalysisValues> = {
        ph: 7.5,
        calcium: 80,
      };

      const result = calculateScores(values, 'standard');

      result.metrics.forEach(metric => {
        expect(metric.explanation).toBeTruthy();
        expect(typeof metric.explanation).toBe('string');
        expect(metric.explanation.length).toBeGreaterThan(10);
      });
    });

    it('should clamp scores between 0 and 100', () => {
      const extremeValues: Partial<WaterAnalysisValues> = {
        ph: 14, // Extreme value
        calcium: 1000, // Extreme value
        sodium: 1000, // Extreme value
      };

      const result = calculateScores(extremeValues, 'standard');

      expect(result.totalScore).toBeGreaterThanOrEqual(0);
      expect(result.totalScore).toBeLessThanOrEqual(100);

      result.metrics.forEach(metric => {
        expect(metric.score).toBeGreaterThanOrEqual(0);
        expect(metric.score).toBeLessThanOrEqual(100);
      });
    });
  });

  describe('Weighted scoring', () => {
    it('should apply different weights per profile', () => {
      const values: Partial<WaterAnalysisValues> = {
        sodium: 100,
        calcium: 80,
        ph: 7.5,
      };

      const standardResult = calculateScores(values, 'standard');
      const babyResult = calculateScores(values, 'baby');
      const sportResult = calculateScores(values, 'sport');

      // Get sodium weights
      const standardSodium = standardResult.metrics.find(m => m.metric === 'sodium');
      const babySodium = babyResult.metrics.find(m => m.metric === 'sodium');

      expect(babySodium?.weight).toBeGreaterThan(standardSodium?.weight || 0);

      // Get calcium weights
      const standardCalcium = standardResult.metrics.find(m => m.metric === 'calcium');
      const sportCalcium = sportResult.metrics.find(m => m.metric === 'calcium');

      expect(sportCalcium?.weight).toBeGreaterThan(standardCalcium?.weight || 0);
    });

    it('should calculate weighted average correctly', () => {
      const values: Partial<WaterAnalysisValues> = {
        ph: 7.5, // Should score ~100
      };

      const result = calculateScores(values, 'standard');

      // With only pH defined (score ~100, weight 1) and 6 other metrics (score 50, weights vary)
      // Total score should be between 50 and 100
      expect(result.totalScore).toBeGreaterThan(50);
      expect(result.totalScore).toBeLessThan(100);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty values object', () => {
      const result = calculateScores({}, 'standard');

      expect(result.totalScore).toBeCloseTo(50, 1); // All defaults to ~50 (floating point precision)
      expect(result.metrics).toHaveLength(10);
    });

    it('should handle undefined values for all metrics', () => {
      const values: Partial<WaterAnalysisValues> = {
        ph: undefined,
        calcium: undefined,
        magnesium: undefined,
        sodium: undefined,
        potassium: undefined,
        chloride: undefined,
        sulfate: undefined,
        nitrate: undefined,
        bicarbonate: undefined,
        totalDissolvedSolids: undefined,
      };

      const result = calculateScores(values, 'standard');

      expect(result.totalScore).toBeCloseTo(50, 1);
      result.metrics.forEach(metric => {
        expect(metric.score).toBe(50);
      });
    });

    it('should handle zero values', () => {
      const values: Partial<WaterAnalysisValues> = {
        calcium: 0,
        magnesium: 0,
        sodium: 0,
      };

      const result = calculateScores(values, 'standard');

      expect(result.totalScore).toBeGreaterThanOrEqual(0);
      expect(result.totalScore).toBeLessThanOrEqual(100);
    });
  });

  describe('Realistic water scenarios', () => {
    it('should give high score to premium mineral water (standard profile)', () => {
      const premiumWater: Partial<WaterAnalysisValues> = {
        ph: 7.5,
        calcium: 80,
        magnesium: 26,
        sodium: 10,
        potassium: 5,
        chloride: 10,
        sulfate: 20,
        nitrate: 3,
        bicarbonate: 280,
        totalDissolvedSolids: 400,
      };

      const result = calculateScores(premiumWater, 'standard');
      expect(result.totalScore).toBeGreaterThan(75); // Adjusted for more metrics
    });

    it('should give high score to baby-suitable water', () => {
      const babyWater: Partial<WaterAnalysisValues> = {
        ph: 7.0,
        calcium: 50,
        magnesium: 10,
        sodium: 5,
        potassium: 2,
        chloride: 5,
        sulfate: 10,
        nitrate: 2,
        bicarbonate: 150,
        totalDissolvedSolids: 220,
      };

      const result = calculateScores(babyWater, 'baby');
      expect(result.totalScore).toBeGreaterThan(70); // Adjusted for more metrics
    });

    it('should give high score to sports water', () => {
      const sportsWater: Partial<WaterAnalysisValues> = {
        ph: 7.5,
        calcium: 150,
        magnesium: 80,
        sodium: 50,
        potassium: 10,
        chloride: 30,
        sulfate: 40,
        nitrate: 5,
        bicarbonate: 600,
        totalDissolvedSolids: 1000,
      };

      const result = calculateScores(sportsWater, 'sport');
      expect(result.totalScore).toBeGreaterThan(70); // Adjusted for more metrics
    });
  });
});
