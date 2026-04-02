import type { Metadata } from "next";
import HomeClient from "./home-client";
import { getBreadcrumbSchema, getFAQSchema } from "@/lib/schema";
import { getDb } from "@/lib/db";

export const metadata: Metadata = {
  title: "Haven Medical | Premium Medical & Aesthetic Clinic in Beirut",
  description:
    "Where medical excellence meets luxury care. Premium aesthetic treatments, surgical procedures, and wellness services in Beirut, Lebanon. Book your appointment today.",
  alternates: { canonical: "https://www.haven-beautyclinic.com" },
};

export const dynamic = "force-dynamic";

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

export default async function HomePage() {
  const latestPosts = await getLatestPosts();
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
      <HomeClient latestPosts={latestPosts} />
    </>
  );
}
