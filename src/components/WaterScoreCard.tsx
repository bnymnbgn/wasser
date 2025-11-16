'use client';

import type { ScanResult, WaterAnalysisValues } from "@/src/domain/types";
import type { ProfileFit } from "@/src/domain/waterInsights";
import { CircularProgress } from "@/src/components/ui/CircularProgress";
import { Droplet, AlertCircle, CheckCircle, Info, ChevronDown, ChevronUp } from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

function scoreToColor(score: number | undefined): "success" | "warning" | "error" {
  if (score == null) return "error";
  if (score >= 80) return "success";
  if (score >= 50) return "warning";
  return "error";
}

function scoreLabel(score: number | undefined) {
  if (score == null) return "unbekannt";
  if (score >= 80) return "Sehr gut";
  if (score >= 50) return "Okay";
  return "Kritisch";
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

const GLOSSARY_ENTRIES = [
  {
    term: "Hydrogencarbonat",
    description: "Mineral, das als natürlicher Säurepuffer wirkt und Magen sowie Regeneration unterstützt.",
  },
  {
    term: "Sulfat",
    description: "Anion, das in höherer Konzentration verdauungsfördernd wirken kann.",
  },
  {
    term: "Natrium",
    description: "Elektrolyt, wichtig für Flüssigkeitshaushalt – bei Hypertonie sind niedrige Werte erwünscht.",
  },
  {
    term: "Magnesium",
    description: "Mineral für Muskel- und Nervenfunktion; hohe Werte unterstützen Regeneration.",
  },
  {
    term: "Calcium",
    description: "Zentrales Mineral für Knochen und Stoffwechsel, trägt auch zum Geschmack bei.",
  },
] as const;

const GLOSSARY_MAP = GLOSSARY_ENTRIES.reduce<Record<string, (typeof GLOSSARY_ENTRIES)[number]>>(
  (acc, entry) => {
    acc[entry.term.toLowerCase()] = entry;
    return acc;
  },
  {}
);

const glossaryRegex = new RegExp(
  `\\b(${GLOSSARY_ENTRIES.map((entry) => entry.term).join("|")})\\b`,
  "gi"
);

export function WaterScoreCard({ scanResult }: Props) {
  const [showDetails, setShowDetails] = useState(false);
  const {
    score,
    metricScores,
    metricDetails,
    insights,
    ocrParsedValues,
    profile,
    warnings,
    userOverrides,
    productInfo,
    barcode,
  } = scanResult;
  const mergedValues: Partial<WaterAnalysisValues> = {
    ...(ocrParsedValues ?? {}),
    ...(userOverrides ?? {}),
  };
  const activeProfileFit: ProfileFit | undefined = insights?.profileFit?.[profile];

  const scoreColor = scoreToColor(score);

  return (
    <div className="space-y-6">
      {/* Hero Score Section */}
      <div className="flex flex-col items-center py-6 bg-gradient-to-b from-slate-50 to-white dark:from-slate-900/50 dark:to-slate-950 rounded-[32px] border border-slate-200/60 dark:border-slate-700/60">
        <CircularProgress
          value={score ?? 0}
          size={180}
          strokeWidth={12}
          color={scoreColor}
          showValue={true}
          className="mb-6"
        />

        <div className="text-center space-y-2">
          <div className={`badge ${
            scoreColor === "success" ? "badge-success" :
            scoreColor === "warning" ? "badge-warning" :
            "badge-error"
          }`}>
            {scoreLabel(score)}
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Profil: <span className="font-medium">{profile}</span>
          </p>
        </div>
      </div>

      {/* Product Info */}
      {(productInfo || barcode) && (
        <div className="modern-card p-4 space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Droplet className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Produkt</h3>
          </div>
          {productInfo && (
            <>
              <p className="font-medium text-slate-900 dark:text-slate-100">
                {productInfo.brand ?? "Unbekannte Marke"}
                {productInfo.productName ? ` · ${productInfo.productName}` : ""}
              </p>
              {productInfo.origin && (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Herkunft: {productInfo.origin}
                </p>
              )}
            </>
          )}
          {barcode && (
            <p className="text-xs font-mono text-slate-500 dark:text-slate-500">
              {barcode}
            </p>
          )}
        </div>
      )}

      {/* Profile Fit */}
      {activeProfileFit && (
        <div className={`modern-card p-4 border-2 ${
          activeProfileFit.status === "ideal" ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30" :
          activeProfileFit.status === "ok" ? "border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30" :
          "border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/30"
        }`}>
          <div className="flex items-start gap-3">
            {activeProfileFit.status === "ideal" ? (
              <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            ) : activeProfileFit.status === "avoid" ? (
              <AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0" />
            ) : (
              <Info className="w-6 h-6 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            )}
            <div className="flex-1">
              <p className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                {activeProfileFit.status === "ideal" ? "Ideal" : activeProfileFit.status === "ok" ? "Geeignet" : "Nicht empfohlen"} für {profile}
              </p>
              {activeProfileFit.reasons.length > 0 && (
                <ul className="space-y-1 text-sm text-slate-700 dark:text-slate-300">
                  {activeProfileFit.reasons.map((reason, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-slate-400 dark:text-slate-600">•</span>
                      <span>{reason}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Metric Chips - Horizontal Scroll */}
      <div className="space-y-3">
        <h3 className="font-semibold text-slate-900 dark:text-slate-100 px-1">
          Mineralwerte
        </h3>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory hide-scrollbar">
          {Object.keys(METRIC_LABELS).map((key) => {
            const metric = key as keyof WaterAnalysisValues;
            const value = mergedValues[metric];
            if (value == null) return null;
            const unit = metric === "ph" ? "" : " mg/L";
            const metricScore = metricScores?.[metric];
            const chipColor = metricScore !== undefined && metricScore >= 80 ? "emerald" :
                             metricScore !== undefined && metricScore >= 50 ? "amber" : "red";

            return (
              <div
                key={key}
                className="snap-start flex-shrink-0 modern-card p-3 min-w-[140px] border-l-4"
                style={{
                  borderLeftColor: `var(--${chipColor})`,
                }}
              >
                <p className="text-xs text-slate-600 dark:text-slate-400 mb-1">
                  {METRIC_LABELS[metric]}
                </p>
                <p className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {value.toLocaleString(undefined, { maximumFractionDigits: 2 })}{unit}
                </p>
                {metricScore !== undefined && (
                  <p className={`text-xs font-medium ${
                    chipColor === "emerald" ? "text-emerald-600 dark:text-emerald-400" :
                    chipColor === "amber" ? "text-amber-600 dark:text-amber-400" :
                    "text-red-600 dark:text-red-400"
                  }`}>
                    Score: {metricScore.toFixed(0)}/100
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Badges */}
      {insights?.badges && insights.badges.length > 0 && (
        <div className="modern-card p-4 space-y-3">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Kennzeichnungen
          </h3>
          <div className="space-y-3">
            {insights.badges.map((badge) => (
              <div
                key={badge.id}
                className={`p-3 rounded-2xl border ${
                  badge.tone === "positive" ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200/50 dark:border-emerald-800/50" :
                  badge.tone === "warning" ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200/50 dark:border-amber-800/50" :
                  "bg-blue-50 dark:bg-blue-950/30 border-blue-200/50 dark:border-blue-800/50"
                }`}
              >
                <div className="flex items-start gap-2 mb-2">
                  <span
                    className={`flex-shrink-0 px-2 py-1 rounded-md text-xs font-semibold ${
                      badge.tone === "positive" ? "bg-emerald-200 dark:bg-emerald-800 text-emerald-900 dark:text-emerald-100" :
                      badge.tone === "warning" ? "bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100" :
                      "bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100"
                    }`}
                  >
                    {badge.label}
                  </span>
                </div>
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  <GlossaryText text={badge.description} />
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Synergies */}
      {insights?.synergies && insights.synergies.length > 0 && (
        <div className="modern-card p-4 space-y-3">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Gesundheitliche Hinweise
          </h3>
          <div className="space-y-2">
            {insights.synergies.map((item) => (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border ${
                  item.tone === "positive" ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200/50 dark:border-emerald-800/50" :
                  item.tone === "warning" ? "bg-amber-50 dark:bg-amber-950/30 border-amber-200/50 dark:border-amber-800/50" :
                  "bg-blue-50 dark:bg-blue-950/30 border-blue-200/50 dark:border-blue-800/50"
                }`}
              >
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {item.title}
                </p>
                <p className="text-sm text-slate-700 dark:text-slate-300 mt-1">
                  <GlossaryText text={item.description} />
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Warnings */}
      {warnings && warnings.length > 0 && (
        <div className="modern-card p-4 border-2 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                Warnungen
              </h3>
              <ul className="space-y-1 text-sm text-amber-800 dark:text-amber-200">
                {warnings.map((warning, idx) => (
                  <li key={idx}>{warning}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Expandable Scoring Details */}
      {metricDetails && metricDetails.length > 0 && (
        <div className="modern-card overflow-hidden">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="w-full p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors"
          >
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Bewertungs-Details
            </h3>
            {showDetails ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {showDetails && (
            <div className="px-4 pb-4 space-y-3 border-t border-slate-200 dark:border-slate-700 pt-4">
              {metricDetails
                .filter((m) => m.score !== 50)
                .map((metric) => (
                  <div key={metric.metric} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-slate-900 dark:text-slate-100 capitalize">
                        {metric.metric}
                      </span>
                      <span className="text-sm font-mono text-slate-600 dark:text-slate-400">
                        {metric.score.toFixed(0)}/100
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                      {metric.explanation}
                    </p>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function GlossaryText({ text }: { text: string }) {
  const nodes = useMemo(() => {
    const parts: ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    const regex = new RegExp(glossaryRegex);

    while ((match = regex.exec(text)) !== null) {
      const [matched] = match;
      const start = match.index;
      if (start > lastIndex) {
        parts.push(text.slice(lastIndex, start));
      }
      parts.push(
        <GlossaryHint key={`${matched}-${start}`} display={matched} />
      );
      lastIndex = start + matched.length;
    }

    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }

    return parts.length ? parts : [text];
  }, [text]);

  return <>{nodes}</>;
}

function GlossaryHint({ display }: { display: string }) {
  const [open, setOpen] = useState(false);
  const normalized = display.toLowerCase();
  const entry = GLOSSARY_MAP[normalized];

  if (!entry) {
    return display;
  }

  return (
    <span className="relative inline-flex items-center">
      <button
        type="button"
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-300 underline decoration-dotted decoration-2"
      >
        {display}
        <Info className="w-3.5 h-3.5" />
      </button>
      {open && (
        <span className="absolute left-0 top-full mt-2 w-64 rounded-2xl bg-slate-900 text-white text-xs shadow-2xl p-3 z-20">
          <p className="font-semibold text-sm mb-1">{entry.term}</p>
          <p className="text-slate-100/80">{entry.description}</p>
        </span>
      )}
    </span>
  );
}
