import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Shield,
  Award,
  Users,
  Heart,
  Star,
  Clock,
  ChevronRight,
  Sparkles,
  Zap,
  Syringe,
  Droplets,
  SmilePlus,
  Eye,
  Ear,
  Stethoscope,
  Brain,
  Activity,
  Apple,
  Leaf,
  HandMetal,
  Scissors,
  type LucideIcon,
} from "lucide-react";
import { clinicInfo } from "@/data/clinic";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { getBreadcrumbSchema, getFAQSchema } from "@/lib/schema";
import { getDb } from "@/lib/db";
import type { BlogPost } from "@/data/blog";

import HeroSlideshow from "./_components/HeroSlideshow";
import Counter from "./_components/Counter";
import ScrollReveal from "@/components/ScrollReveal";
import StaggerReveal from "./_components/StaggerReveal";
import DynamicSocialFeed from "./_components/DynamicSocialFeed";

// ── Metadata ──────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "Haven Medical | Premium Medical & Aesthetic Clinic in Lebanon",
  description:
    "Where medical excellence meets luxury care. Premium aesthetic treatments, surgical procedures, and wellness services in Qornet Chehwan, Lebanon. Book your appointment today.",
  alternates: { canonical: "https://www.haven-beautyclinic.com" },
};

export const revalidate = 60;

// ── Icon mapping for DB-stored icon names ─────────────────────────────
const iconMap: Record<string, LucideIcon> = {
  Sparkles, Zap, Syringe, Droplets, SmilePlus, Eye, Heart, Ear,
  Stethoscope, Brain, Activity, Apple, Leaf, HandMetal, Scissors,
  Shield, Award, Users, Star, Clock,
};

// ── Service categories ────────────────────────────────────────────────
const serviceCategories: Record<string, { label: string }> = {
  aesthetic: { label: "Aesthetic Treatments" },
  surgical: { label: "Surgical Procedures" },
  medical: { label: "Medical & Specialist Care" },
  wellness: { label: "Wellness & Body Care" },
};

// ── Data fetching ─────────────────────────────────────────────────────
async function getLatestPosts(): Promise<BlogPost[]> {
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

interface DbService {
  slug: string;
  title: string;
  shortDescription: string;
  category: string;
  iconName: string;
  heroImage: string;
  subServices: unknown[];
}

async function getServices(): Promise<DbService[]> {
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

interface DbDoctor {
  name: string;
  title: string;
  specialty: string;
  image: string;
  bio: string;
  slug: string;
}

async function getDoctors(): Promise<DbDoctor[]> {
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

interface DbTestimonial {
  name: string;
  treatment: string;
  text: string;
  rating: number;
}

async function getTestimonials(): Promise<DbTestimonial[]> {
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

// ── Page ──────────────────────────────────────────────────────────────
export default async function HomePage() {
  const [latestPosts, services, doctors, testimonials] = await Promise.all([
    getLatestPosts(),
    getServices(),
    getDoctors(),
    getTestimonials(),
  ]);

  const featuredServices = services.slice(0, 6);

  const breadcrumb = getBreadcrumbSchema([{ name: "Home", url: "/" }]);
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

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section
        className="relative min-h-screen flex items-center bg-gradient-to-br from-muted via-background to-muted-dark overflow-hidden"
        aria-label="Welcome to Haven Medical"
      >
        <div className="absolute inset-0 opacity-[0.03]" aria-hidden="true">
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle, var(--color-primary) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 py-32 lg:py-40 grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-primary font-medium tracking-[0.2em] text-sm uppercase mb-4 flex items-center gap-2 animate-fade-in-up stagger-1">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              Welcome to Haven Medical
            </p>
            <h1 className="font-[family-name:var(--font-heading)] text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-dark leading-[1.1] mb-6 animate-fade-in-up stagger-2">
              Where Medical Excellence{" "}
              <span className="gradient-text">Meets Luxury Care</span>
            </h1>
            <p className="text-lg text-dark-light leading-relaxed mb-8 max-w-lg animate-fade-in-up stagger-3">
              Experience premium aesthetic and medical treatments delivered by
              certified specialists in a refined, welcoming environment.
            </p>
            <div className="flex flex-wrap gap-4 animate-fade-in-up stagger-4">
              <Link
                href="/appointment"
                className="group inline-flex items-center gap-2 bg-primary text-white px-7 py-3.5 rounded-full font-medium hover:bg-primary-dark transition-all hover:shadow-lg hover:shadow-primary/25 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                Book Appointment
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 border-2 border-primary text-primary px-7 py-3.5 rounded-full font-medium hover:bg-primary hover:text-white transition-all focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                Our Services
              </Link>
            </div>
          </div>
          <div className="hidden lg:block relative" aria-hidden="true">
            <HeroSlideshow />
            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-lg p-4 flex items-center gap-3 animate-gentle-bob animate-fade-in stagger-5">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-dark">Certified Specialists</p>
                <p className="text-xs text-dark-light">Board-certified doctors</p>
              </div>
            </div>
            <div className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4 flex items-center gap-3 animate-gentle-bob animate-fade-in stagger-6" style={{ animationDelay: "2s" }}>
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center">
                <Star className="w-5 h-5 text-accent fill-accent" />
              </div>
              <div>
                <p className="text-sm font-semibold text-dark">5-Star Rated</p>
                <p className="text-xs text-dark-light">500+ happy patients</p>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-dark-light/50 animate-float" aria-hidden="true">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <div className="w-5 h-8 border-2 border-dark-light/30 rounded-full flex justify-center pt-1">
            <div className="w-1 h-2 bg-primary rounded-full animate-fade-in-up" />
          </div>
        </div>
      </section>

      {/* ── Trust Stats Bar ──────────────────────────────────── */}
      <section className="py-8 bg-white border-y border-border-light" aria-label="Clinic statistics">
        <StaggerReveal staggerMs={150} className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: 10, suffix: "+", label: "Years Experience" },
            { value: 500, suffix: "+", label: "Happy Patients" },
            { value: 17, suffix: "", label: "Treatments" },
            { value: 4, suffix: "", label: "Specialist Doctors" },
          ].map((stat) => (
            <div key={stat.label} className="py-2">
              <p className="text-3xl font-bold text-primary font-[family-name:var(--font-heading)]">
                <Counter value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-xs text-dark-light mt-1 uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </StaggerReveal>
      </section>

      {/* ── Services Preview ─────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-white" id="services" aria-labelledby="services-heading">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal className="text-center mb-14">
            <p className="text-primary font-medium tracking-[0.2em] text-sm uppercase mb-3">Our Services</p>
            <h2 id="services-heading" className="font-[family-name:var(--font-heading)] text-3xl lg:text-4xl font-bold text-dark mb-4">
              Premium Treatments & Care
            </h2>
            <div className="section-divider mx-auto mb-4" role="presentation" />
            <p className="text-dark-light max-w-2xl mx-auto">
              From aesthetic enhancements to surgical precision and holistic wellness, our comprehensive range of services is tailored to your unique needs.
            </p>
          </ScrollReveal>

          <nav className="flex flex-wrap justify-center gap-3 mb-12" aria-label="Service categories">
            {(Object.entries(serviceCategories) as [string, { label: string }][]).map(([key, cat]) => (
              <Link
                key={key}
                href={`/services#${key}`}
                className="px-5 py-2 rounded-full text-sm font-medium border border-border bg-muted text-dark-light hover:bg-primary hover:text-white hover:border-primary transition-all focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                {cat.label}
              </Link>
            ))}
          </nav>

          <StaggerReveal staggerMs={100} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredServices.map((service) => {
              const Icon = iconMap[service.iconName] || Sparkles;
              return (
                <Link
                  key={service.slug}
                  href={`/services/${service.slug}`}
                  className="group block bg-background rounded-xl border border-border-light p-6 card-hover focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                >
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-colors" aria-hidden="true">
                    <Icon className="w-6 h-6 text-primary group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-dark mb-2">{service.title}</h3>
                  <p className="text-sm text-dark-light leading-relaxed mb-4">{service.shortDescription}</p>
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                    Learn More <ChevronRight className="w-4 h-4" aria-hidden="true" />
                  </span>
                </Link>
              );
            })}
          </StaggerReveal>

          <div className="text-center mt-10">
            <Link href="/services" className="group inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:rounded-lg focus-visible:px-2 focus-visible:py-1">
              View All Services <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── About Preview ────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-muted" aria-labelledby="about-heading">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <ScrollReveal>
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-lg relative bg-gradient-to-br from-secondary to-secondary-light">
              <Image
                src="/images/services/psychosexology.webp"
                alt="Haven Medical clinic interior"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </ScrollReveal>
          <ScrollReveal>
            <p className="text-primary font-medium tracking-[0.2em] text-sm uppercase mb-3">About Haven Medical</p>
            <h2 id="about-heading" className="font-[family-name:var(--font-heading)] text-3xl lg:text-4xl font-bold text-dark mb-4">
              A Sanctuary of Medical Excellence
            </h2>
            <div className="section-divider mb-6" role="presentation" />
            <p className="text-dark-light leading-relaxed mb-4">
              Haven Medical is more than a clinic — it is a sanctuary where cutting-edge medical science meets the art of aesthetic beauty. Our team of board-certified specialists is dedicated to delivering personalized care with the highest standards of safety and excellence.
            </p>
            <p className="text-dark-light leading-relaxed mb-8">
              From the moment you step through our doors, you will experience a level of care and sophistication that sets us apart.
            </p>
            <Link href="/about" className="group inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-medium hover:bg-primary-dark transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
              Our Story <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Link>
          </ScrollReveal>
        </div>
      </section>

      {/* ── Why Choose Haven ─────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-white" aria-labelledby="why-heading">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal className="text-center mb-14">
            <p className="text-primary font-medium tracking-[0.2em] text-sm uppercase mb-3">Why Choose Us</p>
            <h2 id="why-heading" className="font-[family-name:var(--font-heading)] text-3xl lg:text-4xl font-bold text-dark mb-4">
              The Haven Medical Difference
            </h2>
            <div className="section-divider mx-auto" role="presentation" />
          </ScrollReveal>

          <StaggerReveal staggerMs={120} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Award, title: "Certified Specialists", desc: "Board-certified doctors and surgeons with international training and expertise." },
              { icon: Shield, title: "Advanced Technology", desc: "State-of-the-art equipment and the latest medical technologies for optimal results." },
              { icon: Users, title: "Personalized Care", desc: "Every treatment plan is tailored to your unique needs, goals, and anatomy." },
              { icon: Heart, title: "Luxury Experience", desc: "A refined, welcoming environment designed for your comfort and peace of mind." },
            ].map((item) => (
              <div key={item.title} className="text-center p-6 rounded-xl hover:bg-muted transition-colors">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4" aria-hidden="true">
                  <item.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-dark mb-2">{item.title}</h3>
                <p className="text-sm text-dark-light leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </StaggerReveal>
        </div>
      </section>

      {/* ── Doctors Preview ──────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-muted" aria-labelledby="doctors-heading">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal className="text-center mb-14">
            <p className="text-primary font-medium tracking-[0.2em] text-sm uppercase mb-3">Our Team</p>
            <h2 id="doctors-heading" className="font-[family-name:var(--font-heading)] text-3xl lg:text-4xl font-bold text-dark mb-4">
              Meet Our Specialists
            </h2>
            <div className="section-divider mx-auto" role="presentation" />
          </ScrollReveal>

          <StaggerReveal staggerMs={100} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {doctors.map((doc) => (
              <article key={doc.name} className="bg-white rounded-xl overflow-hidden border border-border-light card-hover">
                <Link href={doc.slug ? `/doctors/${doc.slug}` : "/about"} className="block">
                  <div className="aspect-[3/4] bg-gradient-to-br from-secondary-light to-secondary relative overflow-hidden">
                    <Image
                      src={doc.image}
                      alt={doc.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-dark mb-1">{doc.name}</h3>
                    <p className="text-xs text-primary font-medium mb-1">{doc.title}</p>
                    <p className="text-xs text-dark-light">{doc.specialty}</p>
                  </div>
                </Link>
              </article>
            ))}
          </StaggerReveal>
        </div>
      </section>

      {/* ── Gift Voucher CTA ─────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-gradient-to-r from-primary to-primary-dark text-white relative overflow-hidden" aria-labelledby="gift-heading">
        <div className="absolute top-10 right-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" aria-hidden="true" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent/10 rounded-full blur-2xl" aria-hidden="true" />
        <ScrollReveal className="relative max-w-7xl mx-auto px-6 text-center">
          <p className="text-accent-light font-medium tracking-[0.2em] text-sm uppercase mb-3">The Perfect Gift</p>
          <h2 id="gift-heading" className="font-[family-name:var(--font-heading)] text-3xl lg:text-4xl font-bold mb-4">
            Give the Gift of Beauty & Wellness
          </h2>
          <p className="text-white/80 max-w-2xl mx-auto mb-8">
            Surprise someone special with a Haven Medical gift voucher. Choose from our range of treatments or set a custom value — the perfect gift for any occasion.
          </p>
          <Link href="/gift-voucher" className="group inline-flex items-center gap-2 bg-white text-primary px-7 py-3.5 rounded-full font-medium hover:bg-accent-light hover:text-primary-dark transition-all hover:shadow-lg focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary">
            Explore Gift Vouchers <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
          </Link>
        </ScrollReveal>
      </section>

      {/* ── Testimonials ─────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-white" aria-labelledby="testimonials-heading">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal className="text-center mb-14">
            <p className="text-primary font-medium tracking-[0.2em] text-sm uppercase mb-3">Testimonials</p>
            <h2 id="testimonials-heading" className="font-[family-name:var(--font-heading)] text-3xl lg:text-4xl font-bold text-dark mb-4">
              What Our Patients Say
            </h2>
            <div className="section-divider mx-auto" role="presentation" />
          </ScrollReveal>

          <StaggerReveal staggerMs={120} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.slice(0, 3).map((t) => (
              <blockquote key={t.name} className="bg-muted rounded-xl p-6 border border-border-light">
                <div className="flex gap-1 mb-3" aria-label={`${t.rating} out of 5 stars`}>
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-accent text-accent" aria-hidden="true" />
                  ))}
                </div>
                <p className="text-sm text-dark-light leading-relaxed mb-4">&ldquo;{t.text}&rdquo;</p>
                <footer>
                  <p className="text-sm font-semibold text-dark">{t.name}</p>
                  <p className="text-xs text-primary">{t.treatment}</p>
                </footer>
              </blockquote>
            ))}
          </StaggerReveal>
        </div>
      </section>

      {/* ── Blog Preview ─────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-muted" aria-labelledby="blog-heading">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal className="text-center mb-14">
            <p className="text-primary font-medium tracking-[0.2em] text-sm uppercase mb-3">From Our Blog</p>
            <h2 id="blog-heading" className="font-[family-name:var(--font-heading)] text-3xl lg:text-4xl font-bold text-dark mb-4">
              Expert Insights & Advice
            </h2>
            <div className="section-divider mx-auto" role="presentation" />
          </ScrollReveal>

          <StaggerReveal staggerMs={100} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {latestPosts.map((post) => (
              <article key={post.slug}>
                <Link href={`/blog/${post.slug}`} className="group block bg-white rounded-xl overflow-hidden border border-border-light card-hover focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
                  <div className="aspect-[16/10] bg-muted relative overflow-hidden">
                    {post.image && (
                      <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-contain group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-primary font-medium">{post.category}</span>
                      <span className="text-xs text-dark-light flex items-center gap-1">
                        <Clock className="w-3 h-3" aria-hidden="true" /> <span>{post.readTime}</span>
                      </span>
                    </div>
                    <h3 className="font-semibold text-dark mb-2 group-hover:text-primary transition-colors">{post.title}</h3>
                    <p className="text-sm text-dark-light line-clamp-2">{post.excerpt}</p>
                  </div>
                </Link>
              </article>
            ))}
          </StaggerReveal>

          <div className="text-center mt-10">
            <Link href="/blog" className="group inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:rounded-lg focus-visible:px-2 focus-visible:py-1">
              Read More Articles <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Social Media Feeds ───────────────────────────────── */}
      <DynamicSocialFeed />

      {/* ── Booking CTA ──────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-dark text-white relative overflow-hidden" aria-labelledby="booking-heading">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" aria-hidden="true" />
        <ScrollReveal className="relative max-w-7xl mx-auto px-6 text-center">
          <h2 id="booking-heading" className="font-[family-name:var(--font-heading)] text-3xl lg:text-4xl font-bold mb-4">
            Ready to Begin Your Journey?
          </h2>
          <p className="text-white/70 max-w-2xl mx-auto mb-8">
            Book your consultation today and take the first step towards the results you deserve. Our team is ready to welcome you.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/appointment" className="group inline-flex items-center gap-2 bg-primary text-white px-7 py-3.5 rounded-full font-medium hover:bg-primary-light transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-dark">
              Book Appointment <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Link>
            <a
              href={getWhatsAppUrl("Hello, I would like to book a consultation at Haven Medical.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white px-7 py-3.5 rounded-full font-medium hover:bg-[#20bd5a] transition-colors focus-visible:ring-2 focus-visible:ring-[#25D366] focus-visible:ring-offset-2 focus-visible:ring-offset-dark"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Chat on WhatsApp
            </a>
          </div>
        </ScrollReveal>
      </section>

      {/* ── Contact Preview ──────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-white" aria-labelledby="contact-heading">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <ScrollReveal>
            <p className="text-primary font-medium tracking-[0.2em] text-sm uppercase mb-3">Visit Us</p>
            <h2 id="contact-heading" className="font-[family-name:var(--font-heading)] text-3xl lg:text-4xl font-bold text-dark mb-6">
              Find Haven Medical
            </h2>
            <address className="not-italic space-y-4 text-dark-light">
              <p className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0" aria-hidden="true">
                  <Clock className="w-4 h-4 text-primary" />
                </span>
                <span>{clinicInfo.hours.weekdays}</span>
              </p>
              <p className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0" aria-hidden="true">
                  <Clock className="w-4 h-4 text-primary" />
                </span>
                <span>{clinicInfo.hours.saturday}</span>
              </p>
            </address>
            <Link href="/contact" className="group inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-medium hover:bg-primary-dark transition-colors mt-8 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2">
              Contact Us <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
            </Link>
          </ScrollReveal>
          <ScrollReveal>
            <div className="aspect-[4/3] rounded-xl overflow-hidden border border-border-light">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3310.847698654806!2d35.62631527656603!3d33.919319173207285!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151f3f13b579a419%3A0x7759e15a0a6f1741!2sHaven%20Medical%20And%20Beauty%20Clinic!5e0!3m2!1sen!2slb!4v1775566655923!5m2!1sen!2slb"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Haven Medical And Beauty Clinic location on Google Maps"
              />
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
