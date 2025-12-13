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
      main: '#137fec',  // Mockup primary color
    },
    secondary: {
      main: '#6366F1',
    },
    background: {
      default: '#080c15',  // Mockup background-dark
      paper: '#111827',    // Mockup surface-dark
    },
    error: { main: '#F87171' },    // accent-bad
    warning: { main: '#FBBF24' },  // accent-warn
    success: { main: '#34D399' },  // accent-good
    surface: {
      muted: 'rgba(255,255,255,0.05)',
      card: '#111827',
      border: 'rgba(255,255,255,0.05)',
    },
    divider: 'rgba(255,255,255,0.05)',
  },
  typography: {
    fontFamily: inter.style.fontFamily,
  },
  shape: {
    borderRadius: 24,  // Larger rounded corners from mockup
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
