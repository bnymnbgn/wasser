"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Droplet,
  Scan,
  History,
  BookOpen,
  ChevronRight,
  Info,
  Sparkles,
} from "lucide-react";
import type { ProfileType } from "@/src/domain/types";
import { ProfileSelector } from "@/src/components/ProfileSelector";
import ThemeToggle from "@/src/components/ThemeToggle";
import { hapticLight, hapticMedium } from "@/lib/capacitor";

const PROFILE_TIPS: Record<ProfileType, string> = {
  standard:
    "Nutze dieses Profil als Basis und wechsle bei speziellen Anforderungen gezielt zu Baby, Sport oder Blutdruck.",
  baby: "Achte auf natrium- und nitratarmes Wasser – wechsle nur zu Standard, wenn keine Babynahrung zubereitet wird.",
  sport: "Achte auf ausreichend Magnesium & Natrium für optimale Regeneration.",
  blood_pressure:
    "Bevorzuge natriumarme Wässer (<20 mg/L) und wechsle nur kurzzeitig zu Sport, falls nötig.",
};

const mineralBars = [
  { label: "CALCIUM", value: 112, maxPercent: 0.8, accent: "from-orange-500 to-amber-400" },
  { label: "MAGNESIUM", value: 84, maxPercent: 0.65, accent: "from-purple-500 to-fuchsia-400" },
  { label: "NATRIUM", value: 12, maxPercent: 0.15, accent: "from-emerald-500 to-teal-400" },
];

const historyEntries = [
  { name: "Gerolsteiner Sprudel", time: "Heute, 14:30", score: 92 },
  { name: "Volvic Naturelle", time: "Gestern", score: 88 },
  { name: "Lauretana", time: "Gestern", score: 81 },
];

const CountUp = ({ value }: { value: number }) => {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let frame: number;
    let start: number;
    const duration = 1200;

    const animate = (time: number) => {
      start = start ?? time;
      const progress = Math.min((time - start) / duration, 1);
      const eased = 1 - Math.pow(2, -10 * progress);
      setDisplay(Math.round(eased * value));
      if (progress < 1) {
        frame = requestAnimationFrame(animate);
      }
    };

    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [value]);

  return <span>{display}</span>;
};

export default function DashboardPage() {
  const [profile, setProfile] = useState<ProfileType>("standard");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(t);
  }, []);

  const stats = useMemo(
    () => [
      { label: "Letzter Score", value: "92", helper: "+5% vs. letzte Woche" },
      { label: "Scans gesamt", value: "12", helper: "2 neue diese Woche" },
      { label: "Durchschnitt", value: "78%", helper: "Profil Sport" },
      { label: "Aktives Profil", value: profile, helper: "Tipps personalisiert" },
    ],
    [profile]
  );

  return (
    <main className="min-h-screen bg-ocean-dark text-white selection:bg-water-primary/30">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-10 -left-20 h-72 w-72 rounded-full bg-water-primary/15 blur-[120px]" />
        <div className="absolute bottom-10 -right-16 h-64 w-64 rounded-full bg-water-accent/20 blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-2xl px-5 pt-12 pb-32">
        <header
          className={`mb-10 flex items-start justify-between transition duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          }`}
        >
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">Dashboard</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Dein Wasserstatus</h1>
            <p className="mt-1 text-sm text-slate-400">KI-gestützte Analyse & Empfehlungen</p>
          </div>
          <ThemeToggle />
        </header>

        <section
          className={`relative mb-8 overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-6 shadow-glass backdrop-blur-2xl transition duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-water-primary/30 blur-3xl" />
          <div className="relative flex flex-col gap-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.5em] text-slate-300">Gesamtscore</p>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-6xl font-semibold tracking-tight text-white drop-shadow-lg">
                    <CountUp value={94} />
                  </span>
                  <span className="text-lg text-slate-400">/ 100</span>
                </div>
              </div>
              <button
                type="button"
                className="rounded-full border border-white/20 p-2 text-slate-300 transition hover:text-white"
              >
                <Info className="h-5 w-5" />
              </button>
            </div>

            <div className="relative h-3 w-full overflow-hidden rounded-full border border-white/10 bg-white/10">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-water-primary via-water-accent to-sky-600 shadow-glow">
                <div className="h-full w-[94%] rounded-full bg-gradient-to-r from-water-primary via-water-accent to-indigo-500" />
              </div>
            </div>
            <p className="text-xs text-slate-200/80">
              Dein Wasser ist <span className="text-water-accent">mineralreich</span> und unterstützt deine
              Regeneration optimal.
            </p>

            <Link
              href={{ pathname: "/scan", query: { profile } }}
              onClick={() => hapticMedium()}
              className="group inline-flex items-center justify-between rounded-2xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-medium text-white transition active:scale-95"
            >
              <span>Jetzt Etikett scannen</span>
              <Scan className="h-5 w-5 text-water-accent transition group-hover:scale-110" />
            </Link>
          </div>
        </section>

        <section
          className={`mb-8 grid grid-cols-2 gap-3 transition duration-700 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-3xl border border-white/5 bg-white/5 p-4 backdrop-blur-xl shadow-glass"
            >
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-400">{stat.label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-white">{stat.value}</p>
              <p className="mt-1 text-[11px] text-slate-400">{stat.helper}</p>
            </div>
          ))}
        </section>

        <section className="mb-8 space-y-4 rounded-3xl border border-white/10 bg-ocean-card/80 p-5 shadow-glass backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium">Mineralien Fingerprint</h2>
            <button className="text-[11px] uppercase tracking-wider text-water-accent">Analyse</button>
          </div>
          <div className="space-y-5">
            {mineralBars.map((bar) => (
              <div key={bar.label}>
                <div className="mb-1 flex items-center justify-between text-[11px]">
                  <span className="tracking-[0.3em] text-slate-400">{bar.label}</span>
                  <span className="font-mono text-sm text-white">{bar.value} mg/L</span>
                </div>
                <div className="h-2 rounded-full bg-slate-800/80">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${bar.accent} shadow-[0_0_15px_rgba(59,130,246,0.4)]`}
                    style={{ width: `${bar.maxPercent * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-8 space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glass backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium">Dein Profil</h2>
            <span className="rounded-full border border-white/20 px-3 py-1 text-xs uppercase tracking-wider text-slate-300">
              {profile}
            </span>
          </div>
          <ProfileSelector value={profile} onChange={setProfile} />
          <p className="text-[12px] leading-relaxed text-slate-300">{PROFILE_TIPS[profile]}</p>
        </section>

        <section className="mb-8 grid gap-3 md:grid-cols-2">
          <Link
            href="/history"
            className="group rounded-3xl border border-white/10 bg-ocean-card/80 p-4 shadow-glass backdrop-blur-xl transition active:scale-95"
            onClick={() => hapticLight()}
          >
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3 text-water-accent">
                <History className="h-5 w-5" />
              </div>
              <div>
                <p className="text-base font-medium">Scan-Verlauf</p>
                <p className="text-sm text-slate-400">Alle Analysen im Überblick</p>
              </div>
            </div>
            <ChevronRight className="mt-3 h-4 w-4 text-slate-500 transition group-hover:translate-x-1" />
          </Link>

          <Link
            href="/onboarding"
            className="group rounded-3xl border border-white/10 bg-gradient-to-br from-water-primary/30 to-water-accent/10 p-4 shadow-glow backdrop-blur-xl transition active:scale-95"
            onClick={() => hapticLight()}
          >
            <div className="flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-3 text-white">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-base font-medium">Wissen & Guides</p>
                <p className="text-sm text-slate-100/80">Tipps für bessere Wasserwahl</p>
              </div>
            </div>
            <ChevronRight className="mt-3 h-4 w-4 text-white/70 transition group-hover:translate-x-1" />
          </Link>
        </section>

        <section className="space-y-4 rounded-3xl border border-white/10 bg-ocean-card/90 p-5 shadow-glass backdrop-blur-2xl">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium">Zuletzt getrunken</h2>
            <Sparkles className="h-4 w-4 text-water-accent" />
          </div>
          <div className="space-y-3">
            {historyEntries.map((entry) => (
              <div
                key={entry.name}
                className="flex items-center rounded-2xl border border-white/5 bg-white/5 px-4 py-3 text-left shadow-glass transition hover:border-water-accent/40 active:scale-[0.98]"
              >
                <div className="rounded-2xl border border-white/10 bg-slate-900/60 p-3 text-slate-300">
                  <Droplet className="h-5 w-5" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium">{entry.name}</p>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-slate-500">{entry.time}</p>
                </div>
                <div className="font-mono text-lg text-status-good">{entry.score}</div>
                <ChevronRight className="ml-2 h-4 w-4 text-slate-500" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
