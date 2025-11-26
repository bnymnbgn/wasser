'use client';

import { useMemo } from 'react';
import { Capacitor } from '@capacitor/core';
import type { ScanResult as DomainScanResult } from '@/src/domain/types';
import HistoryPageCapacitor from '@/src/components/HistoryPageCapacitor';
import HistoryWeb from '@/src/components/HistoryWeb';

interface HistorySwitchProps {
  initialScans: DomainScanResult[];
  /**
   * Build-time hint: if true, prefer the native path without relying on runtime detection.
   * This lets exported Capacitor builds skip server-history usage even before the runtime check runs.
   */
  forceNative?: boolean;
}

export default function HistorySwitch({ initialScans, forceNative }: HistorySwitchProps) {
  const isNative = useMemo(
    () => forceNative || Capacitor.isNativePlatform(),
    [forceNative]
  );

  return isNative ? (
    <HistoryPageCapacitor />
  ) : (
    <HistoryWeb initialScans={initialScans} />
  );
}
