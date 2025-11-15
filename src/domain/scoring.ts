import type { ProfileType, WaterAnalysisValues } from "./types";

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

function scorePh(ph: number | undefined): MetricScore {
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
    return {
      metric: "nitrate",
      score: 50,
      weight: profile === "baby" ? 2 : 1,
      explanation: "Nitratgehalt unbekannt – neutral angenommen.",
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

function scoreBicarbonate(hco3: number | undefined, profile: ProfileType): MetricScore {
  if (hco3 == null) {
    return {
      metric: "bicarbonate",
      score: 50,
      weight: profile === "sport" ? 1.2 : 1,
      explanation: "Hydrogencarbonat unbekannt – neutral angenommen.",
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

// ---------------------------
// Hauptfunktion
// ---------------------------

export function calculateScores(
  values: Partial<WaterAnalysisValues>,
  profile: ProfileType
): ScoreResult {
  const metrics: MetricScore[] = [];

  metrics.push(scorePh(values.ph));
  metrics.push(scoreSodium(values.sodium, profile));
  metrics.push(scoreNitrate(values.nitrate, profile));
  metrics.push(scoreCalcium(values.calcium, profile));
  metrics.push(scoreMagnesium(values.magnesium, profile));
  metrics.push(scorePotassium(values.potassium, profile));
  metrics.push(scoreChloride(values.chloride));
  metrics.push(scoreSulfate(values.sulfate, profile));
  metrics.push(scoreBicarbonate(values.bicarbonate, profile));
  metrics.push(scoreTds(values.totalDissolvedSolids));

  // nur Metriken berücksichtigen, die eine sinnvolle Weight > 0 haben
  const active = metrics.filter((m) => m.weight > 0);

  const weightedSum = active.reduce((sum, m) => sum + m.score * m.weight, 0);
  const weightSum = active.reduce((sum, m) => sum + m.weight, 0);

  const totalScore = weightSum > 0 ? weightedSum / weightSum : 50;

  return {
    totalScore: clampScore(totalScore),
    metrics,
  };
}