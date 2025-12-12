"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";

// --- KOMPONENTE START: WaterScoreCircle ---

interface WaterScoreCircleProps {
  value: number;
  size?: number;
  strokeWidth?: number;
  showValue?: boolean;
  className?: string;
  delay?: number;
}

// Hilfskomponente für Spritzer-Partikel
const SplashParticle = ({
  cx,
  cy,
  delay,
  color,
}: {
  cx: number;
  cy: number;
  delay: number;
  color: string;
}) => {
  const angle = Math.random() * 360;
  const distance = 40 + Math.random() * 60; // Wie weit sie fliegen
  const size = 2 + Math.random() * 4;

  return (
    <motion.circle
      cx={cx}
      cy={cy}
      r={size}
      fill={color}
      initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
      animate={{
        opacity: [0, 1, 0],
        scale: [0, 1, 0],
        x: Math.cos(angle * (Math.PI / 180)) * distance,
        y: Math.sin(angle * (Math.PI / 180)) * distance,
      }}
      transition={{
        duration: 0.8 + Math.random() * 0.5,
        delay: delay,
        ease: "easeOut",
      }}
    />
  );
};

export function WaterScoreCircle({
  value,
  size = 240,
  strokeWidth = 4,
  showValue = true,
  className = "",
  delay = 0,
}: WaterScoreCircleProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const controls = useAnimation();

  const radius = size / 2;
  const innerRadius = radius - strokeWidth - 8;
  const normalizedValue = Math.min(Math.max(value, 0), 100);

  // Wasserhöhe berechnen
  const waterLevelY =
    size - strokeWidth - (size - strokeWidth * 2) * (normalizedValue / 100);

  // 1. Status Farben (Nur für Ring, Text, Glow)
  const getStatusColors = (score: number) => {
    if (score >= 80)
      return {
        text: "text-emerald-400",
        glow: "#34d399",
      };
    if (score >= 50)
      return {
        text: "text-amber-400",
        glow: "#fbbf24",
      };
    return {
      text: "text-rose-400",
      glow: "#f43f5e",
    };
  };

  const statusColors = getStatusColors(normalizedValue);

  // 2. Konstantes Wasser-Blau (Unabhängig vom Score)
  const waterColors = {
    gradientStart: "#38bdf8", // Sky-400 (Hellblau oben)
    gradientEnd: "#0284c7", // Sky-600 (Dunkleres Blau unten)
    deepWater: "#0369a1", // Sky-700 (Hintere Welle)
    particle: "#bae6fd", // Sky-200 (Helle Spritzer)
  };

  // --- PROFESSIONELLE WELLE START ---
  const waveLength = size;
  const waveHeight = size * 0.05;

  const wavePathD = `
    M 0 0
    Q ${waveLength * 0.25} ${waveHeight} ${waveLength * 0.5} 0
    T ${waveLength} 0
    T ${waveLength * 1.5} 0
    T ${waveLength * 2} 0
    T ${waveLength * 2.5} 0
    T ${waveLength * 3} 0
    T ${waveLength * 3.5} 0
    T ${waveLength * 4} 0
    V ${size * 2} 
    H 0 
    Z
  `;
  // --- WELLE ENDE ---

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(true);
      controls.start("visible");
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [delay, controls]);

  return (
    <div
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >


      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="overflow-visible z-10"
      >
        <defs>
          <clipPath id={`circleClip-${size}`}>
            <circle cx={radius} cy={radius} r={innerRadius} />
          </clipPath>

          <linearGradient id={`waterGradient-${size}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={waterColors.gradientStart} stopOpacity="0.9" />
            <stop offset="100%" stopColor={waterColors.gradientEnd} stopOpacity="0.95" />
          </linearGradient>

          <linearGradient id="shineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="white" stopOpacity="0" />
            <stop offset="50%" stopColor="white" stopOpacity="0.3" />
            <stop offset="100%" stopColor="white" stopOpacity="0" />
          </linearGradient>

          <filter id="glowFilter" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 1. Hintergrund-Track */}
        <circle
          cx={radius}
          cy={radius}
          r={radius - strokeWidth}
          fill="none"
          stroke="#1e293b"
          strokeWidth={strokeWidth}
          className="opacity-50"
        />

        {/* 2. Wasser-Gruppe */}
        <g clipPath={`url(#circleClip-${size})`}>
          <circle
            cx={radius}
            cy={radius}
            r={innerRadius}
            fill="#0c4a6e"
            fillOpacity="0.3"
          />

          {/* Hintere Welle (Dunkleres Blau) */}
          <motion.path
            d={wavePathD}
            fill={waterColors.deepWater}
            initial={{ y: size, opacity: 0 }}
            animate={{
              y: isAnimating ? waterLevelY - 5 : size,
              x: [-waveLength, 0],
              opacity: 0.8,
            }}
            transition={{
              y: { duration: 2, ease: "easeOut" },
              x: { repeat: Infinity, duration: 4, ease: "linear" },
            }}
          />

          {/* Vordere Welle (Haupt-Blau Gradient) */}
          <motion.path
            d={wavePathD}
            fill={`url(#waterGradient-${size})`}
            initial={{ y: size }}
            animate={{
              y: isAnimating ? waterLevelY : size,
              x: [0, -waveLength],
            }}
            transition={{
              y: { duration: 1.5, ease: "easeOut" },
              x: { repeat: Infinity, duration: 2, ease: "linear" },
            }}
          />

          {/* Bubbles */}
          {isAnimating &&
            [...Array(8)].map((_, i) => (
              <motion.circle
                key={`bubble-${i}`}
                r={2 + Math.random() * 4}
                fill="white"
                initial={{
                  cx: size * (0.2 + Math.random() * 0.6),
                  cy: size,
                  opacity: 0,
                }}
                animate={{
                  cy: waterLevelY + 20,
                  opacity: [0, 0.4, 0],
                  x: (Math.random() - 0.5) * 20,
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Infinity,
                  delay: Math.random() * 2,
                  ease: "easeOut",
                }}
              />
            ))}


        </g>

        {/* 3. Glas-Reflexion */}
        <path
          d={`M ${radius - innerRadius * 0.7} ${radius - innerRadius * 0.7} Q ${radius} ${radius - innerRadius * 0.9
            } ${radius + innerRadius * 0.7} ${radius - innerRadius * 0.7}`}
          fill="none"
          stroke="white"
          strokeWidth="6"
          strokeLinecap="round"
          className="opacity-20 mix-blend-screen filter blur-sm"
        />

        {/* 4. Äußerer Ring (Farbe = Status) */}
        <circle
          cx={radius}
          cy={radius}
          r={radius - strokeWidth}
          fill="none"
          stroke={statusColors.glow}
          strokeWidth={2}
          strokeLinecap="round"
        />

        {/* 5. Spritzer-Partikel (Farbe = Helles Wasserblau) */}
        {isAnimating &&
          [...Array(12)].map((_, i) => (
            <SplashParticle
              key={`splash-${i}`}
              cx={radius}
              cy={radius}
              delay={delay + 0.5}
              color={waterColors.particle}
            />
          ))}
      </svg>

      {/* Score Text (Farbe = Status) */}
      {showValue && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{
              opacity: isAnimating ? 1 : 0,
              scale: isAnimating ? 1 : 0.8,
              y: 0,
            }}
            transition={{ delay: delay + 0.8, type: "spring", stiffness: 100 }}
            className={`flex flex-col items-center drop-shadow-md ${statusColors.text}`}
          >
            <span
              className="text-6xl font-black tracking-tighter"
              style={{ textShadow: `0 0 30px ${statusColors.glow}60` }}
            >
              {Math.round(value)}
            </span>
            <span className="text-xs uppercase font-bold tracking-[0.3em] opacity-80 mt-1">
              Punkte
            </span>
          </motion.div>
        </div>
      )}
    </div>
  );
}
