"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, CheckCircle2, AlertCircle, Info } from "lucide-react";

export interface ImpactFactor {
  label: string;
  impact: "positive" | "negative" | "neutral";
  value?: string;
}

interface ScoreExplanationProps {
  score: number | undefined;
  textSummary: string;
  factors: ImpactFactor[];
}

export function ScoreExplanation({ score = 0, textSummary, factors }: ScoreExplanationProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const pros = factors.filter((f) => f.impact === "positive");
  const cons = factors.filter((f) => f.impact === "negative");

  const verdict =
    score >= 80 ? "Exzellente Wahl" : score >= 50 ? "Solider Durchschnitt" : "Weniger geeignet";
  const verdictIcon = score >= 80 ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />;
  const verdictStyles =
    score >= 80
      ? {
          container: "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800",
          text: "text-green-800 dark:text-green-300",
        }
      : score >= 50
      ? {
          container: "bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800",
          text: "text-yellow-800 dark:text-yellow-300",
        }
      : {
          container: "bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800",
          text: "text-red-800 dark:text-red-300",
        };

  const shortSummary = textSummary ? `${textSummary.split(".")[0]}.` : "";

  return (
    <div className="space-y-4">
      <div className={`rounded-2xl border p-4 ${verdictStyles.container}`}>
        <h3 className={`mb-1 flex items-center gap-2 text-lg font-bold ${verdictStyles.text}`}>
          {verdictIcon}
          {verdict}
        </h3>
        <p className="text-sm text-slate-700/80 dark:text-slate-200/80">{shortSummary}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {pros.length > 0 && (
          <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-green-600 flex items-center gap-1">
              <span className="rounded px-1 py-0.5 bg-green-100">▲ Stärken</span>
            </h4>
            <ul className="space-y-2">
              {pros.map((factor, idx) => (
                <li key={`${factor.label}-${idx}`} className="flex items-start justify-between text-sm text-slate-700 dark:text-slate-200">
                  <span>{factor.label}</span>
                  {factor.value && (
                    <span className="rounded bg-green-50 px-1.5 py-0.5 font-mono text-xs font-bold text-green-700 dark:bg-green-900/30 dark:text-green-300">
                      {factor.value}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        {cons.length > 0 && (
          <div className="rounded-xl border border-slate-100 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900/80">
            <h4 className="mb-2 text-xs font-bold uppercase tracking-wider text-red-500 flex items-center gap-1">
              <span className="rounded px-1 py-0.5 bg-red-100">▼ Schwächen</span>
            </h4>
            <ul className="space-y-2">
              {cons.map((factor, idx) => (
                <li key={`${factor.label}-${idx}`} className="flex items-start justify-between text-sm text-slate-700 dark:text-slate-200">
                  <span>{factor.label}</span>
                  {factor.value && (
                    <span className="rounded bg-red-50 px-1.5 py-0.5 font-mono text-xs font-bold text-red-600 dark:bg-red-900/30 dark:text-red-300">
                      {factor.value}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={() => setIsExpanded((prev) => !prev)}
          className="flex w-full items-center justify-center gap-2 py-2 text-xs font-medium text-slate-500 transition-colors hover:text-blue-600"
        >
          <Info className="w-4 h-4" />
          {isExpanded ? "Details ausblenden" : "Detaillierte Analyse lesen"}
          <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
        </button>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-2 rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 dark:border-slate-800 dark:bg-slate-900/50 dark:text-slate-300">
                {textSummary}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

