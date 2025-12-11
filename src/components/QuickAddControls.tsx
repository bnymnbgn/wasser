"use client";

import React from "react";
import { Plus, X, Droplet } from "lucide-react";
import clsx from "clsx";
import type { ScanResult } from "@/src/lib/sqlite";

interface DashboardControlsProps {
  onAdd: (volume: number) => void;
  onCustom: () => void;
  recentScans: ScanResult[];
  selectedScan: ScanResult | null;
  onSelectScan: (scan: ScanResult | null) => void;
}

export function QuickAddControls({
  onAdd,
  onCustom,
  recentScans,
  selectedScan,
  onSelectScan,
}: DashboardControlsProps) {
  const primaryGradient = "bg-gradient-to-r from-ocean-primary to-ocean-accent text-white";
  const selectedLabel =
    selectedScan
      ? ((selectedScan as any).productInfo?.brand ??
        (selectedScan as any).waterBrand ??
        selectedScan.barcode ??
        "Scan")
      : null;
  return (
    <div className="w-full flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-700 pb-6 px-4 sm:px-0">
      {/* Mengen hinzufügen */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-baseline px-1">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Menge hinzufügen</span>
          {selectedScan && (
            <span className="text-[10px] text-blue-200 font-medium animate-pulse">
              {selectedLabel || "Scan"} aktiv
            </span>
          )}
        </div>

        <div className="flex gap-3 overflow-x-auto pb-4 -mx-6 px-6 sm:mx-0 sm:px-0 scrollbar-hide snap-x mask-linear-fade">
          {[250, 500, 750, 1000].map((ml) => (
            <button
              key={ml}
              onClick={() => onAdd(ml)}
              className={clsx(
                "snap-start flex-shrink-0 w-20 h-24 flex flex-col items-center justify-center rounded-2xl border border-ocean-primary/30 active:scale-90 transition-all relative overflow-hidden",
                primaryGradient
              )}
            >
              <span className="text-xl font-bold text-white z-10 relative">{ml}</span>
              <span className="text-[10px] text-white/80 z-10 relative">ml</span>

              <div className="absolute -bottom-2 -right-2 text-white/10 group-hover:text-white/20 transition-colors">
                <Droplet size={40} strokeWidth={3} />
              </div>

              <div className="mt-2 w-7 h-7 rounded-full bg-white/15 flex items-center justify-center text-white z-10 relative">
                <Plus size={12} strokeWidth={3} />
              </div>
            </button>
          ))}

          <button
            onClick={onCustom}
            className="snap-start flex-shrink-0 w-20 h-24 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 active:scale-95 transition-all hover:border-white/20 hover:bg-white/5 text-slate-500 hover:text-slate-300"
          >
            <span className="text-xs font-medium">Eigene</span>
            <span className="text-[10px] opacity-60">Menge</span>
          </button>
        </div>
      </div>

      {/* Quelle / Wasser */}
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center px-1">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Quelle / Wasser</span>
          {selectedScan && (
            <button
              onClick={() => onSelectScan(null)}
              className="flex items-center gap-1 text-[10px] text-red-300 hover:text-red-200 px-2 py-1 rounded-full bg-red-500/10 hover:bg-red-500/20 transition-colors"
            >
              <X size={10} />
              <span>Reset</span>
            </button>
          )}
        </div>

        <div className="flex gap-3 overflow-x-auto pb-2 -mx-6 px-6 sm:mx-0 sm:px-0 scrollbar-hide snap-x">
          <button
            onClick={() => onSelectScan(null)}
            className={clsx(
              "snap-start flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all",
              !selectedScan
                ? clsx(primaryGradient, "border-ocean-primary/40")
                : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
            )}
          >
            <div className={clsx("w-3 h-3 rounded-full shadow-sm", !selectedScan ? "bg-white" : "bg-slate-600")} />
            <span className={clsx("text-xs font-bold", !selectedScan ? "text-white" : "text-slate-400")}>Standard</span>
          </button>

          {recentScans &&
            recentScans.map((scan) => {
              const isActive = selectedScan?.id === scan.id;
              return (
                <button
                  key={scan.id}
                  onClick={() => onSelectScan(isActive ? null : (scan as ScanResult))}
                  className={clsx(
                    "snap-start flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all max-w-[220px]",
                    isActive
                      ? clsx(primaryGradient, "border-ocean-primary/40 text-white")
                      : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10"
                  )}
                >
                  <div className={clsx("w-3 h-3 rounded-full shrink-0 shadow-sm", isActive ? "bg-white" : "bg-blue-400")} />
                  <div className="flex flex-col items-start min-w-0 text-left">
                    <span className="text-xs font-bold truncate w-full block">
                      {(scan as any).productInfo?.brand ?? (scan as any).waterBrand ?? scan.barcode ?? "Unbekannt"}
                    </span>
                    <span className={clsx("text-[10px] truncate w-full block", isActive ? "text-blue-200" : "text-slate-500")}>
                      {(scan as any).productInfo?.productName ?? "Wasser"}
                    </span>
                  </div>
                </button>
              );
            })}
        </div>
      </div>
    </div>
  );
}
