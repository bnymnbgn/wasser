import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from '@/src/components/ThemeProvider';
import { DatabaseProvider } from '@/src/contexts/DatabaseContext';
import BottomNav from '@/src/components/BottomNav';
import { ComparisonProvider } from '@/src/contexts/ComparisonContext';
import { ComparisonDrawer } from '@/src/components/ComparisonDrawer';
import { LivingBackground } from '@/src/components/ui/LivingBackground';

// App-specific metadata (overrides root)
export const metadata: Metadata = {
  title: 'Wasserscan - Trinkwasser Analyse App',
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

// App-specific layout with all providers and BottomNav
// This is ONLY loaded for app routes, NOT for landing page
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider defaultTheme="system">
      <ComparisonProvider>
        <DatabaseProvider>
          <LivingBackground />
          <div className="min-h-screen pb-[calc(var(--bottom-nav-height)+env(safe-area-inset-bottom))]">
            {children}
          </div>
          <ComparisonDrawer />
          <BottomNav />
        </DatabaseProvider>
      </ComparisonProvider>
    </ThemeProvider>
  );
}
