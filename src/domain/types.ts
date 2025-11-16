import type { MetricScore } from "./scoring";
import type { WaterInsights } from "./waterInsights";

/** Herkunft der Analysewerte */
export type SourceType = "manufacturer" | "authority" | "user" | "api";

/** Bewertungsprofil – steuert die Score-Logik */
export type ProfileType = "standard" | "baby" | "sport" | "blood_pressure";

/**
 * "Reine" Wasserwerte ohne DB-Felder – damit rechnet das Scoring.
 * Alle Werte in mg/L (außer pH).
 */
export interface WaterAnalysisValues {
  ph?: number;
  calcium?: number;
  magnesium?: number;
  sodium?: number;
  potassium?: number;
  chloride?: number;
  sulfate?: number;
  bicarbonate?: number;
  nitrate?: number;
  totalDissolvedSolids?: number;
}

/** Entspricht grob dem Prisma-Model WaterSource */
export interface WaterSource {
  id: string;
  brand: string;
  productName: string;
  origin?: string | null;
  barcode?: string | null;
  createdAt: string; // ISO-String
}

/** Entspricht grob dem Prisma-Model WaterAnalysis */
export interface WaterAnalysis extends WaterAnalysisValues {
  id: string;
  waterSourceId: string;
  analysisDate?: string | null; // ISO-String
  sourceType: SourceType;
  reliabilityScore: number; // 0–1
  createdAt: string; // ISO-String
}

/**
 * Frontend-/Domain-ScanResult – das benutzt du überall im UI.
 * Prisma-ScanResult wird darauf gemappt.
 */
export interface ScanResult {
  id: string;
  timestamp: string; // ISO-String

  profile: ProfileType;
  barcode?: string;

  score?: number;
  metricScores?: Record<string, number>;
  metricDetails?: MetricScore[];
  warnings?: string[];
  insights?: WaterInsights;

  ocrTextRaw?: string;
  ocrParsedValues?: Partial<WaterAnalysisValues>;
  userOverrides?: Partial<WaterAnalysisValues>;

  waterSourceId?: string;
  waterAnalysisId?: string;
  productInfo?: {
    brand?: string | null;
    productName?: string | null;
    origin?: string | null;
  };
}

/**
 * Hilfstyp: das, was dein Scoring als Input erwartet.
 * Kann direkt aus OCR, API oder User-Input kommen.
 */
export type ScoringInput = Partial<WaterAnalysisValues>;
