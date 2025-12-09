import type { ProfileType, WaterAnalysisValues } from "@/src/domain/types";

type MetricKey = keyof WaterAnalysisValues;

export type TargetRange = {
  min: number;
  max: number;
  optimalMin: number;
  optimalMax: number;
};

/**
 * Zielbereiche pro Profil (an Scoring-Bands angelehnt).
 * Achtung: Nur Kernelemente (keine pH/TDS). UI-fallback rendert alte Karte, wenn kein Target existiert.
 */
export const PROFILE_TARGETS: Record<ProfileType, Partial<Record<MetricKey, TargetRange>>> = {
  baby: {
    calcium: { min: 20, max: 100, optimalMin: 30, optimalMax: 80 },
    magnesium: { min: 5, max: 50, optimalMin: 10, optimalMax: 30 },
    sodium: { min: 0, max: 20, optimalMin: 0, optimalMax: 10 },
    potassium: { min: 0, max: 10, optimalMin: 1, optimalMax: 5 },
    bicarbonate: { min: 100, max: 400, optimalMin: 150, optimalMax: 300 },
    sulfate: { min: 0, max: 200, optimalMin: 0, optimalMax: 50 },
    chloride: { min: 0, max: 50, optimalMin: 0, optimalMax: 20 },
    nitrate: { min: 0, max: 10, optimalMin: 0, optimalMax: 5 },
  },
  blood_pressure: {
    calcium: { min: 20, max: 200, optimalMin: 40, optimalMax: 120 },
    magnesium: { min: 5, max: 80, optimalMin: 10, optimalMax: 40 },
    sodium: { min: 0, max: 50, optimalMin: 0, optimalMax: 20 },
    potassium: { min: 0, max: 20, optimalMin: 1, optimalMax: 8 },
    bicarbonate: { min: 120, max: 500, optimalMin: 150, optimalMax: 350 },
    sulfate: { min: 0, max: 250, optimalMin: 0, optimalMax: 120 },
    chloride: { min: 0, max: 80, optimalMin: 0, optimalMax: 40 },
    nitrate: { min: 0, max: 25, optimalMin: 0, optimalMax: 10 },
  },
  sport: {
    calcium: { min: 50, max: 400, optimalMin: 150, optimalMax: 300 },
    magnesium: { min: 20, max: 200, optimalMin: 80, optimalMax: 150 },
    sodium: { min: 20, max: 200, optimalMin: 50, optimalMax: 150 },
    potassium: { min: 5, max: 50, optimalMin: 10, optimalMax: 30 },
    bicarbonate: { min: 200, max: 2000, optimalMin: 600, optimalMax: 1500 },
    sulfate: { min: 0, max: 500, optimalMin: 0, optimalMax: 200 },
    chloride: { min: 0, max: 200, optimalMin: 20, optimalMax: 100 },
    nitrate: { min: 0, max: 50, optimalMin: 0, optimalMax: 10 },
  },
  coffee: {
    calcium: { min: 40, max: 120, optimalMin: 50, optimalMax: 90 },
    magnesium: { min: 10, max: 60, optimalMin: 15, optimalMax: 40 },
    sodium: { min: 0, max: 50, optimalMin: 0, optimalMax: 20 },
    potassium: { min: 0, max: 20, optimalMin: 1, optimalMax: 10 },
    bicarbonate: { min: 40, max: 200, optimalMin: 60, optimalMax: 120 },
    sulfate: { min: 0, max: 80, optimalMin: 0, optimalMax: 30 },
    chloride: { min: 0, max: 80, optimalMin: 0, optimalMax: 30 },
    nitrate: { min: 0, max: 25, optimalMin: 0, optimalMax: 10 },
  },
  kidney: {
    calcium: { min: 0, max: 80, optimalMin: 0, optimalMax: 50 },
    magnesium: { min: 0, max: 40, optimalMin: 0, optimalMax: 25 },
    sodium: { min: 0, max: 20, optimalMin: 0, optimalMax: 10 },
    potassium: { min: 0, max: 10, optimalMin: 0, optimalMax: 5 },
    bicarbonate: { min: 50, max: 400, optimalMin: 80, optimalMax: 200 },
    sulfate: { min: 0, max: 150, optimalMin: 0, optimalMax: 50 },
    chloride: { min: 0, max: 50, optimalMin: 0, optimalMax: 20 },
    nitrate: { min: 0, max: 10, optimalMin: 0, optimalMax: 5 },
  },
  standard: {
    calcium: { min: 40, max: 200, optimalMin: 60, optimalMax: 160 },
    magnesium: { min: 10, max: 100, optimalMin: 20, optimalMax: 60 },
    sodium: { min: 0, max: 100, optimalMin: 0, optimalMax: 50 },
    potassium: { min: 0, max: 20, optimalMin: 1, optimalMax: 10 },
    bicarbonate: { min: 80, max: 600, optimalMin: 120, optimalMax: 350 },
    sulfate: { min: 0, max: 400, optimalMin: 0, optimalMax: 150 },
    chloride: { min: 0, max: 150, optimalMin: 0, optimalMax: 80 },
    nitrate: { min: 0, max: 25, optimalMin: 0, optimalMax: 10 },
  },
};
