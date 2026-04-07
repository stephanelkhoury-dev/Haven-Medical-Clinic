import { getDb } from "@/lib/db";
import { getBreadcrumbSchema } from "@/lib/schema";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Calendar, GraduationCap, Globe, Award } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import type { Metadata } from "next";

export const revalidate = 60;

interface DoctorProfile {
  id: string;
  name: string;
  title: string;
  specialty: string;
  image: string;
  bio: string;
  slug: string;
  fullBio: string;
  education: { degree: string; institution: string; year: string }[];
  languages: string;
  experienceYears: number;
  certifications: { title: string; issuer: string }[];
  gallery: string[];
  socialLinks: { instagram?: string; facebook?: string; linkedin?: string };
}

async function getDoctor(slug: string): Promise<DoctorProfile | null> {
  try {
    const sql = getDb();
    const rows = await sql`SELECT * FROM doctors WHERE slug = ${slug} LIMIT 1`;
    if (rows.length === 0) return null;
    const r = rows[0];
    return {
      id: r.id as string,
      name: r.name as string,
      title: (r.title || "") as string,
      specialty: (r.specialty || "") as string,
      image: (r.image || "") as string,
      bio: (r.bio || "") as string,
      slug: (r.slug || "") as string,
      fullBio: (r.full_bio || "") as string,
      education: (r.education || []) as DoctorProfile["education"],
      languages: (r.languages || "") as string,
      experienceYears: (r.experience_years ?? 0) as number,
      certifications: (r.certifications || []) as DoctorProfile["certifications"],
      gallery: (r.gallery || []) as string[],
      socialLinks: (r.social_links || {}) as DoctorProfile["socialLinks"],
    };
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const doctor = await getDoctor(slug);
  if (!doctor) return { title: "Doctor Not Found" };
  return {
    title: `${doctor.name} — ${doctor.title} | Haven Medical`,
    description: doctor.bio || `${doctor.name}, ${doctor.title} specializing in ${doctor.specialty} at Haven Medical Clinic, Qornet Chehwan.`,
    alternates: { canonical: `https://www.haven-beautyclinic.com/doctors/${doctor.slug}` },
    openGraph: {
      title: `${doctor.name} — ${doctor.title}`,
      description: doctor.bio,
      url: `https://www.haven-beautyclinic.com/doctors/${doctor.slug}`,
      images: doctor.image ? [{ url: doctor.image }] : undefined,
    },
  };
}

export default async function DoctorProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doctor = await getDoctor(slug);
  if (!doctor) notFound();

  const breadcrumb = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "About", url: "/about" },
    { name: doctor.name, url: `/doctors/${doctor.slug}` },
  ]);

  const hasSocial = doctor.socialLinks.instagram || doctor.socialLinks.facebook || doctor.socialLinks.linkedin;
  const hasEducation = doctor.education.length > 0;
  const hasCertifications = doctor.certifications.length > 0;
  const hasGallery = doctor.gallery.length > 1; // more than just the main photo

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Physician",
            name: doctor.name,
            jobTitle: doctor.title,
            medicalSpecialty: doctor.specialty,
            description: doctor.bio,
            image: doctor.image ? `https://www.haven-beautyclinic.com${doctor.image}` : undefined,
            worksFor: {
              "@type": "MedicalClinic",
              name: "Haven Medical Clinic",
              url: "https://www.haven-beautyclinic.com",
            },
          }),
        }}
      />

      {/* Hero */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 bg-gradient-to-br from-muted via-background to-muted-dark">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Image */}
            <ScrollReveal>
              <div className="aspect-[3/4] max-w-md mx-auto lg:mx-0 rounded-2xl overflow-hidden shadow-xl relative">
                {doctor.image ? (
                  <Image
                    src={doctor.image}
                    alt={doctor.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-secondary-light to-secondary flex items-center justify-center text-primary/20">
                    <GraduationCap className="w-20 h-20" />
                  </div>
                )}
              </div>
            </ScrollReveal>

            {/* Info */}
            <ScrollReveal delay={200}>
              <div>
                <p className="text-primary font-medium tracking-wider text-sm uppercase mb-3">{doctor.specialty}</p>
                <h1 className="font-[family-name:var(--font-heading)] text-4xl lg:text-5xl font-bold text-dark mb-2">
                  {doctor.name}
                </h1>
                <p className="text-lg text-primary font-medium mb-4">{doctor.title}</p>

                {/* Quick stats */}
                <div className="flex flex-wrap gap-4 mb-6">
                  {doctor.experienceYears > 0 && (
                    <div className="flex items-center gap-2 text-sm text-dark-light">
                      <Calendar className="w-4 h-4 text-primary" />
                      <span>{doctor.experienceYears}+ years experience</span>
                    </div>
                  )}
                  {doctor.languages && (
                    <div className="flex items-center gap-2 text-sm text-dark-light">
                      <Globe className="w-4 h-4 text-primary" />
                      <span>{doctor.languages}</span>
                    </div>
                  )}
                </div>

                <p className="text-dark-light leading-relaxed mb-6">{doctor.bio}</p>

                {/* Social Links */}
                {hasSocial && (
                  <div className="flex gap-3 mb-6">
                    {doctor.socialLinks.instagram && (
                      <a href={doctor.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors" aria-label={`${doctor.name} on Instagram`}>
                        <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
                      </a>
                    )}
                    {doctor.socialLinks.facebook && (
                      <a href={doctor.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors" aria-label={`${doctor.name} on Facebook`}>
                        <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      </a>
                    )}
                    {doctor.socialLinks.linkedin && (
                      <a href={doctor.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors" aria-label={`${doctor.name} on LinkedIn`}>
                        <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                      </a>
                    )}
                  </div>
                )}

                <Link
                  href="/appointment"
                  className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-primary-dark transition-colors"
                >
                  Book an Appointment
                </Link>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* Full Bio */}
      {doctor.fullBio && (
        <section className="py-20 lg:py-28 bg-white">
          <div className="max-w-4xl mx-auto px-6">
            <ScrollReveal>
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-dark mb-4">About {doctor.name.split(" ")[0]} {doctor.name.split(" ").slice(1).join(" ")}</h2>
              <div className="section-divider mb-8" />
              <div className="text-dark-light leading-relaxed space-y-4">
                {doctor.fullBio.split("\n\n").map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </ScrollReveal>
          </div>
        </section>
      )}

      {/* Education & Certifications */}
      {(hasEducation || hasCertifications) && (
        <section className="py-20 lg:py-28 bg-muted">
          <div className="max-w-7xl mx-auto px-6">
            <ScrollReveal className="text-center mb-14">
              <h2 className="font-[family-name:var(--font-heading)] text-3xl lg:text-4xl font-bold text-dark mb-4">
                Education & Credentials
              </h2>
              <div className="section-divider mx-auto" />
            </ScrollReveal>

            <div className={`grid ${hasEducation && hasCertifications ? "lg:grid-cols-2" : ""} gap-12`}>
              {/* Education */}
              {hasEducation && (
                <ScrollReveal>
                  <h3 className="flex items-center gap-2 text-xl font-semibold text-dark mb-6">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    Education
                  </h3>
                  <div className="space-y-4">
                    {doctor.education.map((edu, i) => (
                      <div key={i} className="bg-white rounded-xl p-5 border border-border-light">
                        <p className="font-semibold text-dark text-sm">{edu.degree}</p>
                        <p className="text-xs text-dark-light mt-1">{edu.institution}</p>
                        {edu.year && <p className="text-xs text-primary font-medium mt-1">{edu.year}</p>}
                      </div>
                    ))}
                  </div>
                </ScrollReveal>
              )}

              {/* Certifications */}
              {hasCertifications && (
                <ScrollReveal delay={hasEducation ? 200 : 0}>
                  <h3 className="flex items-center gap-2 text-xl font-semibold text-dark mb-6">
                    <Award className="w-5 h-5 text-primary" />
                    Certifications & Memberships
                  </h3>
                  <div className="space-y-4">
                    {doctor.certifications.map((cert, i) => (
                      <div key={i} className="bg-white rounded-xl p-5 border border-border-light">
                        <p className="font-semibold text-dark text-sm">{cert.title}</p>
                        <p className="text-xs text-dark-light mt-1">{cert.issuer}</p>
                      </div>
                    ))}
                  </div>
                </ScrollReveal>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Gallery */}
      {hasGallery && (
        <section className="py-20 lg:py-28 bg-white">
          <div className="max-w-7xl mx-auto px-6">
            <ScrollReveal className="text-center mb-14">
              <h2 className="font-[family-name:var(--font-heading)] text-3xl lg:text-4xl font-bold text-dark mb-4">
                Gallery
              </h2>
              <div className="section-divider mx-auto" />
            </ScrollReveal>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {doctor.gallery.map((img, i) => (
                <ScrollReveal key={i} delay={i * 100}>
                  <div className="aspect-[4/3] rounded-xl overflow-hidden relative shadow-md">
                    <Image
                      src={img}
                      alt={`${doctor.name} — photo ${i + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 lg:py-28 bg-gradient-to-r from-primary to-primary-dark text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <ScrollReveal>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl lg:text-4xl font-bold mb-4">
              Ready to Book a Consultation?
            </h2>
            <p className="text-white/70 mb-8 max-w-2xl mx-auto">
              Schedule your appointment with {doctor.name} and take the first step towards your goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/appointment"
                className="inline-flex items-center justify-center gap-2 bg-white text-primary px-8 py-3 rounded-full text-sm font-semibold hover:bg-accent transition-colors"
              >
                Book Appointment
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center gap-2 border-2 border-white/30 text-white px-8 py-3 rounded-full text-sm font-semibold hover:bg-white/10 transition-colors"
              >
                View All Specialists
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
