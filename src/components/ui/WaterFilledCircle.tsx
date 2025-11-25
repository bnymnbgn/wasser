'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface Bubble {
  id: number;
  x: number;
  size: number;
  duration: number;
  delay: number;
  wobble: number;
}

interface WaterFilledCircleProps {
  size?: number;
  fillDuration?: number;
  className?: string;
}

export function WaterFilledCircle({
  size = 120,
  fillDuration = 3,
  className = ''
}: WaterFilledCircleProps) {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [fillPercent, setFillPercent] = useState(0);

  // Generiere kontinuierlich Luftblasen
  useEffect(() => {
    const generateBubbles = () => {
      const newBubbles: Bubble[] = Array.from({ length: 12 }, (_, i) => ({
        id: Date.now() + i,
        x: 20 + Math.random() * 60, // Position zwischen 20% und 80% der Breite
        size: 1.5 + Math.random() * 4.5, // Blasengröße zwischen 1.5 und 6
        duration: 2 + Math.random() * 2.5, // Aufstiegsdauer 2-4.5s
        delay: Math.random() * 2.5, // Zufälliger Start zwischen 0-2.5s
        wobble: 5 + Math.random() * 10, // Seitliche Bewegung
      }));
      setBubbles(newBubbles);
    };

    generateBubbles();
    const interval = setInterval(generateBubbles, 2500);

    return () => clearInterval(interval);
  }, []);

  // Tracke Füllstand für Schaum-Effekt
  useEffect(() => {
    const duration = fillDuration * 1000;
    const steps = 60;
    const interval = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setFillPercent((currentStep / steps) * 100);
      if (currentStep >= steps) {
        clearInterval(timer);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [fillDuration]);

  const radius = size / 2;
  const circumference = 2 * Math.PI * radius;

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
          {/* Wasser-Gradient */}
          <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0EA5E9" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#0EA5E9" stopOpacity="0.95" />
          </linearGradient>

          {/* Lichtreflex-Gradient */}
          <radialGradient id="lightReflection" cx="30%" cy="30%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>

          {/* Clip-Path für Kreis */}
          <clipPath id={`circleClip-${size}`}>
            <circle cx={radius} cy={radius} r={radius - 4} />
          </clipPath>

          {/* Welleneffekt */}
          <filter id="wave" x="-50%" y="-50%" width="200%" height="200%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.02"
              numOctaves="3"
              result="turbulence"
            >
              <animate
                attributeName="baseFrequency"
                values="0.02;0.03;0.02"
                dur="3s"
                repeatCount="indefinite"
              />
            </feTurbulence>
            <feDisplacementMap
              in="SourceGraphic"
              in2="turbulence"
              scale="3"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>

        {/* Äußerer Kreis (Rahmen) */}
        <circle
          cx={radius}
          cy={radius}
          r={radius - 2}
          fill="none"
          stroke="url(#waterGradient)"
          strokeWidth="4"
          opacity="0.3"
        />

        {/* Hintergrund-Kreis */}
        <circle
          cx={radius}
          cy={radius}
          r={radius - 4}
          fill="#0EA5E9"
          fillOpacity="0.05"
        />

        {/* Wasserfüll-Animation */}
        <motion.circle
          cx={radius}
          cy={radius}
          r={radius - 4}
          fill="url(#waterGradient)"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: 0 }}
          transition={{
            duration: fillDuration,
            ease: "easeInOut",
          }}
          stroke="url(#waterGradient)"
          strokeWidth={size * 2}
          filter="url(#wave)"
        />

        {/* Lichtreflex-Effekt */}
        <motion.ellipse
          cx={radius * 0.7}
          cy={radius * 0.7}
          rx={radius * 0.4}
          ry={radius * 0.3}
          fill="url(#lightReflection)"
          clipPath={`url(#circleClip-${size})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0.4] }}
          transition={{
            duration: 2,
            times: [0, 0.5, 1],
            repeat: Infinity,
            repeatType: "reverse",
          }}
        />

        {/* Luftblasen mit Wobble-Effekt */}
        <g clipPath={`url(#circleClip-${size})`}>
          {bubbles.map((bubble) => {
            const startX = (bubble.x / 100) * size;
            const wobbleAmount = bubble.wobble;
            return (
              <motion.g key={bubble.id}>
                {/* Haupt-Blase */}
                <motion.circle
                  r={bubble.size}
                  fill="#ffffff"
                  fillOpacity="0.7"
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
                    opacity: [0, 0.7, 0.6, 0.4, 0],
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
                    opacity: [0, 0.9, 0.8, 0.6, 0],
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

        {/* Schaum an der Wasseroberfläche (erscheint bei höherem Füllstand) */}
        {fillPercent > 60 && (
          <g clipPath={`url(#circleClip-${size})`}>
            {Array.from({ length: 6 }, (_, i) => {
              const angle = (i / 6) * Math.PI * 2;
              const foamRadius = radius * 0.7;
              const x = radius + Math.cos(angle) * foamRadius;
              const y = radius + Math.sin(angle) * foamRadius;
              return (
                <motion.circle
                  key={`foam-${i}`}
                  cx={x}
                  cy={y}
                  r={2 + Math.random() * 2}
                  fill="#ffffff"
                  fillOpacity="0.4"
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{
                    scale: [0, 1.2, 1],
                    opacity: [0, 0.6, 0.4],
                  }}
                  transition={{
                    duration: 0.8,
                    delay: i * 0.1,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                />
              );
            })}
          </g>
        )}
      </svg>

      {/* Zusätzlicher innerer Schimmer-Effekt */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.15) 0%, transparent 60%)',
          pointerEvents: 'none',
        }}
        animate={{
          opacity: [0.3, 0.6, 0.3],
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
