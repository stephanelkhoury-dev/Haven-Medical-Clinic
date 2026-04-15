"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Menu, X, Phone, ChevronDown, ChevronRight, Sparkles, Scissors, Stethoscope, Leaf, ArrowRight, User } from "lucide-react";
import { clinicInfo } from "@/data/clinic";
import Logo from "@/components/Logo";

const categoryIcons = {
  "Aesthetic Treatments": Sparkles,
  "Surgical Procedures": Scissors,
  "Medical & Specialist Care": Stethoscope,
  "Wellness & Body Care": Leaf,
};

const categoryDescriptions: Record<string, string> = {
  "Aesthetic Treatments": "Non-surgical beauty enhancements",
  "Surgical Procedures": "Expert surgical transformations",
  "Medical & Specialist Care": "Specialized medical consultations",
  "Wellness & Body Care": "Holistic body wellness",
};

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
          { label: "Laser Hair Removal", href: "/services/laser-hair-removal", desc: "Permanent hair reduction with advanced laser" },
          { label: "Botox & Fillers", href: "/services/botox-fillers", desc: "Smooth wrinkles & restore volume" },
          { label: "Skin Boosters", href: "/services/skin-boosters", desc: "Deep hydration & skin rejuvenation" },
          { label: "Facial Treatments", href: "/services/facial-treatments", desc: "Medical-grade facials for radiant skin" },
        ],
      },
      {
        group: "Surgical Procedures",
        items: [
          { label: "Rhinoplasty", href: "/services/rhinoplasty", desc: "Nose reshaping for harmony & function" },
          { label: "Blepharoplasty", href: "/services/blepharoplasty", desc: "Eyelid surgery for a refreshed look" },
          { label: "Face Lifting", href: "/services/face-lifting", desc: "Advanced facial rejuvenation" },
          { label: "Lip Lift", href: "/services/lip-lift", desc: "Enhanced lip definition & proportion" },
          { label: "Otoplasty", href: "/services/otoplasty", desc: "Ear reshaping & correction" },
        ],
      },
      {
        group: "Medical & Specialist Care",
        items: [
          { label: "ORL Consultations", href: "/services/orl-consultations", desc: "Ear, nose & throat specialist care" },
          { label: "Gyneco-Aesthetic", href: "/services/gyneco-aesthetic", desc: "Feminine wellness treatments" },
          { label: "Psychosexology", href: "/services/psychosexology", desc: "Intimate health & wellbeing" },
          { label: "Physiotherapy", href: "/services/physiotherapy", desc: "Physical rehabilitation & recovery" },
          { label: "Nutritionist", href: "/services/nutritionist", desc: "Personalized nutrition programs" },
        ],
      },
      {
        group: "Wellness & Body Care",
        items: [
          { label: "Lymphatic Drainage", href: "/services/lymphatic-drainage", desc: "Detox & post-surgery recovery" },
          { label: "Deep Tissue Massage", href: "/services/deep-tissue-massage", desc: "Therapeutic deep muscle relief" },
          { label: "Medical Pedicure", href: "/services/medical-pedicure", desc: "Clinical foot care & treatment" },
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
  const [activeGroup, setActiveGroup] = useState(0);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const openMega = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setServicesOpen(true);
  };
  const closeMega = () => {
    timerRef.current = setTimeout(() => setServicesOpen(false), 200);
  };
  const cancelClose = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const servicesNav = navigation.find(n => n.children);

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
                onMouseEnter={openMega}
                onMouseLeave={closeMega}
              >
                <Link
                  href={item.href}
                  className={`flex items-center gap-1 text-sm font-medium transition-colors ${
                    servicesOpen ? "text-primary" : "text-dark-light hover:text-primary"
                  }`}
                >
                  {item.label}
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${servicesOpen ? "rotate-180" : ""}`} />
                </Link>

                {/* ── MEGA MENU ── */}
                {servicesOpen && (
                  <div
                    className="absolute top-full left-1/2 -translate-x-1/2 pt-5"
                    onMouseEnter={cancelClose}
                    onMouseLeave={closeMega}
                  >
                    <div className="bg-white/95 backdrop-blur-xl border border-border-light rounded-2xl shadow-2xl shadow-dark/10 overflow-hidden animate-[fadeIn_0.2s_ease-out] min-w-[780px]">
                      <div className="flex">
                        {/* Left: Category sidebar */}
                        <div className="w-[240px] bg-gradient-to-b from-muted/80 to-muted/40 p-3 border-r border-border-light">
                          <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-dark-light/50 px-3 py-2">Categories</p>
                          {servicesNav?.children?.map((group, idx) => {
                            const Icon = categoryIcons[group.group as keyof typeof categoryIcons] || Sparkles;
                            return (
                              <button
                                key={group.group}
                                onMouseEnter={() => setActiveGroup(idx)}
                                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-left transition-all duration-200 ${
                                  activeGroup === idx
                                    ? "bg-white shadow-sm text-dark"
                                    : "text-dark-light hover:bg-white/60"
                                }`}
                              >
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-200 ${
                                  activeGroup === idx ? "bg-primary/10" : "bg-dark-light/5"
                                }`}>
                                  <Icon className={`w-[18px] h-[18px] transition-colors duration-200 ${
                                    activeGroup === idx ? "text-primary" : "text-dark-light/60"
                                  }`} />
                                </div>
                                <div className="min-w-0">
                                  <p className={`text-sm font-medium leading-tight truncate ${
                                    activeGroup === idx ? "text-dark" : "text-dark-light"
                                  }`}>{group.group.replace("& ", "& ")}</p>
                                  <p className="text-[10px] text-dark-light/50 leading-tight mt-0.5 truncate">{categoryDescriptions[group.group]}</p>
                                </div>
                                <ChevronRight className={`w-3.5 h-3.5 ml-auto shrink-0 transition-all duration-200 ${
                                  activeGroup === idx ? "text-primary opacity-100" : "opacity-0"
                                }`} />
                              </button>
                            );
                          })}
                        </div>

                        {/* Right: Service items */}
                        <div className="flex-1 p-5">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-primary">
                              {servicesNav?.children?.[activeGroup]?.group}
                            </h3>
                            <span className="text-[10px] text-dark-light/40">
                              {servicesNav?.children?.[activeGroup]?.items.length} services
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-1">
                            {servicesNav?.children?.[activeGroup]?.items.map((sub) => (
                              <Link
                                key={sub.href}
                                href={sub.href}
                                onClick={() => setServicesOpen(false)}
                                className="group/item flex items-start gap-3 p-3 rounded-xl hover:bg-primary/5 transition-all duration-200"
                              >
                                <div className="w-2 h-2 rounded-full bg-primary/30 mt-1.5 shrink-0 group-hover/item:bg-primary group-hover/item:scale-125 transition-all" />
                                <div>
                                  <p className="text-sm font-medium text-dark group-hover/item:text-primary transition-colors leading-tight">
                                    {sub.label}
                                  </p>
                                  {"desc" in sub && (
                                    <p className="text-[11px] text-dark-light/60 leading-tight mt-0.5">
                                      {(sub as { desc: string }).desc}
                                    </p>
                                  )}
                                </div>
                              </Link>
                            ))}
                          </div>

                          {/* Bottom CTA */}
                          <div className="mt-5 pt-4 border-t border-border-light flex items-center justify-between">
                            <Link
                              href="/services"
                              className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary-dark transition-colors group/all"
                              onClick={() => setServicesOpen(false)}
                            >
                              View All Services
                              <ArrowRight className="w-4 h-4 group-hover/all:translate-x-1 transition-transform" />
                            </Link>
                            <Link
                              href="/appointment"
                              className="text-xs font-medium px-4 py-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors"
                              onClick={() => setServicesOpen(false)}
                            >
                              Book Now
                            </Link>
                          </div>
                        </div>
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
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="/portal"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-dark-light hover:text-primary transition-colors"
          >
            <User className="w-4 h-4" />
            Sign In
          </Link>
          <Link
            href="/appointment"
            className="inline-flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-primary-dark transition-colors focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            Book Appointment
          </Link>
        </div>

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
                    <div className="mt-3 space-y-4">
                      {item.children.map((group) => {
                        const Icon = categoryIcons[group.group as keyof typeof categoryIcons] || Sparkles;
                        return (
                          <div key={group.group}>
                            <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-2 flex items-center gap-2 ml-1">
                              <Icon className="w-3.5 h-3.5" />
                              {group.group}
                            </p>
                            <ul className="space-y-1 ml-1">
                              {group.items.map((sub) => (
                                <li key={sub.href}>
                                  <Link
                                    href={sub.href}
                                    className="block py-1.5 pl-6 text-sm text-dark-light hover:text-primary transition-colors border-l-2 border-border-light hover:border-primary"
                                    onClick={() => setMobileOpen(false)}
                                  >
                                    {sub.label}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                      <Link
                        href="/services"
                        className="block ml-1 mt-2 text-sm font-medium text-primary"
                        onClick={() => setMobileOpen(false)}
                      >
                        View All Services →
                      </Link>
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
              href="/portal"
              className="flex items-center justify-center gap-2 w-full text-center border border-gray-200 text-dark px-5 py-3 rounded-full text-sm font-medium"
              onClick={() => setMobileOpen(false)}
            >
              <User className="w-4 h-4" />
              Patient Portal
            </Link>
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
