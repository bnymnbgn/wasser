import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { mapPrismaScanResult } from "@/src/domain/mappers";
import { calculateScores } from "@/src/domain/scoring";
import { deriveWaterInsights } from "@/src/domain/waterInsights";

export async function GET() {
  try {
    const scans = await prisma.scanResult.findMany({
      orderBy: { timestamp: "desc" },
      take: 50,
      include: {
        waterSource: true,
      },
    });

    const domainScans = scans.map((scan: any) => {
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

    return NextResponse.json(domainScans);
  } catch (error) {
    console.error("Fehler beim Laden der History:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}
