"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Settings, Droplet, Baby, Activity, HeartPulse, Coffee, Shield, ChevronDown, Check } from "lucide-react";
import clsx from "clsx";
import { hapticLight, hapticMedium } from "@/lib/capacitor";
import type { ProfileType } from "@/src/domain/types";
import { useUserProfile } from "@/src/hooks/useUserProfile";
import { useDatabaseContext } from "@/src/contexts/DatabaseContext";
import { sqliteService } from "@/src/lib/sqlite";
import { useConsumptionContext } from "@/src/contexts/ConsumptionContext";
import { BottleVisualizer } from "@/src/components/BottleVisualizer";
import { QuickAddControls } from "@/src/components/QuickAddControls";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Chip from "@mui/material/Chip";

const PROFILE_META: Record<
  ProfileType,
  { label: string; icon: any; accent: string; bg: string; desc: string }
> = {
  standard: { label: "Standard", icon: Droplet, accent: "text-blue-200", bg: "bg-blue-500/10", desc: "Ausgewogene Hydratation" },
  baby: { label: "Baby", icon: Baby, accent: "text-pink-200", bg: "bg-pink-500/10", desc: "Niedriger Natriumgehalt" },
  sport: { label: "Sport", icon: Activity, accent: "text-emerald-200", bg: "bg-emerald-500/10", desc: "Elektrolyt-Fokus" },
  blood_pressure: { label: "Blutdruck", icon: HeartPulse, accent: "text-rose-200", bg: "bg-rose-500/10", desc: "Natriumarm" },
  coffee: { label: "Barista", icon: Coffee, accent: "text-amber-200", bg: "bg-amber-500/10", desc: "Weiches Wasser" },
  kidney: { label: "Niere", icon: Shield, accent: "text-teal-200", bg: "bg-teal-500/10", desc: "Schonende Zusammensetzung" },
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

  // Echte Logik Hooks
  const { goals } = useUserProfile();
  const { consumptions, add, remove, refresh } = useConsumptionContext();
  const { isReady } = useDatabaseContext();

  const [recentScans, setRecentScans] = useState<any[]>([]);
  const [selectedScan, setSelectedScan] = useState<any | null>(null);

  // UI States
  const [showProfileSheet, setShowProfileSheet] = useState(false);
  const [isCustomVolumeOpen, setIsCustomVolumeOpen] = useState(false);
  const [customAmount, setCustomAmount] = useState("");
  const [lastAddedAmount, setLastAddedAmount] = useState<{ val: number; id: number } | null>(null);

  // Lade Historie (Original Logik)
  useEffect(() => {
    if (!isReady) return;
    const fetchRecent = async () => {
      try {
        const history = await sqliteService.getScanHistory(20);
        const unique = new Map();
        history.forEach((h) => {
          if (!h.productInfo?.brand) return;
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

  // Handle Add (Original Logik + Feedback)
  const handleAddConsumption = async (volume: number) => {
    if (volume <= 0) return;
    hapticMedium();

    setLastAddedAmount({ val: volume, id: Date.now() });
    setTimeout(() => setLastAddedAmount(null), 2000);

    let mineralValues = { calcium: 0, magnesium: 0, sodium: 0, potassium: 0 };
    let brand = null;
    let productName = null;
    let scanId = null;

    if (selectedScan) {
      brand = selectedScan.productInfo?.brand ?? null;
      productName = selectedScan.productInfo?.productName ?? null;
      scanId = selectedScan.id;

      try {
        const parsed = JSON.parse(selectedScan.ocrParsedValues || "{}");
        mineralValues = {
          calcium: parsed.calcium || 0,
          magnesium: parsed.magnesium || 0,
          sodium: parsed.sodium || 0,
          potassium: parsed.potassium || 0,
        };
      } catch (e) {
        /* ignore */
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

  // Profile laden/speichern
  useEffect(() => {
    const urlProfile = searchParams.get("profile") as ProfileType | null;
    if (urlProfile && Object.keys(PROFILE_META).includes(urlProfile)) {
      setProfile(urlProfile);
      localStorage.setItem("wasserscan-profile", urlProfile);
    } else {
      const savedProfile = localStorage.getItem("wasserscan-profile") as ProfileType | null;
      if (savedProfile && Object.keys(PROFILE_META).includes(savedProfile)) {
        setProfile(savedProfile);
      }
    }
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, [searchParams]);

  const hydrationGoal = goals?.dailyWaterGoal ?? 2500;
  const consumed = consumptions.reduce((sum, c) => sum + (c.volumeMl ?? 0) * (c.hydrationFactor ?? 1), 0);
  const hydrationPct = Math.min(100, Math.round((consumed / hydrationGoal) * 100));
  const bottleFill = Math.min(100, Math.max(0, hydrationPct));

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

  const lastIntake = useMemo(() => {
    if (!consumptions || consumptions.length === 0) return null;
    const sorted = [...consumptions].sort((a, b) => new Date(b.timestamp ?? "").getTime() - new Date(a.timestamp ?? "").getTime());
    const latest = sorted[0];
    if (!latest) return null;
    const volume = latest.volumeMl ?? 0;
    const ts = latest.timestamp ? new Date(latest.timestamp) : null;

    const formatTimeAgo = (d: Date) => {
      const diffMs = Date.now() - d.getTime();
      const mins = Math.floor(diffMs / 60000);
      if (mins < 1) return "gerade eben";
      if (mins < 60) return `vor ${mins} min`;
      const hours = Math.floor(mins / 60);
      if (hours < 24) return `vor ${hours} Std`;
      const days = Math.floor(hours / 24);
      return `vor ${days} Tag${days === 1 ? "" : "en"}`;
    };

    return {
      volume,
      timeAgo: ts ? formatTimeAgo(ts) : null,
    };
  }, [consumptions]);

  const handleProfileSelect = (next: ProfileType) => {
    setProfile(next);
    localStorage.setItem("wasserscan-profile", next);
    setShowProfileSheet(false);
    hapticLight();
  };

  return (
    <main className="flex-1 w-full flex flex-col relative overflow-hidden text-slate-200 selection:bg-blue-500/30">
      <div
        className={clsx(
          "fixed top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] pointer-events-none transition-colors duration-1000",
          PROFILE_META[profile].bg.replace("/10", "/20")
        )}
      />
      <div className="fixed bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-cyan-900/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 mx-auto w-full max-w-md h-full flex flex-col pb-6 flex-1">
        <header
          className={clsx(
            "flex items-center justify-between px-6 pt-6 pb-2",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4",
            "transition duration-700 ease-out"
          )}
        >
          <button
            onClick={() => {
              setShowProfileSheet(true);
              hapticLight();
            }}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-white/5 border border-white/10 text-slate-200 hover:bg-white/10 transition-all backdrop-blur-md group"
          >
            <div className={clsx("p-1.5 rounded-full", PROFILE_META[profile].bg)}>
              {(() => {
                const Icon = PROFILE_META[profile].icon;
                return <Icon className={clsx("w-4 h-4", PROFILE_META[profile].accent)} />;
              })()}
            </div>
            <span className="text-xs font-semibold pr-1">{PROFILE_META[profile].label}</span>
            <ChevronDown className="w-3 h-3 text-slate-500 group-hover:text-slate-300 transition-colors" />
          </button>
        </header>

        <div className="flex-1 flex flex-col items-center justify-center relative -mt-4 min-h-[300px]">
          <div
            className={clsx(
              "relative scale-90 sm:scale-100 transition-transform duration-1000 ease-out",
              mounted ? "opacity-100 scale-100" : "opacity-0 scale-95"
            )}
          >
            <BottleVisualizer fillLevel={bottleFill} isBubbling={hydrationPct < 95} showControls={false} consumedMl={consumed} />

            {/* Centered Stats - Overlaying bottle */}
            <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 flex items-center gap-4 sm:gap-6 pointer-events-none">
              <div className="flex flex-col items-center">
                <span className={clsx(
                  "text-3xl sm:text-4xl font-black tabular-nums transition-all duration-500 drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]",
                  hydrationPct >= 100 ? "text-emerald-400" : "text-ocean-accent"
                )}>
                  {Math.max(0, hydrationGoal - consumed)}
                </span>
                <span className="text-[10px] text-white/60 uppercase tracking-widest font-medium drop-shadow-md">ml offen</span>
              </div>
              <div className="w-px h-10 bg-gradient-to-b from-transparent via-white/30 to-transparent" />
              <div className="flex flex-col items-center">
                <span className="text-3xl sm:text-4xl font-black text-white/90 tabular-nums drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
                  {(hydrationGoal / 1000).toFixed(1)}
                  <span className="text-lg text-white/50 ml-1">L</span>
                </span>
                <span className="text-[10px] text-white/60 uppercase tracking-widest font-medium drop-shadow-md">Tagesziel</span>
              </div>
            </div>

            {lastAddedAmount && (
              <div key={lastAddedAmount.id} className="absolute top-1/4 left-1/2 -translate-x-1/2 pointer-events-none z-50 animate-float-up">
                <span className="text-3xl font-black text-white drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] tracking-tighter">
                  +{lastAddedAmount.val}
                </span>
              </div>
            )}

            {/* Compact Nutrient Pills */}
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
              <NutrientPill label="Ca" value={nutrients[0]?.value ?? 0} bgColor="bg-cyan-500/20" textColor="text-cyan-300" />
              <NutrientPill label="Mg" value={nutrients[1]?.value ?? 0} bgColor="bg-emerald-500/20" textColor="text-emerald-300" />
              <NutrientPill label="Na" value={nutrients[2]?.value ?? 0} bgColor="bg-amber-500/20" textColor="text-amber-300" />
            </div>
          </div>
        </div>

        <div className="relative z-30 mt-auto pt-1 pb-1">
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-4 mb-1">
            <span>Zuletzt getrunken:</span>
            {lastIntake ? (
              <span className="text-slate-200">
                {lastIntake.volume} ml{lastIntake.timeAgo ? ` • ${lastIntake.timeAgo}` : ""}
              </span>
            ) : (
              <span className="text-slate-500">Noch nichts erfasst</span>
            )}
          </div>
          <QuickAddControls
            onAdd={handleAddConsumption}
            onCustom={() => setIsCustomVolumeOpen(true)}
            recentScans={recentScans}
            selectedScan={selectedScan}
            onSelectScan={(s: any) => {
              setSelectedScan(s);
              hapticLight();
            }}
          />
        </div>
      </div>

      {showProfileSheet && (
        <>
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-300" onClick={() => setShowProfileSheet(false)} />
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 rounded-t-[2.5rem] border-t border-white/10 shadow-2xl p-6 pb-12 animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-slate-700 rounded-full mx-auto mb-8" />

            <h3 className="text-lg font-bold text-white mb-6 px-2">Profil wählen</h3>

            <div className="grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto scrollbar-hide pb-8">
              {(Object.keys(PROFILE_META) as ProfileType[]).map((p) => {
                const meta = PROFILE_META[p];
                const active = p === profile;
                const Icon = meta.icon;
                return (
                  <button
                    key={p}
                    onClick={() => handleProfileSelect(p)}
                    className={clsx(
                      "flex flex-col gap-3 p-4 rounded-3xl border transition-all text-left relative overflow-hidden",
                      active
                        ? "bg-gradient-to-r from-ocean-primary to-ocean-accent text-white border-ocean-primary/50 shadow-xl shadow-blue-900/30"
                        : "bg-white/5 border-white/5 text-slate-300 hover:bg-white/10"
                    )}
                  >
                    <div className="flex justify-between items-start">
                      <div className={clsx("p-2.5 rounded-full", active ? "bg-white/15" : meta.bg)}>
                        <Icon className={clsx("w-5 h-5", active ? "text-white" : meta.accent)} />
                      </div>
                      {active && (
                        <div className="bg-white text-ocean-primary p-1 rounded-full">
                          <Check size={12} strokeWidth={4} />
                        </div>
                      )}
                    </div>
                    <div>
                      <span className="block font-bold text-sm">{meta.label}</span>
                      <span className={clsx("text-[10px] leading-tight block mt-1", active ? "text-white" : "text-slate-500")}>
                        {meta.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}

      <SwipeableDrawer
        anchor="bottom"
        open={isCustomVolumeOpen}
        onClose={() => {
          setIsCustomVolumeOpen(false);
          setCustomAmount("");
        }}
        onOpen={() => setIsCustomVolumeOpen(true)}
        disableSwipeToOpen
        PaperProps={{
          sx: {
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            backgroundColor: '#0f172a',
            backgroundImage: 'none',
            paddingBottom: 'calc(80px + env(safe-area-inset-bottom))',
          },
        }}
      >
        <Box sx={{ p: 3 }}>
          {/* Drag handle */}
          <Box
            sx={{
              width: 48,
              height: 6,
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: 3,
              mx: 'auto',
              mb: 3,
            }}
          />

          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <h3 className="text-xl font-bold text-white">Eigene Menge</h3>
            <p className="text-sm text-slate-400 mt-1">Gib die Menge in ml ein</p>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, py: 3 }}>
            <TextField
              autoFocus
              type="number"
              inputMode="numeric"
              placeholder="0"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value.replace(/[^0-9]/g, ""))}
              variant="standard"
              InputProps={{
                disableUnderline: true,
                sx: {
                  fontSize: '3.5rem',
                  fontWeight: 900,
                  textAlign: 'center',
                  color: 'white',
                  '& input': {
                    textAlign: 'center',
                    '&::placeholder': { color: 'rgba(255,255,255,0.3)' },
                  },
                },
              }}
              sx={{ width: 160 }}
            />
            <span className="text-2xl text-slate-500 font-bold">ml</span>
          </Box>

          {/* Quick presets */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 3 }}>
            {[100, 200, 300, 500].map((preset) => (
              <Chip
                key={preset}
                label={preset}
                onClick={() => setCustomAmount(String(preset))}
                sx={{
                  fontWeight: 600,
                  backgroundColor: customAmount === String(preset) ? '#0EA5E9' : 'rgba(255,255,255,0.08)',
                  color: customAmount === String(preset) ? 'white' : 'rgba(255,255,255,0.6)',
                  '&:hover': {
                    backgroundColor: customAmount === String(preset) ? '#0EA5E9' : 'rgba(255,255,255,0.15)',
                  },
                }}
              />
            ))}
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Button
              variant="outlined"
              onClick={() => {
                setIsCustomVolumeOpen(false);
                setCustomAmount("");
              }}
              sx={{
                py: 2,
                borderRadius: 3,
                borderColor: 'rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.6)',
                fontWeight: 700,
                '&:hover': {
                  borderColor: 'rgba(255,255,255,0.2)',
                  backgroundColor: 'rgba(255,255,255,0.05)',
                },
              }}
            >
              Abbruch
            </Button>
            <Button
              variant="contained"
              disabled={!customAmount || parseInt(customAmount) <= 0}
              onClick={() => {
                const val = parseInt(customAmount);
                if (val > 0) {
                  handleAddConsumption(val);
                  setIsCustomVolumeOpen(false);
                  setCustomAmount("");
                }
              }}
              sx={{
                py: 2,
                borderRadius: 3,
                background: 'linear-gradient(90deg, #0EA5E9 0%, #38BDF8 100%)',
                fontWeight: 700,
                '&:disabled': {
                  background: 'rgba(255,255,255,0.1)',
                  color: 'rgba(255,255,255,0.3)',
                },
              }}
            >
              Hinzufügen
            </Button>
          </Box>
        </Box>
      </SwipeableDrawer>
    </main>
  );
}

function NutrientPill({ label, value, bgColor, textColor }: { label: string; value: number; bgColor: string; textColor: string }) {
  return (
    <div className={clsx(
      "flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/10 backdrop-blur-sm",
      bgColor
    )}>
      <span className={clsx("text-[10px] font-bold uppercase", textColor)}>{label}</span>
      <span className="text-xs font-semibold text-white/90">
        {value}
        <span className="text-[9px] text-white/50 ml-0.5">mg</span>
      </span>
    </div>
  );
}
