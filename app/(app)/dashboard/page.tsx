"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Settings, Scan, ChevronRight, Plus, Trash2 } from "lucide-react";
import clsx from "clsx";
import { hapticLight, hapticMedium } from "@/lib/capacitor";
import type { ProfileType } from "@/src/domain/types";
import { useUserProfile } from "@/src/hooks/useUserProfile";
import { useConsumptionContext } from "@/src/contexts/ConsumptionContext";
import { format } from "date-fns";
import type { ScanResult } from "@/src/domain/types";

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
  const { userProfile, goals } = useUserProfile();
  const { consumptions, add, remove, refresh } = useConsumptionContext();
  const [selectedVolume, setSelectedVolume] = useState<number>(500);
  const [brand, setBrand] = useState<string>("");
  const [type, setType] = useState<"mineral" | "tap" | "tea" | "coffee" | "other">("mineral");
  const [recentScans, setRecentScans] = useState<ScanResult[]>([]);
  const [selectedScanId, setSelectedScanId] = useState<string>("");

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

  useEffect(() => {
    // Load recent scans for prefill (web path)
    fetch("/api/history")
      .then((res) => res.json())
      .then((data) => {
        setRecentScans((data || []).slice(0, 10));
      })
      .catch(() => setRecentScans([]));
  }, []);

  const hydrationGoal = goals?.dailyWaterGoal ?? 2500;
  const consumed = consumptions.reduce(
    (sum, c) => sum + (c.volumeMl ?? 0) * (c.hydrationFactor ?? 1),
    0
  );
  const hydrationPct = Math.min(100, Math.round((consumed / hydrationGoal) * 100));

  const nutrients = useMemo(() => {
    const total = consumptions.reduce(
      (acc, c) => {
        acc.calcium += c.calcium ?? 0;
        acc.magnesium += c.magnesium ?? 0;
        acc.potassium += c.potassium ?? 0;
        acc.sodium += c.sodium ?? 0;
        return acc;
      },
      { calcium: 0, magnesium: 0, potassium: 0, sodium: 0 }
    );
    return [
      { key: "calcium", label: "Calcium", goal: goals?.dailyCalciumGoal ?? 1000, consumed: total.calcium },
      { key: "magnesium", label: "Magnesium", goal: goals?.dailyMagnesiumGoal ?? 400, consumed: total.magnesium },
      { key: "potassium", label: "Kalium", goal: goals?.dailyPotassiumGoal ?? 4000, consumed: total.potassium },
      { key: "sodium", label: "Natrium", goal: goals?.dailySodiumGoal ?? 2000, consumed: total.sodium },
    ];
  }, [consumptions, goals]);

  return (
    <main className="min-h-screen text-ocean-primary selection:bg-ocean-primary/30">
      <div className="relative z-10 mx-auto w-full max-w-2xl px-5 pt-12 pb-32 space-y-6">
        <header className={clsx("flex items-start justify-between", mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4", "transition duration-700") }>
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-ocean-tertiary">Dashboard</p>
            <h1 className="mt-2 text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-ocean-primary via-white to-ocean-accent">
              Dein Wasserstatus
            </h1>
            <p className="mt-1 text-sm text-ocean-secondary">Hydration & Mineralien auf dich zugeschnitten</p>
          </div>
          <Link
            href="/settings"
            onClick={() => hapticLight()}
            className="p-2 -mr-2 text-ocean-secondary hover:text-ocean-primary transition-colors"
          >
            <Settings className="w-6 h-6" />
          </Link>
        </header>

        {/* Hydration Header */}
        <section className="ocean-panel-strong rounded-ocean-xl border border-ocean-border p-6 ocean-shadow-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-[0.5em] text-ocean-secondary">Heute</p>
              <h2 className="mt-2 text-3xl font-semibold text-ocean-primary">
                {hydrationGoal ? `${(hydrationGoal / 1000).toFixed(1)} L Ziel` : "Hydrationsziel setzen"}
              </h2>
              <p className="text-sm text-ocean-secondary">Gewicht & Aktivität steuern dein Ziel</p>
            </div>
            <div className="text-right">
          <p className="text-xs text-ocean-secondary">Getrunken</p>
          <p className="text-2xl font-bold text-ocean-primary">{consumed} ml</p>
          <p className="text-xs text-ocean-tertiary">noch {Math.max(0, hydrationGoal - consumed)} ml</p>
            </div>
          </div>
          <div className="mt-4 h-3 w-full overflow-hidden rounded-full border border-ocean-border ocean-surface-elevated">
            <div className="h-full bg-gradient-to-r from-ocean-primary via-ocean-accent" style={{ width: `${hydrationPct}%` }} />
          </div>
        </section>

        {/* Quick Add + Empfehlung */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="ocean-panel p-4 border border-ocean-border rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-ocean-primary">Schnell hinzufügen</h3>
                <Link href="/history" className="text-[11px] text-ocean-secondary hover:text-ocean-primary">aus Verlauf</Link>
              </div>
              <p className="text-xs text-ocean-secondary mb-3">Marke wählen oder Volumen eintragen</p>
              <div className="mb-2">
                <select
                  value={selectedScanId}
                  onChange={(e) => setSelectedScanId(e.target.value)}
                  className="w-full rounded-xl border border-ocean-border bg-ocean-surface px-3 py-2 text-sm text-ocean-primary"
                >
                  <option value="">Scan auswählen (optional)</option>
                  {recentScans.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.productInfo?.brand ?? "Unbekannt"} {s.productInfo?.productName ? `– ${s.productInfo.productName}` : ""}
                    </option>
                  ))}
                </select>
              </div>
            <div className="flex gap-2 mb-2">
              {[250, 500, 750, 1000].map((ml) => (
                <button
                  key={ml}
                  onClick={() => setSelectedVolume(ml)}
                  className={clsx(
                    "flex-1 py-2 rounded-xl border text-sm font-medium",
                    selectedVolume === ml
                      ? "bg-ocean-primary text-white border-ocean-primary"
                      : "bg-ocean-surface hover:bg-ocean-surface-hover text-ocean-primary border-ocean-border"
                  )}
                >
                  {ml} ml
                </button>
              ))}
            </div>
            <div className="flex gap-2 mb-2">
              <input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="Marke (optional)"
                className="flex-1 rounded-xl border border-ocean-border bg-ocean-surface px-3 py-2 text-sm text-ocean-primary outline-none"
              />
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="rounded-xl border border-ocean-border bg-ocean-surface px-3 py-2 text-sm text-ocean-primary outline-none"
              >
                <option value="mineral">Mineral</option>
                <option value="tap">Leitung</option>
                <option value="tea">Tee</option>
                <option value="coffee">Kaffee</option>
                <option value="other">Sonstiges</option>
              </select>
            </div>
            <button
              onClick={async () => {
                const entry = {
                  id: crypto.randomUUID(),
                  timestamp: new Date().toISOString(),
                  waterBrand: brand || null,
                  productName: null,
                  volumeMl: selectedVolume,
              hydrationFactor: type === "coffee" ? 0.8 : 1.0,
              type,
                  calcium: 0,
                  magnesium: 0,
                  potassium: 0,
                  sodium: 0,
                  scanId: null,
                };
                const scan = recentScans.find((s) => s.id === selectedScanId);
                const parsedValues = scan?.ocrParsedValues || scan?.userOverrides;
                if (parsedValues) {
                  const factor = selectedVolume / 1000;
                  entry.calcium = (parsedValues.calcium ?? 0) * factor;
                  entry.magnesium = (parsedValues.magnesium ?? 0) * factor;
                  entry.potassium = (parsedValues.potassium ?? 0) * factor;
                  entry.sodium = (parsedValues.sodium ?? 0) * factor;
                  entry.scanId = scan.id;
                  entry.waterBrand = scan.productInfo?.brand ?? entry.waterBrand;
                  entry.productName = scan.productInfo?.productName ?? entry.productName;
                }
                await add(entry);
                setBrand("");
                setSelectedScanId("");
                await refresh();
              }}
              className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-ocean-primary to-ocean-accent text-white font-semibold flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Hinzufügen
            </button>
          </div>
          <div className="ocean-panel p-4 border border-ocean-border rounded-2xl">
            <h3 className="text-sm font-semibold text-ocean-primary mb-2">Empfehlung</h3>
            <p className="text-xs text-ocean-secondary">Trinke jetzt 500 ml für 90% deines Tagesziels.</p>
          </div>
        </section>

        {/* Nährstoffe */}
        <section className="ocean-panel p-4 border border-ocean-border rounded-2xl">
          <h3 className="text-sm font-semibold text-ocean-primary mb-3">Nährstoffe durch Wasser</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {nutrients.map((n) => (
              <div key={n.key} className="border border-ocean-border rounded-xl p-3">
                <p className="text-[11px] uppercase tracking-[0.3em] text-ocean-secondary">{n.label}</p>
                <p className="text-sm text-ocean-tertiary">{n.consumed} / {n.goal} mg</p>
                <div className="mt-2 h-2 rounded-full bg-ocean-surface">
                  <div className="h-full rounded-full bg-ocean-accent" style={{ width: `${Math.min(100, Math.round((n.consumed / n.goal) * 100))}%` }} />
                </div>
                <p className="text-[11px] text-ocean-tertiary mt-1">Hauptquelle: Ernährung</p>
              </div>
            ))}
          </div>
        </section>

        {/* Heute getrunken */}
        <section className="ocean-panel p-4 border border-ocean-border rounded-2xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-ocean-primary">Heute getrunken</h3>
            <button className="text-[11px] text-ocean-secondary hover:text-ocean-primary">Alle anzeigen</button>
          </div>
          {consumptions.length === 0 ? (
            <p className="text-xs text-ocean-tertiary">Noch keine Einträge</p>
          ) : (
            <div className="space-y-2">
              {consumptions.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-xl border border-ocean-border bg-ocean-surface px-3 py-2 text-sm">
                  <div className="flex flex-col">
                    <span className="font-semibold text-ocean-primary">
                      {c.waterBrand || c.type}
                    </span>
                    <span className="text-[11px] text-ocean-secondary">
                      {format(new Date(c.timestamp), "HH:mm")} · {c.volumeMl} ml
                    </span>
                  </div>
                  <button
                    className="text-ocean-secondary hover:text-ocean-primary"
                    onClick={() => remove(c.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Scan CTA */}
        <section className="ocean-panel p-4 border border-ocean-border rounded-2xl flex items-center justify-between">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-ocean-secondary">Scan</p>
            <p className="text-sm text-ocean-primary">Wasser scannen & speichern</p>
          </div>
          <Link
            href={{ pathname: "/scan", query: { profile } }}
            onClick={() => hapticMedium()}
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-ocean-primary to-ocean-accent text-white px-4 py-2 text-sm font-semibold"
          >
            <Scan className="h-5 w-5" />
            Jetzt scannen
          </Link>
        </section>
      </div>
    </main>
  );
}
