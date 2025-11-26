"use client";

import { motion } from "framer-motion";
import { Droplet } from "lucide-react";

export function InitialLoadingScreen() {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-ocean-background text-white">
            <div className="relative flex items-center justify-center mb-8">
                {/* Ripple Effect */}
                <motion.div
                    animate={{
                        scale: [1, 2],
                        opacity: [0.5, 0],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeOut",
                    }}
                    className="absolute h-20 w-20 rounded-full bg-sky-500/30"
                />
                <motion.div
                    animate={{
                        scale: [1, 1.5],
                        opacity: [0.5, 0],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeOut",
                        delay: 0.5,
                    }}
                    className="absolute h-20 w-20 rounded-full bg-sky-500/30"
                />

                {/* Icon */}
                <motion.div
                    animate={{
                        y: [0, -10, 0],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                    className="relative z-10 p-6 rounded-full bg-ocean-surface border border-ocean-border shadow-2xl"
                >
                    <Droplet className="w-12 h-12 text-sky-500 fill-sky-500" />
                </motion.div>
            </div>

            <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-xl font-bold text-ocean-primary mb-2"
            >
                Wasserscan wird vorbereitet
            </motion.h2>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-sm text-ocean-secondary max-w-xs text-center px-4"
            >
                Datenbank wird initialisiert und Produktdaten geladen. Dies passiert nur beim ersten Start.
            </motion.p>
        </div>
    );
}
