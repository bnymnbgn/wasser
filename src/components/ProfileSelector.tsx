"use client";

import { motion } from "framer-motion";
import clsx from "clsx";
import { PROFILE_CHEATSHEET, type ProfileId } from "@/src/domain/profileCheatsheet";
import type { ProfileType } from "@/src/domain/types";
import { hapticLight } from "@/lib/capacitor";

const PROFILE_ORDER: ProfileId[] = ["standard", "baby", "sport", "blood_pressure"];

// Icons für Profile
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
};

interface Props {
  value: ProfileType;
  onChange: (p: ProfileType) => void;
}

export function ProfileSelector({ value, onChange }: Props) {
  const handleChange = async (id: ProfileType) => {
    await hapticLight();
    onChange(id);
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {PROFILE_ORDER.map((id) => {
        const profile = PROFILE_CHEATSHEET[id];
        const isActive = value === id;

        return (
          <motion.button
            key={id}
            type="button"
            onClick={() => handleChange(id as ProfileType)}
            className={clsx(
              "relative flex flex-col items-start rounded-md-lg p-3 text-left transition-all touch-manipulation",
              "min-h-touch focus:outline-none focus:ring-2 focus:ring-offset-2",
              isActive
                ? "bg-md-primary dark:bg-md-dark-primary text-white shadow-elevation-2 focus:ring-md-primary dark:focus:ring-md-dark-primary"
                : "md-card focus:ring-md-primary/50 dark:focus:ring-md-dark-primary/50"
            )}
            whileTap={{ scale: 0.97 }}
            aria-pressed={isActive}
          >
            {/* Icon */}
            <div className={clsx(
              "mb-2 p-1.5 rounded-md-md",
              isActive
                ? "bg-white/20"
                : "bg-md-surface-containerHigh dark:bg-md-dark-surface-containerHigh text-md-primary dark:text-md-dark-primary"
            )}>
              {PROFILE_ICONS[id]}
            </div>

            {/* Label */}
            <span className={clsx(
              "text-sm font-semibold mb-1 line-clamp-1",
              isActive
                ? "text-white"
                : "text-md-onSurface dark:text-md-dark-onSurface"
            )}>
              {profile.label}
            </span>

            {/* Short description */}
            <p className={clsx(
              "text-xs line-clamp-2 leading-relaxed",
              isActive
                ? "text-white/90"
                : "text-md-onSurface-variant dark:text-md-dark-onSurface-variant"
            )}>
              {profile.shortDescription}
            </p>

            {/* Active indicator */}
            {isActive && (
              <motion.div
                layoutId="activeProfile"
                className="absolute inset-0 rounded-md-lg border-2 border-white/30"
                initial={false}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30,
                }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
