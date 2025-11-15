'use client';

import { motion } from 'framer-motion';
import { hapticMedium } from '@/lib/capacitor';

interface FABProps {
  onClick: () => void;
  icon?: JSX.Element;
  label?: string;
  className?: string;
  ariaLabel?: string;
}

export default function FAB({
  onClick,
  icon,
  label,
  className = '',
  ariaLabel = 'Floating action button',
}: FABProps) {
  const handleClick = async () => {
    await hapticMedium();
    onClick();
  };

  const defaultIcon = (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
    </svg>
  );

  return (
    <motion.button
      onClick={handleClick}
      className={`fab ${className}`}
      whileTap={{ scale: 0.9 }}
      whileHover={{ scale: 1.05 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{
        type: 'spring',
        stiffness: 260,
        damping: 20,
      }}
      aria-label={ariaLabel}
    >
      {label ? (
        <div className="flex items-center gap-2 px-4">
          {icon || defaultIcon}
          <span className="text-sm font-medium">{label}</span>
        </div>
      ) : (
        icon || defaultIcon
      )}
    </motion.button>
  );
}
