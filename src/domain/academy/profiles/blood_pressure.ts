import { ProfileArticle } from '../types';

export const blood_pressure: ProfileArticle = {
    id: "blood_pressure",
    label: "Blutdrucksensibel",
    emoji: "❤️",
    shortDesc: "Fokus auf Natriumreduktion",
    topics: [
        {
            id: "overview",
            title: "Warum dieses Profil?",
            subtitle: "Natrium und Blutdruck",
            content: `Etwa 20-30 Millionen Menschen in Deutschland haben Bluthochdruck (Hypertonie). Davon reagieren schätzungsweise 30% "salzempfindlich" - bei ihnen wirkt sich Natriumaufnahme besonders stark auf den Blutdruck aus.

**Der Zusammenhang: Natrium und Blutdruck**

Natrium (der Hauptbestandteil von Kochsalz) beeinflusst den Blutdruck über mehrere Mechanismen:

1. **Wasserretention:**
Natrium bindet Wasser im Körper. Je mehr Natrium, desto mehr Wasser wird zurückgehalten, desto höher das Blutvolumen, desto höher der Druck.

2. **Gefäßverengung:**
Überschüssiges Natrium kann die Blutgefäße verengen, was den Widerstand und damit den Blutdruck erhöht.

3. **Kompensationsmechanismen:**
Bei hoher Natriumzufuhr müssen die Nieren mehr arbeiten, um das Gleichgewicht zu halten.

**Wer ist salzempfindlich?**
Salzempfindlichkeit ist häufiger bei:
- Menschen mit Bluthochdruck
- Älteren Menschen (über 50)
- Menschen mit Übergewicht
- Diabetikern
- Afroamerikanern (genetische Faktoren)
- Menschen mit familiärer Bluthochdruck-Vorgeschichte

**Die gute Nachricht:**
Bei salzempfindlichen Personen kann eine Natriumreduktion den Blutdruck messbar senken! Studien zeigen Reduktionen von:
- 5-10 mmHg systolisch
- 2-5 mmHg diastolisch

Das entspricht der Wirkung mancher Blutdruckmedikamente!

**Wasser als Teil der Strategie:**
Obwohl die Hauptnatriumquellen Lebensmittel sind (Brot, Wurst, Käse, Fertiggerichte), kann auch die Wasserwahl ein Baustein der Gesamtstrategie sein.`
        },
        {
            id: "criteria",
            title: "Bewertungskriterien",
            subtitle: "Worauf wir achten",
            content: `Für blutdrucksensible Personen sind bestimmte Mineralstoffe besonders relevant:

**SEHR WICHTIG - REDUZIEREN:**

**Natrium: unter 20 mg/L bevorzugt**
"Natriumarm" laut Gesetz bedeutet unter 20 mg/L. Für blutdrucksensible Personen ist dies der wichtigste Wert.
- Ideal: unter 10 mg/L
- Akzeptabel: unter 20 mg/L
- Vermeiden: über 50 mg/L

Bei 2 Litern Wasser pro Tag:
- 20 mg/L = 40 mg Natrium (wenig)
- 200 mg/L = 400 mg Natrium (relevant)

**Chlorid: niedrigere Werte bevorzugt**
Chlorid korreliert mit Natrium und trägt zur Salzwirkung bei. Niedrige Chloridwerte bedeuten meist auch niedrige Natriumwerte.

**POSITIV - ERHÖHEN:**

**Kalium: höhere Werte positiv**
Kalium ist der natürliche Gegenspieler von Natrium:
- Fördert die Natriumausscheidung
- Kann blutdrucksenkend wirken
- Ideal: höhere Werte im Wasser (>10 mg/L)

Wichtiger ist aber die Ernährung: Kaliumreiche Lebensmittel (Obst, Gemüse) sind die Hauptquelle.

**Magnesium: positiv**
Magnesium kann gefäßerweiternd wirken und unterstützt die Herzfunktion:
- Moderate bis höhere Werte bevorzugen
- Studien zeigen geringe blutdrucksenkende Effekte

**Calcium: neutral bis positiv**
Ausreichende Calciumversorgung ist allgemein wichtig für die Herz-Kreislauf-Gesundheit.

**WENIGER RELEVANT:**

**Gesamtmineralisation (TDS):**
Nicht per se ein Kriterium, aber natriumarme Wässer haben oft auch niedrigeren TDS.

**Kohlensäure:**
Kein direkter Einfluss auf den Blutdruck. Wählen Sie nach Geschmack.`
        },
        {
            id: "lifestyle",
            title: "Ganzheitlicher Ansatz",
            subtitle: "Mehr als nur Wasser",
            content: `Die Wasserwahl ist nur ein kleiner Teil einer blutdruckfreundlichen Lebensweise. Hier die wichtigsten Faktoren:

**Ernährung (wichtigster Faktor):**

**DASH-Diät:**
Die DASH-Diät (Dietary Approaches to Stop Hypertension) ist wissenschaftlich als blutdrucksenkend belegt:
- Viel Obst und Gemüse (kaliumreich)
- Vollkornprodukte
- Fettarme Milchprodukte
- Wenig rotes Fleisch
- Wenig gesättigte Fette
- Natriumarm (<2.300 mg/Tag, ideal <1.500 mg)

Effekt: Kann den systolischen Blutdruck um 8-14 mmHg senken!

**Natriumquellen reduzieren:**
Die Hauptquellen für Natrium sind:
- Brot und Brötchen (20-25% der Natriumzufuhr)
- Fleisch- und Wurstwaren (15-20%)
- Käse (10-15%)
- Fertiggerichte und Fastfood (oft >1.000 mg pro Portion)

Wasser trägt typischerweise nur 1-3% bei - aber jede Reduktion zählt!

**Weitere Faktoren:**

**Bewegung:**
Regelmäßige körperliche Aktivität senkt den Blutdruck um 5-8 mmHg. Empfohlen: 150 Minuten moderate Aktivität pro Woche.

**Gewicht:**
Jedes Kilogramm Gewichtsverlust senkt den Blutdruck um etwa 1 mmHg.

**Alkohol:**
Alkohol erhöht den Blutdruck. Reduktion auf max. 1-2 Getränke pro Tag.

**Stress:**
Chronischer Stress erhöht den Blutdruck. Entspannungstechniken können helfen.

**Praktische Tipps:**
1. Natriumarmes Mineralwasser als Standard wählen
2. Auf versteckte Natriumquellen achten (Fertigprodukte prüfen)
3. Kaliumreiche Ernährung anstreben
4. Regelmäßig Blutdruck messen
5. Bei Bluthochdruck: ärztliche Behandlung ist wichtig!

Wasser allein wird Bluthochdruck nicht heilen - aber es ist ein einfacher Baustein einer Gesamtstrategie.`
        }
    ]
};
