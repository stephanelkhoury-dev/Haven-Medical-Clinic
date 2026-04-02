import { Metadata } from "next";
import Link from "next/link";
import { Check, Star, ArrowRight } from "lucide-react";
import { getDb } from "@/lib/db";
import { getWhatsAppUrl } from "@/lib/whatsapp";

export const metadata: Metadata = {
  title: "Membership Plans — VIP Aesthetic & Wellness Care",
  description:
    "Join Haven Medical's exclusive membership: Essential ($49/mo), Premium ($129/mo), or Elite ($299/mo). Save up to 30% on all treatments including Botox, facials, massage, and more.",
  alternates: { canonical: "https://www.haven-beautyclinic.com/membership" },
  openGraph: {
    title: "Haven Medical Membership — Save on All Treatments",
    description: "Exclusive membership plans starting at $49/month. Priority booking, discounts on Botox, facials, and all treatments.",
    url: "https://www.haven-beautyclinic.com/membership",
  },
};

export const dynamic = "force-dynamic";

async function getPlans() {
  try {
    const sql = getDb();
    const rows = await sql`SELECT * FROM subscription_plans ORDER BY price ASC`;
    return rows.map((r) => ({
      id: r.id as string,
      name: r.name as string,
      price: r.price as number,
      interval: r.interval as string,
      features: (r.features || []) as string[],
      popular: r.popular as boolean,
      description: (r.description || "") as string,
    }));
  } catch {
    return [];
  }
}

export default async function MembershipPage() {
  const subscriptionPlans = await getPlans();
  return (
    <div>
      {/* Hero */}
      <section className="relative py-24 bg-gradient-to-b from-secondary/20 to-background">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <span className="inline-block text-sm font-medium text-primary tracking-widest uppercase mb-4">
            Membership
          </span>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl md:text-5xl font-bold text-dark mb-6">
            Your Wellness,{" "}
            <span className="gradient-text">Elevated</span>
          </h1>
          <p className="text-lg text-dark/60 max-w-2xl mx-auto">
            Unlock exclusive benefits, priority bookings, and preferential rates
            with a Haven Medical membership plan tailored to your needs.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {subscriptionPlans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl p-8 transition-all duration-300 hover:-translate-y-1 ${
                  plan.popular
                    ? "ring-2 ring-primary shadow-xl scale-[1.02]"
                    : "border border-gray-200 shadow-sm hover:shadow-lg"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 bg-primary text-white text-xs font-semibold px-4 py-1.5 rounded-full">
                      <Star className="w-3.5 h-3.5" />
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <h3 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-dark">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-dark/50 mt-1">
                    {plan.description}
                  </p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-dark">
                      ${plan.price}
                    </span>
                    <span className="text-dark/50">/month</span>
                  </div>
                </div>

                <div className="section-divider" />

                <ul className="space-y-3 my-6">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-3 text-sm text-dark/70"
                    >
                      <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <a
                  href={getWhatsAppUrl(
                    `Hello, I'm interested in the ${plan.name} membership plan ($${plan.price}/month). Please share more details.`
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-colors ${
                    plan.popular
                      ? "bg-primary text-white hover:bg-primary-dark"
                      : "bg-primary/10 text-primary hover:bg-primary/20"
                  }`}
                >
                  Get Started
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-secondary/10">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-dark mb-12">
            Why Become a Member?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "💎",
                title: "Exclusive Savings",
                desc: "Enjoy preferential rates on all treatments and products with your membership tier.",
              },
              {
                icon: "📅",
                title: "Priority Booking",
                desc: "Skip the queue with priority scheduling for all appointments and consultations.",
              },
              {
                icon: "🎁",
                title: "Member-Only Perks",
                desc: "Access exclusive events, complimentary treatments, and personalized wellness plans.",
              },
            ].map((benefit) => (
              <div key={benefit.title} className="text-center">
                <span className="text-4xl block mb-3">{benefit.icon}</span>
                <h3 className="font-semibold text-dark mb-2">
                  {benefit.title}
                </h3>
                <p className="text-sm text-dark/60">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold text-dark text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "Can I cancel my membership at any time?",
                a: "Yes, all memberships can be cancelled with 30 days notice. There are no long-term commitments or cancellation fees.",
              },
              {
                q: "How do I use my membership benefits?",
                a: "Simply mention your membership when booking any appointment. Your discounts and perks will be applied automatically.",
              },
              {
                q: "Can I upgrade or downgrade my plan?",
                a: "Absolutely! You can change your plan at any time. The new rate will take effect on your next billing cycle.",
              },
              {
                q: "Is there a family membership option?",
                a: "Yes! Contact us to learn about family add-on options available with our Premium and Elite plans.",
              },
            ].map((faq) => (
              <div
                key={faq.q}
                className="bg-white rounded-xl border border-gray-200 p-5"
              >
                <h3 className="font-semibold text-dark">{faq.q}</h3>
                <p className="text-sm text-dark/60 mt-2">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-dark text-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold mb-4">
            Ready to Join?
          </h2>
          <p className="text-white/60 mb-8">
            Start your membership today and experience premium care at its finest.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={getWhatsAppUrl(
                "Hello, I'm interested in learning more about Haven Medical membership plans."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-accent text-dark px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-accent/90 transition-colors"
            >
              Chat With Us
              <ArrowRight className="w-4 h-4" />
            </a>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-white/10 text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-white/20 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
