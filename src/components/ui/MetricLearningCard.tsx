import React, { useState } from "react";
import { Droplet, BookOpen } from "lucide-react";

interface MetricLearningCardProps {
  metric: {
    metric: string;
    label: string;
    importance: string;
    explanation: string;
    hints?: string[];
  };
}

const IMPORTANCE_MAP: Record<string, { label: string; color: string }> = {
  kritisch: { label: "Kritisch", color: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300" },
  "sehr hoch": { label: "Sehr wichtig", color: "bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300" },
  hoch: { label: "Hoch", color: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-300" },
  mittel: { label: "Mittel", color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300" },
  niedrig: { label: "Optional", color: "bg-slate-100 text-slate-600 dark:bg-slate-800/50 dark:text-slate-300" },
};

export function MetricLearningCard({ metric }: MetricLearningCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const badge = IMPORTANCE_MAP[metric.importance] ?? IMPORTANCE_MAP.mittel;

  return (
    <div
      onClick={() => setIsOpen((prev) => !prev)}
      className="group relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm transition-all active:scale-[0.99] dark:border-slate-800 dark:bg-slate-900/70"
    >
      <div className="p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              isOpen ? "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-200" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-300"
            }`}
          >
            <Droplet className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{metric.label}</p>
            <p className="text-xs font-mono text-slate-500 uppercase">{metric.metric}</p>
          </div>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full ${badge.color}`}>
          {badge.label}
        </span>
      </div>

      <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden border-t border-slate-100 dark:border-slate-800">
          <div className="p-4 text-sm text-slate-600 dark:text-slate-300 bg-slate-50/60 dark:bg-slate-900/40 space-y-3">
            <p>{metric.explanation}</p>
            {metric.hints?.length ? (
              <div className="flex items-center gap-2 text-[11px] text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-full border border-blue-100 dark:border-blue-800 w-fit">
                <BookOpen className="w-3 h-3" />
                <span>Hinweis: {metric.hints[0]}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
