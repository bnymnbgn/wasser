import { MineralArticle } from '../types';

export const chlorid: MineralArticle = {
    id: "chlorid",
    label: "Chlorid",
    emoji: "🧂",
    shortDesc: "Zusammen mit Natrium als Salz",
    topics: [
        {
            id: "overview",
            title: "Was ist Chlorid?",
            subtitle: "Teil des Kochsalzes",
            content: `Chlorid (Cl⁻) ist der "andere Teil" von Kochsalz (Natriumchlorid, NaCl). Während Natrium oft im Fokus steht, wird Chlorid häufig übersehen - obwohl es genauso häufig vorkommt und eigene wichtige Funktionen hat.

**Chemie:**
Chlorid ist das negativ geladene Ion des Elements Chlor. Es ist sehr gut wasserlöslich und kommt in praktisch allen natürlichen Wässern vor.

**Nicht verwechseln:**
- Chlorid (Cl⁻): Das natürlich vorkommende Ion im Wasser
- Chlor (Cl₂): Das Desinfektionsmittel zur Wasseraufbereitung
- Hypochlorit: Die aktive Substanz in Chlorbleiche

Chlorid im Mineralwasser ist natürlichen Ursprungs und hat nichts mit Chlorierung zu tun!

**Natürliches Vorkommen:**
Chloridreiches Wasser stammt oft aus:
- Salzreichen Sedimenten
- Küstennahen Grundwasserleitern
- Ehemaligen Meeresböden
- Salzstöcken

**Zusammenhang mit Natrium:**
In den meisten Wässern korreliert der Chloridgehalt eng mit dem Natriumgehalt, da beide als Kochsalz (NaCl) auftreten. Die Formel: 
Chlorid (mg/L) ≈ Natrium (mg/L) × 1,5

Ausnahmen gibt es bei Calcium- oder Magnesiumchlorid-reichen Wässern.

**Geschmackseinfluss:**
Chlorid trägt zum salzigen Geschmack bei. In Kombination mit Natrium bestimmt es, wann Wasser als "salzig" wahrgenommen wird:
- Unter 150 mg/L: kein salziger Geschmack
- 150-300 mg/L: leicht wahrnehmbar
- Über 300 mg/L: deutlich salzig`
        },
        {
            id: "importance",
            title: "Warum ist Chlorid relevant?",
            subtitle: "Elektrolyt-Balance",
            content: `Chlorid ist ein essentieller Mineralstoff mit mehreren wichtigen Funktionen:

**1. Elektrolyt-Balance:**
Chlorid ist neben Natrium und Kalium eines der wichtigsten Elektrolyte im Körper. Es ist essentiell für:
- Die Aufrechterhaltung des osmotischen Drucks
- Die Regulation des Wasserhaushalts
- Die elektrische Neutralität der Körperflüssigkeiten

**2. Magensäureproduktion:**
Chlorid ist ein essentieller Bestandteil der Magensäure (Salzsäure, HCl):
- Die Belegzellen des Magens produzieren aktiv HCl
- Diese Säure ist nötig für die Proteinverdauung
- Sie schützt vor Krankheitserregern in der Nahrung
- Chloridmangel kann die Magensäureproduktion beeinträchtigen

**3. Nervenfunktion:**
Chloridkanäle in Nervenzellen sind wichtig für die hemmende Signalübertragung (GABA-Rezeptoren). Chlorid trägt zur Dämpfung übermäßiger Nervenerregung bei.

**4. CO₂-Transport:**
Im sogenannten "Chlorid-Shift" (Hamburger-Shift) spielt Chlorid eine Rolle beim Transport von CO₂ im Blut.

**Chlorid vs. Natrium - Was ist wichtiger?**
Für die meisten Menschen ist Natrium der kritischere Faktor (Blutdruck, Herz-Kreislauf). Chlorid folgt dem Natrium meist automatisch. Bei der Wasserwahl ist daher der Natriumwert der bessere Indikator.

**Chlorid allein weniger kritisch:**
Anders als Natrium:
- Hat Chlorid allein keinen direkten Blutdruckeffekt
- Ist Chlorid-Überschuss seltener problematisch
- Wird Chlorid effizient über die Nieren ausgeschieden

**Mangel ist selten:**
Da Chlorid in praktisch allen Lebensmitteln vorkommt (als Teil von Kochsalz), ist ein Mangel sehr selten. Er kann auftreten bei:
- Starkem, anhaltendem Erbrechen
- Extremem Schwitzen ohne Elektrolytersatz
- Bestimmten Nierenerkrankungen`
        },
        {
            id: "ranges",
            title: "Typische Werte",
            subtitle: "Empfehlungen",
            content: `Chloridwerte im Wasser haben vor allem Relevanz für den Geschmack und als Indikator für den Salzgehalt:

**Unter 150 mg/L - NIEDRIG:**
- Kein salziger Geschmack spürbar
- Keine Einschränkungen für irgendein Profil
- Typisch für viele natürliche Mineralwässer

**150-250 mg/L - MODERAT:**
- Leicht wahrnehmbarer Salzgeschmack
- Für die meisten Anwendungen geeignet
- Grenzwert der Trinkwasserverordnung: 250 mg/L

**Über 250 mg/L - ERHÖHT:**
- Deutlich salziger Geschmack
- Kann Trinkwasser-Grenzwert überschreiten
- Für Blutdrucksensible: auf Natriumgehalt achten

**Profilspezifische Empfehlungen:**

**Blutdrucksensibel:**
Da Chlorid meist mit Natrium korreliert, bedeuten hohe Chloridwerte oft auch hohe Natriumwerte. Bei Bluthochdruck:
- Chlorid < 200 mg/L bevorzugen
- Wichtiger: auf Natrium < 20 mg/L achten

**Baby & Säuglingsnahrung:**
- Keine expliziten Chlorid-Grenzwerte in der Verordnung
- Bei "für Säuglingsnahrung geeignet": automatisch niedrige Werte

**Sport:**
- Chlorid geht durch Schweiß verloren
- Moderate bis erhöhte Werte können bei Ausdauersport sinnvoll sein
- Meist ist Natrium der limitierende Faktor

**Kaffee & Tee:**
- Hohe Chloridwerte können den Geschmack beeinflussen
- Für Aromaentfaltung: < 200 mg/L empfohlen

**Praxis-Tipp:**
Da Chlorid und Natrium meist gemeinsam auftreten, genügt es in der Regel, auf den Natriumwert zu achten. Bei niedrigem Natriumgehalt ist auch der Chloridgehalt meist niedrig.

**Messung:**
Der Chloridgehalt wird auf dem Etikett von Mineralwasser angegeben. Er ist Teil der vorgeschriebenen Mineralstoffanalyse.`
        }
    ]
};
