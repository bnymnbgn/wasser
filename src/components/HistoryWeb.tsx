'use client';

import type { ScanResult as DomainScanResult } from '@/src/domain/types';
import HistoryList from '@/src/components/HistoryList';

interface HistoryWebProps {
  initialScans: DomainScanResult[];
}

export default function HistoryWeb({ initialScans }: HistoryWebProps) {
  return (
    <main className="relative flex-1 h-full overflow-hidden text-ocean-primary">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-8 left-0 h-64 w-64 rounded-full ocean-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-64 w-64 rounded-full ocean-accent/15 blur-[140px]" />
      </div>
      <div className="relative z-10 mx-auto max-w-3xl px-4 pt-6 safe-area-top h-full">
        <div className="mb-4">
          <p className="text-[11px] uppercase tracking-[0.4em] text-ocean-tertiary">Historie</p>
          <h1 className="mt-2 text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-ocean-primary via-white to-ocean-accent">
            Scan-Verlauf
          </h1>
        </div>
        <div className="ocean-panel p-4 sm:p-6 h-[calc(100%-64px)] flex flex-col overflow-hidden">
          <HistoryList initialScans={initialScans} />
        </div>
      </div>
    </main>
  );
}
