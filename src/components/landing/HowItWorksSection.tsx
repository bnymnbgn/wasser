"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import {
  Camera,
  Sparkles,
  BarChart3,
  Check,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Camera,
    title: "Etikett scannen",
    description:
      "Fotografiere das Etikett deiner Wasserflasche oder gib die Werte manuell ein. Unsere OCR erkennt automatisch alle relevanten Daten.",
    color: "from-blue-500 to-cyan-500",
    image: "📸",
  },
  {
    number: "02",
    icon: Sparkles,
    title: "KI analysiert",
    description:
      "Unsere intelligente Engine verarbeitet alle Mineralwerte und vergleicht sie mit wissenschaftlichen Standards für dein gewähltes Profil.",
    color: "from-purple-500 to-pink-500",
    image: "🤖",
  },
  {
    number: "03",
    icon: BarChart3,
    title: "Ergebnis erhalten",
    description:
      "Erhalte einen detaillierten Score von 0-100 plus Erklärungen zu jedem Wert. Verstehe auf einen Blick, wie gut dein Wasser ist.",
    color: "from-emerald-500 to-teal-500",
    image: "📊",
  },
];

export function HowItWorksSection() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section
      ref={ref}
      className="relative py-24 md:py-32 bg-slate-900 overflow-hidden"
    >
      {/* Animated background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0"
          animate={{
            backgroundPosition: ["0% 0%", "100% 100%"],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          style={{
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
                             radial-gradient(circle at 80% 50%, rgba(16, 185, 129, 0.15) 0%, transparent 50%)`,
            backgroundSize: "200% 200%",
          }}
        />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-400/30 backdrop-blur-sm mb-6"
          >
            <Sparkles className="w-4 h-4 text-blue-300" />
            <span className="text-sm font-semibold text-blue-200">
              So einfach geht's
            </span>
          </motion.div>

          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            In 3 einfachen Schritten
            <br />
            <span className="bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              zum perfekten Wasser
            </span>
          </h2>

          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Keine komplizierten Einstellungen. Keine Registrierung. Einfach
            scannen und verstehen.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="space-y-12 lg:space-y-24">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              onMouseEnter={() => setActiveStep(index)}
              className={`flex flex-col ${
                index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
              } items-center gap-12 lg:gap-16`}
            >
              {/* Content */}
              <div className="flex-1 text-center lg:text-left">
                {/* Step number */}
                <motion.div
                  initial={{ scale: 0 }}
                  animate={isInView ? { scale: 1 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.2 + 0.2 }}
                  className="inline-block"
                >
                  <div className="text-8xl font-bold bg-gradient-to-br from-white/10 to-white/5 bg-clip-text text-transparent mb-4">
                    {step.number}
                  </div>
                </motion.div>

                {/* Icon */}
                <motion.div
                  className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${step.color} mb-6 shadow-2xl`}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <step.icon className="w-8 h-8 text-white" />
                </motion.div>

                {/* Title */}
                <h3 className="text-3xl md:text-4xl font-bold text-white mb-4">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-lg text-slate-300 leading-relaxed mb-6 max-w-xl mx-auto lg:mx-0">
                  {step.description}
                </p>

                {/* Checkmarks */}
                <div className="space-y-3">
                  {[
                    "Schnell & einfach",
                    "Keine technischen Kenntnisse nötig",
                    "Funktioniert offline",
                  ].map((feature, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={isInView ? { opacity: 1, x: 0 } : {}}
                      transition={{ delay: index * 0.2 + 0.4 + i * 0.1 }}
                      className="flex items-center gap-3 justify-center lg:justify-start"
                    >
                      <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                        <Check className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span className="text-slate-300">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Visual representation */}
              <motion.div
                className="flex-1 relative"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <div className="relative w-full max-w-md mx-auto aspect-square">
                  {/* Glow effect */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-br ${step.color} rounded-[3rem] blur-3xl opacity-30`}
                    animate={{
                      scale: activeStep === index ? [1, 1.2, 1] : 1,
                      opacity: activeStep === index ? [0.3, 0.5, 0.3] : 0.3,
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />

                  {/* Card */}
                  <motion.div
                    className="relative w-full h-full rounded-[3rem] bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 shadow-2xl overflow-hidden"
                    whileHover={{ rotateY: 5, rotateX: 5 }}
                  >
                    {/* Inner glow */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-10`}
                    />

                    {/* Content */}
                    <div className="relative h-full flex items-center justify-center p-8">
                      <motion.div
                        className="text-9xl"
                        animate={{
                          scale: activeStep === index ? [1, 1.1, 1] : 1,
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        {step.image}
                      </motion.div>
                    </div>

                    {/* Animated border */}
                    <motion.div
                      className={`absolute inset-0 rounded-[3rem] bg-gradient-to-br ${step.color}`}
                      style={{
                        padding: "2px",
                        WebkitMask:
                          "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                        WebkitMaskComposite: "xor",
                        maskComposite: "exclude",
                      }}
                      animate={{
                        opacity: activeStep === index ? [0.3, 0.6, 0.3] : 0.2,
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    />
                  </motion.div>
                </div>
              </motion.div>

              {/* Arrow for non-last items */}
              {index < steps.length - 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={isInView ? { opacity: 1 } : {}}
                  transition={{ delay: index * 0.2 + 0.6 }}
                  className="absolute left-1/2 -translate-x-1/2 hidden lg:block"
                  style={{ top: `${(index + 1) * 33.33}%` }}
                >
                  <motion.div
                    animate={{ y: [0, 10, 0] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    <ArrowRight className="w-8 h-8 text-slate-600 rotate-90" />
                  </motion.div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* CTA at bottom */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 1 }}
          className="text-center mt-20"
        >
          <a href="/dashboard">
            <motion.button
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full font-bold text-lg text-white shadow-2xl shadow-blue-500/50 overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 flex items-center gap-2">
                Jetzt ausprobieren
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-blue-500"
                initial={{ x: "100%" }}
                whileHover={{ x: 0 }}
                transition={{ duration: 0.3 }}
              />
            </motion.button>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
