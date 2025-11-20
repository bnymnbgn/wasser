import { mapPrismaScanResult } from "@/src/domain/mappers";
import type { ScanResult as DomainScanResult } from "@/src/domain/types";
import HistoryList from "@/src/components/HistoryList";
import HistoryPageCapacitor from "@/src/components/HistoryPageCapacitor";
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

const isCapacitorBuild = process.env["CAPACITOR_BUILD"] === "true";
export const dynamic = isCapacitorBuild ? "force-static" : "force-dynamic";

export default async function HistoryPage() {
  if (isCapacitorBuild) {
    return <HistoryPageCapacitor />;
  }

  const scans = await loadScans();

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
          <HistoryList initialScans={scans} />
        </div>
      </div>
    </main>
  );
}
