import { MineralArticle } from '../types';

export const fluorid: MineralArticle = {
    id: "fluorid",
    label: "Fluorid",
    emoji: "🦷",
    shortDesc: "Zahngesundheit",
    topics: [
        {
            id: "overview",
            title: "Was ist Fluorid?",
            subtitle: "Spurenelement für Zähne",
            content: `Fluorid (F⁻) ist das Salz des Elements Fluor und ein natürlich vorkommendes Spurenelement. Es ist vor allem für seine Rolle bei der Zahngesundheit bekannt - aber auch umstritten.

**Chemie:**
Fluorid liegt im Wasser als einfach negativ geladenes Ion (F⁻) vor. Es ist ein sehr reaktives Element, das in der Natur nur in gebundener Form vorkommt.

**Natürliches Vorkommen:**
Fluorid kommt in unterschiedlichen Konzentrationen in natürlichen Wasserquellen vor:
- Typisch: 0,1-0,5 mg/L
- Fluoridreiche Quellen: bis 2-3 mg/L
- In manchen Regionen (z.B. Teile Afrikas, Indiens): natürlich über 5 mg/L (problematisch)

Die Konzentration hängt vom geologischen Untergrund ab - fluorhaltige Mineralien wie Fluorit (CaF₂) sind die Quelle.

**Fluoridierung in Deutschland:**
Anders als in manchen anderen Ländern (USA, Irland, Australien) wird Trinkwasser in Deutschland NICHT künstlich fluoridiert. Der Fluoridgehalt im Wasser ist natürlichen Ursprungs.

Fluoridierte Produkte in Deutschland:
- Fluoridzahnpasta (Standard)
- Fluoridsalz ("mit Fluorid und Jod")
- Fluoridtabletten für Kinder (nach ärztlicher Empfehlung)

**Körperbestand:**
Der Körper enthält etwa 2-3 g Fluorid, hauptsächlich in Knochen und Zähnen (zu 95%). Fluorid wird in den Zahnschmelz eingebaut und macht diesen widerstandsfähiger gegen Säureangriffe.`
        },
        {
            id: "importance",
            title: "Nutzen und Risiken",
            subtitle: "Die richtige Dosis",
            content: `Fluorid ist ein klassisches Beispiel für "die Dosis macht das Gift" - in kleinen Mengen nützlich, in größeren Mengen schädlich.

**Nutzen für die Zahngesundheit:**
Fluorid hat mehrere bewiesene positive Effekte auf die Zähne:

1. **Remineralisierung:**
Fluorid fördert den Wiedereinbau von Mineralien in angegriffenen Zahnschmelz. Frühe Kariesläsionen ("white spots") können so gestoppt werden.

2. **Säureresistenz:**
Fluorapatit (mit Fluorid verstärkter Zahnschmelz) ist resistenter gegen Säureangriffe als normaler Hydroxylapatit.

3. **Antibakterielle Wirkung:**
Fluorid hemmt bestimmte Enzyme von Kariesbakterien.

Die Wirksamkeit der Kariesprophylaxe durch Fluorid ist wissenschaftlich gut belegt - die Kariesraten sind seit Einführung fluoridierter Zahnpasta weltweit deutlich gesunken.

**Risiken bei Überdosierung:**

1. **Dentalfluorose (häufigste Nebenwirkung):**
Bei zu hoher Fluoridaufnahme während der Zahnentwicklung (0-8 Jahre) können weiße bis bräunliche Flecken auf den Zähnen entstehen. Dies ist:
- Meist ein kosmetisches Problem
- Irreversibel
- Vermeidbar durch richtige Dosierung

2. **Skelettfluorose (selten in Deutschland):**
Bei sehr hoher, langfristiger Fluoridaufnahme (>6 mg/Tag über Jahre):
- Knochenverdichtung
- Gelenksteifigkeit
- Kommt in Deutschland praktisch nicht vor
- Relevant in Regionen mit natürlich sehr hohem Fluoridgehalt

**Besondere Vorsicht bei Babys:**
Der Grenzwert für Säuglingsnahrung von 0,7 mg/L ist streng, weil:
- Babys noch keinen ausgereiften Stoffwechsel haben
- Alle Zähne in Entwicklung sind
- Das Fluoridrisiko relativ höher ist

**Die Mehrheit der Fluoridaufnahme:**
Die meisten Menschen in Deutschland bekommen ihr Fluorid über:
- Zahnpasta (wichtigste Quelle)
- Fluoridsalz (wenn verwendet)
- Tee (enthält natürlicherweise Fluorid)
- Meeresfrüchte

Wasser trägt meist nur einen kleinen Teil bei.`
        },
        {
            id: "ranges",
            title: "Grenzwerte",
            subtitle: "Was ist sicher?",
            content: `Die Fluoridwerte in Wasser sind besonders für bestimmte Personengruppen relevant:

**Unter 0,7 mg/L - Für Säuglingsnahrung geeignet:**
Die Mineral- und Tafelwasser-Verordnung schreibt vor: Wasser zur Zubereitung von Säuglingsnahrung muss weniger als 0,7 mg/L Fluorid enthalten. Dies schützt Säuglinge vor übermäßiger Fluoridaufnahme.

Viele "für Säuglingsnahrung geeignete" Wässer haben deutlich niedrigere Werte (0,1-0,3 mg/L).

**0,7-1,0 mg/L - Gut für Zahngesundheit:**
In diesem Bereich wird Fluorid als vorteilhaft für die Zahngesundheit angesehen:
- Unterstützt die Kariesprävention
- Wird in fluoridierten Ländern als Zielwert verwendet
- In Deutschland eher selten im natürlichen Wasser

**Über 1,5 mg/L - Grenzwert Trinkwasser:**
Die Trinkwasserverordnung setzt den Grenzwert bei 1,5 mg/L. Höhere Werte:
- Können bei Kindern Fluorose verursachen
- Sind in Deutschland sehr selten
- Erfordern Maßnahmen des Wasserversorgers

**Profilspezifische Empfehlungen:**

**Baby & Kleinkind (< 0,7 mg/L) - STRIKT:**
Achten Sie auf die Kennzeichnung "Für Säuglingsnahrung geeignet". Zusätzliche Fluoridgaben (Tabletten, Zahngel) nur nach ärztlicher Empfehlung!

**Kinder 1-6 Jahre:**
Fluoridhaltige Kinderzahnpasta mit reduziertem Fluoridgehalt (500-1000 ppm) verwenden. Fluoridsalz ODER Fluoridtabletten - nicht beides.

**Erwachsene:**
Fluoridgehalt im Wasser ist weniger relevant, da:
- Zahnentwicklung abgeschlossen
- Fluoridaufnahme über Zahnpasta ausreichend
- Skelettfluorose bei normalen deutschen Verhältnissen kein Risiko

**Praxis-Tipp:**
Die meisten deutschen Mineralwässer haben niedrige Fluoridwerte (unter 0,5 mg/L). Für die Zahngesundheit ist fluoridhaltige Zahnpasta viel wichtiger als der Fluoridgehalt im Wasser.

**Fluorid-Balance finden:**
Die optimale Fluoridversorgung ist eine Balance:
- Zu wenig: Erhöhtes Kariesrisiko
- Zu viel: Fluoroserisiko
- Optimal: Zahnpasta + moderate Ernährungsquellen`
        }
    ]
};
