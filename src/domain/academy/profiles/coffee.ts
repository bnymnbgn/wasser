import { ProfileArticle } from '../types';

export const coffee: ProfileArticle = {
    id: "coffee",
    label: "Kaffee & Genuss",
    emoji: "☕",
    shortDesc: "Weiches Wasser für perfekten Kaffee",
    topics: [
        {
            id: "overview",
            title: "Warum spezielles Kaffeewasser?",
            subtitle: "Die Chemie des Kaffees",
            content: `Kaffee besteht zu 98% aus Wasser. Die Wasserqualität beeinflusst direkt und erheblich den Geschmack Ihrer Tasse Kaffee - mehr als den meisten Kaffeeliebhabern bewusst ist.

**Das Problem mit hartem Wasser:**
Hartes Wasser (hoher Calcium- und Magnesiumgehalt) neutralisiert wichtige Geschmackskomponenten:
- Fruchtsäuren werden gepuffert
- Helle, lebendige Aromen gehen verloren
- Kaffee schmeckt flach und "stumpf"

**Das Problem mit zu weichem Wasser:**
Sehr weiches Wasser (niedriger TDS) führt zu Über-Extraktion:
- Zu viele unerwünschte Stoffe werden gelöst
- Kaffee wird bitter und unangenehm
- Säure kann überwältigend werden

**Die goldene Mitte:**
Ideales Kaffeewasser hat eine moderate Mineralisation - nicht zu hart, nicht zu weich.

**Wissenschaftlicher Hintergrund:**
Die Specialty Coffee Association (SCA) hat in umfangreichen Studien die optimalen Wasserparameter für Kaffee definiert. Diese werden von Baristas weltweit als Standard verwendet.

**Gilt das auch für Tee?**
Ja! Für Tee gelten ähnliche Prinzipien:
- Grüner Tee: weiches Wasser bevorzugt
- Schwarzer Tee: moderates Wasser
- Sehr hartes Wasser trübt den Tee und hemmt Aromen

**Espresso vs. Filterkaffee:**
Unterschiedliche Zubereitungsmethoden reagieren unterschiedlich auf Wasserhärte:
- Espresso: reagiert empfindlicher auf Wasserqualität
- Filterkaffee: toleranter, aber Qualität zählt
- Cold Brew: Wasserqualität sehr wichtig (lange Extraktionszeit)`
        },
        {
            id: "criteria",
            title: "Ideales Kaffeewasser",
            subtitle: "Die SCA-Empfehlungen",
            content: `Die Specialty Coffee Association (SCA) hat präzise Parameter für optimales Kaffeewasser definiert:

**Gesamthärte: 50-175 mg/L CaCO₃ (3-10 °dH)**
Dies entspricht:
- Weichem bis mittelhartem Wasser
- Ca. 20-70 mg/L Calcium
- Ca. 10-30 mg/L Magnesium

Zu hoch: Flache Aromen
Zu niedrig: Über-Extraktion, Bitterkeit

**Karbonathärte (Alkalinität): 40-80 mg/L CaCO₃**
Die Karbonathärte (primär Hydrogencarbonat) beeinflusst:
- Die Säurewahrnehmung im Kaffee
- Die Extraktionseffizienz
- Die Pufferkapazität des Wassers

Zu hoch: Säuren werden neutralisiert, Kaffee schmeckt "tot"
Zu niedrig: Säure kann dominant werden

**pH-Wert: 6,5-7,5 (neutral)**
- Leicht sauer bis neutral
- Beeinflusst Extraktion und Geschmack
- Chlorhaltige Wässer haben oft instabilen pH

**Natrium: Unter 10 mg/L**
- Höhere Werte können den Geschmack beeinflussen
- Salz verdeckt feine Aromen

**Chlor/Chlorid: So niedrig wie möglich**
- Chlor (aus Wasseraufbereitung) zerstört Kaffee-Aromen
- Chlorid ist weniger problematisch, aber niedrige Werte bevorzugt
- Leitungswasser: Chlor verflüchtigt sich beim Stehenlassen

**Gesamtmineralisation (TDS): 75-250 mg/L**
- Gute Balance für Extraktion
- Nicht zu mineralarm, nicht zu mineralreich

**ZUSAMMENFASSUNG - DAS IDEALE KAFFEEWASSER:**
| Parameter | Ideal | Akzeptabel |
|-----------|-------|------------|
| Gesamthärte | 50-175 mg/L CaCO₃ | 20-200 mg/L |
| Karbonathärte | 40-80 mg/L | 30-100 mg/L |
| pH | 7,0 | 6,5-7,5 |
| TDS | 100-175 mg/L | 75-250 mg/L |
| Natrium | <10 mg/L | <20 mg/L |
| Chlor | 0 | 0 |`
        },
        {
            id: "practical",
            title: "Praktische Umsetzung",
            subtitle: "Tipps für besseren Kaffee",
            content: `So verbessern Sie Ihren Kaffee durch besseres Wasser:

**Option 1: Das richtige Mineralwasser wählen**
Suchen Sie auf dem Etikett nach:
- Calcium: 20-70 mg/L
- Magnesium: 10-30 mg/L
- Hydrogencarbonat: 50-150 mg/L
- Natrium: unter 20 mg/L
- Gesamtmineralisation: 100-250 mg/L

Viele deutsche Mineralwässer erfüllen diese Kriterien.

**Option 2: Leitungswasser optimieren**
Wenn Ihr Leitungswasser zu hart ist:
- Tischwasserfilter (z.B. Brita) reduzieren Kalk
- Achtung: Filter können Geschmack verändern
- Filter regelmäßig wechseln!

Wenn Ihr Leitungswasser zu chlorhaltig ist:
- Wasser in Karaffe stehen lassen (Chlor verflüchtigt sich)
- Aktivkohlefilter entfernt Chlor effektiv

**Option 3: Spezielle Kaffee-Wasserprodukte**
Es gibt speziell für Kaffee konzipierte Wasserprodukte:
- Third Wave Water (Mineralzusätze)
- Spezielle Kaffeewasser-Marken
- Apotheken-Wasser (oft geeignet)

**Die Maschine schützen:**
Zu hartes Wasser schadet auch der Kaffeemaschine:
- Kalkablagerungen verstopfen Leitungen
- Heizung arbeitet ineffizient
- Regelmäßiges Entkalken nötig

Weiches Wasser verlängert die Lebensdauer der Maschine!

**Experiment: Wasservergleich**
Brühen Sie denselben Kaffee mit verschiedenen Wässern:
- Ihr Leitungswasser
- Ein mineralstoffarmes Wasser
- Ein mittelhartes Mineralwasser

Sie werden überrascht sein, wie unterschiedlich der Kaffee schmeckt!

**Für Profis: Third Wave Water**
Baristas mischen oft ihr eigenes Wasser mit definierten Mineralzusätzen. Das erlaubt perfekte Kontrolle über die Wasserchemie:
- Magnesiumsulfat (für Süße)
- Calciumchlorid (für Körper)
- Natriumbicarbonat (für pH-Puffer)`
        }
    ]
};
