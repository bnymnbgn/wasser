import type { WaterAnalysisValues } from '@/src/domain/types';

export function computeWaterHardness(values: Partial<WaterAnalysisValues>): number | null {
  const calcium = values.calcium;
  const magnesium = values.magnesium;
  if (typeof calcium !== 'number' || typeof magnesium !== 'number') {
    return null;
  }

  const hardness = calcium / 7.14 + magnesium / 4.32;
  return Number.isFinite(hardness) ? hardness : null;
}

export function computeCalciumMagnesiumRatio(
  calcium?: number,
  magnesium?: number
): number | null {
  if (typeof calcium !== 'number' || typeof magnesium !== 'number' || magnesium === 0) {
    return null;
  }
  const ratio = calcium / magnesium;
  return Number.isFinite(ratio) ? ratio : null;
}

export function computeSodiumPotassiumRatio(
  sodium?: number,
  potassium?: number
): number | null {
  if (typeof sodium !== 'number' || typeof potassium !== 'number' || potassium === 0) {
    return null;
  }
  const ratio = sodium / potassium;
  return Number.isFinite(ratio) ? ratio : null;
}

export function computeTasteBalance(values: Partial<WaterAnalysisValues>): number | null {
  const sulfate = values.sulfate ?? null;
  const chloride = values.chloride ?? null;
  const bicarbonate = values.bicarbonate ?? null;
  if (sulfate == null && chloride == null && bicarbonate == null) {
    return null;
  }
  const bitterLoad = (sulfate ?? 0) + (chloride ?? 0);
  const buffer = bicarbonate ?? 0;
  const softness = buffer / (bitterLoad + 1);
  return Number.isFinite(softness) ? softness : null;
}

export function computeBufferCapacity(values: Partial<WaterAnalysisValues>): number | null {
  const bicarbonate = values.bicarbonate;
  if (typeof bicarbonate !== 'number') {
    return null;
  }
  const capacity = bicarbonate / 61;
  return Number.isFinite(capacity) ? capacity : null;
}

export function computeDataQualityScore(values: Partial<WaterAnalysisValues>): number | null {
  const trackedKeys: (keyof WaterAnalysisValues)[] = [
    'ph',
    'calcium',
    'magnesium',
    'sodium',
    'potassium',
    'chloride',
    'sulfate',
    'bicarbonate',
    'nitrate',
    'totalDissolvedSolids',
  ];
  const total = trackedKeys.length;
  const present = trackedKeys.reduce((count, key) => {
    const value = values[key];
    return value != null ? count + 1 : count;
  }, 0);
  const score = total === 0 ? 0 : (present / total) * 100;
  return Number.isFinite(score) ? score : null;
}

export function computePralValue(values: Partial<WaterAnalysisValues>): number | null {
  const ca = values.calcium ?? 0;
  const mg = values.magnesium ?? 0;
  const na = values.sodium ?? 0;
  const cl = values.chloride ?? 0;
  const hco3 = values.bicarbonate ?? 0;
  const k = values.potassium ?? 0;

  // If no relevant values are present, return null
  if (
    values.calcium == null &&
    values.magnesium == null &&
    values.sodium == null &&
    values.chloride == null &&
    values.bicarbonate == null &&
    values.potassium == null
  ) {
    return null;
  }

  // Formula: PRAL = -0.013 * Ca - 0.026 * Mg + 0.001 * Na + 0.003 * Cl - 0.002 * HCO3 - 0.004 * K
  const pral =
    -0.013 * ca - 0.026 * mg + 0.001 * na + 0.003 * cl - 0.002 * hco3 - 0.004 * k;

  return Number.isFinite(pral) ? pral : null;
}

// D-A-CH Reference Values (Adults, approximate average)
export const RDA_VALUES = {
  calcium: 1000, // mg
  magnesium: 350, // mg (Men: 350, Women: 300)
  potassium: 4000, // mg
};

export function computeRdaPercentage(value: number | undefined, rda: number): number {
  if (value == null || rda <= 0) return 0;
  return Math.min((value / rda) * 100, 100);
}

export interface TasteProfile {
  salty: number;
  bitter: number;
  astringent: number;
  sweet: number;
  sparkling: number;
  softness: number;
}

export function computeTasteProfile(values: Partial<WaterAnalysisValues>): TasteProfile {
  const na = values.sodium ?? 0;
  const cl = values.chloride ?? 0;
  const mg = values.magnesium ?? 0;
  const so4 = values.sulfate ?? 0;
  const ca = values.calcium ?? 0;
  const hco3 = values.bicarbonate ?? 0;
  const tds = values.totalDissolvedSolids ?? (na + cl + mg + so4 + ca + hco3); // Approx if missing

  // Normalize values to 0-10 scale (approximate sensory thresholds)
  // Salty: Na > 200mg is salty. Cl contributes.
  const saltyScore = Math.min(((na / 200) * 0.7 + (cl / 200) * 0.3) * 10, 10);

  // Bitter: Mg > 100mg, SO4 > 250mg.
  const bitterScore = Math.min(((mg / 100) * 0.6 + (so4 / 250) * 0.4) * 10, 10);

  // Astringent (Dry): Ca > 150mg.
  const astringentScore = Math.min((ca / 150) * 10, 10);

  // Sweet/Neutral: HCO3 > 600mg gives a "full" taste, often perceived as sweet/neutral.
  // Low TDS also feels "neutral".
  // We'll use HCO3 as the main driver for "Sweet/Fullness".
  const sweetScore = Math.min((hco3 / 600) * 10, 10);

  // Sparkling: Unknown, default to 0 (Still)
  const sparklingScore = 0;

  // Softness: Inverse of Hardness.
  // Hardness (dH) approx: Ca / 7.14 + Mg / 4.32
  // 0 dH -> 10/10 Softness
  // 20 dH -> 0/10 Softness
  const hardness = (ca / 7.14) + (mg / 4.32);
  const softnessScore = Math.max(0, 10 - (hardness / 2));

  return {
    salty: Number(saltyScore.toFixed(1)),
    bitter: Number(bitterScore.toFixed(1)),
    astringent: Number(astringentScore.toFixed(1)),
    sweet: Number(sweetScore.toFixed(1)),
    sparkling: sparklingScore,
    softness: Number(softnessScore.toFixed(1)),
  };
}
