'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState, useCallback } from 'react';
import { Capacitor } from '@capacitor/core';
import { sqliteService } from '@/lib/sqlite';
import HistoryList from '@/src/components/HistoryList';
import type { ScanResult as DomainScanResult } from '@/src/domain/types';
import { calculateScores } from '@/src/domain/scoring';
import { deriveWaterInsights } from '@/src/domain/waterInsights';
import { useDatabaseContext } from '@/src/contexts/DatabaseContext';
import { RefreshCw } from 'lucide-react';


/**
 * Client-side history page for Capacitor builds
 * Loads scan data from local SQLite database
 */
export default function HistoryPageCapacitor() {
  const pathname = usePathname();
  const { isReady, isLoading, error: dbError } = useDatabaseContext();
  const [scans, setScans] = useState<DomainScanResult[]>([]);
  const [isLoadingScans, setIsLoadingScans] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Update effect dependency
  useEffect(() => {
    async function loadLocalScans() {
      console.log('[HistoryPage] loadLocalScans triggered', { isReady, isNative: Capacitor.isNativePlatform() });

      if (!isReady || !Capacitor.isNativePlatform()) {
        console.log('[HistoryPage] Not ready or not native, skipping');
        setIsLoadingScans(false);
        return;
      }

      try {
        setIsLoadingScans(true);
        console.log('[HistoryPage] Fetching scan history from SQLite...');
        const sqliteScans = await sqliteService.getScanHistory(50);
        console.log(`[HistoryPage] Fetched ${sqliteScans.length} scans`);

        // Map SQLite scans to domain format
        const domainScans: DomainScanResult[] = sqliteScans.map((scan) => {
          const ocrParsedValues = scan.ocrParsedValues ? JSON.parse(scan.ocrParsedValues) : null;
          const userOverrides = scan.userOverrides ? JSON.parse(scan.userOverrides) : null;
          const metricScores = scan.metricScores ? JSON.parse(scan.metricScores) : null;

          const mergedValues = {
            ...(ocrParsedValues ?? {}),
            ...(userOverrides ?? {}),
          };

          const hasValues = Object.keys(mergedValues).length > 0;

          // Prefer stored metricScores; compute only if missing and values exist
          let metricDetails = metricScores ?? undefined;
          const insights = hasValues ? deriveWaterInsights(mergedValues) : undefined;
          if (!metricDetails && hasValues) {
            const scoreResult = calculateScores(mergedValues, scan.profile as any);
            metricDetails = scoreResult.metrics;
          }

          return {
            id: scan.id,
            timestamp: new Date(scan.timestamp).toISOString(),
            barcode: scan.barcode ?? undefined,
            profile: scan.profile as any,
            score: scan.score ?? undefined,
            ocrParsedValues,
            userOverrides,
            metricDetails,
            insights,
            productInfo: scan.waterSource
              ? {
                brand: scan.waterSource.brand,
                productName: scan.waterSource.productName,
                origin: scan.waterSource.origin ?? undefined,
              }
              : undefined,
          };
        });

        console.log('[HistoryPage] Setting scans state:', domainScans.length);
        setScans(domainScans);
        setLastUpdated(new Date());
      } catch (err) {
        console.error('[HistoryPageCapacitor] Failed to load scans:', err);
        setError(err instanceof Error ? err.message : 'Failed to load scan history');
      } finally {
        setIsLoadingScans(false);
      }
    }

    loadLocalScans();

    // Also refresh when window gains focus (e.g. switching apps)
    const handleFocus = () => {
      loadLocalScans();
    };

    // Listen for custom scan-completed event
    const handleScanCompleted = () => {
      console.log('[HistoryPage] scan-completed event received, refreshing...');
      loadLocalScans();
    };

    window.addEventListener('focus', handleFocus);
    window.addEventListener('scan-completed', handleScanCompleted);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('scan-completed', handleScanCompleted);
    };
  }, [isReady, pathname, refreshTrigger]);

  if (dbError) {
    return (
      <main className="relative min-h-screen bg-md-background dark:bg-md-dark-background text-md-onBackground dark:text-md-dark-onBackground">
        <div className="absolute inset-0 bg-surface-gradient" />
        <div className="absolute inset-0 grid-overlay" />
        <div className="relative mx-auto max-w-2xl px-4 py-4 safe-area-top pb-[calc(var(--bottom-nav-height)+32px)]">
          <header className="mb-6 glass-card p-5">
            <h1 className="text-2xl font-bold tracking-tight text-md-onSurface dark:text-md-dark-onSurface mb-1">
              Verlauf
            </h1>
            <p className="text-sm text-md-error dark:text-md-dark-error">
              Fehler beim Laden der Datenbank: {dbError}
            </p>
          </header>
        </div>
      </main>
    );
  }

  if (isLoading || isLoadingScans) {
    return (
      <main className="relative min-h-screen bg-md-background dark:bg-md-dark-background text-md-onBackground dark:text-md-dark-onBackground">
        <div className="absolute inset-0 bg-surface-gradient" />
        <div className="absolute inset-0 grid-overlay" />
        <div className="relative mx-auto max-w-2xl px-4 py-4 safe-area-top pb-[calc(var(--bottom-nav-height)+32px)]">
          <header className="mb-6 glass-card p-5">
            <h1 className="text-2xl font-bold tracking-tight text-md-onSurface dark:text-md-dark-onSurface mb-1">
              Verlauf
            </h1>
            <p className="text-sm text-md-onSurface-variant dark:text-md-dark-onSurface-variant">
              Lade Scan-Historie...
            </p>
          </header>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="relative min-h-screen bg-md-background dark:bg-md-dark-background text-md-onBackground dark:text-md-dark-onBackground">
        <div className="absolute inset-0 bg-surface-gradient" />
        <div className="absolute inset-0 grid-overlay" />
        <div className="relative mx-auto max-w-2xl px-4 py-4 safe-area-top pb-[calc(var(--bottom-nav-height)+32px)]">
          <header className="mb-6 glass-card p-5">
            <h1 className="text-2xl font-bold tracking-tight text-md-onSurface dark:text-md-dark-onSurface mb-1">
              Verlauf
            </h1>
            <p className="text-sm text-md-error dark:text-md-dark-error">
              {error}
            </p>
          </header>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 flex flex-col relative text-slate-900 dark:text-slate-100 overflow-hidden">
      <div className="relative flex-1 flex flex-col mx-auto w-full max-w-2xl px-4 py-6 safe-area-top pb-[calc(var(--bottom-nav-height)+32px)] min-h-0">
        {/* Header Title */}
        <header className="flex-none mb-6 px-1 flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-ocean-primary via-white to-ocean-accent">
              Verlauf
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              Deine Wasser-Analysen im Überblick
              {lastUpdated && (
                <span className="block text-[10px] text-slate-400 font-normal mt-0.5">
                  Aktualisiert: {lastUpdated.toLocaleTimeString()}
                </span>
              )}
            </p>
          </div>
          <button
            onClick={() => setRefreshTrigger(prev => prev + 1)}
            className="p-2 rounded-full bg-white/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 transition-colors"
            aria-label="Aktualisieren"
          >
            <RefreshCw className={`w-5 h-5 ${isLoadingScans ? 'animate-spin' : ''}`} />
          </button>
        </header>

        <div className="flex-1 min-h-0 relative">
          <HistoryList initialScans={scans} />
        </div>
      </div>
    </main>
  );
}
