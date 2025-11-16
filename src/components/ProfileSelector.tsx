"use client";

import { motion } from "framer-motion";
import clsx from "clsx";
import { PROFILE_CHEATSHEET, type ProfileId } from "@/src/domain/profileCheatsheet";
import type { ProfileType } from "@/src/domain/types";
import { hapticLight } from "@/lib/capacitor";
import { User, Baby, Zap, Heart } from "lucide-react";

const PROFILE_ORDER: ProfileId[] = ["standard", "baby", "sport", "blood_pressure"];

const PROFILE_PRESENTATION: Record<
  ProfileId,
  {
    icon: React.ReactNode;
    gradientFrom: string;
    gradientTo: string;
    color: string;
    badge?: string;
  }
> = {
  standard: {
    icon: <User className="w-6 h-6" />,
    gradientFrom: "#3b82f6", // blue-500
    gradientTo: "#06b6d4", // cyan-500
    color: "bg-blue-500",
    badge: "Allgemein",
  },
  baby: {
    icon: <Baby className="w-6 h-6" />,
    gradientFrom: "#ec4899", // pink-500
    gradientTo: "#f43f5e", // rose-500
    color: "bg-pink-500",
    badge: "Schonend",
  },
  sport: {
    icon: <Zap className="w-6 h-6" />,
    gradientFrom: "#f97316", // orange-500
    gradientTo: "#f59e0b", // amber-500
    color: "bg-orange-500",
    badge: "Mineralreich",
  },
  blood_pressure: {
    icon: <Heart className="w-6 h-6" />,
    gradientFrom: "#ef4444", // red-500
    gradientTo: "#ec4899", // pink-500
    color: "bg-red-500",
    badge: "Natriumarm",
  },
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
    <div
      className="grid grid-cols-2 gap-3 sm:grid-cols-4"
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
            onClick={() => handleChange(id as ProfileType)}
            whileTap={{ scale: 0.95 }}
            className={clsx(
              "relative flex flex-col items-center gap-3 rounded-2xl p-4 min-h-touch",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 transition-all",
              isActive
                ? "shadow-elevation-3 text-white focus-visible:ring-white/50"
                : "bg-md-surface-container dark:bg-md-dark-surface-container focus-visible:ring-md-primary/50"
            )}
            style={isActive ? {
              backgroundImage: `linear-gradient(135deg, ${presentation.gradientFrom} 0%, ${presentation.gradientTo} 100%)`,
            } : undefined}
          >
            {/* Icon Circle */}
            <div
              className={clsx(
                "flex items-center justify-center rounded-full w-16 h-16 transition-all",
                isActive
                  ? "bg-white/20 text-white scale-110"
                  : `${presentation.color} text-white`
              )}
            >
              {presentation.icon}
            </div>

            {/* Label */}
            <div className="flex flex-col items-center gap-1 text-center">
              <span
                className={clsx(
                  "text-sm font-semibold line-clamp-1",
                  isActive
                    ? "text-white"
                    : "text-md-onSurface dark:text-md-dark-onSurface"
                )}
              >
                {profile.label}
              </span>

              {/* Badge */}
              {presentation.badge && (
                <span
                  className={clsx(
                    "text-xs px-2 py-0.5 rounded-full font-medium",
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-md-surface-containerHigh dark:bg-md-dark-surface-containerHigh text-md-onSurface-variant dark:text-md-dark-onSurface-variant"
                  )}
                >
                  {presentation.badge}
                </span>
              )}
            </div>

            {/* Active Indicator */}
            {isActive && (
              <motion.div
                layoutId="activeProfileIndicator"
                className="absolute inset-0 rounded-2xl ring-2 ring-white/30"
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
