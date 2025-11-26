'use client';

import type { ScanResult as DomainScanResult } from '@/src/domain/types';
import HistoryList from '@/src/components/HistoryList';

interface HistoryWebProps {
  initialScans: DomainScanResult[];
}

export default function HistoryWeb({ initialScans }: HistoryWebProps) {
  return (
    <main className="relative min-h-screen bg-ocean-background text-ocean-primary">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-8 left-0 h-64 w-64 rounded-full ocean-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full ocean-accent/15 blur-[140px]" />
      </div>
      <div className="relative z-10 mx-auto max-w-3xl px-4 py-6 safe-area-top pb-[calc(var(--bottom-nav-height)+40px)]">
        <div className="mb-6">
          <p className="text-[11px] uppercase tracking-[0.4em] text-ocean-tertiary">Historie</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ocean-primary">Scan-Verlauf</h1>
        </div>
        <div className="ocean-panel p-4 sm:p-6">
          <HistoryList initialScans={initialScans} />
        </div>
      </div>
    </main>
  );
}
