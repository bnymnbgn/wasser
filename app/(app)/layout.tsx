import type { Metadata, Viewport } from 'next';
import { ThemeProvider } from '@/src/components/ThemeProvider';
import { DatabaseProvider } from '@/src/contexts/DatabaseContext';
import { ConsumptionProvider } from '@/src/contexts/ConsumptionContext';
import { ComparisonProvider } from '@/src/contexts/ComparisonContext';
import { ComparisonDrawer } from '@/src/components/ComparisonDrawer';
import { ProfileBottomSheet } from '@/src/components/ProfileBottomSheet';
import { AppBackgroundToggle } from '@/src/components/AppBackgroundToggle';

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
          <ConsumptionProvider>
            <AppBackgroundToggle />
            <div className="flex flex-col min-h-screen relative z-10">
              <div className="flex-1 flex flex-col">
                {children}
              </div>
            </div>
            <ComparisonDrawer />
            <ProfileBottomSheet />
          </ConsumptionProvider>
        </DatabaseProvider>
      </ComparisonProvider>
    </ThemeProvider>
  );
}
