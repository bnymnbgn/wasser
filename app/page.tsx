"use client";

import clsx from "clsx";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";
import { ProfileSelector } from "@/src/components/ProfileSelector";
import type { ProfileType } from "@/src/domain/types";
import { hapticLight } from "@/lib/capacitor";

const heroStats = [
  {
    label: "Letzter Scan",
    value: "Gerolsteiner",
    meta: "92/100 Punkte",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 014-4h4m0 0l-3-3m3 3l-3 3" />
      </svg>
    ),
  },
  {
    label: "Durchschnitt",
    value: "78%",
    meta: "Mineralbalance",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 11V3L7 7m10 6v8l4-4" />
      </svg>
    ),
  },
  {
    label: "Wissensstand",
    value: "Aktualisiert",
    meta: "Profil Cheatsheet",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6l4 2" />
      </svg>
    ),
  },
];

const insights = [
  {
    title: "Hydration-Score",
    detail: "13 % höher als letzte Woche – Werte bleiben stabil.",
  },
  {
    title: "Profilfokus",
    detail: "Sportprofil priorisiert Magnesium & Natrium für Regeneration.",
  },
  {
    title: "Trend",
    detail: "Meist gescannte Quelle: lokale Mineralbrunnen.",
  },
];

const resources = [
  {
    title: "Profilwissen",
    description: "Checkliste für Schwangerschaft, Babys und Performance.",
    href: "/onboarding",
  },
  {
    title: "Verlauf & Datenexport",
    description: "Nutze deine Analysen für Arzttermine oder Tracking.",
    href: "/history",
  },
];

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  show: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay },
  }),
};

export default function HomePage() {
  const [profile, setProfile] = useState<ProfileType>("standard");

  const actionCards = [
    {
      id: "scan",
      title: "Scan starten",
      description: "OCR + Barcode mit direkter Bewertung.",
      href: { pathname: "/scan", query: { profile } },
      variant: "primary" as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      ),
    },
    {
      id: "history",
      title: "Verlauf öffnen",
      description: "Vergleiche Messungen und Scores.",
      href: "/history",
      variant: "secondary" as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: "learn",
      title: "Guides & Profilwissen",
      description: "Onboarding mit Praxis-Tipps.",
      href: "/onboarding",
      variant: "secondary" as const,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
    },
  ];

  return (
    <main className="relative min-h-screen bg-md-background dark:bg-md-dark-background text-md-onBackground dark:text-md-dark-onBackground">
      <div className="absolute inset-0 bg-surface-gradient" />
      <div className="absolute inset-0 grid-overlay" />
      <div className="relative mx-auto w-full max-w-2xl px-4 pt-6 pb-[calc(var(--bottom-nav-height)+32px)] safe-area-top">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex flex-col gap-6"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="section-heading">Beta Lab</p>
              <h1 className="font-display text-4xl tracking-tight text-md-onSurface dark:text-md-dark-onSurface">
                Trinkwasser-Check
              </h1>
              <p className="mt-2 text-sm text-md-onSurface-variant dark:text-md-dark-onSurface-variant">
                KI-gestützte Analyse von Etiketten & Barcodes
              </p>
            </div>
            <ThemeToggle />
          </div>

          <motion.section
            className="relative overflow-hidden rounded-3xl border border-white/30 dark:border-white/10 bg-gradient-to-br from-md-primary to-md-secondary text-white p-6 shadow-elevation-4"
            variants={sectionVariants}
            initial="hidden"
            animate="show"
            custom={0.1}
          >
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.5),_transparent_55%)]" />
            <div className="relative">
              <p className="text-xs uppercase tracking-[0.3em] text-white/70 mb-3">Sofort-Analyse</p>
              <h2 className="text-2xl font-semibold leading-tight">Wasserqualität im Fokus</h2>
              <p className="mt-2 text-sm text-white/80">
                Individuelle Bewertung nach deinem Profil – inklusive Alerts und Best-Practice.
              </p>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {heroStats.map((stat) => (
                  <div key={stat.label} className="rounded-2xl bg-white/10 p-3 backdrop-blur">
                    <div className="flex items-center gap-2 text-white/80 text-xs uppercase tracking-wide">
                      {stat.icon}
                      <span>{stat.label}</span>
                    </div>
                    <p className="mt-1 text-lg font-semibold">{stat.value}</p>
                    <p className="text-xs text-white/80">{stat.meta}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.section>
        </motion.header>

        <motion.section
          className="mb-8 space-y-4"
          variants={sectionVariants}
          initial="hidden"
          animate="show"
          custom={0.2}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="section-heading">Profilsteuerung</p>
              <h2 className="text-lg font-semibold text-md-onSurface dark:text-md-dark-onSurface">Dein Fokus</h2>
            </div>
            <span className="rounded-full bg-md-surface-containerHigh/80 dark:bg-md-dark-surface-containerHigh/60 px-4 py-1 text-xs font-medium">
              {profile}
            </span>
          </div>
          <ProfileSelector value={profile} onChange={setProfile} />
        </motion.section>

        <motion.section
          className="mb-8 grid gap-4 sm:grid-cols-2"
          variants={sectionVariants}
          initial="hidden"
          animate="show"
          custom={0.3}
        >
          {actionCards.map((card) => (
            <Link
              key={card.id}
              href={card.href}
              onClick={() => hapticLight()}
              className="block"
            >
              <motion.div
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.01 }}
                className={clsx(
                  "h-full rounded-3xl p-5 transition-all",
                  card.variant === "primary"
                    ? "bg-gradient-to-br from-md-primary-container to-md-secondary-container shadow-elevation-3 text-md-onPrimary-container dark:text-md-dark-onPrimary-container"
                    : "glass-card text-md-onSurface dark:text-md-dark-onSurface"
                )}
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div
                    className={clsx(
                      "rounded-2xl bg-white/30 p-3 text-white",
                      card.variant === "secondary" && "bg-md-surface-containerHigh dark:bg-md-dark-surface-containerHigh text-md-primary dark:text-md-dark-primary"
                    )}
                  >
                    {card.icon}
                  </div>
                  <svg className="w-5 h-5 text-current opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold">{card.title}</h3>
                <p className="mt-2 text-sm opacity-80">{card.description}</p>
              </motion.div>
            </Link>
          ))}
        </motion.section>

        <motion.section
          className="mb-8 glass-card p-5 space-y-4"
          variants={sectionVariants}
          initial="hidden"
          animate="show"
          custom={0.35}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="section-heading">Insights</p>
              <h2 className="text-lg font-semibold text-md-onSurface dark:text-md-dark-onSurface">Aktuelle Empfehlungen</h2>
            </div>
            <Link
              href="/history"
              className="text-xs font-semibold text-md-primary dark:text-md-dark-primary"
              onClick={() => hapticLight()}
            >
              Verlauf öffnen
            </Link>
          </div>
          <div className="space-y-3">
            {insights.map((insight) => (
              <div key={insight.title} className="flex items-start gap-3 rounded-2xl bg-md-surface-containerLow/80 dark:bg-md-dark-surface-containerLow/70 p-3">
                <span className="mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full bg-md-primary/15 text-md-primary dark:bg-md-dark-primary/20 dark:text-md-dark-primary">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                <div>
                  <p className="text-sm font-semibold text-md-onSurface dark:text-md-dark-onSurface">{insight.title}</p>
                  <p className="text-sm text-md-onSurface-variant dark:text-md-dark-onSurface-variant">{insight.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        <motion.section
          className="space-y-4 pb-12"
          variants={sectionVariants}
          initial="hidden"
          animate="show"
          custom={0.4}
        >
          <p className="section-heading">Mehr entdecken</p>
          {resources.map((resource) => (
            <Link
              key={resource.title}
              href={resource.href}
              className="block"
              onClick={() => hapticLight()}
            >
              <motion.div
                whileTap={{ scale: 0.98 }}
                className="glass-card p-4 flex items-center justify-between gap-4"
              >
                <div>
                  <h3 className="text-base font-semibold text-md-onSurface dark:text-md-dark-onSurface">
                    {resource.title}
                  </h3>
                  <p className="text-sm text-md-onSurface-variant dark:text-md-dark-onSurface-variant">
                    {resource.description}
                  </p>
                </div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-md-surface-containerHigh dark:bg-md-dark-surface-containerHigh text-md-primary dark:text-md-dark-primary">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </motion.div>
            </Link>
          ))}
        </motion.section>
      </div>
    </main>
  );
}
