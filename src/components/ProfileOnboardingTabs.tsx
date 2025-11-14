"use client";

import { useState } from "react";
import { PROFILE_CHEATSHEET, type ProfileId } from "@/src/domain/profileCheatsheet";
import clsx from "clsx";

const PROFILE_ORDER: ProfileId[] = ["standard", "baby", "sport", "blood_pressure"];

export function ProfileOnboardingTabs() {
  const [active, setActive] = useState<ProfileId>("standard");

  const activeProfile = PROFILE_CHEATSHEET[active];

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="inline-flex rounded-lg border border-slate-700 bg-slate-900 p-1">
        {PROFILE_ORDER.map((id) => {
          const p = PROFILE_CHEATSHEET[id];
          const isActive = id === active;

          return (
            <button
              key={id}
              type="button"
              onClick={() => setActive(id)}
              className={clsx(
                "px-3 py-1 text-xs md:text-sm font-medium rounded-md transition",
                isActive
                  ? "bg-slate-800 text-slate-50"
                  : "text-slate-300 hover:text-slate-50"
              )}
            >
              {p.label}
            </button>
          );
        })}
      </div>

      {/* Profil-Kurzbeschreibung */}
      <section className="rounded-xl border border-slate-700 bg-slate-900/80 p-4 md:p-5">
        <header className="mb-3">
          <h2 className="text-lg md:text-xl font-semibold tracking-tight">
            {activeProfile.label}
          </h2>
          <p className="mt-2 text-sm text-slate-200">
            {activeProfile.shortDescription}
          </p>
          <p className="mt-2 text-xs text-slate-400">
            {activeProfile.whenToUse}
          </p>
        </header>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {/* Scoring-Fokus */}
          <div className="rounded-lg border border-slate-700/80 bg-slate-950/40 p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-2">
              Was dieses Profil bewertet
            </div>
            <ul className="space-y-1.5 text-xs text-slate-200">
              {activeProfile.scoringFocus.map((item, idx) => (
                <li key={idx} className="flex gap-2">
                  <span className="mt-[4px] h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Hinweisbox */}
          <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-amber-300 mb-2">
              Hinweis
            </div>
            <p className="text-xs text-amber-100">
              Die Bewertungen ersetzen keine medizinische Beratung und orientieren
              sich an typischen Richtbereichen. Sie sollen dir helfen, Etiketten
              besser einzuordnen – nicht, Diagnosen zu stellen.
            </p>
          </div>
        </div>
      </section>

      {/* Metrik-Details */}
      <section className="rounded-xl border border-slate-700 bg-slate-900/80 p-4 md:p-5">
        <h3 className="text-sm md:text-base font-semibold mb-3">
          Welche Werte sind in diesem Profil wichtig?
        </h3>

        <div className="grid gap-3 md:grid-cols-2">
          {activeProfile.metrics.map((metric) => (
            <article
              key={metric.metric}
              className="rounded-lg border border-slate-700/80 bg-slate-950/40 p-3 text-xs"
            >
              <header className="mb-1 flex items-center justify-between gap-2">
                <div>
                  <div className="font-medium text-slate-100">
                    {metric.label}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Schlüssel: <code className="font-mono">{metric.metric}</code>
                  </div>
                </div>
                <span className={importancePillClass(metric.importance)}>
                  {metric.importance === "sehr hoch"
                    ? "Sehr wichtig"
                    : metric.importance === "hoch"
                    ? "Wichtig"
                    : metric.importance === "mittel"
                    ? "Mittel"
                    : "Nebenrolle"}
                </span>
              </header>

              <p className="mt-1 text-[11px] leading-relaxed text-slate-200">
                {metric.explanation}
              </p>

              {metric.hints && metric.hints.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {metric.hints.map((hint, idx) => (
                    <li
                      key={idx}
                      className="flex gap-2 text-[11px] text-slate-300"
                    >
                      <span className="mt-[4px] h-1 w-1 rounded-full bg-slate-500" />
                      <span>{hint}</span>
                    </li>
                  ))}
                </ul>
              )}
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function importancePillClass(importance: string) {
  if (importance === "sehr hoch") {
    return "inline-flex items-center rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-200 border border-emerald-500/60";
  }
  if (importance === "hoch") {
    return "inline-flex items-center rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-semibold text-sky-200 border border-sky-500/50";
  }
  if (importance === "mittel") {
    return "inline-flex items-center rounded-full bg-slate-600/20 px-2 py-0.5 text-[10px] font-semibold text-slate-100 border border-slate-500/60";
  }
  return "inline-flex items-center rounded-full bg-slate-800/60 px-2 py-0.5 text-[10px] font-semibold text-slate-300 border border-slate-700";
}