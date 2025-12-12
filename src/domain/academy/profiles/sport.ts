import { ProfileArticle } from '../types';

export const sport: ProfileArticle = {
    id: "sport",
    label: "Sport & Fitness",
    emoji: "🏃",
    shortDesc: "Optimiert für Regeneration",
    topics: [
        {
            id: "overview",
            title: "Warum ein Sport-Profil?",
            subtitle: "Elektrolyte im Fokus",
            content: `Sportler und aktive Menschen haben einen deutlich erhöhten Bedarf an Flüssigkeit und Mineralstoffen. Was für den Alltag ausreicht, kann bei intensiver körperlicher Aktivität unzureichend sein.

**Die Herausforderung: Schweißverluste**

Beim Schwitzen verliert der Körper nicht nur Wasser, sondern auch wertvolle Elektrolyte. Die Verluste variieren stark je nach:
- Intensität der Belastung
- Umgebungstemperatur und Luftfeuchtigkeit
- Individuellem Schwitzverhalten
- Fitnesslevel (trainierte Sportler schwitzen mehr, aber mit niedrigerer Salzkonzentration)

**Typische Schweißverluste pro Stunde intensiven Sports:**
| Elektrolyt | Verlust/Stunde | Bedeutung |
|------------|----------------|-----------|
| Natrium | 200-1.200 mg | Hauptelektrolyt im Schweiß |
| Kalium | 100-200 mg | Geringere Verluste |
| Magnesium | 10-20 mg | Aber hoher Bedarf für Muskeln |
| Calcium | 40-80 mg | Moderate Verluste |

**Gesamtwasserverlust:**
- Leichtes Training: 0,5-1 L/Stunde
- Intensives Training: 1-2 L/Stunde
- Extremsport bei Hitze: bis 3 L/Stunde

**Warum ist das relevant für die Wasserwahl?**
Bei hohen Schweißverlusten kann mineralstoffarmes Wasser allein den Bedarf nicht decken. Schlimmer noch: Trinken großer Mengen natriumarmen Wassers ohne Elektrolytersatz kann zur gefährlichen Hyponatriämie (Natriummangel im Blut) führen - ein Risiko besonders bei Ausdauersportarten wie Marathon oder Triathlon.

**Das optimale Sportwasser:**
Ein gutes Sportwasser sollte die verlorenen Elektrolyte teilweise ersetzen und gut verträglich sein. Die genauen Anforderungen hängen von der Sportart und Intensität ab.`
        },
        {
            id: "criteria",
            title: "Was macht ein Sportwasser?",
            subtitle: "Die wichtigsten Mineralstoffe",
            content: `Für Sportler sind bestimmte Mineralstoffe besonders relevant:

**SEHR WICHTIG:**

**Magnesium (50-120 mg/L empfohlen)**
Magnesium ist das Anti-Krampf-Mineral:
- Ermöglicht Muskelentspannung nach Kontraktion
- Essentiell für Energiestoffwechsel (ATP)
- Wird bei Stress und Belastung vermehrt verbraucht
- Mangel = Krämpfe, Muskelverspannungen

Ab 50 mg/L gilt Wasser als "magnesiumhaltig". Für Sportler sind höhere Werte (80-120 mg/L) vorteilhaft.

**Natrium (30-100 mg/L empfohlen für Sport)**
Entgegen der allgemeinen Empfehlung (natriumarm) ist für Sportler ein höherer Natriumgehalt sinnvoll:
- Gleicht Schweißverluste aus
- Verhindert Hyponatriämie bei langen Belastungen
- Fördert die Wasseraufnahme im Darm
- Unterstützt den Durstmechanismus

Bei sehr langen Belastungen (>3 Stunden) oder extremer Hitze: zusätzliche Elektrolyte erwägen.

**WICHTIG:**

**Hydrogencarbonat (>600 mg/L empfohlen)**
Hydrogencarbonat puffert die bei intensiver Belastung entstehende Milchsäure:
- Kann Übersäuerung der Muskeln abmildern
- Unterstützt die Regeneration
- Einige Studien zeigen positive Effekte auf die Leistung

**Calcium (80-200 mg/L empfohlen)**
Calcium wird über Schweiß verloren und ist wichtig für:
- Muskelkontraktion
- Knochengesundheit (bei hoher mechanischer Belastung wichtig)
- Nervenfunktion

**GUT ZU HABEN:**

**Kalium:**
Geht durch Schweiß verloren, aber weniger kritisch als Natrium. Besser über Ernährung zuführen (Bananen!).

**Gesamtmineralisation (TDS):**
Für Sportler sind höhere TDS-Werte (500+ mg/L) oft vorteilhaft - mehr Mineralstoffe pro Schluck.

**Kohlensäure:**
Geschmackssache. Manche Sportler vertragen kohlensäurehaltiges Wasser gut, andere bekommen Magenprobleme bei Belastung. Testen!`
        },
        {
            id: "timing",
            title: "Wann trinken?",
            subtitle: "Timing ist wichtig",
            content: `Die richtige Trinkmenge zur richtigen Zeit maximiert die Leistung und Regeneration:

**VOR dem Sport (Pre-Hydration):**
- 2-3 Stunden vorher: ca. 500 ml
- 30 Minuten vorher: 200-300 ml
- Ziel: Gut hydriert starten
- Tipp: Urinfarbe sollte hellgelb sein

Mineralreiches Wasser füllt die Elektrolytspeicher auf.

**WÄHREND des Sports:**
- Alle 15-20 Minuten: 150-200 ml
- Bei Hitze oder Intensität: mehr
- Nicht "auf Vorrat" trinken - lieber regelmäßig kleine Mengen
- Bei >60 Minuten Belastung: natriumreiches Wasser oder Sportgetränk

**Warnsignale für Dehydration:**
- Durst (tritt erst bei 1-2% Flüssigkeitsverlust auf)
- Konzentrationsprobleme
- Leistungsabfall
- Muskelkrämpfe
- Dunkler Urin

**NACH dem Sport (Rehydration):**
- Für jedes verlorene kg Körpergewicht: ca. 1,5 L trinken
- In den ersten 30 Minuten: mineralstoffreiches Wasser
- Über 2-4 Stunden verteilt weitertrinken
- Salzige Snacks können Natriumversorgung unterstützen

**Die 150%-Regel:**
Um Verluste auszugleichen, sollte man etwa 150% des verlorenen Gewichts wieder trinken. Der Körper scheidet einen Teil wieder aus.

**Hyponatriämie vermeiden:**
Bei sehr langen Belastungen (Marathon, Triathlon, Radrennen über 3+ Stunden):
- Nicht nur Wasser trinken, sondern auch Natrium zuführen
- Natriumreiches Wasser oder Sportgetränke wählen
- Symptome: Kopfschmerzen, Übelkeit, Verwirrtheit, im Extremfall lebensbedrohlich

**Praxis-Tipp für Sportler:**
Wiegen Sie sich vor und nach dem Training. Die Gewichtsdifferenz entspricht ungefähr dem Flüssigkeitsverlust in kg. Multiplizieren mit 1,5 ergibt die nötige Trinkmenge.`
        }
    ]
};
