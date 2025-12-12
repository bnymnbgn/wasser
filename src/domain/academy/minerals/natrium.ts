import { MineralArticle } from '../types';

export const natrium: MineralArticle = {
    id: "natrium",
    label: "Natrium",
    emoji: "🫀",
    shortDesc: "Wichtig für Blutdruck & Hydration",
    topics: [
        {
            id: "overview",
            title: "Was ist Natrium?",
            subtitle: "Grundlagen verstehen",
            content: `Natrium ist ein lebenswichtiger Mineralstoff, der in nahezu allen natürlichen Wasserquellen vorkommt. Als eines der wichtigsten Elektrolyte im menschlichen Körper spielt es eine zentrale Rolle bei zahlreichen physiologischen Prozessen.

**Chemische Eigenschaften:**
Im Wasser liegt Natrium als positiv geladenes Ion (Na⁺) vor. Es ist sehr gut wasserlöslich und reagiert leicht mit anderen Stoffen. Die Konzentration wird in Milligramm pro Liter (mg/L) angegeben. Mit einer Atommasse von etwa 23 g/mol ist Natrium ein relativ leichtes Metall, das in reiner Form extrem reaktiv ist.

**Natürliches Vorkommen:**
Die Natriumkonzentration in Mineralwasser variiert stark je nach geologischem Ursprung der Quelle:
- Sehr natriumarm (< 10 mg/L): Typisch für Granitgestein
- Natriumarm (< 20 mg/L): Viele natürliche Quellen
- Moderat (20-200 mg/L): Durchschnittliche Mineralwässer
- Natriumreich (> 200 mg/L): Salzreiche Lagerstätten, Heilwässer

**Körperbestand und Verteilung:**
Der erwachsene menschliche Körper enthält etwa 100 g Natrium. Die Verteilung ist bemerkenswert:
- Ca. 40% in den Knochen (als Natriumphosphat)
- Ca. 50% in den Körperflüssigkeiten außerhalb der Zellen (Extrazellularraum)
- Nur ca. 10% innerhalb der Zellen

Diese ungleiche Verteilung ist kein Zufall, sondern essentiell für viele Körperfunktionen, insbesondere die elektrische Erregbarkeit von Nerven und Muskeln.

**Täglicher Bedarf und tatsächliche Aufnahme:**
Der physiologische Mindestbedarf liegt bei etwa 550 mg Natrium pro Tag - das entspricht nur etwa 1,4 g Kochsalz (NaCl). Die tatsächliche Aufnahme in Deutschland liegt jedoch bei durchschnittlich 3.000-4.000 mg Natrium (7,5-10 g Kochsalz) - das ist das 5-7fache des Mindestbedarfs und deutlich über der empfohlenen Höchstmenge.

**Historische Bedeutung:**
Salz (Natriumchlorid) war über Jahrtausende eines der wertvollsten Handelsgüter. Das Wort "Salär" (Gehalt) stammt vom lateinischen "salarium" - der Sold für römische Soldaten, der teilweise in Salz ausgezahlt wurde. Diese historische Bedeutung erklärt, warum unser Geschmackssinn salzige Lebensmittel als angenehm empfindet - ein evolutionärer Vorteil, der heute bei der übermäßigen Verfügbarkeit von Salz zum Problem werden kann.`
        },
        {
            id: "importance",
            title: "Warum ist Natrium wichtig?",
            subtitle: "Gesundheitliche Bedeutung",
            content: `Natrium ist für das Überleben absolut unverzichtbar und erfüllt zahlreiche lebenswichtige Funktionen im menschlichen Körper:

**1. Flüssigkeitshaushalt (Osmoregulation):**
Natrium ist der Hauptregulator des Wasserhaushalts außerhalb der Zellen (Extrazellularraum). Es bestimmt maßgeblich, wie viel Wasser der Körper speichert oder ausscheidet. Das osmotische Gleichgewicht zwischen Innen- und Außenmilieu der Zellen wird primär durch Natrium gesteuert. Gemeinsam mit Kalium bildet es die sogenannte "Natrium-Kalium-Pumpe" (Na⁺/K⁺-ATPase), die für den Stoffaustausch zwischen Zellen essentiell ist und etwa 20-40% des gesamten Energieverbrauchs im Ruhezustand ausmacht.

**2. Blutdruckregulation:**
Die Natriumkonzentration im Blut beeinflusst direkt das Blutvolumen. Mehr Natrium bedeutet mehr Wasserretention, was zu höherem Blutdruck führen kann. Dieser Zusammenhang ist einer der wichtigsten in der Ernährungsmedizin. Etwa 30% der Menschen sind "salzempfindlich" - bei ihnen wirkt sich Natriumaufnahme besonders stark auf den Blutdruck aus. Bei salzempfindlichen Personen kann eine Reduktion der Natriumzufuhr den systolischen Blutdruck um 5-10 mmHg senken.

**3. Nervenfunktion und elektrische Signalübertragung:**
Natriumionen sind essentiell für die Erzeugung und Weiterleitung von Nervenimpulsen (Aktionspotentiale). Das elektrische Signal entsteht durch den schnellen Einstrom von Natriumionen in die Nervenzelle. Ohne Natrium wären Denken, Fühlen, Sehen, Hören und sämtliche Muskelbewegungen nicht möglich. Die Geschwindigkeit der Nervenleitung beträgt bis zu 120 m/s - ermöglicht durch Natrium.

**4. Nährstoffaufnahme im Darm:**
Natrium unterstützt aktiv die Aufnahme von Glukose, Aminosäuren und anderen Nährstoffen im Dünndarm (sekundär aktiver Transport). Dieses Prinzip wird therapeutisch bei der oralen Rehydratation bei Durchfallerkrankungen genutzt (WHO-Rehydratationslösung).

**5. Säure-Basen-Haushalt:**
Als Bestandteil des Bicarbonat-Puffersystems (NaHCO₃) hilft Natrium, den pH-Wert des Blutes konstant bei ca. 7,4 zu halten. Die Nieren regulieren die Natriumausscheidung in Abhängigkeit vom Säure-Basen-Status.

**6. Knochengesundheit:**
Zu hohe Natriumzufuhr kann langfristig zu Calciumverlusten über die Nieren führen und so indirekt die Knochengesundheit beeinträchtigen. Pro 2 g Natrium werden etwa 30-40 mg Calcium vermehrt ausgeschieden.

**Offizielle Empfehlungen:**
- DGE (Deutschland): max. 2.300 mg Natrium pro Tag (ca. 6 g Kochsalz)
- WHO (weltweit): max. 2.000 mg Natrium pro Tag (ca. 5 g Kochsalz)
- Tatsächliche Aufnahme in Deutschland: 3.000-4.000 mg/Tag

**Mangelerscheinungen (Hyponatriämie):**
Natriummangel ist selten, kann aber auftreten bei:
- Extremem Schwitzen (Marathon, Hitzearbeit)
- Starkem Durchfall oder Erbrechen
- Übermäßiger Wasseraufnahme ohne Elektrolyte ("Wasserintoxikation")
- Bestimmten Nierenerkrankungen oder Medikamenten

Symptome bei Natriummangel:
- Kopfschmerzen, Übelkeit
- Muskelkrämpfe und -schwäche
- Verwirrtheit, Orientierungslosigkeit
- In schweren Fällen: Krampfanfälle, Koma

**Überversorgung (häufiger!):**
Die meisten Menschen nehmen zu viel Natrium auf. Langfristige Folgen:
- Bluthochdruck (Hypertonie)
- Erhöhtes Risiko für Herz-Kreislauf-Erkrankungen
- Erhöhtes Schlaganfallrisiko
- Magenkrebs-Risiko`
        },
        {
            id: "ranges",
            title: "Ideale Wertbereiche",
            subtitle: "Je nach Profil unterschiedlich",
            content: `Die optimalen Natriumwerte im Trink- und Mineralwasser hängen stark vom individuellen Gesundheitsprofil und Lebensstil ab. Hier finden Sie detaillierte Empfehlungen für verschiedene Situationen:

**Baby & Kleinkind (< 20 mg/L) - KRITISCH:**
Säuglinge haben physiologisch unreife Nieren, die überschüssiges Natrium nicht so effektiv ausscheiden können wie bei Erwachsenen. Die Mineral- und Tafelwasser-Verordnung schreibt daher für Wässer mit der Auslobung "zur Zubereitung von Säuglingsnahrung geeignet" einen verbindlichen Grenzwert von maximal 20 mg/L vor. 

Ideal für Babys sind Werte unter 10 mg/L. Achten Sie beim Einkauf auf die entsprechende Kennzeichnung auf dem Etikett. Leitungswasser ist in Deutschland meist ebenfalls geeignet (durchschnittlich 30-50 mg/L), sollte aber für Säuglingsnahrung abgekocht werden.

**Blutdrucksensibel / Hypertonie (< 20 mg/L) - WICHTIG:**
Menschen mit diagnostiziertem Bluthochdruck oder salzempfindliche Personen sollten konsequent natriumarme Wässer bevorzugen. "Natriumarm" bedeutet nach der Mineral- und Tafelwasser-Verordnung: weniger als 20 mg/L.

Jede Reduktion der täglichen Natriumaufnahme kann messbar zur Blutdrucksenkung beitragen. Studien zeigen: Eine Reduktion um 1.000 mg Natrium/Tag senkt den Blutdruck um durchschnittlich 2-4 mmHg systolisch.

**Nierenprobleme (< 20 mg/L) - ÄRZTLICHE ABSTIMMUNG:**
Bei eingeschränkter Nierenfunktion (Niereninsuffizienz, Dialyse) ist eine strenge Natriumkontrolle oft ärztlich verordnet. Die genauen individuellen Grenzwerte sollten unbedingt mit dem behandelnden Nephrologen abgestimmt werden. Hier kann auch die Wassermenge relevant sein.

**Herzinsuffizienz (< 20 mg/L):**
Bei Herzinsuffizienz neigt der Körper zu Wassereinlagerungen (Ödeme). Natriumreduktion ist ein wichtiger Teil der Therapie. Natriumarmes Wasser (< 20 mg/L) unterstützt die medikamentöse Behandlung.

**Standard / Gesunde Erwachsene (< 50 mg/L):**
Für gesunde Erwachsene ohne besondere Anforderungen sind moderate Natriumwerte bis 50 mg/L im Wasser vollkommen unbedenklich. Das Wasser trägt bei normaler Trinkmenge (2 Liter/Tag) nur etwa 20-100 mg zur Gesamtnatriumaufnahme bei - ein sehr kleiner Anteil.

Die Hauptnatriumquellen sind verarbeitete Lebensmittel (Brot, Wurst, Käse, Fertiggerichte), nicht das Trinkwasser.

**Sport & körperliche Belastung (20-80 mg/L) - POSITIV:**
Sportler verlieren durch Schweiß erhebliche Mengen Natrium:
- Leichtes Training: 200-400 mg/Stunde
- Intensives Training: 400-800 mg/Stunde  
- Extremsport bei Hitze: bis 1.200 mg/Stunde

Ein höherer Natriumgehalt im Trinken während und nach dem Sport kann sinnvoll sein, um diese Verluste auszugleichen und gefährliche Elektrolytstörungen (Hyponatriämie) zu vermeiden.

**Vergleich: Wie viel trägt Wasser zur Natriumaufnahme bei?**
| Quelle | Natriumgehalt |
|--------|---------------|
| 1 Liter Mineralwasser (20 mg/L) | 20 mg |
| 1 Scheibe Brot | 200-400 mg |
| 1 Portion Wurst (30g) | 300-600 mg |
| 1 Portion Käse (30g) | 200-400 mg |
| 1 Fertiggericht | 1.000-2.000 mg |
| 1 Pizza | 1.500-3.000 mg |

**Fazit:** Trinkwasser trägt typischerweise nur 1-3% zur täglichen Natriumaufnahme bei. Die Hauptquellen sind verarbeitete Lebensmittel. Dennoch kann die bewusste Wahl von natriumarmem Wasser bei bestimmten Erkrankungen ein sinnvoller Baustein der Gesamtstrategie sein.`
        }
    ]
};
