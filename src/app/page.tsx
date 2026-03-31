import type { Metadata } from "next";
import HomeClient from "./home-client";
import { getBreadcrumbSchema, getFAQSchema } from "@/lib/schema";

export const metadata: Metadata = {
  title: "Haven Medical | Premium Medical & Aesthetic Clinic in Beirut",
  description:
    "Where medical excellence meets luxury care. Premium aesthetic treatments, surgical procedures, and wellness services in Beirut, Lebanon. Book your appointment today.",
  alternates: { canonical: "https://www.havenmedical.com" },
};

export default function HomePage() {
  const breadcrumb = getBreadcrumbSchema([
    { name: "Home", url: "/" },
  ]);

  const faq = getFAQSchema([
    {
      question: "What aesthetic treatments does Haven Medical offer?",
      answer:
        "Haven Medical offers a comprehensive range of aesthetic treatments including Botox & Fillers, Laser Hair Removal, Skin Boosters, Facial Treatments, and more. All procedures are performed by board-certified specialists.",
    },
    {
      question: "How do I book an appointment?",
      answer:
        "You can book an appointment through our website, via WhatsApp, or by calling our clinic directly. We offer flexible scheduling including evening and weekend slots.",
    },
    {
      question: "Where is Haven Medical located?",
      answer:
        "Haven Medical is located in Beirut, Lebanon. Visit our contact page for the full address, directions, and a map to our clinic.",
    },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
      />
      <HomeClient />
    </>
  );
}
