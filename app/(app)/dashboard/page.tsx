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

const quickActions = [
  {
    id: "scan",
    title: "Scannen",
    description: "Etikett aufnehmen & analysieren",
    href: "/scan",
    accent: "from-water-primary/40 via-water-accent/20 to-transparent",
    icon: Scan,
  },
  {
    id: "history",
    title: "Verlauf",
    description: "Alle Analysen im Überblick",
    href: "/history",
    accent: "from-water-accent/20 via-white/5 to-transparent",
    icon: History,
  },
  {
    id: "learn",
    title: "Lernen",
    description: "Guides & Wissen zur Wasserwahl",
    href: "/onboarding",
    accent: "from-white/15 via-water-primary/10 to-transparent",
    icon: BookOpen,
  },
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
    <main className="min-h-screen text-ocean-primary selection:bg-ocean-primary/30">
      {/* Background is now handled globally by LivingBackground */}

      <div className="relative z-10 mx-auto w-full max-w-2xl px-5 pt-12 pb-32">
        <header
          className={`mb-10 flex items-start justify-between transition duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
            }`}
        >
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-ocean-tertiary">Dashboard</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight">Dein Wasserstatus</h1>
            <p className="mt-1 text-sm text-ocean-secondary">KI-gestützte Analyse & Empfehlungen</p>
          </div>
          <ThemeToggle />
        </header>

        <section
          className={`relative mb-8 overflow-hidden rounded-ocean-xl border border-ocean-border ocean-panel-strong p-6 ocean-shadow-4 transition duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
        >
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full ocean-primary/30 blur-3xl" />
          <div className="relative flex flex-col gap-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.5em] text-ocean-secondary">Gesamtscore</p>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-6xl font-semibold tracking-tight text-ocean-primary ocean-glow">
                    <CountUp value={94} />
                  </span>
                  <span className="text-lg text-ocean-tertiary">/ 100</span>
                </div>
              </div>
              <button
                type="button"
                className="rounded-full border border-ocean-border p-2 text-ocean-secondary transition hover:text-ocean-primary"
              >
                <Info className="h-5 w-5" />
              </button>
            </div>

            <div className="relative h-3 w-full overflow-hidden rounded-full border border-ocean-border ocean-surface-elevated">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-ocean-primary via-ocean-accent ocean-glow">
                <div className="h-full w-[94%] rounded-full bg-gradient-to-r from-ocean-primary via-ocean-accent" />
              </div>
            </div>
            <p className="text-xs text-ocean-secondary">
              Dein Wasser ist <span className="text-ocean-accent">mineralreich</span> und unterstützt deine
              Regeneration optimal.
            </p>

            <Link
              href={{ pathname: "/scan", query: { profile } }}
              onClick={() => hapticMedium()}
              className="group inline-flex items-center justify-between rounded-2xl border border-ocean-border ocean-panel px-4 py-3 text-sm font-medium text-ocean-primary transition active:scale-95"
            >
              <span>Jetzt Etikett scannen</span>
              <Scan className="h-5 w-5 text-ocean-accent transition group-hover:scale-110" />
            </Link>
          </div>
        </section>

        <section
          className={`mb-8 grid grid-cols-2 gap-3 transition duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
            }`}
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="ocean-card p-4 ocean-panel ocean-shadow-3"
            >
              <p className="text-[10px] uppercase tracking-[0.3em] text-ocean-tertiary">{stat.label}</p>
              <p className="mt-2 text-2xl font-semibold tracking-tight text-ocean-primary">{stat.value}</p>
              <p className="mt-1 text-[11px] text-ocean-tertiary">{stat.helper}</p>
            </div>
          ))}
        </section>

        <section className="mb-8 space-y-4 ocean-card ocean-panel ocean-shadow-3 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium">Mineralien Fingerprint</h2>
            <button className="text-[11px] uppercase tracking-wider text-water-accent">Analyse</button>
          </div>
          <div className="space-y-5">
            {mineralBars.map((bar) => (
              <div key={bar.label}>
                <div className="mb-1 flex items-center justify-between text-[11px]">
                  <span className="tracking-[0.3em] text-ocean-tertiary">{bar.label}</span>
                  <span className="font-mono text-sm text-ocean-primary">{bar.value} mg/L</span>
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

        <section className="mb-8 space-y-4 ocean-card ocean-panel ocean-shadow-3 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium">Dein Profil</h2>
            <span className="rounded-full border border-ocean-border px-3 py-1 text-xs uppercase tracking-wider text-ocean-secondary">
              {profile}
            </span>
          </div>
          <ProfileSelector value={profile} onChange={setProfile} />
          <p className="text-[12px] leading-relaxed text-ocean-secondary">{PROFILE_TIPS[profile]}</p>
        </section>

        <section className="mb-8 grid gap-3 md:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.id}
                href={action.href}
                className="group relative overflow-hidden ocean-card ocean-panel ocean-shadow-3 p-4 transition active:scale-95"
                onClick={() => hapticLight()}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${action.accent} opacity-70`} />
                <div className="relative flex items-start gap-3">
                  <div className="rounded-2xl border border-ocean-border ocean-surface-elevated p-3 text-ocean-primary shadow-inner">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-base font-medium">{action.title}</p>
                    <p className="text-sm text-ocean-secondary">{action.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-ocean-secondary transition group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </section>

        <section className="space-y-4 ocean-card ocean-panel ocean-shadow-3 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-medium">Zuletzt getrunken</h2>
            <Sparkles className="h-4 w-4 text-water-accent" />
          </div>
          <div className="space-y-3">
            {historyEntries.map((entry) => (
              <div
                key={entry.name}
                className="flex items-center rounded-2xl ocean-surface-elevated border-ocean-border px-4 py-3 text-left ocean-shadow-3 transition hover:border-water-accent/40 active:scale-[0.98]"
              >
                <div className="rounded-2xl border border-ocean-border ocean-surface-elevated p-3 text-ocean-secondary">
                  <Droplet className="h-5 w-5" />
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium">{entry.name}</p>
                  <p className="text-[11px] uppercase tracking-[0.3em] text-ocean-tertiary">{entry.time}</p>
                </div>
                <div className="font-mono text-lg text-ocean-success">{entry.score}</div>
                <ChevronRight className="ml-2 h-4 w-4 text-ocean-tertiary" />
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
