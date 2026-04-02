import type { Metadata } from "next";
import { getLocalBusinessSchema, getBreadcrumbSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Contact Us — Haven Medical Clinic Beirut",
  description:
    "Contact Haven Medical Clinic in Beirut, Lebanon. Call +961 71 888 930, WhatsApp, or email us. Open Mon-Fri 9AM-7PM, Sat 9AM-3PM. Book your consultation today.",
  alternates: { canonical: "https://www.haven-beautyclinic.com/contact" },
  openGraph: {
    title: "Contact Haven Medical — Phone, WhatsApp, Location",
    description: "Reach Haven Medical in Beirut via phone, WhatsApp, or email. We're open Monday-Saturday.",
    url: "https://www.haven-beautyclinic.com/contact",
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const localSchema = getLocalBusinessSchema();
  const breadcrumb = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Contact", url: "/contact" },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {children}
    </>
  );
}
