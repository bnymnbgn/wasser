"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ProfileOnboardingTabs } from "@/src/components/ProfileOnboardingTabs";
import { hapticLight } from "@/lib/capacitor";

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-md-background dark:bg-md-dark-background text-md-onBackground dark:text-md-dark-onBackground">
      <div className="mx-auto max-w-4xl px-4 py-6 safe-area-top">
        <motion.header
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mb-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md-md bg-md-secondary-container dark:bg-md-dark-secondary-container text-md-onSecondary-container dark:text-md-dark-onSecondary-container text-xs font-semibold uppercase tracking-wider">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Profil-Guide
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-md-onSurface dark:text-md-dark-onSurface mb-3">
            Wie bewertet der Trinkwasser-Check dein Wasser?
          </h1>

          <p className="max-w-2xl text-sm md:text-base text-md-onSurface-variant dark:text-md-dark-onSurface-variant leading-relaxed">
            Du kannst unterschiedliche Bewertungsprofile auswählen – zum Beispiel
            für Babys, Sport oder blutdrucksensibles Trinken. Hier siehst du, was
            die Profile bedeuten und welche Werte jeweils besonders ins Gewicht
            fallen.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/"
              onClick={() => hapticLight()}
            >
              <motion.button
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md-lg bg-md-surface-container dark:bg-md-dark-surface-container text-md-onSurface dark:text-md-dark-onSurface text-sm font-medium shadow-elevation-1 touch-manipulation"
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Zur Startseite
              </motion.button>
            </Link>

            <Link
              href="/scan"
              onClick={() => hapticLight()}
            >
              <motion.button
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md-lg bg-md-primary dark:bg-md-dark-primary text-white text-sm font-semibold shadow-elevation-2 touch-manipulation"
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.02 }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                Scan starten
              </motion.button>
            </Link>
          </div>
        </motion.header>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ProfileOnboardingTabs />
        </motion.div>
      </div>
    </main>
  );
}
