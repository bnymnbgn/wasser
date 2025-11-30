import { mapPrismaScanResult } from "@/src/domain/mappers";
import type { ScanResult as DomainScanResult } from "@/src/domain/types";
import { calculateScores } from "@/src/domain/scoring";
import { deriveWaterInsights } from "@/src/domain/waterInsights";
import HistorySwitch from "@/src/components/HistorySwitch";

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

// For web/PWA we always use server history; native builds set CAPACITOR_BUILD
const isCapacitorBuild = process.env["CAPACITOR_BUILD"] === "true";
export const dynamic = isCapacitorBuild ? "force-static" : "force-dynamic";

export default async function HistoryPage() {
  // Wenn wir explizit als Capacitor-Build bauen, laden wir keine Server-History vorab.
  const scans = isCapacitorBuild ? [] : await loadScans();
  return <HistorySwitch initialScans={scans} forceNative={isCapacitorBuild} />;
}
