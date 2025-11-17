import { mapPrismaScanResult } from "@/src/domain/mappers";
import type { ScanResult as DomainScanResult } from "@/src/domain/types";
import HistoryList from "@/src/components/HistoryList";
import { calculateScores } from "@/src/domain/scoring";
import { deriveWaterInsights } from "@/src/domain/waterInsights";

async function loadScans(): Promise<DomainScanResult[]> {
  const { prisma } = await import("@/src/lib/prisma");
  const prismaScans = await prisma.scanResult.findMany({
    orderBy: { timestamp: "desc" },
    take: 50,
    include: {
      waterSource: true,
    },
  });

  return prismaScans.map((scan: any) => {
    const mapped = mapPrismaScanResult(scan);
    const mergedValues = {
      ...(mapped.ocrParsedValues ?? {}),
      ...(mapped.userOverrides ?? {}),
    };
    const hasValues = Object.keys(mergedValues).length > 0;
    if (!hasValues) {
      return mapped;
    }
    const scoreResult = calculateScores(mergedValues, mapped.profile);
    const insights = deriveWaterInsights(mergedValues);
    return {
      ...mapped,
      metricDetails: scoreResult.metrics,
      insights,
    };
  });
}

function OfflineHistoryFallback() {
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
            Die Verlaufsliste ist in der Offline-Build nicht verfügbar. Bitte verwende eine Server-Verbindung.
          </p>
        </header>
        <div className="glass-card p-5 text-sm text-md-onSurface-variant dark:text-md-dark-onSurface-variant">
          Aktiviere eine Backend-Verbindung oder nutze den Web-Build, um gespeicherte Scans zu sehen.
        </div>
      </div>
    </main>
  );
}

const isCapacitorBuild = process.env["CAPACITOR_BUILD"] === "true";
export const dynamic = isCapacitorBuild ? "force-static" : "force-dynamic";

export default async function HistoryPage() {
  if (isCapacitorBuild) {
    return <OfflineHistoryFallback />;
  }

  const scans = await loadScans();

  return (
    <main className="relative min-h-screen bg-md-background dark:bg-md-dark-background text-md-onBackground dark:text-md-dark-onBackground">
      <div className="absolute inset-0 bg-surface-gradient" />
      <div className="absolute inset-0 grid-overlay" />
      <div className="relative mx-auto max-w-2xl px-4 py-4 safe-area-top pb-[calc(var(--bottom-nav-height)+32px)]">
        {/* History List */}
        <HistoryList initialScans={scans} />
      </div>
    </main>
  );
}
