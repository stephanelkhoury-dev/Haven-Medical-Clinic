import { Shield, Award, Users, Heart, Target, Eye } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import ScrollReveal from "@/components/ScrollReveal";
import { getAboutPageSchema, getBreadcrumbSchema } from "@/lib/schema";
import { getDb } from "@/lib/db";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "About Us — Board-Certified Specialists in Lebanon",
  description:
    "Meet Haven Medical's board-certified plastic surgeons, dermatologists, and aesthetic specialists in Qornet Chehwan, Lebanon. 15+ years of experience, 5,000+ satisfied patients.",
  alternates: { canonical: "https://www.haven-beautyclinic.com/about" },
  openGraph: {
    title: "About Haven Medical — Our Story & Specialists",
    description: "Board-certified plastic surgeons, dermatologists, and aesthetic specialists in Lebanon with 15+ years of experience.",
    url: "https://www.haven-beautyclinic.com/about",
  },
};

export default async function AboutPage() {
  let doctors: { name: string; title: string; specialty: string; image: string; bio: string; slug: string }[] = [];
  try {
    const sql = getDb();
    const rows = await sql`SELECT name, title, specialty, image, bio, slug FROM doctors ORDER BY sort_order ASC`;
    doctors = rows.map((r) => ({
      name: r.name as string,
      title: (r.title || "") as string,
      specialty: (r.specialty || "") as string,
      image: (r.image || "") as string,
      bio: (r.bio || "") as string,
      slug: (r.slug || "") as string,
    }));
  } catch { /* fallback to empty */ }

  const aboutSchema = getAboutPageSchema();
  const breadcrumb = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "About", url: "/about" },
  ]);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />

      {/* Hero */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 bg-gradient-to-br from-muted via-background to-muted-dark">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-primary font-medium tracking-wider text-sm uppercase mb-3">About Us</p>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl lg:text-5xl font-bold text-dark mb-4">
            The Story Behind Haven Medical
          </h1>
          <p className="text-dark-light max-w-2xl mx-auto text-lg leading-relaxed">
            A sanctuary where medical excellence, luxury care, and unwavering commitment to your wellbeing come together.
          </p>
        </div>
      </section>

      {/* Clinic Story */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <ScrollReveal>
            <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-secondary to-secondary-light flex items-center justify-center text-primary/20">
              <Heart className="w-20 h-20" />
            </div>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-dark mb-4">Our Story</h2>
            <div className="section-divider mb-6" />
            <p className="text-dark-light leading-relaxed mb-4">
              Haven Medical was founded with a singular vision: to create a medical practice where patients feel genuinely cared for — where cutting-edge science is paired with an atmosphere of warmth and refinement.
            </p>
            <p className="text-dark-light leading-relaxed mb-4">
              Our founders, drawing from years of international medical training and practice, recognized a gap in the healthcare landscape — the need for a clinic that combines the highest standards of medical expertise with the hospitality and attention to detail found in luxury wellness experiences.
            </p>
            <p className="text-dark-light leading-relaxed">
              Today, Haven Medical stands as a beacon of this philosophy. Every detail — from our carefully designed spaces to our meticulously curated treatments — reflects our dedication to excellence and your comfort.
            </p>
          </ScrollReveal>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-20 lg:py-28 bg-muted">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal className="text-center mb-14">
            <h2 className="font-[family-name:var(--font-heading)] text-3xl lg:text-4xl font-bold text-dark mb-4">Mission & Values</h2>
            <div className="section-divider mx-auto" />
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Target, title: "Our Mission", desc: "To deliver exceptional medical and aesthetic care that enhances our patients' confidence, health, and quality of life — in an environment that feels like a haven." },
              { icon: Eye, title: "Our Vision", desc: "To be the region's most trusted name in integrated medical aesthetics and wellness, setting new standards for patient care and clinical excellence." },
              { icon: Heart, title: "Our Values", desc: "Integrity, patient-first care, scientific rigor, continuous innovation, and a deep respect for each individual's unique journey and goals." },
            ].map((item, i) => (
              <ScrollReveal key={item.title} delay={i * 100}>
                <div className="bg-white rounded-xl p-8 border border-border-light text-center card-hover">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold text-dark mb-3">{item.title}</h3>
                  <p className="text-sm text-dark-light leading-relaxed">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Medical Philosophy */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
          <ScrollReveal>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-dark mb-4">Our Medical Philosophy</h2>
            <div className="section-divider mb-6" />
            <p className="text-dark-light leading-relaxed mb-4">
              At Haven Medical, we believe that the best results come from a deep understanding of each patient. We take the time to listen, assess, and understand your unique goals before recommending any treatment.
            </p>
            <p className="text-dark-light leading-relaxed mb-4">
              Our approach is rooted in evidence-based medicine — we use only proven techniques and technologies, delivered by specialists with recognized credentials and ongoing training.
            </p>
            <p className="text-dark-light leading-relaxed">
              We prioritize natural-looking results, patient safety, and long-term satisfaction over quick fixes. Your journey at Haven Medical is one of partnership, transparency, and trust.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={200}>
            <div className="aspect-[4/3] rounded-2xl bg-gradient-to-br from-secondary-light to-secondary flex items-center justify-center text-primary/20">
              <Shield className="w-20 h-20" />
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 lg:py-28 bg-muted">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal className="text-center mb-14">
            <p className="text-primary font-medium tracking-wider text-sm uppercase mb-3">Our Team</p>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl lg:text-4xl font-bold text-dark mb-4">
              Meet Our Specialists
            </h2>
            <div className="section-divider mx-auto mb-4" />
            <p className="text-dark-light max-w-2xl mx-auto">
              Our multidisciplinary team of board-certified professionals brings together expertise from leading medical institutions worldwide.
            </p>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {doctors.map((doc, i) => (
              <ScrollReveal key={doc.name} delay={i * 100}>
                <Link href={doc.slug ? `/doctors/${doc.slug}` : "#"} className="block bg-white rounded-xl overflow-hidden border border-border-light card-hover">
                  <div className="aspect-[3/4] bg-gradient-to-br from-secondary-light to-secondary relative overflow-hidden">
                    {doc.image ? (
                      <Image src={doc.image} alt={doc.name} fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-primary/20"><Users className="w-16 h-16" /></div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-dark mb-1">{doc.name}</h3>
                    <p className="text-xs text-primary font-medium mb-2">{doc.title}</p>
                    <p className="text-xs text-dark-light">{doc.specialty}</p>
                    <p className="text-xs text-dark-light mt-2 leading-relaxed">{doc.bio}</p>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <ScrollReveal>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-dark mb-4">Certifications & Accreditations</h2>
            <div className="section-divider mx-auto mb-8" />
            <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
              {["Board-Certified Practitioners", "International Training Programs", "Advanced Technology Certifications"].map((cert, i) => (
                <div key={cert} className="bg-muted rounded-xl p-6 border border-border-light">
                  <Award className="w-8 h-8 text-primary mx-auto mb-3" />
                  <p className="text-sm font-medium text-dark">{cert}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Why Trust */}
      <section className="py-20 lg:py-28 bg-gradient-to-r from-primary to-primary-dark text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <ScrollReveal>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl lg:text-4xl font-bold mb-8">
              Why Patients Trust Haven Medical
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { num: "15+", label: "Years of Experience" },
                { num: "5,000+", label: "Happy Patients" },
                { num: "20+", label: "Treatments Offered" },
                { num: "100%", label: "Commitment to Care" },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-4xl font-bold text-accent mb-2">{stat.num}</p>
                  <p className="text-sm text-white/70">{stat.label}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
