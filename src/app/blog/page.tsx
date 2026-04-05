import Link from "next/link";
import Image from "next/image";
import { Clock, Tag } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { blogCategories } from "@/data/blog";
import { getBlogListSchema, getBreadcrumbSchema } from "@/lib/schema";
import { getDb } from "@/lib/db";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog — Expert Aesthetic & Medical Insights",
  description:
    "Expert articles on Botox, rhinoplasty aftercare, laser hair removal, skincare routines, nutrition, and wellness from Haven Medical specialists in Beirut, Lebanon.",
  alternates: { canonical: "https://www.haven-beautyclinic.com/blog" },
  openGraph: {
    title: "Haven Medical Blog — Aesthetic & Medical Insights",
    description: "Expert articles on aesthetic medicine, skincare, wellness, and post-treatment care from our Beirut-based specialists.",
    url: "https://www.haven-beautyclinic.com/blog",
  },
};

export const revalidate = 60;

async function getBlogPosts() {
  try {
    const sql = getDb();
    const rows = await sql`SELECT * FROM blog_posts ORDER BY date DESC`;
    return rows.map((r) => ({
      slug: r.slug,
      title: r.title,
      excerpt: r.excerpt || "",
      content: r.content || "",
      category: r.category,
      image: r.image || "",
      author: r.author || "",
      date: r.date,
      readTime: r.read_time || "5 min read",
    }));
  } catch {
    return [];
  }
}

export default async function BlogPage() {
  const blogPosts = await getBlogPosts();
  const blogListSchema = getBlogListSchema(blogPosts.map((p) => ({ title: p.title as string, slug: p.slug as string })));
  const breadcrumb = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      {/* Hero */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 bg-gradient-to-br from-muted via-background to-muted-dark">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-primary font-medium tracking-wider text-sm uppercase mb-3">Our Blog</p>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl lg:text-5xl font-bold text-dark mb-4">
            Expert Insights & Advice
          </h1>
          <p className="text-dark-light max-w-2xl mx-auto text-lg leading-relaxed">
            Stay informed with the latest in aesthetic medicine, wellness tips, and expert guidance from our specialists.
          </p>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-white border-b border-border-light">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap gap-2 justify-center">
            <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-primary text-white">
              All
            </span>
            {blogCategories.map((cat) => (
              <span
                key={cat}
                className="px-4 py-1.5 rounded-full text-sm font-medium border border-border bg-muted text-dark-light hover:bg-primary hover:text-white hover:border-primary transition-all cursor-pointer"
              >
                {cat}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, i) => (
              <ScrollReveal key={post.slug} delay={i * 80}>
                <Link
                  href={`/blog/${post.slug}`}
                  className="group block bg-background rounded-xl overflow-hidden border border-border-light card-hover"
                >
                  <div className="aspect-[16/10] bg-gradient-to-br from-secondary-light to-secondary relative overflow-hidden">
                    {post.image && (
                      <Image
                        src={post.image as string}
                        alt={post.title as string}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
                        <Tag className="w-3 h-3" /> {post.category}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-dark-light">
                        <Clock className="w-3 h-3" /> {post.readTime}
                      </span>
                    </div>
                    <h2 className="text-lg font-semibold text-dark mb-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-sm text-dark-light leading-relaxed line-clamp-3 mb-3">
                      {post.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-dark-light">{post.author}</span>
                      <span className="text-xs text-dark-light">
                        {new Date(post.date).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
