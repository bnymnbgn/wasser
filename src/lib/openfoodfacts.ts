import type { WaterAnalysisValues } from "@/src/domain/types";

/**
 * OpenFoodFacts API configuration
 */
const OFF_API_BASE = "https://world.openfoodfacts.org/api/v2";
const OFF_USER_AGENT = "TrinkwasserCheck/1.0 (contact@trinkwasser-check.de)";

/**
 * Hilfsfunktion: Konvertiert Werte zu Zahlen
 */
function toNumber(value: unknown): number | null {
  if (value === undefined || value === null) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

/**
 * Normalisiert Einheiten zu mg/L
 */
function normalizeUnit(value: number | null, rawUnit?: string): number | null {
  if (value === null) return null;
  if (!rawUnit) return value;

  const unit = rawUnit.toLowerCase();
  if (unit === "mg" || unit === "mg/l") return value;
  if (unit === "µg" || unit === "ug") return value / 1000; // µg → mg
  if (unit === "g" || unit === "g/l") return value * 1000; // g → mg
  return value;
}

/**
 * Liest einen Nährwert aus verschiedenen möglichen Feldern
 */
function readNutriment(nutriments: any, key: string): number | null {
  if (!nutriments) return null;

  const candidates = [
    nutriments[`${key}_value`],
    nutriments[`${key}_serving`],
    nutriments[key],
    nutriments[`${key}_100g`],
  ];

  const value = candidates.map(toNumber).find((v) => v !== null);
  if (value === undefined || value === null) return null;

  const unit =
    nutriments[`${key}_unit`] ??
    nutriments[`${key}_serving_unit`] ??
    nutriments[`${key}_100g_unit`];

  return normalizeUnit(value, unit);
}

/**
 * Mappt OpenFoodFacts Nutriments zu WaterAnalysisValues
 */
export function mapOpenFoodFactsToWaterValues(
  nutriments: any
): Partial<WaterAnalysisValues> {
  if (!nutriments) return {};

  return {
    ph: toNumber(nutriments.ph),
    calcium: readNutriment(nutriments, "calcium"),
    magnesium: readNutriment(nutriments, "magnesium"),
    sodium: readNutriment(nutriments, "sodium"),
    potassium: readNutriment(nutriments, "potassium"),
    bicarbonate:
      readNutriment(nutriments, "bicarbonates") ??
      readNutriment(nutriments, "hydrogencarbonate") ??
      readNutriment(nutriments, "bicarbonate"),
    nitrate: readNutriment(nutriments, "nitrate"),
    totalDissolvedSolids:
      readNutriment(nutriments, "residue_dry") ??
      readNutriment(nutriments, "dry_extract") ??
      readNutriment(nutriments, "total_dissolved_solids"),
  };
}

/**
 * Prüft ob mindestens ein Wasserwert vorhanden ist
 */
export function hasAnyWaterValue(values: Partial<WaterAnalysisValues>): boolean {
  return Object.values(values).some((value) => value !== null && value !== undefined);
}

/**
 * OpenFoodFacts Produkt-Response
 */
export interface OpenFoodFactsProduct {
  code: string;
  product_name?: string;
  brands?: string;
  countries?: string;
  nutriments?: any;
  nutriscore_grade?: string;
  categories_tags?: string[];
}

/**
 * OpenFoodFacts API Response
 */
interface OpenFoodFactsResponse {
  status: number;
  status_verbose: string;
  product?: OpenFoodFactsProduct;
}

/**
 * Fetcht ein einzelnes Produkt von OpenFoodFacts API per Barcode
 */
export async function fetchProductByBarcode(
  barcode: string
): Promise<OpenFoodFactsProduct | null> {
  try {
    const url = `${OFF_API_BASE}/product/${barcode}.json`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": OFF_USER_AGENT,
      },
    });

    if (!response.ok) {
      console.warn(`OpenFoodFacts API error: ${response.status}`);
      return null;
    }

    const data: OpenFoodFactsResponse = await response.json();

    // Status 0 = Produkt nicht gefunden
    if (data.status === 0 || !data.product) {
      return null;
    }

    // Prüfe ob es sich um Wasser handelt
    const isWater = data.product.categories_tags?.some(
      (tag) =>
        tag.includes("water") ||
        tag.includes("wasser") ||
        tag.includes("mineral-water") ||
        tag.includes("spring-water")
    );

    if (!isWater) {
      console.warn(`Product ${barcode} is not categorized as water`);
      return null;
    }

    return data.product;
  } catch (error) {
    console.error(`Failed to fetch product ${barcode} from OpenFoodFacts:`, error);
    return null;
  }
}

/**
 * Extrahiert Produktinformationen aus OpenFoodFacts Product
 */
export function extractProductInfo(product: OpenFoodFactsProduct): {
  brand: string;
  productName: string;
  origin: string | null;
} {
  const brand = product.brands ? product.brands.split(",")[0].trim() : "Unbekannt";
  const productName = product.product_name?.trim() || "Unbenanntes Wasser";
  const origin = product.countries?.trim() || null;

  return { brand, productName, origin };
}

/**
 * Berechnet Reliability Score basierend auf Datenqualität
 */
export function calculateReliabilityScore(product: OpenFoodFactsProduct): number {
  let score = 0.5; // Basis-Score

  // Hat Nutriscore → höhere Qualität
  if (product.nutriscore_grade) {
    score += 0.2;
  }

  // Hat Marke → höhere Qualität
  if (product.brands) {
    score += 0.1;
  }

  // Hat Herkunft → höhere Qualität
  if (product.countries) {
    score += 0.1;
  }

  // Hat viele Nährwerte → höhere Qualität
  if (product.nutriments) {
    const valueCount = Object.keys(product.nutriments).length;
    if (valueCount > 10) score += 0.1;
  }

  return Math.min(1.0, score); // Max 1.0
}
