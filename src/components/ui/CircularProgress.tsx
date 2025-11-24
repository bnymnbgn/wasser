"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

interface CircularProgressProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: "primary" | "success" | "warning" | "error";
  showValue?: boolean;
  className?: string;
}

export function CircularProgress({
  value,
  size = 120,
  strokeWidth = 8,
  color = "primary",
  showValue = true,
  className = "",
}: CircularProgressProps) {
  const normalizedValue = Math.min(Math.max(value, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (normalizedValue / 100) * circumference;

  const colorClasses = {
    primary: "stroke-blue-500 dark:stroke-blue-400",
    success: "stroke-emerald-500 dark:stroke-emerald-400",
    warning: "stroke-amber-500 dark:stroke-amber-400",
    error: "stroke-red-500 dark:stroke-red-400",
  };

  const scoreColor =
    normalizedValue >= 80 ? "text-emerald-600 dark:text-emerald-400"
      : normalizedValue >= 50 ? "text-amber-600 dark:text-amber-400"
        : "text-red-600 dark:text-red-400";

  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    const controls = animate(count, normalizedValue, { duration: 1, ease: "easeOut" });
    return controls.stop;
  }, [normalizedValue, count]);

  return (
    <div className={`circular-progress ${className}`} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-200 dark:text-slate-700"
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={colorClasses[color]}
          style={{
            strokeDasharray: circumference,
          }}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: "easeInOut" }}
        />
      </svg>

      {showValue && (
        <motion.div
          className="absolute inset-0 flex flex-col items-center justify-center"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <motion.span className={`text-4xl font-bold ${scoreColor}`}>
            {rounded}
          </motion.span>
          <span className="text-sm text-slate-600 dark:text-slate-400">von 100</span>
        </motion.div>
      )}
    </div>
  );
}
