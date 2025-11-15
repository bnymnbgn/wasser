/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Material Design 3 Color System
        md: {
          // Primary (Water/Blue theme)
          primary: {
            DEFAULT: '#006494',
            light: '#4A9FD4',
            dark: '#003A5C',
            container: '#C2E7FF',
            onPrimary: '#FFFFFF',
            onContainer: '#001E2E',
          },
          // Secondary (Emerald accent)
          secondary: {
            DEFAULT: '#10B981',
            light: '#34D399',
            dark: '#059669',
            container: '#D1FAE5',
            onSecondary: '#FFFFFF',
            onContainer: '#022C22',
          },
          // Surface colors
          surface: {
            DEFAULT: '#F8FAFC',
            dim: '#E2E8F0',
            bright: '#FFFFFF',
            container: '#EFF6FF',
            containerLow: '#F1F5F9',
            containerHigh: '#E0E7FF',
            onSurface: '#1E293B',
            onSurfaceVariant: '#475569',
          },
          // Background
          background: '#FFFFFF',
          onBackground: '#1E293B',
          // Error states
          error: {
            DEFAULT: '#EF4444',
            container: '#FEE2E2',
            onError: '#FFFFFF',
            onContainer: '#7F1D1D',
          },
          // Success states
          success: {
            DEFAULT: '#10B981',
            container: '#D1FAE5',
            onSuccess: '#FFFFFF',
            onContainer: '#022C22',
          },
          // Warning states
          warning: {
            DEFAULT: '#F59E0B',
            container: '#FEF3C7',
            onWarning: '#FFFFFF',
            onContainer: '#78350F',
          },
        },
        // Dark mode colors
        'md-dark': {
          primary: {
            DEFAULT: '#80CAFF',
            container: '#004A77',
            onPrimary: '#003551',
            onContainer: '#C2E7FF',
          },
          secondary: {
            DEFAULT: '#6EE7B7',
            container: '#047857',
            onSecondary: '#065F46',
            onContainer: '#D1FAE5',
          },
          surface: {
            DEFAULT: '#0F172A',
            dim: '#020617',
            bright: '#334155',
            container: '#1E293B',
            containerLow: '#0F172A',
            containerHigh: '#334155',
            onSurface: '#E2E8F0',
            onSurfaceVariant: '#94A3B8',
          },
          background: '#0F172A',
          onBackground: '#E2E8F0',
          error: {
            DEFAULT: '#F87171',
            container: '#7F1D1D',
            onError: '#450A0A',
            onContainer: '#FEE2E2',
          },
          success: {
            DEFAULT: '#6EE7B7',
            container: '#065F46',
            onSuccess: '#022C22',
            onContainer: '#D1FAE5',
          },
          warning: {
            DEFAULT: '#FBBF24',
            container: '#78350F',
            onWarning: '#451A03',
            onContainer: '#FEF3C7',
          },
        },
      },
      // Mobile-first spacing
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      // Touch-friendly sizing
      minHeight: {
        'touch': '48px',
        'touch-lg': '56px',
      },
      minWidth: {
        'touch': '48px',
        'touch-lg': '56px',
      },
      // Animation
      animation: {
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'ripple': 'ripple 0.6s ease-out',
      },
      keyframes: {
        'slide-up': {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'slide-down': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'scale-in': {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'ripple': {
          '0%': { transform: 'scale(0)', opacity: '0.5' },
          '100%': { transform: 'scale(4)', opacity: '0' },
        },
      },
      // Elevation shadows (Material Design)
      boxShadow: {
        'elevation-1': '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
        'elevation-2': '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
        'elevation-3': '0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px rgba(0, 0, 0, 0.3)',
        'elevation-4': '0px 6px 10px 4px rgba(0, 0, 0, 0.15), 0px 2px 3px rgba(0, 0, 0, 0.3)',
        'elevation-5': '0px 8px 12px 6px rgba(0, 0, 0, 0.15), 0px 4px 4px rgba(0, 0, 0, 0.3)',
      },
      // Mobile-optimized border radius
      borderRadius: {
        'md-sm': '8px',
        'md-md': '12px',
        'md-lg': '16px',
        'md-xl': '28px',
      },
    },
  },
  plugins: [],
};