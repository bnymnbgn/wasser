import React from "react";

interface ProfileWeightChartProps {
  items: Array<{
    metric: string;
    label: string;
    weight: number;
    tone?: "critical" | "positive" | "avoid";
  }>;
}

export function ProfileWeightChart({ items }: ProfileWeightChartProps) {
  return (
    <div className="space-y-3">
      {items.map((item) => {
        const width = Math.min(100, Math.max(0, item.weight * 100));
        const color =
          item.tone === "critical"
            ? "bg-rose-500"
            : item.tone === "avoid"
            ? "bg-amber-500"
            : "bg-blue-500";

        const toneLabel =
          item.tone === "critical" ? "Kritisch" : item.tone === "avoid" ? "Beobachten" : "FoKus";

        return (
          <div key={item.metric} className="flex items-center gap-3">
            <span className="w-28 text-xs font-medium text-slate-500 dark:text-slate-400">{item.label}</span>
            <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800">
              <div className={`h-full rounded-full ${color}`} style={{ width: `${width}%` }} />
            </div>
            <span className="text-[11px] font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              {toneLabel}
            </span>
          </div>
        );
      })}
    </div>
  );
}

