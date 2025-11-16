"use client";

import clsx from "clsx";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular" | "rounded";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
}

export function Skeleton({
  className,
  variant = "text",
  width,
  height,
  animation = "pulse",
}: SkeletonProps) {
  const variantClasses = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-none",
    rounded: "rounded-2xl",
  };

  const animationClasses = {
    pulse: "animate-pulse",
    wave: "animate-shimmer",
    none: "",
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height) style.height = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={clsx(
        "bg-slate-200 dark:bg-slate-700",
        variantClasses[variant],
        animationClasses[animation],
        className
      )}
      style={style}
    />
  );
}

export function SkeletonCard() {
  return (
    <div className="modern-card p-4 space-y-3">
      <div className="flex items-start justify-between">
        <Skeleton variant="circular" width={48} height={48} />
        <Skeleton variant="text" width={60} height={20} />
      </div>
      <Skeleton variant="text" width="60%" height={32} />
      <Skeleton variant="text" width="40%" height={16} />
    </div>
  );
}

export function SkeletonList({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonScoreCard() {
  return (
    <div className="modern-card p-6 space-y-6">
      <div className="flex flex-col items-center">
        <Skeleton variant="circular" width={160} height={160} />
        <Skeleton variant="text" width={120} height={24} className="mt-4" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={80} />
        ))}
      </div>
    </div>
  );
}
