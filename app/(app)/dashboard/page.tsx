"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Settings, Scan, ChevronRight } from "lucide-react";
import clsx from "clsx";
import { hapticLight, hapticMedium } from "@/lib/capacitor";
import type { ProfileType } from "@/src/domain/types";
import { useUserProfile } from "@/src/hooks/useUserProfile";
import { useDatabaseContext } from "@/src/contexts/DatabaseContext";
import { sqliteService } from "@/src/lib/sqlite"; // Direct import for fetch
import type { ScanResult } from "@/src/lib/sqlite";
import { useConsumptionContext } from "@/src/contexts/ConsumptionContext";
import { BottleVisualizer } from "@/src/components/BottleVisualizer";

export default function DashboardPage() {
  return (
    <Suspense fallback={null}>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState<ProfileType>("standard");
  const [mounted, setMounted] = useState(false);
  const { goals } = useUserProfile();
  const { consumptions, add, remove, refresh } = useConsumptionContext();
  const { isReady } = useDatabaseContext();

  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [selectedScan, setSelectedScan] = useState<any | null>(null);
  const [controlPage, setControlPage] = useState(0); // 0 = Standard, 1 = Recent

  // Custom volume modal
  const [isCustomVolumeOpen, setIsCustomVolumeOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState("");

  // Load recent scans
  useEffect(() => {
    if (!isReady) return;
    const fetchRecent = async () => {
      try {
        const history = await sqliteService.getScanHistory(20);
        // Deduplicate by brand+productName
        const unique = new Map();
        history.forEach(h => {
          if (!h.productInfo?.brand) return; // Skip empty
          const key = `${h.productInfo.brand}-${h.productInfo.productName}`;
          if (!unique.has(key)) {
            unique.set(key, h);
          }
        });
        setRecentScans(Array.from(unique.values()).slice(0, 10));
      } catch (e) {
        console.error("Failed to load recent scans", e);
      }
    };
    fetchRecent();
  }, [isReady]);

  // Handle adding consumption (logic moved from inline)
  const handleAddConsumption = async (volume: number) => {
    hapticMedium();

    // Default: "mineral" with effectively empty minerals if no scan selected
    // If selectedScan: parse its values

    let mineralValues = { calcium: 0, magnesium: 0, sodium: 0, potassium: 0 };
    let brand = null;
    let productName = null;
    let scanId = null;

    if (selectedScan) {
      brand = selectedScan.productInfo?.brand ?? null;
      productName = selectedScan.productInfo?.productName ?? null;
      scanId = selectedScan.id;

      // Try to parse values
      try {
        const parsed = JSON.parse(selectedScan.ocrParsedValues || "{}");
        mineralValues = {
          calcium: parsed.calcium || 0,
          magnesium: parsed.magnesium || 0,
          sodium: parsed.sodium || 0,
          potassium: parsed.potassium || 0
        };
      } catch (e) {
        // ignore
      }
    }

    const entry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      waterBrand: brand,
      productName: productName,
      volumeMl: volume,
      hydrationFactor: 1.0,
      type: "mineral" as const,
      ...mineralValues,
      scanId: scanId,
    };
    await add(entry);
    await refresh();
  };

  useEffect(() => {
    const urlProfile = searchParams.get("profile") as ProfileType | null;
    if (urlProfile && ["standard", "baby", "sport", "blood_pressure", "coffee", "kidney"].includes(urlProfile)) {
      setProfile(urlProfile);
      localStorage.setItem("wasserscan-profile", urlProfile);
    } else {
      const savedProfile = localStorage.getItem("wasserscan-profile") as ProfileType | null;
      if (savedProfile && ["standard", "baby", "sport", "blood_pressure", "coffee", "kidney"].includes(savedProfile)) {
        setProfile(savedProfile);
      }
    }
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, [searchParams]);



  const hydrationGoal = goals?.dailyWaterGoal ?? 2500;
  const consumed = consumptions.reduce(
    (sum, c) => sum + (c.volumeMl ?? 0) * (c.hydrationFactor ?? 1),
    0
  );
  const hydrationPct = Math.min(100, Math.round((consumed / hydrationGoal) * 100));
  const bottleFill = Math.min(100, Math.max(0, hydrationPct));

  // Nutrients from water
  const nutrients = useMemo(() => {
    const total = consumptions.reduce(
      (acc, c) => {
        acc.calcium += c.calcium ?? 0;
        acc.magnesium += c.magnesium ?? 0;
        acc.sodium += c.sodium ?? 0;
        return acc;
      },
      { calcium: 0, magnesium: 0, sodium: 0 }
    );
    return [
      { key: "calcium", label: "Ca", value: Math.round(total.calcium), unit: "mg" },
      { key: "magnesium", label: "Mg", value: Math.round(total.magnesium), unit: "mg" },
      { key: "sodium", label: "Na", value: Math.round(total.sodium), unit: "mg" },
    ];
  }, [consumptions]);


  return (
    <main className="flex-1 w-full flex flex-col relative overflow-hidden text-slate-200 selection:bg-blue-500/30">
      {/* Background Ambient Glow */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 mx-auto w-full max-w-md px-6 pt-6 flex flex-col flex-1">

        {/* Minimal Header */}
        <header className={clsx(
          "flex items-center justify-between mb-4",
          mounted ? "opacity-100" : "opacity-0",
          "transition duration-700"
        )}>
          <Link
            href="/settings"
            onClick={() => hapticLight()}
            className="p-3 rounded-full bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all backdrop-blur-md"
          >
            <Settings className="w-5 h-5" />
          </Link>
          <Link
            href={{ pathname: "/scan", query: { profile } }}
            onClick={() => hapticMedium()}
            className="p-3 rounded-full bg-blue-500/20 border border-blue-500/20 text-blue-200 hover:text-white hover:bg-blue-500/30 transition-all backdrop-blur-md"
          >
            <Scan className="w-5 h-5" />
          </Link>
        </header>

        {/* Centered Content Wrapper */}
        <div className="flex-1 flex flex-col justify-end">

          {/* Hero: Bottle */}
          <section className={clsx(
            "flex flex-col items-center justify-center relative -mt-8",
            mounted ? "opacity-100 scale-100" : "opacity-0 scale-95",
            "transition duration-1000 delay-100 ease-out"
          )}>
            <div className="relative scale-90 sm:scale-100">
              <BottleVisualizer
                fillLevel={bottleFill}
                isBubbling={hydrationPct < 95}
                showControls={false}
                consumedMl={consumed}
              />
              {/* Floating Stats */}
              <div className="absolute top-[20%] right-[-10%] flex flex-col gap-4">
                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Ziel</span>
                  <span className="text-lg font-semibold text-slate-300">{(hydrationGoal / 1000).toFixed(1)}L</span>
                </div>
              </div>
              <div className="absolute bottom-[20%] left-[-10%] flex flex-col gap-4">
                <div className="flex flex-col items-center">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Offen</span>
                  <span className="text-lg font-semibold text-slate-300">{Math.max(0, hydrationGoal - consumed)}ml</span>
                </div>
              </div>
            </div>

            {/* Paginated Controls Wrapper */}
            <div className={clsx(
              "mt-8 w-full relative z-20 flex flex-col items-center",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
              "transition duration-700 delay-200"
            )}>

              {/* Sliding Container */}
              <div className="w-full relative overflow-hidden min-h-[190px]">
                <div
                  className="flex w-full transition-transform duration-500 ease-out will-change-transform"
                  style={{ transform: `translateX(-${controlPage * 100}%)` }}
                >

                  {/* PAGE 0: Standard Volumes */}
                  <div className="w-full flex-shrink-0 px-1">
                    {/* Selected Water Indicator (if active) */}
                    {selectedScan && (
                      <div className="mb-3 flex items-center justify-center animate-in fade-in slide-in-from-top-2">
                        <button
                          onClick={() => setSelectedScan(null)}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/30 text-xs font-medium text-blue-200 hover:bg-blue-500/30 transition-colors"
                        >
                          <span>{selectedScan.productInfo?.brand || "Auswahl"} verwenden</span>
                          <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white">✕</div>
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-4 gap-3">
                      {[250, 500, 750, 1000].map((ml) => (
                        <button
                          key={ml}
                          onClick={() => handleAddConsumption(ml)}
                          className="group relative flex flex-col items-center justify-center py-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 active:scale-95 transition-all backdrop-blur-sm"
                        >
                          <span className="text-sm font-semibold text-slate-300 group-hover:text-white">{ml}</span>
                          <span className="text-[10px] text-slate-500 group-hover:text-slate-400">ml</span>
                          <div className="absolute inset-0 rounded-2xl bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors" />
                        </button>
                      ))}
                      <button
                        onClick={() => setIsCustomVolumeOpen(true)}
                        className="col-span-4 mt-1 flex items-center justify-center py-3 rounded-2xl border border-white/10 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 active:scale-95 transition-all"
                      >
                        <span>Andere Menge eingeben...</span>
                      </button>
                    </div>
                  </div>

                  {/* PAGE 1: Recent Waters */}
                  <div className="w-full flex-shrink-0 px-1">
                    <div className="flex flex-col gap-3 h-full">
                      <div className="text-center text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Zuletzt getrunken
                      </div>

                      <div className="flex-1 min-h-[140px]">
                        {recentScans.length > 0 ? (
                          <div className="grid grid-cols-2 gap-2 pr-1">
                            <button
                              onClick={() => { setSelectedScan(null); setControlPage(0); }}
                              className={clsx(
                                "flex items-center gap-2 px-3 py-3 rounded-xl border transition-all text-left",
                                !selectedScan ? "bg-blue-500/20 border-blue-500/50 text-blue-100" : "bg-white/5 border-white/5 text-slate-400"
                              )}
                            >
                              <div className="w-2 h-2 rounded-full bg-slate-400/50 shrink-0" />
                              <span className="text-xs font-medium">Standard</span>
                            </button>
                            {recentScans.map((scan) => {
                              const isActive = selectedScan?.id === scan.id;
                              return (
                                <button
                                  key={scan.id}
                                  onClick={() => { setSelectedScan(scan); setControlPage(0); }}
                                  className={clsx(
                                    "flex items-center gap-2 px-3 py-3 rounded-xl border transition-all text-left",
                                    isActive ? "bg-blue-500 text-white border-blue-400" : "bg-white/5 border-white/5 text-slate-300"
                                  )}
                                >
                                  <div className={clsx("w-2 h-2 rounded-full shrink-0", isActive ? "bg-white" : "bg-sky-500")} />
                                  <div className="min-w-0 flex-1 overflow-hidden">
                                    <div className="text-xs font-bold truncate block">{scan.productInfo?.brand || "Unbekannt"}</div>
                                    <div className="text-[10px] opacity-70 truncate block">{scan.productInfo?.productName}</div>
                                  </div>
                                </button>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center h-24 text-slate-500 text-xs text-center px-4">
                            <p>Noch keine Scans im Verlauf.</p>
                            <p className="mt-1">Scanne ein Wasser, um es hier zu sehen!</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Pagination Dots */}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setControlPage(0)}
                  className={clsx("h-1.5 rounded-full transition-all duration-300", controlPage === 0 ? "bg-white w-4" : "bg-white/20 w-1.5 hover:bg-white/40")}
                />
                <button
                  onClick={() => setControlPage(1)}
                  className={clsx("h-1.5 rounded-full transition-all duration-300", controlPage === 1 ? "bg-white w-4" : "bg-white/20 w-1.5 hover:bg-white/40")}
                />
              </div>

            </div>

          </section>



          {/* Footer Info: Nutrients & History */}
          <section className={clsx(
            "mt-12 flex items-center justify-between px-2",
            mounted ? "opacity-100" : "opacity-0",
            "transition duration-1000 delay-500"
          )}>
            {/* Micro Nutrients */}
            <div className="flex gap-4">
              {nutrients.map((n) => (
                <div key={n.key} className="flex flex-col">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wider">{n.label}</span>
                  <span className="text-sm font-medium text-slate-300">{n.value}</span>
                </div>
              ))}
            </div>

            {/* History Link */}
            <Link href="/history" className="flex items-center gap-2 text-xs font-medium text-slate-500 hover:text-white transition-colors">
              <span>Verlauf</span>
              <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
                <ChevronRight className="w-3 h-3" />
              </div>
            </Link>
          </section>

        </div>

      </div>
      {/* Custom Volume Dialog */}
      {isCustomVolumeOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-6 scale-100 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-semibold text-white text-center">Eigene Menge</h3>
            <div className="flex items-center justify-center gap-2">
              <input
                autoFocus
                type="number"
                inputMode="numeric"
                className="w-32 bg-transparent text-4xl font-bold text-center text-blue-400 outline-none border-b-2 border-slate-700 focus:border-blue-500 transition-colors pb-2"
                placeholder="0"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
              />
              <span className="text-xl text-slate-500 font-medium mt-2">ml</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setIsCustomVolumeOpen(false)}
                className="py-3 rounded-xl bg-slate-800 text-slate-400 font-medium hover:bg-slate-700 transition"
              >
                Abbrechen
              </button>
              <button
                onClick={() => {
                  const val = parseInt(customAmount);
                  if (val > 0) {
                    handleAddConsumption(val);
                    setIsCustomVolumeOpen(false);
                    setCustomAmount("");
                  }
                }}
                className="py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition"
              >
                Hinzufügen
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// --- SUBCOMPONENTS ---

function RecentWaterSelector({ recentScans, selectedScan, onSelect }: any) {
  if (!recentScans || recentScans.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Zuletzt getrunken</span>
        {selectedScan && (
          <button onClick={() => onSelect(null)} className="text-[10px] text-blue-400 hover:text-blue-300">
            Auswahl aufheben
          </button>
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-6 px-6 sm:mx-0 sm:px-0 mask-linear-fade">
        {/* Helper to select "Standard/Unknown" implicitly by deselecting */}
        <button
          onClick={() => onSelect(null)}
          className={clsx(
            "flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border transition-all",
            !selectedScan
              ? "bg-blue-500/20 border-blue-500/50 text-blue-100 shadow-[0_0_15px_-3px_rgba(59,130,246,0.3)]"
              : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
          )}
        >
          <div className="w-2 h-2 rounded-full bg-slate-400/50" />
          <span className="text-xs font-medium whitespace-nowrap">Standard</span>
        </button>

        {recentScans.map((scan: any) => {
          const isActive = selectedScan?.id === scan.id;
          return (
            <button
              key={scan.id}
              onClick={() => onSelect(isActive ? null : scan)}
              className={clsx(
                "flex-shrink-0 flex items-center gap-3 px-3 py-2 rounded-xl border transition-all max-w-[200px]",
                isActive
                  ? "bg-blue-500 text-white border-blue-400 shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)]"
                  : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10 hover:border-white/10"
              )}
            >
              {/* Minimal Icon based on Reliability/Score if avail, else generic */}
              <div className={clsx(
                "w-2 h-2 rounded-full",
                isActive ? "bg-white" : "bg-sky-500"
              )} />

              <div className="flex flex-col items-start min-w-0">
                <span className={clsx("text-xs font-bold truncate w-full", isActive ? "text-white" : "text-slate-200")}>
                  {scan.productInfo?.brand || "Unbekannt"}
                </span>
                <span className={clsx("text-[10px] truncate w-full", isActive ? "text-blue-100" : "text-slate-500")}>
                  {scan.productInfo?.productName || "Wasser"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}


