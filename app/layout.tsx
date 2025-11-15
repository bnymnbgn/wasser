import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import BottomNav from '@/components/BottomNav';

export const metadata: Metadata = {
  title: 'Trinkwasser-Check',
  description: 'Bewerte Trinkwasser-Qualität auf Basis von Etikett-Daten und Barcodes',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Trinkwasser-Check',
  },
  formatDetection: {
    telephone: false,
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
      <body className="overscroll-none">
        <ThemeProvider defaultTheme="system">
          <div className="min-h-screen pb-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom))]">
            {children}
          </div>
          <BottomNav />
        </ThemeProvider>
      </body>
    </html>
  );
}