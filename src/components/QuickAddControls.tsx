"use client";

import React, { useState, useRef, useEffect } from "react";
import { Plus, X, Droplet, Minus } from "lucide-react";
import clsx from "clsx";
import type { ScanResult } from "@/src/lib/sqlite";
import Button from "@mui/material/Button";
import { hapticLight, hapticMedium } from "@/lib/capacitor";

interface DashboardControlsProps {
  onAdd: (volume: number) => void;
  onCustom: () => void;
  recentScans: ScanResult[];
  selectedScan: ScanResult | null;
  onSelectScan: (scan: ScanResult | null) => void;
}

const QUICK_VALUES = [250, 500, 750, 1000];

export function QuickAddControls({
  onAdd,
  onCustom,
  recentScans,
  selectedScan,
  onSelectScan,
}: DashboardControlsProps) {
  const [volume, setVolume] = useState(250);
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const primaryGradient = "bg-gradient-to-r from-ocean-primary to-ocean-accent text-white";

  const selectedLabel =
    selectedScan
      ? ((selectedScan as any).productInfo?.brand ??
        (selectedScan as any).waterBrand ??
        selectedScan.barcode ??
        "Scan")
      : null;

  const handleQuickSelect = (value: number) => {
    setVolume(value);
    hapticLight();
  };

  const handleAdd = () => {
    onAdd(volume);
    hapticMedium();
  };

  const adjustValue = (delta: number) => {
    const newValue = Math.max(50, Math.min(9999, volume + delta));
    setVolume(newValue);
    hapticLight();
  };

  const startEditing = () => {
    setEditValue(String(volume));
    setIsEditing(true);
    hapticLight();
  };

  const finishEditing = () => {
    const parsed = parseInt(editValue);
    if (!isNaN(parsed) && parsed > 0) {
      setVolume(Math.max(1, Math.min(9999, parsed)));
    }
    setIsEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      finishEditing();
    } else if (e.key === "Escape") {
      setIsEditing(false);
    }
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  return (
    <div className="w-full flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-700 pb-6 px-4 sm:px-0">
      {/* Volume Stepper Section */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-baseline px-1">
          <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Menge hinzufügen</span>
          {selectedScan && (
            <span className="text-[10px] text-blue-200 font-medium animate-pulse">
              {selectedLabel || "Scan"} aktiv
            </span>
          )}
        </div>

        {/* Current Value Display with Stepper */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => adjustValue(-50)}
            className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white active:scale-90 transition-all"
          >
            <Minus size={24} />
          </button>

          {/* Editable Volume Display */}
          <div
            className="flex flex-col items-center min-w-[120px] cursor-pointer"
            onClick={!isEditing ? startEditing : undefined}
          >
            {isEditing ? (
              <input
                ref={inputRef}
                type="number"
                inputMode="numeric"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value.replace(/[^0-9]/g, ""))}
                onBlur={finishEditing}
                onKeyDown={handleEditKeyDown}
                className="w-32 text-5xl font-black text-white text-center bg-transparent border-b-2 border-ocean-primary outline-none tabular-nums"
                maxLength={4}
              />
            ) : (
              <span className="text-5xl font-black text-white tabular-nums transition-all duration-200 hover:text-ocean-accent">
                {volume}
              </span>
            )}
            <span className="text-sm text-slate-500 font-medium mt-1">
              {isEditing ? "tippe Enter" : "ml · tippen zum ändern"}
            </span>
          </div>

          <button
            onClick={() => adjustValue(50)}
            className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white active:scale-90 transition-all"
          >
            <Plus size={24} />
          </button>
        </div>

        {/* Quick Select Chips */}
        <div className="flex justify-center gap-2 flex-wrap">
          {QUICK_VALUES.map((value) => (
            <button
              key={value}
              onClick={() => handleQuickSelect(value)}
              className={clsx(
                "px-4 py-2 rounded-full text-sm font-semibold transition-all active:scale-95",
                volume === value
                  ? "bg-ocean-primary text-white shadow-lg shadow-ocean-primary/30"
                  : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
              )}
            >
              {value}ml
            </button>
          ))}
        </div>

        {/* Add Button */}
        <Button
          variant="contained"
          onClick={handleAdd}
          startIcon={<Droplet size={20} />}
          sx={{
            py: 2,
            borderRadius: 3,
            background: 'linear-gradient(90deg, #0EA5E9 0%, #38BDF8 100%)',
            color: '#FFFFFF',
            fontWeight: 700,
            fontSize: '1rem',
            textTransform: 'none',
            boxShadow: '0 8px 24px rgba(14, 165, 233, 0.3)',
            transition: 'transform 0.1s ease, box-shadow 0.1s ease',
            '&:active': {
              transform: 'scale(0.97)',
              boxShadow: '0 4px 12px rgba(14, 165, 233, 0.4)',
            },
            '& .MuiButton-startIcon': {
              color: '#FFFFFF',
            },
          }}
        >
          {volume}ml hinzufügen
        </Button>
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
