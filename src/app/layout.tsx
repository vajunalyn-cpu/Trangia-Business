import type { Metadata, Viewport } from "next";
import { Manrope, Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { site } from "@/config/site";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap", weight: ["300", "400", "500", "600", "700"] });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "Trangia Business | Investment consultancy in the Philippines",
    template: "%s | Trangia Business",
  },
  description: site.description,
  applicationName: site.shortName,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: "Trangia Business | Your gateway to investment in the Philippines",
    description: site.description,
    images: [{ url: "/media/reference/trangia-globe-1600.webp", width: 1600, height: 1067, alt: "Trangia Business" }],
    locale: "en_PH",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#162A4D",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgLd = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: site.name,
    url: site.url,
    logo: `${site.url}/brand/trangia-emblem-512.png`,
    areaServed: "PH",
    slogan: site.tagline,
  };
  return (
    <html lang="en" className={`${manrope.variable} ${inter.variable}`}>
      <body>
        <a className="skip-link" href="#main">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
      </body>
    </html>
  );
}
