'use client';

import { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { sqliteService } from '@/lib/sqlite';
import HistoryList from '@/src/components/HistoryList';
import type { ScanResult as DomainScanResult } from '@/src/domain/types';
import { calculateScores } from '@/src/domain/scoring';
import { deriveWaterInsights } from '@/src/domain/waterInsights';
import { useDatabaseContext } from '@/src/contexts/DatabaseContext';

/**
 * Client-side history page for Capacitor builds
 * Loads scan data from local SQLite database
 */
export default function HistoryPageCapacitor() {
  const { isReady, isLoading, error: dbError } = useDatabaseContext();
  const [scans, setScans] = useState<DomainScanResult[]>([]);
  const [isLoadingScans, setIsLoadingScans] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadLocalScans() {
      if (!isReady || !Capacitor.isNativePlatform()) {
        setIsLoadingScans(false);
        return;
      }

      try {
        setIsLoadingScans(true);
        const sqliteScans = await sqliteService.getScanHistory(50);

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

          let metricDetails = metricScores;
          let insights = undefined;

          if (hasValues) {
            const scoreResult = calculateScores(mergedValues, scan.profile as any);
            insights = deriveWaterInsights(mergedValues);
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

        setScans(domainScans);
      } catch (err) {
        console.error('[HistoryPageCapacitor] Failed to load scans:', err);
        setError(err instanceof Error ? err.message : 'Failed to load scan history');
      } finally {
        setIsLoadingScans(false);
      }
    }

    loadLocalScans();
  }, [isReady]);

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
    <main className="relative min-h-screen bg-md-background dark:bg-md-dark-background text-md-onBackground dark:text-md-dark-onBackground">
      <div className="absolute inset-0 bg-surface-gradient" />
      <div className="absolute inset-0 grid-overlay" />
      <div className="relative mx-auto max-w-2xl px-4 py-4 safe-area-top pb-[calc(var(--bottom-nav-height)+32px)]">
        <HistoryList initialScans={scans} />
      </div>
    </main>
  );
}
