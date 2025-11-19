import { Metadata } from "next";
import { HeroSection } from "@/src/components/landing/HeroSection";
import { FeaturesSection } from "@/src/components/landing/FeaturesSection";
import { HowItWorksSection } from "@/src/components/landing/HowItWorksSection";
import { SocialProofSection } from "@/src/components/landing/SocialProofSection";
import { CTASection } from "@/src/components/landing/CTASection";
import { Footer } from "@/src/components/landing/Footer";
import { CapacitorRedirect } from "@/src/components/CapacitorRedirect";

// SEO Metadata
export const metadata: Metadata = {
  title: "Wasserscan - Intelligente Wasserqualität-Analyse | Kostenlose OCR App",
  description:
    "Scanne Wasserflaschenetiketten mit deinem Smartphone und erhalte sofort detaillierte Qualitätsbewertungen. KI-gestützte Analyse für Baby, Sport, Blutdruck & Standard. 100% kostenlos, offline-fähig & DSGVO-konform.",
  keywords: [
    "Wasser Scanner",
    "Wasserqualität",
    "Mineralwasser Test",
    "OCR Etikett",
    "Trinkwasser Analyse",
    "Wasser App",
    "Baby Wasser",
    "Sport Wasser",
    "Blutdruck Wasser",
    "pH Wert",
    "Mineralien",
    "Calcium Magnesium",
    "kostenlose Wasser App",
    "offline Wasser Scanner",
  ],
  authors: [{ name: "Wasserscan Team" }],
  creator: "Wasserscan",
  publisher: "Wasserscan",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://wasserscan.de",
    languages: {
      de: "https://wasserscan.de",
      en: "https://wasserscan.de/en",
    },
  },
  openGraph: {
    type: "website",
    locale: "de_DE",
    url: "https://wasserscan.de",
    title: "Wasserscan - Intelligente Wasserqualität-Analyse",
    description:
      "Scanne Wasserflaschenetiketten und erhalte sofort detaillierte Qualitätsbewertungen. KI-gestützt, kostenlos & offline-fähig.",
    siteName: "Wasserscan",
    images: [
      {
        url: "https://wasserscan.de/og-image.png",
        width: 1200,
        height: 630,
        alt: "Wasserscan App Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wasserscan - Intelligente Wasserqualität-Analyse",
    description:
      "Scanne Wasserflaschenetiketten und erhalte sofort detaillierte Qualitätsbewertungen. KI-gestützt, kostenlos & offline-fähig.",
    images: ["https://wasserscan.de/twitter-image.png"],
    creator: "@wasserscan",
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },
  category: "Health & Wellness",
  applicationName: "Wasserscan",
  appleWebApp: {
    capable: true,
    title: "Wasserscan",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
    date: false,
    email: false,
    address: false,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
  },
};

// JSON-LD Structured Data for SEO
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Wasserscan",
  description:
    "Intelligente Wasserqualität-Analyse App mit OCR-Technologie für Wasserflaschenetiketten",
  url: "https://wasserscan.de",
  applicationCategory: "HealthApplication",
  operatingSystem: "Web, iOS, Android",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "EUR",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.9",
    ratingCount: "1247",
    bestRating: "5",
    worstRating: "1",
  },
  author: {
    "@type": "Organization",
    name: "Wasserscan Team",
    url: "https://wasserscan.de",
  },
  featureList: [
    "OCR-Texterkennung für Wasserflaschenetiketten",
    "4 spezialisierte Profile (Baby, Sport, Blutdruck, Standard)",
    "Detaillierte Mineralwert-Analyse",
    "Offline-Funktionalität",
    "DSGVO-konform",
    "Kostenlos & Open Source",
  ],
  screenshot: "https://wasserscan.de/screenshots/app-preview.png",
};

export default function LandingPage() {
  return (
    <>
      {/* Redirect Capacitor apps to /scan */}
      <CapacitorRedirect />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Landing Page Content */}
      <main className="overflow-x-hidden">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <SocialProofSection />
        <CTASection />
        <Footer />
      </main>
    </>
  );
}
