const materialLightColors = {
  'md-primary': '#006494',
  'md-primary-light': '#4A9FD4',
  'md-primary-dark': '#003A5C',
  'md-primary-container': '#C2E7FF',
  'md-onPrimary': '#FFFFFF',
  'md-onPrimary-container': '#001E2E',
  'md-secondary': '#10B981',
  'md-secondary-light': '#34D399',
  'md-secondary-dark': '#059669',
  'md-secondary-container': '#D1FAE5',
  'md-onSecondary': '#FFFFFF',
  'md-onSecondary-container': '#022C22',
  'md-surface': '#F8FAFC',
  'md-surface-dim': '#E2E8F0',
  'md-surface-bright': '#FFFFFF',
  'md-surface-container': '#EFF6FF',
  'md-surface-containerLow': '#F1F5F9',
  'md-surface-containerHigh': '#E0E7FF',
  'md-onSurface': '#1E293B',
  'md-onSurface-variant': '#475569',
  'md-background': '#FFFFFF',
  'md-onBackground': '#1E293B',
  'md-error': '#EF4444',
  'md-error-container': '#FEE2E2',
  'md-onError': '#FFFFFF',
  'md-onError-container': '#7F1D1D',
  'md-success': '#10B981',
  'md-success-container': '#D1FAE5',
  'md-onSuccess': '#FFFFFF',
  'md-onSuccess-container': '#022C22',
  'md-warning': '#F59E0B',
  'md-warning-container': '#FEF3C7',
  'md-onWarning': '#FFFFFF',
  'md-onWarning-container': '#78350F',
};

const materialDarkColors = {
  'md-dark-primary': '#80CAFF',
  'md-dark-primary-container': '#004A77',
  'md-dark-onPrimary': '#003551',
  'md-dark-onPrimary-container': '#C2E7FF',
  'md-dark-secondary': '#6EE7B7',
  'md-dark-secondary-container': '#047857',
  'md-dark-onSecondary': '#065F46',
  'md-dark-onSecondary-container': '#D1FAE5',
  'md-dark-surface': '#0F172A',
  'md-dark-surface-dim': '#020617',
  'md-dark-surface-bright': '#334155',
  'md-dark-surface-container': '#1E293B',
  'md-dark-surface-containerLow': '#0F172A',
  'md-dark-surface-containerHigh': '#334155',
  'md-dark-onSurface': '#E2E8F0',
  'md-dark-onSurface-variant': '#94A3B8',
  'md-dark-background': '#0F172A',
  'md-dark-onBackground': '#E2E8F0',
  'md-dark-error': '#F87171',
  'md-dark-error-container': '#7F1D1D',
  'md-dark-onError': '#450A0A',
  'md-dark-onError-container': '#FEE2E2',
  'md-dark-success': '#6EE7B7',
  'md-dark-success-container': '#065F46',
  'md-dark-onSuccess': '#022C22',
  'md-dark-onSuccess-container': '#D1FAE5',
  'md-dark-warning': '#FBBF24',
  'md-dark-warning-container': '#78350F',
  'md-dark-onWarning': '#451A03',
  'md-dark-onWarning-container': '#FEF3C7',
};

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
        // Provide flattened tokens to match the utility classes used in the app
        ...materialLightColors,
        ...materialDarkColors,
        // Keep structured palettes for potential future theming logic
        md: {
          primary: {
            DEFAULT: '#006494',
            light: '#4A9FD4',
            dark: '#003A5C',
            container: '#C2E7FF',
            onPrimary: '#FFFFFF',
            onContainer: '#001E2E',
          },
          secondary: {
            DEFAULT: '#10B981',
            light: '#34D399',
            dark: '#059669',
            container: '#D1FAE5',
            onSecondary: '#FFFFFF',
            onContainer: '#022C22',
          },
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
          background: '#FFFFFF',
          onBackground: '#1E293B',
          error: {
            DEFAULT: '#EF4444',
            container: '#FEE2E2',
            onError: '#FFFFFF',
            onContainer: '#7F1D1D',
          },
          success: {
            DEFAULT: '#10B981',
            container: '#D1FAE5',
            onSuccess: '#FFFFFF',
            onContainer: '#022C22',
          },
          warning: {
            DEFAULT: '#F59E0B',
            container: '#FEF3C7',
            onWarning: '#FFFFFF',
            onContainer: '#78350F',
          },
        },
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
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
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
      // Additional utilities
      scale: {
        '98': '0.98',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
};
