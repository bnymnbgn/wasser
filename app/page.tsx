"use client";

import { useState } from "react";
import Link from "next/link";
import { ProfileSelector } from "@/src/components/ProfileSelector";
import type { ProfileType } from "@/src/domain/types";

export default function HomePage() {
  const [profile, setProfile] = useState<ProfileType>("standard");

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            Trinkwasser-Check
          </h1>
          <p className="mt-3 text-slate-300">
            Scanne Etiketten oder gib Werte ein und erhalte eine Einschätzung der Wasserqualität.
          </p>
        </header>

        <section className="mb-8">
          <h2 className="text-lg font-medium mb-3">Profil auswählen</h2>
          <ProfileSelector value={profile} onChange={setProfile} />
        </section>

        <section className="grid gap-4 md:grid-cols-2">
          <Link
            href={{ pathname: "/scan", query: { profile } }}
            className="group rounded-xl border border-emerald-500/30 bg-slate-900/60 p-5 hover:border-emerald-400 hover:bg-slate-900 transition"
          >
            <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
              Scan starten
            </h3>
            <p className="text-sm text-slate-300">
              OCR-Text eingeben oder (später) Etikett-Foto hochladen, um dein Wasser zu bewerten.
            </p>
          </Link>

          <Link
            href="/history"
            className="group rounded-xl border border-slate-700/60 bg-slate-900/60 p-5 hover:border-slate-500 hover:bg-slate-900 transition"
          >
            <h3 className="text-lg font-semibold mb-1">Verlauf ansehen</h3>
            <p className="text-sm text-slate-300">
              Frühere Scans vergleichen und Entwicklungen im Blick behalten.
            </p>
          </Link>

          <Link
            href="/onboarding"
            className="group rounded-xl border border-slate-700/60 bg-slate-900/60 p-5 hover:border-slate-500 hover:bg-slate-900 transition md:col-span-2"
          >
            <h3 className="text-lg font-semibold mb-1">Profil-Guide</h3>
            <p className="text-sm text-slate-300">
              Erfahre mehr über die verschiedenen Bewertungsprofile und wie die Bewertung funktioniert.
            </p>
          </Link>
        </section>

        <footer className="mt-12 pt-8 border-t border-slate-800">
          <p className="text-xs text-slate-400 text-center">
            Diese Anwendung ersetzt keine medizinische Beratung. Die Bewertungen orientieren sich an typischen Richtbereichen und dienen als Hilfestellung zur Einordnung von Etiketten.
          </p>
        </footer>
      </div>
    </main>
  );
}