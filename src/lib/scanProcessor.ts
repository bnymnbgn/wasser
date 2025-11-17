/**
 * Local scan processing for Capacitor builds
 * Handles barcode and OCR scans using local SQLite database
 */

import { sqliteService } from '@/lib/sqlite';
import type { ProfileType, ScanResult, WaterAnalysisValues } from '@/src/domain/types';
import { calculateScores } from '@/src/domain/scoring';
import { deriveWaterInsights } from '@/src/domain/waterInsights';

/**
 * Process a barcode scan using local SQLite database
 */
export async function processBarcodeLocally(
  barcode: string,
  profile: ProfileType
): Promise<ScanResult> {
  // Find water source by barcode in local database
  const waterSourceWithAnalyses = await sqliteService.findWaterSourceByBarcode(barcode);

  if (!waterSourceWithAnalyses) {
    throw new Error('Barcode nicht in der Datenbank gefunden. Bitte verwende OCR-Scan.');
  }

  const { analyses, ...waterSource } = waterSourceWithAnalyses;
  const latestAnalysis = analyses[0];

  if (!latestAnalysis) {
    throw new Error('Keine Analysedaten für dieses Produkt verfügbar.');
  }

  // Build analysis values from database
  const analysisValues: WaterAnalysisValues = {
    ph: latestAnalysis.ph ?? undefined,
    calcium: latestAnalysis.calcium ?? undefined,
    magnesium: latestAnalysis.magnesium ?? undefined,
    sodium: latestAnalysis.sodium ?? undefined,
    potassium: latestAnalysis.potassium ?? undefined,
    chloride: latestAnalysis.chloride ?? undefined,
    sulfate: latestAnalysis.sulfate ?? undefined,
    bicarbonate: latestAnalysis.bicarbonate ?? undefined,
    nitrate: latestAnalysis.nitrate ?? undefined,
    totalDissolvedSolids: latestAnalysis.totalDissolvedSolids ?? undefined,
  };

  // Calculate scores
  const scoreResult = calculateScores(analysisValues, profile);
  const insights = deriveWaterInsights(analysisValues);

  // Save scan result to local database
  const scanRecord = await sqliteService.createScanResult({
    barcode,
    profile,
    score: scoreResult.totalScore,
    metricScores: JSON.stringify(scoreResult.metrics),
    ocrTextRaw: null,
    ocrParsedValues: null,
    userOverrides: null,
    waterSourceId: waterSource.id,
    waterAnalysisId: latestAnalysis.id,
  });

  // Return scan result in domain format
  return {
    id: scanRecord.id,
    timestamp: new Date(scanRecord.timestamp),
    barcode,
    profile,
    score: scoreResult.totalScore,
    metricDetails: scoreResult.metrics,
    insights,
    productInfo: {
      brand: waterSource.brand,
      productName: waterSource.productName,
      origin: waterSource.origin ?? undefined,
      barcode: waterSource.barcode ?? undefined,
    },
    ocrParsedValues: null,
    userOverrides: null,
  };
}

/**
 * Process an OCR scan using local SQLite database
 */
export async function processOCRLocally(
  ocrText: string,
  profile: ProfileType,
  parsedValues: Partial<WaterAnalysisValues>,
  brandName?: string,
  barcode?: string
): Promise<ScanResult> {
  let waterSourceId: string | null = null;
  let waterAnalysisId: string | null = null;
  let productInfo: ScanResult['productInfo'] = undefined;

  // If barcode provided, try to find existing water source
  if (barcode) {
    const existing = await sqliteService.findWaterSourceByBarcode(barcode);
    if (existing) {
      waterSourceId = existing.id;
      productInfo = {
        brand: existing.brand,
        productName: existing.productName,
        origin: existing.origin ?? undefined,
        barcode: existing.barcode ?? undefined,
      };
    }
  }

  // If we have brand name and no existing source, create new water source
  if (!waterSourceId && brandName) {
    const newSource = await sqliteService.createWaterSource({
      brand: brandName,
      productName: brandName, // Use brand as product name if not specified
      origin: null,
      barcode: barcode ?? null,
    });
    waterSourceId = newSource.id;
    productInfo = {
      brand: newSource.brand,
      productName: newSource.productName,
      origin: undefined,
      barcode: newSource.barcode ?? undefined,
    };
  }

  // If we have parsed values, create water analysis
  if (waterSourceId && Object.keys(parsedValues).length > 0) {
    const newAnalysis = await sqliteService.createWaterAnalysis({
      waterSourceId,
      analysisDate: null,
      sourceType: 'user', // User-provided via OCR
      reliabilityScore: 0.7, // OCR has lower reliability
      ph: parsedValues.ph ?? null,
      calcium: parsedValues.calcium ?? null,
      magnesium: parsedValues.magnesium ?? null,
      sodium: parsedValues.sodium ?? null,
      potassium: parsedValues.potassium ?? null,
      chloride: parsedValues.chloride ?? null,
      sulfate: parsedValues.sulfate ?? null,
      bicarbonate: parsedValues.bicarbonate ?? null,
      nitrate: parsedValues.nitrate ?? null,
      totalDissolvedSolids: parsedValues.totalDissolvedSolids ?? null,
    });
    waterAnalysisId = newAnalysis.id;
  }

  // Calculate scores
  const scoreResult = calculateScores(parsedValues, profile);
  const insights = deriveWaterInsights(parsedValues);

  // Save scan result
  const scanRecord = await sqliteService.createScanResult({
    barcode: barcode ?? null,
    profile,
    score: scoreResult.totalScore,
    metricScores: JSON.stringify(scoreResult.metrics),
    ocrTextRaw: ocrText,
    ocrParsedValues: JSON.stringify(parsedValues),
    userOverrides: null,
    waterSourceId,
    waterAnalysisId,
  });

  return {
    id: scanRecord.id,
    timestamp: new Date(scanRecord.timestamp),
    barcode: barcode,
    profile,
    score: scoreResult.totalScore,
    metricDetails: scoreResult.metrics,
    insights,
    productInfo,
    ocrParsedValues: parsedValues,
    userOverrides: null,
  };
}
