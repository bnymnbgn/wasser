'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { setStatusBarStyle, setStatusBarColor } from '@/lib/capacitor';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'trinkwasser-theme',
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  // Load theme from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(storageKey) as Theme | null;
    if (stored) {
      setThemeState(stored);
    }
  }, [storageKey]);

  // Resolve system theme preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const updateResolvedTheme = () => {
      const isDark =
        theme === 'dark' || (theme === 'system' && mediaQuery.matches);
      setResolvedTheme(isDark ? 'dark' : 'light');

      // Update DOM
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      // Update native status bar
      setStatusBarStyle(isDark);
      setStatusBarColor(isDark ? '#0F172A' : '#FFFFFF');
    };

    updateResolvedTheme();

    // Listen for system theme changes
    mediaQuery.addEventListener('change', updateResolvedTheme);
    return () => mediaQuery.removeEventListener('change', updateResolvedTheme);
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(storageKey, newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
