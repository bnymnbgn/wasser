"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { Droplet, Sparkles, Zap, ChevronDown } from "lucide-react";
import Link from "next/link";

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Scroll-based animations
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 150]);
  const y2 = useTransform(scrollY, [0, 500], [0, -100]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);
  const scale = useTransform(scrollY, [0, 300], [1, 0.8]);

  // Smooth spring physics
  const springConfig = { damping: 20, stiffness: 100 };
  const x = useSpring(useTransform(scrollY, [0, 500], [0, 100]), springConfig);

  // Mouse tracking for 3D effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setMousePosition({ x: x * 20, y: y * 20 });
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Floating animation for droplets
  const floatingAnimation = {
    y: [0, -20, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "easeInOut" as any,
    },
  };

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-ocean-background"
    >
      {/* Animated ocean gradient background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute inset-0 opacity-30"
          animate={{
            background: [
              "radial-gradient(circle at 20% 50%, rgba(14, 165, 233, 0.5) 0%, transparent 50%)",
              "radial-gradient(circle at 80% 50%, rgba(6, 182, 212, 0.5) 0%, transparent 50%)",
              "radial-gradient(circle at 50% 80%, rgba(59, 130, 246, 0.5) 0%, transparent 50%)",
              "radial-gradient(circle at 20% 50%, rgba(14, 165, 233, 0.5) 0%, transparent 50%)",
            ],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      </div>

      {/* Ocean grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(14,165,233,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(14,165,233,.05)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]" />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 bg-ocean-accent rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.5 + 0.2,
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, Math.random() * 20 - 10, 0],
              scale: [1, 1.5, 1],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              delay: Math.random() * 2,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* 3D Water bottle with mouse tracking */}
      <motion.div
        className="absolute right-[5%] top-1/2 -translate-y-1/2 w-[500px] h-[500px] hidden lg:block"
        style={{
          rotateY: mousePosition.x,
          rotateX: -mousePosition.y,
          y: y1,
        }}
      >
        <motion.div
          className="relative w-full h-full"
          animate={floatingAnimation}
        >
          {/* Ocean glowing effect behind bottle */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-br from-ocean-primary to-ocean-accent rounded-[100px] blur-[100px] opacity-40"
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.4, 0.6, 0.4],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* Simplified 3D bottle representation */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="relative w-40 h-96 bg-gradient-to-b from-ocean-primary/30 to-ocean-primary/40 rounded-[60px] backdrop-blur-xl border-2 border-white/20 ocean-shadow-4 overflow-hidden"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              {/* Ocean water inside bottle */}
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-[70%] bg-gradient-to-t from-ocean-primary/60 to-ocean-accent/40"
                animate={{
                  height: ["70%", "75%", "70%"],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Bubbles */}
              {[...Array(8)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-3 h-3 bg-white/40 rounded-full"
                  style={{
                    left: `${20 + Math.random() * 60}%`,
                    bottom: "10%",
                  }}
                  animate={{
                    y: [-300, 0],
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                  }}
                  transition={{
                    duration: Math.random() * 2 + 2,
                    repeat: Infinity,
                    delay: Math.random() * 2,
                    ease: "linear",
                  }}
                />
              ))}

              {/* Ocean cap */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-8 bg-gradient-to-b from-ocean-primary to-ocean-secondary rounded-t-xl border-2 border-white/20" />

              {/* Light reflection */}
              <motion.div
                className="absolute top-[20%] left-[10%] w-[30%] h-[40%] bg-gradient-to-br from-white/40 to-transparent rounded-[40px] blur-sm"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          </div>
        </motion.div>
      </motion.div>

      {/* Content */}
      <motion.div
        style={{ opacity, scale }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center lg:text-left"
      >
        <div className="lg:max-w-2xl">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full ocean-info-bg border-ocean-info/50 backdrop-blur-sm mb-6"
          >
            <Sparkles className="w-4 h-4 text-ocean-accent" />
            <span className="text-sm font-medium text-ocean-secondary">
              KI-gestützte Wasseranalyse
            </span>
          </motion.div>

          {/* Main headline with gradient text */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="text-6xl md:text-7xl lg:text-8xl font-bold leading-none mb-6"
          >
            <span className="block text-ocean-primary">Dein Wasser.</span>
            <span className="block bg-gradient-to-r from-ocean-primary via-ocean-accent to-ocean-primary bg-clip-text text-transparent">
              Analysiert in
            </span>
            <motion.span
              className="block bg-gradient-to-r from-ocean-accent via-ocean-primary to-ocean-secondary bg-clip-text text-transparent"
              animate={{
                backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "linear",
              }}
              style={{
                backgroundSize: "200% auto",
              }}
            >
              Sekunden.
            </motion.span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-xl md:text-2xl text-ocean-secondary mb-8 leading-relaxed"
          >
            Scanne Wasserflaschenetiketten mit deinem Smartphone und erhalte
            sofort eine detaillierte Qualitätsbewertung – perfekt abgestimmt
            auf deine Bedürfnisse.
          </motion.p>

          {/* Feature highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap gap-4 mb-10"
          >
            {[
              { icon: Zap, text: "Sofortige Analyse" },
              { icon: Droplet, text: "4 Spezialprofile" },
              { icon: Sparkles, text: "100% Kostenlos" },
            ].map((feature, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-2 px-4 py-2 rounded-full ocean-panel border border-white/10 backdrop-blur-sm"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.1)" }}
              >
                <feature.icon className="w-5 h-5 text-ocean-accent" />
                <span className="text-sm font-medium text-ocean-primary">
                  {feature.text}
                </span>
              </motion.div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Link href="/dashboard">
              <motion.button
                className="group relative px-8 py-4 ocean-button rounded-full font-bold text-lg text-ocean-primary ocean-shadow-4 overflow-hidden"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="relative z-10">Jetzt kostenlos starten</span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-ocean-accent to-ocean-primary"
                  initial={{ x: "100%" }}
                  whileHover={{ x: 0 }}
                  transition={{ duration: 0.3 }}
                />
              </motion.button>
            </Link>

            <motion.button
              className="px-8 py-4 ocean-panel rounded-full font-bold text-lg text-ocean-primary border-2 border-white/20 hover:bg-white/20 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                document.getElementById("features")?.scrollIntoView({
                  behavior: "smooth"
                });
              }}
            >
              Mehr erfahren
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <ChevronDown className="w-8 h-8 text-ocean-secondary/50" />
      </motion.div>
    </section>
  );
}
