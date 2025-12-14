"use client";

import { motion, useAnimation, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Droplet } from "lucide-react";

interface ProductScoreHeroProps {
  score: number;
  productImage?: string | null;
  brand?: string;
  size?: number;
  strokeWidth?: number;
  delay?: number;
}

// Splash particle for score reveal animation
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
  const distance = 40 + Math.random() * 60;
  const particleSize = 2 + Math.random() * 4;

  return (
    <motion.circle
      cx={cx}
      cy={cy}
      r={particleSize}
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
}

export function ProductScoreHero({
  score,
  productImage,
  brand,
  size = 280,
  strokeWidth = 14,
  delay = 0,
}: ProductScoreHeroProps) {
  const [showProduct, setShowProduct] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [imageError, setImageError] = useState(false);
  const controls = useAnimation();

  const radius = size / 2;
  const innerRadius = radius - strokeWidth - 10;
  const normalizedValue = Math.min(Math.max(score, 0), 100);

  // Water level calculation
  const waterLevelY =
    size - strokeWidth - (size - strokeWidth * 2) * (normalizedValue / 100);

  // Status colors (for ring, text, glow)
  const getStatusColors = (s: number) => {
    if (s >= 80)
      return {
        text: "text-emerald-400",
        glow: "#34d399",
        ring: "#34d399",
      };
    if (s >= 50)
      return {
        text: "text-amber-400",
        glow: "#fbbf24",
        ring: "#fbbf24",
      };
    return {
      text: "text-rose-400",
      glow: "#f43f5e",
      ring: "#f43f5e",
    };
  };

  const statusColors = getStatusColors(normalizedValue);

  // Constant water blue (independent of score)
  const waterColors = {
    gradientStart: "#38bdf8",
    gradientEnd: "#0284c7",
    deepWater: "#0369a1",
    particle: "#bae6fd",
  };

  // Wave path
  const waveLength = size;
  const waveHeight = size * 0.04;

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

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimating(true);
      controls.start("visible");
    }, delay * 1000);
    return () => clearTimeout(timer);
  }, [delay, controls]);

  const handleTap = () => {
    if (showProduct) {
      // Switching back to score - trigger splash animation
      setShowSplash(true);
      setTimeout(() => setShowSplash(false), 1500);
    }
    setShowProduct(!showProduct);
  };

  const hasProductImage = productImage && !imageError;

  return (
    <div className="flex flex-col items-center">
      {/* Main Interactive Circle */}
      <motion.div
        className="relative flex items-center justify-center cursor-pointer"
        style={{ width: size, height: size }}
        onClick={handleTap}
        whileTap={{ scale: 0.98 }}
      >
        {/* Tap hint pulse */}
        <motion.div
          className="absolute inset-0 rounded-full"
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 0.3, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            repeatDelay: 3,
          }}
          style={{
            border: `2px solid ${statusColors.glow}`,
          }}
        />

        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="overflow-visible z-10"
        >
          <defs>
            <clipPath id={`heroClip-${size}`}>
              <circle cx={radius} cy={radius} r={innerRadius} />
            </clipPath>

            <linearGradient id={`heroWaterGradient-${size}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={waterColors.gradientStart} stopOpacity="0.9" />
              <stop offset="100%" stopColor={waterColors.gradientEnd} stopOpacity="0.95" />
            </linearGradient>

            <filter id="heroGlowFilter" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background Track */}
          <circle
            cx={radius}
            cy={radius}
            r={radius - strokeWidth}
            fill="none"
            stroke="#1e293b"
            strokeWidth={strokeWidth}
            className="opacity-50"
          />

          {/* Water Group */}
          <g clipPath={`url(#heroClip-${size})`}>
            <circle
              cx={radius}
              cy={radius}
              r={innerRadius}
              fill="#0c4a6e"
              fillOpacity="0.3"
            />

            {/* Back Wave (Darker Blue) */}
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

            {/* Front Wave (Main Blue Gradient) */}
            <motion.path
              d={wavePathD}
              fill={`url(#heroWaterGradient-${size})`}
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
              [...Array(10)].map((_, i) => (
                <motion.circle
                  key={`bubble-${i}`}
                  r={2 + Math.random() * 5}
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

          {/* Glass Reflection */}
          <path
            d={`M ${radius - innerRadius * 0.7} ${radius - innerRadius * 0.7} Q ${radius} ${radius - innerRadius * 0.9
              } ${radius + innerRadius * 0.7} ${radius - innerRadius * 0.7}`}
            fill="none"
            stroke="white"
            strokeWidth="6"
            strokeLinecap="round"
            className="opacity-20 mix-blend-screen filter blur-sm"
          />

          {/* Outer Ring (Color = Status) */}
          <circle
            cx={radius}
            cy={radius}
            r={radius - strokeWidth}
            fill="none"
            stroke={statusColors.ring}
            strokeWidth={2}
            strokeLinecap="round"
          />

          {/* Splash Particles on score reveal */}
          {showSplash &&
            [...Array(16)].map((_, i) => (
              <SplashParticle
                key={`splash-${i}`}
                cx={radius}
                cy={radius}
                delay={0}
                color={waterColors.particle}
              />
            ))}
        </svg>

        {/* Inner Content - Score or Product Image */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <AnimatePresence mode="wait">
            {!showProduct ? (
              /* Score Display */
              <motion.div
                key="score"
                initial={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className={`flex flex-col items-center drop-shadow-md ${statusColors.text}`}
              >
                <motion.span
                  className="font-black tracking-tighter"
                  style={{
                    fontSize: size * 0.28,
                    textShadow: `0 0 40px ${statusColors.glow}60`
                  }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: isAnimating ? 1 : 0, y: isAnimating ? 0 : 20 }}
                  transition={{ delay: delay + 0.8, type: "spring", stiffness: 100 }}
                >
                  {Math.round(score)}
                </motion.span>
                <motion.span
                  className="uppercase font-bold tracking-[0.3em] opacity-80"
                  style={{ fontSize: size * 0.045, marginTop: size * 0.01 }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isAnimating ? 0.8 : 0 }}
                  transition={{ delay: delay + 1 }}
                >
                  Punkte
                </motion.span>
              </motion.div>
            ) : (
              /* Product Image Display */
              <motion.div
                key="product"
                initial={{ opacity: 0, scale: 0.8, rotateY: 90 }}
                animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                exit={{ opacity: 0, scale: 0.8, rotateY: -90 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative flex items-center justify-center"
                style={{
                  width: innerRadius * 1.6,
                  height: innerRadius * 1.6,
                }}
              >
                {hasProductImage ? (
                  <div
                    className="relative rounded-full overflow-hidden bg-white/10 backdrop-blur-sm"
                    style={{
                      width: innerRadius * 1.5,
                      height: innerRadius * 1.5,
                    }}
                  >
                    <Image
                      src={productImage}
                      alt={brand || "Produkt"}
                      fill
                      className="object-contain p-2"
                      onError={() => setImageError(true)}
                      sizes={`${innerRadius * 1.5}px`}
                    />
                  </div>
                ) : (
                  <div
                    className="flex items-center justify-center rounded-full bg-white/5 backdrop-blur-sm border border-white/10"
                    style={{
                      width: innerRadius * 1.4,
                      height: innerRadius * 1.4,
                    }}
                  >
                    <Droplet
                      className="text-sky-400/60"
                      style={{ width: innerRadius * 0.5, height: innerRadius * 0.5 }}
                    />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Tap indicator icon */}
        <motion.div
          className="absolute bottom-4 right-4 z-30 bg-white/10 backdrop-blur-sm rounded-full p-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: delay + 1.5 }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-white/80">
            <path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
        </motion.div>
      </motion.div>

      {/* Status Label below circle */}
      <motion.div
        className="mt-4 text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay + 1.2 }}
      >
        <div
          className={`inline-flex items-center rounded-full px-4 py-1.5 text-sm font-semibold ${
            normalizedValue >= 80
              ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
              : normalizedValue >= 50
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
          }`}
        >
          {normalizedValue >= 80 ? "Sehr gut" : normalizedValue >= 50 ? "Okay" : "Kritisch"}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Tippe zum {showProduct ? "Score anzeigen" : "Produkt anzeigen"}
        </p>
      </motion.div>
    </div>
  );
}
