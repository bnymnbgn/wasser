import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { calculateScores } from "@/src/domain/scoring";
import type { ProfileType, WaterAnalysisValues, ScanResult } from "@/src/domain/types";
import { mapPrismaScanResult } from "@/src/domain/mappers";

/**
 * Validierungsergebnis für einen extrahierten Wert
 */
interface ValidationResult {
  valid: boolean;
  warning?: string;
}

/**
 * Validiert extrahierte Wasserwerte gegen plausible Bereiche.
 * Warnt bei ungewöhnlichen Werten, die auf OCR-Fehler hindeuten könnten.
 */
export function validateValue(
  metric: keyof WaterAnalysisValues,
  value: number
): ValidationResult {
  const ranges: Record<keyof WaterAnalysisValues, { min: number; max: number; typical: string }> = {
    ph: { min: 4, max: 10, typical: "6.5-8.5" },
    calcium: { min: 0, max: 500, typical: "5-200 mg/L" },
    magnesium: { min: 0, max: 200, typical: "1-100 mg/L" },
    sodium: { min: 0, max: 500, typical: "1-200 mg/L" },
    potassium: { min: 0, max: 100, typical: "1-20 mg/L" },
    chloride: { min: 0, max: 500, typical: "1-250 mg/L" },
    sulfate: { min: 0, max: 500, typical: "1-250 mg/L" },
    nitrate: { min: 0, max: 100, typical: "0-50 mg/L" },
    bicarbonate: { min: 0, max: 2000, typical: "50-600 mg/L" },
    totalDissolvedSolids: { min: 0, max: 3000, typical: "50-1500 mg/L" },
  };

  const range = ranges[metric];

  if (value < range.min || value > range.max) {
    return {
      valid: false,
      warning: `${metric}: ${value} liegt außerhalb des plausiblen Bereichs (typisch: ${range.typical}). Bitte manuell überprüfen.`,
    };
  }

  return { valid: true };
}

/**
 * Parsing des Etikett-Textes in Wasserwerte.
 * Alle Werte werden als mg/L interpretiert, pH dimensionslos.
 * Unterstützt verschiedene Schreibweisen und Einheiten.
 */
export function parseTextToAnalysis(text: string): Partial<WaterAnalysisValues> {
  const getNumber = (regex: RegExp): number | undefined => {
    const match = text.match(regex);
    if (!match?.[1]) return undefined;
    const val = parseFloat(match[1].replace(",", "."));
    return isNaN(val) ? undefined : val;
  };

  return {
    ph: getNumber(/pH[\-Wert]*[:\s]*([0-9]+[.,]?[0-9]*)/i),
    // Fixed: Use non-capturing groups (?:...) for labels
    calcium: getNumber(/(?:Kalzium|Calcium|Ca2?\+?)[:\s]*([0-9]+[.,]?[0-9]*)/i),
    magnesium: getNumber(/(?:Magnesium|Mg2?\+?)[:\s]*([0-9]+[.,]?[0-9]*)/i),
    sodium: getNumber(/(?:Natrium|Sodium|Na\+?)[:\s]*([0-9]+[.,]?[0-9]*)/i),
    potassium: getNumber(/(?:Kalium|Potassium|Kaliumhydrogencarbonat|K\+?)[:\s]*([0-9]+[.,]?[0-9]*)/i),
    chloride: getNumber(/(?:Chlorid|Chloride|Cl-?)[:\s]*([0-9]+[.,]?[0-9]*)/i),
    sulfate: getNumber(/(?:Sulfat|Sulphate|Sulfate|SO4)[:\s-]*([0-9]+[.,]?[0-9]*)/i),
    nitrate: getNumber(/(?:Nitrat|Nitrate|NO3)[:\s-]*([0-9]+[.,]?[0-9]*)/i),
    bicarbonate: getNumber(
      /(?:Hydrogencarbonat|Bicarbonat|Bikarbonat|HCO3)[:\s-]*([0-9]+[.,]?[0-9]*)/i
    ),
    totalDissolvedSolids: getNumber(
      /(?:Gesamtmineralisation|TDS|Mineralstoffgehalt)[:\s]*([0-9]+[.,]?[0-9]*)/i
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

  // 1.5) Validierung der extrahierten Werte
  const warnings: string[] = [];
  const validatedValues: Partial<WaterAnalysisValues> = {};

  for (const [key, value] of Object.entries(analysisValues)) {
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

  // 5) Domain-Objekt mit Warnungen zurückgeben
  return NextResponse.json({
    ...domainScan,
    warnings: warnings.length > 0 ? warnings : undefined,
  });
}