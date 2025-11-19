import { motion } from "framer-motion";

const PERSONAS = [
  {
    title: "🍼 Eltern",
    description: "Finde Wasser, das für Babynahrung sicher ist (Nitrat < 10 mg/L, Natrium extrem niedrig).",
  },
  {
    title: "🏃 Sport & Regeneration",
    description: "Setze auf Magnesium, Natrium und Hydrogencarbonat für schnellere Erholung.",
  },
  {
    title: "❤️ Blutdruck Fokus",
    description: "Niedriges Natrium, höheres Kalium – so entlastet Wasser dein Herz-Kreislauf-System.",
  },
  {
    title: "☕ Kaffee & Genuss",
    description: "Weiche Wasserhärte (< 8°dH) schützt Maschinen und lässt Espresso besser extrahieren.",
  },
];

export function PersonasCarousel() {
  return (
    <div className="swiper flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
      {PERSONAS.map((persona) => (
        <motion.div
          key={persona.title}
          className="snap-start min-w-[220px] rounded-2xl border border-slate-200 bg-white/80 p-4 dark:bg-slate-900/70 dark:border-slate-800 shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">{persona.title}</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-300">{persona.description}</p>
        </motion.div>
      ))}
    </div>
  );
}

