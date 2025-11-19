# Wasserscan (Web-App)

Eine Next.js-Webanwendung zur Bewertung von Trinkwasser-Qualität auf Basis von Etikett-Daten und Barcodes.
Die App erlaubt:

- Eingabe von **Etikett-Text** (MVP statt echter OCR)
- Scan von **Barcodes** per Webcam oder manueller Eingabe
- Bewertung nach verschiedenen **Profilen** (Standard, Baby, Sport, Blutdrucksensibel)
- Speicherung der Scans in einer **PostgreSQL**-Datenbank
- Anzeige eines **Verlaufs** mit bisherigen Scans
- Erklärung, **wie** und **warum** bewertet wird (Onboarding / Profile-Guide)

> **Hinweis:**
> Die App ersetzt keine medizinische Beratung. Bewertungen orientieren sich an typischen Richtbereichen und dienen als Hilfestellung zur Einordnung von Etiketten.

---

## Inhalt

1. [Features](#features)
2. [Tech-Stack](#tech-stack)
3. [Architektur & Struktur](#architektur--struktur)
4. [Datenmodell](#datenmodell)
5. [Scoring-Modell & Profile](#scoring-modell--profile)
6. [Setup & Installation](#setup--installation)
7. [Entwicklung & Scripts](#entwicklung--scripts)
8. [Docker-Betrieb](#docker-betrieb)
9. [API-Übersicht](#api-übersicht)
10. [Frontend-Routen](#frontend-routen)
11. [Weiterentwicklung](#weiterentwicklung)

---

## Features

- **Profile / Zielgruppen**
  - `Standard` – für gesunde Erwachsene ohne besondere Anforderungen
  - `Baby/Kleinkind` – strengere Bewertung für Nitrat & Natrium
  - `Sport` – Fokus auf Magnesium, Calcium, Hydrogencarbonat, Mineralisation
  - `Blutdrucksensibel` – starke Gewichtung von Natrium

- **Eingabewege**
  - Etikett-Text (MVP) – z. B.:
    > `pH: 7.3, Kalzium: 80 mg/l, Magnesium: 25 mg/l, Natrium: 10 mg/l, Nitrat: 5 mg/l`
  - Barcode:
    - manuelle Eingabe (EAN/GTIN)
    - Webcam-Scan mit `@zxing/browser` (Video-Stream im Browser)

- **Bewertung**
  - Scoring 0–100 (Gesamt)
  - Teil-Scores pro Metrik (pH, Natrium, Nitrat, Calcium, Magnesium, Hydrogencarbonat, Gesamtmineralisation)
  - Profilabhängige Gewichtungen
  - Erklärtexte pro Metrik (für Tooltips / Onboarding)

- **Persistenz & Verlauf**
  - Speicherung jedes Scans in PostgreSQL via Prisma
  - Anzeige eines Verlaufs mit Datum, Profil, Score & Detailkarte

- **Onboarding / Erklärung**
  - Seite `/onboarding` mit Tabs für jedes Profil
  - Cheat-Sheet, welche Werte in welchem Profil wichtig sind

---

## Tech-Stack

- **Frontend / Backend**
  - [Next.js](https://nextjs.org/) (App Router, TypeScript)
  - React 18
  - TypeScript
  - Tailwind CSS

- **Domain & Daten**
  - Prisma ORM
  - PostgreSQL (Docker)
  - Domänen-Layer unter `src/domain/*`

- **Scanner & UX**
  - `@zxing/browser` für Webcam-Barcodes
  - `clsx` für Klassennamen-Handling

---

## Architektur & Struktur

Wichtige Verzeichnisse:

```text
.
├── app/
│   ├── page.tsx              # Startseite (Profilwahl, Links zu Scan/History)
│   ├── scan/
│   │   └── page.tsx          # Scan-Seite (Etikett-Text + Barcode + Webcam)
│   ├── history/
│   │   └── page.tsx          # Verlauf vergangener Scans
│   ├── onboarding/
│   │   └── page.tsx          # Erklärseite zu Profilen & Metriken
│   └── api/
│       ├── scan/
│       │   ├── ocr/
│       │   │   └── route.ts  # POST /api/scan/ocr – Text→Parsing→Scoring→DB
│       │   └── barcode/
│       │       └── route.ts  # POST /api/scan/barcode – Mock-Lookup→Scoring→DB
│       └── history/
│           └── route.ts      # GET /api/history – letzte Scans
│
├── src/
│   ├── lib/
│   │   └── prisma.ts         # PrismaClient-Singleton
│   ├── domain/
│   │   ├── types.ts          # Domain-Typen (Profile, WaterAnalysis, ScanResult, ...)
│   │   ├── scoring.ts        # Scoring-Modell pro Profil & Metrik
│   │   ├── mappers.ts        # Prisma <-> Domain Mapping
│   │   └── profileCheatsheet.ts # Cheat-Sheet für Onboarding & ProfileSelector
│   └── components/
│       ├── ProfileSelector.tsx       # Profilwahl auf Startseite
│       ├── ProfileOnboardingTabs.tsx # Tabs in /onboarding
│       ├── WaterScoreCard.tsx        # Anzeige eines einzelnen Bewertungsergebnisses
│       └── BarcodeScanner.tsx        # Webcam-Komponente für Barcodes
│
├── prisma/
│   └── schema.prisma         # Prisma-Schema (WaterSource, WaterAnalysis, ScanResult)
├── Dockerfile
├── docker-compose.yml
└── README.md
```

---

## Datenmodell

### Prisma-Modelle (vereinfacht)

**WaterSource**
- Marke, Produktname, optional Barcode

**WaterAnalysis**
- Analyse-Werte (pH, Ca, Mg, Na, Nitrat, HCO₃⁻, TDS)
- Quelle (Hersteller, Behörde, User, API), Datum, Zuordnung zu WaterSource

**ScanResult**
- Zeitpunkt, Profil
- optional Barcode
- extrahierte Werte aus Text (ocrParsedValues)
- Gesamt-Score & metrische Scores
- optional Verknüpfung zu WaterSource & WaterAnalysis (Barcode-Fall)

Prisma-Schema liegt vollständig in `prisma/schema.prisma`.

---

## Scoring-Modell & Profile

Die Scoring-Logik ist in `src/domain/scoring.ts` implementiert.

### Prinzipien

- **Input**: `WaterAnalysisValues` (Teilwerte, alle optional)
- **Output**:
  - `totalScore` (0–100)
  - Liste von `MetricScore`:
    - `metric` (z. B. "sodium")
    - `score` (0–100)
    - `weight` (Einfluss auf Gesamtscore)
    - `explanation` (Text für UI / Tooltips)

- **Scoring** wird profilabhängig berechnet:
  - z. B. `baby` → hohe Gewichte für Nitrat & Natrium
  - `sport` → hohe Gewichte für Calcium, Magnesium, Hydrogencarbonat
  - `blood_pressure` → Natrium sehr stark gewichtet

### Profile & Cheatsheet

Die Profilbeschreibungen stehen zentral in:

```typescript
// src/domain/profileCheatsheet.ts
export const PROFILE_CHEATSHEET = {
  standard: { ... },
  baby: { ... },
  sport: { ... },
  blood_pressure: { ... },
} as const;
```

Darin sind pro Profil definiert:

- `label`, `shortDescription`, `whenToUse`
- `scoringFocus` (Bullets zur Gewichtung)
- `metrics`: Name, Wichtigkeit ("sehr hoch" / "hoch" / "mittel" / "niedrig"), Erklärung, Hinweise

Die Onboarding-Seite (`/onboarding`) und der `ProfileSelector` nutzen dieses Cheat-Sheet direkt, um Texte konsistent auszugeben.

---

## Setup & Installation

### Voraussetzungen

- Node.js (empfohlen 20+ oder 22+)
- npm oder pnpm
- Docker (für DB & optional Web-Build)

### 1. Repository klonen
```bash
git clone <DEIN-REPO-URL> wasserscan-app
cd wasserscan-app
```

### 2. Abhängigkeiten installieren
```bash
npm install
```

### 3. Umgebungsvariablen

Erstelle eine `.env.local` im Projektroot, z. B.:

```bash
DATABASE_URL="postgres://waterapp:waterapp@localhost:5434/waterdb"
```

Der Port `5434` entspricht der Standardeinstellung in `docker-compose.yml`.

### 4. Datenbank starten (Docker)
```bash
docker compose up db -d
```

Dies startet nur den PostgreSQL-Container.

### 5. Prisma initialisieren & migrieren

Falls noch nicht geschehen:

```bash
npx prisma generate
npx prisma migrate dev --name init
```

Dadurch werden die Tabellen angelegt.

### 6. Entwicklungserver starten
```bash
npm run dev
```

Die App ist jetzt erreichbar unter:

http://localhost:3000

---

## Entwicklung & Scripts

Wichtige npm-Scripts:

```bash
# Lokaler Dev-Server mit Hot Reload
npm run dev

# Produktions-Build
npm run build

# Produktions-Start (nutzt .next)
npm start

# Prisma: Migrations & DB
npx prisma migrate dev
npx prisma studio    # einfache Web-Oberfläche zur DB-Inspektion

# OpenFoodFacts-Seed (erstellt Wasserquellen + Analysen)
DATABASE_URL=postgres://... npm run seed:openfoodfacts

> **Hinweis:** Der Seed holt sich standardmäßig 3 Seiten (je 100 Produkte) aus der
> OpenFoodFacts-API (`categories_tags_en=waters`). Über Umgebungsvariablen lässt
> sich das anpassen:
> - `OFF_MAX_PAGES` – Anzahl der Seiten (Default: `3`)
> - `OFF_PAGE_SIZE` – Produkte pro API-Call (Default: `100`)
> - `OFF_BASE_URL` – alternativ ein anderer OFF-Spiegel
```

---

## Docker-Betrieb

### Full-Stack per Docker Compose

`docker-compose.yml` enthält zwei Services:

- `web` – Next.js-App (Build & Run im Container)
- `db` – PostgreSQL 16-alpine

Start:

```bash
docker compose up --build
```

Die App läuft anschließend unter:

http://localhost:3000

Die DB ist intern unter `db:5432` erreichbar.
Im Container wird `DATABASE_URL=postgres://waterapp:waterapp@db:5432/waterdb` verwendet.

### Nur DB per Docker (für lokale Entwicklung)
```bash
docker compose up db -d
npm run dev
```

---

## API-Übersicht

### POST /api/scan/ocr

**Body (JSON)**:
```json
{
  "text": "pH: 7.3, Kalzium: 80 mg/l, Magnesium: 25 mg/l, Natrium: 10 mg/l, Nitrat: 5 mg/l",
  "profile": "baby"
}
```

**Funktion**:
- regexbasiertes Parsing des Etikett-Textes in Wasserwerte
- Scoring basierend auf Profil
- Speicherung als ScanResult in DB

**Response (JSON, Domain-ScanResult)**:
- `id`, `timestamp`, `profile`, `score`, `metricScores`, `ocrParsedValues`, …

### POST /api/scan/barcode

**Body (JSON)**:
```json
{
  "barcode": "1234567890123",
  "profile": "standard"
}
```

**Funktion (MVP)**:
- Mock-"Lookup" auf Basis des Barcodes
- Erzeugung einer WaterSource + WaterAnalysis
- Scoring & Speicherung als ScanResult

**Ziel**:
- Später Anbindung an Open Food Facts / Hersteller-APIs

### GET /api/history

**Funktion**:
- Liefert die letzten ~50 ScanResult-Einträge aus der DB
- Verwendung: aktuell vor allem durch die `/history`-Page (Server Component)

---

## Frontend-Routen

### `/`
- Profil-Auswahl (`ProfileSelector`)
- Links zu:
  - Scan starten → `/scan`
  - Verlauf ansehen → `/history`
  - Profil-Guide → `/onboarding` (optional verlinkbar)

### `/scan`
- Modus-Toggle:
  - **Etikett-Text**:
    - Textarea für Label-Text
    - POST nach `/api/scan/ocr`
  - **Barcode**:
    - Textfeld für EAN/GTIN
    - Webcam-Scanner (`BarcodeScanner`) füllt den Wert
    - POST nach `/api/scan/barcode`
- Anzeige einer `WaterScoreCard` mit Score + Werten

### `/history`
- Liste der letzten Scans
- Pro Eintrag:
  - Datum/Zeit
  - Profil
  - Score-Badge
  - Detailkarte mit `WaterScoreCard`

### `/onboarding`
- Info-Seite:
  - Headline + Kontext
  - `ProfileOnboardingTabs` mit Tabs für standard, baby, sport, blood_pressure
  - Erklärungen zu jedem Profil & jeder Metrik

---

## Weiterentwicklung

Einige mögliche nächste Schritte:

### ✅ Echte OCR (IMPLEMENTIERT)
- ✅ Native ML Kit Text Recognition für Android (Google ML Kit) und iOS (Apple Vision Framework)
- ✅ Tesseract.js als Web-Fallback
- ✅ Upload und Kamera-Aufnahme von Etikett-Fotos

**Android Setup erforderlich:**
Für die native OCR auf Android benötigst du eine `google-services.json` Datei:

1. Gehe zu [Firebase Console](https://console.firebase.google.com/)
2. Erstelle ein neues Projekt oder wähle ein bestehendes
3. Klicke auf "Android-App hinzufügen"
4. Package Name: `de.wasserscan` (muss mit `android/app/AndroidManifest.xml` übereinstimmen)
5. Lade die `google-services.json` herunter
6. Speichere sie in `android/app/google-services.json`
7. Führe `npx cap sync android` aus

**iOS Setup:**
Keine zusätzliche Konfiguration erforderlich - Apple Vision Framework ist bereits verfügbar.

### Echte Barcode-Daten
- Anbindung an Open Food Facts API
- Optionale Verbindung zu Hersteller-APIs oder GS1 (falls verfügbar)

### User-Accounts
- Authentifizierung (z. B. NextAuth)
- Personalisierte Profile / Präferenzen
- Synchronisierte Verläufe

### Mehr Metriken
- z. B. Sulfat, Chlorid, Kalium, Fluorid

### Internationalisierung (i18n)
- Mehrsprachiges UI (DE/EN)
- Anpassung von Grenzwerten/Empfehlungen an Länderregulationen

### Erweiterte Visualisierung
- Diagramme (Radarchart, Balken) für Profil-Vergleiche
- Vergleich mehrerer Wässer nebeneinander
