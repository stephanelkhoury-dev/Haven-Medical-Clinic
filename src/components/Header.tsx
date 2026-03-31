"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Phone, ChevronDown } from "lucide-react";
import { clinicInfo } from "@/data/clinic";
import Logo from "@/components/Logo";

const navigation = [
  { label: "Home", href: "/" },
  { label: "About Us", href: "/about" },
  {
    label: "Services",
    href: "/services",
    children: [
      {
        group: "Aesthetic Treatments",
        items: [
          { label: "Laser Hair Removal", href: "/services/laser-hair-removal" },
          { label: "Botox & Fillers", href: "/services/botox-fillers" },
          { label: "Skin Boosters", href: "/services/skin-boosters" },
          { label: "Facial Treatments", href: "/services/facial-treatments" },
        ],
      },
      {
        group: "Surgical Procedures",
        items: [
          { label: "Rhinoplasty", href: "/services/rhinoplasty" },
          { label: "Blepharoplasty", href: "/services/blepharoplasty" },
          { label: "Face Lifting", href: "/services/face-lifting" },
          { label: "Lip Lift", href: "/services/lip-lift" },
          { label: "Otoplasty", href: "/services/otoplasty" },
        ],
      },
      {
        group: "Medical & Specialist Care",
        items: [
          { label: "ORL Consultations", href: "/services/orl-consultations" },
          { label: "Gyneco-Aesthetic", href: "/services/gyneco-aesthetic" },
          { label: "Psychosexology", href: "/services/psychosexology" },
          { label: "Physiotherapy", href: "/services/physiotherapy" },
          { label: "Nutritionist", href: "/services/nutritionist" },
        ],
      },
      {
        group: "Wellness & Body Care",
        items: [
          { label: "Lymphatic Drainage", href: "/services/lymphatic-drainage" },
          { label: "Deep Tissue Massage", href: "/services/deep-tissue-massage" },
          { label: "Medical Pedicure", href: "/services/medical-pedicure" },
        ],
      },
    ],
  },
  { label: "Gift Voucher", href: "/gift-voucher" },
  { label: "Membership", href: "/membership" },
  { label: "Blog", href: "/blog" },
  { label: "Appointment", href: "/appointment" },
  { label: "Contact", href: "/contact" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "glass border-b border-border-light shadow-sm"
          : "bg-transparent"
      }`}
    >
      {/* Top bar */}
      <div className="hidden lg:block border-b border-border-light/50">
        <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between text-xs text-dark-light">
          <span>{clinicInfo.hours.weekdays}</span>
          <div className="flex items-center gap-4">
            <a
              href={`tel:${clinicInfo.phone}`}
              className="flex items-center gap-1 hover:text-primary transition-colors"
            >
              <Phone className="w-3 h-3" />
              {clinicInfo.phone}
            </a>
            <a
              href={`mailto:${clinicInfo.email}`}
              className="hover:text-primary transition-colors"
            >
              {clinicInfo.email}
            </a>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between" aria-label="Main navigation">
        <Link href="/" className="flex items-center focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded-lg" aria-label="Haven Medical — go to homepage">
          <Logo className="h-12 w-auto" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navigation.map((item) =>
            item.children ? (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => setServicesOpen(true)}
                onMouseLeave={() => setServicesOpen(false)}
              >
                <Link
                  href={item.href}
                  className="flex items-center gap-1 text-sm font-medium text-dark-light hover:text-primary transition-colors"
                >
                  {item.label}
                  <ChevronDown className="w-3.5 h-3.5" />
                </Link>
                {servicesOpen && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 pt-4">
                    <div className="glass border border-border-light rounded-xl shadow-xl p-6 grid grid-cols-2 gap-6 min-w-[560px]">
                      {item.children.map((group) => (
                        <div key={group.group}>
                          <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">
                            {group.group}
                          </p>
                          <ul className="space-y-2">
                            {group.items.map((sub) => (
                              <li key={sub.href}>
                                <Link
                                  href={sub.href}
                                  className="text-sm text-dark-light hover:text-primary transition-colors"
                                  onClick={() => setServicesOpen(false)}
                                >
                                  {sub.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                      <div className="col-span-2 pt-4 border-t border-border-light">
                        <Link
                          href="/services"
                          className="text-sm font-medium text-primary hover:text-primary-dark transition-colors"
                          onClick={() => setServicesOpen(false)}
                        >
                          View All Services →
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-dark-light hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            )
          )}
        </div>

        {/* CTA */}
        <Link
          href="/appointment"
          className="hidden lg:inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-primary-dark transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
        >
          Book Appointment
        </Link>

        {/* Mobile toggle */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden p-2 text-dark focus-visible:ring-2 focus-visible:ring-accent rounded-lg"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={mobileOpen}
          aria-controls="mobile-nav"
        >
          {mobileOpen ? <X className="w-6 h-6" aria-hidden="true" /> : <Menu className="w-6 h-6" aria-hidden="true" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div id="mobile-nav" className="lg:hidden glass border-t border-border-light" role="navigation" aria-label="Mobile navigation">
          <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">
            {navigation.map((item) =>
              item.children ? (
                <div key={item.label}>
                  <button
                    onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                    className="flex items-center justify-between w-full text-base font-medium text-dark-light"
                  >
                    {item.label}
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        mobileServicesOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {mobileServicesOpen && (
                    <div className="mt-3 ml-4 space-y-4">
                      {item.children.map((group) => (
                        <div key={group.group}>
                          <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                            {group.group}
                          </p>
                          <ul className="space-y-2">
                            {group.items.map((sub) => (
                              <li key={sub.href}>
                                <Link
                                  href={sub.href}
                                  className="text-sm text-dark-light"
                                  onClick={() => setMobileOpen(false)}
                                >
                                  {sub.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  key={item.label}
                  href={item.href}
                  className="block text-base font-medium text-dark-light"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              )
            )}
            <Link
              href="/appointment"
              className="block w-full text-center bg-primary text-white px-5 py-3 rounded-full text-sm font-medium"
              onClick={() => setMobileOpen(false)}
            >
              Book Appointment
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
