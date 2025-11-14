import Link from "next/link";
import { ProfileOnboardingTabs } from "@/src/components/ProfileOnboardingTabs";

export default function OnboardingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-5xl px-4 py-8 md:py-10">
        <header className="mb-8 md:mb-10">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-emerald-400">
            Profil-Guide
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
            Wie bewertet der Trinkwasser-Check dein Wasser?
          </h1>
          <p className="mt-3 max-w-2xl text-sm md:text-base text-slate-300">
            Du kannst unterschiedliche Bewertungsprofile auswählen – zum Beispiel
            für Babys, Sport oder blutdrucksensibles Trinken. Hier siehst du, was
            die Profile bedeuten und welche Werte jeweils besonders ins Gewicht
            fallen.
          </p>

          <div className="mt-4 flex flex-wrap gap-3 text-xs">
            <Link
              href="/"
              className="inline-flex items-center rounded-full border border-slate-700 px-3 py-1 hover:border-slate-500 hover:bg-slate-900"
            >
              Zur Startseite
            </Link>
            <Link
              href="/scan"
              className="inline-flex items-center rounded-full bg-emerald-500 px-3 py-1 font-medium text-black hover:bg-emerald-400"
            >
              Direkt einen Scan starten
            </Link>
          </div>
        </header>

        <ProfileOnboardingTabs />
      </div>
    </main>
  );
}