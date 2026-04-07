import Link from "next/link";
import Image from "next/image";
import { ChevronRight, Sparkles, Zap, Syringe, Droplets, SmilePlus, Eye, Heart, Ear, Stethoscope, Brain, Activity, Apple, Leaf, HandMetal, Scissors, Shield, Award, Users, Star, Clock, Check, type LucideIcon } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { getServiceListSchema, getBreadcrumbSchema } from "@/lib/schema";
import { getDb } from "@/lib/db";
import type { Metadata } from "next";

export const revalidate = 60;

const iconMap: Record<string, LucideIcon> = {
  Sparkles, Zap, Syringe, Droplets, SmilePlus, Eye, Heart, Ear,
  Stethoscope, Brain, Activity, Apple, Leaf, HandMetal, Scissors,
  Shield, Award, Users, Star, Clock, Check,
};

const serviceCategories: Record<string, { label: string; description: string }> = {
  aesthetic: { label: "Aesthetic Treatments", description: "Enhance your natural beauty with advanced non-surgical treatments" },
  surgical: { label: "Surgical Procedures", description: "Expert surgical solutions for lasting transformation" },
  medical: { label: "Medical & Specialist Care", description: "Comprehensive medical consultations and specialized care" },
  wellness: { label: "Wellness & Body Care", description: "Holistic treatments for complete body wellness" },
};

export const metadata: Metadata = {
  title: "All Services — Aesthetic, Surgical & Wellness Treatments",
  description:
    "Explore 17+ treatments at Haven Medical: Botox, fillers, rhinoplasty, laser hair removal, face lifting, skin boosters, physiotherapy, nutritionist, and more. Board-certified specialists.",
  alternates: { canonical: "https://www.haven-beautyclinic.com/services" },
  openGraph: {
    title: "Haven Medical Services — Aesthetic & Medical Treatments in Lebanon",
    description: "Botox, fillers, rhinoplasty, laser hair removal, face lifting, physiotherapy, and 10+ more treatments by certified specialists.",
    url: "https://www.haven-beautyclinic.com/services",
  },
};

export default async function ServicesPage() {
  let allServices: { slug: string; title: string; shortDescription: string; category: string; iconName: string; heroImage: string; subServices: { name: string; description: string }[] }[] = [];
  try {
    const sql = getDb();
    const rows = await sql`SELECT slug, title, short_description, category, icon_name, hero_image, sub_services FROM admin_services ORDER BY title ASC`;
    allServices = rows.map((r) => ({
      slug: r.slug as string,
      title: r.title as string,
      shortDescription: (r.short_description || "") as string,
      category: (r.category || "aesthetic") as string,
      iconName: (r.icon_name || "Sparkles") as string,
      heroImage: (r.hero_image || "") as string,
      subServices: (r.sub_services || []) as { name: string; description: string }[],
    }));
  } catch { /* fallback to empty */ }

  const categories = Object.entries(serviceCategories) as [string, { label: string; description: string }][];

  const serviceListSchema = getServiceListSchema(allServices);
  const breadcrumb = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Services", url: "/services" },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      {/* Hero */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 bg-gradient-to-br from-muted via-background to-muted-dark">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-primary font-medium tracking-wider text-sm uppercase mb-3">Our Services</p>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl lg:text-5xl font-bold text-dark mb-4">
            Premium Treatments & Care
          </h1>
          <p className="text-dark-light max-w-2xl mx-auto text-lg leading-relaxed">
            Discover our full range of medical, aesthetic, and wellness services — each delivered with expertise and personalized attention.
          </p>
        </div>
      </section>

      {/* Services by category */}
      {categories.map(([key, cat], catIdx) => {
        const catServices = allServices.filter((s) => s.category === key);
        if (catServices.length === 0) return null;
        return (
          <section
            key={key}
            id={key}
            className={`py-20 lg:py-28 ${catIdx % 2 === 0 ? "bg-white" : "bg-muted"}`}
          >
            <div className="max-w-7xl mx-auto px-6">
              <ScrollReveal className="mb-12">
                <p className="text-primary font-medium tracking-wider text-sm uppercase mb-3">
                  {cat.label}
                </p>
                <h2 className="font-[family-name:var(--font-heading)] text-2xl lg:text-3xl font-bold text-dark mb-3">
                  {cat.label}
                </h2>
                <div className="section-divider mb-4" />
                <p className="text-dark-light max-w-xl">{cat.description}</p>
              </ScrollReveal>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {catServices.map((service, i) => {
                  const Icon = iconMap[service.iconName] || Sparkles;
                  return (
                    <ScrollReveal key={service.slug} delay={i * 80}>
                      <Link
                        href={`/services/${service.slug}`}
                        className="group block bg-background rounded-xl border border-border-light overflow-hidden card-hover h-full"
                      >
                        <div className="aspect-[16/10] relative bg-gradient-to-br from-secondary-light to-secondary overflow-hidden">
                          <Image
                            src={service.heroImage}
                            alt={service.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          />
                        </div>
                        <div className="p-6">
                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                          <Icon className="w-6 h-6 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold text-dark mb-2">{service.title}</h3>
                        <p className="text-sm text-dark-light leading-relaxed mb-4">
                          {service.shortDescription}
                        </p>
                        {service.subServices && (
                          <div className="mb-4">
                            <p className="text-xs font-medium text-primary mb-1">Includes:</p>
                            <ul className="text-xs text-dark-light space-y-1">
                              {service.subServices.map((sub) => (
                                <li key={sub.name}>• {sub.name}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                          Learn More <ChevronRight className="w-4 h-4" />
                        </span>
                        </div>
                      </Link>
                    </ScrollReveal>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}

      {/* CTA */}
      <section className="py-20 lg:py-28 bg-dark text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <ScrollReveal>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl lg:text-4xl font-bold mb-4">
              Not Sure Which Treatment Is Right for You?
            </h2>
            <p className="text-white/70 max-w-2xl mx-auto mb-8">
              Book a consultation with our specialists and we will recommend the perfect treatment plan tailored to your needs.
            </p>
            <Link
              href="/appointment"
              className="inline-flex items-center gap-2 bg-primary text-white px-7 py-3.5 rounded-full font-medium hover:bg-primary-light transition-colors"
            >
              Book Consultation
            </Link>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
