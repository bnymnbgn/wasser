'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ScanResult, WaterAnalysisValues } from '@/src/domain/types';
import { computeWaterHardness, computeCalciumMagnesiumRatio } from '@/src/lib/waterMath';

const STORAGE_KEY = 'wasserscan-comparison';
const MAX_COMPARISON_ITEMS = 4;

export interface ComparisonItem {
  id: string;
  label: string;
  profile: ScanResult['profile'];
  score?: number;
  timestamp: string;
  barcode?: string;
  values: Partial<WaterAnalysisValues>;
  metricScores?: Record<string, number>;
  productInfo?: ScanResult['productInfo'];
}

interface ComparisonContextValue {
  items: ComparisonItem[];
  addScan: (scan: ScanResult) => void;
  removeScan: (id: string) => void;
  clearAll: () => void;
  isSelected: (id: string) => boolean;
}

const ComparisonContext = createContext<ComparisonContextValue | undefined>(undefined);

export function ComparisonProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ComparisonItem[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as ComparisonItem[];
        const enriched = parsed.map((item) => {
          const values = { ...(item.values ?? {}) };
          const hardness = computeWaterHardness(values);
          const ratio = computeCalciumMagnesiumRatio(values.calcium, values.magnesium);
          if (hardness !== null) values.hardness = hardness;
          if (ratio !== null) values.calciumMagnesiumRatio = ratio;
          return { ...item, values };
        });
        setItems(enriched);
      } catch {
        // ignore parse errors
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addScan = useCallback((scan: ScanResult) => {
    setItems((prev) => {
      if (prev.find((item) => item.id === scan.id)) {
        return prev;
      }

      const values: Partial<WaterAnalysisValues> = {
        ...(scan.ocrParsedValues ?? {}),
        ...(scan.userOverrides ?? {}),
      };

      const hardness = computeWaterHardness(values);
      const ratio = computeCalciumMagnesiumRatio(values.calcium, values.magnesium);
      if (hardness !== null) {
        values.hardness = hardness;
      }
      if (ratio !== null) {
        values.calciumMagnesiumRatio = ratio;
      }

      const label =
        scan.productInfo?.brand ??
        scan.productInfo?.productName ??
        (scan.barcode ? `Scan ${scan.barcode}` : 'Etikett-Scan');

      const derivedMetricScores =
        scan.metricScores ??
        (scan.metricDetails
          ? scan.metricDetails.reduce<Record<string, number>>((acc, entry) => {
              acc[entry.metric] = entry.score;
              return acc;
            }, {})
          : undefined);

      const item: ComparisonItem = {
        id: scan.id,
        label,
        profile: scan.profile,
        score: scan.score,
        timestamp: scan.timestamp,
        barcode: scan.barcode,
        values,
        metricScores: derivedMetricScores,
        productInfo: scan.productInfo,
      };

      const next = [item, ...prev];
      return next.slice(0, MAX_COMPARISON_ITEMS);
    });
  }, []);

  const removeScan = useCallback((id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setItems([]);
  }, []);

  const isSelected = useCallback(
    (id: string) => items.some((item) => item.id === id),
    [items]
  );

  const value = useMemo(
    () => ({
      items,
      addScan,
      removeScan,
      clearAll,
      isSelected,
    }),
    [items, addScan, removeScan, clearAll, isSelected]
  );

  return <ComparisonContext.Provider value={value}>{children}</ComparisonContext.Provider>;
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error('useComparison must be used within a ComparisonProvider');
  }
  return context;
}
