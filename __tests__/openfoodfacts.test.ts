import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  mapOpenFoodFactsToWaterValues,
  hasAnyWaterValue,
  extractProductInfo,
  calculateReliabilityScore,
  fetchProductByBarcode,
  type OpenFoodFactsProduct,
} from '../src/lib/openfoodfacts';

describe('mapOpenFoodFactsToWaterValues', () => {
  it('should map basic nutriments correctly', () => {
    const nutriments = {
      ph: 7.5,
      calcium_serving: 80, // Use _serving for per-liter values
      magnesium_serving: 25,
      sodium_serving: 15,
      nitrate_serving: 5,
    };

    const result = mapOpenFoodFactsToWaterValues(nutriments);

    expect(result.ph).toBe(7.5);
    expect(result.calcium).toBe(80);
    expect(result.magnesium).toBe(25);
    expect(result.sodium).toBe(15);
    expect(result.nitrate).toBe(5);
  });

  it('should handle different field name variants', () => {
    const nutriments = {
      bicarbonates_100g: 25, // mg/100ml
    };

    const result = mapOpenFoodFactsToWaterValues(nutriments);
    expect(result.bicarbonate).toBe(250); // 25 × 10
  });

  it('should handle hydrogencarbonate as bicarbonate', () => {
    const nutriments = {
      hydrogencarbonate_100g: 30, // mg/100ml
    };

    const result = mapOpenFoodFactsToWaterValues(nutriments);
    expect(result.bicarbonate).toBe(300); // 30 × 10
  });

  it('should handle residue_dry as totalDissolvedSolids', () => {
    const nutriments = {
      residue_dry_100g: 45, // mg/100ml
    };

    const result = mapOpenFoodFactsToWaterValues(nutriments);
    expect(result.totalDissolvedSolids).toBe(450); // 45 × 10
  });

  it('should handle different unit suffixes', () => {
    const nutriments = {
      calcium_value: 80, // _value is lowest priority, assumed mg
      magnesium_serving: 25, // _serving is already per liter
      sodium_100g: 1.5, // _100g needs × 10 for mg/L
    };

    const result = mapOpenFoodFactsToWaterValues(nutriments);

    expect(result.calcium).toBe(80); // _value without unit stays as-is (lowest priority)
    expect(result.magnesium).toBe(25); // _serving stays as is
    expect(result.sodium).toBe(15); // 1.5 × 10 = 15
  });

  it('should prioritize _serving over _100g values', () => {
    const nutriments = {
      calcium_serving: 67, // 1L serving (correct)
      calcium_100g: 6.7, // 100ml value (would be × 10 = 67)
    };

    const result = mapOpenFoodFactsToWaterValues(nutriments);

    // Should use _serving value directly (not _100g × 10)
    expect(result.calcium).toBe(67);
  });

  it('should convert _100g values to mg/L (× 10)', () => {
    const nutriments = {
      calcium_100g: 6.7, // mg/100ml
      magnesium_100g: 2.6, // mg/100ml
      sodium_100g: 1.1, // mg/100ml
    };

    const result = mapOpenFoodFactsToWaterValues(nutriments);

    // All should be multiplied by 10 for mg/L
    expect(result.calcium).toBe(67); // 6.7 × 10
    expect(result.magnesium).toBe(26); // 2.6 × 10
    expect(result.sodium).toBe(11); // 1.1 × 10
  });

  it('should normalize µg to mg and then × 10 for _100g', () => {
    const nutriments = {
      calcium_100g: 80000,
      calcium_100g_unit: 'µg',
    };

    const result = mapOpenFoodFactsToWaterValues(nutriments);
    // 80000 µg = 80 mg, then × 10 for 100ml→1L = 800 mg/L
    expect(result.calcium).toBe(800);
  });

  it('should handle chloride and sulfate', () => {
    const nutriments = {
      chloride_100g: 0.8, // mg/100ml
      sulfate_100g: 2.9, // mg/100ml
    };

    const result = mapOpenFoodFactsToWaterValues(nutriments);

    expect(result.chloride).toBe(8); // 0.8 × 10
    expect(result.sulfate).toBe(29); // 2.9 × 10
  });

  it('should handle potassium', () => {
    const nutriments = {
      potassium_100g: 1.7, // mg/100ml
    };

    const result = mapOpenFoodFactsToWaterValues(nutriments);

    expect(result.potassium).toBe(17); // 1.7 × 10
  });

  it('should normalize g to mg and apply _100g conversion', () => {
    const nutriments = {
      calcium_100g: 0.008, // 0.008 g/100ml
      calcium_100g_unit: 'g',
    };

    const result = mapOpenFoodFactsToWaterValues(nutriments);
    // 0.008 g = 8 mg, then × 10 for 100ml→1L = 80 mg/L
    expect(result.calcium).toBe(80);
  });

  it('should handle empty nutriments', () => {
    const result = mapOpenFoodFactsToWaterValues(null);
    expect(result).toEqual({});
  });

  it('should handle missing values', () => {
    const nutriments = {
      ph: 7.5,
      // Other values missing
    };

    const result = mapOpenFoodFactsToWaterValues(nutriments);

    expect(result.ph).toBe(7.5);
    expect(result.calcium).toBeNull();
    expect(result.magnesium).toBeNull();
  });

  it('should handle invalid number values', () => {
    const nutriments = {
      calcium: 'invalid',
      magnesium: NaN,
      sodium: undefined,
    };

    const result = mapOpenFoodFactsToWaterValues(nutriments);

    expect(result.calcium).toBeNull();
    expect(result.magnesium).toBeNull();
    expect(result.sodium).toBeNull();
  });
});

describe('hasAnyWaterValue', () => {
  it('should return true if at least one value exists', () => {
    expect(hasAnyWaterValue({ ph: 7.5 })).toBe(true);
    expect(hasAnyWaterValue({ calcium: 80 })).toBe(true);
    expect(hasAnyWaterValue({ ph: 7.5, calcium: 80 })).toBe(true);
  });

  it('should return false if all values are null/undefined', () => {
    expect(hasAnyWaterValue({})).toBe(false);
    expect(hasAnyWaterValue({ ph: null, calcium: undefined })).toBe(false);
    expect(hasAnyWaterValue({ ph: null, calcium: null, sodium: null })).toBe(false);
  });

  it('should handle zero values correctly', () => {
    expect(hasAnyWaterValue({ nitrate: 0 })).toBe(true); // 0 is valid
  });
});

describe('extractProductInfo', () => {
  it('should extract basic product info', () => {
    const product: OpenFoodFactsProduct = {
      code: '1234567890123',
      product_name: 'Test Wasser',
      brands: 'Test Brand',
      countries: 'Germany',
    };

    const result = extractProductInfo(product);

    expect(result.brand).toBe('Test Brand');
    expect(result.productName).toBe('Test Wasser');
    expect(result.origin).toBe('Germany');
  });

  it('should handle multiple brands', () => {
    const product: OpenFoodFactsProduct = {
      code: '1234567890123',
      brands: 'Brand A, Brand B, Brand C',
    };

    const result = extractProductInfo(product);
    expect(result.brand).toBe('Brand A'); // Should use first brand
  });

  it('should use defaults for missing values', () => {
    const product: OpenFoodFactsProduct = {
      code: '1234567890123',
    };

    const result = extractProductInfo(product);

    expect(result.brand).toBe('Unbekannt');
    expect(result.productName).toBe('Unbenanntes Wasser');
    expect(result.origin).toBeNull();
  });

  it('should trim whitespace', () => {
    const product: OpenFoodFactsProduct = {
      code: '1234567890123',
      product_name: '  Test Wasser  ',
      brands: '  Test Brand  ',
      countries: '  Germany  ',
    };

    const result = extractProductInfo(product);

    expect(result.brand).toBe('Test Brand');
    expect(result.productName).toBe('Test Wasser');
    expect(result.origin).toBe('Germany');
  });
});

describe('calculateReliabilityScore', () => {
  it('should give base score of 0.5', () => {
    const product: OpenFoodFactsProduct = {
      code: '1234567890123',
    };

    expect(calculateReliabilityScore(product)).toBe(0.5);
  });

  it('should increase score for nutriscore', () => {
    const product: OpenFoodFactsProduct = {
      code: '1234567890123',
      nutriscore_grade: 'a',
    };

    expect(calculateReliabilityScore(product)).toBe(0.7); // 0.5 + 0.2
  });

  it('should increase score for brand', () => {
    const product: OpenFoodFactsProduct = {
      code: '1234567890123',
      brands: 'Test Brand',
    };

    expect(calculateReliabilityScore(product)).toBe(0.6); // 0.5 + 0.1
  });

  it('should increase score for country', () => {
    const product: OpenFoodFactsProduct = {
      code: '1234567890123',
      countries: 'Germany',
    };

    expect(calculateReliabilityScore(product)).toBe(0.6); // 0.5 + 0.1
  });

  it('should increase score for many nutriments', () => {
    const nutriments: any = {};
    for (let i = 0; i < 15; i++) {
      nutriments[`value${i}`] = i;
    }

    const product: OpenFoodFactsProduct = {
      code: '1234567890123',
      nutriments,
    };

    expect(calculateReliabilityScore(product)).toBe(0.6); // 0.5 + 0.1
  });

  it('should calculate maximum score correctly', () => {
    const nutriments: any = {};
    for (let i = 0; i < 15; i++) {
      nutriments[`value${i}`] = i;
    }

    const product: OpenFoodFactsProduct = {
      code: '1234567890123',
      nutriscore_grade: 'a',
      brands: 'Test Brand',
      countries: 'Germany',
      nutriments,
    };

    expect(calculateReliabilityScore(product)).toBeCloseTo(1.0, 5); // 0.5 + 0.2 + 0.1 + 0.1 + 0.1
  });

  it('should never exceed 1.0', () => {
    const nutriments: any = {};
    for (let i = 0; i < 100; i++) {
      nutriments[`value${i}`] = i;
    }

    const product: OpenFoodFactsProduct = {
      code: '1234567890123',
      nutriscore_grade: 'a',
      brands: 'Test Brand',
      countries: 'Germany',
      nutriments,
    };

    const score = calculateReliabilityScore(product);
    expect(score).toBeLessThanOrEqual(1.0);
    expect(score).toBeCloseTo(1.0, 5);
  });
});

describe('fetchProductByBarcode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch product successfully', async () => {
    const mockProduct = {
      code: '4008501011009',
      product_name: 'Gerolsteiner Naturell',
      brands: 'Gerolsteiner',
      countries: 'Germany',
      categories_tags: ['en:waters', 'en:mineral-waters'],
      nutriments: {
        ph: 7.1,
        calcium: 348,
      },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 1,
        product: mockProduct,
      }),
    });

    const result = await fetchProductByBarcode('4008501011009');

    expect(result).toEqual(mockProduct);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('4008501011009'),
      expect.objectContaining({
        headers: expect.objectContaining({
          'User-Agent': expect.stringContaining('TrinkwasserCheck'),
        }),
      })
    );
  });

  it('should return null for non-existent product', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 0,
        status_verbose: 'product not found',
      }),
    });

    const result = await fetchProductByBarcode('0000000000000');
    expect(result).toBeNull();
  });

  it('should return null for non-water products', async () => {
    const mockProduct = {
      code: '1234567890123',
      product_name: 'Coca Cola',
      categories_tags: ['en:beverages', 'en:sodas'],
      nutriments: {},
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 1,
        product: mockProduct,
      }),
    });

    const result = await fetchProductByBarcode('1234567890123');
    expect(result).toBeNull();
  });

  it('should handle API errors gracefully', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
    });

    const result = await fetchProductByBarcode('1234567890123');
    expect(result).toBeNull();
  });

  it('should handle network errors gracefully', async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error('Network error'));

    const result = await fetchProductByBarcode('1234567890123');
    expect(result).toBeNull();
  });

  it('should accept products with "wasser" tag', async () => {
    const mockProduct = {
      code: '1234567890123',
      product_name: 'Test Wasser',
      categories_tags: ['de:wasser', 'de:mineralwasser'],
      nutriments: { ph: 7.0 },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: 1,
        product: mockProduct,
      }),
    });

    const result = await fetchProductByBarcode('1234567890123');
    expect(result).toEqual(mockProduct);
  });
});
