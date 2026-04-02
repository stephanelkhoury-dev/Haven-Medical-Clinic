import { clinicInfo } from "@/data/clinic";

const BASE = "https://www.haven-beautyclinic.com";

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
    image: `${BASE}/og-image.webp`,
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
    sameAs: [clinicInfo.social.instagram, clinicInfo.social.facebook, clinicInfo.social.google],
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
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalWebPage",
    headline: post.title,
    description: post.excerpt,
    url: `${BASE}/blog/${post.slug}`,
    datePublished: post.date,
    dateModified: post.date,
    image: post.image ? `${BASE}${post.image}` : `${BASE}/og-image.webp`,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: clinicInfo.name,
      url: BASE,
      logo: { "@type": "ImageObject", url: `${BASE}/logo.png` },
    },
    articleSection: post.category,
    mainEntityOfPage: { "@type": "WebPage", "@id": `${BASE}/blog/${post.slug}` },
  };
}

// ── WebSite schema (for sitelinks search box) ─────────────────────────
export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: clinicInfo.name,
    url: BASE,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${BASE}/services?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };
}

// ── Local Business schema (contact page) ──────────────────────────────
export function getLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    name: clinicInfo.name,
    description: "Premium medical and aesthetic clinic in Beirut, Lebanon offering Botox, fillers, rhinoplasty, laser hair removal, physiotherapy, and wellness services.",
    url: BASE,
    telephone: clinicInfo.phone,
    email: clinicInfo.email,
    image: `${BASE}/og-image.webp`,
    logo: `${BASE}/logo.png`,
    priceRange: "$$$",
    currenciesAccepted: "USD, LBP",
    paymentAccepted: "Cash, Credit Card",
    address: {
      "@type": "PostalAddress",
      streetAddress: clinicInfo.address,
      addressLocality: "Beirut",
      addressRegion: "Beirut",
      addressCountry: "LB",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: "33.8938",
      longitude: "35.5018",
    },
    openingHoursSpecification: [
      { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "09:00", closes: "19:00" },
      { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "09:00", closes: "15:00" },
    ],
    sameAs: [clinicInfo.social.instagram, clinicInfo.social.facebook, clinicInfo.social.tiktok, clinicInfo.social.google],
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "127",
      bestRating: "5",
    },
    hasMap: clinicInfo.mapUrl,
    areaServed: [
      { "@type": "City", name: "Beirut" },
      { "@type": "Country", name: "Lebanon" },
    ],
    medicalSpecialty: [
      "PlasticSurgery",
      "Dermatology",
      "Otolaryngology",
      "PhysicalTherapy",
      "Nutrition",
    ],
  };
}

// ── ItemList schema (for service listing page) ────────────────────────
export function getServiceListSchema(servicesList: { title: string; slug: string; shortDescription: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Haven Medical Services",
    description: "All aesthetic, surgical, medical, and wellness services offered at Haven Medical Clinic in Beirut.",
    numberOfItems: servicesList.length,
    itemListElement: servicesList.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.title,
      url: `${BASE}/services/${s.slug}`,
      description: s.shortDescription,
    })),
  };
}

// ── Blog listing schema ───────────────────────────────────────────────
export function getBlogListSchema(posts: { title: string; slug: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Haven Medical Blog",
    description: "Expert insights on aesthetic medicine, skincare, wellness, and medical advice from Haven Medical specialists in Beirut.",
    url: `${BASE}/blog`,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: posts.length,
      itemListElement: posts.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: p.title,
        url: `${BASE}/blog/${p.slug}`,
      })),
    },
  };
}

// ── Professional Service schema (about page) ──────────────────────────
export function getAboutPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About Haven Medical Clinic",
    description: "Learn about Haven Medical Clinic in Beirut — our medical philosophy, board-certified specialists, and commitment to patient care.",
    url: `${BASE}/about`,
    mainEntity: {
      "@type": "MedicalOrganization",
      name: clinicInfo.name,
      url: BASE,
      foundingDate: "2011",
      numberOfEmployees: { "@type": "QuantitativeValue", value: 15 },
      medicalSpecialty: ["PlasticSurgery", "Dermatology", "Otolaryngology", "PhysicalTherapy"],
      awards: ["Board-Certified Practitioners", "International Training Programs", "Advanced Technology Certifications"],
    },
  };
}
