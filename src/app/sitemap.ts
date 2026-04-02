import type { MetadataRoute } from "next";
import { services } from "@/data/services";
import { getDb } from "@/lib/db";

const BASE = "https://www.haven-beautyclinic.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date().toISOString();

  let blogSlugs: string[] = [];
  try {
    const sql = getDb();
    const rows = await sql`SELECT slug FROM blog_posts`;
    blogSlugs = rows.map((r) => r.slug as string);
  } catch { /* fallback to empty */ }

  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/services`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/gift-voucher`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/membership`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/appointment`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];

  const servicePages: MetadataRoute.Sitemap = services.map((s) => ({
    url: `${BASE}/services/${s.slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  const blogPages: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${BASE}/blog/${slug}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...servicePages, ...blogPages];
}
