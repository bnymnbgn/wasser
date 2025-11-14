import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { calculateScores } from "@/src/domain/scoring";
import type { ProfileType, WaterAnalysisValues, ScanResult } from "@/src/domain/types";
import { mapPrismaScanResult } from "@/src/domain/mappers";

/**
 * Sehr simples Parsing des Etikett-Textes in Wasserwerte.
 * Alle Werte werden als mg/L interpretiert, pH dimensionslos.
 */
function parseTextToAnalysis(text: string): Partial<WaterAnalysisValues> {
  const getNumber = (regex: RegExp): number | undefined => {
    const match = text.match(regex);
    if (!match?.[1]) return undefined;
    const val = parseFloat(match[1].replace(",", "."));
    return isNaN(val) ? undefined : val;
  };

  return {
    ph: getNumber(/pH[:\s]*([0-9]+[.,]?[0-9]*)/i),
    calcium: getNumber(/(Kalzium|Calcium|Ca)[^0-9]*([0-9]+[.,]?[0-9]*)/i),
    magnesium: getNumber(/(Magnesium|Mg)[^0-9]*([0-9]+[.,]?[0-9]*)/i),
    sodium: getNumber(/(Natrium|Sodium|Na)[^0-9]*([0-9]+[.,]?[0-9]*)/i),
    nitrate: getNumber(/(Nitrat|Nitrate|NO3)[^0-9]*([0-9]+[.,]?[0-9]*)/i),
    bicarbonate: getNumber(
      /(Hydrogencarbonat|Bicarbonat|HCO3)[^0-9]*([0-9]+[.,]?[0-9]*)/i
    ),
    totalDissolvedSolids: getNumber(
      /(Gesamtmineralisation|TDS)[^0-9]*([0-9]+[.,]?[0-9]*)/i
    ),
  };
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body || typeof body.text !== "string") {
    return NextResponse.json(
      { error: "Body muss ein Feld 'text' (string) enthalten." },
      { status: 400 }
    );
  }

  const text = body.text as string;
  const profile = (body.profile ?? "standard") as ProfileType;

  if (!text.trim()) {
    return NextResponse.json(
      { error: "Etikett-Text darf nicht leer sein." },
      { status: 400 }
    );
  }

  // 1) Text -> Analysewerte (Teilmenge)
  const analysisValues = parseTextToAnalysis(text);

  // 2) Scoring berechnen
  const scoreResult = calculateScores(analysisValues, profile);

  // 3) ScanResult in DB schreiben
  const prismaScan = await prisma.scanResult.create({
    data: {
      profile,
      timestamp: new Date(),
      ocrTextRaw: text,
      ocrParsedValues: analysisValues,
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
  });

  // 4) Auf Domain-ScanResult mappen
  const domainScan: ScanResult = mapPrismaScanResult(prismaScan);

  // 5) Domain-Objekt zurückgeben
  return NextResponse.json(domainScan);
}