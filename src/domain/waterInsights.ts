import type { ProfileType, WaterAnalysisValues } from "./types";

type MetricKey = keyof WaterAnalysisValues;

export interface InsightBadge {
  id: string;
  label: string;
  description: string;
  tone: "positive" | "info" | "warning";
}

export interface SynergyInsight {
  id: string;
  title: string;
  description: string;
  tone: "positive" | "info" | "warning";
}

export interface ProfileFit {
  status: "ideal" | "ok" | "avoid";
  reasons: string[];
}

export interface WaterInsights {
  badges: InsightBadge[];
  synergies: SynergyInsight[];
  profileFit: Record<ProfileType, ProfileFit>;
  calciumMagnesiumRatio?: number;
}

interface ThresholdRule {
  id: string;
  metric: MetricKey;
  label: string;
  description: string;
  tone: InsightBadge["tone"];
  min?: number;
  max?: number;
}

const REGULATORY_RULES: ThresholdRule[] = [
  {
    id: "calcium_high",
    metric: "calcium",
    label: "Calciumhaltig",
    description: "Mehr als 150 mg/L Calcium – entspricht der Min/TafelWV.",
    tone: "positive",
    min: 150,
  },
  {
    id: "magnesium_high",
    metric: "magnesium",
    label: "Magnesiumhaltig",
    description: "Mehr als 50 mg/L Magnesium – deckt ein gutes Stück des Tagesbedarfs.",
    tone: "positive",
    min: 50,
  },
  {
    id: "bicarbonate_high",
    metric: "bicarbonate",
    label: "Hydrogencarbonatreich",
    description: "Über 600 mg/L Hydrogencarbonat – starker Säurepuffer.",
    tone: "positive",
    min: 600,
  },
  {
    id: "bicarbonate_heal",
    metric: "bicarbonate",
    label: "Heilwasser-Puffer",
    description: "Über 1300 mg/L Hydrogencarbonat – klinische Evidenz bei Sodbrennen.",
    tone: "positive",
    min: 1300,
  },
  {
    id: "sulfate_high",
    metric: "sulfate",
    label: "Sulfathaltig",
    description: "Mehr als 200 mg/L Sulfat – traditionell verdauungsfördernd.",
    tone: "info",
    min: 200,
  },
  {
    id: "sodium_low",
    metric: "sodium",
    label: "Natriumarm",
    description: "Weniger als 20 mg/L Natrium – ideal für Babynahrung & Blutdruck.",
    tone: "positive",
    max: 20,
  },
  {
    id: "sodium_high",
    metric: "sodium",
    label: "Natriumhaltig",
    description: "Mehr als 200 mg/L Natrium – sportlicher Elektrolytboost.",
    tone: "info",
    min: 200,
  },
];

function isRuleSatisfied(value: number | undefined, rule: ThresholdRule): boolean {
  if (value == null) return false;
  if (rule.min != null && value < rule.min) return false;
  if (rule.max != null && value > rule.max) return false;
  return true;
}

function evaluateRegulatoryBadges(values: Partial<WaterAnalysisValues>): InsightBadge[] {
  const badges: InsightBadge[] = [];

  for (const rule of REGULATORY_RULES) {
    if (isRuleSatisfied(values[rule.metric], rule)) {
      badges.push({
        id: rule.id,
        label: rule.label,
        description: rule.description,
        tone: rule.tone,
      });
    }
  }

  return badges;
}

function evaluateCalciumMagnesiumRatio(
  calcium?: number,
  magnesium?: number
): SynergyInsight | undefined {
  if (calcium == null || magnesium == null || magnesium === 0) {
    return undefined;
  }

  const ratio = calcium / magnesium;
  if (ratio >= 1.6 && ratio <= 2.4) {
    return {
      id: "ca-mg-balanced",
      title: "Ausgewogenes Cal/Mg Verhältnis",
      description:
        "Das Verhältnis von Calcium zu Magnesium liegt nahe 2:1 – das gilt als günstig für Herz-Kreislauf und Muskelarbeit.",
      tone: "positive",
    };
  }

  if (ratio < 1.3) {
    return {
      id: "ca-mg-mag-high",
      title: "Magnesium dominiert",
      description:
        "Deutlich mehr Magnesium als Calcium – sehr mineralreich, kann geschmacklich intensiver wirken.",
      tone: "info",
    };
  }

  if (ratio > 3) {
    return {
      id: "ca-mg-calcium-heavy",
      title: "Calciumbetont",
      description:
        "Calcium überwiegt stark gegenüber Magnesium. Kombiniere das Wasser mit magnesiumreichen Quellen, wenn du Herz/Kreislauf unterstützen möchtest.",
      tone: "warning",
    };
  }

  return undefined;
}

function evaluateKidneyBalance(values: Partial<WaterAnalysisValues>): SynergyInsight | undefined {
  const calcium = values.calcium ?? 0;
  const magnesium = values.magnesium ?? 0;
  const bicarbonate = values.bicarbonate ?? 0;

  if (calcium >= 150 && magnesium >= 70 && bicarbonate >= 1300) {
    return {
      id: "kidney-balance",
      title: "Nierenstein-Schutzprofil",
      description:
        "Trotz hohem Calcium sorgen Magnesium und Hydrogencarbonat für natürliche Inhibitoren (zitratfördernd, Alkalisierung). Geeignet bei Calciumoxalat-Risiko.",
      tone: "positive",
    };
  }

  if (calcium >= 150 && magnesium < 30) {
    return {
      id: "kidney-risk",
      title: "Calciumreich ohne Gegenspieler",
      description:
        "Hoher Calciumwert bei wenig Magnesium. Bei Nierensteinrisiko lieber ein Wasser mit mehr Magnesium/HCO₃⁻ wählen.",
      tone: "warning",
    };
  }

  return undefined;
}

function evaluateSodbrennen(values: Partial<WaterAnalysisValues>): SynergyInsight | undefined {
  const bicarbonate = values.bicarbonate ?? 0;
  if (bicarbonate >= 1300) {
    return {
      id: "sodbrennen",
      title: "Säurepuffer (klinisch belegt)",
      description:
        "Über 1300 mg/L Hydrogencarbonat – Studien zeigen klare Vorteile bei Sodbrennen (STOMACH STILL).",
      tone: "positive",
    };
  }
  if (bicarbonate >= 600) {
    return {
      id: "magenfreundlich",
      title: "Magenfreundliches Wasser",
      description:
        "Hoher Hydrogencarbonatwert unterstützt die Neutralisation von Säuren – gut zur Regeneration nach Sport oder schwerem Essen.",
      tone: "info",
    };
  }
  return undefined;
}

function evaluateElectrolytes(values: Partial<WaterAnalysisValues>): SynergyInsight | undefined {
  const magnesium = values.magnesium ?? 0;
  const sodium = values.sodium ?? 0;
  if (magnesium >= 50 && sodium >= 50) {
    return {
      id: "electrolyte-boost",
      title: "Elektrolyt-Boost",
      description:
        "Magnesiumreich mit messbarem Natrium – ideal, um nach dem Training Mineralverluste zu kompensieren.",
      tone: "positive",
    };
  }
  if (magnesium >= 50) {
    return {
      id: "magnesium-power",
      title: "Magnesiumfokus",
      description: "Mehr als 50 mg/L Magnesium – deckt schnell den Muskelbedarf.",
      tone: "info",
    };
  }
  return undefined;
}

function evaluateProfileFit(values: Partial<WaterAnalysisValues>): Record<ProfileType, ProfileFit> {
  const nitrate = values.nitrate ?? null;
  const sodium = values.sodium ?? null;
  const magnesium = values.magnesium ?? null;
  const bicarbonate = values.bicarbonate ?? null;

  const fit: Record<ProfileType, ProfileFit> = {
    standard: { status: "ok", reasons: [] },
    baby: { status: "ok", reasons: [] },
    sport: { status: "ok", reasons: [] },
    blood_pressure: { status: "ok", reasons: [] },
  };

  // Baby fit
  if (sodium != null && sodium < 20 && nitrate != null && nitrate < 10) {
    fit.baby = { status: "ideal", reasons: ["Sehr natriumarm (<20 mg/L)", "Sehr niedriger Nitratwert (<10 mg/L)"] };
  } else if (
    sodium != null &&
    sodium < 50 &&
    nitrate != null &&
    nitrate < 25
  ) {
    fit.baby = { status: "ok", reasons: ["Akzeptabel für Babynahrung (unter 50 mg/L Na, unter 25 mg/L Nitrat)"] };
  } else {
    const reasons = [];
    if (sodium != null && sodium >= 50) reasons.push("Natrium zu hoch für Babynutzung (>50 mg/L).");
    if (nitrate != null && nitrate >= 25) reasons.push("Nitrat oberhalb der Baby-Empfehlung (>25 mg/L).");
    fit.baby = { status: "avoid", reasons: reasons.length ? reasons : ["Keine verlässlichen Werte für Babys."] };
  }

  // Sport fit
  if ((magnesium != null && magnesium >= 50) || (bicarbonate != null && bicarbonate >= 600)) {
    fit.sport = {
      status: "ideal",
      reasons: [
        ...(magnesium && magnesium >= 50 ? ["Magnesiumhaltig (>50 mg/L)."] : []),
        ...(bicarbonate && bicarbonate >= 600 ? ["Hydrogencarbonatreich (>600 mg/L) – Säurepuffer."] : []),
      ],
    };
  } else if ((magnesium != null && magnesium >= 20) || (bicarbonate != null && bicarbonate >= 300)) {
    fit.sport = { status: "ok", reasons: ["Moderate Mineralisierung – kombinierbar mit anderen Quellen."] };
  } else {
    fit.sport = { status: "avoid", reasons: ["Sehr niedrige Mineralisierung – kaum Mehrwert nach dem Training."] };
  }

  // Blood pressure fit
  if (sodium != null && sodium < 20) {
    fit.blood_pressure = { status: "ideal", reasons: ["Natriumarm (<20 mg/L)."] };
  } else if (sodium != null && sodium < 50) {
    fit.blood_pressure = { status: "ok", reasons: ["Moderater Natriumwert (<50 mg/L)."] };
  } else {
    fit.blood_pressure = {
      status: "avoid",
      reasons: ["Natriumreich (>50 mg/L) – nicht optimal bei Hypertonie."],
    };
  }

  return fit;
}

export function deriveWaterInsights(values: Partial<WaterAnalysisValues>): WaterInsights {
  const badges = evaluateRegulatoryBadges(values);

  const synergies: SynergyInsight[] = [];
  const caMgInsight = evaluateCalciumMagnesiumRatio(values.calcium, values.magnesium);
  if (caMgInsight) synergies.push(caMgInsight);

  const kidney = evaluateKidneyBalance(values);
  if (kidney) synergies.push(kidney);

  const reflux = evaluateSodbrennen(values);
  if (reflux) synergies.push(reflux);

  const electrolyte = evaluateElectrolytes(values);
  if (electrolyte) synergies.push(electrolyte);

  const profileFit = evaluateProfileFit(values);

  return {
    badges,
    synergies,
    profileFit,
    calciumMagnesiumRatio:
      values.calcium && values.magnesium ? values.calcium / values.magnesium : undefined,
  };
}
