import type { WaterAnalysisValues } from "@/src/domain/types";

export interface ValidationResult {
  valid: boolean;
  warning?: string;
}

const VALUE_RANGES: Record<keyof WaterAnalysisValues, { min: number; max: number; typical: string }> = {
  ph: { min: 4, max: 10, typical: "6.5-8.5" },
  calcium: { min: 0, max: 1500, typical: "5-600 mg/L" },
  magnesium: { min: 0, max: 200, typical: "1-100 mg/L" },
  sodium: { min: 0, max: 500, typical: "1-200 mg/L" },
  potassium: { min: 0, max: 100, typical: "1-20 mg/L" },
  chloride: { min: 0, max: 500, typical: "1-250 mg/L" },
  sulfate: { min: 0, max: 3000, typical: "1-1500 mg/L" },
  nitrate: { min: 0, max: 100, typical: "0-50 mg/L" },
  bicarbonate: { min: 0, max: 2000, typical: "50-600 mg/L" },
  totalDissolvedSolids: { min: 0, max: 3000, typical: "50-1500 mg/L" },
};

const MINERAL_LABELS: Record<keyof WaterAnalysisValues, string[]> = {
  ph: ["ph", "p-h", "potential"],
  calcium: ["calcium", "kalzium", "ca", "ca2+", "ca2"],
  magnesium: ["magnesium", "mg", "mg2+", "mg2"],
  sodium: ["natrium", "sodium", "na", "na+", "na2+"],
  potassium: ["kalium", "potassium", "k", "k+", "k2+"],
  chloride: ["chlorid", "chloride", "cl", "cl-", "chl"],
  sulfate: ["sulfat", "sulfate", "sulphate", "so4", "so₄"],
  nitrate: ["nitrat", "nitrate", "no3", "no₃"],
  bicarbonate: ["hydrogencarbonat", "bicarbonat", "bikarbonat", "hco3", "hco₃"],
  totalDissolvedSolids: ["gesamthard", "gesamtmineralisation", "tds", "mineralstoffgehalt"],
};

const LEGACY_PATTERNS: Partial<Record<keyof WaterAnalysisValues, RegExp>> = {
  ph: /pH[\-Wert]*[:\s]*([0-9]+[.,]?[0-9]*)/i,
  calcium: /(?:Kalzium|Calcium|Ca2?\+?)[:\s]*([0-9]+[.,]?[0-9]*)/i,
  magnesium: /(?:Magnesium|Mg2?\+?)[:\s]*([0-9]+[.,]?[0-9]*)/i,
  sodium: /(?:Natrium|Sodium|Na\+?)[:\s]*([0-9]+[.,]?[0-9]*)/i,
  potassium: /(?:Kalium|Potassium|Kaliumhydrogencarbonat|K\+?)[:\s]*([0-9]+[.,]?[0-9]*)/i,
  chloride: /(?:Chlorid|Chloride|Cl-?)[:\s]*([0-9]+[.,]?[0-9]*)/i,
  sulfate: /(?:Sulfat|Sulphate|Sulfate|SO4)[:\s-]*([0-9]+[.,]?[0-9]*)/i,
  nitrate: /(?:Nitrat|Nitrate|NO3)[:\s-]*([0-9]+[.,]?[0-9]*)/i,
  bicarbonate: /(?:Hydrogencarbonat|Bicarbonat|Bikarbonat|HCO3)[:\s-]*([0-9]+[.,]?[0-9]*)/i,
  totalDissolvedSolids: /(?:Gesamtmineralisation|TDS|Mineralstoffgehalt)[:\s]*([0-9]+[.,]?[0-9]*)/i,
};

export function validateValue(
  metric: keyof WaterAnalysisValues,
  value: number
): ValidationResult {
  const range = VALUE_RANGES[metric];
  if (!range) return { valid: true };

  if (value < range.min || value > range.max) {
    return {
      valid: false,
      warning: `${metric}: ${value} liegt außerhalb des plausiblen Bereichs (typisch: ${range.typical}). Bitte prüfen.`,
    };
  }

  return { valid: true };
}

/**
 * Parsing des Etikett-Textes in Wasserwerte.
 * Alle Werte werden als mg/L interpretiert, pH dimensionslos.
 */
export function parseTextToAnalysis(text: string): Partial<WaterAnalysisValues> {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  const result: Partial<WaterAnalysisValues> = {};

  (Object.keys(MINERAL_LABELS) as Array<keyof WaterAnalysisValues>).forEach((metric) => {
    const parsedValue = findValueForMineral(lines, metric);
    if (typeof parsedValue === "number") {
      result[metric] = parsedValue;
    }
  });

  // Regex fallback for Labels, falls OCR nichts fuzzy findet.
  for (const [metric, regex] of Object.entries(LEGACY_PATTERNS) as Array<
    [keyof WaterAnalysisValues, RegExp]
  >) {
    if (result[metric] !== undefined) continue;
    const value = getNumberFromRegex(text, regex);
    if (value !== undefined) {
      result[metric] = value;
    }
  }

  return result;
}

function getNumberFromRegex(text: string, regex: RegExp): number | undefined {
  const match = text.match(regex);
  if (!match?.[1]) return undefined;
  const val = parseFloat(match[1].replace(",", "."));
  return Number.isFinite(val) ? val : undefined;
}

function findValueForMineral(
  lines: string[],
  mineralKey: keyof WaterAnalysisValues
): number | undefined {
  const searchTerms = MINERAL_LABELS[mineralKey] ?? [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const normalizedLine = normalizeLine(line);

    const includesTerm = searchTerms.some((term) => normalizedLine.includes(term));
    const words = normalizedLine.split(/[^a-z0-9+]+/).filter(Boolean);

    const fuzzyMatch =
      includesTerm ||
      words.some((word) =>
        searchTerms.some((term) => getLevenshteinDistance(word, term) <= Math.min(2, term.length / 2))
      );

    if (!fuzzyMatch) {
      continue;
    }

    const numberInLine = extractNumber(line);
    if (numberInLine !== undefined) {
      return numberInLine;
    }

    const nextLineNumber = extractNumber(lines[i + 1]);
    if (nextLineNumber !== undefined) {
      return nextLineNumber;
    }
  }

  return undefined;
}

function normalizeLine(line: string): string {
  return line
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function extractNumber(line?: string): number | undefined {
  if (!line) return undefined;
  const numberMatch = line.match(/(\d{1,4}(?:[.,]\d{1,2})?)/);
  if (!numberMatch?.[1]) return undefined;
  const value = parseFloat(numberMatch[1].replace(",", "."));
  return Number.isFinite(value) ? value : undefined;
}

function getLevenshteinDistance(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + 1
        );
      }
    }
  }

  return matrix[b.length][a.length];
}
