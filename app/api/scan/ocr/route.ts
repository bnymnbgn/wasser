import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { calculateScores } from "@/src/domain/scoring";
import type { ProfileType, WaterAnalysisValues, ScanResult } from "@/src/domain/types";
import { mapPrismaScanResult } from "@/src/domain/mappers";
import { parseTextToAnalysis, validateValue } from "@/src/lib/ocrParsing";
import { WaterAnalysisValuesSchema } from "@/src/lib/validation";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body) {
    return NextResponse.json(
      { error: "Ungültiger Request-Body." },
      { status: 400 }
    );
  }

  const text = typeof body.text === "string" ? body.text : "";
  const profile = (body.profile ?? "standard") as ProfileType;
  const providedValuesRaw = body.values;

  let providedValues: Partial<WaterAnalysisValues> | undefined;
  if (providedValuesRaw && typeof providedValuesRaw === "object") {
    const parsed = WaterAnalysisValuesSchema.partial().safeParse(providedValuesRaw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Übergebene Werte sind ungültig.", details: parsed.error.flatten() },
        { status: 400 }
      );
    }
    providedValues = parsed.data;
  }

  if (!text.trim() && !providedValues) {
    return NextResponse.json(
      { error: "Es müssen entweder ein Etikett-Text oder Werte übergeben werden." },
      { status: 400 }
    );
  }

  const ocrValues = text.trim() ? parseTextToAnalysis(text) : {};
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

  // 3) ScanResult in DB schreiben
  const prismaScan = await prisma.scanResult.create({
    data: {
      profile,
      timestamp: new Date(),
      ocrTextRaw: text || null,
      ocrParsedValues: Object.keys(ocrValues).length ? ocrValues : null,
      userOverrides: providedValues ?? null,
      score: scoreResult.totalScore,
      metricScores: scoreResult.metrics.reduce<Record<string, number>>(
        (acc, m) => {
          acc[m.metric] = m.score;
          return acc;
        },
        {}
      ),
      // waterSourceId / waterAnalysisId bleiben im OCR-MVP leer
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
  });
}
