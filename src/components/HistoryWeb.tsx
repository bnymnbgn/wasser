'use client';

import type { ScanResult as DomainScanResult } from '@/src/domain/types';
import HistoryList from '@/src/components/HistoryList';

interface HistoryWebProps {
  initialScans: DomainScanResult[];
}

export default function HistoryWeb({ initialScans }: HistoryWebProps) {
  return (
    <main className="flex-1 h-full overflow-hidden">
      <HistoryList initialScans={initialScans} />
    </main>
  );
}
