'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { sqliteService, WaterSource, WaterAnalysis } from '@/lib/sqlite';
import { InitialLoadingScreen } from '@/src/components/ui/InitialLoadingScreen';
import { initWebDb } from '@/src/lib/webDb';

interface DatabaseContextType {
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  clearHistory: () => Promise<void>;
  getStorageStats: () => Promise<{ count: number; sizeBytes: number }>;
}

const DatabaseContext = createContext<DatabaseContextType>({
  isReady: false,
  isLoading: true,
  error: null,
  clearHistory: async () => { },
  getStorageStats: async () => ({ count: 0, sizeBytes: 0 }),
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const initDatabase = async () => {
      const isNative = Capacitor.isNativePlatform();

      // Web dev DB (optional)
      if (!isNative) {
        try {
          await initWebDb();
          console.log('[DatabaseProvider] Web DB initialized (dev-only)');
        } catch (err) {
          console.warn('[DatabaseProvider] Web DB init failed (ignored):', err);
        }
        setIsReady(true);
        setIsLoading(false);
        return;
      }

      try {
        console.log('[DatabaseProvider] Initializing SQLite database...');

        // Initialize SQLite connection
        await sqliteService.init();

        // If the bundled DB is empty, import JSON as fallback
        const hasData = await sqliteService.hasPreloadedData();
        if (!hasData) {
          await loadPreloadedData();
        } else {
          console.log('[DatabaseProvider] Preloaded DB already has data, skipping JSON import');
        }

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

  const clearHistory = async () => {
    if (!Capacitor.isNativePlatform()) {
      console.log('[DatabaseProvider] clearHistory called (browser mock)');
      return;
    }
    try {
      await sqliteService.clearScanHistory();
    } catch (err) {
      console.error('[DatabaseProvider] Failed to clear history:', err);
      // Optional: set error state or show toast
    }
  };

  const getStorageStats = async () => {
    if (!Capacitor.isNativePlatform()) {
      return { count: 12, sizeBytes: 24576 }; // Mock data
    }
    try {
      return await sqliteService.getScanStats();
    } catch (err) {
      console.error('[DatabaseProvider] Failed to get storage stats:', err);
      return { count: 0, sizeBytes: 0 };
    }
  };

  return (
    <DatabaseContext.Provider value={{ isReady, isLoading, error, clearHistory, getStorageStats }}>
      {mounted && isLoading && Capacitor.isNativePlatform() && <InitialLoadingScreen />}
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

    // Only load JSON data when actually running on the native app
    if (!Capacitor.isNativePlatform()) {
      console.log('[DatabaseProvider] Not on native platform, skipping JSON import');
      return;
    }

    // Dynamically import JSON to avoid bundling it into the web build
    const [sourcesModule, analysesModule] = await Promise.all([
      import('@/src/data/water-sources.json'),
      import('@/src/data/water-analyses.json'),
    ]);

    const sources: WaterSource[] = (sourcesModule.default ?? sourcesModule) as WaterSource[];
    const analyses: WaterAnalysis[] = (analysesModule.default ?? analysesModule) as WaterAnalysis[];

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
