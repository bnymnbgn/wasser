import { MineralArticle } from '../types';

export const carbonation: MineralArticle = {
    id: "carbonation",
    label: "Kohlensäure",
    emoji: "🫧",
    shortDesc: "Sprudel, Medium oder Still",
    topics: [
        {
            id: "overview",
            title: "Was ist Kohlensäure?",
            subtitle: "Das Prickeln im Wasser",
            content: `Kohlensäure (CO₂ in wässriger Lösung) ist für das charakteristische Prickeln in Mineralwasser verantwortlich. Sie entsteht, wenn Kohlendioxid (CO₂) in Wasser gelöst wird.

**Chemie der Kohlensäure:**
CO₂ + H₂O ⇌ H₂CO₃ (Kohlensäure)

Tatsächlich liegt nur ein kleiner Teil als echte Kohlensäure vor – der Großteil bleibt als gelöstes CO₂ im Wasser.

**Herkunft der Kohlensäure:**
- **Natürliche Quellkohlensäure:** Vulkanischen Ursprungs, aus tiefen Erdschichten
- **Zugesetzte Kohlensäure:** Industriell hergestelltes CO₂
- **Eigene Quellkohlensäure:** Das Wasser enthält von Natur aus CO₂

Auf dem Etikett erkennbar an Formulierungen wie:
- "Mit natürlicher Kohlensäure" (aus der gleichen Quelle)
- "Mit Kohlensäure versetzt" (zugesetzt)
- "Mit eigener Quellkohlensäure" (natürlich enthalten)

**Kohlensäuregehalte:**
Die Angabe erfolgt meist indirekt über die Bezeichnung:
| Bezeichnung | CO₂-Gehalt (ca.) |
|-------------|------------------|
| Still | < 250 mg/L |
| Leicht / Sanft | 250-1.000 mg/L |
| Medium | 1.500-2.500 mg/L |
| Classic / Sprudel | 4.000-7.000 mg/L |

Der genaue CO₂-Gehalt wird selten auf dem Etikett angegeben.`
        },
        {
            id: "importance",
            title: "Wirkungen von Kohlensäure",
            subtitle: "Mehr als nur Geschmack",
            content: `Kohlensäure beeinflusst sowohl Geschmack als auch körperliche Prozesse:

**Positive Aspekte:**

**1. Geschmack & Erfrischung:**
- Das Prickeln aktiviert Geschmacksrezeptoren
- Intensiviert die Wahrnehmung von Aromen
- Vermittelt ein Gefühl von Frische

**2. Haltbarkeit:**
- CO₂ wirkt leicht konservierend
- Hemmt das Wachstum bestimmter Mikroorganismen
- Kohlensäurehaltiges Wasser ist länger haltbar

**3. Verdauung:**
- Kann die Magenentleerung beschleunigen
- Manche Menschen empfinden es als verdauungsfördernd
- Kann das Sättigungsgefühl leicht erhöhen

**Mögliche Nachteile:**

**1. Magenbeschwerden:**
- Bei empfindlichem Magen kann Kohlensäure reizen
- Kann Aufstoßen und Blähungen verursachen
- Bei Sodbrennen oft ungünstig

**2. Zahngesundheit:**
- Kohlensäure senkt den pH-Wert leicht (ca. pH 4-5)
- Säure kann Zahnschmelz angreifen
- Weniger problematisch als Fruchtsäuren in Limonaden
- Neutraler pH wird schnell durch Speichel wiederhergestellt

**3. Babys & Kleinkinder:**
- Kohlensäure kann Blähungen verursachen
- Der empfindliche Verdauungstrakt wird gereizt
- Stilles Wasser ist für Säuglingsnahrung Standard

**Wissenschaftliche Einordnung:**
Studien zeigen, dass moderater Konsum von kohlensäurehaltigem Wasser für gesunde Erwachsene unbedenklich ist. Die Effekte auf die Knochendichte, die manchmal diskutiert werden, konnten wissenschaftlich nicht bestätigt werden.`
        },
        {
            id: "ranges",
            title: "Empfehlungen nach Profil",
            subtitle: "Welches Sprudeln passt zu mir?",
            content: `Die optimale Kohlensäuremenge hängt stark vom individuellen Profil ab:

**Baby & Kleinkind – STILL (< 250 mg/L):**
Stilles Wasser ist für Säuglingsnahrung Pflicht:
- Vermeidet Blähungen und Koliken
- Schont den empfindlichen Verdauungstrakt
- Auf "Für Säuglingsnahrung geeignet" achten

**Schwangerschaft – STILL bis LEICHT:**
- Still ist am verträglichsten
- Kohlensäure kann Sodbrennen verstärken
- Bei gutem Befinden ist Medium gelegentlich okay

**Sodbrennen / Magenprobleme – STILL:**
- Kohlensäure kann Reflux-Beschwerden verstärken
- Stilles Wasser neutraler für den Magen
- Bicarbonatreiches stilles Wasser kann zusätzlich helfen

**Sport & Fitness – STILL bis MEDIUM:**
- Während Training: Still bevorzugt (weniger Aufstoßen)
- Nach Training: Medium kann erfrischend sein
- Stark sprudelnd kann Trinkmenge reduzieren

**Kaffee & Tee – STILL:**
- Für die Zubereitung immer stilles Wasser
- Kohlensäure würde beim Erhitzen entweichen
- Kein Vorteil, nur Nachteile

**Standard / Alltag – GESCHMACKSSACHE:**
- Medium ist oft der Allrounder
- Classic/Sprudel für Erfrischung
- Still für hohe Trinkmengen praktischer

**Praxistipp - Kohlensäure erhalten:**
- Kühl lagern (CO₂ bleibt besser in Lösung)
- Flasche gut verschließen
- Nicht schütteln

**Im Score:**
Kohlensäure wird profilabhängig bewertet:
- Baby-Profil: Still = 100 Punkte, Classic = niedrig
- Standard-Profil: Neutral bewertet (Geschmackssache)`
        }
    ]
};
