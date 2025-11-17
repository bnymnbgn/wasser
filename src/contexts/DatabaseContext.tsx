'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { sqliteService, WaterSource, WaterAnalysis } from '@/lib/sqlite';

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

    // Fetch JSON files from public/data directory
    const [sourcesResponse, analysesResponse] = await Promise.all([
      fetch('/data/water-sources.json'),
      fetch('/data/water-analyses.json'),
    ]);

    if (!sourcesResponse.ok || !analysesResponse.ok) {
      throw new Error('Failed to fetch preloaded data files');
    }

    const sources: WaterSource[] = await sourcesResponse.json();
    const analyses: WaterAnalysis[] = await analysesResponse.json();

    console.log(`[DatabaseProvider] Loaded ${sources.length} sources and ${analyses.length} analyses`);

    // Import into SQLite
    await sqliteService.importPreloadedData(sources, analyses);

    console.log('[DatabaseProvider] Preloaded data imported successfully');
  } catch (error) {
    console.error('[DatabaseProvider] Failed to load preloaded data:', error);
    // Don't throw - app can still function without preloaded data
    // User can still scan and use OCR, they just won't have barcode lookup
  }
}
