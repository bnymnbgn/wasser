"use client";

import React, { useMemo, useEffect, useState } from "react";
import { Minus, Plus, Sparkles, Wind } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  fillLevel: number;
  isBubbling?: boolean;
  onFillChange?: (value: number) => void;
  onBubblingChange?: (value: boolean) => void;
  showControls?: boolean;
  consumedMl?: number;
};

const LIQUID_GRADIENT = `linear-gradient(90deg,
  rgb(10, 40, 100) 0%,
  rgb(59, 130, 246) 20%,
  rgb(147, 197, 253) 50%,
  rgb(59, 130, 246) 80%,
  rgb(10, 40, 100) 100%)`;

function clampFill(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.min(100, Math.max(0, Math.round(value)));
}

const generateDrops = (count: number) => {
  return Array.from({ length: count }).map((_, i) => {
    const isDripping = Math.random() > 0.85;
    const width = Math.random() * 3 + 2;
    const height = isDripping ? Math.random() * 8 + 5 : Math.random() * 4 + 3;
    const r1 = Math.random() * 30 + 40;
    const r2 = Math.random() * 30 + 40;
    const r3 = Math.random() * 30 + 40;
    const r4 = Math.random() * 30 + 40;

    return {
      id: i,
      left: Math.random() * 92 + 4 + "%",
      top: Math.random() * 85 + 5 + "%",
      width: width + "px",
      height: height + "px",
      opacity: Math.random() * 0.5 + 0.3,
      isDripping,
      speed: Math.random() * 15 + 10,
      borderRadius: `${r1}% ${r2}% ${r3}% ${r4}% / ${r4}% ${r3}% ${r2}% ${r1}%`,
      dropDistance: Math.random() * 300 + 100,
      repeatDelay: Math.random() * 10 + 5,
    };
  });
};

const generateBubbles = (count: number) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    left: Math.random() * 80 + 10 + "%",
    size: Math.random() * 6 + 3 + "px",
    duration: Math.random() * 2 + 3,
    delay: Math.random() * 5,
    opacity: Math.random() * 0.3 + 0.1,
  }));
};

function GlassReflections({ intensity = 1 }: { intensity?: number }) {
  return (
    <div
      className="pointer-events-none absolute inset-0 rounded-[3rem] overflow-hidden"
      style={{ "--i": intensity } as React.CSSProperties}
    >
      <div className="absolute inset-y-4 left-0 w-[1px] md:w-[2px]">
        <div
          className="absolute inset-y-0 w-full bg-gradient-to-b from-transparent via-white/80 to-transparent blur-[0.5px]"
          style={{
            opacity: "calc(0.7 * var(--i))",
            maskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
          }}
        />
      </div>
      <div className="absolute inset-y-4 right-0 w-[1px] md:w-[2px]">
        <div
          className="absolute inset-y-0 w-full bg-gradient-to-b from-transparent via-white/80 to-transparent blur-[0.5px]"
          style={{
            opacity: "calc(0.7 * var(--i))",
            maskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 15%, black 85%, transparent 100%)",
          }}
        />
      </div>

      <div
        className="absolute inset-0 rounded-[3rem] pointer-events-none mix-blend-screen"
        style={{
          boxShadow: `2px 0 0 rgba(255,0,0,0.08), -2px 0 0 rgba(0,150,255,0.08)`,
          opacity: `calc(0.8 * var(--i))`,
        }}
      />

      <div
        className="absolute top-12 right-6 w-16 h-32 bg-gradient-to-b from-white/70 to-transparent skew-y-6 blur-[10px] rounded-xl mix-blend-screen border-t border-white/40"
        style={{ opacity: `calc(0.9 * var(--i))` }}
      />

      <div
        className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-white/35 via-white/10 to-transparent blur-md mix-blend-soft-light"
        style={{ opacity: `calc(0.6 * var(--i))` }}
      />
      <div
        className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-white/35 via-white/10 to-transparent blur-md mix-blend-soft-light"
        style={{ opacity: `calc(0.6 * var(--i))` }}
      />

      <div
        className="absolute top-14 left-10 w-[2px] h-72 bg-gradient-to-b from-white/95 via-white/80 to-transparent rounded-full blur-[1px] mix-blend-screen shadow-[0_0_18px_rgba(255,255,255,0.8)]"
        style={{ opacity: `calc(0.9 * var(--i))` }}
      />

      <div
        className="absolute inset-y-6 left-0 w-[2px] bg-gradient-to-b from-transparent via-white to-transparent blur-[0.5px] shadow-[0_0_12px_rgba(255,255,255,0.7)]"
        style={{ opacity: `calc(0.75 * var(--i))` }}
      />
      <div
        className="absolute inset-y-6 right-0 w-[2px] bg-gradient-to-b from-transparent via-white to-transparent blur-[0.5px] shadow-[0_0_12px_rgba(255,255,255,0.7)]"
        style={{ opacity: `calc(0.75 * var(--i))` }}
      />

      <div
        className="absolute top-4 left-1/2 -translate-x-1/2 w-40 h-16 bg-gradient-to-b from-white/30 to-transparent blur-2xl rounded-full mix-blend-screen"
        style={{ opacity: `calc(0.5 * var(--i))` }}
      />
    </div>
  );
}

function BottleBase({ fillLevel }: { fillLevel: number }) {
  return (
    <div
      className="absolute bottom-0 left-0 w-full h-36 z-20 pointer-events-none rounded-b-[3rem] overflow-hidden"
      style={{
        maskImage: "linear-gradient(to bottom, transparent 0%, black 30%, black 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 30%, black 100%)",
      }}
    >
      <div
        className="absolute inset-x-0 bottom-0 h-full rounded-b-[3rem]"
        style={{
          boxShadow: `
            inset 0 -25px 40px rgba(0,10,20,0.7),
            inset 8px 0 20px rgba(255,255,255,0.08),
            inset -8px 0 20px rgba(255,255,255,0.06),
            inset 0 -8px 15px rgba(0,0,0,0.4)
          `,
        }}
      />
      <div
        className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full transition-all duration-700"
        style={{
          width: `${50 + fillLevel / 3}%`,
          height: "12px",
          background: "radial-gradient(ellipse, rgba(150,200,255,0.15) 0%, transparent 70%)",
          filter: "blur(4px)",
          opacity: fillLevel > 10 ? 1 : 0,
        }}
      />
      <div
        className="absolute bottom-1 left-8 right-8 h-[1.5px] rounded-full"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 20%, rgba(255,255,255,0.7) 50%, rgba(255,255,255,0.5) 80%, transparent 100%)",
          boxShadow: "0 0 8px rgba(255,255,255,0.4)",
        }}
      />
    </div>
  );
}

function Liquid({
  fillLevel,
  isBubbling,
  bubbles,
}: {
  fillLevel: number;
  isBubbling: boolean;
  bubbles: ReturnType<typeof generateBubbles>;
}) {
  const [slosh, setSlosh] = useState({ rotate: 0, skew: 0 });

  useEffect(() => {
    const direction = Math.random() > 0.5 ? 1 : -1;
    const intensity = 3.5;
    setSlosh({
      rotate: intensity * direction,
      skew: (intensity / 1.5) * direction,
    });
    const timer = setTimeout(() => {
      setSlosh({ rotate: 0, skew: 0 });
    }, 50);
    return () => clearTimeout(timer);
  }, [fillLevel]);

  return (
    <motion.div
      className="absolute bottom-0 left-0 w-full z-10"
      initial={false}
      animate={{ height: `${fillLevel * 0.84}%` }}
      transition={{ type: "spring", stiffness: 50, damping: 15, mass: 1 }}
      style={{ opacity: 0.9 }}
    >
      <div
        className="absolute inset-0"
        style={{
          background: LIQUID_GRADIENT,
        }}
      />

      <div className="absolute bottom-0 left-0 w-full h-[70%] bg-gradient-to-t from-[#020617] via-[#1e3a8a]/40 to-transparent pointer-events-none opacity-90 mix-blend-multiply" />
      <div className="absolute top-1/4 left-1/4 right-1/4 h-1/2 bg-cyan-400/30 blur-[50px] rounded-full mix-blend-screen opacity-60 pointer-events-none" />

      <motion.div
        className="absolute -top-2.5 left-0 w-full h-5 z-50 origin-center"
        animate={{
          rotate: slosh.rotate,
          skewX: slosh.skew,
        }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 6,
          mass: 1.2,
        }}
      >
        <div
          className="absolute top-[50%] left-0 right-0 h-4 -z-10"
          style={{ background: LIQUID_GRADIENT }}
        />

        <div className="absolute inset-0 rounded-[100%] bg-blue-900 shadow-[inset_0_2px_8px_rgba(0,0,0,0.5)]" />

        <div
          className="absolute inset-[3px] rounded-[100%] z-10"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(255,255,255,0.1) 20%, rgba(190, 230, 255, 0.4) 60%, rgba(255,255,255,0.0) 100%)",
            boxShadow: "inset 0 0 6px rgba(180, 220, 255, 0.5)",
            mixBlendMode: "screen",
          }}
        />

        <div className="absolute inset-0 rounded-[100%] overflow-hidden pointer-events-none z-20">
          <div
            className="absolute inset-0 rounded-[100%] border-[2px] border-white/85 border-t-white/85 border-b-transparent shadow-[0_-1px_4px_rgba(255,255,255,0.35)]"
            style={{
              maskImage: "radial-gradient(ellipse 100% 50% at 50% 0%, black 99%, transparent 100%)",
              WebkitMaskImage: "radial-gradient(ellipse 100% 50% at 50% 0%, black 99%, transparent 100%)",
              opacity: 0.95,
            }}
          />
        </div>

        <div className="absolute top-[2px] left-[20%] w-[15%] h-[40%] bg-white/40 blur-sm rounded-full transform rotate-[-15deg] z-30" />
      </motion.div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
        <AnimatePresence>
          {isBubbling &&
            bubbles.map((bubble) => (
              <motion.div
                key={bubble.id}
                className="absolute bottom-0 rounded-full bg-white/40 shadow-[inset_0_0_2px_rgba(255,255,255,0.8)] backdrop-blur-sm"
                style={{ left: bubble.left, width: bubble.size, height: bubble.size }}
                animate={{
                  y: -550,
                  opacity: [0, bubble.opacity, 0],
                  x: [0, Math.sin(bubble.id) * 25, 0],
                }}
                transition={{ duration: bubble.duration, repeat: Infinity, delay: bubble.delay, ease: "linear" }}
                exit={{ opacity: 0 }}
              />
            ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function Condensation({
  drops,
  fillLevel,
}: {
  drops: ReturnType<typeof generateDrops>;
  fillLevel: number;
}) {
  const liquidHeightPercent = fillLevel * 0.84;
  const liquidSurfaceY = 100 - liquidHeightPercent;

  return (
    <div className="absolute inset-0 z-20 pointer-events-none mix-blend-overlay opacity-80">
      {drops.map((drop) => {
        const dropY = parseFloat(drop.top);
        let zoneOpacity = 0;
        const fadeZone = 15;

        if (dropY >= liquidSurfaceY) {
          zoneOpacity = 1;
        } else if (dropY >= liquidSurfaceY - fadeZone) {
          zoneOpacity = (dropY - (liquidSurfaceY - fadeZone)) / fadeZone;
        }

        const currentOpacity = drop.opacity * zoneOpacity;
        if (currentOpacity <= 0.01 && !drop.isDripping) return <div key={drop.id} className="hidden" />;

        return (
          <motion.div
            key={drop.id}
            className="absolute bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.9),rgba(148,163,184,0.3),transparent_70%)] shadow-[1px_1px_1px_rgba(15,23,42,0.55)] border border-white/30 rounded-full"
            style={{
              left: drop.left,
              top: drop.top,
              width: drop.width,
              height: drop.height,
              opacity: currentOpacity,
              borderRadius: drop.isDripping ? "40% 40% 60% 60% / 60% 60% 40% 40%" : drop.borderRadius,
            }}
            animate={
              drop.isDripping
                ? {
                  y: [0, drop.dropDistance],
                  opacity: [currentOpacity, currentOpacity * 0.8, 0],
                }
                : {
                  opacity: currentOpacity,
                }
            }
            transition={
              drop.isDripping
                ? {
                  duration: drop.speed,
                  times: [0, 0.8, 1],
                  repeat: Infinity,
                  ease: "easeIn",
                  repeatDelay: drop.repeatDelay,
                }
                : {
                  duration: 0.5,
                }
            }
          />
        );
      })}
    </div>
  );
}

function ControlPanel({
  fillLevel,
  setFillLevel,
  isBubbling,
  toggleBubbling,
}: {
  fillLevel: number;
  setFillLevel: (value: number) => void;
  isBubbling: boolean;
  toggleBubbling: () => void;
}) {
  return (
    <div className="mt-8 w-full bg-slate-900/40 p-6 rounded-3xl border border-white/5 backdrop-blur-md shadow-2xl z-20 relative">
      <div className="flex justify-between items-end mb-8 relative">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold tracking-[0.2em] text-blue-400 uppercase mb-1">Füllstand</span>
          <span className="text-4xl font-light text-white tracking-tighter tabular-nums">
            {fillLevel}
            <span className="text-lg text-slate-500 ml-1 font-thin">%</span>
          </span>
        </div>
        <Sparkles
          className={`w-6 h-6 mb-2 transition-all duration-700 ${fillLevel > 95 ? "text-yellow-200 animate-pulse" : "text-slate-700"
            }`}
        />
      </div>

      <div className="flex items-center gap-5 mb-8 relative">
        <button
          onClick={() => setFillLevel(Math.max(0, fillLevel - 10))}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-all border border-white/5"
        >
          <Minus size={16} />
        </button>
        <div className="relative flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
          <div className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-300" style={{ width: `${fillLevel}%` }} />
          <input
            type="range"
            min="0"
            max="100"
            value={fillLevel}
            onChange={(e) => setFillLevel(Number(e.target.value))}
            className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
        <button
          onClick={() => setFillLevel(Math.min(100, fillLevel + 10))}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 transition-all border border-white/5"
        >
          <Plus size={16} />
        </button>
      </div>

      <div
        className="flex justify-between items-center cursor-pointer p-2 rounded-xl hover:bg-white/5 transition-colors"
        onClick={toggleBubbling}
      >
        <span className="text-xs font-bold tracking-widest text-slate-400 uppercase flex items-center gap-2">
          <Wind size={12} /> CO₂ Injektion
        </span>
        <div className={`w-10 h-6 rounded-full relative transition-colors duration-300 ${isBubbling ? "bg-blue-600" : "bg-slate-700"}`}>
          <motion.div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm" animate={{ x: isBubbling ? 16 : 0 }} />
        </div>
      </div>
    </div>
  );
}

export function BottleVisualizer({
  fillLevel,
  isBubbling = true,
  onFillChange,
  onBubblingChange,
  showControls = false,
  consumedMl = 0,
}: Props) {
  const clampedFill = clampFill(fillLevel);
  const [internalFill, setInternalFill] = useState(clampedFill);
  const [internalBubbling, setInternalBubbling] = useState(isBubbling);

  useEffect(() => {
    setInternalFill(clampedFill);
  }, [clampedFill]);

  useEffect(() => {
    setInternalBubbling(isBubbling);
  }, [isBubbling]);

  const currentFill = onFillChange ? clampedFill : internalFill;
  const bubbling = onBubblingChange ? isBubbling : internalBubbling;

  const setFillLevel = (value: number) => {
    const v = clampFill(value);
    if (onFillChange) onFillChange(v);
    else setInternalFill(v);
  };

  const toggleBubbling = () => {
    const next = !bubbling;
    if (onBubblingChange) onBubblingChange(next);
    else setInternalBubbling(next);
  };

  const bubbles = useMemo(() => generateBubbles(15), []);
  const drops = useMemo(() => generateDrops(45), []);

  return (
    <div className="relative flex flex-col items-center justify-center p-4 text-slate-200">
      <div className="relative z-10 flex flex-col items-center justify-center">
        {/* Text BEHIND the bottle content - Rendered first (behind) or positioned absolutely */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 flex flex-col items-center justify-center pointer-events-none transform translate-y-2 w-full">
          <span className="text-[5rem] font-bold text-white/90 tabular-nums leading-none drop-shadow-md">
            {Math.round(currentFill)}%
          </span>
          <span className="text-lg font-black text-slate-200/80 tracking-widest uppercase mt-2 drop-shadow-md">
            {consumedMl} ml
          </span>
        </div>

        <div className="relative w-56 h-[32rem] rounded-[3rem] z-10 bg-gradient-to-br from-white/[0.03] via-transparent to-white/[0.01] backdrop-blur-[2px] border-[1px] border-white/10 shadow-[0_0_0_1px_rgba(0,0,0,0.5),0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden">
          <GlassReflections />
          <Liquid fillLevel={currentFill} isBubbling={bubbling} bubbles={bubbles} />
          <Condensation drops={drops} fillLevel={currentFill} />
          <BottleBase fillLevel={currentFill} />

          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent pointer-events-none rounded-[3rem] z-50 mix-blend-overlay" />
        </div>

        <div className="absolute -top-[3.5rem] left-1/2 transform -translate-x-1/2 w-[6rem] h-16 z-20">
          <div className="w-full h-full bg-gradient-to-r from-slate-900 via-slate-800 to-slate-950 rounded-t-sm rounded-b-lg shadow-2xl border-t border-slate-700 border-b-[4px] border-black flex flex-col justify-center gap-1.5 p-1">
            <div className="w-full h-[1px] bg-black/50 shadow-[0_1px_0_rgba(255,255,255,0.1)]" />
            <div className="w-full h-[1px] bg-black/50 shadow-[0_1px_0_rgba(255,255,255,0.1)]" />
          </div>
        </div>
      </div>

      {showControls && (
        <ControlPanel
          fillLevel={currentFill}
          setFillLevel={setFillLevel}
          isBubbling={bubbling}
          toggleBubbling={toggleBubbling}
        />
      )}

      <style>{`
        @keyframes wave { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        @keyframes wave-reverse { 0% { transform: translateX(-50%); } 100% { transform: translateX(0); } }
        .animate-wave { animation: wave 4s linear infinite; }
        .animate-wave-slow { animation: wave 7s linear infinite; }
        .animate-wave-reverse { animation: wave-reverse 9s linear infinite; }
        .bg-radial-gradient { background-image: radial-gradient(circle at center, var(--tw-gradient-from) 0%, var(--tw-gradient-to) 100%); }
      `}</style>
    </div>
  );
}
