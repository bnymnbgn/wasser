"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Star, Quote, Award, Users, TrendingUp, Shield } from "lucide-react";

const testimonials = [
  {
    name: "Sarah M.",
    role: "Mutter von 2 Kindern",
    avatar: "👩",
    rating: 5,
    text: "Endlich weiß ich genau, welches Wasser ich für die Babynahrung verwenden kann. Das Baby-Profil ist Gold wert!",
    highlight: "Baby-Profil",
  },
  {
    name: "Thomas K.",
    role: "Triathlet",
    avatar: "🏃",
    rating: 5,
    text: "Die App zeigt mir genau, welche Mineralien ich nach dem Training brauche. Meine Regeneration hat sich deutlich verbessert!",
    highlight: "Sport-Profil",
  },
  {
    name: "Maria L.",
    role: "Ernährungsberaterin",
    avatar: "👩‍⚕️",
    rating: 5,
    text: "Ich empfehle die App all meinen Klienten. Die wissenschaftlich fundierte Bewertung ist perfekt für Beratungsgespräche.",
    highlight: "Profi-Tool",
  },
  {
    name: "Klaus W.",
    role: "Bluthochdruckpatient",
    avatar: "👨",
    rating: 5,
    text: "Das Blutdruck-Profil warnt mich zuverlässig vor zu natriumreichem Wasser. Meine Werte sind seit Monaten stabil!",
    highlight: "Blutdruck",
  },
  {
    name: "Anna B.",
    role: "Umweltaktivistin",
    avatar: "🌱",
    rating: 5,
    text: "Super, dass die App offline funktioniert und meine Daten privat bleiben. Genau so sollte moderne Software sein!",
    highlight: "Datenschutz",
  },
  {
    name: "Michael R.",
    role: "Software-Engineer",
    avatar: "👨‍💻",
    rating: 5,
    text: "Die OCR-Erkennung ist beeindruckend schnell und präzise. Technisch top umgesetzt!",
    highlight: "Tech",
  },
];

const stats = [
  {
    icon: Users,
    value: "10K+",
    label: "Aktive Nutzer",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: TrendingUp,
    value: "50K+",
    label: "Scans durchgeführt",
    color: "from-emerald-500 to-teal-500",
  },
  {
    icon: Award,
    value: "4.9/5",
    label: "Durchschnittsbewertung",
    color: "from-amber-500 to-orange-500",
  },
  {
    icon: Shield,
    value: "100%",
    label: "Datenschutz garantiert",
    color: "from-purple-500 to-pink-500",
  },
];

export function SocialProofSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section
      ref={ref}
      className="relative py-24 md:py-32 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(59,130,246,0.08),transparent_50%)]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 mb-6"
          >
            <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              Vertraut von Tausenden
            </span>
          </motion.div>

          <h2 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            Das sagen unsere
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              begeisterten Nutzer
            </span>
          </h2>

          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Über 10.000 Menschen vertrauen bereits auf unsere App für ihre
            tägliche Wasserqualität.
          </p>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-20"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
              whileHover={{ scale: 1.05, y: -5 }}
              className="relative group"
            >
              <div className="relative p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300">
                <motion.div
                  className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${stat.color} mb-4 shadow-lg`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <stat.icon className="w-6 h-6 text-white" />
                </motion.div>

                <div className={`text-4xl font-bold bg-gradient-to-br ${stat.color} bg-clip-text text-transparent mb-2`}>
                  {stat.value}
                </div>

                <div className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                  {stat.label}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Testimonials grid */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              variants={{
                hidden: { opacity: 0, y: 30 },
                visible: { opacity: 1, y: 0 },
              }}
              whileHover={{ scale: 1.03, y: -8 }}
              transition={{ duration: 0.3 }}
              className="group relative"
            >
              <div className="relative h-full p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-2xl transition-all duration-300">
                {/* Quote icon */}
                <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Quote className="w-12 h-12 text-blue-600" />
                </div>

                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>

                {/* Text */}
                <p className="text-slate-700 dark:text-slate-300 mb-6 leading-relaxed relative z-10">
                  "{testimonial.text}"
                </p>

                {/* Highlight badge */}
                <div className="inline-flex px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-xs font-semibold text-blue-600 dark:text-blue-400 mb-4">
                  {testimonial.highlight}
                </div>

                {/* Author */}
                <div className="flex items-center gap-3 relative z-10">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center text-2xl shadow-lg">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      {testimonial.role}
                    </div>
                  </div>
                </div>

                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/10 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-20 text-center"
        >
          <p className="text-sm text-slate-500 dark:text-slate-500 uppercase tracking-wider font-semibold mb-6">
            Vertrauenswürdig & Sicher
          </p>

          <div className="flex flex-wrap justify-center items-center gap-8">
            {[
              { icon: "🔒", text: "DSGVO-konform" },
              { icon: "✅", text: "Open Source" },
              { icon: "🇩🇪", text: "Made in Germany" },
              { icon: "📱", text: "Offline-fähig" },
            ].map((badge, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={isInView ? { opacity: 1, scale: 1 } : {}}
                transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <span className="text-2xl">{badge.icon}</span>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {badge.text}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
