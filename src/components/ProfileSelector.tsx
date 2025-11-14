"use client";

import clsx from "clsx";
import { PROFILE_CHEATSHEET, type ProfileId } from "@/src/domain/profileCheatsheet";
import type { ProfileType } from "@/src/domain/types";

const PROFILE_ORDER: ProfileId[] = ["standard", "baby", "sport", "blood_pressure"];

interface Props {
  value: ProfileType;
  onChange: (p: ProfileType) => void;
}

export function ProfileSelector({ value, onChange }: Props) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      {PROFILE_ORDER.map((id) => {
        const profile = PROFILE_CHEATSHEET[id];
        const isActive = value === id;

        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id as ProfileType)}
            className={clsx(
              "flex flex-col items-start rounded-lg border p-3 text-left text-xs md:text-sm transition focus:outline-none focus:ring-2 focus:ring-emerald-500",
              isActive
                ? "border-emerald-500 bg-emerald-500/10"
                : "border-slate-700/70 bg-slate-900/60 hover:border-slate-500"
            )}
          >
            <span className="mb-1 text-sm font-medium text-slate-50">
              {profile.label}
            </span>

            <p className="text-[11px] text-slate-300 line-clamp-2">
              {profile.shortDescription}
            </p>

            <p className="mt-2 text-[10px] text-slate-400 line-clamp-2">
              {profile.whenToUse}
            </p>

            {/* Optional: ein kurzer Fokus-Punkt */}
            {profile.scoringFocus && profile.scoringFocus.length > 0 && (
              <p className="mt-2 text-[10px] text-emerald-300/90 line-clamp-2">
                • {profile.scoringFocus[0]}
              </p>
            )}
          </button>
        );
      })}
    </div>
  );
}