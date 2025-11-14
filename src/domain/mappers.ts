import type {
  ScanResult as PrismaScanResult,
  WaterAnalysis as PrismaWaterAnalysis,
  WaterSource as PrismaWaterSource,
} from "@prisma/client";

import type {
  ScanResult,
  WaterAnalysis,
  WaterSource,
  ProfileType,
  WaterAnalysisValues,
} from "./types";

/** Prisma WaterSource -> Domain WaterSource */
export function mapPrismaWaterSource(source: PrismaWaterSource): WaterSource {
  return {
    id: source.id,
    brand: source.brand,
    productName: source.productName,
    origin: source.origin,
    barcode: source.barcode,
    createdAt: source.createdAt.toISOString(),
  };
}

/** Prisma WaterAnalysis -> Domain WaterAnalysis */
export function mapPrismaWaterAnalysis(analysis: PrismaWaterAnalysis): WaterAnalysis {
  const values: WaterAnalysisValues = {
    ph: analysis.ph ?? undefined,
    calcium: analysis.calcium ?? undefined,
    magnesium: analysis.magnesium ?? undefined,
    sodium: analysis.sodium ?? undefined,
    potassium: analysis.potassium ?? undefined,
    bicarbonate: analysis.bicarbonate ?? undefined,
    nitrate: analysis.nitrate ?? undefined,
    totalDissolvedSolids: analysis.totalDissolvedSolids ?? undefined,
  };

  return {
    id: analysis.id,
    waterSourceId: analysis.waterSourceId,
    analysisDate: analysis.analysisDate?.toISOString() ?? null,
    sourceType: analysis.sourceType as any, // "manufacturer" | "authority" | "user" | "api"
    reliabilityScore: analysis.reliabilityScore,
    createdAt: analysis.createdAt.toISOString(),
    ...values,
  };
}

/** Prisma ScanResult -> Domain ScanResult */
export function mapPrismaScanResult(scan: PrismaScanResult): ScanResult {
  return {
    id: scan.id,
    timestamp: scan.timestamp.toISOString(),
    profile: scan.profile as ProfileType,
    barcode: scan.barcode ?? undefined,
    score: scan.score ?? undefined,
    metricScores: (scan.metricScores as any) ?? undefined,
    ocrTextRaw: scan.ocrTextRaw ?? undefined,
    ocrParsedValues: (scan.ocrParsedValues as any) ?? undefined,
    userOverrides: (scan.userOverrides as any) ?? undefined,
    waterSourceId: scan.waterSourceId ?? undefined,
    waterAnalysisId: scan.waterAnalysisId ?? undefined,
  };
}