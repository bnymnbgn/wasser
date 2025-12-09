/**
 * Material Design 3 Theme für Wasser App
 * Behält Ocean Dark Design bei, strukturiert es aber nach Material Guidelines
 */

import { createTheme, ThemeOptions } from '@mui/material/styles';

// Deine bestehenden Ocean Dark Farben
const oceanColors = {
  primary: '#0EA5E9',
  primaryLight: '#38BDF8',
  primaryDark: '#0284C7',
  secondary: '#6366F1',
  secondaryLight: '#818CF8',
  secondaryDark: '#4F46E5',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  background: '#0B1120',
  surface: '#1E293B',
  surfaceLight: '#334155',
};

export const oceanDarkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: oceanColors.primary,
      light: oceanColors.primaryLight,
      dark: oceanColors.primaryDark,
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: oceanColors.secondary,
      light: oceanColors.secondaryLight,
      dark: oceanColors.secondaryDark,
      contrastText: '#FFFFFF',
    },
    success: {
      main: oceanColors.success,
    },
    warning: {
      main: oceanColors.warning,
    },
    error: {
      main: oceanColors.error,
    },
    background: {
      default: oceanColors.background,
      paper: oceanColors.surface,
    },
    text: {
      primary: 'rgba(255, 255, 255, 0.95)',
      secondary: 'rgba(255, 255, 255, 0.7)',
      disabled: 'rgba(255, 255, 255, 0.5)',
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },

  shape: {
    borderRadius: 16, // ocean-md
  },

  typography: {
    fontFamily: 'var(--font-inter), -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',

    // Material Design 3 Typography Scale
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      textTransform: 'none', // Android bevorzugt sentence case
      fontWeight: 500,
    },
  },

  components: {
    MuiBottomNavigation: {
      styleOverrides: {
        root: {
          height: 64,
          backgroundColor: 'rgba(30, 41, 59, 0.8)',
          backdropFilter: 'blur(24px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          // Safe area handling
          paddingBottom: 'var(--safe-area-inset-bottom, 0px)',
        },
      },
    },

    MuiBottomNavigationAction: {
      styleOverrides: {
        root: {
          minWidth: 64,
          color: 'rgba(255, 255, 255, 0.6)',
          '&.Mui-selected': {
            color: oceanColors.primary,
          },
          // Material ripple
          '&:active': {
            backgroundColor: 'rgba(14, 165, 233, 0.12)',
          },
        },
        label: {
          fontSize: '0.75rem',
          fontWeight: 500,
          '&.Mui-selected': {
            fontSize: '0.75rem',
          },
        },
      },
    },

    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '12px 24px',
          fontSize: '1rem',
          fontWeight: 500,
          // Minimum touch target
          minHeight: 48,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },

    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiFilledInput-root': {
            backgroundColor: 'rgba(51, 65, 85, 0.4)',
            backdropFilter: 'blur(8px)',
            borderRadius: 12,
            '&:hover': {
              backgroundColor: 'rgba(51, 65, 85, 0.5)',
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(51, 65, 85, 0.6)',
            },
            '&:before, &:after': {
              display: 'none', // Remove underline
            },
          },
        },
      },
    },

    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        },
        elevation2: {
          boxShadow: '0 2px 4px 0 rgba(0, 0, 0, 0.3)',
        },
        elevation4: {
          boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.3)',
        },
        elevation8: {
          boxShadow: '0 8px 16px 0 rgba(0, 0, 0, 0.3)',
        },
      },
    },

    MuiSwipeableDrawer: {
      styleOverrides: {
        paper: {
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          backgroundColor: 'rgba(30, 41, 59, 0.95)',
          backdropFilter: 'blur(24px)',
          maxHeight: '90vh',
        },
      },
    },

    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundColor: 'rgba(30, 41, 59, 0.6)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        },
      },
    },

    MuiFab: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 12px 0 rgba(14, 165, 233, 0.4)',
        },
      },
    },
  },

  // Material Motion System
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300, // Standard
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
      emphasized: 500, // Emphasized
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0.0, 0.2, 1)', // Standard
      easeOut: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0.0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0.0, 0.6, 1)',
      emphasized: 'cubic-bezier(0.2, 0, 0, 1.0)', // Emphasized
      emphasizedDecelerate: 'cubic-bezier(0.05, 0.7, 0.1, 1.0)',
      emphasizedAccelerate: 'cubic-bezier(0.3, 0.0, 0.8, 0.15)',
    },
  },
} as ThemeOptions);

// Custom motion utilities
export const materialMotion = {
  emphasized: {
    duration: 500,
    easing: 'cubic-bezier(0.2, 0, 0, 1.0)',
  },
  standard: {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
  },
  emphasizedDecelerate: {
    duration: 400,
    easing: 'cubic-bezier(0.05, 0.7, 0.1, 1.0)',
  },
  emphasizedAccelerate: {
    duration: 200,
    easing: 'cubic-bezier(0.3, 0.0, 0.8, 0.15)',
  },
};
