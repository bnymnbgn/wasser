import { MineralArticle } from '../types';

export const ph: MineralArticle = {
    id: "ph",
    label: "pH-Wert",
    emoji: "⚗️",
    shortDesc: "Säure-Basen-Balance",
    topics: [
        {
            id: "overview",
            title: "Was ist der pH-Wert?",
            subtitle: "Grundlagen verstehen",
            content: `Der pH-Wert gibt an, wie sauer oder basisch (alkalisch) eine Flüssigkeit ist. Er ist eine der fundamentalsten Eigenschaften von Wasser und beeinflusst Geschmack, Verträglichkeit und technische Anwendungen.

**Die pH-Skala:**
Die Skala reicht von 0 bis 14:
- pH 0-6,9: Sauer (je niedriger, desto saurer)
- pH 7,0: Neutral (reines Wasser bei 25°C)
- pH 7,1-14: Basisch/alkalisch (je höher, desto basischer)

Die Skala ist logarithmisch: Ein pH-Unterschied von 1 bedeutet einen 10-fachen Unterschied in der Wasserstoffionen-Konzentration!

**Typische pH-Werte zum Vergleich:**
| Substanz | pH-Wert |
|----------|---------|
| Magensäure | 1,0-2,0 |
| Zitronensaft | 2,0-2,5 |
| Cola | 2,5 |
| Orangensaft | 3,5 |
| Kaffee | 5,0 |
| Milch | 6,5-6,8 |
| Reines Wasser | 7,0 |
| Blut | 7,35-7,45 |
| Meerwasser | 8,0-8,4 |
| Seife | 9-10 |

**pH-Wert von Trinkwasser:**
- Trinkwasserverordnung: 6,5-9,5 (empfohlen 7,0-8,5)
- Mineralwasser: typisch 5,5-8,0
- Kohlensäurehaltiges Wasser: oft 4,5-5,5 (durch gelöstes CO₂)

**Warum variiert der pH in Mineralwasser?**
Der pH-Wert wird beeinflusst durch:
- Gelöste Kohlensäure (senkt den pH)
- Hydrogencarbonat (puffert, stabilisiert den pH)
- Geologischen Ursprung der Quelle
- Mineralzusammensetzung

**Kohlensäure und pH:**
Viele Menschen wissen nicht: Kohlensäurehaltiges Wasser ist sauer! Gelöstes CO₂ bildet mit Wasser Kohlensäure (H₂CO₃). Ein stark sprudelndes Wasser hat oft pH 4,5-5,5. Das ist ähnlich sauer wie schwarzer Kaffee.`
        },
        {
            id: "importance",
            title: "Warum ist der pH-Wert wichtig?",
            subtitle: "Geschmack und Verträglichkeit",
            content: `Der pH-Wert beeinflusst mehrere Aspekte von Wasser, aber sein Einfluss auf die Gesundheit wird oft überschätzt:

**1. Geschmack:**
Der pH-Wert beeinflusst deutlich den Geschmack von Wasser:
- Leicht saures Wasser (pH 5,5-6,5): Schmeckt frischer, spritziger
- Neutrales Wasser (pH 7,0-7,5): Neutral, "weich"
- Leicht basisches Wasser (pH 7,5-8,5): Kann leicht seifig schmecken
- Stark basisches Wasser (>8,5): Oft unangenehm, "laugig"

**2. Magenfreundlichkeit:**
- Basisches Wasser (pH >7,5): Kann kurzfristig Magensäure neutralisieren
- Bei häufigem Sodbrennen kann leicht basisches Wasser helfen
- Hydrogencarbonatreiches Wasser puffert zusätzlich

ABER: Der Effekt ist begrenzt, da der Magen ständig neue Säure produziert.

**3. Kaffee und Tee:**
Für optimale Aromaentfaltung ist ein neutraler pH (6,5-7,5) ideal:
- Zu saures Wasser: Überextraktion, bitterer Kaffee
- Zu basisches Wasser: Flache, matte Aromen
- Die SCA (Specialty Coffee Association) empfiehlt pH 7,0

**4. Der Körper regelt selbst:**
Ein verbreiteter Mythos: "Basisches Wasser macht den Körper basisch". Das ist wissenschaftlich nicht haltbar:
- Der Körper reguliert seinen pH-Wert selbst (Homöostase)
- Das Blut hält konstant pH 7,35-7,45
- Puffersysteme (Bicarbonat, Phosphat, Proteine) gleichen sofort aus
- Der Magen ist immer sauer (pH 1-2), egal was man trinkt
- Die Nieren und Lungen regulieren den Säure-Basen-Haushalt

**5. "Alkalisches Wasser" - Hype vs. Wissenschaft:**
"Alkalisches" oder "basisches" Wasser wird oft als Gesundheitswunder beworben. Die wissenschaftliche Evidenz ist jedoch dünn:
- Keine überzeugenden Studien für gesundheitliche Vorteile bei Gesunden
- Der Körper braucht kein "basisches" Wasser
- Natürliche Mineralwässer mit höherem pH haben oft einfach mehr Hydrogencarbonat

Fazit: Der pH-Wert ist für Geschmack und technische Anwendungen relevant, aber keine primäre Gesundheitsmetrik.`
        },
        {
            id: "ranges",
            title: "Typische Wertbereiche",
            subtitle: "Was ist normal?",
            content: `Hier eine Übersicht der typischen und empfohlenen pH-Werte:

**Optimal für die meisten Anwendungen: pH 6,5-7,5**
Dies ist der "Goldilocks-Bereich":
- Geschmacklich neutral bis angenehm
- Gut verträglich
- Optimal für Kaffee und Tee
- Entspricht etwa dem Blut-pH

**Stilles Mineralwasser: pH 6,5-8,0**
Ohne Kohlensäure zeigt das Wasser seinen "natürlichen" pH, geprägt durch die Mineralzusammensetzung:
- Hydrogencarbonatreich: tendenziell höherer pH
- Mineralarm: oft neutral

**Kohlensäurehaltiges Wasser: pH 4,5-6,0**
Karbonisierte Wässer sind durch die gelöste Kohlensäure immer sauer:
- Classic/sprudelnd: pH 4,5-5,0
- Medium: pH 5,0-5,5
- Leicht: pH 5,5-6,0
- Naturell/still: pH 6,5-8,0

**Leitungswasser: pH 7,0-8,5**
Trinkwasser wird oft leicht alkalisiert, um Korrosion in Rohren zu vermeiden.

**Für spezielle Anwendungen:**

**Kaffee/Tee:**
- Optimal: pH 6,5-7,5
- Zu sauer: Überextraktion, Bitterkeit
- Zu basisch: Flache Aromen

**Bei Sodbrennen:**
- Leicht basisches Wasser (pH 7,5-8,5) kann kurzfristig helfen
- Hydrogencarbonatreiches Wasser noch effektiver

**Für Babys:**
- Keine spezifischen pH-Vorgaben
- Die meisten "für Säuglingsnahrung geeigneten" Wässer haben pH 6,5-7,5

**pH-Wert messen:**
- pH-Teststreifen: günstig, aber ungenau
- Digitales pH-Meter: genauer, für Enthusiasten
- Laboranalyse: präzise, meist vom Hersteller angegeben

**Praktische Bedeutung:**
Der pH-Wert allein sagt wenig über die Wasserqualität aus. Wichtiger ist die Gesamtmineralisation und das Verhältnis der einzelnen Mineralstoffe. Ein Wasser mit pH 6,8 kann qualitativ hervorragend sein, eines mit pH 8,0 ebenfalls - entscheidend ist die Zusammensetzung.`
        }
    ]
};
