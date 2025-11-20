"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import clsx from "clsx";

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  variant?: "default" | "primary" | "success" | "warning";
  className?: string;
}

export function StatCard({
  icon: Icon,
  value,
  label,
  trend,
  trendValue,
  variant = "default",
  className,
}: StatCardProps) {
  const variantClasses = {
    default: "ocean-card",
    primary: "ocean-card border-ocean-primary/50",
    success: "ocean-card border-ocean-success/50 ocean-success-bg",
    warning: "ocean-card border-ocean-warning/50 ocean-warning-bg",
  };

  const iconColors = {
    default: "text-ocean-secondary bg-ocean-surface-elevated",
    primary: "text-ocean-primary bg-ocean-primary/20",
    success: "text-ocean-success bg-ocean-success/20",
    warning: "text-ocean-warning bg-ocean-warning/20",
  };

  return (
    <motion.div
      className={clsx(
        "stat-card rounded-ocean-lg p-4 border ocean-shadow-3",
        variantClasses[variant],
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className={clsx("rounded-ocean-md p-2.5", iconColors[variant])}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && trendValue && (
          <span
            className={clsx(
              "text-xs font-medium flex items-center gap-1",
              trend === "up" && "ocean-success",
              trend === "down" && "ocean-error",
              trend === "neutral" && "text-ocean-secondary"
            )}
          >
            {trend === "up" && "↗"}
            {trend === "down" && "↘"}
            {trendValue}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <div className="text-2xl font-bold text-ocean-primary">
          {value}
        </div>
        <div className="text-sm text-ocean-secondary">
          {label}
        </div>
      </div>
    </motion.div>
  );
}
