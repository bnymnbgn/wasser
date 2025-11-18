"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Scan,
  Zap,
  TrendingUp,
  Shield,
  Baby,
  Dumbbell,
  Heart,
  Users,
  BarChart3,
  Lock,
  Smartphone,
  Cloud,
} from "lucide-react";

const features = [
  {
    icon: Scan,
    title: "Blitzschnelle OCR-Erkennung",
    description:
      "Fotografiere das Etikett und unsere KI extrahiert automatisch alle wichtigen Mineralwerte in Sekunden.",
    gradient: "from-blue-500 to-cyan-500",
    delay: 0.1,
  },
  {
    icon: Users,
    title: "4 Spezialprofile",
    description:
      "Ob Baby, Sport, Blutdruck oder Standard – erhalte Bewertungen perfekt abgestimmt auf deine Bedürfnisse.",
    gradient: "from-emerald-500 to-teal-500",
    delay: 0.2,
  },
  {
    icon: BarChart3,
    title: "Detaillierte Analysen",
    description:
      "Verstehe jeden Wert: pH, Calcium, Magnesium, Natrium und mehr – mit klaren Erklärungen und Empfehlungen.",
    gradient: "from-purple-500 to-pink-500",
    delay: 0.3,
  },
  {
    icon: TrendingUp,
    title: "Verlauf & Trends",
    description:
      "Behalte deine Scans im Überblick und erkenne Muster in deinen Wasservorlieben über die Zeit.",
    gradient: "from-orange-500 to-red-500",
    delay: 0.4,
  },
  {
    icon: Shield,
    title: "Datenschutz First",
    description:
      "Deine Daten bleiben privat. Lokale Speicherung und keine Weitergabe an Dritte – garantiert.",
    gradient: "from-indigo-500 to-blue-500",
    delay: 0.5,
  },
  {
    icon: Smartphone,
    title: "Offline-fähig",
    description:
      "Scanne auch ohne Internet. Die App funktioniert vollständig offline auf deinem Gerät.",
    gradient: "from-green-500 to-emerald-500",
    delay: 0.6,
  },
];

const profiles = [
  {
    icon: Baby,
    title: "Baby & Kleinkind",
    description: "Strenge Prüfung auf Nitrat und Natrium",
    color: "from-pink-400 to-rose-400",
  },
  {
    icon: Dumbbell,
    title: "Sport",
    description: "Fokus auf Magnesium und Elektrolyte",
    color: "from-orange-400 to-amber-400",
  },
  {
    icon: Heart,
    title: "Blutdruck",
    description: "Natriumarme Wässer bevorzugt",
    color: "from-red-400 to-rose-400",
  },
  {
    icon: Shield,
    title: "Standard",
    description: "Ausgewogene Bewertung für alle",
    color: "from-blue-400 to-cyan-400",
  },
];

export function FeaturesSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as any,
      },
    },
  };

  return (
    <section
      id="features"
      ref={ref}
      className="relative py-24 md:py-32 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900 overflow-hidden"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.1),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(16,185,129,0.1),transparent_50%)]" />

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
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 mb-6"
          >
            <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
              Features
            </span>
          </motion.div>

          <h2 className="text-5xl md:text-6xl font-bold text-slate-900 dark:text-white mb-6">
            Alles was du brauchst,
            <br />
            <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">
              in einer App
            </span>
          </h2>

          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Von intelligenter Texterkennung bis zu personalisierten Bewertungen
            – deine All-in-One Lösung für Wasserqualität.
          </p>
        </motion.div>

        {/* Features grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20"
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              className="group relative"
            >
              <div className="relative h-full p-8 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-2xl transition-all duration-300">
                {/* Icon with gradient background */}
                <motion.div
                  className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.gradient} mb-6 shadow-lg`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <feature.icon className="w-8 h-8 text-white" />
                </motion.div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {feature.description}
                </p>

                {/* Hover effect glow */}
                <div
                  className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none`}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Profile showcase */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="relative"
        >
          <div className="text-center mb-12">
            <h3 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              Profile für jeden Bedarf
            </h3>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Jedes Profil bewertet Wasser nach wissenschaftlich fundierten Kriterien
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {profiles.map((profile, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                whileHover={{ scale: 1.05, y: -8 }}
                className="group relative"
              >
                <div className="relative p-6 rounded-3xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  {/* Background glow */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${profile.color} opacity-0 group-hover:opacity-20 transition-opacity duration-300`}
                  />

                  {/* Icon */}
                  <motion.div
                    className={`inline-flex p-3 rounded-2xl bg-gradient-to-br ${profile.color} mb-4 shadow-lg relative z-10`}
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <profile.icon className="w-7 h-7 text-white" />
                  </motion.div>

                  {/* Content */}
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white mb-2 relative z-10">
                    {profile.title}
                  </h4>
                  <p className="text-sm text-slate-600 dark:text-slate-400 relative z-10">
                    {profile.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-20 grid grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {[
            { value: "< 3s", label: "Scan-Dauer" },
            { value: "100%", label: "Kostenlos" },
            { value: "7+", label: "Messwerte" },
            { value: "Offline", label: "Funktioniert" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
              className="text-center"
            >
              <div className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                {stat.value}
              </div>
              <div className="text-slate-600 dark:text-slate-400 font-medium">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
