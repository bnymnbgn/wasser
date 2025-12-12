"use client";

import Link from "next/link";
import { Settings, BookOpen, ChevronRight } from "lucide-react";
import { hapticLight } from "@/lib/capacitor";

export default function ProfileHubPage() {
  return (
    <main className="min-h-screen pb-24 max-w-3xl mx-auto">
      {/* Simple Header */}
      <header className="px-4 py-4 border-b border-slate-100 dark:border-slate-800">
        <h1 className="text-lg font-semibold text-ocean-primary">Profil</h1>
      </header>

      {/* Flat List Items */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        <Link
          href="/settings"
          onClick={() => hapticLight()}
          className="flex items-center gap-4 px-4 py-4 active:bg-sky-500/10"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500 text-white">
            <Settings className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-ocean-primary">Einstellungen</p>
            <p className="text-xs text-ocean-secondary">Profil, Körperdaten, Erinnerungen</p>
          </div>
          <ChevronRight className="w-5 h-5 text-ocean-tertiary" />
        </Link>

        <Link
          href="/onboarding"
          onClick={() => hapticLight()}
          className="flex items-center gap-4 px-4 py-4 active:bg-sky-500/10"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500 text-white">
            <BookOpen className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-ocean-primary">Lernen / Onboarding</p>
            <p className="text-xs text-ocean-secondary">Profile, Mineralien, Quiz</p>
          </div>
          <ChevronRight className="w-5 h-5 text-ocean-tertiary" />
        </Link>
      </div>
    </main>
  );
}
