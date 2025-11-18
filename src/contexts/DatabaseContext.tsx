'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { sqliteService, WaterSource, WaterAnalysis } from '@/lib/sqlite';
// Import JSON data directly for reliability in Capacitor apps
import waterSourcesData from '@/src/data/water-sources.json';
import waterAnalysesData from '@/src/data/water-analyses.json';

interface DatabaseContextType {
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
}

const DatabaseContext = createContext<DatabaseContextType>({
  isReady: false,
  isLoading: true,
  error: null,
});

export function useDatabaseContext() {
  return useContext(DatabaseContext);
}

interface DatabaseProviderProps {
  children: React.ReactNode;
}

export function DatabaseProvider({ children }: DatabaseProviderProps) {
  const [isReady, setIsReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initDatabase = async () => {
      // Only initialize on native platforms (not in browser)
      if (!Capacitor.isNativePlatform()) {
        console.log('[DatabaseProvider] Running in browser, skipping SQLite initialization');
        setIsReady(true);
        setIsLoading(false);
        return;
      }

      try {
        console.log('[DatabaseProvider] Initializing SQLite database...');

        // Initialize SQLite connection
        await sqliteService.init();

        // Load and import preloaded data from JSON files
        await loadPreloadedData();

        console.log('[DatabaseProvider] Database ready');
        setIsReady(true);
      } catch (err) {
        console.error('[DatabaseProvider] Initialization failed:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    initDatabase();

    // Cleanup on unmount
    return () => {
      if (Capacitor.isNativePlatform()) {
        sqliteService.close().catch(console.error);
      }
    };
  }, []);

  return (
    <DatabaseContext.Provider value={{ isReady, isLoading, error }}>
      {children}
    </DatabaseContext.Provider>
  );
}

/**
 * Load preloaded water data from JSON files bundled in the app
 * This runs on first app launch to populate the local database
 */
async function loadPreloadedData(): Promise<void> {
  try {
    console.log('[DatabaseProvider] Loading preloaded data...');

    // Use directly imported JSON data (more reliable for Capacitor apps)
    const sources: WaterSource[] = waterSourcesData as WaterSource[];
    const analyses: WaterAnalysis[] = waterAnalysesData as WaterAnalysis[];

    console.log(`[DatabaseProvider] Loaded ${sources.length} sources and ${analyses.length} analyses from imported data`);

    // Verify data is not empty
    if (sources.length === 0 || analyses.length === 0) {
      throw new Error(`Invalid data: sources=${sources.length}, analyses=${analyses.length}`);
    }

    // Import into SQLite
    await sqliteService.importPreloadedData(sources, analyses);

    console.log('[DatabaseProvider] Preloaded data imported successfully');
  } catch (error) {
    console.error('[DatabaseProvider] Failed to load preloaded data:', error);
    // Don't throw - app can still function without preloaded data
    // User can still scan and use OCR, they just won't have barcode lookup
  }
}
