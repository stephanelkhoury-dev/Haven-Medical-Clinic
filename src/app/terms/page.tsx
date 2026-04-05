import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions | Haven Medical",
  description: "Haven Medical terms and conditions for use of our website and services.",
  alternates: { canonical: "https://www.haven-beautyclinic.com/terms" },
};

export default function TermsPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-muted via-background to-muted-dark">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="font-[family-name:var(--font-heading)] text-4xl lg:text-5xl font-bold text-dark mb-4">
            Terms &amp; Conditions
          </h1>
          <p className="text-dark-light">Last updated: April 5, 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-6 prose prose-lg text-dark-light leading-relaxed space-y-8">
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-dark mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using the Haven Medical website at{" "}
              <Link href="/" className="text-primary hover:underline">haven-beautyclinic.com</Link>{" "}
              or by using our clinic services, you agree to be bound by these Terms &amp; Conditions. If you do not agree with any part of these terms, please do not use our website or services.
            </p>
          </div>

          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-dark mb-3">2. Services</h2>
            <p>
              Haven Medical provides aesthetic, surgical, medical, and wellness services at our clinic in Beirut, Lebanon. All treatments are performed by qualified, licensed medical professionals.
            </p>
            <p className="mt-2">
              The information provided on our website is for general informational purposes only and does not constitute medical advice. Always consult directly with our specialists for personalized medical guidance.
            </p>
          </div>

          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-dark mb-3">3. Appointments &amp; Bookings</h2>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Appointment requests made through our website or WhatsApp are subject to availability and confirmation by our team.</li>
              <li>We kindly request at least <strong>24 hours&apos; notice</strong> for cancellations or rescheduling.</li>
              <li>Late cancellations or no-shows may be subject to a cancellation fee at our discretion.</li>
              <li>Arriving more than 15 minutes late may result in rescheduling to ensure quality care for all patients.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-dark mb-3">4. Consultations &amp; Consent</h2>
            <p>
              All medical and aesthetic treatments require an initial consultation. During this consultation, our specialists will assess your suitability for the requested treatment, explain the procedure, discuss expected results and potential risks, and obtain your informed consent.
            </p>
            <p className="mt-2">
              Haven Medical reserves the right to decline or postpone a treatment if our medical team determines it is not in your best interest.
            </p>
          </div>

          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-dark mb-3">5. Treatment Results</h2>
            <p>
              Results from medical and aesthetic procedures vary between individuals. While we strive for the best possible outcomes, Haven Medical does not guarantee specific results. Before-and-after images shown on our website are for illustrative purposes and individual results may differ.
            </p>
          </div>

          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-dark mb-3">6. Pricing &amp; Payment</h2>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Prices for services are provided during consultation and may vary based on individual treatment plans.</li>
              <li>All prices are in US Dollars (USD) or Lebanese Pounds (LBP) as indicated at the time of booking.</li>
              <li>Payment is due at the time of service unless otherwise arranged.</li>
              <li>We accept cash, credit/debit cards, and bank transfers.</li>
              <li>Prices are subject to change without prior notice. Any price changes will not affect confirmed and paid bookings.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-dark mb-3">7. Gift Vouchers</h2>
            <ul className="list-disc pl-6 space-y-2 mt-2">
              <li>Gift vouchers are non-refundable and non-transferable for cash.</li>
              <li>Vouchers must be redeemed within 12 months of purchase unless otherwise stated.</li>
              <li>Lost or stolen vouchers cannot be replaced.</li>
              <li>Any remaining balance after a treatment can be used for future services within the validity period.</li>
            </ul>
          </div>

          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-dark mb-3">8. Membership Plans</h2>
            <p>
              Haven Medical membership plans are subject to their specific terms as outlined on the{" "}
              <Link href="/membership" className="text-primary hover:underline">Membership page</Link>.
              Memberships are personal and non-transferable. We reserve the right to modify membership benefits or pricing with reasonable notice to existing members.
            </p>
          </div>

          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-dark mb-3">9. Intellectual Property</h2>
            <p>
              All content on this website — including text, images, logos, graphics, and design — is the property of Haven Medical and is protected by applicable intellectual property laws. You may not reproduce, distribute, or use any content without our written permission.
            </p>
          </div>

          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-dark mb-3">10. Website Use</h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Use our website for any unlawful purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with the proper functioning of the website</li>
              <li>Scrape, copy, or reproduce website content without permission</li>
            </ul>
          </div>

          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-dark mb-3">11. Limitation of Liability</h2>
            <p>
              Haven Medical shall not be liable for any indirect, incidental, or consequential damages arising from the use of our website or services, to the fullest extent permitted by Lebanese law. Our total liability shall not exceed the amount paid for the specific service in question.
            </p>
          </div>

          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-dark mb-3">12. Privacy</h2>
            <p>
              Your use of our website and services is also governed by our{" "}
              <Link href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>,
              which describes how we collect, use, and protect your personal information.
            </p>
          </div>

          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-dark mb-3">13. Governing Law</h2>
            <p>
              These Terms &amp; Conditions are governed by and construed in accordance with the laws of the Republic of Lebanon. Any disputes arising from these terms shall be subject to the exclusive jurisdiction of the courts of Beirut, Lebanon.
            </p>
          </div>

          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-dark mb-3">14. Changes to These Terms</h2>
            <p>
              We reserve the right to modify these Terms &amp; Conditions at any time. Changes will be effective immediately upon posting on this page. Continued use of our website or services after changes constitutes acceptance of the revised terms.
            </p>
          </div>

          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-dark mb-3">15. Contact Us</h2>
            <p>If you have questions about these Terms &amp; Conditions, please contact us:</p>
            <ul className="list-none space-y-1 mt-2">
              <li><strong>Email:</strong> <a href="mailto:havenmedicalcliniclb@gmail.com" className="text-primary hover:underline">havenmedicalcliniclb@gmail.com</a></li>
              <li><strong>Phone:</strong> <a href="tel:+96171888930" className="text-primary hover:underline">+961 71 888 930</a></li>
              <li><strong>Address:</strong> Beirut, Lebanon</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}
