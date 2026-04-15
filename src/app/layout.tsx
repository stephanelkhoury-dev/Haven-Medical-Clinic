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
    default: "Haven Medical | Premium Medical & Aesthetic Clinic in Lebanon",
    template: "%s | Haven Medical",
  },
  description:
    "Where medical excellence meets luxury care. Premium aesthetic treatments, surgical procedures, and wellness services in Qornet Chehwan, Lebanon. Book your appointment today.",
  keywords: [
    "Haven Medical",
    "Haven Medical Clinic",
    "medical clinic Lebanon",
    "aesthetic clinic Lebanon",
    "Botox Lebanon",
    "Botox Lebanon",
    "fillers Lebanon",
    "fillers Lebanon",
    "rhinoplasty Lebanon",
    "rhinoplasty Lebanon",
    "nose job Lebanon",
    "laser hair removal Lebanon",
    "laser hair removal Lebanon",
    "skin boosters Lebanon",
    "face lifting Lebanon",
    "face lifting Lebanon",
    "blepharoplasty Lebanon",
    "lip lift Lebanon",
    "otoplasty Lebanon",
    "physiotherapy Lebanon",
    "lymphatic drainage Lebanon",
    "deep tissue massage Lebanon",
    "nutritionist Lebanon",
    "aesthetic treatments Lebanon",
    "cosmetic surgery Lebanon",
    "beauty clinic Lebanon",
    "medical aesthetics Lebanon",
    "luxury clinic Lebanon",
    "best dermatologist Lebanon",
    "plastic surgery Lebanon",
  ],
  authors: [{ name: "Haven Medical" }, { name: "Multigraphic.lb", url: "https://www.instagram.com/multigraphic.lb" }],
  creator: "Multigraphic.lb",
  publisher: "Haven Medical",
  formatDetection: { telephone: true, email: true, address: true },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.haven-beautyclinic.com",
    siteName: "Haven Medical",
    title: "Haven Medical | Premium Medical & Aesthetic Clinic",
    description:
      "Where medical excellence meets luxury care. Premium aesthetic treatments, surgical procedures, and wellness in Lebanon.",
    images: [
      {
        url: "/og-image.webp",
        width: 1200,
        height: 630,
        alt: "Haven Medical Clinic — Premium medical and aesthetic clinic in Lebanon",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Haven Medical | Premium Medical & Aesthetic Clinic",
    description:
      "Premium aesthetic treatments, surgical procedures, and wellness services in Qornet Chehwan, Lebanon.",
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
