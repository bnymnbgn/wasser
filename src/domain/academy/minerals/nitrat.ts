import { MineralArticle } from '../types';

export const nitrat: MineralArticle = {
    id: "nitrat",
    label: "Nitrat",
    emoji: "🌱",
    shortDesc: "Hinweis auf Verunreinigung",
    topics: [
        {
            id: "overview",
            title: "Was ist Nitrat?",
            subtitle: "Herkunft verstehen",
            content: `Nitrat (NO₃⁻) ist eine Stickstoffverbindung, die natürlich in Wasser und Boden vorkommt. Im Gegensatz zu vielen anderen Mineralstoffen ist Nitrat jedoch ein potenzieller Problemstoff - erhöhte Konzentrationen deuten oft auf menschengemachte Verunreinigungen hin.

**Chemie und Eigenschaften:**
Nitrat ist das Salz der Salpetersäure. Es ist sehr gut wasserlöslich und wird im Boden nicht gebunden - deshalb gelangt es leicht ins Grundwasser. Im Körper kann Nitrat zu Nitrit (NO₂⁻) umgewandelt werden, was gesundheitlich problematisch sein kann.

**Woher kommt Nitrat im Wasser?**
Natürliche Quellen:
- Biologischer Abbau organischer Substanz
- Gesteinsverwitterung (sehr geringe Mengen)

Menschengemachte Quellen (Hauptursache erhöhter Werte):
- Landwirtschaftliche Düngung (Mineraldünger, Gülle)
- Intensive Tierhaltung
- Undichte Abwassersysteme
- Industrielle Einleitungen

In intensiv landwirtschaftlich genutzten Regionen sind die Nitratwerte im Grundwasser oft erhöht. Deutschland hat in einigen Regionen ein erhebliches Nitratproblem.

**Gesetzliche Grenzwerte:**
- Trinkwasser (TrinkwV): max. 50 mg/L
- Mineralwasser: max. 50 mg/L
- Säuglingsnahrung: max. 10 mg/L

**Warum unterschiedliche Grenzwerte?**
Der strenge Grenzwert für Säuglingsnahrung erklärt sich durch die besondere Empfindlichkeit von Babys (siehe nächster Abschnitt).

**Nitrat als Qualitätsindikator:**
Niedrige Nitratwerte (< 10 mg/L) in Mineralwasser sind ein gutes Zeichen für:
- Tief liegende, gut geschützte Quellen
- Geringe Beeinflussung durch die Landwirtschaft
- Ursprüngliche Wasserqualität

Viele Premium-Mineralwässer werben mit sehr niedrigen Nitratwerten als Qualitätsmerkmal.`
        },
        {
            id: "importance",
            title: "Warum ist Nitrat kritisch?",
            subtitle: "Gesundheitsrisiken verstehen",
            content: `Nitrat selbst ist relativ harmlos. Das Problem entsteht durch seine Umwandlung zu Nitrit - und das ist besonders für bestimmte Personengruppen gefährlich.

**Der gefährliche Mechanismus - Nitrit und Methämoglobin:**
Im Körper kann Nitrat durch Bakterien zu Nitrit (NO₂⁻) umgewandelt werden. Dieses Nitrit kann:
1. Mit dem Blutfarbstoff Hämoglobin reagieren
2. Hämoglobin in Methämoglobin umwandeln
3. Methämoglobin kann keinen Sauerstoff transportieren

Ergebnis: Sauerstoffmangel im Gewebe (Methämoglobinämie, "Blausucht")

**Besondere Gefährdung von Säuglingen (< 6 Monate):**
Säuglinge sind aus mehreren Gründen besonders gefährdet:
1. **Unreifer Magen-Darm-Trakt**: Der Magen von Säuglingen ist weniger sauer (höherer pH-Wert), was das Wachstum nitratreduzierender Bakterien fördert.
2. **Unreifes Enzymsystem**: Das Enzym, das Methämoglobin wieder in normales Hämoglobin umwandelt (Methämoglobin-Reduktase), ist bei Säuglingen noch nicht vollständig aktiv.
3. **Fetales Hämoglobin**: Säuglinge haben noch einen hohen Anteil an fetalem Hämoglobin, das leichter oxidiert wird.

Bei schwerer Methämoglobinämie kann die Haut bläulich erscheinen ("Blue Baby Syndrome"). Unbehandelt kann dieser Zustand lebensbedrohlich sein.

**Weitere Risikogruppen:**
- Schwangere (Risiko für den Fötus)
- Menschen mit bestimmten Enzymdefekten
- Personen mit Magen-Darm-Erkrankungen (erhöhte Nitrit-Bildung)

**Für Erwachsene weniger kritisch:**
Für gesunde Erwachsene ist der Nitratgehalt im Wasser meist kein primäres Gesundheitsrisiko, weil:
- Die Nitrit-Bildung im Erwachsenen-Magen gering ist
- Das Enzymsystem voll funktionsfähig ist
- Wir ohnehin mehr Nitrat über Gemüse aufnehmen

**Nitrat in Gemüse - ein Perspektivwechsel:**
Interessanterweise nehmen wir über nitratreiches Gemüse (Salat, Spinat, Rote Beete, Rucola) oft ein Vielfaches der Menge auf, die wir über Wasser bekämen. Hier wird Nitrat sogar zunehmend positiv bewertet:
- Erweiterung der Blutgefäße
- Mögliche Blutdrucksenkung
- Verbesserte Sportleistung (Rote-Beete-Saft)

Der Unterschied: Gemüse enthält gleichzeitig Antioxidantien (Vitamin C), die die problematische Nitrit-Bildung hemmen.

**Nitrosamine - ein weiteres Risiko:**
Unter bestimmten Bedingungen kann Nitrit mit Aminen zu Nitrosaminen reagieren. Diese gelten als krebserregend. Das Risiko ist jedoch bei normalen Nitratwerten im Wasser und ausgewogener Ernährung sehr gering.`
        },
        {
            id: "ranges",
            title: "Grenzwerte und Empfehlungen",
            subtitle: "Wann wird es kritisch?",
            content: `Hier finden Sie detaillierte Empfehlungen für verschiedene Personengruppen und Situationen:

**Baby & Säuglingsnahrung (< 10 mg/L) - ZWINGEND:**
Für die Zubereitung von Säuglingsnahrung ist ein Nitratgehalt unter 10 mg/L zwingend erforderlich. Achten Sie beim Wasserkauf auf die Aufschrift "Geeignet für die Zubereitung von Säuglingsnahrung" - diese Wässer erfüllen garantiert diesen Grenzwert.

Ideal sind Werte unter 5 mg/L. Die meisten speziell deklarierten Babywässer liegen in diesem Bereich.

**Schwangere (< 10 mg/L) - EMPFOHLEN:**
Vorsichtshalber niedrige Werte bevorzugen. Das Risiko ist zwar geringer als bei Säuglingen, aber eine vorsorgende Reduktion ist sinnvoll.

**Standard / Erwachsene (< 25 mg/L) - GUT:**
Je niedriger, desto besser - aber Werte bis 25 mg/L sind für gesunde Erwachsene unbedenklich. 

**Interpretation der Nitratwerte:**
| Nitrat (mg/L) | Bewertung | Geeignet für |
|---------------|-----------|--------------|
| < 5 | Sehr gut | Alle, inkl. Babys |
| 5-10 | Gut | Alle, inkl. Babys |
| 10-25 | Akzeptabel | Erwachsene, Kinder |
| 25-50 | Grenzwertig | Nur Erwachsene |
| > 50 | Überschreitet Grenzwert | Nicht empfohlen |

**Nitrat als Qualitätszeichen:**
Niedrige Nitratwerte in natürlichem Mineralwasser zeigen an:
- Die Quelle liegt tief und ist gut geschützt
- Keine Kontamination durch Landwirtschaft
- Ursprüngliche, unbelastete Geologie

Viele Premium-Mineralwässer werben mit Nitratwerten unter 1 mg/L.

**Regionale Unterschiede in Deutschland:**
Die Nitratbelastung des Grundwassers variiert stark:
- Niedrig: Gebirgsregionen, waldreiche Gebiete
- Erhöht: Intensiv landwirtschaftliche Regionen (Norddeutschland, Teile Bayerns)

**Was tun bei hohen Nitratwerten im Leitungswasser?**
Wenn Ihr Leitungswasser erhöhte Nitratwerte aufweist:
1. Für Säuglingsnahrung: Mineralwasser mit entsprechender Deklaration verwenden
2. Für Erwachsene: Bei Werten unter 50 mg/L besteht kein akutes Risiko
3. Langfristig: Beim Wasserversorger nachfragen, Gemeinde informieren

**Prävention durch Politik:**
Die Nitratbelastung des Grundwassers ist ein Umweltthema. Die EU-Nitratrichtlinie und die deutsche Düngeverordnung sollen die Belastung reduzieren - der Erfolg ist bisher begrenzt.`
        }
    ]
};
