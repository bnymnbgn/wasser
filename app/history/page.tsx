export const dynamic = "force-dynamic";

import { prisma } from "@/src/lib/prisma";
import { mapPrismaScanResult } from "@/src/domain/mappers";
import type { ScanResult as DomainScanResult } from "@/src/domain/types";
import HistoryList from "@/src/components/HistoryList";

export default async function HistoryPage() {
  const prismaScans = await prisma.scanResult.findMany({
    orderBy: { timestamp: "desc" },
    take: 50,
  });

  const scans: DomainScanResult[] = prismaScans.map(mapPrismaScanResult);

  return (
    <main className="min-h-screen bg-md-background dark:bg-md-dark-background text-md-onBackground dark:text-md-dark-onBackground">
      <div className="mx-auto max-w-2xl px-4 py-4 safe-area-top">
        {/* Header */}
        <header className="mb-6">
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
