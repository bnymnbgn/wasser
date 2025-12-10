import type { Metadata, Viewport } from 'next';
import './globals.css';
import ThemeRegistry from '@/src/components/ThemeRegistry/ThemeRegistry';
import { MobileNav } from '@/src/components/MobileNav';
import { AppContent } from '@/src/components/AppContent';

export const metadata: Metadata = {
  title: 'Wasserscan',
  description: 'Intelligente Wasserqualität-Analyse',
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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var storageKey = 'wasserscan-theme';
                  var stored = localStorage.getItem(storageKey);
                  var isDark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })()
            `,
          }}
        />
        <ThemeRegistry>
          <AppContent>
            <div className="min-h-screen relative pb-[calc(80px+env(safe-area-inset-bottom))]">
              {children}
            </div>
          </AppContent>
          <MobileNav />
        </ThemeRegistry>
      </body>
    </html>
  );
}
