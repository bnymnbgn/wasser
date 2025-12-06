/**
 * SQLite Database Service for Capacitor Mobile App
 * Handles local database operations with pre-populated product data
 */

import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';

// Database configuration
const DB_NAME = 'wasserscan.db';
const DB_VERSION = 3;

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
   fluoride: number | null;
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

// User profile (hydration) and consumptions
export interface UserProfile {
  id: string;
  weight: number; // kg
  height: number; // cm
  age: number;
  gender: 'male' | 'female' | 'other';
  activityLevel: 'sedentary' | 'moderate' | 'active' | 'very_active';
  profileType: string; // ProfileType
  dailyWaterGoal: number; // ml
  dailyCalciumGoal: number; // mg
  dailyMagnesiumGoal: number; // mg
  dailyPotassiumGoal: number; // mg
  dailySodiumGoal: number; // mg
  createdAt: string;
  updatedAt: string;
}

export interface ConsumptionEntry {
  id: string;
  timestamp: string;
  waterBrand: string | null;
  productName: string | null;
  volumeMl: number;
  hydrationFactor: number; // e.g. 1.0 water/tea, 0.8 coffee
  type: 'mineral' | 'tap' | 'tea' | 'coffee' | 'other';
  calcium: number | null;
  magnesium: number | null;
  potassium: number | null;
  sodium: number | null;
  scanId: string | null;
  createdAt: string;
}

class SQLiteService {
  private sqliteConnection: SQLiteConnection | null = null;
  private db: SQLiteDBConnection | null = null;
  private isInitialized = false;
  private isInitializing = false;
  private initPromise: Promise<void> | null = null;

  /**
   * Normalize DB name for plugin checks (plugin strips .db internally)
   */
  private getNormalizedDbName(): string {
    return DB_NAME.endsWith('.db') ? DB_NAME.slice(0, -3) : DB_NAME;
  }

  /**
   * Try to copy a prebuilt database from public/assets/databases (Capacitor asset)
   */
  private async ensureDatabaseFromAssets(): Promise<void> {
    const normalizedName = this.getNormalizedDbName();
    try {
      const exists = await CapacitorSQLite.isDatabase({ database: normalizedName });
      if (exists?.result) {
        return;
      }
    } catch (err) {
      console.warn('[SQLite] Failed to check database existence, proceeding to copyFromAssets', err);
    }

    try {
      console.log('[SQLite] Database not found, attempting copyFromAssets...');
      await CapacitorSQLite.copyFromAssets({ overwrite: false });
      console.log('[SQLite] copyFromAssets completed');
    } catch (err) {
      console.warn('[SQLite] copyFromAssets failed; will fall back to JSON import', err);
    }
  }

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
    if (this.initPromise) return this.initPromise;

    this.isInitializing = true;
    this.initPromise = (async () => {
      if (!this.isCapacitor()) {
        console.log('[SQLite] Not running in Capacitor, skipping initialization');
        this.isInitialized = true;
        return;
      }

      try {
        // Try to hydrate from prebuilt asset before opening any connection
        await this.ensureDatabaseFromAssets();

        // Reuse an existing connection if one is already open (prevents "connection already exists")
        if (!this.sqliteConnection) {
          this.sqliteConnection = new SQLiteConnection(CapacitorSQLite);
        }

        const consistency = await this.sqliteConnection.checkConnectionsConsistency();
        const hasConnection = await this.sqliteConnection.isConnection(DB_NAME, false);

        if (consistency.result && hasConnection.result) {
          try {
            // Reuse existing connection if possible
            this.db = await this.sqliteConnection.retrieveConnection(DB_NAME, false);
          } catch (err) {
            console.warn('[SQLite] Failed to retrieve existing connection, closing and recreating', err);
            await this.sqliteConnection.closeConnection(DB_NAME, false);
            this.db = null;
          }
        }

        if (!this.db) {
          // Open or create the database
          this.db = await this.sqliteConnection.createConnection(
            DB_NAME,
            false, // encrypted
            'no-encryption',
            DB_VERSION,
            false // readonly
          );
        }

        // Ensure DB is open
        const isOpen = (await this.db.isDBOpen())?.result;
        if (!isOpen) {
          await this.db.open();
        }

        await this.ensureSchema();
        this.isInitialized = true;

        console.log('[SQLite] Database initialized successfully');
      } catch (error) {
        console.error('[SQLite] Initialization error:', error);
        throw error;
      } finally {
        this.isInitializing = false;
        this.initPromise = null;
      }
    })();

    return this.initPromise;
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
        fluoride REAL,
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
      ,`CREATE TABLE IF NOT EXISTS UserProfile (
        id TEXT PRIMARY KEY,
        weight REAL NOT NULL,
        height REAL NOT NULL,
        age INTEGER NOT NULL,
        gender TEXT NOT NULL,
        activityLevel TEXT NOT NULL,
        profileType TEXT NOT NULL,
        dailyWaterGoal REAL NOT NULL,
        dailyCalciumGoal REAL NOT NULL,
        dailyMagnesiumGoal REAL NOT NULL,
        dailyPotassiumGoal REAL NOT NULL,
        dailySodiumGoal REAL NOT NULL,
        createdAt TEXT NOT NULL,
        updatedAt TEXT NOT NULL
      );`
      ,`CREATE TABLE IF NOT EXISTS Consumption (
        id TEXT PRIMARY KEY,
        timestamp TEXT NOT NULL,
        waterBrand TEXT,
        productName TEXT,
        volumeMl REAL NOT NULL,
        hydrationFactor REAL NOT NULL,
        type TEXT NOT NULL,
        calcium REAL,
        magnesium REAL,
        potassium REAL,
        sodium REAL,
        scanId TEXT,
        createdAt TEXT NOT NULL
      );`
      ,`CREATE INDEX IF NOT EXISTS idx_consumption_timestamp ON Consumption(timestamp);`
    ];

    for (const statement of statements) {
      await this.db.execute(statement);
    }

    // Add fluoride column if missing (legacy DBs)
    try {
      await this.db.execute('ALTER TABLE WaterAnalysis ADD COLUMN fluoride REAL;');
      console.log('[SQLite] Added fluoride column to WaterAnalysis');
    } catch {
      // ignore if column already exists
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
      if (!this.isCapacitor()) {
        return;
      }
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
    if (!this.db) {
      if (!this.isCapacitor()) {
        console.warn('[SQLite] createWaterSource called in web context – returning mock');
        const createdAt = new Date().toISOString();
        return { id: this.generateId(), ...data, createdAt };
      }
      throw new Error('Database not initialized');
    }

    const id = this.generateId();
    const createdAt = new Date().toISOString();

    await this.db.run(
      `INSERT INTO WaterSource (id, brand, productName, origin, barcode, createdAt)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, data.brand, data.productName, data.origin, data.barcode, createdAt]
    );

    return { id, ...data, createdAt };
  }

  /**
   * Check if preloaded data already exists (used to skip JSON import)
   */
  async hasPreloadedData(): Promise<boolean> {
    try {
      await this.ensureInitialized();
    } catch (err) {
      console.warn('[SQLite] hasPreloadedData could not init DB:', err);
      return false;
    }

    if (!this.db) {
      console.warn('[SQLite] hasPreloadedData: DB handle missing');
      return false;
    }

    try {
      const result = await this.db.query('SELECT COUNT(*) as count FROM WaterSource LIMIT 1');
      return (result.values?.[0]?.count ?? 0) > 0;
    } catch (error) {
      console.error('[SQLite] Error checking preloaded data:', error);
      return false;
    }
  }

  // ==================== WaterAnalysis Operations ====================

  /**
   * Create water analysis
   */
  async createWaterAnalysis(data: Omit<WaterAnalysis, 'id' | 'createdAt'>): Promise<WaterAnalysis> {
    await this.ensureInitialized();
    if (!this.db) {
      if (!this.isCapacitor()) {
        console.warn('[SQLite] createWaterAnalysis called in web context – returning mock');
        const createdAt = new Date().toISOString();
        return { id: this.generateId(), ...data, createdAt };
      }
      throw new Error('Database not initialized');
    }

    const id = this.generateId();
    const createdAt = new Date().toISOString();

    await this.db.run(
      `INSERT INTO WaterAnalysis (
        id, waterSourceId, analysisDate, sourceType, reliabilityScore,
        ph, calcium, magnesium, sodium, potassium, chloride, sulfate,
        bicarbonate, nitrate, fluoride, totalDissolvedSolids, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        data.fluoride,
        data.totalDissolvedSolids,
        createdAt
      ]
    );

    return { id, ...data, createdAt };
  }

  // ==================== User Profile ====================

  async upsertUserProfile(profile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'> & { id?: string }): Promise<UserProfile> {
    await this.ensureInitialized();
    if (!this.db) {
      if (!this.isCapacitor()) {
        console.warn('[SQLite] upsertUserProfile called in web context – returning mock');
        const now = new Date().toISOString();
        return { id: profile.id ?? this.generateId(), createdAt: now, updatedAt: now, ...profile } as UserProfile;
      }
      throw new Error('Database not initialized');
    }

    const now = new Date().toISOString();
    const id = profile.id ?? this.generateId();

    await this.db.run(
      `INSERT INTO UserProfile (
        id, weight, height, age, gender, activityLevel, profileType,
        dailyWaterGoal, dailyCalciumGoal, dailyMagnesiumGoal, dailyPotassiumGoal, dailySodiumGoal,
        createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        weight = excluded.weight,
        height = excluded.height,
        age = excluded.age,
        gender = excluded.gender,
        activityLevel = excluded.activityLevel,
        profileType = excluded.profileType,
        dailyWaterGoal = excluded.dailyWaterGoal,
        dailyCalciumGoal = excluded.dailyCalciumGoal,
        dailyMagnesiumGoal = excluded.dailyMagnesiumGoal,
        dailyPotassiumGoal = excluded.dailyPotassiumGoal,
        dailySodiumGoal = excluded.dailySodiumGoal,
        updatedAt = excluded.updatedAt;
      `,
      [
        id,
        profile.weight,
        profile.height,
        profile.age,
        profile.gender,
        profile.activityLevel,
        profile.profileType,
        profile.dailyWaterGoal,
        profile.dailyCalciumGoal,
        profile.dailyMagnesiumGoal,
        profile.dailyPotassiumGoal,
        profile.dailySodiumGoal,
        now,
        now,
      ]
    );

    return { id, createdAt: now, updatedAt: now, ...profile } as UserProfile;
  }

  async getUserProfile(): Promise<UserProfile | null> {
    await this.ensureInitialized();
    if (!this.db) return null;
    const result = await this.db.query('SELECT * FROM UserProfile LIMIT 1');
    if (!result.values || result.values.length === 0) return null;
    return result.values[0] as UserProfile;
  }

  // ==================== Consumption ====================

  async addConsumption(entry: Omit<ConsumptionEntry, 'createdAt'>): Promise<ConsumptionEntry> {
    await this.ensureInitialized();
    if (!this.db) {
      if (!this.isCapacitor()) {
        console.warn('[SQLite] addConsumption called in web context – storing in-memory only');
        return { ...entry, createdAt: new Date().toISOString() };
      }
      throw new Error('Database not initialized');
    }
    const createdAt = new Date().toISOString();
    await this.db.run(
      `INSERT INTO Consumption (
        id, timestamp, waterBrand, productName, volumeMl, hydrationFactor, type,
        calcium, magnesium, potassium, sodium, scanId, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        entry.id,
        entry.timestamp,
        entry.waterBrand,
        entry.productName,
        entry.volumeMl,
        entry.hydrationFactor,
        entry.type,
        entry.calcium,
        entry.magnesium,
        entry.potassium,
        entry.sodium,
        entry.scanId,
        createdAt,
      ]
    );

    return { ...entry, createdAt };
  }

  async deleteConsumption(id: string): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) {
      if (!this.isCapacitor()) {
        console.warn('[SQLite] deleteConsumption called in web context – no-op');
        return;
      }
      throw new Error('Database not initialized');
    }
    await this.db.run('DELETE FROM Consumption WHERE id = ?', [id]);
  }

  async getConsumptionsForDate(date: Date): Promise<ConsumptionEntry[]> {
    await this.ensureInitialized();
    if (!this.db) return [];
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 1);

    const result = await this.db.query(
      'SELECT * FROM Consumption WHERE timestamp >= ? AND timestamp < ? ORDER BY timestamp ASC',
      [start.toISOString(), end.toISOString()]
    );
    return (result.values || []) as ConsumptionEntry[];
  }

  async getConsumptionTotalsForDate(date: Date): Promise<{
    totalVolume: number;
    nutrients: { calcium: number; magnesium: number; potassium: number; sodium: number };
  }> {
    const entries = await this.getConsumptionsForDate(date);
    const nutrients = { calcium: 0, magnesium: 0, potassium: 0, sodium: 0 };
    let totalVolume = 0;
    entries.forEach((e) => {
      totalVolume += (e.volumeMl ?? 0) * (e.hydrationFactor ?? 1);
      nutrients.calcium += e.calcium ?? 0;
      nutrients.magnesium += e.magnesium ?? 0;
      nutrients.potassium += e.potassium ?? 0;
      nutrients.sodium += e.sodium ?? 0;
    });
    return { totalVolume, nutrients };
  }

  // ==================== ScanResult Operations ====================

  /**
   * Get scan history (most recent first)
   */
  async getScanHistory(limit = 50): Promise<(ScanResult & { waterSource?: WaterSource; productInfo?: { brand: string; productName: string; origin?: string | null } })[]> {
    await this.ensureInitialized();
    if (!this.db) {
      if (!this.isCapacitor()) {
        console.warn('[SQLite] getScanHistory called in web context – returning empty list');
        return [];
      }
      throw new Error('Database not initialized');
    }

    try {
      const result = await this.db.query(
        `SELECT
          s.*,
          w.id as ws_id,
          w.brand as ws_brand,
          w.productName as ws_productName,
          w.origin as ws_origin,
          w.barcode as ws_barcode,
          w.createdAt as ws_createdAt,
          wa.ph as wa_ph,
          wa.calcium as wa_calcium,
          wa.magnesium as wa_magnesium,
          wa.sodium as wa_sodium,
          wa.potassium as wa_potassium,
          wa.chloride as wa_chloride,
          wa.sulfate as wa_sulfate,
          wa.bicarbonate as wa_bicarbonate,
          wa.nitrate as wa_nitrate,
          wa.fluoride as wa_fluoride,
          wa.totalDissolvedSolids as wa_tds
         FROM ScanResult s
         LEFT JOIN WaterSource w ON s.waterSourceId = w.id
         LEFT JOIN WaterAnalysis wa ON s.waterAnalysisId = wa.id
         ORDER BY s.timestamp DESC
         LIMIT ?`,
        [limit]
      );

      if (!result.values) return [];

      return result.values.map((row: any) => {
        const scan: ScanResult & { waterSource?: WaterSource; productInfo?: { brand: string; productName: string; origin?: string | null } } = {
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

        // If no parsed values stored, fall back to linked analysis to render Mineralwerte
        let hasParsed = false;
        if (scan.ocrParsedValues) {
          try {
            const parsed = JSON.parse(scan.ocrParsedValues);
            hasParsed = Object.keys(parsed || {}).length > 0;
          } catch {
            hasParsed = false;
          }
        }
        if (!hasParsed) {
          const fallbackValues: Partial<WaterAnalysis> = {
            ph: row.wa_ph ?? undefined,
            calcium: row.wa_calcium ?? undefined,
            magnesium: row.wa_magnesium ?? undefined,
            sodium: row.wa_sodium ?? undefined,
            potassium: row.wa_potassium ?? undefined,
            chloride: row.wa_chloride ?? undefined,
            sulfate: row.wa_sulfate ?? undefined,
            bicarbonate: row.wa_bicarbonate ?? undefined,
            nitrate: row.wa_nitrate ?? undefined,
            fluoride: row.wa_fluoride ?? undefined,
            totalDissolvedSolids: row.wa_tds ?? undefined,
          };

          // Only set if at least one value exists
          if (Object.values(fallbackValues).some((v) => v !== undefined && v !== null)) {
            scan.ocrParsedValues = JSON.stringify(fallbackValues);
          }
        }

        if (row.ws_id) {
          scan.waterSource = {
            id: row.ws_id,
            brand: row.ws_brand,
            productName: row.ws_productName,
            origin: row.ws_origin,
            barcode: row.ws_barcode,
            createdAt: row.ws_createdAt,
          };

          scan.productInfo = {
            brand: row.ws_brand,
            productName: row.ws_productName,
            origin: row.ws_origin,
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
    if (!this.db) {
      if (!this.isCapacitor()) {
        console.warn('[SQLite] createScanResult called in web context – returning mock');
        const timestamp = new Date().toISOString();
        return { id: this.generateId(), timestamp, ...data };
      }
      throw new Error('Database not initialized');
    }

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

  /**
   * Clear all scan history
   */
  async clearScanHistory(): Promise<void> {
    await this.ensureInitialized();
    if (!this.db) {
      if (!this.isCapacitor()) {
        console.warn('[SQLite] clearScanHistory called in web context – no-op');
        return;
      }
      throw new Error('Database not initialized');
    }

    try {
      await this.db.run('DELETE FROM ScanResult');
      console.log('[SQLite] Scan history cleared');
    } catch (error) {
      console.error('[SQLite] Error clearing scan history:', error);
      throw error;
    }
  }

  /**
   * Get storage statistics
   */
  async getScanStats(): Promise<{ count: number; sizeBytes: number }> {
    await this.ensureInitialized();
    if (!this.db) return { count: 0, sizeBytes: 0 };

    try {
      // Get count
      const countResult = await this.db.query('SELECT COUNT(*) as count FROM ScanResult');
      const count = countResult.values?.[0]?.count || 0;

      // Estimate size (very rough estimate based on average row size)
      // ScanResult row ~ 2KB (mostly JSON strings)
      const sizeBytes = count * 2048;

      return { count, sizeBytes };
    } catch (error) {
      console.error('[SQLite] Error getting scan stats:', error);
      return { count: 0, sizeBytes: 0 };
    }
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
    if (!this.db) {
      if (!this.isCapacitor()) {
        console.warn('[SQLite] importPreloadedData called in web context – no-op');
        return;
      }
      throw new Error('Database not initialized');
    }

    console.log(`[SQLite] Starting import: ${sources.length} water sources and ${analyses.length} analyses`);

    try {
      // Check how many sources are already present
      const countResult = await this.db.query('SELECT COUNT(*) as count FROM WaterSource');
      const existingCount = countResult.values?.[0]?.count || 0;
      const isFreshImport = existingCount === 0;

      if (isFreshImport) {
        console.log('[SQLite] Database is empty, proceeding with initial import...');
      } else {
        console.log(`[SQLite] Found ${existingCount} existing sources, syncing any missing entries...`);
      }

      // Import water sources
      let importedSources = 0;
      for (const source of sources) {
        try {
          const result = await this.db.run(
            `INSERT OR IGNORE INTO WaterSource (id, brand, productName, origin, barcode, createdAt)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [source.id, source.brand, source.productName, source.origin, source.barcode, source.createdAt]
          );
          const changes = result.changes?.changes ?? 0;
          if (changes > 0) {
            importedSources++;
          }
        } catch (err) {
          console.error(`[SQLite] Failed to import source ${source.id} (${source.brand}):`, err);
        }

        // Log progress every 10 sources
        if (importedSources > 0 && importedSources % 10 === 0) {
          console.log(`[SQLite] Imported ${importedSources} new sources so far...`);
        }
      }

      const skippedSources = sources.length - importedSources;
      console.log(
        `[SQLite] Imported ${importedSources} new water sources${skippedSources > 0 ? `, skipped ${skippedSources} existing entries` : ''}`
      );

      // Import analyses
      let importedAnalyses = 0;
      for (const analysis of analyses) {
        try {
          const result = await this.db.run(
            `INSERT OR IGNORE INTO WaterAnalysis (
              id, waterSourceId, analysisDate, sourceType, reliabilityScore,
              ph, calcium, magnesium, sodium, potassium, chloride, sulfate,
              bicarbonate, nitrate, fluoride, totalDissolvedSolids, createdAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
              analysis.fluoride,
              analysis.totalDissolvedSolids,
              analysis.createdAt
            ]
          );
          const changes = result.changes?.changes ?? 0;
          if (changes > 0) {
            importedAnalyses++;
          }
        } catch (err) {
          console.error(`[SQLite] Failed to import analysis ${analysis.id} (Source: ${analysis.waterSourceId}):`, err);
        }


        // Log progress every 10 analyses
        if (importedAnalyses > 0 && importedAnalyses % 10 === 0) {
          console.log(`[SQLite] Imported ${importedAnalyses} new analyses so far...`);
        }
      }

      const skippedAnalyses = analyses.length - importedAnalyses;
      console.log(
        `[SQLite] Imported ${importedAnalyses} new analyses${skippedAnalyses > 0 ? `, skipped ${skippedAnalyses} existing entries` : ''}`
      );

      // Verify import success
      const finalCount = await this.db.query('SELECT COUNT(*) as count FROM WaterSource');
      const finalSourceCount = finalCount.values?.[0]?.count || 0;

      const analysisCount = await this.db.query('SELECT COUNT(*) as count FROM WaterAnalysis');
      const finalAnalysisCount = analysisCount.values?.[0]?.count || 0;

      console.log(
        `[SQLite] ✅ Data import completed: ${finalSourceCount} sources, ${finalAnalysisCount} analyses`
      );
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
