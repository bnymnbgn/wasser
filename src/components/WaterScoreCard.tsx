import type { ScanResult } from "@/src/domain/types";
import { calculateScores } from "@/src/domain/scoring";

function scoreToColor(score: number | undefined) {
  if (score == null) return "bg-slate-700 text-slate-100";
  if (score >= 80) return "bg-emerald-500/20 text-emerald-200 border border-emerald-500/60";
  if (score >= 50) return "bg-amber-500/20 text-amber-200 border border-amber-500/60";
  return "bg-rose-500/20 text-rose-200 border border-rose-500/60";
}

function scoreLabel(score: number | undefined) {
  if (score == null) return "unbekannt";
  if (score >= 80) return "sehr gut";
  if (score >= 50) return "okay";
  return "kritisch";
}

interface Props {
  scanResult: ScanResult;
}

export function WaterScoreCard({ scanResult }: Props) {
  const { score, metricScores, ocrParsedValues, profile } = scanResult;

  // Erklärungen für die Metriken berechnen
  const scoring = ocrParsedValues
    ? calculateScores(ocrParsedValues, profile)
    : null;

  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <div>
          <h2 className="text-lg font-semibold">Ergebnis</h2>
          <p className="text-xs text-slate-300">
            Profil: <span className="font-medium">{scanResult.profile}</span>
          </p>
        </div>

        <div className={`rounded-full px-4 py-2 text-sm font-medium ${scoreToColor(score ?? 0)}`}>
          Gesamt-Score: {score?.toFixed(0) ?? "–"} / 100 ({scoreLabel(score)})
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2 mt-4">
        {/* Extrahierte Werte */}
        {ocrParsedValues && (
          <div className="text-sm">
            <h3 className="font-medium mb-2">Extrahierte Werte</h3>
            <dl className="space-y-1 text-xs text-slate-200">
              {Object.entries(ocrParsedValues).map(([key, value]) => {
                if (value == null) return null;
                const unit =
                  key === "ph"
                    ? ""
                    : key === "totalDissolvedSolids"
                    ? " mg/L"
                    : " mg/L";
                return (
                  <div key={key} className="flex justify-between gap-4">
                    <dt className="capitalize text-slate-400">{key}</dt>
                    <dd className="font-mono">
                      {value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      {unit}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        )}

        {/* Score je Metrik */}
        {metricScores && (
          <div className="text-sm">
            <h3 className="font-medium mb-2">Score je Metrik</h3>
            <ul className="space-y-1 text-xs">
              {Object.entries(metricScores).map(([key, scoreValue]) => (
                <li
                  key={key}
                  className={`flex justify-between rounded-md px-3 py-1 ${scoreToColor(scoreValue)}`}
                >
                  <span className="capitalize">{key}</span>
                  <span className="font-mono">{scoreValue.toFixed(0)} / 100</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Erklärungen (optional) */}
      {scoring && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <h3 className="text-sm font-medium mb-2">Wie die Bewertung zustande kam</h3>
          <div className="grid gap-2 text-xs">
            {scoring.metrics
              .filter(m => m.score !== 50) // Zeige nur relevante Metriken
              .map(metric => (
                <div key={metric.metric} className="rounded-md bg-slate-950/40 p-2">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="font-medium capitalize text-slate-100">
                      {metric.metric}
                    </span>
                    <span className="font-mono text-slate-300">
                      {metric.score.toFixed(0)} / 100
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {metric.explanation}
                  </p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}