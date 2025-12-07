"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Settings, Droplet, Baby, Activity, HeartPulse, Coffee, Shield } from "lucide-react";
import clsx from "clsx";
import { hapticLight, hapticMedium } from "@/lib/capacitor";
import type { ProfileType } from "@/src/domain/types";
import { useUserProfile } from "@/src/hooks/useUserProfile";
import { useDatabaseContext } from "@/src/contexts/DatabaseContext";
import { sqliteService } from "@/src/lib/sqlite"; // Direct import for fetch
import type { ScanResult } from "@/src/lib/sqlite";
import { useConsumptionContext } from "@/src/contexts/ConsumptionContext";
import { BottleVisualizer } from "@/src/components/BottleVisualizer";

const PROFILE_META: Record<
  ProfileType,
  { label: string; icon: any; accent: string; bg: string }
> = {
  standard: { label: "Standard", icon: Droplet, accent: "text-blue-200", bg: "bg-blue-500/10" },
  baby: { label: "Baby", icon: Baby, accent: "text-pink-200", bg: "bg-pink-500/10" },
  sport: { label: "Sport", icon: Activity, accent: "text-emerald-200", bg: "bg-emerald-500/10" },
  blood_pressure: { label: "Blutdruck", icon: HeartPulse, accent: "text-rose-200", bg: "bg-rose-500/10" },
  coffee: { label: "Barista", icon: Coffee, accent: "text-amber-200", bg: "bg-amber-500/10" },
  kidney: { label: "Niere", icon: Shield, accent: "text-teal-200", bg: "bg-teal-500/10" },
};

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
  const [showProfilePicker, setShowProfilePicker] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);

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

  const handleProfileSelect = (next: ProfileType) => {
    setProfile(next);
    localStorage.setItem("wasserscan-profile", next);
    setShowProfilePicker(false);
    hapticLight();
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
    touchDeltaX.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    touchDeltaX.current = (e.touches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
  };

  const handleTouchEnd = () => {
    const delta = touchDeltaX.current;
    touchStartX.current = null;
    touchDeltaX.current = 0;
    const threshold = 40;
    if (Math.abs(delta) < threshold) return;
    if (delta < 0) {
      setControlPage((p) => Math.min(1, p + 1));
    } else {
      setControlPage((p) => Math.max(0, p - 1));
    }
  };


  return (
    <main className="flex-1 w-full flex flex-col relative overflow-hidden text-slate-200 selection:bg-blue-500/30">
      {/* Background Ambient Glow */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 mx-auto w-full max-w-md px-6 pt-6 flex flex-col flex-1 gap-8 pb-24">

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
          <div className="relative">
            {(() => {
              const CurrentIcon = PROFILE_META[profile].icon;
              return (
                <button
                  onClick={() => setShowProfilePicker((v) => !v)}
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10 transition-all backdrop-blur-md"
                >
                  <div className={clsx("p-2 rounded-full", PROFILE_META[profile].bg)}>
                    <CurrentIcon className={clsx("w-5 h-5", PROFILE_META[profile].accent)} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">Profil</p>
                    <p className="text-xs font-semibold text-slate-100">{PROFILE_META[profile].label}</p>
                  </div>
                </button>
              );
            })()}
            {showProfilePicker && (
              <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-white/10 bg-slate-900/95 shadow-2xl backdrop-blur-lg p-2 z-20">
                {(Object.keys(PROFILE_META) as ProfileType[]).map((p) => {
                  const meta = PROFILE_META[p];
                  const active = p === profile;
                  const Icon = meta.icon;
                  return (
                    <button
                      key={p}
                      onClick={() => handleProfileSelect(p)}
                      className={clsx(
                        "w-full flex items-center gap-2 px-3 py-2 rounded-xl border transition-all text-left",
                        active
                          ? "bg-blue-500/20 border-blue-400/50 text-white"
                          : "bg-white/0 border-white/5 text-slate-200 hover:bg-white/5"
                      )}
                    >
                      <div className={clsx("p-2 rounded-full", meta.bg)}>
                        <Icon className={clsx("w-4 h-4", meta.accent)} />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold">{meta.label}</span>
                        <span className="text-[10px] text-slate-500">Tippen zum Wechseln</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </header>

        {/* Centered Content Wrapper */}
        <div className="flex-1 flex flex-col gap-8">

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
              {/* Floating Stats - Hydration */}
              <div className="absolute top-[15%] right-[-12%] flex flex-col items-center">
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Ziel</span>
                <span className="text-base font-semibold text-slate-300">{(hydrationGoal / 1000).toFixed(1)}L</span>
              </div>
              <div className="absolute bottom-[15%] left-[-12%] flex flex-col items-center">
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Offen</span>
                <span className="text-base font-semibold text-slate-300">{Math.max(0, hydrationGoal - consumed)}ml</span>
              </div>

              {/* Floating Stats - Mineralien (NEU) */}
              <div className="absolute bottom-[-10%] left-1/2 -translate-x-1/2 flex items-center gap-3 px-3 py-2 rounded-full bg-slate-900/50 border border-white/5 backdrop-blur-sm">
                <MineralStat label="Ca" color="text-cyan-300" value={nutrients[0]?.value ?? 0} />
                <MineralStat label="Mg" color="text-emerald-300" value={nutrients[1]?.value ?? 0} />
                <MineralStat label="Na" color="text-amber-300" value={nutrients[2]?.value ?? 0} />
              </div>
            </div>

            {/* Paginated Controls Wrapper */}
            <div className={clsx(
              "mt-14 w-full relative z-20 flex flex-col items-center",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
              "transition duration-700 delay-200"
            )}>

              {/* Sliding Container */}
              <div
                className="w-full relative overflow-hidden min-h-[190px] pb-2"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
              >
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
                {/* Pagination Dots */}
                <div className="flex gap-2 absolute bottom-1 left-1/2 -translate-x-1/2">
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

            </div>

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

function MineralStat({ label, color, value }: { label: string; color: string; value: number }) {
  return (
    <div className="flex flex-col items-center leading-tight">
      <span className={clsx("text-[10px] font-medium uppercase tracking-wider text-slate-400")}>{label}</span>
      <span className={clsx("text-sm font-semibold", color)}>
        {value}
        <span className="text-[9px] text-slate-500 ml-0.5">mg</span>
      </span>
    </div>
  );
}
