import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { mapPrismaScanResult } from "@/src/domain/mappers";
import { calculateScores } from "@/src/domain/scoring";
import { deriveWaterInsights } from "@/src/domain/waterInsights";

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const scan = await prisma.scanResult.findUnique({
            where: { id },
            include: {
                waterSource: true,
            },
        });

        if (!scan) {
            return NextResponse.json(
                { error: "Scan nicht gefunden" },
                { status: 404 }
            );
        }

        // Map and enrich with scores
        const mapped = mapPrismaScanResult(scan);
        const mergedValues = {
            ...(mapped.ocrParsedValues ?? {}),
            ...(mapped.userOverrides ?? {}),
        };

        const hasValues = Object.keys(mergedValues).length > 0;
        if (!hasValues) {
            return NextResponse.json(mapped);
        }

        const scoreResult = calculateScores(mergedValues, mapped.profile);
        const insights = deriveWaterInsights(mergedValues);

        return NextResponse.json({
            ...mapped,
            metricDetails: scoreResult.metrics,
            insights,
        });
    } catch (error) {
        console.error("Error loading scan:", error);
        return NextResponse.json(
            { error: "Fehler beim Laden des Scans" },
            { status: 500 }
        );
    }
}
