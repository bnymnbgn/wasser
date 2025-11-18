import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/src/components/ThemeProvider';
import { DatabaseProvider } from '@/src/contexts/DatabaseContext';
import ConditionalBottomNav from '@/src/components/ConditionalBottomNav';

export const metadata: Metadata = {
  title: 'Wasserscan',
  description: 'Bewerte Trinkwasser-Qualität auf Basis von Etikett-Daten und Barcodes',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Wasserscan',
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'mobile-web-app-capable': 'yes',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FFFFFF' },
    { media: '(prefers-color-scheme: dark)', color: '#0F172A' },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de" suppressHydrationWarning>
      <body className="font-sans overscroll-none antialiased">
        <ThemeProvider defaultTheme="system">
          <DatabaseProvider>
            {children}
            <ConditionalBottomNav />
          </DatabaseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
