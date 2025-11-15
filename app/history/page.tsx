export const dynamic = "force-dynamic";

import { prisma } from "@/src/lib/prisma";
import { mapPrismaScanResult } from "@/src/domain/mappers";
import type { ScanResult as DomainScanResult } from "@/src/domain/types";
import HistoryList from "@/src/components/HistoryList";

export default async function HistoryPage() {
  const prismaScans = await prisma.scanResult.findMany({
    orderBy: { timestamp: "desc" },
    take: 50,
    include: {
      waterSource: true,
    },
  });

  const scans: DomainScanResult[] = prismaScans.map(mapPrismaScanResult);

  return (
    <main className="relative min-h-screen bg-md-background dark:bg-md-dark-background text-md-onBackground dark:text-md-dark-onBackground">
      <div className="absolute inset-0 bg-surface-gradient" />
      <div className="absolute inset-0 grid-overlay" />
      <div className="relative mx-auto max-w-2xl px-4 py-4 safe-area-top pb-[calc(var(--bottom-nav-height)+32px)]">
        {/* Header */}
        <header className="mb-6 glass-card p-5">
          <h1 className="text-2xl font-bold tracking-tight text-md-onSurface dark:text-md-dark-onSurface mb-1">
            Verlauf
          </h1>
          <p className="text-sm text-md-onSurface-variant dark:text-md-dark-onSurface-variant">
            Deine letzten {scans.length} Wasseranalysen
          </p>
        </header>

        {/* History List */}
        <HistoryList initialScans={scans} />
      </div>
    </main>
  );
}
