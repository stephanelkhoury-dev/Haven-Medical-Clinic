import Link from "next/link";
import { ChevronRight } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { services, serviceCategories, getServicesByCategory } from "@/data/services";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Explore our comprehensive range of aesthetic treatments, surgical procedures, medical consultations, and wellness services at Haven Medical.",
};

export default function ServicesPage() {
  const categories = Object.entries(serviceCategories) as [
    keyof typeof serviceCategories,
    (typeof serviceCategories)[keyof typeof serviceCategories]
  ][];

  return (
    <>
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
        const catServices = getServicesByCategory(key);
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
                  const Icon = service.icon;
                  return (
                    <ScrollReveal key={service.slug} delay={i * 80}>
                      <Link
                        href={`/services/${service.slug}`}
                        className="group block bg-background rounded-xl border border-border-light p-6 card-hover h-full"
                      >
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
