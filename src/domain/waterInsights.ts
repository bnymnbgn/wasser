import type { ProfileType, WaterAnalysisValues } from "./types";
import {
  computeWaterHardness,
  computeCalciumMagnesiumRatio,
  computeSodiumPotassiumRatio,
  computeTasteBalance,
  computeBufferCapacity,
  computeDataQualityScore,
  computePralValue,
} from "@/src/lib/waterMath";

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
  hardness?: number;
  sodiumPotassiumRatio?: number;
  tastePalatability?: number;
  bufferCapacity?: number;
  dataQualityScore?: number;
  pral?: number;
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
    description:
      "Mehr als 150 mg/L Calcium (Min/TafelWV). Randomisierte Studien (Leibniz Uni Hannover) belegen: " +
      "Die Bioverfügbarkeit ist statistisch identisch zu Milch – aber kalorienfrei! " +
      "Essentiell für Knochen, Muskeln und Nervenimpulse. " +
      "Tipp: Bei Nierensteinrisiko auf ausreichend Magnesium & Hydrogencarbonat im selben Wasser achten (Inhibitoren).",
    tone: "positive",
    min: 150,
  },
  {
    id: "magnesium_high",
    metric: "magnesium",
    label: "Magnesiumhaltig",
    description:
      "Mehr als 50 mg/L Magnesium (Min/TafelWV). Klinische Evidenz: " +
      "Bioverfügbarkeit vergleichbar mit Vollkornbrot oder Supplementen (RCT-Studien). " +
      "Essentiell für Muskelfunktion, Energiestoffwechsel und Nervensystem. " +
      "Wissenschaftlicher Tipp: Über den Tag verteilt trinken steigert die Absorption um 56% (29% bei Bolus vs. 47.5% verteilt)!",
    tone: "positive",
    min: 50,
  },
  {
    id: "bicarbonate_high",
    metric: "bicarbonate",
    label: "Hydrogencarbonatreich",
    description:
      "Über 600 mg/L Hydrogencarbonat (Min/TafelWV). " +
      "Wirkt als natürlicher Säurepuffer (Alkalisierung) und fördert die Citratausscheidung – " +
      "gut für die Regeneration nach Sport oder schwerem Essen. " +
      "Hydrogencarbonat ist ein Schlüsselmineral für die Balance im Körper.",
    tone: "positive",
    min: 600,
  },
  {
    id: "bicarbonate_heal",
    metric: "bicarbonate",
    label: "Heilwasser-Puffer",
    description:
      "Über 1300 mg/L Hydrogencarbonat (Heilwasser-Standard). " +
      "Goldstandard-Evidenz: Die STOMACH STILL-Studie (multizentriert, doppelblind, placebokontrolliert) bewies " +
      "signifikante Überlegenheit bei Sodbrennen – 84.7% Responder-Rate vs. 63.5% Placebo (p=0.0003). " +
      "Klinisch wirksam zur Symptomreduktion bei Reflux (GERD).",
    tone: "positive",
    min: 1300,
  },
  {
    id: "sulfate_high",
    metric: "sulfate",
    label: "Sulfathaltig",
    description:
      "Mehr als 200 mg/L Sulfat (Min/TafelWV). " +
      "Traditionell und regulatorisch als verdauungsfördernd anerkannt. " +
      "Sulfat kann die Darmmotilität unterstützen – ideal morgens auf nüchternen Magen.",
    tone: "info",
    min: 200,
  },
  {
    id: "sodium_low",
    metric: "sodium",
    label: "Natriumarm",
    description:
      "Weniger als 20 mg/L Natrium (Min/TafelWV). " +
      "Vorteile: Ideal für Menschen mit Bluthochdruck (Hypertonie) oder natriumreduzierter Diät. " +
      "Perfekt für Babynahrung (Babys benötigen sehr wenig Natrium). " +
      "Kontext: Sportler nach intensivem Training profitieren eher von natriumhaltigem Wasser (Elektrolytersatz).",
    tone: "positive",
    max: 20,
  },
  {
    id: "sodium_high",
    metric: "sodium",
    label: "Natriumhaltig",
    description:
      "Mehr als 200 mg/L Natrium (Min/TafelWV). " +
      "Vorteil: Sportlicher Elektrolyt-Boost! Gleicht Natriumverluste durch Schweiß aus, besonders nach Training. " +
      "Kontext: Nicht empfohlen für Menschen mit Bluthochdruck oder Herzerkrankungen – diese sollten natriumarmes Wasser (<20 mg/L) wählen.",
    tone: "info",
    min: 200,
  },
  {
    id: "water_soft",
    metric: "hardness",
    label: "Sehr weiches Wasser",
    description:
      "Unter 8 °dH – kaum Kalkablagerungen, ideal für Kaffee, Tee und empfindliche Haushaltsgeräte. " +
      "Schonend für Haut und Geschmack, aber ggf. Calcium/Magnesium ergänzen.",
    tone: "positive",
    max: 8,
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
      title: "Optimales Ca:Mg-Verhältnis (Kardioprotektiv)",
      description:
        `Ca:Mg-Verhältnis von ${ratio.toFixed(1)}:1 liegt im optimalen Bereich (~2:1). ` +
        "Epidemiologische Studien (finnische Kohorte) zeigen: Ein Ca:Mg-Verhältnis von 2:1 oder mehr in hartem Wasser " +
        "wird mit verbesserter Blutdruckregulation und reduziertem kardiovaskulären Risiko assoziiert. " +
        "Meta-Analysen bestätigen: Verhältnis >1.7 bei Männern mit reduzierter Gesamtmortalität verbunden.",
      tone: "positive",
    };
  }

  if (ratio < 1.3) {
    return {
      id: "ca-mg-mag-high",
      title: "Magnesium-Dominanz (sehr mineralreich)",
      description:
        `Ca:Mg-Verhältnis von ${ratio.toFixed(1)}:1 – deutlich mehr Magnesium als Calcium. ` +
        "Sehr mineralreich, besonders gut für Sportler und Menschen mit Magnesiummangel. " +
        "Kann geschmacklich intensiver/bitter wirken. Optimal für Muskelregeneration und Energiestoffwechsel.",
      tone: "info",
    };
  }

  if (ratio > 3) {
    return {
      id: "ca-mg-calcium-heavy",
      title: "Calcium-Überschuss (Mg-Supplementierung erwägen)",
      description:
        `Ca:Mg-Verhältnis von ${ratio.toFixed(1)}:1 – Calcium überwiegt stark. ` +
        "Bei Nierensteinrisiko (Calciumoxalat) fehlen wichtige Inhibitoren. " +
        "Empfehlung: Mit magnesiumreichen Lebensmitteln (Nüsse, Vollkorn) oder anderem Wasser kombinieren, " +
        "um die kardiovaskuläre Balance zu optimieren.",
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
      title: "Nierenstein-Schutzprofil (Das Paradoxon)",
      description:
        `Trotz hohem Calcium (${calcium} mg/L) enthält dieses Wasser die entscheidenden Inhibitoren: ` +
        `Magnesium (${magnesium} mg/L) und Hydrogencarbonat (${bicarbonate} mg/L). ` +
        "Wissenschaft (Uni Bonn, PMID 14749747): Diese Kombination führt zu erhöhter Citrat-Ausscheidung und Urin-Alkalisierung – " +
        "beides hemmt die Calciumoxalat-Kristallisation. Netto-Effekt: Verringerte Übersättigung mit Calciumoxalat, " +
        "trotz erhöhter Calcium-Ausscheidung. Das 'Paradoxon' löst sich durch Synergie!",
      tone: "positive",
    };
  }

  if (calcium >= 150 && magnesium < 30) {
    return {
      id: "kidney-risk",
      title: "Calcium ohne Schutzfaktoren (Risiko bei Nierensteinen)",
      description:
        `Hoher Calciumwert (${calcium} mg/L) bei wenig Magnesium (${magnesium} mg/L). ` +
        "Die natürlichen Inhibitoren (Magnesium, Citrat) fehlen weitgehend. " +
        "Bei Nierensteinrisiko (Calciumoxalat-Bildner) ist ein Wasser mit hohem Magnesium (>70 mg/L) " +
        "und Hydrogencarbonat (>1300 mg/L) wissenschaftlich besser geeignet. " +
        "Alternativ: Mit magnesiumreichen Lebensmitteln kombinieren.",
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
      title: "Säurepuffer (Phase-III-Studie validiert)",
      description:
        `Über ${bicarbonate} mg/L Hydrogencarbonat – erfüllt Heilwasser-Standard. ` +
        "STOMACH STILL-Studie (multizentriert, doppelblind, placebokontrolliert): " +
        "84.7% der Patienten zeigten signifikante Symptomverbesserung bei Sodbrennen vs. 63.5% Placebo (p=0.0003). " +
        "Number Needed to Treat (NNT): 5. Klinisch wirksam bei GERD (Reflux).",
      tone: "positive",
    };
  }
  if (bicarbonate >= 600) {
    return {
      id: "magenfreundlich",
      title: "Magenfreundliches Wasser (Pufferwirkung)",
      description:
        `Hoher Hydrogencarbonatwert (${bicarbonate} mg/L) neutralisiert Magensäure. ` +
        "Gut zur Regeneration nach Sport (Laktatpuffer) oder schwerem Essen. " +
        "Fördert alkalischen Urin-pH und Citrat-Ausscheidung.",
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
      title: "Elektrolyt-Synergie (Sport & Training)",
      description:
        `Magnesium (${magnesium} mg/L) + Natrium (${sodium} mg/L) – perfekte Kombination nach dem Training. ` +
        "Gleicht Schweiß-bedingte Mineralverluste aus. " +
        "Wissenschaftlicher Tipp: Über den Tag verteilt trinken optimiert die Magnesiumabsorption (Steigerung um 56%)!",
      tone: "positive",
    };
  }
  if (magnesium >= 50) {
    return {
      id: "magnesium-power",
      title: "Magnesium-Power (Muskel & Energie)",
      description:
        `${magnesium} mg/L Magnesium – kalorienfrei bioverfügbar (RCT-validiert). ` +
        "Deckt schnell den Muskelbedarf. Essentiell für ATP-Produktion (Energie) und Muskelentspannung. " +
        "Über den Tag verteilt trinken für maximale Absorption!",
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
  const potassium = values.potassium ?? null;
  const tds = values.totalDissolvedSolids ?? null;

  const fit: Record<ProfileType, ProfileFit> = {
    standard: { status: "ok", reasons: [] },
    baby: { status: "ok", reasons: [] },
    sport: { status: "ok", reasons: [] },
    blood_pressure: { status: "ok", reasons: [] },
    coffee: { status: "ok", reasons: [] },
    kidney: { status: "ok", reasons: [] },
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

  // Kidney fit
  if (
    sodium != null &&
    sodium < 20 &&
    (potassium == null || potassium < 5) &&
    (tds == null || tds < 120)
  ) {
    fit.kidney = {
      status: "ideal",
      reasons: ["Sehr natriumarm (<20 mg/L)", "Kalium <5 mg/L", "Niedrige Mineralisation"],
    };
  } else if (
    (sodium == null || sodium < 50) &&
    (potassium == null || potassium < 10) &&
    (tds == null || tds < 300)
  ) {
    fit.kidney = { status: "ok", reasons: ["Grundsätzlich natrium-/kaliumarm, Mineralisation moderat."] };
  } else {
    const reasons = [];
    if (sodium != null && sodium >= 50) reasons.push("Natrium erhöht für Nierenschonung.");
    if (potassium != null && potassium >= 10) reasons.push("Kalium erhöht für Nierenschonung.");
    if (tds != null && tds >= 300) reasons.push("Mineralisation relativ hoch.");
    fit.kidney = {
      status: "avoid",
      reasons: reasons.length ? reasons : ["Keine verlässlichen Werte für Nierenprofil."],
    };
  }

  return fit;
}

export function deriveWaterInsights(values: Partial<WaterAnalysisValues>): WaterInsights {
  const hardness = computeWaterHardness(values);
  const ratio = computeCalciumMagnesiumRatio(values.calcium, values.magnesium);
  const sodiumPotassiumRatio = computeSodiumPotassiumRatio(values.sodium, values.potassium);
  const tasteBalance = computeTasteBalance(values);
  const bufferCapacity = computeBufferCapacity(values);
  const dataQualityScore = computeDataQualityScore(values);
  const pral = computePralValue(values);
  const enrichedValues: Partial<WaterAnalysisValues> = {
    ...values,
    ...(hardness !== null ? { hardness } : {}),
    ...(ratio !== null ? { calciumMagnesiumRatio: ratio } : {}),
    ...(sodiumPotassiumRatio !== null ? { sodiumPotassiumRatio } : {}),
    ...(tasteBalance !== null ? { tastePalatability: tasteBalance } : {}),
    ...(bufferCapacity !== null ? { bufferCapacity } : {}),
    ...(dataQualityScore !== null ? { dataQualityScore } : {}),
    ...(pral !== null ? { pral } : {}),
  };

  const badges = evaluateRegulatoryBadges(enrichedValues);
  if (sodiumPotassiumRatio !== null) {
    if (sodiumPotassiumRatio <= 4) {
      badges.push({
        id: "sodium_potassium_balance",
        label: "Kalium gleicht Natrium aus",
        description:
          "Günstiges Na:K-Verhältnis – unterstützt Herz-Kreislauf-System trotz Natriumgehalt.",
        tone: "positive",
      });
    } else if (sodiumPotassiumRatio > 8) {
      badges.push({
        id: "sodium_potassium_warning",
        label: "Kaliumarm",
        description: "Sehr viel Natrium bei wenig Kalium – für Hypertoniker nicht ideal.",
        tone: "warning",
      });
    }
  }

  if (tasteBalance !== null) {
    if (tasteBalance >= 2) {
      badges.push({
        id: "taste_soft",
        label: "Weicher Geschmack",
        description: "Hydrogencarbonat dominiert Sulfat/Chlorid – schmeckt rund und mild.",
        tone: "positive",
      });
    } else if (tasteBalance < 0.5 && (values.sulfate ?? 0) > 150) {
      badges.push({
        id: "taste_bitter",
        label: "Kräftiger Geschmack",
        description: "Hohe Sulfat-/Chloridwerte im Verhältnis zu Hydrogencarbonat – eher würzig/bitter.",
        tone: "info",
      });
    }
  }

  if (bufferCapacity !== null && bufferCapacity >= 20) {
    badges.push({
      id: "buffer_high",
      label: "Basische Pufferung",
      description:
        "Hohe Hydrogencarbonatkapazität – neutralisiert Magensäure und unterstützt Regeneration.",
      tone: "positive",
    });
  }

  if (pral !== null && pral < 0) {
    badges.push({
      id: "pral_negative",
      label: "Basisch (PRAL)",
      description: `PRAL-Wert von ${pral.toFixed(1)} mEq/L. Wirkt basisch auf den Körper und unterstützt den Säure-Basen-Haushalt.`,
      tone: "positive",
    });
  }

  if (dataQualityScore !== null) {
    if (dataQualityScore >= 70) {
      badges.push({
        id: "data_transparent",
        label: "Transparente Analyse",
        description: "Mindestens 70% der Mineralienwerte sind angegeben – vertrauenswürdiges Etikett.",
        tone: "positive",
      });
    } else if (dataQualityScore < 40) {
      badges.push({
        id: "data_sparse",
        label: "Wenig Angaben",
        description: "Nur wenige Mineralienwerte verfügbar – schwer vergleichbar.",
        tone: "info",
      });
    }
  }

  if (values.nitrate == null) {
    badges.push({
      id: "nitrate_missing",
      label: "Nitrat unbekannt",
      description: "Nitratwert fehlt auf dem Etikett – für Babynahrung vorher prüfen.",
      tone: "warning",
    });
  }

  const synergies: SynergyInsight[] = [];
  const caMgInsight = evaluateCalciumMagnesiumRatio(values.calcium, values.magnesium);
  if (caMgInsight) synergies.push(caMgInsight);

  const kidney = evaluateKidneyBalance(values);
  if (kidney) synergies.push(kidney);

  const reflux = evaluateSodbrennen(values);
  if (reflux) synergies.push(reflux);

  const electrolyte = evaluateElectrolytes(values);
  if (electrolyte) synergies.push(electrolyte);

  const profileFit = evaluateProfileFit(enrichedValues);

  return {
    badges,
    synergies,
    profileFit,
    calciumMagnesiumRatio: ratio ?? enrichedValues.calciumMagnesiumRatio,
    hardness: hardness ?? undefined,
    sodiumPotassiumRatio: sodiumPotassiumRatio ?? undefined,
    tastePalatability: tasteBalance ?? undefined,
    bufferCapacity: bufferCapacity ?? undefined,
    dataQualityScore: dataQualityScore ?? undefined,
    pral: pral ?? undefined,
  };
}
