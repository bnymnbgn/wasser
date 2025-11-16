"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Home,
  ScanLine,
  History,
  BookOpen,
  Droplet,
  TrendingUp,
  Award,
  ChevronRight,
  Info
} from "lucide-react";
import ThemeToggle from "@/src/components/ThemeToggle";
import { ProfileSelector } from "@/src/components/ProfileSelector";
import { StatCard } from "@/src/components/ui/StatCard";
import { RippleButton } from "@/src/components/ui/RippleButton";
import type { ProfileType } from "@/src/domain/types";
import { hapticLight, hapticMedium } from "@/lib/capacitor";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export default function HomePage() {
  const [profile, setProfile] = useState<ProfileType>("standard");

  return (
    <main className="relative min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Background gradients */}
      <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-transparent to-emerald-50 dark:from-blue-950/20 dark:via-transparent dark:to-emerald-950/20 pointer-events-none" />

      <div className="relative mx-auto w-full max-w-2xl px-4 pt-6 pb-[calc(var(--bottom-nav-height)+32px)] safe-area-top">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-start justify-between"
        >
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                Willkommen zurück
              </p>
              <h1 className="text-display text-slate-900 dark:text-slate-100">
                Trinkwasser-Check
              </h1>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                KI-gestützte Wasseranalyse
              </p>
            </motion.div>
          </div>
          <ThemeToggle />
        </motion.header>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {/* Hero CTA */}
          <motion.div variants={itemVariants}>
            <Link href={{ pathname: "/scan", query: { profile } }} onClick={() => hapticMedium()}>
              <motion.div
                className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 p-8 shadow-2xl shadow-blue-500/20 dark:shadow-blue-900/40"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.2),_transparent_60%)]" />
                <div className="relative flex items-center justify-between">
                  <div className="flex-1">
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 mb-3">
                      <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                      <span className="text-xs font-medium text-white">Bereit zum Scannen</span>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">
                      Wasser jetzt scannen
                    </h2>
                    <p className="text-blue-100 text-sm">
                      Etikett fotografieren und sofort analysieren
                    </p>
                  </div>
                  <div className="ml-4">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <ScanLine className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
          </motion.div>

          {/* Stats Grid */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3">
            <StatCard
              icon={Award}
              value="92"
              label="Letzter Score"
              variant="success"
              trend="up"
              trendValue="+5%"
            />
            <StatCard
              icon={Droplet}
              value="12"
              label="Scans gesamt"
              variant="primary"
            />
            <StatCard
              icon={TrendingUp}
              value="78%"
              label="Durchschnitt"
              variant="default"
            />
            <StatCard
              icon={Info}
              value={profile}
              label="Aktives Profil"
              variant="warning"
            />
          </motion.div>

          {/* Profile Selector */}
          <motion.section variants={itemVariants} className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-title text-slate-900 dark:text-slate-100">
                Dein Profil
              </h2>
              <span className="badge-info">
                {profile}
              </span>
            </div>
            <ProfileSelector value={profile} onChange={setProfile} />
          </motion.section>

          {/* Quick Actions */}
          <motion.section variants={itemVariants} className="space-y-3">
            <h2 className="text-title text-slate-900 dark:text-slate-100">
              Schnellzugriff
            </h2>
            <div className="grid gap-3">
              <Link href="/history" onClick={() => hapticLight()}>
                <motion.div
                  className="modern-card p-4 flex items-center justify-between group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                      <History className="w-6 h-6 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        Scan-Verlauf
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Alle deine Analysen
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </motion.div>
              </Link>

              <Link href="/onboarding" onClick={() => hapticLight()}>
                <motion.div
                  className="modern-card p-4 flex items-center justify-between group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/30 transition-colors">
                      <BookOpen className="w-6 h-6 text-slate-600 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        Wissen & Guides
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Lerne über Wasserqualität
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                </motion.div>
              </Link>
            </div>
          </motion.section>

          {/* Insights Section */}
          <motion.section variants={itemVariants} className="modern-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Insights
              </h2>
            </div>
            <div className="space-y-3">
              <div className="flex gap-3 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-800/50">
                <span className="text-2xl">✅</span>
                <div>
                  <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-100">
                    Hydration-Score
                  </p>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">
                    13% höher als letzte Woche – Werte bleiben stabil
                  </p>
                </div>
              </div>
              <div className="flex gap-3 p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-800/50">
                <span className="text-2xl">💡</span>
                <div>
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100">
                    Profil-Tipp
                  </p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    {profile === "sport"
                      ? "Achte auf ausreichend Magnesium & Natrium für optimale Regeneration"
                      : "Wechsle zu Sport-Profil für spezifische Athleten-Empfehlungen"}
                  </p>
                </div>
              </div>
            </div>
          </motion.section>
        </motion.div>
      </div>
    </main>
  );
}
