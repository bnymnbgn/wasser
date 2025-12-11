"use client";

import { Info, AlertTriangle, ArrowRight, PlusCircle } from "lucide-react";
import { ProMineralCard } from "@/src/components/ui/ProMineralCard";
import { MineralTooltip } from "@/src/components/WaterScoreCard/MineralTooltip";
import type { ProfileType, WaterAnalysisValues } from "@/src/domain/types";

interface MineralGridProps {
  mergedValues: Partial<WaterAnalysisValues>;
  metricScores?: Record<string, number>;
  profile: ProfileType;
  isLowData: boolean;
  validDataCount: number;
  onMissingDataClick: () => void;
  mineralInfo: any;
  profileTargets: any;
  statusClasses: (score: number | undefined) => string;
  labels: Record<string, string>;
  fields: Array<{ key: keyof WaterAnalysisValues; label: string; unit?: string }>;
  onSelect: (data: { key: string; info?: any; value?: number; unit?: string; score?: number }) => void;
}

export function MineralGrid({
  mergedValues,
  metricScores,
  profile,
  isLowData,
  validDataCount,
  onMissingDataClick,
  mineralInfo,
  profileTargets,
  statusClasses,
  labels,
  fields,
  onSelect,
}: MineralGridProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((field) => {
          const metric = field.key;
          const value = mergedValues[metric];
          if (value == null) {
            if (metric === "ph") {
              return (
                <div
                  key={field.key}
                  className="p-3 rounded-2xl border bg-ocean-surface border-ocean-border backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-xs font-medium text-ocean-secondary">
                      {labels[metric]}
                    </p>
                    <span className="text-[10px] px-2 py-1 rounded-full font-semibold bg-white/10 text-ocean-tertiary">
                      –
                    </span>
                  </div>
                  <p className="text-lg font-bold text-ocean-tertiary">–</p>
                </div>
              );
            }
            return null;
          }
          const unit = field.unit ?? (metric === "ph" ? "" : " mg/L");
          const metricScore = metricScores?.[metric as string];
          const info = mineralInfo[metric as string];
          const targets = profileTargets[profile]?.[metric as string];

          if (targets) {
            return (
              <button
                key={field.key}
                onClick={() => onSelect({ key: metric as string, info, value, unit, score: metricScore })}
                className="text-left"
              >
                <ProMineralCard
                  metric={metric as string}
                  label={labels[metric] ?? metric}
                  value={value}
                  unit={unit}
                  score={metricScore}
                  targets={targets}
                  symbol={metric as string}
                />
              </button>
            );
          }

          const statusStyle = statusClasses(metricScore);

          return (
            <button
              key={field.key}
              onClick={() => onSelect({ key: metric as string, info, value, unit, score: metricScore })}
              className={`p-4 rounded-2xl border ${statusStyle} backdrop-blur-sm active:scale-[0.98] transition-transform text-left`}
            >
              <div className="flex items-center justify-between mb-2">
                <MineralTooltip mineral={metric as string} info={info} profile={profile}>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-ocean-secondary cursor-help">
                      {labels[metric]}
                    </p>
                    <Info className="w-4 h-4 text-ocean-tertiary" />
                  </div>
                </MineralTooltip>
                {metricScore !== undefined && (
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-white/20">
                    {metricScore.toFixed(0)}
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1.5">
                <p className="text-2xl font-bold text-ocean-primary tabular-nums">
                  {value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </p>
                {unit && <span className="text-sm text-ocean-secondary">{unit.trim()}</span>}
              </div>
            </button>
          );
        })}
      </div>
      {isLowData && (
        <div className="pt-2">
          <button
            onClick={onMissingDataClick}
            className="w-full group relative overflow-hidden rounded-2xl border border-ocean-warning/40 bg-ocean-warning/10 p-4 text-left transition-all hover:bg-ocean-warning/15 hover:border-ocean-warning/60 active:scale-[0.99]"
          >
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ocean-warning/20 text-ocean-warning group-hover:scale-110 transition-transform">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-ocean-primary">
                    Analyse ungenau
                  </h4>
                  <ArrowRight className="h-4 w-4 text-ocean-warning opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" />
                </div>
                <p className="mt-1 text-sm text-ocean-secondary leading-relaxed">
                  Es sind nur{" "}
                  <span className="text-ocean-warning font-medium">
                    {validDataCount} Werte
                  </span>{" "}
                  bekannt. Das Wasser wird dadurch schlechter bewertet (max. 60
                  Punkte).
                </p>
                <div className="mt-3 flex items-center gap-2 text-xs font-medium text-ocean-warning">
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Werte vom Etikett nachtragen</span>
                </div>
              </div>
            </div>

            <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-ocean-warning/10 blur-3xl transition-opacity opacity-0 group-hover:opacity-100 pointer-events-none" />
          </button>
        </div>
      )}
    </div>
  );
}
