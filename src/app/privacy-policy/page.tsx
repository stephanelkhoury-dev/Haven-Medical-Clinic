import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | Haven Medical",
  description: "Haven Medical privacy policy — how we collect, use, and protect your personal information.",
  alternates: { canonical: "https://www.haven-beautyclinic.com/privacy-policy" },
};

export default function PrivacyPolicyPage() {
  return (
    <>
      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-muted via-background to-muted-dark">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="font-[family-name:var(--font-heading)] text-4xl lg:text-5xl font-bold text-dark mb-4">
            Privacy Policy
          </h1>
          <p className="text-dark-light">Last updated: April 5, 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 bg-white">
        <div className="max-w-3xl mx-auto px-6 prose prose-lg text-dark-light leading-relaxed space-y-8">
          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-dark mb-3">1. Introduction</h2>
            <p>
              Haven Medical (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website at{" "}
              <Link href="/" className="text-primary hover:underline">haven-beautyclinic.com</Link>{" "}
              or visit our clinic in Beirut, Lebanon.
            </p>
          </div>

          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-dark mb-3">2. Information We Collect</h2>
            <h3 className="text-lg font-semibold text-dark mt-4 mb-2">Personal Information</h3>
            <p>When you book an appointment, subscribe to our newsletter, or contact us, we may collect:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Full name</li>
              <li>Email address</li>
              <li>Phone number</li>
              <li>Preferred treatment or service</li>
              <li>Any information you voluntarily provide in messages</li>
            </ul>
            <h3 className="text-lg font-semibold text-dark mt-4 mb-2">Medical Information</h3>
            <p>
              During consultations, we may collect medical history and health-related information necessary to provide safe and effective treatments. This information is handled with the highest level of confidentiality.
            </p>
            <h3 className="text-lg font-semibold text-dark mt-4 mb-2">Automatically Collected Information</h3>
            <p>When you visit our website, we may automatically collect:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Browser type and version</li>
              <li>Device type</li>
              <li>Pages visited and time spent</li>
              <li>Referring URL</li>
              <li>IP address (anonymized where possible)</li>
            </ul>
          </div>

          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-dark mb-3">3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Schedule and manage your appointments</li>
              <li>Provide and personalize our medical and aesthetic services</li>
              <li>Communicate with you about your treatments and bookings</li>
              <li>Send newsletters and promotional content (only with your consent)</li>
              <li>Improve our website and services</li>
              <li>Comply with legal obligations</li>
            </ul>
          </div>

          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-dark mb-3">4. Information Sharing</h2>
            <p>
              We do <strong>not</strong> sell, trade, or rent your personal information to third parties. We may share information only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li><strong>Service providers:</strong> Trusted third-party services that help us operate our website (e.g., hosting, email delivery), bound by confidentiality agreements</li>
              <li><strong>Legal requirements:</strong> When required by law, regulation, or legal process</li>
              <li><strong>Medical referrals:</strong> With other healthcare providers when medically necessary and with your consent</li>
            </ul>
          </div>

          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-dark mb-3">5. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encrypted connections (HTTPS), secure database storage, and restricted access to personal data.
            </p>
          </div>

          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-dark mb-3">6. Cookies</h2>
            <p>
              Our website may use essential cookies to ensure proper functionality. We do not use tracking cookies for advertising purposes. Any analytics data collected is anonymized and used solely to improve user experience.
            </p>
          </div>

          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-dark mb-3">7. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-6 space-y-1 mt-2">
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate information</li>
              <li>Request deletion of your personal data</li>
              <li>Withdraw consent for marketing communications at any time</li>
              <li>Request a copy of your data in a portable format</li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights, please contact us at{" "}
              <a href="mailto:havenmedicalcliniclb@gmail.com" className="text-primary hover:underline">havenmedicalcliniclb@gmail.com</a>.
            </p>
          </div>

          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-dark mb-3">8. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy, or as required by applicable law. Medical records are retained in accordance with Lebanese healthcare regulations.
            </p>
          </div>

          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-dark mb-3">9. Children&apos;s Privacy</h2>
            <p>
              Our services are not directed to individuals under the age of 18. We do not knowingly collect personal information from minors without parental consent. Treatments for minors require parental or guardian authorization.
            </p>
          </div>

          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-dark mb-3">10. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated &quot;Last updated&quot; date. We encourage you to review this policy periodically.
            </p>
          </div>

          <div>
            <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold text-dark mb-3">11. Contact Us</h2>
            <p>If you have questions about this Privacy Policy, please contact us:</p>
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
