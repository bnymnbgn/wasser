"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ProfileOnboardingTabs } from "@/src/components/ProfileOnboardingTabs";
import { hapticLight } from "@/lib/capacitor";
import { PersonasCarousel } from "@/src/components/onboarding/PersonasCarousel";

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-md-background dark:bg-md-dark-background text-md-onBackground dark:text-md-dark-onBackground">
      <div className="mx-auto max-w-4xl px-4 py-6 safe-area-top space-y-8">
        <motion.header
          className="flex flex-col gap-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md-md bg-md-secondary-container dark:bg-md-dark-secondary-container text-md-onSecondary-container dark:text-md-dark-onSecondary-container text-xs font-semibold uppercase tracking-wider">
              Wasser Academy
            </span>
            <h1 className="mt-3 text-3xl font-bold text-md-onSurface dark:text-md-dark-onSurface">
              Wissen, warum dein Wasser passt
            </h1>
            <p className="mt-2 text-sm text-md-onSurface-variant dark:text-md-dark-onSurface-variant">
              Praxisnahe Guides für Eltern, Sportler und Gesundheitsbewusste. Die Profile zeigen dir, welcher Mineralfokus wirklich zählt.
            </p>
          </div>
          <PersonasCarousel />
          <div className="flex flex-wrap gap-3">
            <Link href="/" onClick={() => hapticLight()}>
              <motion.button
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md-lg bg-white shadow-elevation-1 text-sm font-medium hover:-translate-y-0.5 transition"
                whileTap={{ scale: 0.95 }}
              >
                ⬅ Zur Startseite
              </motion.button>
            </Link>
            <Link href="/scan" onClick={() => hapticLight()}>
              <motion.button
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md-lg bg-md-primary text-white text-sm font-semibold shadow-elevation-2 hover:-translate-y-0.5 transition"
                whileTap={{ scale: 0.95 }}
              >
                🚀 Scan starten
              </motion.button>
            </Link>
          </div>
        </motion.header>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <ProfileOnboardingTabs />
        </motion.div>
      </div>
    </main>
  );
}
