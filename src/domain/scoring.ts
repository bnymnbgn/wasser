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

/**
 * Lineare Abnahme von 100 in der Mitte zu 0 am Rand.
 * Beispiel: ideal 7.5, toleranz 2.0 -> bei 7.5 = 100, bei 5.5 oder 9.5 = 0.
 */
function bellScore(value: number, ideal: number, tolerance: number): number {
  const dist = Math.abs(value - ideal);
  if (dist >= tolerance) return 0;
  const ratio = 1 - dist / tolerance; // 1 -> 0
  return clampScore(100 * ratio);
}

function bandScore(value: number, min: number, max: number): number {
  if (value < min) return clampScore((value / min) * 60);
  if (value > max) return clampScore((max / value) * 60);
  return 100;
}

/**
 * Stufenfunktion: Bereich mit Höchst-Score, davor/danach linear abfallend.
 */
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
  if (hardness == null) {
    return {
      metric: "hardness",
      score: 50,
      weight: profile === "coffee" ? 2 : 0,
      explanation: "Gesamthärte unbekannt.",
    };
  }

  // Für Kaffee: Weich ist Pflicht (< 8 dH, ca < 1.5 mmol/l)
  // 1 mmol/l CaCO3 = 100 mg/l CaCO3. 1 dH = 17.8 mg/l CaCO3.
  // Wir nehmen an, hardness ist in mg/L CaCO3 (Standard in waterMath)
  // Ideal: < 140 mg/L

  let score = 50;
  let explanation = `Gesamthärte: ${Math.round(hardness / 17.8)} °dH. `;

  if (profile === "coffee") {
    score = stepBands(hardness, [{ limit: 70, score: 100 }, { limit: 140, score: 80 }, { limit: 250, score: 40 }], true);
    if (score >= 80) explanation += "Perfekt weiches Wasser für Kaffee-Aromen.";
    else if (score >= 50) explanation += "Noch akzeptabel für Kaffee.";
    else explanation += "Zu hart für optimalen Kaffeegenuss (Kalkgefahr).";

    return { metric: "hardness", score, weight: 2.5, explanation };
  }

  // Standard: Mittelhart oft gut für Geschmack
  score = bandScore(hardness, 100, 300);
  explanation += "Mittlere Härte ist oft ein guter Kompromiss aus Geschmack und Mineralien.";

  return { metric: "hardness", score, weight: 0.5, explanation };
}

function scorePh(ph: number | undefined, profile: ProfileType): MetricScore {
  if (ph == null) {
    return {
      metric: "ph",
      score: 50,
      weight: 1,
      explanation: "pH-Wert unbekannt – neutral angenommen.",
    };
  }

  const score = bellScore(ph, 7.5, 2.0); // 5.5–9.5 → 0–100, ideal 7.5
  let explanation = "Optimal zwischen ca. 6,5 und 8,5. ";

  if (profile === "coffee") {
    // Kaffee: Ideal 7.0, Toleranz enger
    const coffeeScore = bellScore(ph, 7.0, 1.0);
    explanation = "Für Kaffee ist ein neutraler pH-Wert (ca. 7,0) ideal, um Säure zu balancieren. ";
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
  if (na == null) {
    return {
      metric: "sodium",
      score: 50,
      weight: profile === "baby" || profile === "blood_pressure" ? 2 : 1,
      explanation: "Natriumgehalt unbekannt – neutral angenommen.",
    };
  }

  let score: number;
  if (profile === "baby" || profile === "blood_pressure") {
    // niedriger besser
    score = stepBands(
      na,
      [
        { limit: 10, score: 100 }, // sehr natriumarm
        { limit: 20, score: 80 },
        { limit: 50, score: 50 },
        { limit: 200, score: 30 },
      ],
      true
    );
  } else {
    // Standard / Sport – immer noch geringer besser, aber weniger streng
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
    weight: profile === "baby" || profile === "blood_pressure" ? 2 : 1,
    explanation,
  };
}

function scoreNitrate(no3: number | undefined, profile: ProfileType): MetricScore {
  if (no3 == null) {
    const baseScore = profile === "baby" ? 40 : 50;
    return {
      metric: "nitrate",
      score: baseScore,
      weight: profile === "baby" ? 2 : 1,
      explanation:
        profile === "baby"
          ? "Nitratgehalt fehlt auf dem Etikett – vorsichtshalber Abzug für Babys."
          : "Nitratgehalt unbekannt – neutral angenommen.",
    };
  }

  let score: number;
  if (profile === "baby") {
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
        { limit: 50, score: 60 }, // Trinkwasser-Grenzwert
      ],
      true
    );
  }

  let explanation =
    "Nitrat sollte möglichst niedrig sein, insbesondere für Säuglinge. ";
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
    weight: profile === "baby" ? 2 : 1,
    explanation,
  };
}

function scoreCalcium(ca: number | undefined, profile: ProfileType): MetricScore {
  if (ca == null) {
    return {
      metric: "calcium",
      score: 50,
      weight: profile === "sport" ? 1.5 : 1,
      explanation: "Calciumgehalt unbekannt – neutral angenommen.",
    };
  }

  if (profile === "coffee") {
    // Kaffee: Weniger ist mehr (Weichheit)
    // < 40 super, > 80 schlecht
    const score = stepBands(ca, [{ limit: 20, score: 100 }, { limit: 40, score: 80 }, { limit: 80, score: 40 }], true);
    return {
      metric: "calcium",
      score,
      weight: 1.5,
      explanation: "Für Kaffee ist weiches Wasser (wenig Calcium) entscheidend für das Aroma.",
    };
  }

  const score = bandScore(ca, 50, 150); // 50–150 mg/L als guter Bereich
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
    weight: profile === "sport" ? 1.5 : 1,
    explanation,
  };
}

function scoreMagnesium(mg: number | undefined, profile: ProfileType): MetricScore {
  if (mg == null) {
    return {
      metric: "magnesium",
      score: 50,
      weight: profile === "sport" ? 1.5 : 1,
      explanation: "Magnesiumgehalt unbekannt – neutral angenommen.",
    };
  }

  const score = bandScore(mg, 20, 80); // 20–80 mg/L als guter Bereich
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
    weight: profile === "sport" ? 1.5 : 1,
    explanation,
  };
}

function scoreSodiumPotassiumRatio(
  sodium: number | undefined,
  potassium: number | undefined,
  profile: ProfileType
): MetricScore {
  if (sodium == null || potassium == null || potassium === 0) {
    return {
      metric: "sodiumPotassiumRatio",
      score: 50,
      weight: profile === "blood_pressure" ? 1 : 0.6,
      explanation: "Natrium-Kalium-Verhältnis nicht angegeben.",
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
    explanation += "Hoher Natriumanteil bei wenig Kalium – Blutdruck kann darunter leiden.";
  }

  return {
    metric: "sodiumPotassiumRatio",
    score,
    weight: profile === "blood_pressure" ? 1.2 : 0.6,
    explanation,
  };
}

function scoreCalciumMagnesiumRatio(
  calcium: number | undefined,
  magnesium: number | undefined
): MetricScore {
  if (calcium == null || magnesium == null || magnesium === 0) {
    return {
      metric: "calciumMagnesiumRatio",
      score: 50,
      weight: 1.5,
      explanation: "Ca:Mg-Verhältnis unbekannt – Balance nicht bewertbar.",
    };
  }

  const ratio = calcium / magnesium;
  const score = bellScore(ratio, 2, 0.7);
  let explanation = `Ca:Mg-Verhältnis von ${ratio.toFixed(2)}:1. `;

  if (score >= 80) {
    explanation += "Liegt im idealen Bereich (ca. 1.6–2.4:1) für Mineralbalance.";
  } else if (score >= 50) {
    explanation += "Leicht unausgewogen, aber akzeptabel. Magnesium oder Calcium ergänzen.";
  } else if (ratio < 1.6) {
    explanation += "Magnesium dominiert – kann zu weichem Geschmack führen, Calcium ergänzen.";
  } else {
    explanation += "Calcium dominiert stark – Magnesium ergänzen für optimale Aufnahme.";
  }

  return {
    metric: "calciumMagnesiumRatio",
    score,
    weight: 1.5,
    explanation,
  };
}

function scoreBicarbonate(hco3: number | undefined, profile: ProfileType): MetricScore {
  if (hco3 == null) {
    return {
      metric: "bicarbonate",
      score: 50,
      weight: profile === "sport" ? 1.2 : 1,
      explanation: "Hydrogencarbonat unbekannt – neutral angenommen.",
    };
  }

  if (profile === "coffee") {
    // Kaffee: Puffer ist gut, aber nicht zu viel (Killt Säure)
    // Ideal 2-4 °dH KH (~ 40-80 mg/L HCO3)
    const score = bandScore(hco3, 40, 120);
    return {
      metric: "bicarbonate",
      score,
      weight: 1.2,
      explanation: "Hydrogencarbonat puffert Säure. Für Kaffee ist eine moderate Menge ideal.",
    };
  }

  const score = stepBands(
    hco3,
    [
      { limit: 600, score: 100 },
      { limit: 300, score: 80 },
      { limit: 100, score: 50 },
    ],
    false // höher ist besser
  );

  let explanation =
    "Hydrogencarbonat kann Säuren puffern und ist oft in 'Sport'- oder 'Magenfreundlich'-Wässern erhöht.";

  if (score >= 80) {
    explanation += " Der Hydrogencarbonatgehalt ist hoch.";
  } else if (score >= 50) {
    explanation += " Der Hydrogencarbonatgehalt ist moderat.";
  } else {
    explanation += " Der Hydrogencarbonatgehalt ist eher niedrig.";
  }

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
  if (hco3 == null) {
    return {
      metric: "bufferCapacity",
      score: 50,
      weight: profile === "sport" ? 1 : 0.7,
      explanation: "Pufferkapazität unbekannt – Hydrogencarbonat nicht angegeben.",
    };
  }

  const capacity = hco3 / 61;
  let score: number;
  if (capacity >= 25) {
    score = 100;
  } else if (capacity >= 15) {
    score = 85;
  } else if (capacity >= 8) {
    score = 65;
  } else {
    score = 45;
  }

  let explanation = `Neutralisiert etwa ${capacity.toFixed(1)} mVal Säure pro Liter. `;
  if (capacity >= 25) {
    explanation += "Wirkt wie ein leichter Säureblocker – perfekt bei Gastritis & Sport.";
  } else if (capacity >= 15) {
    explanation += "Gute Basenkapazität für Regeneration und Magenkomfort.";
  } else if (capacity >= 8) {
    explanation += "Moderate Pufferung, kombiniert mit Ernährung ausreichend.";
  } else {
    explanation += "Sehr geringe Basenlast – kaum Säurepuffer.";
  }

  return {
    metric: "bufferCapacity",
    score,
    weight: profile === "sport" ? 1 : 0.7,
    explanation,
  };
}

function scoreTds(tds: number | undefined): MetricScore {
  if (tds == null) {
    return {
      metric: "totalDissolvedSolids",
      score: 50,
      weight: 0.8,
      explanation: "Gesamtmineralisation unbekannt – neutral angenommen.",
    };
  }

  // sehr grobe Einordnung: 150–600 mg/L als "angenehm mineralreich"
  const score = bandScore(tds, 150, 600);
  let explanation =
    "Die Gesamtmineralisation beschreibt, wie viele gelöste Mineralstoffe insgesamt im Wasser enthalten sind.";

  if (score >= 80) {
    explanation += " Dieses Wasser ist deutlich mineralreich.";
  } else if (score >= 50) {
    explanation += " Die Mineralisation liegt im mittleren Bereich.";
  } else {
    explanation += " Die Mineralisation ist eher niedrig (sehr weiches Wasser).";
  }

  return {
    metric: "totalDissolvedSolids",
    score,
    weight: 0.8,
    explanation,
  };
}

function scorePotassium(k: number | undefined, profile: ProfileType): MetricScore {
  if (k == null) {
    return {
      metric: "potassium",
      score: 50,
      weight: profile === "sport" ? 1.2 : 0.7,
      explanation: "Kaliumgehalt unbekannt – neutral angenommen.",
    };
  }

  // Kalium ist wichtig für Muskelfunktion und Nervensystem
  // Höhere Werte sind meist positiv, besonders für Sportler
  const score = bandScore(k, 1, 10); // 1–10 mg/L als guter Bereich

  let explanation =
    "Kalium ist wichtig für Muskelfunktion und Flüssigkeitshaushalt. Ein moderater bis höherer Gehalt ist meist positiv.";

  if (score >= 80) {
    explanation += " Dieses Wasser hat einen guten Kaliumgehalt.";
  } else if (score >= 50) {
    explanation += " Der Kaliumgehalt ist in Ordnung.";
  } else {
    explanation += " Der Kaliumgehalt ist eher niedrig.";
  }

  return {
    metric: "potassium",
    score,
    weight: profile === "sport" ? 1.2 : 0.7,
    explanation,
  };
}

function scoreChloride(cl: number | undefined): MetricScore {
  if (cl == null) {
    return {
      metric: "chloride",
      score: 50,
      weight: 0.6,
      explanation: "Chloridgehalt unbekannt – neutral angenommen.",
    };
  }

  // Chlorid ist natürlich in Wasser, moderate Werte sind gut
  // Sehr hohe Werte können auf Verschmutzung hindeuten oder salzigen Geschmack verursachen
  const score = stepBands(
    cl,
    [
      { limit: 250, score: 100 }, // unter Trinkwasser-Grenzwert
      { limit: 150, score: 90 },
      { limit: 50, score: 80 },
      { limit: 10, score: 70 },
    ],
    true // niedrig ist besser
  );

  let explanation =
    "Chlorid ist natürlich in Mineralwasser enthalten. Moderate bis niedrige Werte sind vorteilhaft.";

  if (score >= 80) {
    explanation += " Der Chloridgehalt ist niedrig und unbedenklich.";
  } else if (score >= 50) {
    explanation += " Der Chloridgehalt ist im normalen Bereich.";
  } else {
    explanation += " Der Chloridgehalt ist erhöht – kann den Geschmack beeinflussen.";
  }

  return {
    metric: "chloride",
    score,
    weight: 0.6,
    explanation,
  };
}

function scoreSulfate(so4: number | undefined, profile: ProfileType): MetricScore {
  if (so4 == null) {
    return {
      metric: "sulfate",
      score: 50,
      weight: 0.7,
      explanation: "Sulfatgehalt unbekannt – neutral angenommen.",
    };
  }

  // Sulfat kann den Geschmack beeinflussen und bei hohen Dosen abführend wirken
  // Moderate Werte (10-50 mg/L) sind oft positiv für die Verdauung
  let score: number;
  let explanation = "Sulfat kommt natürlich in Mineralwasser vor. ";

  if (profile === "baby") {
    // Für Babys: niedriger ist besser
    score = stepBands(
      so4,
      [
        { limit: 10, score: 100 },
        { limit: 50, score: 60 },
        { limit: 240, score: 30 }, // Grenzwert für Säuglingsnahrung
      ],
      true
    );
    explanation += "Für Babys sollte der Sulfatgehalt möglichst niedrig sein. ";
  } else {
    // Für andere: moderate Werte sind gut
    score = bandScore(so4, 10, 50); // 10-50 mg/L als optimal
    explanation += "Moderate Werte können die Verdauung unterstützen. ";
  }

  if (score >= 80) {
    explanation += "Der Sulfatgehalt ist im optimalen Bereich.";
  } else if (score >= 50) {
    explanation += "Der Sulfatgehalt ist akzeptabel.";
  } else {
    if (so4 > 240) {
      explanation += "Der Sulfatgehalt ist erhöht – kann abführend wirken.";
    } else {
      explanation += "Der Sulfatgehalt liegt außerhalb des optimalen Bereichs.";
    }
  }

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
  bicarbonate: number | undefined
): MetricScore {
  if (sulfate == null && chloride == null && bicarbonate == null) {
    return {
      metric: "tastePalatability",
      score: 50,
      weight: 0.6,
      explanation: "Geschmacks-Balance nicht bewertbar – Angaben fehlen.",
    };
  }

  const bitterLoad = (sulfate ?? 0) + (chloride ?? 0);
  const buffer = bicarbonate ?? 0;
  const softness = buffer / (bitterLoad + 1);
  let score: number;
  if (softness >= 2) {
    score = 95;
  } else if (softness >= 1) {
    score = 80;
  } else if (softness >= 0.5) {
    score = 60;
  } else {
    score = 40;
  }

  let explanation = `Hydrogencarbonat zu Sulfat/Chlorid Verhältnis: ${softness.toFixed(2)}. `;
  if (softness >= 2) {
    explanation += "Sehr weicher, runder Geschmack – ideal für Tee & Kaffee.";
  } else if (softness >= 1) {
    explanation += "Gut ausbalanciert – kaum bittere Noten.";
  } else if (softness >= 0.5) {
    explanation += "Leicht mineralisch/bitter. Mehr Hydrogencarbonat würde abrunden.";
  } else {
    explanation += "Hoher Sulfat/Chlorid-Anteil – schmeckt kräftig oder bitter.";
  }

  return {
    metric: "tastePalatability",
    score,
    weight: 0.6,
    explanation,
  };
}

function scoreDataTransparency(values: Partial<WaterAnalysisValues>): MetricScore {
  const trackedKeys: (keyof WaterAnalysisValues)[] = [
    "ph",
    "calcium",
    "magnesium",
    "sodium",
    "potassium",
    "chloride",
    "sulfate",
    "bicarbonate",
    "nitrate",
    "totalDissolvedSolids",
  ];

  const present = trackedKeys.reduce((count, key) => {
    return values[key] != null ? count + 1 : count;
  }, 0);
  const completeness = (present / trackedKeys.length) * 100;

  let score = completeness;
  if (present === 0) {
    score = 30;
  }

  let explanation = `${present} von ${trackedKeys.length} Mineralien angegeben. `;
  if (completeness >= 70) {
    explanation += "Sehr transparentes Etikett – volle Analyse.";
  } else if (completeness >= 50) {
    explanation += "Grunddaten vorhanden, aber mehr Angaben wären hilfreich.";
  } else {
    explanation += "Sehr wenige Werte angegeben – schwierig zu bewerten.";
  }

  return {
    metric: "dataQualityScore",
    score: clampScore(score),
    weight: 0.4,
    explanation,
  };
}

function scoreFluoride(f: number | undefined, profile: ProfileType): MetricScore {
  if (f == null) {
    return {
      metric: "fluoride",
      score: 50,
      weight: 0.8,
      explanation: "Fluoridgehalt unbekannt.",
    };
  }

  // WHO-Empfehlung: 0.5-1.0 mg/L optimal für Zahngesundheit
  // >1.5 mg/L: Fluorose-Risiko
  let score: number;
  let explanation = "Fluorid schützt vor Karies. ";

  if (profile === "baby") {
    // Babys: < 0.7 mg/L (Fluorose-Risiko bei Zahnentwicklung)
    score = stepBands(f, [
      { limit: 0.3, score: 100 },
      { limit: 0.7, score: 80 },
      { limit: 1.5, score: 30 },
    ], true);
    explanation += "Für Babys sollte Fluorid unter 0.7 mg/L liegen (Zahnentwicklung).";
  } else {
    // Erwachsene: 0.5-1.0 optimal
    score = bellScore(f, 0.7, 0.5); // Ideal 0.7, Toleranz ±0.5
    if (score >= 80) {
      explanation += "Optimaler Fluoridgehalt für Zahnschutz.";
    } else if (f > 1.5) {
      explanation += "Fluorid erhöht – langfristig Fluorose-Risiko (Zahnflecken).";
    } else {
      explanation += "Niedriger Fluoridgehalt – Kariesschutz via Zahnpasta empfohlen.";
    }
  }

  return {
    metric: "fluoride",
    score,
    weight: profile === "baby" ? 1.5 : 0.8,
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
  const hardness = computeWaterHardness(values);
  if (hardness !== null) {
    values.hardness = hardness;
  }
  const caMgRatio = computeCalciumMagnesiumRatio(values.calcium, values.magnesium);
  if (caMgRatio !== null) {
    values.calciumMagnesiumRatio = caMgRatio;
  }
  const naKRatio = computeSodiumPotassiumRatio(values.sodium, values.potassium);
  if (naKRatio !== null) {
    values.sodiumPotassiumRatio = naKRatio;
  }
  const tasteBalance = computeTasteBalance(values);
  if (tasteBalance !== null) {
    values.tastePalatability = tasteBalance;
  }
  const bufferCapacity = computeBufferCapacity(values);
  if (bufferCapacity !== null) {
    values.bufferCapacity = bufferCapacity;
  }
  const dataQuality = computeDataQualityScore(values);
  if (dataQuality !== null) {
    values.dataQualityScore = dataQuality;
  }

  const metrics: MetricScore[] = [];

  metrics.push(scoreHardness(values.hardness, profile));
  metrics.push(scorePh(values.ph, profile));
  metrics.push(scoreSodium(values.sodium, profile));
  metrics.push(scoreNitrate(values.nitrate, profile));
  metrics.push(scoreCalcium(values.calcium, profile));
  metrics.push(scoreMagnesium(values.magnesium, profile));
  metrics.push(scoreSodiumPotassiumRatio(values.sodium, values.potassium, profile));
  metrics.push(scoreCalciumMagnesiumRatio(values.calcium, values.magnesium));
  metrics.push(scorePotassium(values.potassium, profile));
  metrics.push(scoreChloride(values.chloride));
  metrics.push(scoreSulfate(values.sulfate, profile));
  metrics.push(scoreBicarbonate(values.bicarbonate, profile));
  metrics.push(scoreBufferCapacity(values.bicarbonate, profile));
  metrics.push(scoreTds(values.totalDissolvedSolids));
  metrics.push(scoreTastePalatability(values.sulfate, values.chloride, values.bicarbonate));
  metrics.push(scoreDataTransparency(values));
  metrics.push(scoreFluoride(values.fluoride, profile));

  // nur Metriken berücksichtigen, die eine sinnvolle Weight > 0 haben
  const active = metrics.filter((m) => m.weight > 0);

  const weightedSum = active.reduce((sum, m) => sum + m.score * m.weight, 0);
  const weightSum = active.reduce((sum, m) => sum + m.weight, 0);

  let totalScore = weightSum > 0 ? weightedSum / weightSum : 50;

  // ---------------------------
  // Penalty Logic (Non-linear Scoring)
  // ---------------------------

  // Kritische Metriken, die bei Versagen den Gesamt-Score runterziehen müssen
  const criticalMetrics = ["nitrate", "sodium", "fluoride"];

  const criticalFailures = metrics
    .filter(m => criticalMetrics.includes(m.metric))
    .filter(m => m.score < 30); // Score < 30 gilt als "Versagen"

  if (criticalFailures.length > 0) {
    // Penalty: Max Score = 70 bei kritischen Fehlern
    // Das verhindert, dass ein Wasser mit z.B. extrem viel Nitrat trotzdem 90 Punkte bekommt
    totalScore = Math.min(totalScore, 70);
  }

  return {
    totalScore: clampScore(totalScore),
    metrics,
  };
}
