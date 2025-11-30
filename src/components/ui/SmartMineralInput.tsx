'use client';

import { useState } from "react";
import { Info } from "lucide-react";

interface Props {
  label: string;
  value: string;
  onChange: (value: string) => void;
  unit?: string;
  suggestions?: number[];
  info?: string;
  warning?: string;
  error?: boolean;
}

/**
 * Smart Input für Mineralwerte:
 * - Quick-Select Buttons für typische Werte
 * - Info-Tooltip
 * - Visuelle Warnings
 * - Touch-optimiert (min-height: 48px)
 */
export function SmartMineralInput({
  label,
  value,
  onChange,
  unit = "mg/L",
  suggestions = [],
  info,
  warning,
  error = false
}: Props) {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="space-y-2">

      {/* Label + Info */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-ocean-primary">
          {label}
        </label>

        {info && (
          <button
            type="button"
            onMouseEnter={() => setShowInfo(true)}
            onMouseLeave={() => setShowInfo(false)}
            onFocus={() => setShowInfo(true)}
            onBlur={() => setShowInfo(false)}
            className="relative text-ocean-secondary hover:text-ocean-primary transition"
          >
            <Info className="w-4 h-4" />

            {showInfo && (
              <div className="absolute right-0 top-full mt-2 w-64 p-3 rounded-lg bg-ocean-panel-strong text-xs text-ocean-secondary shadow-2xl z-20 border border-ocean-border">
                {info}
              </div>
            )}
          </button>
        )}
      </div>

      {/* Input Field */}
      <div className="relative">
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`0 ${unit}`}
          className={`
            w-full px-4 py-3 rounded-xl
            bg-ocean-surface-elevated border-2
            text-lg font-medium text-ocean-primary
            placeholder:text-ocean-tertiary
            outline-none transition
            min-h-[48px]
            focus:border-ocean-accent focus:ring-2 focus:ring-ocean-accent/20
            ${error ? 'border-red-500 bg-red-500/10' : 'border-ocean-border'}
            ${warning ? 'border-amber-500' : ''}
          `}
        />

        {unit && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-ocean-tertiary pointer-events-none">
            {unit}
          </span>
        )}
      </div>

      {/* Quick-Select Buttons */}
      {suggestions.length > 0 && (
        <div className="flex gap-2">
          {suggestions.map(val => (
            <button
              key={val}
              type="button"
              onClick={() => onChange(String(val))}
              className="px-3 py-1.5 rounded-full bg-ocean-surface-elevated border border-ocean-border text-xs font-medium text-ocean-secondary hover:border-ocean-accent hover:text-ocean-accent transition min-h-[32px]"
            >
              {val}
            </button>
          ))}
        </div>
      )}

      {/* Warning Text */}
      {warning && !error && (
        <p className="text-xs text-amber-400 flex items-center gap-1">
          <Info className="w-3 h-3" />
          {warning}
        </p>
      )}

      {/* Error Text */}
      {error && (
        <p className="text-xs text-red-400">
          Ungültiger Wert
        </p>
      )}
    </div>
  );
}
