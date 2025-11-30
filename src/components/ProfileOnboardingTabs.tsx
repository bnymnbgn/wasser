"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PROFILE_CHEATSHEET, type ProfileId } from "@/src/domain/profileCheatsheet";
import clsx from "clsx";
import { hapticLight } from "@/lib/capacitor";
import { ProfileWeightChart } from "@/src/components/onboarding/ProfileWeightChart";
import { MetricLearningCard } from "@/src/components/ui/MetricLearningCard";

const PROFILE_ORDER: ProfileId[] = ["standard", "baby", "sport", "blood_pressure", "coffee"];

// Profile Icons (same as ProfileSelector)
const PROFILE_ICONS: Record<ProfileId, JSX.Element> = {
  standard: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  baby: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  sport: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  blood_pressure: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  coffee: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 8h1a3 3 0 010 6h-1m-2 5H8a3 3 0 01-3-3V7h13v2M8 3h8M9 3v2M15 3v2" />
    </svg>
  ),
};

export function ProfileOnboardingTabs() {
  const [active, setActive] = useState<ProfileId>("standard");

  const activeProfile = PROFILE_CHEATSHEET[active];

  const handleTabChange = async (id: ProfileId) => {
    await hapticLight();
    setActive(id);
  };

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-md-surface-container dark:bg-md-dark-surface-container rounded-md-lg overflow-x-auto">
        {PROFILE_ORDER.map((id) => {
          const p = PROFILE_CHEATSHEET[id];
          const isActive = id === active;

          return (
            <motion.button
              key={id}
              type="button"
              onClick={() => handleTabChange(id)}
              className={clsx(
                "relative flex items-center gap-2 px-3 py-2 rounded-md-md text-sm font-medium whitespace-nowrap transition-all touch-manipulation",
                isActive
                  ? "text-white"
                  : "text-md-onSurface-variant dark:text-md-dark-onSurface-variant"
              )}
              whileTap={{ scale: 0.97 }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-md-primary dark:bg-md-dark-primary rounded-md-md shadow-elevation-2"
                  initial={false}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              )}
              <span className="relative z-10 flex items-center gap-2">
                {PROFILE_ICONS[id]}
                <span className="hidden sm:inline">{p.label}</span>
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Profile Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="space-y-4"
        >
          {/* Profile Overview Card */}
          <div className="md-card p-4 md:p-5">
            <div className="flex items-start gap-3 mb-4">
              <div className="p-2 rounded-md-md bg-md-primary-container dark:bg-md-dark-primary-container text-md-onPrimary-container dark:text-md-dark-onPrimary-container">
                {PROFILE_ICONS[active]}
              </div>
              <div className="flex-1">
                <h2 className="text-lg md:text-xl font-bold tracking-tight text-md-onSurface dark:text-md-dark-onSurface mb-2">
                  {activeProfile.label}
                </h2>
                <p className="text-sm text-md-onSurface dark:text-md-dark-onSurface leading-relaxed">
                  {activeProfile.shortDescription}
                </p>
                <p className="mt-2 text-xs text-md-onSurface-variant dark:text-md-dark-onSurface-variant leading-relaxed">
                  {activeProfile.whenToUse}
                </p>
              </div>
            </div>

            {/* Scoring Focus & Warning */}
            <div className="grid gap-3 md:grid-cols-2">
              {/* Scoring Focus */}
              <div className="p-3 rounded-md-lg bg-md-surface-containerHigh dark:bg-md-dark-surface-containerHigh">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-md-primary dark:text-md-dark-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-xs font-semibold uppercase tracking-wider text-md-onSurface-variant dark:text-md-dark-onSurface-variant">
                    Bewertungsfokus
                  </div>
                </div>
                <ProfileWeightChart items={activeProfile.scoringFocus as any} />
              </div>

              {/* Warning */}
              <div className="p-3 rounded-md-lg bg-md-warning-container dark:bg-md-dark-warning-container">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-md-onWarning-container dark:text-md-dark-onWarning-container" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="text-xs font-semibold uppercase tracking-wider text-md-onWarning-container dark:text-md-dark-onWarning-container">
                    Wichtig
                  </div>
                </div>
                <p className="text-xs text-md-onWarning-container dark:text-md-dark-onWarning-container leading-relaxed">
                  Die Bewertungen ersetzen keine medizinische Beratung und orientieren
                  sich an typischen Richtbereichen. Sie sollen dir helfen, Etiketten
                  besser einzuordnen – nicht, Diagnosen zu stellen.
                </p>
              </div>
            </div>
          </div>

          {/* Metrics Details */}
          <div className="md-card p-4 md:p-5">
            <h3 className="text-base font-bold mb-4 text-md-onSurface dark:text-md-dark-onSurface flex items-center gap-2">
              <svg className="w-5 h-5 text-md-primary dark:text-md-dark-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Wichtige Werte in diesem Profil
            </h3>

            <div className="grid gap-3 md:grid-cols-2">
              {activeProfile.metrics.map((metric) => (
                <MetricLearningCard key={metric.metric} metric={metric} />
              ))}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

 
