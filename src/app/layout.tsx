import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import WhatsAppFAB from "@/components/WhatsAppFAB";
import ScrollProgress from "@/components/ScrollProgress";
import SkipToMain from "@/components/SkipToMain";
import { getOrganizationSchema } from "@/lib/schema";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export const viewport: Viewport = {
  themeColor: "#8B7355",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.havenmedical.com"),
  title: {
    default: "Haven Medical | Premium Medical & Aesthetic Clinic in Beirut",
    template: "%s | Haven Medical",
  },
  description:
    "Where medical excellence meets luxury care. Premium aesthetic treatments, surgical procedures, and wellness services in Beirut, Lebanon. Book your appointment today.",
  keywords: [
    "medical clinic Beirut",
    "aesthetic treatments Lebanon",
    "Botox Beirut",
    "fillers Lebanon",
    "rhinoplasty Beirut",
    "laser hair removal Lebanon",
    "skin boosters",
    "face lifting",
    "physiotherapy Beirut",
    "luxury clinic Lebanon",
  ],
  authors: [{ name: "Haven Medical" }],
  creator: "Haven Medical",
  publisher: "Haven Medical",
  formatDetection: { telephone: true, email: true, address: true },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.havenmedical.com",
    siteName: "Haven Medical",
    title: "Haven Medical | Premium Medical & Aesthetic Clinic",
    description:
      "Where medical excellence meets luxury care. Premium aesthetic treatments, surgical procedures, and wellness in Beirut.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Haven Medical Clinic — Premium medical and aesthetic clinic in Beirut",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Haven Medical | Premium Medical & Aesthetic Clinic",
    description:
      "Premium aesthetic treatments, surgical procedures, and wellness services in Beirut, Lebanon.",
    images: ["/og-image.jpg"],
  },
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
    canonical: "https://www.havenmedical.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = getOrganizationSchema();

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <SkipToMain />
        <ScrollProgress />
        <Header />
        <main id="main-content" className="flex-1" role="main">
          {children}
        </main>
        <Footer />
        <WhatsAppFAB />
      </body>
    </html>
  );
}
