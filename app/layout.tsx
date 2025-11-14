import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Trinkwasser-Check',
  description: 'Bewerte Trinkwasser-Qualität auf Basis von Etikett-Daten und Barcodes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}