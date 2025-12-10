"use client";

import Link from "next/link";
import { Settings, BookOpen, ArrowLeft } from "lucide-react";
import { hapticLight } from "@/lib/capacitor";

export default function ProfileHubPage() {
  return (
    <main className="min-h-screen pb-24 px-4 pt-4 max-w-3xl mx-auto">
      <header className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard"
          className="p-2 -ml-2 text-ocean-secondary hover:text-ocean-primary transition-colors"
          onClick={() => hapticLight()}
        >
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-ocean-tertiary">Profil</p>
          <h1 className="text-2xl font-semibold text-ocean-primary">Deine Einstellungen & Lernen</h1>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/settings"
          onClick={() => hapticLight()}
          className="group rounded-2xl border border-ocean-border bg-ocean-surface p-5 shadow-lg transition hover:border-ocean-primary/40 active:scale-[0.98]"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ocean-primary/15 text-ocean-primary">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ocean-primary">Einstellungen</p>
              <p className="text-xs text-ocean-secondary">Profil, Körperdaten, Startscreen, Erinnerungen</p>
            </div>
          </div>
          <p className="text-sm text-ocean-secondary leading-relaxed">
            Passe Theme, Profil, Hydration-Reminders und lokale Daten an einem Ort an.
          </p>
        </Link>

        <Link
          href="/onboarding"
          onClick={() => hapticLight()}
          className="group rounded-2xl border border-ocean-border bg-ocean-surface p-5 shadow-lg transition hover:border-ocean-primary/40 active:scale-[0.98]"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ocean-accent/15 text-ocean-accent">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ocean-primary">Lernen / Onboarding</p>
              <p className="text-xs text-ocean-secondary">Profile verstehen, Mineralien, Quiz</p>
            </div>
          </div>
          <p className="text-sm text-ocean-secondary leading-relaxed">
            Erkunde Wissenskarten zu Mineralien, Profil-Tipps und dem Onboarding-Wizard, um dein Wasser besser zu bewerten.
          </p>
        </Link>
      </div>
    </main>
  );
}
