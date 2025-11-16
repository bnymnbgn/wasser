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
    default: "bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-700/60",
    primary: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200/60 dark:border-blue-800/60",
    success: "bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/50 dark:to-emerald-900/50 border-emerald-200/60 dark:border-emerald-800/60",
    warning: "bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/50 dark:to-amber-900/50 border-amber-200/60 dark:border-amber-800/60",
  };

  const iconColors = {
    default: "text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800",
    primary: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50",
    success: "text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/50",
    warning: "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/50",
  };

  return (
    <motion.div
      className={clsx(
        "stat-card rounded-[24px] p-4 border shadow-lg",
        variantClasses[variant],
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className={clsx("rounded-2xl p-2.5", iconColors[variant])}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && trendValue && (
          <span
            className={clsx(
              "text-xs font-medium flex items-center gap-1",
              trend === "up" && "text-emerald-600 dark:text-emerald-400",
              trend === "down" && "text-red-600 dark:text-red-400",
              trend === "neutral" && "text-slate-600 dark:text-slate-400"
            )}
          >
            {trend === "up" && "↗"}
            {trend === "down" && "↘"}
            {trendValue}
          </span>
        )}
      </div>
      <div className="space-y-1">
        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          {value}
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-400">
          {label}
        </div>
      </div>
    </motion.div>
  );
}
