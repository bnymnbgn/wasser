const oceanDarkColors = {
  'ocean-primary': '#0EA5E9',
  'ocean-primary-light': '#38BDF8',
  'ocean-primary-dark': '#0284C7',
  'ocean-accent': '#38BDF8',
  'ocean-accent-light': '#7DD3FC',
  'ocean-background': '#0B1120',
  'ocean-surface': '#151F32',
  'ocean-surface-elevated': '#1E2A3D',
  'ocean-surface-hover': '#1A2840',
  'ocean-text-primary': '#FFFFFF',
  'ocean-text-secondary': '#CBD5E1',
  'ocean-text-tertiary': '#94A3B8',
  'ocean-text-muted': '#64748B',
  'ocean-success': '#10B981',
  'ocean-success-bg': 'rgba(16, 185, 129, 0.1)',
  'ocean-warning': '#F59E0B',
  'ocean-warning-bg': 'rgba(245, 158, 11, 0.1)',
  'ocean-error': '#EF4444',
  'ocean-error-bg': 'rgba(239, 68, 68, 0.1)',
  'ocean-info': '#3B82F6',
  'ocean-info-bg': 'rgba(59, 130, 246, 0.1)',
  'ocean-border': 'rgba(255, 255, 255, 0.1)',
  'ocean-border-strong': 'rgba(255, 255, 255, 0.2)',
  'ocean-glow': 'rgba(14, 165, 233, 0.3)',
};

/* Legacy colors - mapped to ocean system */
const legacyColors = {
  'ocean-dark': '#0B1120',
  'ocean-card': '#151F32',
  'water-primary': '#0EA5E9',
  'water-accent': '#38BDF8',
  'status-good': '#10B981',
  'status-warning': '#F59E0B',
  'status-bad': '#EF4444',
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
        // Ocean Dark Design System - primary colors
        ...oceanDarkColors,
        // Legacy support for existing code
        ...legacyColors,
        // Ocean structured palette for advanced usage
        ocean: {
          primary: {
            DEFAULT: '#0EA5E9',
            light: '#38BDF8',
            dark: '#0284C7',
          },
          accent: {
            DEFAULT: '#38BDF8',
            light: '#7DD3FC',
          },
          surface: {
            DEFAULT: '#151F32',
            elevated: '#1E2A3D',
            hover: '#1A2840',
          },
          text: {
            primary: '#FFFFFF',
            secondary: '#CBD5E1',
            tertiary: '#94A3B8',
            muted: '#64748B',
          },
          status: {
            good: '#10B981',
            warning: '#F59E0B',
            bad: '#EF4444',
            info: '#3B82F6',
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
      // Ocean border radius system
      borderRadius: {
        'ocean-sm': '12px',
        'ocean-md': '16px',
        'ocean-lg': '24px',
        'ocean-xl': '32px',
        'ocean-2xl': '48px',
      },
      // Animation
      animation: {
        'slide-up': 'slide-up 0.3s ease-out',
        'slide-down': 'slide-down 0.3s ease-out',
        'fade-in': 'fade-in 0.2s ease-out',
        'scale-in': 'scale-in 0.2s ease-out',
        'ripple': 'ripple 0.6s ease-out',
        'fill-bottle': 'fill 2s ease-in-out infinite',
        'scan-down': 'scan 3s ease-in-out infinite',
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
        fill: {
          '0%': { height: '0%' },
          '100%': { height: '100%' },
        },
        scan: {
          '0%, 100%': { top: '0%' },
          '50%': { top: '100%' },
        },
      },
      // Ocean elevation and shadows
      boxShadow: {
        'ocean-1': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'ocean-2': '0 8px 24px rgba(0, 0, 0, 0.2)',
        'ocean-3': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'ocean-4': '0 16px 64px 0 rgba(31, 38, 135, 0.5)',
        'ocean-glow': '0 0 20px rgba(14, 165, 233, 0.3)',
        'ocean-glow-strong': '0 0 40px rgba(14, 165, 233, 0.5)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        // Legacy support
        'elevation-1': '0 4px 12px rgba(0, 0, 0, 0.15)',
        'elevation-2': '0 8px 24px rgba(0, 0, 0, 0.2)',
        'elevation-3': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'elevation-4': '0 16px 64px 0 rgba(31, 38, 135, 0.5)',
        'elevation-5': '0 16px 64px 0 rgba(31, 38, 135, 0.5)',
        'glow': '0 0 20px rgba(14, 165, 233, 0.3)',
      },
      // Override border radius defaults
      borderRadius: {
        'DEFAULT': '6px',
        'none': '0',
        'sm': '4px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
        '2xl': '24px',
        '3xl': '32px',
        'full': '9999px',
        // Ocean system
        'ocean-sm': '12px',
        'ocean-md': '16px',
        'ocean-lg': '24px',
        'ocean-xl': '32px',
        'ocean-2xl': '48px',
        // Legacy support
        'md-sm': '8px',
        'md-md': '12px',
        'md-lg': '16px',
        'md-xl': '24px',
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
