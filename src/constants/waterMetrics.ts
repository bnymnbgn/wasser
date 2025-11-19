import type { WaterAnalysisValues } from "@/src/domain/types";

export type WaterMetricKey = keyof WaterAnalysisValues;

export interface WaterMetricConfig {
  key: WaterMetricKey;
  label: string;
  unit?: string;
  derived?: boolean;
}

export const WATER_METRIC_FIELDS: WaterMetricConfig[] = [
  { key: "ph", label: "pH-Wert" },
  { key: "calcium", label: "Calcium", unit: "mg/L" },
  { key: "magnesium", label: "Magnesium", unit: "mg/L" },
  { key: "sodium", label: "Natrium", unit: "mg/L" },
  { key: "potassium", label: "Kalium", unit: "mg/L" },
  { key: "chloride", label: "Chlorid", unit: "mg/L" },
  { key: "sulfate", label: "Sulfat", unit: "mg/L" },
  { key: "nitrate", label: "Nitrat", unit: "mg/L" },
  { key: "bicarbonate", label: "Hydrogencarbonat", unit: "mg/L" },
  { key: "totalDissolvedSolids", label: "Gesamtmineralisation", unit: "mg/L" },
] as const;

const DISPLAY_DERIVED_METRICS: WaterMetricConfig[] = [
  { key: "hardness", label: "Wasserhärte", unit: "°dH", derived: true },
  { key: "calciumMagnesiumRatio", label: "Ca:Mg Verhältnis", unit: "" },
];

const EXTRA_METRIC_LABELS: WaterMetricConfig[] = [
  { key: "sodiumPotassiumRatio", label: "Na:K Verhältnis" },
  { key: "tastePalatability", label: "Geschmacksprofil" },
  { key: "bufferCapacity", label: "Pufferkapazität", unit: "mVal/L" },
  { key: "dataQualityScore", label: "Daten-Transparenz", unit: "%" },
];

export const WATER_METRIC_LABELS: Record<WaterMetricKey, string> = (() => {
  const labels = {} as Record<WaterMetricKey, string>;
  [...WATER_METRIC_FIELDS, ...DISPLAY_DERIVED_METRICS, ...EXTRA_METRIC_LABELS].forEach((field) => {
    labels[field.key] = field.label;
  });
  return labels;
})();

export const DERIVED_WATER_METRICS = DISPLAY_DERIVED_METRICS;
