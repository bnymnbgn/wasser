"use client";

import { motion } from "framer-motion";
import { Columns } from "lucide-react";
import { WaterScoreCircle } from "@/src/components/ui/WaterScoreCircle";

interface ScoreSectionProps {
  score: number | undefined;
  profile: string;
  scoreLabel: (score: number | undefined) => string;
  scoreColor: "success" | "warning" | "error";
  isInComparison: boolean;
  onToggleComparison: () => void;
}

export function ScoreSection({
  score,
  profile,
  scoreLabel,
  scoreColor,
  isInComparison,
  onToggleComparison,
}: ScoreSectionProps) {
  return (
    <div className="py-6 flex flex-col items-center gap-4 border-b border-slate-100 dark:border-slate-800">
      <WaterScoreCircle
        value={score ?? 0}
        size={180}
        strokeWidth={12}
        showValue={true}
        className="z-10"
        delay={0.3}
      />

      <div className="text-center z-10 space-y-2 w-full">
        <div
          className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold ${scoreColor === "success"
              ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
              : scoreColor === "warning"
                ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"
                : "bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400"
            }`}
        >
          {scoreLabel(score)}
        </div>
        <p className="text-sm text-ocean-secondary">
          Profil: <span className="font-semibold text-ocean-primary">{profile}</span>
        </p>
        <button
          type="button"
          onClick={onToggleComparison}
          className={`inline-flex items-center gap-1.5 text-sm transition-colors ${isInComparison
              ? "text-emerald-600 dark:text-emerald-400 font-medium"
              : "text-sky-600 dark:text-sky-400"
            }`}
        >
          <Columns className="w-4 h-4" />
          {isInComparison ? "Im Vergleich ✓" : "Zum Vergleich"}
        </button>
      </div>
    </div>
  );
}
