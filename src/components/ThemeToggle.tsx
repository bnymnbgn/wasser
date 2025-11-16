'use client';

import { useTheme } from './ThemeProvider';
import { motion } from 'framer-motion';
import { hapticLight } from '@/lib/capacitor';

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const handleToggle = async () => {
    await hapticLight();
    // Cycle through: system -> light -> dark -> system
    if (theme === 'system') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('dark');
    } else {
      setTheme('system');
    }
  };

  const getIcon = () => {
    if (theme === 'system') {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      );
    } else if (theme === 'light') {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      );
    } else {
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      );
    }
  };

  const getLabel = () => {
    if (theme === 'system') return 'System';
    if (theme === 'light') return 'Hell';
    return 'Dunkel';
  };

  return (
    <motion.button
      onClick={handleToggle}
      className="inline-flex items-center gap-2 rounded-2xl border border-white/40 dark:border-white/10 bg-white/80 dark:bg-slate-900/70 text-md-onSurface dark:text-md-dark-onSurface px-3 py-2 backdrop-blur-xl shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-md-primary/50 transition-all"
      whileTap={{ scale: 0.95 }}
      aria-label={`Theme ändern (aktuell: ${getLabel()})`}
      aria-live="polite"
    >
      <motion.div
        key={theme}
        initial={{ rotate: -180, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {getIcon()}
      </motion.div>
      <span className="text-sm font-medium">{getLabel()}</span>
    </motion.button>
  );
}
