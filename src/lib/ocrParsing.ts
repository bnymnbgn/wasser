import type { WaterAnalysisValues } from "@/src/domain/types";

export interface ValidationResult {
  valid: boolean;
  warning?: string;
}

const VALUE_RANGES: Record<
  keyof WaterAnalysisValues,
  { min: number; max: number; typical: string }
> = {
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
  const getNumber = (regex: RegExp): number | undefined => {
    const match = text.match(regex);
    if (!match?.[1]) return undefined;
    const val = parseFloat(match[1].replace(",", "."));
    return Number.isFinite(val) ? val : undefined;
  };

  return {
    ph: getNumber(/pH[\-Wert]*[:\s]*([0-9]+[.,]?[0-9]*)/i),
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
