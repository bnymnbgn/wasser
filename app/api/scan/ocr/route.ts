import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { Prisma } from "@prisma/client";
import { calculateScores } from "@/src/domain/scoring";
import { deriveWaterInsights } from "@/src/domain/waterInsights";
import type { WaterAnalysisValues, ScanResult } from "@/src/domain/types";
import { mapPrismaScanResult } from "@/src/domain/mappers";
import { parseTextToAnalysis, validateValue } from "@/src/lib/ocrParsing";
import { OcrRequestSchema, validateRequest } from "@/src/lib/validation";
import { checkRateLimit } from "@/src/lib/rateLimit";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = validateRequest(OcrRequestSchema, body);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error }, { status: 400 });
  }

  const clientIdentifier =
    req.ip ?? req.headers.get("x-forwarded-for") ?? "anonymous";
  const rate = await checkRateLimit(`ocr:${clientIdentifier}`);
  if (!rate.success) {
    return NextResponse.json(
      { error: "Zu viele Anfragen. Bitte versuche es in Kürze erneut." },
      { status: 429, headers: rate.headers }
    );
  }

  const { text, profile, values: providedValues, brand, productName, barcode } = parsed.data;
  const ocrText = text ?? "";

  const ocrValues = ocrText ? parseTextToAnalysis(ocrText) : {};
  const mergedValues: Partial<WaterAnalysisValues> = {
    ...ocrValues,
    ...(providedValues ?? {}),
  };

  const hasAnyValue = Object.values(mergedValues).some(
    (value) => value !== undefined && value !== null
  );

  if (!hasAnyValue) {
    return NextResponse.json(
      { error: "Es konnten keine Wasserwerte erkannt werden." },
      { status: 400 }
    );
  }

  // 1.5) Validierung der extrahierten Werte
  const warnings: string[] = [];
  const validatedValues: Partial<WaterAnalysisValues> = {};

  for (const [key, value] of Object.entries(mergedValues)) {
    if (value !== undefined) {
      const validation = validateValue(key as keyof WaterAnalysisValues, value);
      if (validation.valid) {
        validatedValues[key as keyof WaterAnalysisValues] = value;
      } else {
        warnings.push(validation.warning!);
        // Warnung, aber Wert trotzdem behalten für Transparenz
        validatedValues[key as keyof WaterAnalysisValues] = value;
      }
    }
  }

  // 2) Scoring berechnen
  const scoreResult = calculateScores(validatedValues, profile);
  const insights = deriveWaterInsights(validatedValues);

  // 2.5) WaterSource und WaterAnalysis erstellen/finden
  let waterSourceId: string | null = null;
  let waterAnalysisId: string | null = null;

  // Wenn Barcode vorhanden, versuche existierende Quelle zu finden
  if (barcode) {
    const existingSource = await prisma.waterSource.findUnique({
      where: { barcode },
    });
    if (existingSource) {
      waterSourceId = existingSource.id;
    }
  }

  // Wenn keine Quelle gefunden (oder kein Barcode), aber Marke angegeben -> neue Quelle anlegen
  if (!waterSourceId && brand) {
    const newSource = await prisma.waterSource.create({
      data: {
        brand,
        productName: productName || brand,
        barcode: barcode || null,
      },
    });
    waterSourceId = newSource.id;
  }

  // Wenn wir eine Quelle haben und Werte da sind -> Analyse anlegen
  if (waterSourceId && Object.keys(validatedValues).length > 0) {
    const newAnalysis = await prisma.waterAnalysis.create({
      data: {
        waterSourceId,
        sourceType: "user",
        reliabilityScore: 0.7,
        ph: validatedValues.ph ?? null,
        calcium: validatedValues.calcium ?? null,
        magnesium: validatedValues.magnesium ?? null,
        sodium: validatedValues.sodium ?? null,
        potassium: validatedValues.potassium ?? null,
        chloride: validatedValues.chloride ?? null,
        sulfate: validatedValues.sulfate ?? null,
        bicarbonate: validatedValues.bicarbonate ?? null,
        nitrate: validatedValues.nitrate ?? null,
        totalDissolvedSolids: validatedValues.totalDissolvedSolids ?? null,
      },
    });
    waterAnalysisId = newAnalysis.id;
  }

  // 3) ScanResult in DB schreiben
  const prismaScan = await prisma.scanResult.create({
    data: {
      profile,
      timestamp: new Date(),
      ocrTextRaw: ocrText || null,
      ocrParsedValues: Object.keys(ocrValues).length ? (ocrValues as any) : null,
      userOverrides: providedValues ? (providedValues as any) : null,
      score: scoreResult.totalScore,
      metricScores: scoreResult.metrics.reduce<Record<string, number>>(
        (acc, m) => {
          acc[m.metric] = m.score;
          return acc;
        },
        {}
      ),
      waterSourceId,
      waterAnalysisId,
      barcode: barcode || null,
    },
    include: {
      waterSource: true,
    },
  });

  // 4) Auf Domain-ScanResult mappen
  const domainScan: ScanResult = mapPrismaScanResult(prismaScan);

  // 5) Domain-Objekt mit Warnungen zurückgeben
  return NextResponse.json({
    ...domainScan,
    warnings: warnings.length > 0 ? warnings : undefined,
    metricDetails: scoreResult.metrics,
    insights,
  });
}
