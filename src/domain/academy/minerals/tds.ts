import { MineralArticle } from '../types';

export const tds: MineralArticle = {
    id: "tds",
    label: "Gesamtmineralisation (TDS)",
    emoji: "📊",
    shortDesc: "Summe aller gelösten Stoffe",
    topics: [
        {
            id: "overview",
            title: "Was ist TDS?",
            subtitle: "Total Dissolved Solids",
            content: `TDS steht für "Total Dissolved Solids" (Gesamtmenge gelöster Feststoffe). Es ist ein Sammelwert, der die Summe aller im Wasser gelösten Mineralstoffe und Salze angibt.

**Messung:**
TDS wird in Milligramm pro Liter (mg/L) oder parts per million (ppm) angegeben. 1 mg/L = 1 ppm.

Methoden zur TDS-Bestimmung:
- Gravimetrisch: Wasser verdampfen, Rückstand wiegen (genau)
- Elektrisch: Leitfähigkeitsmessung (schnell, aber Schätzwert)

**Was zählt zu TDS?**
Alle gelösten ionischen und molekularen Substanzen:
- Mineralstoffe: Calcium, Magnesium, Natrium, Kalium
- Anionen: Hydrogencarbonat, Sulfat, Chlorid, Nitrat
- Spurenelemente: Eisen, Mangan, Fluorid
- Organische Verbindungen (meist vernachlässigbar)

**WICHTIG: TDS ist eine "blinde Metrik"**
Die WHO bezeichnet TDS als "blinde Metrik" - der Wert sagt nichts über die Zusammensetzung aus! Zwei Wässer mit gleichem TDS können völlig unterschiedliche Mineralprofile haben:
- Wasser A (TDS 500): 400 mg Natrium + 100 mg Chlorid
- Wasser B (TDS 500): 150 mg Calcium + 100 mg Magnesium + 250 mg Hydrogencarbonat

Wasser B ist für die meisten Menschen gesünder, obwohl der TDS identisch ist!

**Typische TDS-Bereiche:**
| Kategorie | TDS (mg/L) |
|-----------|------------|
| Destilliertes Wasser | 0-10 |
| Sehr mineralarm | 10-100 |
| Mineralarm | 100-250 |
| Moderat | 250-500 |
| Mineralstoffreich | 500-1.000 |
| Sehr mineralstoffreich | >1.000 |
| Einige Heilwässer | 2.000-10.000+ |`
        },
        {
            id: "importance",
            title: "Was sagt TDS aus?",
            subtitle: "Begrenzte Aussagekraft",
            content: `TDS ist ein vielzitierter, aber oft missverstandener Wert. Hier die Fakten:

**Was TDS NICHT aussagt:**

1. **Wasserqualität:**
Ein niedriger TDS bedeutet NICHT automatisch "gesünder" oder "reiner". Mineralstoffe im Wasser sind meist positiv, nicht negativ.

2. **Schadstoffbelastung:**
TDS unterscheidet nicht zwischen nützlichen Mineralstoffen und Schadstoffen. Ein Wasser mit niedrigem TDS kann trotzdem Pestizide enthalten (die nicht gemessen werden).

3. **Gesundheitswirkung:**
Laut WHO gibt es keine wissenschaftliche Evidenz für direkte gesundheitliche Vorteile von "niedrig-TDS" Wasser.

**Was TDS TEILWEISE aussagt:**

1. **Geschmack:**
Höherer TDS = "mineralischer", charaktervoller Geschmack
Niedriger TDS = "weicher", neutraler Geschmack

2. **Wasserhärte:**
TDS korreliert oft (aber nicht immer) mit der Wasserhärte, da Calcium und Magnesium zum TDS beitragen.

3. **Geologischer Ursprung:**
- Niedriger TDS: oft Granit, kristallines Gestein
- Hoher TDS: oft Kalkstein, Sedimentgestein

**Der Mythos "je niedriger, desto besser":**
Diese Annahme ist wissenschaftlich nicht haltbar. Im Gegenteil:
- Mineralstoffarmes Wasser liefert weniger essentielle Nährstoffe
- Sehr reines Wasser (z.B. Osmosewasser) schmeckt oft "leer"
- Der Körper braucht Mineralstoffe aus verschiedenen Quellen

**Wann ist ein niedriger TDS sinnvoll?**
- Bei bestimmten Nierenerkrankungen (ärztliche Anweisung)
- Für technische Anwendungen (Dampfbügeleisen, Autobatterie)
- Für Aquarien mit speziellen Anforderungen

**Für die meisten Menschen gilt:**
Die spezifische Mineralzusammensetzung ist wichtiger als der TDS-Wert!`
        },
        {
            id: "ranges",
            title: "Einordnung",
            subtitle: "Typische Kategorien",
            content: `Hier eine Orientierung zur Einordnung von TDS-Werten:

**Unter 100 mg/L - Sehr mineralstoffarm:**
Eigenschaften:
- Sehr "weiches" Wasser
- Neutraler Geschmack
- Keine nennenswerte Mineralstoffzufuhr
- Oft aus Granitregionen oder Osmoseanlagen

Für wen geeignet:
- Nierenerkrankungen (nach ärztlicher Anweisung)
- Technische Anwendungen
- Wer sehr neutralen Geschmack bevorzugt

**100-500 mg/L - Moderat mineralisiert:**
Eigenschaften:
- "Mittleres" Wasser
- Leichter bis moderater Mineralgeschmack
- Guter Allrounder für den Alltag
- Die meisten deutschen Mineralwässer

Für wen geeignet:
- Praktisch alle Menschen
- Gute Balance aus Mineralstoffen und Geschmack

**500-1.000 mg/L - Mineralstoffreich:**
Eigenschaften:
- "Hartes" Wasser
- Deutlich mineralischer Geschmack
- Kann spürbar zur Mineralstoffversorgung beitragen
- Oft aus Kalk- oder Dolomitregionen

Für wen geeignet:
- Sportler
- Wer aktiv Mineralstoffe zuführen möchte
- Traditionelle "Heilwasser"-Trinker

**Über 1.000 mg/L - Sehr mineralstoffreich / Heilwasser:**
Eigenschaften:
- Sehr charakteristischer Geschmack
- Starke Mineralstoffzufuhr
- Oft spezifische therapeutische Anwendungen
- Kann für manche Menschen zu intensiv sein

Für wen geeignet:
- Für gezielte Therapiezwecke
- Nach ärztlicher Empfehlung
- Sportler in Extremsituationen

**Profilspezifische Empfehlungen:**

**Nieren (< 100 mg/L):**
Bei eingeschränkter Nierenfunktion sollte die Gesamtmineralisation niedrig sein, um die Nieren zu entlasten. Konkrete Werte mit Arzt absprechen.

**Sport (500+ mg/L):**
Mineralstoffreiches Wasser kann Elektrolytverluste ausgleichen. Auf Magnesium und Natrium achten.

**Kaffee/Tee (100-250 mg/L):**
Moderate TDS für gute Aromaentfaltung. Zu hohe TDS kann den Geschmack beeinflussen.

**Fazit:**
TDS ist ein Orientierungswert, aber NICHT das wichtigste Kriterium. Schauen Sie auf die einzelnen Mineralstoffe, nicht nur auf die Summe!`
        }
    ]
};
