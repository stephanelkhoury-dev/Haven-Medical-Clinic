import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import SkipToMain from "@/components/SkipToMain";
import { getOrganizationSchema, getWebSiteSchema } from "@/lib/schema";
import LayoutShell from "@/components/LayoutShell";

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
  themeColor: "#1fbda6",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.haven-beautyclinic.com"),
  title: {
    default: "Haven Medical | Premium Medical & Aesthetic Clinic in Beirut",
    template: "%s | Haven Medical",
  },
  description:
    "Where medical excellence meets luxury care. Premium aesthetic treatments, surgical procedures, and wellness services in Beirut, Lebanon. Book your appointment today.",
  keywords: [
    "Haven Medical",
    "Haven Medical Clinic",
    "medical clinic Beirut",
    "aesthetic clinic Beirut",
    "Botox Beirut",
    "Botox Lebanon",
    "fillers Beirut",
    "fillers Lebanon",
    "rhinoplasty Beirut",
    "rhinoplasty Lebanon",
    "nose job Beirut",
    "laser hair removal Beirut",
    "laser hair removal Lebanon",
    "skin boosters Beirut",
    "face lifting Beirut",
    "face lifting Lebanon",
    "blepharoplasty Beirut",
    "lip lift Beirut",
    "otoplasty Beirut",
    "physiotherapy Beirut",
    "lymphatic drainage Beirut",
    "deep tissue massage Beirut",
    "nutritionist Beirut",
    "aesthetic treatments Lebanon",
    "cosmetic surgery Beirut",
    "beauty clinic Beirut",
    "medical aesthetics Lebanon",
    "luxury clinic Lebanon",
    "best dermatologist Beirut",
    "plastic surgery Lebanon",
  ],
  authors: [{ name: "Haven Medical" }],
  creator: "Haven Medical",
  publisher: "Haven Medical",
  formatDetection: { telephone: true, email: true, address: true },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.haven-beautyclinic.com",
    siteName: "Haven Medical",
    title: "Haven Medical | Premium Medical & Aesthetic Clinic",
    description:
      "Where medical excellence meets luxury care. Premium aesthetic treatments, surgical procedures, and wellness in Beirut.",
    images: [
      {
        url: "/og-image.webp",
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
    images: ["/og-image.webp"],
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
    canonical: "https://www.haven-beautyclinic.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = getOrganizationSchema();
  const siteSchema = getWebSiteSchema();

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} h-full antialiased`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteSchema) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <SkipToMain />
        <LayoutShell>{children}</LayoutShell>
      </body>
    </html>
  );
}
