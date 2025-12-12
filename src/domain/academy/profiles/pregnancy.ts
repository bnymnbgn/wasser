import { ProfileArticle } from '../types';

export const pregnancy: ProfileArticle = {
    id: "pregnancy",
    label: "Schwangerschaft",
    emoji: "🤰",
    shortDesc: "Schutz für Mutter und Kind",
    topics: [
        {
            id: "overview",
            title: "Warum ein Schwangerschafts-Profil?",
            subtitle: "Besondere Anforderungen",
            content: `Während der Schwangerschaft hat der Körper besondere Anforderungen an Trinkwasser. Was für gesunde Erwachsene unbedenklich ist, kann in der Schwangerschaft kritischer sein - schließlich trinkt das ungeborene Kind mit.

**Besondere Physiologie in der Schwangerschaft:**

**1. Erhöhter Flüssigkeitsbedarf:**
Der Blutvolumen steigt um 30-50% während der Schwangerschaft. Der Körper braucht mehr Flüssigkeit für:
- Die Bildung des Fruchtwassers
- Den erhöhten Stoffwechsel
- Die verstärkte Durchblutung der Plazenta

Empfehlung: 2,5-3 Liter Flüssigkeit pro Tag.

**2. Erhöhte Empfindlichkeit:**
Bestimmte Stoffe können die Plazentaschranke passieren und das ungeborene Kind erreichen. Daher gelten ähnlich strenge Maßstäbe wie beim Baby-Profil.

**3. Veränderter Mineralstoffbedarf:**
- Calcium: Erhöhter Bedarf für die Knochenentwicklung des Kindes
- Magnesium: Wichtig gegen Wadenkrämpfe und für die Gebärmuttermuskulatur
- Eisen: Stark erhöhter Bedarf (nicht im Wasser relevant)

**WICHTIGER HINWEIS:**
Dieses Profil ersetzt keine ärztliche Beratung. Besprechen Sie Ihre Ernährung und Flüssigkeitszufuhr mit Ihrem Frauenarzt oder Ihrer Hebamme.`
        },
        {
            id: "criteria",
            title: "Bewertungskriterien",
            subtitle: "Was wir prüfen",
            content: `Für Schwangere gelten ähnlich strenge Kriterien wie für Babys - mit einigen Anpassungen:

**KRITISCH - Strikte Einhaltung empfohlen:**

**Nitrat: unter 10 mg/L**
Nitrat ist auch für Schwangere kritisch:
- Kann im Körper zu Nitrit umgewandelt werden
- Erhöhtes Risiko für Methämoglobinbildung
- Kann die Plazentaschranke passieren

Der strenge Babygrenzwert (10 mg/L) ist auch für Schwangere empfehlenswert.

**Natrium: unter 20 mg/L bevorzugt**
Viele Schwangere neigen zu Wassereinlagerungen (Ödemen). Natriumarmes Wasser kann helfen:
- Weniger Wasserretention
- Unterstützt bei Schwangerschafts-Bluthochdruck
- Entlastet die Nieren

**Fluorid: unter 1,0 mg/L**
Weniger streng als beim Baby (0,7 mg/L), aber weiterhin relevant für die Zahnentwicklung des ungeborenen Kindes.

**POSITIV - Höhere Werte erwünscht:**

**Calcium: 100-200 mg/L**
Erhöhter Bedarf in der Schwangerschaft für:
- Knochenentwicklung des Kindes
- Erhalt der mütterlichen Knochenmasse
- Normale Muskelfunktion

Calciumreiches Wasser ist eine gute Ergänzung zur Ernährung.

**Magnesium: 50-80 mg/L empfohlen**
Magnesium hilft bei typischen Schwangerschaftsbeschwerden:
- Wadenkrämpfe (häufig im 2./3. Trimester)
- Vorzeitige Wehen (entspannt die Gebärmutter)
- Stressabbau und besserer Schlaf

**WEITERE PARAMETER:**

**Hydrogencarbonat: positiv**
Kann bei Sodbrennen helfen - ein häufiges Problem in der Schwangerschaft (besonders 3. Trimester).

**Sulfat: unter 200 mg/L**
Hohe Sulfatwerte können abführend wirken - bei Schwangerschaftsverstopfung manchmal erwünscht, aber höhere Werte mit Arzt besprechen.`
        },
        {
            id: "tips",
            title: "Praktische Tipps",
            subtitle: "Für die Schwangerschaft",
            content: `**Trinkmenge in der Schwangerschaft:**

Die empfohlene Trinkmenge steigt in der Schwangerschaft:
- 1. Trimester: 2-2,5 Liter/Tag
- 2./3. Trimester: 2,5-3 Liter/Tag
- Stillzeit: 2,5-3 Liter/Tag (zusätzlich zur Milchproduktion)

**Tipps gegen typische Beschwerden:**

**Übelkeit (1. Trimester):**
- Stilles Wasser bevorzugen
- Kleine Mengen über den Tag verteilt
- Zimmertemperatur statt eiskalt
- Evtl. mit Zitronenscheibe oder Ingwer

**Sodbrennen (3. Trimester):**
- Hydrogencarbonatreiches Wasser wählen (>600 mg/L)
- Kleine Schlücke, nicht große Mengen auf einmal
- Aufrecht bleiben nach dem Trinken

**Wadenkrämpfe:**
- Magnesiumreiches Wasser (>50 mg/L)
- Abends ein großes Glas vor dem Schlafengehen
- Calcium nicht vergessen

**Wassereinlagerungen:**
- Natriumarmes Wasser (<20 mg/L)
- Kaliumreiche Ernährung unterstützend
- NICHT weniger trinken (häufiger Irrglaube!)

**Verstopfung:**
- Sulfatreiches Wasser kann helfen
- Morgens auf nüchternen Magen trinken
- Ausreichend Bewegung

**Was vermeiden:**

- Leitungswasser aus alten Bleirohren (Blei ist für Ungeborene gefährlich)
- Wasser aus privaten Brunnen ohne Analyse
- Kohlensäurehaltiges Wasser bei Übelkeit oder Sodbrennen

**Wasser-Empfehlung zusammengefasst:**
| Parameter | Empfehlung |
|-----------|------------|
| Nitrat | < 10 mg/L |
| Natrium | < 20 mg/L |
| Fluorid | < 1,0 mg/L |
| Calcium | 100-200 mg/L |
| Magnesium | 50-80 mg/L |
| Hydrogencarbonat | > 600 mg/L ideal |

Viele als "für Säuglingsnahrung geeignet" gekennzeichnete Wässer erfüllen auch die Schwangerschaftskriterien - mit dem Bonus von etwas mehr Calcium und Magnesium.`
        }
    ]
};
