import { describe, it, expect } from 'vitest';
import { parseTextToAnalysis, validateValue } from '../app/api/scan/ocr/route';

describe('parseTextToAnalysis', () => {
  describe('German labels', () => {
    it('should parse pH value', () => {
      const text = 'pH: 7.5';
      const result = parseTextToAnalysis(text);
      expect(result.ph).toBe(7.5);
    });

    it('should parse pH with comma decimal separator', () => {
      const text = 'pH: 7,5';
      const result = parseTextToAnalysis(text);
      expect(result.ph).toBe(7.5);
    });

    it('should parse Calcium in various formats', () => {
      expect(parseTextToAnalysis('Calcium: 80').calcium).toBe(80);
      expect(parseTextToAnalysis('Kalzium: 80').calcium).toBe(80);
      expect(parseTextToAnalysis('Ca: 80').calcium).toBe(80);
      expect(parseTextToAnalysis('Ca2+: 80').calcium).toBe(80);
    });

    it('should parse Magnesium in various formats', () => {
      expect(parseTextToAnalysis('Magnesium: 25').magnesium).toBe(25);
      expect(parseTextToAnalysis('Mg: 25').magnesium).toBe(25);
      expect(parseTextToAnalysis('Mg2+: 25').magnesium).toBe(25);
    });

    it('should parse Sodium in various formats', () => {
      expect(parseTextToAnalysis('Natrium: 15').sodium).toBe(15);
      expect(parseTextToAnalysis('Sodium: 15').sodium).toBe(15);
      expect(parseTextToAnalysis('Na: 15').sodium).toBe(15);
      expect(parseTextToAnalysis('Na+: 15').sodium).toBe(15);
    });

    it('should parse Nitrate in various formats', () => {
      expect(parseTextToAnalysis('Nitrat: 10').nitrate).toBe(10);
      expect(parseTextToAnalysis('Nitrate: 10').nitrate).toBe(10);
      expect(parseTextToAnalysis('NO3: 10').nitrate).toBe(10);
      expect(parseTextToAnalysis('NO3-: 10').nitrate).toBe(10);
    });

    it('should parse Bicarbonate in various formats', () => {
      expect(parseTextToAnalysis('Hydrogencarbonat: 250').bicarbonate).toBe(250);
      expect(parseTextToAnalysis('Bicarbonat: 250').bicarbonate).toBe(250);
      expect(parseTextToAnalysis('Bikarbonat: 250').bicarbonate).toBe(250);
      expect(parseTextToAnalysis('HCO3: 250').bicarbonate).toBe(250);
    });

    it('should parse TDS in various formats', () => {
      expect(parseTextToAnalysis('Gesamtmineralisation: 500').totalDissolvedSolids).toBe(500);
      expect(parseTextToAnalysis('TDS: 500').totalDissolvedSolids).toBe(500);
      expect(parseTextToAnalysis('Mineralstoffgehalt: 500').totalDissolvedSolids).toBe(500);
    });
  });

  describe('Number formats', () => {
    it('should handle decimal numbers with comma', () => {
      const text = 'pH: 7,5 Calcium: 80,5 mg/L';
      const result = parseTextToAnalysis(text);
      expect(result.ph).toBe(7.5);
      expect(result.calcium).toBe(80.5);
    });

    it('should handle decimal numbers with dot', () => {
      const text = 'pH: 7.5 Calcium: 80.5 mg/L';
      const result = parseTextToAnalysis(text);
      expect(result.ph).toBe(7.5);
      expect(result.calcium).toBe(80.5);
    });

    it('should handle integer numbers', () => {
      const text = 'pH: 7 Calcium: 80';
      const result = parseTextToAnalysis(text);
      expect(result.ph).toBe(7);
      expect(result.calcium).toBe(80);
    });
  });

  describe('Complete water label', () => {
    it('should parse a typical German water label', () => {
      const text = `
        Mineralstoffanalyse
        pH-Wert: 7,5
        Calcium: 80 mg/l
        Magnesium: 25 mg/l
        Natrium: 15 mg/l
        Nitrat: 5 mg/l
        Hydrogencarbonat: 250 mg/l
        Gesamtmineralisation: 450 mg/l
      `;

      const result = parseTextToAnalysis(text);

      expect(result.ph).toBe(7.5);
      expect(result.calcium).toBe(80);
      expect(result.magnesium).toBe(25);
      expect(result.sodium).toBe(15);
      expect(result.nitrate).toBe(5);
      expect(result.bicarbonate).toBe(250);
      expect(result.totalDissolvedSolids).toBe(450);
    });

    it('should handle partial labels with missing values', () => {
      const text = 'pH: 7.5 Calcium: 80';
      const result = parseTextToAnalysis(text);

      expect(result.ph).toBe(7.5);
      expect(result.calcium).toBe(80);
      expect(result.magnesium).toBeUndefined();
      expect(result.sodium).toBeUndefined();
    });
  });

  describe('Edge cases', () => {
    it('should return empty object for text without values', () => {
      const result = parseTextToAnalysis('This is random text');
      expect(result.ph).toBeUndefined();
      expect(result.calcium).toBeUndefined();
    });

    it('should handle empty string', () => {
      const result = parseTextToAnalysis('');
      expect(Object.values(result).every(v => v === undefined)).toBe(true);
    });

    it('should handle labels with extra whitespace', () => {
      const text = 'pH    :    7.5    Calcium    :    80';
      const result = parseTextToAnalysis(text);
      expect(result.ph).toBe(7.5);
      expect(result.calcium).toBe(80);
    });
  });
});

describe('validateValue', () => {
  describe('pH validation', () => {
    it('should accept valid pH values', () => {
      expect(validateValue('ph', 7.0).valid).toBe(true);
      expect(validateValue('ph', 6.5).valid).toBe(true);
      expect(validateValue('ph', 8.5).valid).toBe(true);
    });

    it('should reject out-of-range pH values', () => {
      const lowResult = validateValue('ph', 3.0);
      expect(lowResult.valid).toBe(false);
      expect(lowResult.warning).toContain('ph');

      const highResult = validateValue('ph', 12.0);
      expect(highResult.valid).toBe(false);
      expect(highResult.warning).toContain('ph');
    });
  });

  describe('Mineral validation', () => {
    it('should accept typical calcium values', () => {
      expect(validateValue('calcium', 80).valid).toBe(true);
      expect(validateValue('calcium', 150).valid).toBe(true);
    });

    it('should reject extreme calcium values', () => {
      const highResult = validateValue('calcium', 600);
      expect(highResult.valid).toBe(false);
      expect(highResult.warning).toContain('calcium');
    });

    it('should accept typical sodium values', () => {
      expect(validateValue('sodium', 15).valid).toBe(true);
      expect(validateValue('sodium', 100).valid).toBe(true);
    });

    it('should reject extreme sodium values', () => {
      const highResult = validateValue('sodium', 600);
      expect(highResult.valid).toBe(false);
    });
  });

  describe('Nitrate validation', () => {
    it('should accept safe nitrate levels', () => {
      expect(validateValue('nitrate', 5).valid).toBe(true);
      expect(validateValue('nitrate', 50).valid).toBe(true);
    });

    it('should reject dangerous nitrate levels', () => {
      const result = validateValue('nitrate', 150);
      expect(result.valid).toBe(false);
      expect(result.warning).toContain('nitrate');
    });
  });

  describe('TDS validation', () => {
    it('should accept typical TDS values', () => {
      expect(validateValue('totalDissolvedSolids', 200).valid).toBe(true);
      expect(validateValue('totalDissolvedSolids', 1000).valid).toBe(true);
    });

    it('should reject extreme TDS values', () => {
      const result = validateValue('totalDissolvedSolids', 5000);
      expect(result.valid).toBe(false);
    });
  });

  describe('Edge values', () => {
    it('should handle boundary values correctly', () => {
      expect(validateValue('ph', 4).valid).toBe(true);
      expect(validateValue('ph', 10).valid).toBe(true);
      expect(validateValue('ph', 3.9).valid).toBe(false);
      expect(validateValue('ph', 10.1).valid).toBe(false);
    });

    it('should handle zero values', () => {
      expect(validateValue('calcium', 0).valid).toBe(true);
      expect(validateValue('nitrate', 0).valid).toBe(true);
    });
  });
});
