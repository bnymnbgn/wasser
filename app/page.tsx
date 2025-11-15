"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ProfileSelector } from "@/src/components/ProfileSelector";
import ThemeToggle from "@/components/ThemeToggle";
import type { ProfileType } from "@/src/domain/types";
import { hapticLight } from "@/lib/capacitor";

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const [profile, setProfile] = useState<ProfileType>("standard");

  return (
    <main className="min-h-screen bg-md-background dark:bg-md-dark-background text-md-onBackground dark:text-md-dark-onBackground">
      <div className="mx-auto max-w-2xl px-4 py-6 safe-area-top">
        {/* Header with Theme Toggle */}
        <motion.header
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-md-primary to-md-secondary dark:from-md-dark-primary dark:to-md-dark-secondary bg-clip-text text-transparent">
                Trinkwasser-Check
              </h1>
              <p className="mt-2 text-sm text-md-onSurface-variant dark:text-md-dark-onSurface-variant">
                Wasserqualität intelligent bewerten
              </p>
            </div>
            <ThemeToggle />
          </div>
        </motion.header>

        {/* Profile Selector */}
        <motion.section
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-base font-semibold mb-3 text-md-onSurface dark:text-md-dark-onSurface">
            Dein Profil
          </h2>
          <ProfileSelector value={profile} onChange={setProfile} />
        </motion.section>

        {/* Action Cards */}
        <motion.section
          className="grid gap-3 mb-6"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {/* Scan Card - Primary Action */}
          <motion.div variants={item}>
            <Link
              href={{ pathname: "/scan", query: { profile } }}
              onClick={() => hapticLight()}
              className="block"
            >
              <motion.div
                className="md-card p-5 min-h-touch bg-gradient-to-br from-md-primary-container to-md-secondary-container/50 dark:from-md-dark-primary-container dark:to-md-dark-secondary-container/50 border-md-primary/20 dark:border-md-dark-primary/30"
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-md-md bg-md-primary dark:bg-md-dark-primary flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold mb-1 text-md-onPrimary-container dark:text-md-dark-onPrimary-container">
                      Scan starten
                    </h3>
                    <p className="text-sm text-md-onPrimary-container/80 dark:text-md-dark-onPrimary-container/80">
                      Etikett scannen oder Barcode eingeben
                    </p>
                  </div>
                  <svg className="w-6 h-6 text-md-primary dark:text-md-dark-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </motion.div>
            </Link>
          </motion.div>

          {/* Secondary Actions Grid */}
          <div className="grid grid-cols-2 gap-3">
            <motion.div variants={item}>
              <Link
                href="/history"
                onClick={() => hapticLight()}
                className="block"
              >
                <motion.div
                  className="md-card p-4 min-h-[120px] flex flex-col justify-between"
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="w-10 h-10 rounded-md-md bg-md-surface-containerHigh dark:bg-md-dark-surface-containerHigh flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-md-primary dark:text-md-dark-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-1 text-md-onSurface dark:text-md-dark-onSurface">
                      Verlauf
                    </h3>
                    <p className="text-xs text-md-onSurface-variant dark:text-md-dark-onSurface-variant">
                      Frühere Scans
                    </p>
                  </div>
                </motion.div>
              </Link>
            </motion.div>

            <motion.div variants={item}>
              <Link
                href="/onboarding"
                onClick={() => hapticLight()}
                className="block"
              >
                <motion.div
                  className="md-card p-4 min-h-[120px] flex flex-col justify-between"
                  whileTap={{ scale: 0.98 }}
                  whileHover={{ scale: 1.02 }}
                >
                  <div className="w-10 h-10 rounded-md-md bg-md-surface-containerHigh dark:bg-md-dark-surface-containerHigh flex items-center justify-center mb-3">
                    <svg className="w-5 h-5 text-md-primary dark:text-md-dark-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-1 text-md-onSurface dark:text-md-dark-onSurface">
                      Lernen
                    </h3>
                    <p className="text-xs text-md-onSurface-variant dark:text-md-dark-onSurface-variant">
                      Profil-Guide
                    </p>
                  </div>
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {/* Info Card */}
        <motion.div
          className="md-card p-4 mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-md-primary dark:text-md-dark-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-xs text-md-onSurface-variant dark:text-md-dark-onSurface-variant leading-relaxed">
              Diese App ersetzt keine medizinische Beratung. Die Bewertungen basieren auf typischen Richtbereichen und dienen als Orientierung.
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}