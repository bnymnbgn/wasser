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
