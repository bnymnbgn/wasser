export const PROFILE_CHEATSHEET = {
  standard: {
    id: "standard",
    label: "Standard",
    shortDescription:
      "Ausgewogene Bewertung für gesunde Erwachsene ohne besondere Anforderungen.",
    whenToUse:
      "Wenn du keine speziellen gesundheitlichen Anforderungen hast und einfach ein Gefühl für die Wasserqualität bekommen möchtest.",
    scoringFocus: [
      "Ausgewogenes Verhältnis aller Metriken.",
      "pH-Wert sollte im angenehmen Trinkbereich liegen (ca. 6,5–8,5).",
      "Nitrat und Natrium werden beachtet, aber nicht übergewichtet.",
      "Mineralstoffe (Calcium, Magnesium, Hydrogencarbonat) gelten eher als Pluspunkte.",
    ],
    metrics: [
      {
        metric: "ph",
        label: "pH-Wert",
        importance: "mittel",
        explanation:
          "Der pH-Wert beschreibt, wie sauer oder basisch das Wasser ist. Ein Bereich von etwa 6,5–8,5 gilt als üblich und gut trinkbar.",
        hints: [
          "Sehr niedriger pH kann aggressiv gegenüber Materialien sein.",
          "Sehr hoher pH kann den Geschmack beeinflussen.",
        ],
      },
      {
        metric: "sodium",
        label: "Natrium",
        importance: "mittel",
        explanation:
          "Natrium ist ein wichtiger Mineralstoff, in zu hohen Mengen aber unerwünscht, insbesondere bei Bluthochdruck.",
        hints: [
          "Werte unter 50 mg/L sind für den Alltag in der Regel unkritisch.",
          "Sehr natriumarme Wässer (< 20 mg/L) werden häufig speziell gekennzeichnet.",
        ],
      },
      {
        metric: "nitrate",
        label: "Nitrat",
        importance: "hoch",
        explanation:
          "Nitrat stammt typischerweise aus landwirtschaftlichen Einträgen. In hohen Konzentrationen ist es unerwünscht.",
        hints: [
          "Für Trinkwasser gilt ein Grenzwert von 50 mg/L.",
          "Je niedriger der Wert, desto besser – besonders bei häufiger Nutzung.",
        ],
      },
      {
        metric: "calcium",
        label: "Calcium",
        importance: "mittel",
        explanation:
          "Calcium ist wichtig für Knochen und Zähne. Ein moderater bis höherer Gehalt wird als positiv gewertet.",
        hints: [
          "Werte zwischen 50–150 mg/L gelten als guter Bereich.",
          "Sehr hohe Werte können zu \"hartem\" Wasser führen.",
        ],
      },
      {
        metric: "magnesium",
        label: "Magnesium",
        importance: "mittel",
        explanation:
          "Magnesium spielt eine Rolle für Muskelfunktion und Nervensystem. Ein höherer Gehalt kann positiv sein.",
        hints: [
          "Werte ab ca. 20 mg/L werden oft als \"magnesiumreich\" beworben.",
          "Sehr hohe Werte können den Geschmack beeinflussen.",
        ],
      },
      {
        metric: "bicarbonate",
        label: "Hydrogencarbonat",
        importance: "mittel",
        explanation:
          "Hydrogencarbonat dient als Säurepuffer. Höhere Gehalte können Magenfreundlichkeit und Sporttauglichkeit unterstützen.",
        hints: [
          "Werte über 300 mg/L werden häufig als \"besonders magenfreundlich\" oder \"sportgeeignet\" hervorgehoben.",
          "Über 1300 mg/L (Heilwasser): Klinisch validiert gegen Sodbrennen (STOMACH STILL-Studie).",
        ],
      },
      {
        metric: "sulfate",
        label: "Sulfat",
        importance: "niedrig",
        explanation:
          "Sulfat kommt natürlich in Mineralwasser vor und wird traditionell als verdauungsfördernd anerkannt (Min/TafelWV ab 200 mg/L).",
        hints: [
          "Kann die Darmmotilität unterstützen – ideal morgens auf nüchternen Magen.",
          "Sehr hohe Werte (>500 mg/L) können abführend wirken.",
        ],
      },
      {
        metric: "chloride",
        label: "Chlorid",
        importance: "niedrig",
        explanation:
          "Chlorid ist ein natürlicher Bestandteil von Mineralwasser und in moderaten Mengen unbedenklich.",
        hints: [
          "Niedrige bis moderate Werte (<250 mg/L) sind vorteilhaft.",
          "Erhöhte Werte können den Geschmack salzig beeinflussen.",
        ],
      },
      {
        metric: "potassium",
        label: "Kalium",
        importance: "niedrig",
        explanation:
          "Kalium ist ein essentielles Mineral für Herzfunktion und Blutdruckregulation, kommt aber in Wasser meist in geringen Mengen vor.",
        hints: [
          "Werte ab 10-20 mg/L können einen kleinen Beitrag zur Kaliumversorgung leisten.",
          "Hauptquellen sind Obst, Gemüse und Hülsenfrüchte.",
        ],
      },
      {
        metric: "totalDissolvedSolids",
        label: "Gesamtmineralisation (TDS)",
        importance: "niedrig",
        explanation:
          "Die Gesamtmineralisation zeigt, wie viele gelöste Mineralstoffe insgesamt enthalten sind. Achtung: TDS ist eine 'blinde Metrik' (WHO) – die spezifische Zusammensetzung (Ca, Mg, etc.) ist entscheidend, nicht die Gesamtsumme!",
        hints: [
          "Niedrige TDS → eher \"weiches\", neutrales Wasser.",
          "Mittlere bis höhere TDS → deutlich mineralischer Geschmack.",
          "WHO: TDS hat keine gesundheitliche Relevanz, nur ästhetisch (Geschmack) und technisch (Verkalkung).",
        ],
      },
    ],
  },

  baby: {
    id: "baby",
    label: "Baby / Kleinkind",
    shortDescription:
      "Strengere Bewertung für Wasser, das für Babys und Kleinkinder genutzt werden soll.",
    whenToUse:
      "Wenn du wissen möchtest, ob ein Wasser für die Zubereitung von Babynahrung besonders geeignet ist.",
    scoringFocus: [
      "Nitrat und Natrium sind besonders stark gewichtet.",
      "Sehr niedrige Nitratwerte sind entscheidend.",
      "Natrium sollte möglichst gering sein.",
      "Mineralstoffe werden eher vorsichtig bewertet – Extreme werden vermieden.",
    ],
    metrics: [
      {
        metric: "nitrate",
        label: "Nitrat",
        importance: "sehr hoch",
        explanation:
          "Für Babys ist ein niedriger Nitratgehalt besonders wichtig. Hohe Nitratwerte sind problematisch.",
        hints: [
          "Werte unter 10 mg/L werden sehr positiv bewertet.",
          "Werte über 25 mg/L gelten in diesem Profil als kritisch.",
        ],
      },
      {
        metric: "sodium",
        label: "Natrium",
        importance: "sehr hoch",
        explanation:
          "Babys sollen möglichst wenig Natrium über das Wasser aufnehmen.",
        hints: [
          "Für dieses Profil sind Werte unter 10–20 mg/L erwünscht.",
          "Höhere Natriumwerte führen schnell zu schlechteren Scores.",
        ],
      },
      {
        metric: "ph",
        label: "pH-Wert",
        importance: "mittel",
        explanation:
          "Auch für Babys sollte der pH-Wert im üblichen Trinkbereich liegen, extreme Werte werden vermieden.",
        hints: [
          "Zwischen ca. 6,5–8,5 ist in Ordnung.",
          "Die Gewichtung ist geringer als bei Nitrat und Natrium, aber dennoch relevant.",
        ],
      },
      {
        metric: "calcium",
        label: "Calcium",
        importance: "mittel",
        explanation:
          "Calcium ist wichtig, aber es gibt auch Grenzen: zu hohe Mineralisation ist nicht immer ideal für Säuglinge.",
        hints: [
          "Moderate Werte sind vorteilhaft.",
          "Sehr hohe Calciumwerte führen in diesem Profil nicht automatisch zu Bestnoten.",
        ],
      },
      {
        metric: "magnesium",
        label: "Magnesium",
        importance: "mittel",
        explanation:
          "Magnesium ist wichtig, aber extrem hohe Werte sind in einem Babyprofil nicht das Ziel.",
        hints: ["Moderate Werte werden bevorzugt."],
      },
      {
        metric: "bicarbonate",
        label: "Hydrogencarbonat",
        importance: "niedrig",
        explanation:
          "Hydrogencarbonat wird in diesem Profil eher zurückhaltend bewertet.",
        hints: [
          "Dieses Profil fokussiert stärker auf Nitrat und Natrium als auf Säurepufferung.",
        ],
      },
      {
        metric: "sulfate",
        label: "Sulfat",
        importance: "niedrig",
        explanation:
          "Sulfat ist natürlich vorhanden. Für Babys sollten sehr hohe Werte vermieden werden (können abführend wirken).",
        hints: [
          "Werte unter 200 mg/L sind für Babynahrung unbedenklich.",
        ],
      },
      {
        metric: "chloride",
        label: "Chlorid",
        importance: "niedrig",
        explanation:
          "Chlorid ist in moderaten Mengen unproblematisch für Babys.",
        hints: [
          "Niedrige Werte sind vorteilhaft.",
        ],
      },
      {
        metric: "potassium",
        label: "Kalium",
        importance: "niedrig",
        explanation:
          "Kalium in geringen Mengen ist unbedenklich.",
        hints: [],
      },
    ],
  },

  sport: {
    id: "sport",
    label: "Sport",
    shortDescription:
      "Bewertung für Menschen, die Wert auf mineralreiches Wasser zur Unterstützung von Training und Regeneration legen.",
    whenToUse:
      "Wenn du viel Sport treibst und ein Wasser suchst, das Mineralstoffverluste sinnvoll ergänzt.",
    scoringFocus: [
      "Magnesium, Calcium und Hydrogencarbonat werden stärker gewichtet.",
      "Natrium wird berücksichtigt, aber weniger streng als im Blutdruck-/Babyprofil.",
      "Nitrat sollte trotzdem nicht zu hoch sein.",
    ],
    metrics: [
      {
        metric: "magnesium",
        label: "Magnesium",
        importance: "sehr hoch",
        explanation:
          "Magnesium unterstützt Muskel- und Nervenfunktion. Ein höherer Gehalt ist in diesem Profil erwünscht.",
        hints: [
          "Werte ab ca. 20 mg/L sind oft als \"magnesiumreich\" interessant.",
          "Extrem hohe Werte können Geschmack und Verträglichkeit beeinflussen.",
        ],
      },
      {
        metric: "calcium",
        label: "Calcium",
        importance: "hoch",
        explanation:
          "Calcium ist wichtig für Knochen und Muskelarbeit, besonders bei sportlicher Belastung.",
        hints: [
          "Bereiche von 50–150 mg/L werden positiv bewertet.",
          "Sehr niedrige Calciumwerte führen zu niedrigeren Scores.",
        ],
      },
      {
        metric: "bicarbonate",
        label: "Hydrogencarbonat",
        importance: "hoch",
        explanation:
          "Hydrogencarbonat kann Säuren puffern und wird häufig bei \"Sport-Wässern\" hervorgehoben.",
        hints: [
          "Werte über 300–600 mg/L gelten in diesem Profil als besonders vorteilhaft.",
        ],
      },
      {
        metric: "sodium",
        label: "Natrium",
        importance: "mittel",
        explanation:
          "Beim Sport kann ein gewisser Natriumgehalt sinnvoll sein, um Verluste auszugleichen.",
        hints: [
          "Dieses Profil ist weniger streng als das Blutdruck- oder Babyprofil.",
          "Sehr hohe Natriumwerte werden trotzdem abgewertet.",
        ],
      },
      {
        metric: "nitrate",
        label: "Nitrat",
        importance: "mittel",
        explanation:
          "Nitrat sollte auch im Sportprofil nicht zu hoch sein, bleibt aber sekundär gegenüber Mineralien.",
        hints: [
          "Werte unter 25 mg/L werden positiv bewertet.",
          "Die Grenzen orientieren sich grob an Trinkwasserempfehlungen.",
        ],
      },
      {
        metric: "sulfate",
        label: "Sulfat",
        importance: "mittel",
        explanation:
          "Sulfat kann verdauungsfördernd wirken und wird bei Sportwässern teilweise geschätzt (Min/TafelWV ab 200 mg/L).",
        hints: [
          "Moderate Werte können die Regeneration unterstützen.",
          "Ideal morgens vor dem Training auf nüchternen Magen.",
        ],
      },
      {
        metric: "chloride",
        label: "Chlorid",
        importance: "niedrig",
        explanation:
          "Chlorid ist ein natürlicher Bestandteil. Moderate Werte sind unproblematisch.",
        hints: [
          "Niedrige bis moderate Werte sind vorteilhaft.",
        ],
      },
      {
        metric: "potassium",
        label: "Kalium",
        importance: "mittel",
        explanation:
          "Kalium ist wichtig für Muskel- und Herzfunktion. Wasser trägt meist wenig bei, aber jeder Beitrag zählt beim Sport.",
        hints: [
          "Werte ab 10-20 mg/L sind ein Bonus.",
          "Hauptquellen bleiben Bananen, Kartoffeln, Hülsenfrüchte.",
        ],
      },
      {
        metric: "totalDissolvedSolids",
        label: "Gesamtmineralisation (TDS)",
        importance: "mittel",
        explanation:
          "Eine höhere Gesamtmineralisation deutet auf mineralreiches Wasser hin, was im Sportprofil meist erwünscht ist.",
        hints: [
          "Sehr niedrige TDS → eher \"leichtes\" Wasser, weniger Elektrolyte.",
          "Höhere TDS können für Regeneration hilfreich sein.",
        ],
      },
    ],
  },

  blood_pressure: {
    id: "blood_pressure",
    label: "Blutdrucksensibel",
    shortDescription:
      "Bewertung für Menschen, die insbesondere auf Natriumzufuhr achten möchten.",
    whenToUse:
      "Wenn du blutdrucksensibel bist oder dir von Fachpersonal zu natriumärmerer Ernährung geraten wurde.",
    scoringFocus: [
      "Natrium wird sehr stark gewichtet und bevorzugt niedrige Werte.",
      "Nitrat bleibt relevant, aber weniger streng als im Babyprofil.",
      "Mineralstoffe werden moderat bewertet.",
    ],
    metrics: [
      {
        metric: "sodium",
        label: "Natrium",
        importance: "sehr hoch",
        explanation:
          "In diesem Profil steht Natrium im Vordergrund, da es bei Bluthochdruck eine wichtige Rolle spielt.",
        hints: [
          "Niedrige Werte (< 20 mg/L) werden stark positiv bewertet.",
          "Hohe Natriumwerte führen schnell zu schlechteren Scores.",
        ],
      },
      {
        metric: "nitrate",
        label: "Nitrat",
        importance: "mittel",
        explanation:
          "Nitrat sollte nicht zu hoch sein, ist aber nicht so kritisch gewichtet wie im Babyprofil.",
        hints: [
          "Werte unter 25 mg/L sind gut.",
          "Werte über 50 mg/L sind grundsätzlich unerwünscht.",
        ],
      },
      {
        metric: "ph",
        label: "pH-Wert",
        importance: "mittel",
        explanation:
          "Ein angenehmer pH-Wert trägt zur Alltagstauglichkeit bei, steht aber nicht im Zentrum dieses Profils.",
        hints: ["Typische Trinkbereiche bleiben bevorzugt."],
      },
      {
        metric: "calcium",
        label: "Calcium",
        importance: "mittel",
        explanation:
          "Calcium bleibt wichtig für Knochen und Stoffwechsel, ohne überbetont zu werden.",
        hints: [
          "Moderate bis höhere Werte sind positiv, solange Natrium niedrig ist.",
        ],
      },
      {
        metric: "magnesium",
        label: "Magnesium",
        importance: "mittel",
        explanation:
          "Magnesium unterstützt Herz- und Muskelfunktion, bleibt aber sekundär gegenüber Natrium.",
        hints: ["Moderate Magnesiumwerte werden positiv gesehen."],
      },
      {
        metric: "bicarbonate",
        label: "Hydrogencarbonat",
        importance: "niedrig",
        explanation:
          "Hydrogencarbonat ist hier eher ein Nice-to-have und weniger relevant als Natrium.",
        hints: [
          "Es kann Magenfreundlichkeit unterstützen, spielt aber im Blutdruckprofil eine Nebenrolle.",
        ],
      },
      {
        metric: "sulfate",
        label: "Sulfat",
        importance: "niedrig",
        explanation:
          "Sulfat ist natürlich vorhanden und in moderaten Mengen unbedenklich.",
        hints: [
          "Niedrige bis moderate Werte sind unproblematisch.",
        ],
      },
      {
        metric: "chloride",
        label: "Chlorid",
        importance: "niedrig",
        explanation:
          "Chlorid ist ein natürlicher Bestandteil. Niedrige Werte sind vorteilhaft.",
        hints: [
          "Chlorid trägt zum Salzgeschmack bei – niedrige Werte bevorzugt.",
        ],
      },
      {
        metric: "potassium",
        label: "Kalium",
        importance: "mittel",
        explanation:
          "Kalium ist wichtig für die Blutdruckregulation und Herzfunktion. Höhere Kaliumzufuhr kann blutdrucksenkend wirken.",
        hints: [
          "Wasser trägt wenig bei, aber jeder Beitrag zählt.",
          "Hauptquellen: Obst, Gemüse, Hülsenfrüchte.",
        ],
      },
    ],
  },
} as const;

export type ProfileId = keyof typeof PROFILE_CHEATSHEET;
