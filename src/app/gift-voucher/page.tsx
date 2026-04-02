import Link from "next/link";
import { ArrowRight, Gift, CreditCard, Heart, MessageCircle } from "lucide-react";
import ScrollReveal from "@/components/ScrollReveal";
import { services } from "@/data/services";
import { getWhatsAppUrl } from "@/lib/whatsapp";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gift Voucher — Beauty & Wellness Gifts",
  description:
    "Give the gift of beauty, wellness, and confidence with a Haven Medical gift voucher. Choose Botox, facial treatments, massages, or set a custom value from $50-$500.",
  alternates: { canonical: "https://www.haven-beautyclinic.com/gift-voucher" },
  openGraph: {
    title: "Haven Medical Gift Vouchers — Give the Gift of Beauty",
    description: "Gift vouchers for aesthetic treatments and wellness services at Haven Medical Beirut.",
    url: "https://www.haven-beautyclinic.com/gift-voucher",
  },
};

const voucherAmounts = [50, 100, 150, 200, 300, 500];

const featuredTreatments = [
  "Facial Treatments",
  "Botox & Fillers",
  "Skin Boosters",
  "Deep Tissue Massage",
  "Lymphatic Drainage",
  "Laser Hair Removal",
];

export default function GiftVoucherPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-20 lg:pt-40 lg:pb-28 bg-gradient-to-br from-muted via-background to-muted-dark">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Gift className="w-8 h-8 text-primary" />
          </div>
          <p className="text-primary font-medium tracking-wider text-sm uppercase mb-3">Gift Vouchers</p>
          <h1 className="font-[family-name:var(--font-heading)] text-4xl lg:text-5xl font-bold text-dark mb-4">
            The Gift of Beauty & Wellness
          </h1>
          <p className="text-dark-light max-w-2xl mx-auto text-lg leading-relaxed">
            Treat someone special — or yourself — to a luxurious experience at Haven Medical. Our gift vouchers are perfect for any occasion.
          </p>
        </div>
      </section>

      {/* Voucher Amounts */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal className="text-center mb-12">
            <h2 className="font-[family-name:var(--font-heading)] text-2xl lg:text-3xl font-bold text-dark mb-3">
              Choose Your Voucher
            </h2>
            <div className="section-divider mx-auto mb-4" />
            <p className="text-dark-light max-w-xl mx-auto">
              Select a preset amount or request a custom value. Each voucher can be used towards any treatment at Haven Medical.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {voucherAmounts.map((amount, i) => (
              <ScrollReveal key={amount} delay={i * 60}>
                <a
                  href={getWhatsAppUrl(`Hello, I would like to purchase a gift voucher for $${amount} at Haven Medical.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-muted rounded-xl border border-border-light p-6 text-center card-hover"
                >
                  <CreditCard className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="text-2xl font-bold text-dark">${amount}</p>
                  <p className="text-xs text-dark-light mt-1">Gift Voucher</p>
                </a>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal className="text-center">
            <a
              href={getWhatsAppUrl("Hello, I would like to purchase a custom-value gift voucher at Haven Medical.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 border-2 border-primary text-primary px-6 py-3 rounded-full font-medium hover:bg-primary hover:text-white transition-all"
            >
              Request Custom Amount <ArrowRight className="w-4 h-4" />
            </a>
          </ScrollReveal>
        </div>
      </section>

      {/* Treatment Vouchers */}
      <section className="py-20 lg:py-28 bg-muted">
        <div className="max-w-7xl mx-auto px-6">
          <ScrollReveal className="text-center mb-12">
            <h2 className="font-[family-name:var(--font-heading)] text-2xl lg:text-3xl font-bold text-dark mb-3">
              Or Gift a Specific Treatment
            </h2>
            <div className="section-divider mx-auto mb-4" />
            <p className="text-dark-light max-w-xl mx-auto">
              Know exactly what they would love? Choose a specific treatment as a gift.
            </p>
          </ScrollReveal>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTreatments.map((treatment, i) => (
              <ScrollReveal key={treatment} delay={i * 80}>
                <a
                  href={getWhatsAppUrl(`Hello, I would like to purchase a gift voucher for "${treatment}" at Haven Medical.`)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white rounded-xl border border-border-light p-6 card-hover"
                >
                  <Heart className="w-6 h-6 text-primary mb-3" />
                  <h3 className="font-semibold text-dark mb-1">{treatment}</h3>
                  <p className="text-sm text-dark-light">Gift this treatment</p>
                </a>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-6">
          <ScrollReveal className="text-center mb-12">
            <h2 className="font-[family-name:var(--font-heading)] text-2xl lg:text-3xl font-bold text-dark mb-3">
              How It Works
            </h2>
            <div className="section-divider mx-auto" />
          </ScrollReveal>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Choose Your Gift", desc: "Select an amount or specific treatment for your loved one." },
              { step: "2", title: "Contact Us", desc: "Reach out via WhatsApp or our contact form with your request." },
              { step: "3", title: "Receive & Gift", desc: "We prepare a beautifully presented voucher for you to give." },
            ].map((item, i) => (
              <ScrollReveal key={item.step} delay={i * 100}>
                <div className="text-center">
                  <span className="w-12 h-12 rounded-full bg-primary text-white text-lg font-bold flex items-center justify-center mx-auto mb-4">
                    {item.step}
                  </span>
                  <h3 className="font-semibold text-dark mb-2">{item.title}</h3>
                  <p className="text-sm text-dark-light">{item.desc}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Terms */}
      <section className="py-16 lg:py-20 bg-muted">
        <div className="max-w-4xl mx-auto px-6">
          <ScrollReveal>
            <h2 className="font-[family-name:var(--font-heading)] text-xl font-bold text-dark mb-4">Terms & Conditions</h2>
            <ul className="text-sm text-dark-light space-y-2">
              <li>• Gift vouchers are valid for 12 months from the date of purchase.</li>
              <li>• Vouchers are non-refundable and cannot be exchanged for cash.</li>
              <li>• Vouchers can be used for any treatment at Haven Medical.</li>
              <li>• If the treatment value exceeds the voucher amount, the balance can be paid at the time of the appointment.</li>
              <li>• Appointments must be booked in advance and are subject to availability.</li>
            </ul>
          </ScrollReveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-28 bg-gradient-to-r from-primary to-primary-dark text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <ScrollReveal>
            <h2 className="font-[family-name:var(--font-heading)] text-3xl lg:text-4xl font-bold mb-4">
              Ready to Gift an Experience?
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto mb-8">
              Contact us on WhatsApp and we will help you create the perfect gift.
            </p>
            <a
              href={getWhatsAppUrl("Hello, I would like to purchase a gift voucher at Haven Medical.")}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-white text-primary px-7 py-3.5 rounded-full font-medium hover:bg-accent-light transition-all"
            >
              <MessageCircle className="w-5 h-5" />
              Request via WhatsApp
            </a>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
