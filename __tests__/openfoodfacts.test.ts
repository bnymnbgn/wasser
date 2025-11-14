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
      calcium: 80,
      magnesium: 25,
      sodium: 15,
      nitrate: 5,
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
      bicarbonates: 250,
    };

    const result = mapOpenFoodFactsToWaterValues(nutriments);
    expect(result.bicarbonate).toBe(250);
  });

  it('should handle hydrogencarbonate as bicarbonate', () => {
    const nutriments = {
      hydrogencarbonate: 300,
    };

    const result = mapOpenFoodFactsToWaterValues(nutriments);
    expect(result.bicarbonate).toBe(300);
  });

  it('should handle residue_dry as totalDissolvedSolids', () => {
    const nutriments = {
      residue_dry: 450,
    };

    const result = mapOpenFoodFactsToWaterValues(nutriments);
    expect(result.totalDissolvedSolids).toBe(450);
  });

  it('should handle different unit suffixes', () => {
    const nutriments = {
      calcium_value: 80,
      magnesium_serving: 25,
      sodium_100g: 15,
    };

    const result = mapOpenFoodFactsToWaterValues(nutriments);

    expect(result.calcium).toBe(80);
    expect(result.magnesium).toBe(25);
    expect(result.sodium).toBe(15);
  });

  it('should normalize µg to mg', () => {
    const nutriments = {
      calcium: 80000,
      calcium_unit: 'µg',
    };

    const result = mapOpenFoodFactsToWaterValues(nutriments);
    expect(result.calcium).toBe(80); // 80000 µg = 80 mg
  });

  it('should normalize g to mg', () => {
    const nutriments = {
      calcium: 0.08,
      calcium_unit: 'g',
    };

    const result = mapOpenFoodFactsToWaterValues(nutriments);
    expect(result.calcium).toBe(80); // 0.08 g = 80 mg
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
