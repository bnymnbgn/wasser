/**
 * Build a pre-populated SQLite DB from the JSON seeds.
 * Output: public/assets/databases/wasserscan.db
 *
 * Requires: better-sqlite3 (dev dependency)
 */

const fs = require('node:fs');
const path = require('node:path');
const Database = require('better-sqlite3');

const ROOT = path.resolve(__dirname, '..');
const OUTPUT_DIR = path.join(ROOT, 'public', 'assets', 'databases');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'wasserscan.db');

/** Load JSON seeds */
const waterSources = require('../src/data/water-sources.json');
const waterAnalyses = require('../src/data/water-analyses.json');

fs.mkdirSync(OUTPUT_DIR, { recursive: true });
if (fs.existsSync(OUTPUT_FILE)) {
  fs.rmSync(OUTPUT_FILE);
}

const db = new Database(OUTPUT_FILE);
db.pragma('journal_mode = OFF');
db.pragma('synchronous = OFF');
db.pragma('foreign_keys = ON');

/** Schema mirrors src/lib/sqlite.ts */
db.exec(`
  CREATE TABLE IF NOT EXISTS WaterSource (
    id TEXT PRIMARY KEY,
    brand TEXT NOT NULL,
    productName TEXT NOT NULL,
    origin TEXT,
    barcode TEXT UNIQUE,
    createdAt TEXT NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_watersource_barcode ON WaterSource(barcode);
  CREATE INDEX IF NOT EXISTS idx_watersource_brand_product ON WaterSource(brand, productName);
  CREATE INDEX IF NOT EXISTS idx_watersource_created ON WaterSource(createdAt);

  CREATE TABLE IF NOT EXISTS WaterAnalysis (
    id TEXT PRIMARY KEY,
    waterSourceId TEXT NOT NULL,
    analysisDate TEXT,
    sourceType TEXT NOT NULL,
    reliabilityScore REAL NOT NULL,
    ph REAL,
    calcium REAL,
    magnesium REAL,
    sodium REAL,
    potassium REAL,
    chloride REAL,
    sulfate REAL,
    bicarbonate REAL,
    nitrate REAL,
    fluoride REAL,
    totalDissolvedSolids REAL,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (waterSourceId) REFERENCES WaterSource(id)
  );
  CREATE INDEX IF NOT EXISTS idx_wateranalysis_source_created ON WaterAnalysis(waterSourceId, createdAt);
  CREATE INDEX IF NOT EXISTS idx_wateranalysis_source_type ON WaterAnalysis(sourceType);
  CREATE INDEX IF NOT EXISTS idx_wateranalysis_reliability ON WaterAnalysis(reliabilityScore);

  CREATE TABLE IF NOT EXISTS ScanResult (
    id TEXT PRIMARY KEY,
    timestamp TEXT NOT NULL,
    barcode TEXT,
    profile TEXT NOT NULL,
    score REAL,
    metricScores TEXT,
    ocrTextRaw TEXT,
    ocrParsedValues TEXT,
    userOverrides TEXT,
    waterSourceId TEXT,
    waterAnalysisId TEXT,
    FOREIGN KEY (waterSourceId) REFERENCES WaterSource(id),
    FOREIGN KEY (waterAnalysisId) REFERENCES WaterAnalysis(id)
  );
  CREATE INDEX IF NOT EXISTS idx_scanresult_timestamp ON ScanResult(timestamp);
  CREATE INDEX IF NOT EXISTS idx_scanresult_profile ON ScanResult(profile);
  CREATE INDEX IF NOT EXISTS idx_scanresult_source ON ScanResult(waterSourceId);
  CREATE INDEX IF NOT EXISTS idx_scanresult_barcode ON ScanResult(barcode);
  CREATE INDEX IF NOT EXISTS idx_scanresult_score ON ScanResult(score);
`);

const insertSource = db.prepare(`
  INSERT OR REPLACE INTO WaterSource (id, brand, productName, origin, barcode, createdAt)
  VALUES (@id, @brand, @productName, @origin, @barcode, @createdAt)
`);

const insertAnalysis = db.prepare(`
  INSERT OR REPLACE INTO WaterAnalysis (
    id, waterSourceId, analysisDate, sourceType, reliabilityScore,
    ph, calcium, magnesium, sodium, potassium, chloride, sulfate,
    bicarbonate, nitrate, fluoride, totalDissolvedSolids, createdAt
  ) VALUES (
    @id, @waterSourceId, @analysisDate, @sourceType, @reliabilityScore,
    @ph, @calcium, @magnesium, @sodium, @potassium, @chloride, @sulfate,
    @bicarbonate, @nitrate, @fluoride, @totalDissolvedSolids, @createdAt
  )
`);

const toNull = (value) => (value === undefined ? null : value);

const runInsert = db.transaction(() => {
  for (const source of waterSources) {
    insertSource.run({
      id: source.id,
      brand: source.brand,
      productName: source.productName,
      origin: toNull(source.origin),
      barcode: toNull(source.barcode),
      createdAt: source.createdAt,
    });
  }

  for (const analysis of waterAnalyses) {
    insertAnalysis.run({
      id: analysis.id,
      waterSourceId: analysis.waterSourceId,
      analysisDate: toNull(analysis.analysisDate),
      sourceType: analysis.sourceType,
      reliabilityScore: analysis.reliabilityScore,
      ph: toNull(analysis.ph),
      calcium: toNull(analysis.calcium),
      magnesium: toNull(analysis.magnesium),
      sodium: toNull(analysis.sodium),
      potassium: toNull(analysis.potassium),
      chloride: toNull(analysis.chloride),
      sulfate: toNull(analysis.sulfate),
      bicarbonate: toNull(analysis.bicarbonate),
      nitrate: toNull(analysis.nitrate),
      fluoride: toNull(analysis.fluoride),
      totalDissolvedSolids: toNull(analysis.totalDissolvedSolids),
      createdAt: analysis.createdAt,
    });
  }
});

runInsert();

console.log('🧹 Optimizing database for distribution...');

// 1. Compact the database file
db.exec('VACUUM');

// 2. Switch from WAL/OFF to DELETE mode so everything is in ONE file
db.pragma('journal_mode = DELETE');

db.close();

console.log('✅ Database is ready for packaging (single file).');
console.log(`📦 Prebuilt DB created at ${path.relative(ROOT, OUTPUT_FILE)}`);
console.log(`   Sources: ${waterSources.length}, Analyses: ${waterAnalyses.length}`);
