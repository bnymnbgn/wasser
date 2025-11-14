import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { calculateScores } from "@/src/domain/scoring";
import type { ProfileType, WaterAnalysisValues, ScanResult } from "@/src/domain/types";
import { mapPrismaScanResult } from "@/src/domain/mappers";

// MVP: Mocks statt echter externen API
async function mockLookupByBarcode(
  barcode: string
): Promise<{ source: { brand: string; productName: string }; analysis: Partial<WaterAnalysisValues> } | null> {
  // Hier könntest du später Open Food Facts / Hersteller abfragen
  // Jetzt: simple Demo-Daten
  if (barcode === "1234567890123") {
    return {
      source: {
        brand: "Beispielquelle",
        productName: "Sprudel Classic",
      },
      analysis: {
        ph: 7.3,
        calcium: 80,
        magnesium: 25,
        sodium: 10,
        bicarbonate: 220,
        nitrate: 5,
        totalDissolvedSolids: 450,
      },
    };
  }

  if (barcode === "4008501011009") {
    // Gerolsteiner Medium (realer Barcode)
    return {
      source: {
        brand: "Gerolsteiner",
        productName: "Naturell",
      },
      analysis: {
        ph: 7.1,
        calcium: 348,
        magnesium: 108,
        sodium: 118,
        bicarbonate: 1816,
        nitrate: 17,
        totalDissolvedSolids: 2527,
      },
    };
  }

  // Default-Fall: unbekannt
  return null;
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body || typeof body.barcode !== "string") {
    return NextResponse.json(
      { error: "Body muss ein Feld 'barcode' (string) enthalten." },
      { status: 400 }
    );
  }

  const barcode = body.barcode as string;
  const profile = (body.profile ?? "standard") as ProfileType;

  if (!barcode.trim()) {
    return NextResponse.json(
      { error: "Barcode darf nicht leer sein." },
      { status: 400 }
    );
  }

  const lookup = await mockLookupByBarcode(barcode);

  if (!lookup) {
    return NextResponse.json(
      { error: "Kein Wasser zu diesem Barcode gefunden (MVP-Mock)" },
      { status: 404 }
    );
  }

  // WaterSource in DB suchen/erstellen
  const waterSource = await prisma.waterSource.upsert({
    where: { barcode },
    update: {},
    create: {
      barcode,
      brand: lookup.source.brand,
      productName: lookup.source.productName,
    },
  });

  // WaterAnalysis in DB erstellen
  const analysis = await prisma.waterAnalysis.create({
    data: {
      waterSourceId: waterSource.id,
      sourceType: "api",
      reliabilityScore: 0.7,
      ph: lookup.analysis.ph ?? null,
      calcium: lookup.analysis.calcium ?? null,
      magnesium: lookup.analysis.magnesium ?? null,
      sodium: lookup.analysis.sodium ?? null,
      potassium: lookup.analysis.potassium ?? null,
      bicarbonate: lookup.analysis.bicarbonate ?? null,
      nitrate: lookup.analysis.nitrate ?? null,
      totalDissolvedSolids: lookup.analysis.totalDissolvedSolids ?? null,
    },
  });

  // Scoring berechnen
  const scoreResult = calculateScores(lookup.analysis, profile);

  // ScanResult in DB speichern
  const prismaScan = await prisma.scanResult.create({
    data: {
      barcode,
      profile,
      score: scoreResult.totalScore,
      metricScores: scoreResult.metrics.reduce<Record<string, number>>(
        (acc, m) => {
          acc[m.metric] = m.score;
          return acc;
        },
        {}
      ),
      waterSourceId: waterSource.id,
      waterAnalysisId: analysis.id,
    },
  });

  // Domain-Objekt zurückgeben
  const domainScan: ScanResult = mapPrismaScanResult(prismaScan);
  return NextResponse.json(domainScan);
}