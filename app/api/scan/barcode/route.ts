import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { calculateScores } from "@/src/domain/scoring";
import type { ProfileType, WaterAnalysisValues, ScanResult } from "@/src/domain/types";
import { mapPrismaScanResult } from "@/src/domain/mappers";
import {
  fetchProductByBarcode,
  mapOpenFoodFactsToWaterValues,
  hasAnyWaterValue,
  extractProductInfo,
  calculateReliabilityScore,
  applyWaterValueOverrides,
} from "@/src/lib/openfoodfacts";

/**
 * Sucht ein Wasserprodukt zuerst in der lokalen DB,
 * dann als Fallback in der OpenFoodFacts API.
 */
async function lookupWaterProduct(barcode: string): Promise<{
  source: {
    id: string;
    brand: string;
    productName: string;
    origin: string | null;
  };
  analysis: WaterAnalysisValues;
  fromCache: boolean;
} | null> {
  // 1. Suche in lokaler Datenbank
  const dbSource = await prisma.waterSource.findUnique({
    where: { barcode },
    include: {
      analyses: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (dbSource && dbSource.analyses.length > 0) {
    const analysis = dbSource.analyses[0];

    // Prüfe ob Analyse verwendbare Werte hat
    const values: Partial<WaterAnalysisValues> = {
      ph: analysis.ph ?? undefined,
      calcium: analysis.calcium ?? undefined,
      magnesium: analysis.magnesium ?? undefined,
      sodium: analysis.sodium ?? undefined,
      potassium: analysis.potassium ?? undefined,
      chloride: analysis.chloride ?? undefined,
      sulfate: analysis.sulfate ?? undefined,
      bicarbonate: analysis.bicarbonate ?? undefined,
      nitrate: analysis.nitrate ?? undefined,
      totalDissolvedSolids: analysis.totalDissolvedSolids ?? undefined,
    };

    if (hasAnyWaterValue(values)) {
      return {
        source: {
          id: dbSource.id,
          brand: dbSource.brand,
          productName: dbSource.productName,
          origin: dbSource.origin,
        },
        analysis: values as WaterAnalysisValues,
        fromCache: true,
      };
    }
  }

  // 2. Fallback: OpenFoodFacts API
  console.log(`Barcode ${barcode} not in cache, fetching from OpenFoodFacts...`);

  const offProduct = await fetchProductByBarcode(barcode);

  if (!offProduct) {
    return null; // Produkt nicht gefunden
  }

  // Extrahiere Wasserwerte
  let waterValues = mapOpenFoodFactsToWaterValues(offProduct.nutriments);
  waterValues = applyWaterValueOverrides(barcode, waterValues);

  if (!hasAnyWaterValue(waterValues)) {
    console.warn(`Product ${barcode} has no water analysis data`);
    return null;
  }

  // Extrahiere Produktinfo
  const productInfo = extractProductInfo(offProduct);
  const reliabilityScore = calculateReliabilityScore(offProduct);

  // 3. Speichere in DB für nächstes Mal (Cache)
  const newSource = await prisma.waterSource.upsert({
    where: { barcode },
    update: {
      brand: productInfo.brand,
      productName: productInfo.productName,
      origin: productInfo.origin,
    },
    create: {
      barcode,
      brand: productInfo.brand,
      productName: productInfo.productName,
      origin: productInfo.origin,
    },
  });

  // Speichere Analyse
  await prisma.waterAnalysis.create({
    data: {
      waterSourceId: newSource.id,
      sourceType: "api",
      reliabilityScore,
      analysisDate: new Date(),
      ph: waterValues.ph ?? null,
      calcium: waterValues.calcium ?? null,
      magnesium: waterValues.magnesium ?? null,
      sodium: waterValues.sodium ?? null,
      potassium: waterValues.potassium ?? null,
      chloride: waterValues.chloride ?? null,
      sulfate: waterValues.sulfate ?? null,
      bicarbonate: waterValues.bicarbonate ?? null,
      nitrate: waterValues.nitrate ?? null,
      totalDissolvedSolids: waterValues.totalDissolvedSolids ?? null,
    },
  });

  return {
    source: {
      id: newSource.id,
      brand: productInfo.brand,
      productName: productInfo.productName,
      origin: productInfo.origin,
    },
    analysis: waterValues as WaterAnalysisValues,
    fromCache: false,
  };
}

/**
 * POST /api/scan/barcode
 * Scannt einen Barcode und gibt Wasseranalyse + Score zurück
 */
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body || typeof body.barcode !== "string") {
    return NextResponse.json(
      { error: "Body muss ein Feld 'barcode' (string) enthalten." },
      { status: 400 }
    );
  }

  const barcode = body.barcode.trim();
  const profile = (body.profile ?? "standard") as ProfileType;

  if (!barcode) {
    return NextResponse.json(
      { error: "Barcode darf nicht leer sein." },
      { status: 400 }
    );
  }

  // Lookup in DB + OpenFoodFacts
  const lookup = await lookupWaterProduct(barcode);

  if (!lookup) {
    return NextResponse.json(
      {
        error:
          "Kein Wasser zu diesem Barcode gefunden. Das Produkt ist weder in unserer Datenbank noch bei OpenFoodFacts registriert.",
      },
      { status: 404 }
    );
  }

  // Berechne Score
  const scoreResult = calculateScores(lookup.analysis, profile);

  // Finde neueste Analyse für waterAnalysisId
  const latestAnalysis = await prisma.waterAnalysis.findFirst({
    where: { waterSourceId: lookup.source.id },
    orderBy: { createdAt: "desc" },
  });

  // Speichere ScanResult in DB
  const prismaScan = await prisma.scanResult.create({
    data: {
      barcode,
      profile,
      score: scoreResult.totalScore,
      metricScores: scoreResult.metrics.reduce<Record<string, number>>((acc, m) => {
        acc[m.metric] = m.score;
        return acc;
      }, {}),
      waterSourceId: lookup.source.id,
      waterAnalysisId: latestAnalysis?.id ?? null,
      ocrParsedValues: lookup.analysis,
    },
    include: {
      waterSource: true,
    },
  });

  // Mappe zu Domain-Objekt
  const domainScan: ScanResult = mapPrismaScanResult(prismaScan);

  return NextResponse.json({
    ...domainScan,
    fromCache: lookup.fromCache,
  });
}
