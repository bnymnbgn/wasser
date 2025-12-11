import { createTheme } from '@mui/material/styles';
import { Inter } from 'next/font/google';

const inter = Inter({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

declare module '@mui/material/styles' {
  interface Palette {
    surface: {
      muted: string;
      card: string;
      border: string;
    };
  }
  interface PaletteOptions {
    surface?: {
      muted?: string;
      card?: string;
      border?: string;
    };
  }
}

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#0EA5E9',
    },
    secondary: {
      main: '#6366F1',
    },
    background: {
      default: '#0B1120',
      paper: '#0F172A',
    },
    error: { main: '#EF4444' },
    warning: { main: '#F59E0B' },
    success: { main: '#10B981' },
    surface: {
      muted: 'rgba(255,255,255,0.05)',
      card: '#0F172A',
      border: 'rgba(148,163,184,0.3)',
    },
    divider: 'rgba(148,163,184,0.3)',
  },
  typography: {
    fontFamily: inter.style.fontFamily,
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 9999,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});
