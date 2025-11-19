import React from "react";

interface VisualMetricBarProps {
  value: number | undefined | null;
  min?: number;
  max: number;
  idealMin: number;
  idealMax: number;
  unit?: string;
  label: string;
}

export function VisualMetricBar({
  value,
  min = 0,
  max,
  idealMin,
  idealMax,
  unit = "",
  label,
}: VisualMetricBarProps) {
  if (value == null || Number.isNaN(value)) {
    return null;
  }

  const safeMax = Math.max(max, value * 1.2, idealMax * 1.1);
  const range = safeMax - min || 1;

  const getPercent = (val: number) => Math.min(100, Math.max(0, ((val - min) / range) * 100));

  const idealStart = getPercent(idealMin);
  const idealWidth = Math.max(0, getPercent(idealMax) - idealStart);
  const currentPos = getPercent(value);

  const isIdeal = value >= idealMin && value <= idealMax;
  const indicatorColor = isIdeal ? "bg-emerald-500 dark:bg-emerald-400" : "bg-blue-500 dark:bg-blue-400";

  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs mb-1 text-slate-500 dark:text-slate-400">
        <span>{label}</span>
        <span className="font-mono tabular-nums font-semibold text-slate-900 dark:text-slate-100">
          {value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          {unit && <span className="text-[10px] ml-1 font-normal">{unit}</span>}
        </span>
      </div>

      <div className="relative h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        <div
          className="absolute top-0 h-full bg-emerald-500/30 dark:bg-emerald-400/20"
          style={{ left: `${idealStart}%`, width: `${idealWidth}%` }}
        />
        <div
          className={`absolute top-0 h-full ${indicatorColor} transition-all duration-500 ease-out rounded-full`}
          style={{ width: `${currentPos}%` }}
        />
      </div>

      <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-1">
        <span>{min.toFixed(0)}</span>
        <span className="text-emerald-600 dark:text-emerald-400 font-medium">
          Ziel {idealMin}-{idealMax}
        </span>
        <span>{safeMax.toFixed(0)}</span>
      </div>
    </div>
  );
}

