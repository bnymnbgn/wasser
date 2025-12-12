import { MineralArticle } from '../types';

export const calcium: MineralArticle = {
    id: "calcium",
    label: "Calcium",
    emoji: "🦴",
    shortDesc: "Gut für Knochen & Zähne",
    topics: [
        {
            id: "overview",
            title: "Was ist Calcium?",
            subtitle: "Der Baustein für Knochen",
            content: `Calcium ist der mengenmäßig wichtigste Mineralstoff im menschlichen Körper und spielt eine fundamentale Rolle für unsere Gesundheit. Ein Erwachsener trägt etwa 1-1,2 kg Calcium in sich - das macht etwa 1,5-2% des gesamten Körpergewichts aus.

**Verteilung im Körper:**
- 99% in Knochen und Zähnen (als Hydroxylapatit Ca₁₀(PO₄)₆(OH)₂)
- 1% in Blut, Muskeln und Nerven (aber lebenswichtig für viele Prozesse!)

Diese scheinbar geringe Menge von 1% im Blut und Gewebe ist trügerisch: Sie ist absolut essentiell für Muskelkontraktion, Nervenfunktion und Blutgerinnung. Der Körper hält den Calciumspiegel im Blut (ca. 2,2-2,6 mmol/L) extrem konstant - notfalls durch Abbau aus den Knochen.

**Calcium im Wasser - eine unterschätzte Quelle:**
Mineralwasser kann eine wichtige und unterschätzte Calciumquelle sein. Wissenschaftliche Studien belegen eindeutig: Die Bioverfügbarkeit von Calcium aus Wasser liegt bei 30-40% - das ist vergleichbar oder sogar besser als aus Milchprodukten! 

Eine Studie der Universität Bonn zeigte, dass der Körper Calcium aus Wasser genauso gut aufnehmen kann wie aus Milch. Dies macht calciumreiches Mineralwasser besonders wertvoll für:
- Menschen mit Laktoseintoleranz
- Veganer
- Personen, die keine Milchprodukte mögen

**Gesetzliche Kennzeichnung:**
Ab 150 mg/L darf ein Wasser als "calciumhaltig" beworben werden. Einige Heilwässer enthalten über 500 mg/L.

**Geologischer Ursprung:**
Calciumreiches Wasser stammt typischerweise aus:
- Kalksteinregionen (Calciumcarbonat CaCO₃)
- Dolomitgebirgen (Calcium-Magnesium-Carbonat)
- Vulkanischen Gebieten

Die Calciumkonzentration in Mineralwässern kann enorm variieren:
- Sehr calciumarm: < 20 mg/L (weiches Wasser)
- Moderat: 50-150 mg/L
- Calciumreich: 150-300 mg/L
- Sehr calciumreich: > 300 mg/L (einige Heilwässer über 500 mg/L)

**Calcium und Wasserhärte:**
Calcium ist zusammen mit Magnesium der Hauptverursacher der Wasserhärte. Hartes Wasser (> 14°dH bzw. > 2,5 mmol/L) enthält typischerweise über 80 mg/L Calcium.`
        },
        {
            id: "importance",
            title: "Warum ist Calcium wichtig?",
            subtitle: "Mehr als nur Knochen",
            content: `Calcium erfüllt zahlreiche lebenswichtige Funktionen - die Knochenstabilität ist nur die bekannteste:

**1. Knochen- und Zahngesundheit (Hauptfunktion):**
Calcium ist der Hauptbestandteil des Knochengerüsts. Die Knochen sind kein statisches Gerüst, sondern werden ständig umgebaut:
- Bis zum 30. Lebensjahr wird aktiv Knochenmasse aufgebaut ("Peak Bone Mass")
- Danach beginnt der langsame Abbau (ca. 1% pro Jahr)
- Bei Frauen nach der Menopause: bis zu 3-5% Abbau pro Jahr

Eine ausreichende Calciumzufuhr ist lebenslang wichtig, besonders für die Osteoporose-Prävention. In Deutschland sind etwa 6 Millionen Menschen von Osteoporose betroffen.

**2. Muskelkontraktion:**
Calcium ermöglicht die Kontraktion aller Muskeln - von der Skelettmuskulatur bis zum Herzmuskel. Der Mechanismus: Calciumionen strömen in die Muskelzelle und lösen über Troponin die Kontraktion aus. Bei jedem Herzschlag ist Calcium beteiligt - etwa 100.000 mal am Tag.

**3. Blutgerinnung:**
Ohne Calcium würde das Blut bei Verletzungen nicht gerinnen. Calcium (Gerinnungsfaktor IV) ist ein wichtiger Cofaktor in der Gerinnungskaskade. Interessanterweise verhindert man im Labor die Blutgerinnung durch Calciumbindung (EDTA, Citrat).

**4. Nervenfunktion und Signalübertragung:**
Calcium ist essentiell für:
- Die Freisetzung von Neurotransmittern an Synapsen
- Die Signalübertragung zwischen Nervenzellen
- Die Erregungsleitung im Herzmuskel

**5. Enzymaktivierung:**
Zahlreiche Enzyme benötigen Calcium als Cofaktor für ihre Funktion, darunter wichtige Verdauungsenzyme.

**6. Zellteilung und -differenzierung:**
Calcium spielt eine Rolle bei der Regulation des Zellzyklus und ist an Wachstumsprozessen beteiligt.

**Empfohlene Tageszufuhr (D-A-CH-Referenzwerte):**
| Alter | Empfehlung |
|-------|------------|
| Säuglinge (0-4 Monate) | 220 mg |
| Säuglinge (4-12 Monate) | 330 mg |
| Kinder (1-4 Jahre) | 600 mg |
| Kinder (4-7 Jahre) | 750 mg |
| Kinder (7-10 Jahre) | 900 mg |
| Jugendliche (10-19 Jahre) | 1.100-1.200 mg |
| Erwachsene (19-65 Jahre) | 1.000 mg |
| Senioren (65+ Jahre) | 1.000 mg |
| Schwangere/Stillende | 1.000 mg |

**Calciumaufnahme fördern:**
Vitamin D ist der Schlüssel! Es ist essentiell für die Calciumaufnahme im Darm. Ohne ausreichend Vitamin D wird selbst bei hoher Calciumzufuhr nur wenig resorbiert. Sonnenlicht (20 min/Tag) fördert die körpereigene Vitamin-D-Synthese.

**Calciumaufnahme hemmen können:**
- Oxalsäure (Spinat, Rhabarber, Rote Beete)
- Phytate (Getreide, Hülsenfrüchte, Nüsse)
- Zu viel Koffein (> 4 Tassen Kaffee/Tag)
- Zu viel Natrium (erhöht Calciumausscheidung)
- Zu viel Phosphat (Cola-Getränke, Wurstwaren)
- Bestimmte Medikamente (Cortison, Protonenpumpenhemmer)

**Symptome bei Calciummangel:**
- Muskelkrämpfe
- Kribbeln in Händen und Füßen
- Brüchige Nägel
- Langfristig: erhöhtes Osteoporoserisiko`
        },
        {
            id: "ranges",
            title: "Ideale Wertbereiche",
            subtitle: "Profil-spezifische Empfehlungen",
            content: `Die optimalen Calciumwerte im Wasser hängen vom individuellen Profil und Verwendungszweck ab:

**Standard / Gesunde Erwachsene (50-150 mg/L) - EMPFOHLEN:**
Ein guter Beitrag zur täglichen Calciumversorgung. Rechenbeispiel:
- Bei 2 Litern Wasser mit 100 mg/L: 200 mg Calcium
- Das sind bereits 20% des Tagesbedarfs!
- Bei 2 Litern mit 150 mg/L: 300 mg = 30% des Tagesbedarfs

Besonders wertvoll für Personen, die wenig Milchprodukte konsumieren.

**Sport & Fitness (80-200 mg/L) - SEHR EMPFOHLEN:**
Sportler haben erhöhten Calciumbedarf durch:
- Verstärkte mechanische Knochenbelastung
- Schweißverluste (ca. 40-80 mg Calcium pro Stunde bei intensivem Sport)
- Erhöhten Stoffwechsel

Calciumreiches Wasser unterstützt die Regeneration und Knochengesundheit. Besonders wichtig für Ausdauersportler, Läufer und bei hohen Trainingsumfängen.

**Osteoporose-Prävention / Menopause (>150 mg/L) - SEHR EMPFOHLEN:**
Besonders für Frauen nach der Menopause empfehlenswert, da der Östrogenmangel zu beschleunigtem Knochenabbau führt. Calciumreiches Mineralwasser ist eine einfache, kalorienfrei Möglichkeit, die Zufuhr zu erhöhen.

Kombination mit Vitamin D und regelmäßiger Bewegung ist optimal.

**Veganer & Laktoseintolerante (>150 mg/L) - WICHTIG:**
Calciumreiches Wasser kann einen wichtigen Beitrag zur Versorgung leisten, wenn Milchprodukte wegfallen. Alternative pflanzliche Calciumquellen:
- Grünkohl, Brokkoli
- Angereicherte Pflanzenmilch
- Sesam, Mandeln
- Tofu (mit Calciumsulfat)

**Baby & Kleinkind (unter 100 mg/L):**
Moderate Calciumwerte sind für Säuglingsnahrung geeignet. Zu hohe Konzentrationen können:
- Die Balance mit anderen Mineralstoffen stören
- Die Aufnahme anderer Nährstoffe beeinflussen

Auf entsprechende Kennzeichnung ("Für Säuglingsnahrung geeignet") achten.

**Kaffee & Tee / Weiches Wasser (30-80 mg/L):**
Für gute Aromaentfaltung bei Kaffee und Tee. Zu viel Calcium:
- Macht Wasser "hart"
- Beeinflusst den Geschmack negativ
- Kann zur Kalkbildung in Kaffeemaschinen führen

Die SCA (Specialty Coffee Association) empfiehlt 40-80 mg/L Calcium.

**Calcium und Wasserhärte - Zusammenhang:**
| Härtebereich | °dH | Ca + Mg gesamt |
|--------------|-----|----------------|
| Weich | < 8,4 | < 1,5 mmol/L |
| Mittel | 8,4-14 | 1,5-2,5 mmol/L |
| Hart | > 14 | > 2,5 mmol/L |

Sehr hartes Wasser (über 21°dH) enthält typischerweise über 100 mg/L Calcium.

**Praxisbeispiel - Calciumversorgung mit Wasser:**
2 Liter calciumreiches Wasser (150 mg/L) liefern 300 mg Calcium.
Zum Vergleich:
- 250 ml Milch ≈ 300 mg Calcium
- 30 g Emmentaler ≈ 340 mg Calcium
- 150 g Joghurt ≈ 180 mg Calcium

Fazit: Calciumreiches Wasser kann einen erheblichen Beitrag zur Versorgung leisten, besonders als Teil einer bewussten Ernährung.`
        }
    ]
};
