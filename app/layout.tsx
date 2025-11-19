import type { Metadata, Viewport } from 'next';
import './globals.css';

// Minimal root layout - NO providers, NO app-specific logic
// This keeps the landing page lightweight and SEO-friendly
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
        {children}
      </body>
    </html>
  );
}
