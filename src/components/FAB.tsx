"use client";

import { motion } from "framer-motion";
import { ScanLine } from "lucide-react";
import Link from "next/link";
import { hapticMedium } from "@/lib/capacitor";

interface FABProps {
  href?: string;
  onClick?: () => void;
  icon?: React.ReactNode;
  label?: string;
  ariaLabel?: string;
  className?: string;
}

export default function FAB({
  href = "/scan",
  onClick,
  icon,
  label = "Scannen",
  ariaLabel = "Floating action button",
  className = "",
}: FABProps) {
  const handleClick = async () => {
    await hapticMedium();
    onClick?.();
  };

  const content = (
    <motion.div
      className={`fab group ${className}`}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
      }}
      onClick={handleClick}
    >
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 opacity-100 group-hover:opacity-90 transition-opacity shadow-lg" />
      <div className="relative z-10 flex items-center justify-center">
        {icon || <ScanLine className="w-7 h-7 text-white" strokeWidth={2.5} />}
      </div>
      {label && (
        <span className="absolute right-full mr-3 whitespace-nowrap rounded-full bg-slate-900 dark:bg-slate-800 px-4 py-2 text-sm font-medium text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg pointer-events-none">
          {label}
        </span>
      )}
    </motion.div>
  );

  if (href) {
    return (
      <Link href={href} aria-label={ariaLabel}>
        {content}
      </Link>
    );
  }

  return (
    <button aria-label={ariaLabel} className="fixed bottom-24 right-6 z-50">
      {content}
    </button>
  );
}
