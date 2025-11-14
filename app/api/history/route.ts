import { NextResponse } from "next/server";
import { prisma } from "@/src/lib/prisma";
import { mapPrismaScanResult } from "@/src/domain/mappers";

export async function GET() {
  try {
    const scans = await prisma.scanResult.findMany({
      orderBy: { timestamp: "desc" },
      take: 50,
    });

    const domainScans = scans.map(mapPrismaScanResult);

    return NextResponse.json(domainScans);
  } catch (error) {
    console.error("Fehler beim Laden der History:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler" },
      { status: 500 }
    );
  }
}