"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ProfileOnboardingTabs } from "@/src/components/ProfileOnboardingTabs";
import { hapticLight } from "@/lib/capacitor";
import { PersonasCarousel } from "@/src/components/onboarding/PersonasCarousel";

export default function OnboardingPage() {
  return (
    <main className="relative min-h-screen text-ocean-primary">
      {/* Background handled by LivingBackground globally */}

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
            <h1 className="mt-3 text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-ocean-primary via-white to-ocean-accent">
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
