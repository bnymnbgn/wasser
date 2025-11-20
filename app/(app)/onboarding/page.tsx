"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ProfileOnboardingTabs } from "@/src/components/ProfileOnboardingTabs";
import { hapticLight } from "@/lib/capacitor";
import { PersonasCarousel } from "@/src/components/onboarding/PersonasCarousel";

export default function OnboardingPage() {
  return (
    <main className="relative min-h-screen bg-ocean-background text-ocean-primary">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-0 h-72 w-72 rounded-full ocean-primary/15 blur-[140px]" />
        <div className="absolute bottom-10 right-0 h-80 w-80 rounded-full ocean-accent/10 blur-[160px]" />
      </div>
      <div className="relative z-10 mx-auto max-w-4xl px-4 py-8 safe-area-top space-y-8">
        <motion.header
          className="flex flex-col gap-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-ocean-border ocean-panel px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.4em] text-ocean-secondary">
              Wasser Academy
            </span>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-ocean-primary">
              Wissen, warum dein Wasser passt
            </h1>
            <p className="mt-2 text-sm text-ocean-secondary">
              Praxisnahe Guides für Eltern, Sportler und Gesundheitsbewusste. Die Profile zeigen dir, welcher Mineralfokus wirklich zählt.
            </p>
          </div>
          <div className="ocean-panel">
            <PersonasCarousel />
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/" onClick={() => hapticLight()}>
              <motion.button
                className="inline-flex items-center gap-2 rounded-full border border-ocean-border ocean-panel px-4 py-2 text-sm font-medium text-ocean-primary transition hover:border-ocean-border-strong"
                whileTap={{ scale: 0.95 }}
              >
                ⬅ Zur Startseite
              </motion.button>
            </Link>
            <Link href="/scan" onClick={() => hapticLight()}>
              <motion.button
                className="inline-flex items-center gap-2 rounded-full ocean-button px-5 py-2 text-sm font-semibold"
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
          className="ocean-panel p-4 sm:p-6"
        >
          <ProfileOnboardingTabs />
        </motion.div>
      </div>
    </main>
  );
}
