import Link from "next/link";
import { Clock, Tag } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { blogPosts, blogCategories } from "@/data/blog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Expert insights on skincare, aesthetic medicine, wellness, nutrition, and post-treatment care from the Haven Medical team.",
};

export default function BlogPage() {
  return (
    <>
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
                  <div className="aspect-[16/10] bg-gradient-to-br from-secondary-light to-secondary" />
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
