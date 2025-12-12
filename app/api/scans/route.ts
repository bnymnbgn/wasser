import { NextResponse } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { mapPrismaScanResult } from '@/src/domain/mappers';
import { calculateScores } from '@/src/domain/scoring';

export async function GET() {
    try {
        const prismaScans = await prisma.scanResult.findMany({
            orderBy: { timestamp: 'desc' },
            take: 20,
            include: {
                waterSource: true,
            },
        });

        const scans = prismaScans.map((scan: any) => {
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
            return {
                ...mapped,
                score: scoreResult.totalScore,
                metricScores: scoreResult.metrics.reduce<Record<string, number>>((acc, m) => {
                    acc[m.metric] = m.score;
                    return acc;
                }, {}),
            };
        });

        return NextResponse.json({ scans });
    } catch (error) {
        console.error('[API] Failed to fetch scans:', error);
        return NextResponse.json({ scans: [], error: 'Failed to fetch scans' }, { status: 500 });
    }
}
