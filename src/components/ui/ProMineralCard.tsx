import { useState } from "react";
import { Info, Check, AlertTriangle } from "lucide-react";

interface TargetRange {
  min: number;
  max: number;
  optimalMin: number;
  optimalMax: number;
}

interface ProMineralCardProps {
  metric: string;
  label: string;
  unit?: string;
  value: number;
  score?: number;
  targets?: TargetRange;
  symbol?: string;
}

const CHEMICAL_SYMBOLS: Record<string, string> = {
  calcium: "Ca²⁺",
  magnesium: "Mg²⁺",
  sodium: "Na⁺",
  potassium: "K⁺",
  bicarbonate: "HCO₃⁻",
  sulfate: "SO₄²⁻",
  chloride: "Cl⁻",
  nitrate: "NO₃⁻",
};

export function ProMineralCard({
  metric,
  label,
  unit = "",
  value,
  score,
  targets,
  symbol,
}: ProMineralCardProps) {
  const [hover, setHover] = useState(false);
  const displayUnit = unit.trim();
  const displaySymbol = symbol ?? CHEMICAL_SYMBOLS[metric] ?? "";

  const displayMin = 0;
  const displayMax =
    targets?.max != null ? Math.max(targets.max * 1.5, targets.optimalMax * 1.2) : Math.max(value * 1.5, 1);

  const getPercent = (val: number) => {
    const p = ((val - displayMin) / (displayMax - displayMin)) * 100;
    return Math.min(100, Math.max(0, p));
  };

  const posValue = getPercent(value);
  const posOptStart = targets ? getPercent(targets.optimalMin) : 40;
  const posOptEnd = targets ? getPercent(targets.optimalMax) : 60;
  const widthOpt = Math.max(4, posOptEnd - posOptStart);

  const isOptimal = targets ? value >= targets.optimalMin && value <= targets.optimalMax : score != null && score >= 80;
  const isWarning = targets ? value > targets.max : score != null && score < 50;

  const statusTone =
    score != null
      ? score >= 80
        ? "success"
        : score >= 50
        ? "warning"
        : "error"
      : isOptimal
      ? "success"
      : isWarning
      ? "error"
      : "warning";

  const statusBadge =
    statusTone === "success"
      ? { icon: <Check className="w-3 h-3" />, text: "Ideal", className: "text-ocean-success bg-ocean-success/10" }
      : statusTone === "warning"
      ? { icon: <AlertTriangle className="w-3 h-3" />, text: "Okay", className: "text-ocean-warning bg-ocean-warning/10" }
      : { icon: <AlertTriangle className="w-3 h-3" />, text: "Abweichung", className: "text-ocean-error bg-ocean-error/10" };

  return (
    <div
      className="rounded-2xl border border-ocean-border/60 bg-ocean-surface p-3 transition-all hover:border-ocean-border hover:ocean-card-elevated"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold tracking-[0.08em] text-ocean-secondary">
              {label}
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold tabular-nums text-ocean-primary leading-tight">
              {value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </span>
            {displayUnit && <span className="text-[11px] text-ocean-tertiary">{displayUnit}</span>}
          </div>
        </div>
        {targets && (
          <div className="flex items-center gap-1 text-[11px] text-ocean-tertiary">
            <Info className="w-3 h-3" />
            Ziel: {targets.optimalMin}–{targets.optimalMax} {displayUnit}
          </div>
        )}

        <div className="relative h-9 w-full select-none">
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-2 rounded-full bg-ocean-border/70 overflow-hidden">
            <div
              className="absolute top-0 bottom-0 bg-ocean-success/20 border-l border-r border-ocean-success/30"
              style={{ left: `${posOptStart}%`, width: `${widthOpt}%` }}
            />
          </div>

          <div
            className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-400 ease-out"
            style={{ left: `${posValue}%`, transform: "translate(-50%, -50%)" }}
          >
            <div
              className={`h-4 w-4 rounded-full border-2 border-ocean-surface ${
                statusTone === "success"
                  ? "bg-ocean-success"
                  : statusTone === "warning"
                  ? "bg-ocean-warning"
                  : "bg-ocean-error"
              }`}
            />
          </div>

          <div className="absolute top-full left-0 mt-1 text-[9px] text-ocean-tertiary font-medium">0</div>
          <div className="absolute top-full right-0 mt-1 text-[9px] text-ocean-tertiary font-medium">
            {Math.round(displayMax)}+
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${statusBadge.className}`}>
            {statusBadge.icon}
            {statusBadge.text}
          </div>
          {score != null && (
            <span className="text-[10px] text-ocean-secondary font-mono">Score {score.toFixed(0)}</span>
          )}
          <span className="ml-auto text-[10px] text-ocean-tertiary">
            {displaySymbol}
          </span>
        </div>
      </div>
    </div>
  );
}
