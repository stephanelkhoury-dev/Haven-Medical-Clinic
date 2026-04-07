import type { Metadata } from "next";
import HomeClient from "./home-client";
import { getBreadcrumbSchema, getFAQSchema } from "@/lib/schema";
import { getDb } from "@/lib/db";

export const metadata: Metadata = {
  title: "Haven Medical | Premium Medical & Aesthetic Clinic in Lebanon",
  description:
    "Where medical excellence meets luxury care. Premium aesthetic treatments, surgical procedures, and wellness services in Qornet Chehwan, Lebanon. Book your appointment today.",
  alternates: { canonical: "https://www.haven-beautyclinic.com" },
};

export const revalidate = 60;

async function getLatestPosts() {
  try {
    const sql = getDb();
    const rows = await sql`SELECT slug, title, excerpt, category, image, author, date, read_time FROM blog_posts ORDER BY date DESC LIMIT 3`;
    return rows.map((r) => ({
      slug: r.slug as string,
      title: r.title as string,
      excerpt: (r.excerpt || "") as string,
      content: "",
      category: r.category as string,
      image: (r.image || "") as string,
      author: (r.author || "") as string,
      date: r.date as string,
      readTime: (r.read_time || "5 min read") as string,
    }));
  } catch {
    return [];
  }
}

async function getServices() {
  try {
    const sql = getDb();
    const rows = await sql`SELECT slug, title, short_description, category, icon_name, hero_image, sub_services FROM admin_services ORDER BY title ASC`;
    return rows.map((r) => ({
      slug: r.slug as string,
      title: r.title as string,
      shortDescription: (r.short_description || "") as string,
      category: r.category as string,
      iconName: (r.icon_name || "Sparkles") as string,
      heroImage: (r.hero_image || "") as string,
      subServices: r.sub_services || [],
    }));
  } catch {
    return [];
  }
}

async function getDoctors() {
  try {
    const sql = getDb();
    const rows = await sql`SELECT name, title, specialty, image, bio, slug FROM doctors ORDER BY sort_order ASC`;
    return rows.map((r) => ({
      name: r.name as string,
      title: (r.title || "") as string,
      specialty: (r.specialty || "") as string,
      image: (r.image || "") as string,
      bio: (r.bio || "") as string,
      slug: (r.slug || "") as string,
    }));
  } catch {
    return [];
  }
}

async function getTestimonials() {
  try {
    const sql = getDb();
    const rows = await sql`SELECT name, treatment, text, rating FROM testimonials ORDER BY id ASC`;
    return rows.map((r) => ({
      name: r.name as string,
      treatment: (r.treatment || "") as string,
      text: (r.text || "") as string,
      rating: (r.rating ?? 5) as number,
    }));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const [latestPosts, dbServices, dbDoctors, dbTestimonials] = await Promise.all([
    getLatestPosts(),
    getServices(),
    getDoctors(),
    getTestimonials(),
  ]);

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
        "Haven Medical is located in Bayada, Qornet Chehwan, Lebanon. Visit our contact page for the full address, directions, and a map to our clinic.",
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
      <HomeClient
        latestPosts={latestPosts}
        services={dbServices}
        doctors={dbDoctors}
        testimonials={dbTestimonials}
      />
    </>
  );
}
