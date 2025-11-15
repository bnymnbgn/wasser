"use client";

import clsx from "clsx";
import { motion } from "framer-motion";
import { PROFILE_CHEATSHEET, type ProfileId } from "@/src/domain/profileCheatsheet";
import type { ProfileType } from "@/src/domain/types";

const PROFILE_ORDER: ProfileId[] = ["standard", "baby", "sport", "blood_pressure"];

const PROFILE_PRESENTATION: Record<
  ProfileId,
  { accent: string; iconBg: string; icon: JSX.Element; focusColor: string }
> = {
  standard: {
    accent: "from-md-primary/15 via-transparent to-md-secondary/10",
    iconBg: "bg-md-primary/15 text-md-primary",
    focusColor: "text-md-primary dark:text-md-dark-primary",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c2.21 0 4-1.79 4-4m0 0a4 4 0 11-8 0m8 0v4a2 2 0 002 2h2m0 0a2 2 0 012 2v6a2 2 0 01-2 2h-2m0 0a2 2 0 01-2 2H8a2 2 0 01-2-2m0 0H4a2 2 0 01-2-2v-6a2 2 0 012-2h2" />
      </svg>
    ),
  },
  baby: {
    accent: "from-pink-200/40 via-transparent to-md-secondary/10",
    iconBg: "bg-pink-200/40 text-pink-500",
    focusColor: "text-pink-500",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.5 20a4.5 4.5 0 009 0m1-8a5.5 5.5 0 00-11 0v1h11z" />
      </svg>
    ),
  },
  sport: {
    accent: "from-orange-300/40 via-transparent to-md-primary/10",
    iconBg: "bg-orange-200/40 text-orange-500",
    focusColor: "text-orange-500",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9l-6 6-3-3-5 5" />
      </svg>
    ),
  },
  blood_pressure: {
    accent: "from-red-200/40 via-transparent to-md-primary/5",
    iconBg: "bg-red-200/40 text-red-500",
    focusColor: "text-red-500",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
};

interface Props {
  value: ProfileType;
  onChange: (p: ProfileType) => void;
}

export function ProfileSelector({ value, onChange }: Props) {
  return (
    <div
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
      role="radiogroup"
      aria-label="Profil auswählen"
    >
      {PROFILE_ORDER.map((id) => {
        const profile = PROFILE_CHEATSHEET[id];
        const isActive = value === id;
        const presentation = PROFILE_PRESENTATION[id];

        return (
          <motion.button
            key={id}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => onChange(id as ProfileType)}
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.01 }}
            transition={{ type: "spring", stiffness: 320, damping: 20 }}
            className={clsx(
              "relative flex flex-col gap-2 rounded-2xl border p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-md-primary/60 overflow-hidden",
              isActive
                ? "border-transparent bg-gradient-to-br from-md-primary-container to-md-secondary-container shadow-elevation-3"
                : "border-md-surface-containerHigh/30 dark:border-md-dark-surface-containerHigh/30 bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl"
            )}
          >
            <div
              className={clsx(
                "absolute inset-0 opacity-0 transition-opacity pointer-events-none",
                isActive && "opacity-70",
                `bg-gradient-to-br ${presentation.accent}`
              )}
            />
            <div className="relative flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-md-onSurface-variant dark:text-md-dark-onSurface-variant">
                  {profile.whenToUse}
                </p>
                <span className="text-base font-semibold text-md-onSurface dark:text-md-dark-onSurface">
                  {profile.label}
                </span>
              </div>
              <span
                className={clsx(
                  "rounded-2xl p-2 shadow-sm",
                  presentation.iconBg
                )}
              >
                {presentation.icon}
              </span>
            </div>
            <p className="relative text-sm text-md-onSurface-variant dark:text-md-dark-onSurface-variant line-clamp-2">
              {profile.shortDescription}
            </p>
            {profile.scoringFocus && profile.scoringFocus.length > 0 && (
              <p
                className={clsx(
                  "relative text-xs font-medium",
                  presentation.focusColor
                )}
              >
                {profile.scoringFocus[0]}
              </p>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
