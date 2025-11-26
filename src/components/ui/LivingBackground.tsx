"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function LivingBackground() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none bg-[#020617]">
            {/* 
        PREMIUM LAYER STACK 
        We use 'mix-blend-mode: plus-lighter' (or screen/overlay) to create 
        additive light effects that look like real caustics/refractions.
      */}

            {/* 1. Deep Base Gradient - The "Abyss" */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0f172a] via-[#020617] to-[#000000]" />

            {/* 2. Primary Light Beam - Cyan/Blue */}
            <motion.div
                className="absolute top-[-20%] left-[-10%] w-[80%] h-[80%] rounded-full opacity-40 blur-[100px]"
                style={{
                    background: "radial-gradient(circle, rgba(14,165,233,0.8) 0%, rgba(14,165,233,0) 70%)",
                    mixBlendMode: "screen",
                }}
                animate={{
                    x: [0, 50, -30, 0],
                    y: [0, 30, -50, 0],
                    scale: [1, 1.1, 0.95, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* 3. Secondary Light Beam - Teal/Accent */}
            <motion.div
                className="absolute bottom-[-10%] right-[-20%] w-[70%] h-[70%] rounded-full opacity-30 blur-[120px]"
                style={{
                    background: "radial-gradient(circle, rgba(56,189,248,0.8) 0%, rgba(56,189,248,0) 70%)",
                    mixBlendMode: "screen",
                }}
                animate={{
                    x: [0, -40, 60, 0],
                    y: [0, -60, 30, 0],
                    scale: [1, 1.2, 0.9, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2,
                }}
            />

            {/* 4. The "Caustic" Mesh - Moving Highlights */}
            <motion.div
                className="absolute top-[30%] left-[20%] w-[60%] h-[60%] rounded-full opacity-20 blur-[80px]"
                style={{
                    background: "conic-gradient(from 0deg, transparent 0deg, rgba(125,211,252,0.5) 180deg, transparent 360deg)",
                    mixBlendMode: "plus-lighter",
                }}
                animate={{
                    rotate: [0, 360],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    rotate: { duration: 40, repeat: Infinity, ease: "linear" },
                    scale: { duration: 15, repeat: Infinity, ease: "easeInOut", repeatType: "reverse" },
                }}
            />

            {/* 5. Micro-Bubbles - "Champagne" Effect */}
            <div className="absolute inset-0">
                {[...Array(12)].map((_, i) => (
                    <PremiumBubble key={i} index={i} />
                ))}
            </div>

            {/* 6. Film Grain / Noise Overlay - Essential for "Premium" feel (removes banding) */}
            <div
                className="absolute inset-0 opacity-[0.04] mix-blend-overlay pointer-events-none"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                }}
            />
        </div>
    );
}

function PremiumBubble({ index }: { index: number }) {
    const size = 2 + Math.random() * 4; // Much smaller: 2px - 6px
    const left = Math.random() * 100;
    const duration = 10 + Math.random() * 20;
    const delay = Math.random() * 20;

    return (
        <motion.div
            className="absolute -bottom-4 rounded-full bg-white/20 backdrop-blur-[1px]"
            style={{
                left: `${left}%`,
                width: size,
                height: size,
                boxShadow: "0 0 4px rgba(255,255,255,0.4)", // Subtle glow
            }}
            animate={{
                y: [0, -1200],
                x: [0, Math.sin(index) * 20, 0, Math.cos(index) * -20, 0], // Gentle sway
                opacity: [0, 0.4, 0.6, 0], // Fade in then out
            }}
            transition={{
                duration: duration,
                repeat: Infinity,
                ease: "linear",
                delay: delay,
            }}
        />
    );
}
