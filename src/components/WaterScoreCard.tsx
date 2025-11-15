import type { ScanResult, WaterAnalysisValues } from "@/src/domain/types";
import { calculateScores } from "@/src/domain/scoring";
import { deriveWaterInsights, type ProfileFit } from "@/src/domain/waterInsights";

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

const METRIC_LABELS: Record<keyof WaterAnalysisValues, string> = {
  ph: "pH-Wert",
  calcium: "Calcium",
  magnesium: "Magnesium",
  sodium: "Natrium",
  potassium: "Kalium",
  chloride: "Chlorid",
  sulfate: "Sulfat",
  bicarbonate: "Hydrogencarbonat",
  nitrate: "Nitrat",
  totalDissolvedSolids: "Gesamtmineralisation",
};

export function WaterScoreCard({ scanResult }: Props) {
  const { score, metricScores, ocrParsedValues, profile, warnings } = scanResult;
  const values = ocrParsedValues ?? {};
  const insights = deriveWaterInsights(values);
  const activeProfileFit = insights.profileFit?.[profile];

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

      {activeProfileFit && (
        <div className="rounded-lg border border-slate-800 bg-slate-900/60 p-3 mb-4 text-xs">
          <p className="font-semibold text-slate-100">
            Passung für Profil „{profile}“:{" "}
            <span
              className={clsxProfileBadge(activeProfileFit.status)}
            >
              {profileFitLabel(activeProfileFit.status)}
            </span>
          </p>
          {activeProfileFit.reasons.length > 0 && (
            <ul className="mt-1 list-disc space-y-1 pl-5 text-slate-300">
              {activeProfileFit.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 mt-4">
        <div className="text-sm">
          <h3 className="font-medium mb-2">Erkannte Werte & Kennzeichnungen</h3>
          <dl className="space-y-2 text-xs text-slate-200">
            {Object.keys(METRIC_LABELS).map((key) => {
              const metric = key as keyof WaterAnalysisValues;
              const value = values[metric];
              if (value == null) return null;
              const unit = metric === "ph" ? "" : " mg/L";
              return (
                <div key={key} className="flex items-center justify-between gap-2 rounded-md border border-slate-800/70 bg-slate-950/30 px-3 py-2">
                  <dt className="text-slate-300">{METRIC_LABELS[metric]}</dt>
                  <dd className="font-mono">
                    {value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    {unit}
                  </dd>
                </div>
              );
            })}
            {Object.values(values).every((v) => v == null) && (
              <p className="text-slate-400 text-xs">Keine Werte verfügbar.</p>
            )}
          </dl>
        </div>

        {metricScores && (
          <div className="text-sm">
            <h3 className="font-medium mb-2">Score je Metrik</h3>
            <ul className="space-y-2 text-xs">
              {Object.entries(metricScores).map(([key, scoreValue]) => (
                <li
                  key={key}
                  className={`flex justify-between rounded-md px-3 py-2 ${scoreToColor(scoreValue)}`}
                >
                  <span className="capitalize">{key}</span>
                  <span className="font-mono">{scoreValue.toFixed(0)} / 100</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {insights.badges.length > 0 && (
        <section className="mt-5">
          <h3 className="text-sm font-medium mb-2">Regulatorische Hinweise</h3>
          <div className="flex flex-wrap gap-2">
            {insights.badges.map((badge) => (
              <span
                key={badge.id}
                className={badgeToneClass(badge.tone)}
                title={badge.description}
              >
                {badge.label}
              </span>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Basierend auf Min/TafelWV und ernährungsphysiologischen Kategorien (z. B. „calciumhaltig“, „natriumarm“).
          </p>
        </section>
      )}

      {insights.synergies.length > 0 && (
        <section className="mt-5">
          <h3 className="text-sm font-medium mb-2">Synergien & klinische Hinweise</h3>
          <div className="grid gap-2">
            {insights.synergies.map((item) => (
              <div key={item.id} className={synergyToneClass(item.tone)}>
                <p className="text-xs font-semibold text-slate-100">{item.title}</p>
                <p className="text-[11px] text-slate-200">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {warnings && warnings.length > 0 && (
        <section className="mt-5">
          <h3 className="text-sm font-medium text-amber-300 mb-2">Warnungen aus der Analyse</h3>
          <ul className="list-disc pl-5 text-xs text-amber-200 space-y-1">
            {warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        </section>
      )}

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

function profileFitLabel(status: ProfileFit["status"]) {
  switch (status) {
    case "ideal":
      return "ideal";
    case "ok":
      return "ok";
    case "avoid":
      return "kritisch";
    default:
      return status;
  }
}

function clsxProfileBadge(status: ProfileFit["status"]) {
  switch (status) {
    case "ideal":
      return "inline-flex items-center rounded-full bg-emerald-500/20 px-2 py-0.5 text-[11px] text-emerald-200";
    case "ok":
      return "inline-flex items-center rounded-full bg-amber-500/20 px-2 py-0.5 text-[11px] text-amber-200";
    case "avoid":
      return "inline-flex items-center rounded-full bg-rose-500/20 px-2 py-0.5 text-[11px] text-rose-200";
    default:
      return "inline-flex items-center rounded-full bg-slate-700/40 px-2 py-0.5 text-[11px] text-slate-200";
  }
}

function badgeToneClass(tone: "positive" | "info" | "warning") {
  switch (tone) {
    case "positive":
      return "rounded-full bg-emerald-500/20 px-3 py-1 text-[11px] text-emerald-200 border border-emerald-500/40";
    case "warning":
      return "rounded-full bg-rose-500/20 px-3 py-1 text-[11px] text-rose-200 border border-rose-500/40";
    default:
      return "rounded-full bg-slate-600/20 px-3 py-1 text-[11px] text-slate-100 border border-slate-500/40";
  }
}

function synergyToneClass(tone: "positive" | "info" | "warning") {
  switch (tone) {
    case "positive":
      return "rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-3";
    case "warning":
      return "rounded-lg border border-rose-500/40 bg-rose-500/10 p-3";
    default:
      return "rounded-lg border border-slate-600/40 bg-slate-600/10 p-3";
  }
}
