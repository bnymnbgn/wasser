/**
 * SQLite Database Service for Capacitor Mobile App
 * Handles local database operations with pre-populated product data
 */

import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';

// Database configuration
const DB_NAME = 'trinkwassercheck.db';
const DB_VERSION = 1;

// Type definitions matching our schema
export interface WaterSource {
  id: string;
  brand: string;
  productName: string;
  origin: string | null;
  barcode: string | null;
  createdAt: string;
}

export interface WaterAnalysis {
  id: string;
  waterSourceId: string;
  analysisDate: string | null;
  sourceType: string;
  reliabilityScore: number;
  ph: number | null;
  calcium: number | null;
  magnesium: number | null;
  sodium: number | null;
  potassium: number | null;
  chloride: number | null;
  sulfate: number | null;
  bicarbonate: number | null;
  nitrate: number | null;
  totalDissolvedSolids: number | null;
  createdAt: string;
}

export interface ScanResult {
  id: string;
  timestamp: string;
  barcode: string | null;
  profile: string;
  score: number | null;
  metricScores: string | null; // JSON string
  ocrTextRaw: string | null;
  ocrParsedValues: string | null; // JSON string
  userOverrides: string | null; // JSON string
  waterSourceId: string | null;
  waterAnalysisId: string | null;
}

class SQLiteService {
  private sqliteConnection: SQLiteConnection | null = null;
  private db: SQLiteDBConnection | null = null;
  private isInitialized = false;

  /**
   * Check if we're running in a Capacitor environment
   */
  private isCapacitor(): boolean {
    return Capacitor.isNativePlatform();
  }

  /**
   * Initialize the database connection
   */
  async init(): Promise<void> {
    if (this.isInitialized) return;

    if (!this.isCapacitor()) {
      console.log('[SQLite] Not running in Capacitor, skipping initialization');
      return;
    }

    try {
      this.sqliteConnection = new SQLiteConnection(CapacitorSQLite);

      // Open or create the database
      this.db = await this.sqliteConnection.createConnection(
        DB_NAME,
        false, // encrypted
        'no-encryption',
        DB_VERSION,
        false // readonly
      );

      await this.db.open();
      await this.ensureSchema();
      this.isInitialized = true;

      console.log('[SQLite] Database initialized successfully');
    } catch (error) {
      console.error('[SQLite] Initialization error:', error);
      throw error;
    }
  }

  /**
   * Ensure database schema exists
   */
  private async ensureSchema(): Promise<void> {
    if (!this.db) {
      throw new Error('[SQLite] Database not available');
    }

    console.log('[SQLite] Ensuring database schema');

    const statements = [
      `CREATE TABLE IF NOT EXISTS WaterSource (
        id TEXT PRIMARY KEY,
        brand TEXT NOT NULL,
        productName TEXT NOT NULL,
        origin TEXT,
        barcode TEXT UNIQUE,
        createdAt TEXT NOT NULL
      );`,
      `CREATE INDEX IF NOT EXISTS idx_watersource_barcode ON WaterSource(barcode);`,
      `CREATE INDEX IF NOT EXISTS idx_watersource_brand_product ON WaterSource(brand, productName);`,
      `CREATE INDEX IF NOT EXISTS idx_watersource_created ON WaterSource(createdAt);`,
      `CREATE TABLE IF NOT EXISTS WaterAnalysis (
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
        totalDissolvedSolids REAL,
        createdAt TEXT NOT NULL,
        FOREIGN KEY (waterSourceId) REFERENCES WaterSource(id)
      );`,
      `CREATE INDEX IF NOT EXISTS idx_wateranalysis_source_created ON WaterAnalysis(waterSourceId, createdAt);`,
      `CREATE INDEX IF NOT EXISTS idx_wateranalysis_source_type ON WaterAnalysis(sourceType);`,
      `CREATE INDEX IF NOT EXISTS idx_wateranalysis_reliability ON WaterAnalysis(reliabilityScore);`,
      `CREATE TABLE IF NOT EXISTS ScanResult (
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
      );`,
      `CREATE INDEX IF NOT EXISTS idx_scanresult_timestamp ON ScanResult(timestamp);`,
      `CREATE INDEX IF NOT EXISTS idx_scanresult_profile ON ScanResult(profile);`,
      `CREATE INDEX IF NOT EXISTS idx_scanresult_source ON ScanResult(waterSourceId);`,
      `CREATE INDEX IF NOT EXISTS idx_scanresult_barcode ON ScanResult(barcode);`,
      `CREATE INDEX IF NOT EXISTS idx_scanresult_score ON ScanResult(score);`
    ];

    for (const statement of statements) {
      await this.db.execute(statement);
    }
  }

  /**
   * Ensure database is initialized before operations
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.init();
    }

    if (!this.db) {
      throw new Error('[SQLite] Database not initialized');
    }
  }

  // ==================== WaterSource Operations ====================

  /**
   * Find water source by barcode
   */
  async findWaterSourceByBarcode(barcode: string): Promise<(WaterSource & { analyses: WaterAnalysis[] }) | null> {
    await this.ensureInitialized();
    if (!this.db) {
      console.error('[SQLite] Database not initialized when searching for barcode');
      return null;
    }

    try {
      console.log(`[SQLite] Searching for barcode: ${barcode}`);

      const sourceResult = await this.db.query(
        'SELECT * FROM WaterSource WHERE barcode = ? LIMIT 1',
        [barcode]
      );

      console.log(`[SQLite] Query returned ${sourceResult.values?.length || 0} results`);

      if (!sourceResult.values || sourceResult.values.length === 0) {
        console.log('[SQLite] Barcode not found in database');
        return null;
      }

      const source = sourceResult.values[0] as WaterSource;
      console.log(`[SQLite] Found source: ${source.brand} - ${source.productName}`);

      // Get latest analysis
      const analysisResult = await this.db.query(
        'SELECT * FROM WaterAnalysis WHERE waterSourceId = ? ORDER BY createdAt DESC LIMIT 1',
        [source.id]
      );

      const analyses = (analysisResult.values || []) as WaterAnalysis[];
      console.log(`[SQLite] Found ${analyses.length} analyses for source`);

      return {
        ...source,
        analyses
      };
    } catch (error) {
      console.error('[SQLite] Error finding water source:', error);
      return null;
    }
  }

  /**
   * Create water source
   */
  async createWaterSource(data: Omit<WaterSource, 'id' | 'createdAt'>): Promise<WaterSource> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    const id = this.generateId();
    const createdAt = new Date().toISOString();

    await this.db.run(
      `INSERT INTO WaterSource (id, brand, productName, origin, barcode, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, data.brand, data.productName, data.origin, data.barcode, createdAt]
    );

    return { id, ...data, createdAt };
  }

  // ==================== WaterAnalysis Operations ====================

  /**
   * Create water analysis
   */
  async createWaterAnalysis(data: Omit<WaterAnalysis, 'id' | 'createdAt'>): Promise<WaterAnalysis> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    const id = this.generateId();
    const createdAt = new Date().toISOString();

    await this.db.run(
      `INSERT INTO WaterAnalysis (
        id, waterSourceId, analysisDate, sourceType, reliabilityScore,
        ph, calcium, magnesium, sodium, potassium, chloride, sulfate,
        bicarbonate, nitrate, totalDissolvedSolids, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.waterSourceId,
        data.analysisDate,
        data.sourceType,
        data.reliabilityScore,
        data.ph,
        data.calcium,
        data.magnesium,
        data.sodium,
        data.potassium,
        data.chloride,
        data.sulfate,
        data.bicarbonate,
        data.nitrate,
        data.totalDissolvedSolids,
        createdAt
      ]
    );

    return { id, ...data, createdAt };
  }

  // ==================== ScanResult Operations ====================

  /**
   * Get scan history (most recent first)
   */
  async getScanHistory(limit = 50): Promise<(ScanResult & { waterSource?: WaterSource })[]> {
    await this.ensureInitialized();
    if (!this.db) return [];

    try {
      const result = await this.db.query(
        `SELECT
          s.*,
          w.id as ws_id,
          w.brand as ws_brand,
          w.productName as ws_productName,
          w.origin as ws_origin,
          w.barcode as ws_barcode,
          w.createdAt as ws_createdAt
         FROM ScanResult s
         LEFT JOIN WaterSource w ON s.waterSourceId = w.id
         ORDER BY s.timestamp DESC
         LIMIT ?`,
        [limit]
      );

      if (!result.values) return [];

      return result.values.map((row: any) => {
        const scan: ScanResult & { waterSource?: WaterSource } = {
          id: row.id,
          timestamp: row.timestamp,
          barcode: row.barcode,
          profile: row.profile,
          score: row.score,
          metricScores: row.metricScores,
          ocrTextRaw: row.ocrTextRaw,
          ocrParsedValues: row.ocrParsedValues,
          userOverrides: row.userOverrides,
          waterSourceId: row.waterSourceId,
          waterAnalysisId: row.waterAnalysisId,
        };

        if (row.ws_id) {
          scan.waterSource = {
            id: row.ws_id,
            brand: row.ws_brand,
            productName: row.ws_productName,
            origin: row.ws_origin,
            barcode: row.ws_barcode,
            createdAt: row.ws_createdAt,
          };
        }

        return scan;
      });
    } catch (error) {
      console.error('[SQLite] Error getting scan history:', error);
      return [];
    }
  }

  /**
   * Create scan result
   */
  async createScanResult(data: Omit<ScanResult, 'id' | 'timestamp'>): Promise<ScanResult> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    const id = this.generateId();
    const timestamp = new Date().toISOString();

    await this.db.run(
      `INSERT INTO ScanResult (
        id, timestamp, barcode, profile, score, metricScores,
        ocrTextRaw, ocrParsedValues, userOverrides, waterSourceId, waterAnalysisId
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        timestamp,
        data.barcode,
        data.profile,
        data.score,
        data.metricScores,
        data.ocrTextRaw,
        data.ocrParsedValues,
        data.userOverrides,
        data.waterSourceId,
        data.waterAnalysisId
      ]
    );

    return { id, timestamp, ...data };
  }

  // ==================== Utility Methods ====================

  /**
   * Generate a CUID-like ID
   */
  private generateId(): string {
    const timestamp = Date.now().toString(36);
    const randomStr = Math.random().toString(36).substring(2, 15);
    return `${timestamp}${randomStr}`;
  }

  /**
   * Import pre-populated data (called during first app launch)
   */
  async importPreloadedData(sources: WaterSource[], analyses: WaterAnalysis[]): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) throw new Error('Database not initialized');

    console.log(`[SQLite] Starting import: ${sources.length} water sources and ${analyses.length} analyses`);

    try {
      // Check if data already exists
      const countResult = await this.db.query('SELECT COUNT(*) as count FROM WaterSource');
      const count = countResult.values?.[0]?.count || 0;

      if (count > 0) {
        console.log(`[SQLite] Data already imported (${count} sources found), skipping`);
        return;
      }

      console.log('[SQLite] Database is empty, proceeding with import...');

      // Import water sources
      let importedSources = 0;
      for (const source of sources) {
        await this.db.run(
          `INSERT INTO WaterSource (id, brand, productName, origin, barcode, createdAt)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [source.id, source.brand, source.productName, source.origin, source.barcode, source.createdAt]
        );
        importedSources++;

        // Log progress every 10 sources
        if (importedSources % 10 === 0) {
          console.log(`[SQLite] Imported ${importedSources}/${sources.length} sources...`);
        }
      }

      console.log(`[SQLite] Imported all ${importedSources} water sources`);

      // Import analyses
      let importedAnalyses = 0;
      for (const analysis of analyses) {
        await this.db.run(
          `INSERT INTO WaterAnalysis (
            id, waterSourceId, analysisDate, sourceType, reliabilityScore,
            ph, calcium, magnesium, sodium, potassium, chloride, sulfate,
            bicarbonate, nitrate, totalDissolvedSolids, createdAt
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            analysis.id,
            analysis.waterSourceId,
            analysis.analysisDate,
            analysis.sourceType,
            analysis.reliabilityScore,
            analysis.ph,
            analysis.calcium,
            analysis.magnesium,
            analysis.sodium,
            analysis.potassium,
            analysis.chloride,
            analysis.sulfate,
            analysis.bicarbonate,
            analysis.nitrate,
            analysis.totalDissolvedSolids,
            analysis.createdAt
          ]
        );
        importedAnalyses++;

        // Log progress every 10 analyses
        if (importedAnalyses % 10 === 0) {
          console.log(`[SQLite] Imported ${importedAnalyses}/${analyses.length} analyses...`);
        }
      }

      console.log(`[SQLite] Imported all ${importedAnalyses} analyses`);

      // Verify import success
      const finalCount = await this.db.query('SELECT COUNT(*) as count FROM WaterSource');
      const finalSourceCount = finalCount.values?.[0]?.count || 0;

      const analysisCount = await this.db.query('SELECT COUNT(*) as count FROM WaterAnalysis');
      const finalAnalysisCount = analysisCount.values?.[0]?.count || 0;

      console.log(`[SQLite] ✅ Data import completed: ${finalSourceCount} sources, ${finalAnalysisCount} analyses`);
    } catch (error) {
      console.error('[SQLite] ❌ Error importing data:', error);
      throw error;
    }
  }

  /**
   * Close database connection
   */
  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
      this.isInitialized = false;
    }
  }
}

// Export singleton instance
export const sqliteService = new SQLiteService();
