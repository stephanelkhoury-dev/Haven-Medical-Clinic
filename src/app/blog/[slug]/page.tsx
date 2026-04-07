import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Clock, Tag, ArrowLeft } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { getDb } from "@/lib/db";
import { getArticleSchema, getBreadcrumbSchema } from "@/lib/schema";
import type { Metadata } from "next";

export const revalidate = 60;

async function getAllPosts() {
  try {
    const sql = getDb();
    const rows = await sql`SELECT * FROM blog_posts ORDER BY date DESC`;
    return rows.map((r) => ({
      slug: r.slug as string,
      title: r.title as string,
      excerpt: (r.excerpt || "") as string,
      content: (r.content || "") as string,
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const posts = await getAllPosts();
  const post = posts.find((p) => p.slug === slug);
  if (!post) return {};
  return {
    title: `${post.title} — Haven Medical Blog`,
    description: post.excerpt,
    alternates: { canonical: `https://www.haven-beautyclinic.com/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://www.haven-beautyclinic.com/blog/${slug}`,
      type: "article",
      publishedTime: post.date,
      authors: [post.author],
      images: post.image ? [{ url: post.image, width: 1200, height: 630, alt: post.title }] : [],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blogPosts = await getAllPosts();
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) notFound();

  const related = blogPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  const articleSchema = getArticleSchema(post);
  const breadcrumb = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: post.title, url: `/blog/${post.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      {/* Hero */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 bg-gradient-to-br from-muted via-background to-muted-dark">
        <div className="max-w-4xl mx-auto px-6">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-dark-light mb-6">
            <Link href="/blog" className="hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-accent rounded">Blog</Link>
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="text-primary line-clamp-1" aria-current="page">{post.title}</span>
          </nav>

          <div className="flex items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1 text-xs text-primary font-medium bg-primary/10 px-3 py-1 rounded-full">
              <Tag className="w-3 h-3" aria-hidden="true" /> {post.category}
            </span>
            <span className="inline-flex items-center gap-1 text-xs text-dark-light">
              <Clock className="w-3 h-3" /> {post.readTime}
            </span>
          </div>

          <h1 className="font-[family-name:var(--font-heading)] text-3xl lg:text-4xl font-bold text-dark mb-4">
            {post.title}
          </h1>
          <p className="text-lg text-dark-light leading-relaxed mb-6">{post.excerpt}</p>

          <div className="flex items-center gap-4 text-sm text-dark-light">
            <span>By <strong className="text-dark">{post.author}</strong></span>
            <span>
              {new Date(post.date).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </section>

      {/* Featured Image */}
      <section className="bg-white">
        <div className="max-w-4xl mx-auto px-6 -mt-8">
          <div className="aspect-[16/9] rounded-2xl bg-muted overflow-hidden shadow-lg relative">
            {post.image && (
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-contain"
                sizes="(max-width: 768px) 100vw, 896px"
                priority
              />
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <ScrollReveal>
            <article
              className="prose prose-lg max-w-none text-dark-light leading-relaxed prose-headings:font-[family-name:var(--font-heading)] prose-headings:text-dark prose-h2:text-2xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-3 prose-p:mb-4 prose-li:mb-1 prose-ul:my-4 prose-ol:my-4 prose-strong:text-dark"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
            <div className="mt-12 p-6 bg-muted rounded-xl border border-border-light">
              <p className="text-sm text-dark-light">
                <strong className="text-dark">Disclaimer:</strong> This article is for informational purposes only and does not replace professional medical advice. Always consult with a qualified specialist at Haven Medical before undergoing any treatment.
              </p>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Related posts */}
      <section className="py-16 lg:py-24 bg-muted">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-[family-name:var(--font-heading)] text-2xl lg:text-3xl font-bold text-dark mb-8">
            Related Articles
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {related.map((p) => (
              <Link
                key={p.slug}
                href={`/blog/${p.slug}`}
                className="group block bg-white rounded-xl overflow-hidden border border-border-light card-hover"
              >
                <div className="aspect-[16/10] bg-muted relative overflow-hidden">
                  {p.image && (
                    <Image
                      src={p.image}
                      alt={p.title}
                      fill
                      className="object-contain"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                  )}
                </div>
                <div className="p-5">
                  <span className="text-xs text-primary font-medium">{p.category}</span>
                  <h3 className="font-semibold text-dark mt-1 group-hover:text-primary transition-colors">
                    {p.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
          <div className="mt-8">
            <Link href="/blog" className="inline-flex items-center gap-2 text-primary font-medium">
              <ArrowLeft className="w-4 h-4" /> Back to Blog
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
