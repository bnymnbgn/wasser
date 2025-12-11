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
    <div className="ocean-panel-strong rounded-ocean-xl relative overflow-hidden p-6 flex flex-col items-center gap-4">
      <motion.div
        className="absolute top-0 z-0 opacity-20 scale-150 blur-3xl bg-ocean-primary/30 w-32 h-32 rounded-full"
      />
      <WaterScoreCircle
        value={score ?? 0}
        size={200}
        strokeWidth={14}
        showValue={true}
        className="z-10 drop-shadow-2xl"
        delay={0.7}
      />

      <div className="text-center z-10 space-y-3 w-full">
        <div
          className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold ${
            scoreColor === "success"
              ? "ocean-success-bg ocean-success"
              : scoreColor === "warning"
              ? "ocean-warning-bg ocean-warning"
              : "ocean-error-bg ocean-error"
          }`}
        >
          {scoreLabel(score)}
        </div>
        <p className="text-base text-ocean-secondary">
          Profil: <span className="font-semibold text-ocean-primary">{profile}</span>
        </p>
        <button
          type="button"
          onClick={onToggleComparison}
          className={`w-full max-w-xs inline-flex items-center justify-center gap-2.5 rounded-xl px-4 py-3.5 text-sm font-semibold transition-all active:scale-[0.98] ${
            isInComparison
              ? "ocean-success-bg ocean-success border-2 border-ocean-success/50"
              : "ocean-card text-ocean-secondary border-2 border-ocean-border hover:ocean-card-elevated"
          }`}
        >
          <Columns className="w-5 h-5" />
          {isInComparison ? "Im Vergleich ✓" : "Zum Vergleich hinzufügen"}
        </button>
      </div>
    </div>
  );
}
