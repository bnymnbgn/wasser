"use client";

import { motion } from "framer-motion";

interface LiquidLoaderProps {
    className?: string;
    color?: string;
}

export function LiquidLoader({ className = "w-6 h-6", color = "bg-water-primary" }: LiquidLoaderProps) {
    return (
        <div className={`relative overflow-hidden rounded-full bg-ocean-surface-elevated ${className}`}>
            {/* Background fill animation */}
            <motion.div
                className={`absolute inset-x-0 bottom-0 ${color}`}
                initial={{ height: "10%" }}
                animate={{ height: ["10%", "90%", "10%"] }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                style={{ opacity: 0.3 }}
            />

            {/* Rotating wave effect */}
            <motion.div
                className={`absolute -left-[50%] -bottom-[50%] w-[200%] h-[200%] rounded-[40%] ${color}`}
                animate={{ rotate: 360 }}
                transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                }}
                style={{ opacity: 0.6 }}
            />

            {/* Second wave for depth */}
            <motion.div
                className={`absolute -left-[50%] -bottom-[52%] w-[200%] h-[200%] rounded-[42%] ${color}`}
                animate={{ rotate: -360 }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                }}
                style={{ opacity: 0.4 }}
            />
        </div>
    );
}
