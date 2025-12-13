import type { ProfileType, WaterAnalysisValues } from "./types";
import {
  computeWaterHardness,
  computeCalciumMagnesiumRatio,
  computeSodiumPotassiumRatio,
  computeTasteBalance,
  computeBufferCapacity,
  computeDataQualityScore,
} from "../lib/waterMath";

export interface MetricScore {
  metric: keyof WaterAnalysisValues;
  score: number;
  weight: number;
  explanation: string;
}

export interface ScoreResult {
  totalScore: number;
  metrics: MetricScore[];
}

// ---------------------------
// Hilfsfunktionen
// ---------------------------

function clampScore(x: number): number {
  return Math.max(0, Math.min(100, x));
}

function bellScore(value: number, ideal: number, tolerance: number): number {
  const dist = Math.abs(value - ideal);
  if (dist >= tolerance) return 0;
  const ratio = 1 - dist / tolerance;
  return clampScore(100 * ratio);
}

function bandScore(value: number, min: number, max: number): number {
  if (value < min) return clampScore((value / min) * 60);
  if (value > max) return clampScore((max / value) * 60);
  return 100;
}

function stepBands(
  value: number,
  bands: { limit: number; score: number }[],
  higherIsWorse: boolean
): number {
  const sorted = [...bands].sort((a, b) =>
    higherIsWorse ? a.limit - b.limit : b.limit - a.limit
  );

  for (const band of sorted) {
    if (higherIsWorse) {
      if (value <= band.limit) return band.score;
    } else {
      if (value >= band.limit) return band.score;
    }
  }

  // Fallback: schlechtester Score
  return sorted[sorted.length - 1]?.score ?? 50;
}

// ---------------------------
// Einzelmetriken
// ---------------------------

function scoreHardness(hardness: number | undefined, profile: ProfileType): MetricScore {
  // FIX: Weight 0 bei fehlenden Daten
  if (hardness == null) {
    return {
      metric: "hardness",
      score: 0,
      weight: 0,
      explanation: "Gesamthärte unbekannt.",
    };
  }

  let score = 50;
  let explanation = `Gesamthärte: ${Math.round(hardness / 17.8)} °dH. `;

  if (profile === "coffee") {
    score = stepBands(
      hardness,
      [
        { limit: 70, score: 100 },
        { limit: 140, score: 80 },
        { limit: 250, score: 40 },
      ],
      true
    );
    if (score >= 80) explanation += "Perfekt weiches Wasser für Kaffee-Aromen.";
    else if (score >= 50) explanation += "Noch akzeptabel für Kaffee.";
    else explanation += "Zu hart für optimalen Kaffeegenuss (Kalkgefahr).";

    return { metric: "hardness", score, weight: 2.5, explanation };
  }

  score = bandScore(hardness, 100, 300);
  explanation +=
    "Mittlere Härte ist oft ein guter Kompromiss aus Geschmack und Mineralien.";

  return { metric: "hardness", score, weight: 0.5, explanation };
}

function scorePh(ph: number | undefined, profile: ProfileType): MetricScore {
  // FIX: Weight 0 bei fehlenden Daten
  if (ph == null) {
    return {
      metric: "ph",
      score: 0,
      weight: 0,
      explanation: "pH-Wert unbekannt.",
    };
  }

  const score = bellScore(ph, 7.5, 2.0);
  let explanation = "Optimal zwischen ca. 6,5 und 8,5. ";

  if (profile === "coffee") {
    const coffeeScore = bellScore(ph, 7.0, 1.0);
    explanation =
      "Für Kaffee ist ein neutraler pH-Wert (ca. 7,0) ideal, um Säure zu balancieren. ";
    if (coffeeScore >= 80) explanation += "Perfekter pH-Wert für Kaffee.";
    else if (coffeeScore >= 50) explanation += "Akzeptabler pH-Wert.";
    else explanation += "pH-Wert könnte den Kaffeegeschmack verfälschen.";
    return { metric: "ph", score: coffeeScore, weight: 1.5, explanation };
  }

  if (score >= 80) {
    explanation += "Dieser pH-Wert liegt in einem sehr guten Bereich.";
  } else if (score >= 50) {
    explanation += "Der pH-Wert ist akzeptabel, aber nicht optimal.";
  } else {
    explanation += "Der pH-Wert liegt eher am Rand des üblichen Empfehlungsbereichs.";
  }

  return { metric: "ph", score, weight: 1, explanation };
}

function scoreSodium(na: number | undefined, profile: ProfileType): MetricScore {
  // FIX: Weight 0 bei fehlenden Daten
  if (na == null) {
    return {
      metric: "sodium",
      score: 0,
      weight: 0,
      explanation: "Natriumgehalt unbekannt.",
    };
  }

  let score: number;
  if (profile === "baby" || profile === "pregnancy" || profile === "blood_pressure" || profile === "kidney") {
    score = stepBands(
      na,
      [
        { limit: 10, score: 100 },
        { limit: 20, score: 80 },
        { limit: 50, score: 50 },
        { limit: 200, score: 30 },
      ],
      true
    );
  } else {
    score = stepBands(
      na,
      [
        { limit: 20, score: 100 },
        { limit: 50, score: 80 },
        { limit: 200, score: 50 },
      ],
      true
    );
  }

  let explanation =
    "Natriumarm gilt oft als vorteilhaft, insbesondere bei Bluthochdruck oder für Babys. ";
  if (score >= 80) {
    explanation += "Dieses Wasser ist natriumarm.";
  } else if (score >= 50) {
    explanation += "Der Natriumgehalt ist im mittleren Bereich.";
  } else {
    explanation += "Der Natriumgehalt ist vergleichsweise hoch.";
  }

  return {
    metric: "sodium",
    score,
    weight: profile === "baby" || profile === "pregnancy" || profile === "blood_pressure" ? 2 : 1,
    explanation,
  };
}

function scoreNitrate(no3: number | undefined, profile: ProfileType): MetricScore {
  // FIX: Weight 0 bei fehlenden Daten.
  // Das "Sicherheits-Scoring" (70/75) entfernen wir hier für den Average,
  // da es sonst den Schnitt verfälscht. Die Info fließt über DataQualityScore ein.
  if (no3 == null) {
    return {
      metric: "nitrate",
      score: 0,
      weight: 0,
      explanation: "Nitratgehalt nicht angegeben.",
    };
  }

  let score: number;
  if (profile === "baby" || profile === "pregnancy") {
    score = stepBands(
      no3,
      [
        { limit: 10, score: 100 },
        { limit: 25, score: 60 },
        { limit: 50, score: 30 },
      ],
      true
    );
  } else {
    score = stepBands(
      no3,
      [
        { limit: 25, score: 100 },
        { limit: 50, score: 60 },
      ],
      true
    );
  }

  let explanation = "Nitrat sollte möglichst niedrig sein, insbesondere für Säuglinge. ";
  if (score >= 80) {
    explanation += "Der Nitratwert ist sehr niedrig.";
  } else if (score >= 50) {
    explanation += "Der Nitratwert liegt im üblichen Bereich für Trinkwasser.";
  } else {
    explanation +=
      "Der Nitratwert ist relativ hoch – hier sollte die Gesamternährung berücksichtigt werden.";
  }

  return {
    metric: "nitrate",
    score,
    weight: profile === "baby" || profile === "pregnancy" ? 2 : 1,
    explanation,
  };
}

function scoreCalcium(ca: number | undefined, profile: ProfileType): MetricScore {
  // FIX: Weight 0 bei fehlenden Daten
  if (ca == null) {
    return {
      metric: "calcium",
      score: 0,
      weight: 0,
      explanation: "Calciumgehalt unbekannt.",
    };
  }

  if (profile === "coffee") {
    const score = stepBands(
      ca,
      [
        { limit: 20, score: 100 },
        { limit: 40, score: 80 },
        { limit: 80, score: 40 },
      ],
      true
    );
    return {
      metric: "calcium",
      score,
      weight: 1.5,
      explanation:
        "Für Kaffee ist weiches Wasser (wenig Calcium) entscheidend für das Aroma.",
    };
  }

  const score = bandScore(ca, 50, 150);
  let explanation =
    "Calcium trägt zur Knochengesundheit und Muskelarbeit bei. Ein moderater bis höherer Gehalt ist meist positiv.";

  if (score >= 80) {
    explanation += " Dieses Wasser ist calciumreich.";
  } else if (score >= 50) {
    explanation += " Der Calciumgehalt ist in Ordnung.";
  } else {
    explanation += " Der Calciumgehalt ist eher niedrig.";
  }

  return {
    metric: "calcium",
    score,
    weight: profile === "sport" || profile === "pregnancy" || profile === "seniors" ? 1.5 : 1,
    explanation,
  };
}

function scoreMagnesium(mg: number | undefined, profile: ProfileType): MetricScore {
  // FIX: Weight 0 bei fehlenden Daten
  if (mg == null) {
    return {
      metric: "magnesium",
      score: 0,
      weight: 0,
      explanation: "Magnesiumgehalt unbekannt.",
    };
  }

  const score = bandScore(mg, 20, 80);
  let explanation =
    "Magnesium ist wichtig für Muskeln und Nerven. Ein höherer Gehalt kann gerade für Sporttreibende interessant sein.";

  if (score >= 80) {
    explanation += " Dieses Wasser ist magnesiumreich.";
  } else if (score >= 50) {
    explanation += " Der Magnesiumgehalt ist in Ordnung.";
  } else {
    explanation += " Der Magnesiumgehalt ist eher niedrig.";
  }

  return {
    metric: "magnesium",
    score,
    weight: profile === "sport" || profile === "pregnancy" || profile === "seniors" || profile === "diabetes" ? 1.5 : 1,
    explanation,
  };
}

function scoreSodiumPotassiumRatio(
  sodium: number | undefined,
  potassium: number | undefined,
  profile: ProfileType
): MetricScore {
  // FIX: Weight 0 bei fehlenden Daten
  if (sodium == null || potassium == null || potassium === 0) {
    return {
      metric: "sodiumPotassiumRatio",
      score: 0,
      weight: 0,
      explanation: "Natrium-Kalium-Verhältnis nicht berechenbar.",
    };
  }

  // FIX: Na:K Ratio Fix
  // Wenn Natrium sehr niedrig ist (<20 mg/L), ist das Ratio physiologisch egal -> 100 Punkte
  if (sodium < 20) {
    return {
      metric: "sodiumPotassiumRatio",
      score: 100,
      weight: 0.5,
      explanation:
        "Natriumarm – Verhältnis physiologisch weniger relevant, aber sehr gut.",
    };
  }

  const ratio = sodium / potassium;
  let score: number;
  if (ratio <= 2) {
    score = 100;
  } else if (ratio <= 4) {
    score = 85;
  } else if (ratio <= 6) {
    score = 70;
  } else if (ratio <= 8) {
    score = 50;
  } else {
    score = 30;
  }

  let explanation = `Na:K-Verhältnis von ${ratio.toFixed(1)}:1. `;
  if (ratio <= 4) {
    explanation += "Kalium gleicht Natrium sehr gut aus – ideal für Herz & Blutdruck.";
  } else if (ratio <= 6) {
    explanation += "Akzeptabel, aber mehr Kalium würde das Verhältnis verbessern.";
  } else {
    explanation +=
      "Hoher Natriumanteil bei wenig Kalium – Blutdruck kann darunter leiden.";
  }

  return {
    metric: "sodiumPotassiumRatio",
    score,
    weight:
      profile === "blood_pressure"
        ? 1.8
        : profile === "kidney"
          ? 1.8
          : profile === "sport"
            ? 1.2
            : 0.8,
    explanation,
  };
}

function scoreCalciumMagnesiumRatio(
  calcium: number | undefined,
  magnesium: number | undefined,
  profile: ProfileType
): MetricScore {
  // FIX: Weight 0 bei fehlenden Daten
  if (calcium == null || magnesium == null || magnesium === 0) {
    return {
      metric: "calciumMagnesiumRatio",
      score: 0,
      weight: 0,
      explanation: "Ca:Mg-Verhältnis unbekannt – Balance nicht bewertbar.",
    };
  }

  const ratio = calcium / magnesium;

  // FIX: Tolerantere Bewertung (Bands statt BellScore)
  let score = 40;
  if (ratio >= 1.5 && ratio <= 3.0) score = 100; // Perfekt erweitert
  else if (ratio >= 1.0 && ratio <= 4.0) score = 80; // Gut
  else if (ratio >= 0.5 && ratio <= 6.0) score = 60; // Okay

  // Spezielle Logik für Kaffee beibehalten, aber auch hier toleranter
  if (profile === "coffee") {
    if (ratio >= 0.8 && ratio <= 2.0) score = 100;
    else if (ratio >= 0.5 && ratio <= 3.0) score = 80;
    else score = 40;
  }

  let explanation = `Ca:Mg-Verhältnis von ${ratio.toFixed(2)}:1. `;
  if (score >= 80) {
    explanation += "Liegt im idealen Bereich für Geschmack und Balance.";
  } else {
    explanation += "Das Verhältnis ist leicht unausgewogen.";
  }

  return {
    metric: "calciumMagnesiumRatio",
    score,
    weight: profile === "coffee" ? 1.2 : 1.5,
    explanation,
  };
}

function scoreBicarbonate(hco3: number | undefined, profile: ProfileType): MetricScore {
  // FIX: Weight 0 bei fehlenden Daten
  if (hco3 == null) {
    return {
      metric: "bicarbonate",
      score: 0,
      weight: 0,
      explanation: "Hydrogencarbonat unbekannt.",
    };
  }

  if (profile === "coffee") {
    const score = bandScore(hco3, 40, 120);
    return {
      metric: "bicarbonate",
      score,
      weight: 1.4,
      explanation:
        "Hydrogencarbonat puffert Säure. Für Kaffee ist eine moderate Menge ideal.",
    };
  }

  if (profile === "baby") {
    const score = bandScore(hco3, 50, 300);
    return {
      metric: "bicarbonate",
      score,
      weight: 1.8,
      explanation:
        "Für Babys: moderat (50-300 mg/L). Zu viel kann Stoffwechsel belasten.",
    };
  }

  if (profile === "blood_pressure") {
    const score = stepBands(
      hco3,
      [
        { limit: 1000, score: 100 },
        { limit: 600, score: 90 },
        { limit: 300, score: 70 },
      ],
      false
    );
    return {
      metric: "bicarbonate",
      score,
      weight: 1.5,
      explanation: "Höheres Hydrogencarbonat entlastet die Nieren und puffert Säuren.",
    };
  }

  const score = stepBands(
    hco3,
    [
      { limit: 600, score: 100 },
      { limit: 300, score: 80 },
      { limit: 100, score: 50 },
    ],
    false
  );
  let explanation =
    "Hydrogencarbonat kann Säuren puffern und ist oft in 'Sport'- oder 'Magenfreundlich'-Wässern erhöht.";

  if (score >= 80) explanation += " Der Hydrogencarbonatgehalt ist hoch.";
  else if (score >= 50) explanation += " Der Hydrogencarbonatgehalt ist moderat.";
  else explanation += " Der Hydrogencarbonatgehalt ist eher niedrig.";

  return {
    metric: "bicarbonate",
    score,
    weight: profile === "sport" ? 1.2 : 1,
    explanation,
  };
}

function scoreBufferCapacity(
  hco3: number | undefined,
  profile: ProfileType
): MetricScore {
  // FIX: Weight 0 bei fehlenden Daten
  if (hco3 == null) {
    return {
      metric: "bufferCapacity",
      score: 0,
      weight: 0,
      explanation: "Pufferkapazität nicht berechenbar.",
    };
  }

  const capacity = hco3 / 61;
  let score: number;
  if (capacity >= 25) score = 100;
  else if (capacity >= 15) score = 85;
  else if (capacity >= 8) score = 65;
  else score = 45;

  let explanation = `Neutralisiert etwa ${capacity.toFixed(1)} mVal Säure pro Liter. `;
  if (capacity >= 25)
    explanation += "Wirkt wie ein leichter Säureblocker – perfekt bei Gastritis & Sport.";
  else if (capacity >= 15)
    explanation += "Gute Basenkapazität für Regeneration und Magenkomfort.";
  else if (capacity >= 8)
    explanation += "Moderate Pufferung, kombiniert mit Ernährung ausreichend.";
  else explanation += "Sehr geringe Basenlast – kaum Säurepuffer.";

  return {
    metric: "bufferCapacity",
    score,
    weight: profile === "sport" ? 1 : 0.7,
    explanation,
  };
}

function scoreTds(tds: number | undefined, profile: ProfileType): MetricScore {
  // FIX: Weight 0 bei fehlenden Daten
  if (tds == null) {
    return {
      metric: "totalDissolvedSolids",
      score: 0,
      weight: 0,
      explanation: "Gesamtmineralisation unbekannt.",
    };
  }

  let idealMin: number;
  let idealMax: number;
  let weight = 0.9;

  if (profile === "coffee") {
    idealMin = 50;
    idealMax = 150;
    weight = 2.2;
  } else if (profile === "sport" || profile === "blood_pressure") {
    idealMin = 300;
    idealMax = 800;
    weight = 1.2;
  } else if (profile === "kidney") {
    idealMin = 50;
    idealMax = 100;
    weight = 2.0;
  } else if (profile === "baby") {
    idealMin = 50;
    idealMax = 500;
    weight = 1.8;
  } else {
    idealMin = 150;
    idealMax = 600;
    weight = 0.8;
  }

  const score = bandScore(tds, idealMin, idealMax);
  return {
    metric: "totalDissolvedSolids",
    score,
    weight,
    explanation:
      "Die Gesamtmineralisation beschreibt, wie viele gelöste Mineralstoffe insgesamt im Wasser enthalten sind.",
  };
}

function scorePotassium(k: number | undefined, profile: ProfileType): MetricScore {
  // FIX: Weight 0 bei fehlenden Daten
  if (k == null) {
    return {
      metric: "potassium",
      score: 0,
      weight: 0,
      explanation: "Kaliumgehalt unbekannt.",
    };
  }

  let score: number;
  if (profile === "kidney") {
    score = stepBands(
      k,
      [
        { limit: 2, score: 100 },
        { limit: 5, score: 70 },
        { limit: 10, score: 40 },
      ],
      true
    );
  } else {
    score = bandScore(k, 1, 10);
  }

  let explanation = "Kalium ist wichtig für Muskelfunktion und Flüssigkeitshaushalt. ";
  if (score >= 80) explanation += "Dieses Wasser hat einen guten Kaliumgehalt.";
  else if (score >= 50) explanation += "Der Kaliumgehalt ist in Ordnung.";
  else explanation += "Der Kaliumgehalt ist eher niedrig.";

  return {
    metric: "potassium",
    score,
    weight: profile === "sport" ? 1.2 : 0.7,
    explanation,
  };
}

function scoreChloride(cl: number | undefined): MetricScore {
  // FIX: Weight 0 bei fehlenden Daten
  if (cl == null) {
    return {
      metric: "chloride",
      score: 0,
      weight: 0,
      explanation: "Chloridgehalt unbekannt.",
    };
  }

  const score = stepBands(
    cl,
    [
      { limit: 250, score: 100 },
      { limit: 150, score: 90 },
      { limit: 50, score: 80 },
      { limit: 10, score: 70 },
    ],
    true
  );
  let explanation =
    "Chlorid ist natürlich in Mineralwasser enthalten. Moderate bis niedrige Werte sind vorteilhaft.";

  if (score >= 80) explanation += " Der Chloridgehalt ist niedrig und unbedenklich.";
  else if (score >= 50) explanation += " Der Chloridgehalt ist im normalen Bereich.";
  else explanation += " Der Chloridgehalt ist erhöht – kann den Geschmack beeinflussen.";

  return { metric: "chloride", score, weight: 0.6, explanation };
}

function scoreSulfate(so4: number | undefined, profile: ProfileType): MetricScore {
  // FIX: Weight 0 bei fehlenden Daten
  if (so4 == null) {
    return {
      metric: "sulfate",
      score: 0,
      weight: 0,
      explanation: "Sulfatgehalt unbekannt.",
    };
  }

  let score: number;
  let explanation = "Sulfat kommt natürlich in Mineralwasser vor. ";

  if (profile === "baby") {
    score = stepBands(
      so4,
      [
        { limit: 10, score: 100 },
        { limit: 50, score: 60 },
        { limit: 240, score: 30 },
      ],
      true
    );
    explanation += "Für Babys sollte der Sulfatgehalt möglichst niedrig sein. ";
  } else {
    score = bandScore(so4, 10, 50);
    explanation += "Moderate Werte können die Verdauung unterstützen. ";
  }

  if (score >= 80) explanation += "Der Sulfatgehalt ist im optimalen Bereich.";
  else if (score >= 50) explanation += "Der Sulfatgehalt ist akzeptabel.";
  else if (so4 > 240)
    explanation += "Der Sulfatgehalt ist erhöht – kann abführend wirken.";
  else explanation += "Der Sulfatgehalt liegt außerhalb des optimalen Bereichs.";

  return {
    metric: "sulfate",
    score,
    weight: profile === "baby" ? 1.2 : 0.7,
    explanation,
  };
}

function scoreTastePalatability(
  sulfate: number | undefined,
  chloride: number | undefined,
  bicarbonate: number | undefined,
  profile?: ProfileType
): MetricScore {
  // FIX: Weight 0 bei fehlenden Daten
  if (sulfate == null && chloride == null && bicarbonate == null) {
    return {
      metric: "tastePalatability",
      score: 0,
      weight: 0,
      explanation: "Geschmacks-Balance nicht bewertbar – Angaben fehlen.",
    };
  }

  const bitterLoad = (sulfate ?? 0) + (chloride ?? 0);
  const buffer = bicarbonate ?? 0;
  const softness =
    profile === "coffee"
      ? (buffer || 0) / Math.max(1, bitterLoad)
      : (buffer || 0) / (bitterLoad + 1);

  let score: number;
  if (softness >= 2) score = 95;
  else if (softness >= 1) score = 80;
  else if (softness >= 0.5) score = 60;
  else score = 40;

  let explanation = `Hydrogencarbonat zu Sulfat/Chlorid Verhältnis: ${softness.toFixed(
    2
  )}. `;
  if (softness >= 2)
    explanation += "Sehr weicher, runder Geschmack – ideal für Tee & Kaffee.";
  else if (softness >= 1) explanation += "Gut ausbalanciert – kaum bittere Noten.";
  else if (softness >= 0.5)
    explanation += "Leicht mineralisch/bitter. Mehr Hydrogencarbonat würde abrunden.";
  else explanation += "Hoher Sulfat/Chlorid-Anteil – schmeckt kräftig oder bitter.";

  return {
    metric: "tastePalatability",
    score,
    weight: profile === "coffee" ? 1.8 : 0.7,
    explanation,
  };
}

function scoreDataTransparency(values: Partial<WaterAnalysisValues>): MetricScore {
  // DIESE Metrik bleibt wie sie ist - sie bewertet die Qualität der Daten selbst.
  // Hier ist weight > 0 gewollt, auch wenn Werte fehlen.
  const requiredKeys: (keyof WaterAnalysisValues)[] = [
    "calcium",
    "magnesium",
    "sodium",
    "potassium",
    "chloride",
    "sulfate",
    "bicarbonate",
    "nitrate",
    "totalDissolvedSolids",
    "fluoride",
  ];
  const optionalKeys: (keyof WaterAnalysisValues)[] = ["ph"];

  const presentRequired = requiredKeys.filter((k) => values[k] != null);
  const presentOptional = optionalKeys.filter((k) => values[k] != null);
  const completeness = (presentRequired.length / requiredKeys.length) * 100;

  let score = completeness;
  if (presentRequired.length === 0) score = 30;

  let weight = 0.4;
  if (presentRequired.length < 5) weight = 0.2;
  if (presentRequired.length === requiredKeys.length) weight = 0.6;

  let explanation = `${presentRequired.length}/${requiredKeys.length} Pflichtwerte.`;
  if (completeness >= 70) explanation += " Sehr transparentes Etikett – volle Analyse.";
  else if (completeness >= 50) explanation += " Grunddaten vorhanden.";
  else explanation += " Sehr wenige Pflichtwerte angegeben.";

  return { metric: "dataQualityScore", score: clampScore(score), weight, explanation };
}

function scoreFluoride(
  f: number | undefined,
  profile: ProfileType,
  fluoridationContext: "fluoridated" | "natural" = "natural"
): MetricScore {
  let weight =
    profile === "baby" ? 1.5 : profile === "pregnancy" ? 1.2 : fluoridationContext === "fluoridated" ? 1.0 : 0.6;

  // FIX: Weight 0 bei fehlenden Daten
  if (f == null || f === 0) {
    return {
      metric: "fluoride",
      score: 0,
      weight: 0,
      explanation: "Fluorid nicht angegeben.",
    };
  }

  const rounded = f.toFixed(2);
  let score: number;
  let explanation = `Fluorid: ${rounded} mg/L. `;

  if (profile === "baby") {
    if (f <= 0.3) {
      score = 100;
      explanation += "Perfekt für Babys – sehr niedrig, kein Risiko.";
    } else if (f <= 0.7) {
      score = 80;
      explanation += "Akzeptabel für Babys, aber eher verdünnen.";
    } else if (f <= 1.0) {
      score = 50;
      explanation += "Zu hoch für Babys – Fluorose-Risiko bei Zahnentwicklung.";
    } else {
      score = 20;
      explanation += "Deutlich zu hoch – vermeiden (WHO/EFSA).";
    }
  } else if (profile === "pregnancy") {
    // Schwangerschaft: etwas weniger streng als Baby, aber dennoch vorsichtig
    if (f <= 0.5) {
      score = 100;
      explanation += "Optimal für Schwangerschaft – sehr niedrig.";
    } else if (f <= 1.0) {
      score = 80;
      explanation += "Akzeptabel in der Schwangerschaft.";
    } else if (f <= 1.5) {
      score = 50;
      explanation += "Etwas erhöht – bei viel Konsum bedenken.";
    } else {
      score = 20;
      explanation += "Zu hoch für die Schwangerschaft.";
    }
  } else {
    if (fluoridationContext === "fluoridated") {
      if (f >= 0.6 && f <= 1.2) {
        score = 100;
        explanation += "Optimaler Kariesschutz (CDC/WHO).";
      } else if ((f >= 0.4 && f < 0.6) || (f > 1.2 && f <= 1.5)) {
        score = 80;
        explanation += "Guter Bereich – wirksamer Schutz, minimales Risiko.";
      } else if (f < 0.4) {
        score = 60;
        explanation += "Zu niedrig für optimalen Schutz – Zahnpasta nutzen.";
      } else if (f > 1.5 && f <= 2.0) {
        score = 40;
        explanation += "Erhöht – leichtes Fluorose-Risiko bei Kindern.";
      } else {
        score = 20;
        explanation += "Zu hoch – WHO-Grenzwert überschritten.";
      }
    } else {
      if (f <= 0.5) {
        score = 80;
        explanation +=
          "Typischer natürlicher Wert – unbedenklich, Kariesschutz via Zahnpasta.";
      } else if (f <= 0.8) {
        score = 70;
        explanation += "Etwas höher, aber sicher (EFSA/WHO).";
      } else if (f <= 1.5) {
        score = 50;
        explanation += "Grenzbereich – bei Kindern auf Fluorose achten.";
      } else {
        score = 20;
        explanation += "Zu hoch für natürliches Wasser – EFSA/WHO warnen.";
      }
    }
  }

  return { metric: "fluoride", score, weight, explanation: explanation.trim() };
}

function scoreSilica(silica: number | undefined, profile: ProfileType): MetricScore {
  // Kieselsäure (H2SiO3) - wichtig für Haut, Haare, Nägel, Bindegewebe
  if (silica == null) {
    return {
      metric: "silica",
      score: 0,
      weight: 0,
      explanation: "Kieselsäure nicht angegeben.",
    };
  }

  // Ideal: 20-60 mg/L (guter Gehalt ohne Überschuss)
  const score = bandScore(silica, 20, 60);
  let explanation = `Kieselsäure: ${silica.toFixed(1)} mg/L. `;

  if (score >= 80) {
    explanation += "Guter Gehalt für Haut, Haare und Bindegewebe.";
  } else if (score >= 50) {
    explanation += "Moderater Gehalt – trägt zur Kollagenbildung bei.";
  } else {
    explanation += "Niedriger Gehalt – keine gesundheitlichen Bedenken.";
  }

  return {
    metric: "silica",
    score,
    weight: profile === "seniors" ? 0.6 : 0.3, // Spurenelement, niedrige Gewichtung
    explanation,
  };
}

function scoreCarbonation(co2: number | undefined, profile: ProfileType): MetricScore {
  // Kohlensäure (CO2) - relevant für Babys (still besser) und Geschmack
  if (co2 == null) {
    return {
      metric: "carbonation",
      score: 0,
      weight: 0,
      explanation: "Kohlensäuregehalt nicht angegeben.",
    };
  }

  let score: number;
  let explanation = `Kohlensäure: ${co2.toFixed(0)} mg/L. `;

  if (profile === "baby") {
    // Babys: Still (< 500 mg/L) ist optimal
    score = stepBands(
      co2,
      [
        { limit: 100, score: 100 },  // Still
        { limit: 500, score: 80 },   // Leicht
        { limit: 2000, score: 40 },  // Medium
        { limit: 5000, score: 20 },  // Classic
      ],
      true
    );
    if (score >= 80) explanation += "Stilles Wasser – perfekt für Babys.";
    else if (score >= 50) explanation += "Leicht sprudelnd – noch akzeptabel.";
    else explanation += "Zu viel Kohlensäure für Babys – kann Blähungen verursachen.";

    return { metric: "carbonation", score, weight: 1.5, explanation };
  }

  if (profile === "pregnancy") {
    // Schwangerschaft: Leicht bis Medium bevorzugt
    score = stepBands(
      co2,
      [
        { limit: 500, score: 100 },  // Still/Leicht
        { limit: 2500, score: 80 },  // Medium
        { limit: 5000, score: 50 },  // Classic
      ],
      true
    );
    if (score >= 80) explanation += "Gut verträglich in der Schwangerschaft.";
    else explanation += "Viel Kohlensäure kann bei Sodbrennen ungünstig sein.";

    return { metric: "carbonation", score, weight: 0.8, explanation };
  }

  // Standard/Sport/Coffee: Neutral bewerten, leichte Präferenz für Medium
  if (co2 < 500) {
    score = 80;  // Still
    explanation += "Stilles Wasser – neutral für die meisten Anwendungen.";
  } else if (co2 < 2500) {
    score = 90;  // Medium
    explanation += "Medium – angenehmer Geschmack ohne zu viel Säure.";
  } else if (co2 < 5500) {
    score = 75;  // Classic
    explanation += "Classic – erfrischend, aber kann Magen reizen.";
  } else {
    score = 60;  // Sehr stark
    explanation += "Sehr stark kohlensäurehaltig.";
  }

  return {
    metric: "carbonation",
    score,
    weight: profile === "coffee" ? 0.5 : 0.4, // Niedrige Gewichtung
    explanation,
  };
}

// ---------------------------
// Hauptfunktion
// ---------------------------

export function calculateScores(
  values: Partial<WaterAnalysisValues>,
  profile: ProfileType
): ScoreResult {
  // 1. Berechnungen durchführen (wie gehabt)
  const hardness = computeWaterHardness(values);
  if (hardness !== null) values.hardness = hardness;

  const caMgRatio = computeCalciumMagnesiumRatio(values.calcium, values.magnesium);
  if (caMgRatio !== null) values.calciumMagnesiumRatio = caMgRatio;

  const naKRatio = computeSodiumPotassiumRatio(values.sodium, values.potassium);
  if (naKRatio !== null) values.sodiumPotassiumRatio = naKRatio;

  const tasteBalance = computeTasteBalance(values);
  if (tasteBalance !== null) values.tastePalatability = tasteBalance;

  const bufferCapacity = computeBufferCapacity(values);
  if (bufferCapacity !== null) values.bufferCapacity = bufferCapacity;

  const dataQuality = computeDataQualityScore(values);
  if (dataQuality !== null) values.dataQualityScore = dataQuality;

  const metrics: MetricScore[] = [];

  // 2. Einzel-Scores berechnen
  metrics.push(scoreHardness(values.hardness, profile));
  metrics.push(scorePh(values.ph, profile));
  metrics.push(scoreSodium(values.sodium, profile));
  metrics.push(scoreNitrate(values.nitrate, profile));
  metrics.push(scoreCalcium(values.calcium, profile));
  metrics.push(scoreMagnesium(values.magnesium, profile));
  metrics.push(scoreSodiumPotassiumRatio(values.sodium, values.potassium, profile));
  metrics.push(scoreCalciumMagnesiumRatio(values.calcium, values.magnesium, profile));
  metrics.push(scorePotassium(values.potassium, profile));
  metrics.push(scoreChloride(values.chloride));
  metrics.push(scoreSulfate(values.sulfate, profile));
  metrics.push(scoreBicarbonate(values.bicarbonate, profile));
  metrics.push(scoreBufferCapacity(values.bicarbonate, profile));
  metrics.push(scoreTds(values.totalDissolvedSolids, profile));
  metrics.push(
    scoreTastePalatability(values.sulfate, values.chloride, values.bicarbonate, profile)
  );
  metrics.push(scoreDataTransparency(values));
  metrics.push(scoreFluoride(values.fluoride, profile));
  metrics.push(scoreSilica(values.silica, profile));
  metrics.push(scoreCarbonation(values.carbonation, profile));

  // 3. Nur vorhandene Daten nutzen (Weight > 0)
  const active = metrics.filter((m) => m.weight > 0);

  const weightedSum = active.reduce((sum, m) => sum + m.score * m.weight, 0);
  const weightSum = active.reduce((sum, m) => sum + m.weight, 0);

  let totalScore = weightSum > 0 ? weightedSum / weightSum : 50;

  // 4. NEU: Strenger Vertrauens-Check (Strict Confidence)
  const validDataPoints = active.filter((m) => m.metric !== "dataQualityScore").length;

  if (validDataPoints <= 1) {
    // Nur 1 Wert (z.B. nur Natrium): Statistisch wertlos.
    // Deckel bei 40 -> "Mangelhaft / Warnung".
    // Das zwingt den Nutzer quasi, mehr Daten einzugeben.
    totalScore = Math.min(totalScore, 40);
  } else if (validDataPoints <= 3) {
    // 2-3 Werte: Wir wissen zu wenig für eine echte Empfehlung.
    // Deckel bei 60 -> "Gerade noch Okay".
    totalScore = Math.min(totalScore, 60);
  } else if (validDataPoints <= 5) {
    // 4-5 Werte: Solide Basis, aber für "Exzellent" (90+) muss mehr Transparenz her.
    // Deckel bei 85.
    totalScore = Math.min(totalScore, 85);
  }

  // 5. Penalty Logic für kritische Werte (Bleibt bestehen)
  const criticalMetrics = ["nitrate", "sodium", "fluoride"];
  const criticalFailures = metrics
    .filter((m) => criticalMetrics.includes(m.metric))
    .filter((m) => m.weight > 0)
    .filter((m) => m.score < 30);

  if (criticalFailures.length > 0) {
    totalScore = Math.min(totalScore, 70);
  }

  return {
    totalScore: clampScore(totalScore),
    metrics,
  };
}