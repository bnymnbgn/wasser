import { prisma } from "@/src/lib/prisma";
import { mapPrismaScanResult } from "@/src/domain/mappers";
import type { ScanResult as DomainScanResult } from "@/src/domain/types";
import { WaterScoreCard } from "@/src/components/WaterScoreCard";
import Link from "next/link";

function scoreLabel(score: number | undefined) {
  if (score == null) return "unbekannt";
  if (score >= 80) return "sehr gut";
  if (score >= 50) return "okay";
  return "kritisch";
}

function scoreColor(score: number | undefined) {
  if (score == null) return "bg-slate-700 text-slate-100";
  if (score >= 80) return "bg-emerald-500/20 text-emerald-200 border border-emerald-500/60";
  if (score >= 50) return "bg-amber-500/20 text-amber-200 border border-amber-500/60";
  return "bg-rose-500/20 text-rose-200 border border-rose-500/60";
}

export default async function HistoryPage() {
  const prismaScans = await prisma.scanResult.findMany({
    orderBy: { timestamp: "desc" },
    take: 50,
  });

  const scans: DomainScanResult[] = prismaScans.map(mapPrismaScanResult);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold mb-2">Verlauf</h1>
          <p className="text-sm text-slate-300 mb-4">
            Letzte Bewertungen deines Trinkwassers.
          </p>
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-slate-700 px-3 py-1 text-xs hover:border-slate-500 hover:bg-slate-900"
          >
            ← Zur Startseite
          </Link>
        </div>

        {scans.length === 0 && (
          <div className="rounded-xl border border-slate-700 bg-slate-900/60 p-8 text-center">
            <p className="text-sm text-slate-400 mb-4">
              Noch keine Scans vorhanden.
            </p>
            <Link
              href="/scan"
              className="inline-flex items-center rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-black hover:bg-emerald-400"
            >
              Ersten Scan starten
            </Link>
          </div>
        )}

        <div className="space-y-4">
          {scans.map((scan) => (
            <div
              key={scan.id}
              className="rounded-xl border border-slate-700 bg-slate-900/80 p-4"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4">
                <div>
                  <div className="text-xs text-slate-400">
                    {new Date(scan.timestamp).toLocaleString("de-DE")}
                  </div>
                  <div className="text-xs text-slate-400">
                    Profil: <span className="font-medium">{scan.profile}</span>
                  </div>
                  {scan.barcode && (
                    <div className="text-xs text-slate-400">
                      Barcode: <span className="font-mono">{scan.barcode}</span>
                    </div>
                  )}
                </div>

                <div
                  className={`rounded-full px-3 py-1 text-xs font-medium ${scoreColor(
                    scan.score
                  )}`}
                >
                  Score: {scan.score?.toFixed(0) ?? "–"} / 100 ({scoreLabel(scan.score)})
                </div>
              </div>

              <WaterScoreCard scanResult={scan} />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}