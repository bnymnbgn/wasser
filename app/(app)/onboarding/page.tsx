"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ProfileOnboardingTabs } from "@/src/components/ProfileOnboardingTabs";
import { hapticLight } from "@/lib/capacitor";
import { PersonasCarousel } from "@/src/components/onboarding/PersonasCarousel";

export default function OnboardingPage() {
  return (
    <main className="relative min-h-screen bg-ocean-dark text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-0 h-72 w-72 rounded-full bg-water-primary/15 blur-[140px]" />
        <div className="absolute bottom-10 right-0 h-80 w-80 rounded-full bg-water-accent/10 blur-[160px]" />
      </div>
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-8 safe-area-top space-y-8">
        <motion.header
          className="flex flex-col gap-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.4em] text-white/80">
              Wasser Academy
            </span>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-white">
              Wissen, warum dein Wasser passt
            </h1>
            <p className="mt-2 text-sm text-white/70">
              Praxisnahe Guides für Eltern, Sportler und Gesundheitsbewusste. Die Profile zeigen dir, welcher Mineralfokus wirklich zählt.
            </p>
          </div>
          <div className="glass-panel">
            <PersonasCarousel />
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/" onClick={() => hapticLight()}>
              <motion.button
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:border-white/40"
                whileTap={{ scale: 0.95 }}
              >
                ⬅ Zur Startseite
              </motion.button>
            </Link>
            <Link href="/scan" onClick={() => hapticLight()}>
              <motion.button
                className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-water-primary to-water-accent px-5 py-2 text-sm font-semibold shadow-glow"
                whileTap={{ scale: 0.95 }}
              >
                🚀 Scan starten
              </motion.button>
            </Link>
          </div>
        </motion.header>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel p-4 sm:p-6"
        >
          <ProfileOnboardingTabs />
        </motion.div>
      </div>
    </main>
  );
}
