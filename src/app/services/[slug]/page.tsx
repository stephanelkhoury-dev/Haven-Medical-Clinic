import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock, CheckCircle2, ChevronDown, ChevronRight } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { services, getServiceBySlug, getRelatedServices } from "@/data/services";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import { getServiceSchema, getFAQSchema, getBreadcrumbSchema } from "@/lib/schema";
import type { Metadata } from "next";

export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) return {};
  const title = `${service.title} in Beirut — Haven Medical`;
  const description = `${service.shortDescription} Expert ${service.title.toLowerCase()} treatment at Haven Medical Clinic, Beirut, Lebanon. Board-certified specialists. Book your consultation today.`;
  return {
    title,
    description,
    alternates: { canonical: `https://www.haven-beautyclinic.com/services/${slug}` },
    openGraph: {
      title,
      description: service.shortDescription,
      url: `https://www.haven-beautyclinic.com/services/${slug}`,
      images: [{ url: service.heroImage, width: 1200, height: 630, alt: `${service.title} at Haven Medical Beirut` }],
    },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getServiceBySlug(slug);
  if (!service) notFound();

  const Icon = service.icon;
  const related = getRelatedServices(service);

  const serviceSchema = getServiceSchema(service);
  const faqSchema = service.faqs?.length
    ? getFAQSchema(service.faqs)
    : null;
  const breadcrumb = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Services", url: "/services" },
    { name: service.title, url: `/services/${service.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      {/* Hero */}
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 bg-gradient-to-br from-muted via-background to-muted-dark" aria-labelledby="service-heading">
        <div className="max-w-7xl mx-auto px-6">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-dark-light mb-4">
            <Link href="/services" className="hover:text-primary transition-colors focus-visible:ring-2 focus-visible:ring-accent rounded">Services</Link>
            <ChevronRight className="w-3.5 h-3.5" aria-hidden="true" />
            <span className="text-primary" aria-current="page">{service.title}</span>
          </nav>
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Icon className="w-7 h-7 text-primary" />
              </div>
              <h1 className="font-[family-name:var(--font-heading)] text-3xl lg:text-5xl font-bold text-dark mb-4">
                {service.title}
              </h1>
              <p className="text-lg text-dark-light leading-relaxed mb-6">
                {service.shortDescription}
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href={getWhatsAppUrl(`Hello, I am interested in ${service.title} at Haven Medical. I would like to book a consultation.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-medium hover:bg-primary-dark transition-colors"
                >
                  Book This Treatment <ArrowRight className="w-4 h-4" />
                </a>
                <Link
                  href="/appointment"
                  className="inline-flex items-center gap-2 border-2 border-primary text-primary px-6 py-3 rounded-full font-medium hover:bg-primary hover:text-white transition-all"
                >
                  Request Appointment
                </Link>
              </div>
            </div>
            <div className="aspect-[4/3] rounded-2xl overflow-hidden shadow-lg relative bg-gradient-to-br from-secondary to-secondary-light">
              <Image
                src={service.heroImage}
                alt={service.title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* Overview */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <ScrollReveal>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl lg:text-3xl font-bold text-dark mb-4">Overview</h2>
            <div className="section-divider mb-6" />
            <p className="text-dark-light leading-relaxed text-lg">{service.overview}</p>
          </ScrollReveal>
        </div>
      </section>

      {/* Who is it for */}
      <section className="py-16 lg:py-24 bg-muted">
        <div className="max-w-4xl mx-auto px-6">
          <ScrollReveal>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl lg:text-3xl font-bold text-dark mb-4">Who Is It For?</h2>
            <div className="section-divider mb-6" />
            <p className="text-dark-light leading-relaxed text-lg">{service.whoIsItFor}</p>
          </ScrollReveal>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <ScrollReveal>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl lg:text-3xl font-bold text-dark mb-4">Benefits</h2>
            <div className="section-divider mb-8" />
          </ScrollReveal>
          <div className="grid sm:grid-cols-2 gap-4">
            {service.benefits.map((benefit, i) => (
              <ScrollReveal key={i} delay={i * 60}>
                <div className="flex items-start gap-3 p-4 bg-muted rounded-lg border border-border-light">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                  <p className="text-dark-light">{benefit}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Procedure Steps */}
      <section className="py-16 lg:py-24 bg-muted">
        <div className="max-w-4xl mx-auto px-6">
          <ScrollReveal>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl lg:text-3xl font-bold text-dark mb-4">Procedure Steps</h2>
            <div className="section-divider mb-8" />
          </ScrollReveal>
          <div className="space-y-4">
            {service.procedureSteps.map((step, i) => (
              <ScrollReveal key={i} delay={i * 80}>
                <div className="flex items-start gap-4 p-5 bg-white rounded-lg border border-border-light">
                  <span className="w-8 h-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-dark-light pt-1">{step}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Duration & Recovery & Results */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Clock, title: "Duration", content: service.duration },
              { icon: CheckCircle2, title: "Recovery / Aftercare", content: service.recovery },
              { icon: CheckCircle2, title: "Expected Results", content: service.expectedResults },
            ].map((item, i) => (
              <ScrollReveal key={item.title} delay={i * 100}>
                <div className="bg-muted rounded-xl p-6 border border-border-light h-full">
                  <item.icon className="w-6 h-6 text-primary mb-3" />
                  <h3 className="font-semibold text-dark mb-2">{item.title}</h3>
                  <p className="text-sm text-dark-light leading-relaxed">{item.content}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Sub-services */}
      {service.subServices && (
        <section className="py-16 lg:py-24 bg-muted">
          <div className="max-w-4xl mx-auto px-6">
            <ScrollReveal>
              <h2 className="font-[family-name:var(--font-heading)] text-2xl lg:text-3xl font-bold text-dark mb-4">
                Included Treatments
              </h2>
              <div className="section-divider mb-8" />
            </ScrollReveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {service.subServices.map((sub, i) => (
                <ScrollReveal key={sub.name} delay={i * 80}>
                  <div className="bg-white rounded-xl p-6 border border-border-light h-full">
                    <h3 className="font-semibold text-dark mb-2">{sub.name}</h3>
                    <p className="text-sm text-dark-light leading-relaxed">{sub.description}</p>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQs */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <ScrollReveal>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl lg:text-3xl font-bold text-dark mb-4">
              Frequently Asked Questions
            </h2>
            <div className="section-divider mb-8" />
          </ScrollReveal>
          <div className="space-y-4">
            {service.faqs.map((faq, i) => (
              <ScrollReveal key={i} delay={i * 60}>
                <details className="group bg-muted rounded-xl border border-border-light overflow-hidden">
                  <summary className="flex items-center justify-between p-5 cursor-pointer list-none">
                    <span className="font-medium text-dark pr-4">{faq.question}</span>
                    <ChevronDown className="w-5 h-5 text-primary shrink-0 group-open:rotate-180 transition-transform" />
                  </summary>
                  <div className="px-5 pb-5">
                    <p className="text-dark-light leading-relaxed">{faq.answer}</p>
                  </div>
                </details>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Related Services */}
      {related.length > 0 && (
        <section className="py-16 lg:py-24 bg-muted">
          <div className="max-w-7xl mx-auto px-6">
            <ScrollReveal>
              <h2 className="font-[family-name:var(--font-heading)] text-2xl lg:text-3xl font-bold text-dark mb-4">
                Related Services
              </h2>
              <div className="section-divider mb-8" />
            </ScrollReveal>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {related.map((rel, i) => {
                const RelIcon = rel.icon;
                return (
                  <ScrollReveal key={rel.slug} delay={i * 80}>
                    <Link
                      href={`/services/${rel.slug}`}
                      className="group block bg-white rounded-xl border border-border-light p-6 card-hover"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
                        <RelIcon className="w-5 h-5 text-primary" />
                      </div>
                      <h3 className="font-semibold text-dark mb-1">{rel.title}</h3>
                      <p className="text-sm text-dark-light line-clamp-2">{rel.shortDescription}</p>
                    </Link>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Booking CTA */}
      <section className="py-20 lg:py-28 bg-gradient-to-r from-primary to-primary-dark text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <ScrollReveal>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl lg:text-4xl font-bold mb-4">
              Ready to Book {service.title}?
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto mb-8">
              Take the first step today. Contact us via WhatsApp or book an appointment online.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href={getWhatsAppUrl(`Hello, I would like to book ${service.title} at Haven Medical.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white text-primary px-7 py-3.5 rounded-full font-medium hover:bg-accent-light transition-all"
              >
                WhatsApp Booking <ArrowRight className="w-4 h-4" />
              </a>
              <Link
                href="/appointment"
                className="inline-flex items-center gap-2 border-2 border-white text-white px-7 py-3.5 rounded-full font-medium hover:bg-white hover:text-primary transition-all"
              >
                Request Appointment
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
