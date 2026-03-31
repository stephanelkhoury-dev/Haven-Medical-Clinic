import { clinicInfo } from "@/data/clinic";

const BASE = "https://www.havenmedical.com";

// ── Organization / Local Business ─────────────────────────────────────
export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalClinic",
    name: clinicInfo.name,
    description:
      "Premium medical and aesthetic clinic offering aesthetic treatments, surgical procedures, and wellness services.",
    url: BASE,
    logo: `${BASE}/logo.png`,
    image: `${BASE}/og-image.jpg`,
    telephone: clinicInfo.phone,
    email: clinicInfo.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: clinicInfo.address,
      addressLocality: "Beirut",
      addressCountry: "LB",
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "09:00",
        closes: "18:00",
      },
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: "Saturday",
        opens: "09:00",
        closes: "14:00",
      },
    ],
    sameAs: [clinicInfo.social.instagram, clinicInfo.social.facebook],
    priceRange: "$$$",
    medicalSpecialty: [
      "Dermatology",
      "Plastic Surgery",
      "Otolaryngology",
      "Physical Therapy",
    ],
  };
}

// ── Breadcrumb list ───────────────────────────────────────────────────
export function getBreadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${BASE}${item.url}`,
    })),
  };
}

// ── Service schema ────────────────────────────────────────────────────
export function getServiceSchema(service: {
  title: string;
  slug: string;
  shortDescription: string;
  duration?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalProcedure",
    name: service.title,
    description: service.shortDescription,
    url: `${BASE}/services/${service.slug}`,
    procedureType: "https://schema.org/NoninvasiveProcedure",
    ...(service.duration && { howPerformed: `Duration: ${service.duration}` }),
    provider: {
      "@type": "MedicalClinic",
      name: clinicInfo.name,
      url: BASE,
    },
  };
}

// ── FAQ schema ────────────────────────────────────────────────────────
export function getFAQSchema(
  faqs: { question: string; answer: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

// ── Blog Article schema ───────────────────────────────────────────────
export function getArticleSchema(post: {
  title: string;
  slug: string;
  excerpt: string;
  author: string;
  date: string;
  category: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    url: `${BASE}/blog/${post.slug}`,
    datePublished: post.date,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: clinicInfo.name,
      url: BASE,
    },
    articleSection: post.category,
  };
}
