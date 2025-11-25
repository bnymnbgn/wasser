'use client';

import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Bubble {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  wobble: number;
}

interface WaterScoreCircleProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  showValue?: boolean;
  className?: string;
}

export function WaterScoreCircle({
  value,
  size = 180,
  strokeWidth = 12,
  showValue = true,
  className = ''
}: WaterScoreCircleProps) {
  const normalizedValue = Math.min(Math.max(value, 0), 100);
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  // Bestimme Farbe basierend auf Score
  const getWaterColors = (score: number) => {
    if (score >= 80) {
      // Grün - Exzellent
      return {
        gradient: ['#10b981', '#34d399', '#6ee7b7'], // emerald shades
        text: 'text-emerald-600 dark:text-emerald-400',
        glow: 'rgba(16, 185, 129, 0.3)'
      };
    } else if (score >= 50) {
      // Gelb/Amber - Gut
      return {
        gradient: ['#f59e0b', '#fbbf24', '#fcd34d'], // amber shades
        text: 'text-amber-600 dark:text-amber-400',
        glow: 'rgba(245, 158, 11, 0.3)'
      };
    } else {
      // Rot - Verbesserungsbedarf
      return {
        gradient: ['#ef4444', '#f87171', '#fca5a5'], // red shades
        text: 'text-red-600 dark:text-red-400',
        glow: 'rgba(239, 68, 68, 0.3)'
      };
    }
  };

  const colors = getWaterColors(normalizedValue);

  // Generiere kontinuierlich Luftblasen (aber weniger als bei WaterFilledCircle)
  useEffect(() => {
    const generateBubbles = () => {
      const newBubbles: Bubble[] = Array.from({ length: 10 }, (_, i) => ({
        id: Date.now() + i,
        x: 25 + Math.random() * 50, // Position zwischen 25% und 75% der Breite
        size: 2 + Math.random() * 4, // Blasengröße zwischen 2 und 6
        duration: 2.5 + Math.random() * 2, // Aufstiegsdauer 2.5-4.5s
        delay: Math.random() * 3, // Zufälliger Start zwischen 0-3s
        wobble: 4 + Math.random() * 8, // Seitliche Bewegung
      }));
      setBubbles(newBubbles);
    };

    generateBubbles();
    const interval = setInterval(generateBubbles, 3000);

    return () => clearInterval(interval);
  }, []);

  // Animierter Counter für Score-Zahl
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    const controls = animate(count, normalizedValue, {
      duration: 2,
      ease: "easeOut"
    });
    return controls.stop;
  }, [normalizedValue, count]);

  const radius = size / 2;
  const innerRadius = radius - strokeWidth;

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90"
      >
        {/* Definitionen für Gradienten und Effekte */}
        <defs>
          {/* Wasser-Gradient basierend auf Score */}
          <linearGradient id={`waterScoreGradient-${size}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colors.gradient[0]} stopOpacity="0.95" />
            <stop offset="50%" stopColor={colors.gradient[1]} stopOpacity="0.85" />
            <stop offset="100%" stopColor={colors.gradient[2]} stopOpacity="0.9" />
          </linearGradient>

          {/* Lichtreflex-Gradient */}
          <radialGradient id={`scoreLight-${size}`} cx="35%" cy="35%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="40%" stopColor="#ffffff" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          {/* Clip-Path für Kreis */}
          <clipPath id={`scoreCircleClip-${size}`}>
            <circle cx={radius} cy={radius} r={innerRadius} />
          </clipPath>

          {/* Welleneffekt */}
          <filter id={`scoreWave-${size}`} x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.015"
              numOctaves="2"
              result="turbulence"
            >
              <animate
                attributeName="baseFrequency"
                values="0.015;0.025;0.015"
                dur="4s"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="turbulence"
              scale="4"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>

          {/* Äußerer Glow */}
          <filter id={`scoreGlow-${size}`}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Hintergrund-Kreis (Rahmen) */}
        <circle
          cx={radius}
          cy={radius}
          r={innerRadius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-200 dark:text-slate-700"
          opacity="0.3"
        />

        {/* Wasser-Füll-Animation */}
        <motion.circle
          cx={radius}
          cy={radius}
          r={innerRadius - strokeWidth / 2}
          fill={`url(#waterScoreGradient-${size})`}
          initial={{
            strokeDasharray: `0 ${2 * Math.PI * (innerRadius - strokeWidth / 2)}`
          }}
          animate={{
            strokeDasharray: `${(normalizedValue / 100) * 2 * Math.PI * (innerRadius - strokeWidth / 2)} ${2 * Math.PI * (innerRadius - strokeWidth / 2)}`
          }}
          transition={{
            duration: 2,
            ease: "easeInOut",
          }}
          stroke={`url(#waterScoreGradient-${size})`}
          strokeWidth={(innerRadius - strokeWidth / 2) * 2}
          filter={`url(#scoreWave-${size})`}
          style={{
            filter: `drop-shadow(0 0 10px ${colors.glow})`
          }}
        />

        {/* Lichtreflex-Effekt */}
        <motion.ellipse
          cx={radius * 0.65}
          cy={radius * 0.65}
          rx={radius * 0.45}
          ry={radius * 0.35}
          fill={`url(#scoreLight-${size})`}
          clipPath={`url(#scoreCircleClip-${size})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.7, 0.5] }}
          transition={{
            duration: 2.5,
            times: [0, 0.5, 1],
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />

        {/* Luftblasen mit Wobble-Effekt */}
        <g clipPath={`url(#scoreCircleClip-${size})`}>
          {bubbles.map((bubble) => {
            const startX = (bubble.x / 100) * size;
            const wobbleAmount = bubble.wobble;
            return (
              <motion.g key={bubble.id}>
                {/* Haupt-Blase */}
                <motion.circle
                  r={bubble.size}
                  fill="#ffffff"
                  fillOpacity="0.6"
                  initial={{
                    cx: startX,
                    cy: size + 10,
                    opacity: 0
                  }}
                  animate={{
                    cx: [
                      startX,
                      startX + wobbleAmount,
                      startX - wobbleAmount,
                      startX + wobbleAmount * 0.5,
                      startX
                    ],
                    cy: -10,
                    opacity: [0, 0.6, 0.5, 0.3, 0],
                  }}
                  transition={{
                    duration: bubble.duration,
                    delay: bubble.delay,
                    ease: "easeOut",
                    times: [0, 0.25, 0.5, 0.75, 1],
                  }}
                />
                {/* Glanz auf der Blase */}
                <motion.circle
                  r={bubble.size * 0.4}
                  fill="#ffffff"
                  fillOpacity="0.9"
                  initial={{
                    cx: startX - bubble.size * 0.3,
                    cy: size + 10,
                    opacity: 0
                  }}
                  animate={{
                    cx: [
                      startX - bubble.size * 0.3,
                      startX + wobbleAmount - bubble.size * 0.3,
                      startX - wobbleAmount - bubble.size * 0.3,
                      startX + wobbleAmount * 0.5 - bubble.size * 0.3,
                      startX - bubble.size * 0.3
                    ],
                    cy: -10 - bubble.size * 0.3,
                    opacity: [0, 0.9, 0.7, 0.5, 0],
                  }}
                  transition={{
                    duration: bubble.duration,
                    delay: bubble.delay,
                    ease: "easeOut",
                    times: [0, 0.25, 0.5, 0.75, 1],
                  }}
                />
              </motion.g>
            );
          })}
        </g>

        {/* Schaum-Effekt bei hohen Scores */}
        {normalizedValue > 70 && (
          <g clipPath={`url(#scoreCircleClip-${size})`}>
            {Array.from({ length: 5 }, (_, i) => {
              const angle = (i / 5) * Math.PI * 2;
              const foamRadius = innerRadius * 0.65;
              const x = radius + Math.cos(angle) * foamRadius;
              const y = radius + Math.sin(angle) * foamRadius;
              return (
                <motion.circle
                  key={`foam-${i}`}
                  cx={x}
                  cy={y}
                  r={2.5 + Math.random() * 2}
                  fill="#ffffff"
                  fillOpacity="0.5"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: [0, 1.3, 1],
                    opacity: [0, 0.7, 0.5],
                  }}
                  transition={{
                    duration: 1,
                    delay: i * 0.15,
                    repeat: Infinity,
                    repeatDelay: 2.5,
                  }}
                />
              );
            })}
          </g>
        )}
      </svg>

      {/* Score-Anzeige in der Mitte */}
      {showValue && (
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, duration: 0.6, type: "spring" }}
        >
          <motion.span
            className={`text-5xl font-bold ${colors.text}`}
            style={{
              textShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}
          >
            {rounded}
          </motion.span>
          <span className="text-sm text-slate-600 dark:text-slate-400 mt-1">von 100</span>
        </motion.div>
      )}

      {/* Zusätzlicher Schimmer-Effekt */}
      <motion.div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: `radial-gradient(circle at 35% 35%, ${colors.glow} 0%, transparent 50%)`,
        }}
        animate={{
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
