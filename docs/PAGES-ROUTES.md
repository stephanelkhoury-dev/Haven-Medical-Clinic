# Pages & Routes

The website has **15 public pages**, **10 admin pages**, and **22+ API endpoints**, all powered by Neon Postgres with ISR caching.

---

## Route Map

```
Public Pages
/                          → Homepage (animated, ISR)
/about                     → About Us (ISR)
/services                  → Service listing (ISR)
/services/[slug]           → Individual service page (ISR, dynamic)
/blog                      → Blog listing (ISR)
/blog/[slug]               → Blog post page (ISR, dynamic)
/doctors/[slug]            → Doctor profile page (ISR, dynamic)
/gift-voucher              → Gift voucher page
/membership                → Membership plans (3 tiers)
/appointment               → Book appointment (WhatsApp CTA)
/contact                   → Contact page (map, form)
/privacy-policy            → Privacy Policy (static)
/terms                     → Terms & Conditions (static)
/not-found                 → Custom 404 page

Admin Pages
/admin                     → Admin dashboard
/admin/appointments        → Manage appointments
/admin/services            → Service CRUD
/admin/doctors             → Doctor CRUD (5-tab modal)
/admin/testimonials        → Testimonial management
/admin/blog                → Blog post CRUD
/admin/newsletter          → Newsletter campaigns
/admin/subscribers         → Subscriber management
/admin/subscriptions       → Subscription plans & members
/admin/settings            → Settings (5 tabs)

Auto-Generated
/sitemap.xml               → Dynamic sitemap (queries DB)
/robots.txt                → robots.txt
/manifest.webmanifest      → PWA manifest
```

---

## Public Pages

### Homepage `/`

**Files:** `src/app/page.tsx` (server) + `src/app/home-client.tsx` (client)

The homepage is split into a server component (metadata, JSON-LD, DB queries) and a client component (CSS animations + IntersectionObserver).

**Data sources:** Doctors, services, blog posts, and testimonials all loaded from Neon Postgres.

**Sections:**
1. **Hero** — CSS animated headline, subtitle, CTA buttons, floating cards
2. **Stats Bar** — GSAP-powered animated counters (10+ years, 500+ patients, 17 treatments, 4 doctors)
3. **Featured Services** — 6 service cards from DB
4. **About Preview** — Brief about section with USP grid
5. **Doctors** — Doctor cards linking to `/doctors/[slug]` profiles
6. **Testimonials** — Client reviews from DB
7. **Gift Voucher CTA** — Promotional banner
8. **Blog Preview** — Latest 3 blog posts from DB
9. **Social Feed** — Instagram grid + Facebook embed (dynamically imported, ssr: false)
10. **CTA / Contact Section** — WhatsApp button + mini map

**Animations:** Pure CSS (`animate-fade-in-up`, stagger classes) + IntersectionObserver hooks (`useRevealOnScroll`, `useStaggerOnScroll`). GSAP only for Counter component (deferred via `requestIdleCallback`).

**SEO:** Organization schema, WebSite schema, FAQ schema, BreadcrumbList

---

### About `/about`

**File:** `src/app/about/page.tsx`

Full about page with clinic story, mission, values, and doctor profiles grid. Doctor cards link to individual `/doctors/[slug]` profile pages.

**Data sources:** Doctors loaded from Neon Postgres with `slug` field for linking.

---

### Services Listing `/services`

**File:** `src/app/services/page.tsx`

Lists all 20 services organized by 4 categories. Each service shows icon, title, short description, and link.

**Categories:**
- Aesthetic Treatments (4 services)
- Surgical Procedures (5 services)
- Medical & Specialist Care (5 services)
- Wellness & Body Care (3 services)

---

### Service Detail `/services/[slug]`

**File:** `src/app/services/[slug]/page.tsx`

Dynamic page for each service. Uses `generateStaticParams()` to pre-render all 20 services.

**Sections:**
- Hero with service title + category
- Overview + "Who is it for?"
- Benefits list
- Procedure steps (numbered)
- Duration & recovery info
- FAQ accordion
- Related services grid

**SEO:** Service schema (MedicalProcedure JSON-LD), BreadcrumbList

#### All 20 Service Pages

| # | Slug | Title | Category |
|---|------|-------|----------|
| 1 | `laser-hair-removal` | Laser Hair Removal | Aesthetic |
| 2 | `botox-fillers` | Botox & Fillers | Aesthetic |
| 3 | `skin-boosters` | Skin Boosters | Aesthetic |
| 4 | `facial-treatments` | Facial Treatments | Aesthetic |
| 5 | `rhinoplasty` | Rhinoplasty | Surgical |
| 6 | `blepharoplasty` | Blepharoplasty | Surgical |
| 7 | `face-lifting` | Face Lifting | Surgical |
| 8 | `lip-lift` | Lip Lift | Surgical |
| 9 | `otoplasty` | Otoplasty | Surgical |
| 10 | `orl-consultations` | ORL Consultations | Medical |
| 11 | `gyneco-aesthetic` | Gyneco-Aesthetic | Medical |
| 12 | `psychosexology` | Psychosexology | Medical |
| 13 | `physiotherapy` | Physiotherapy | Medical |
| 14 | `nutritionist` | Nutritionist | Medical |
| 15 | `lymphatic-drainage` | Lymphatic Drainage | Wellness |
| 16 | `deep-tissue-massage` | Deep Tissue Massage | Wellness |
| 17 | `medical-pedicure` | Medical Pedicure | Wellness |

*Note: 3 additional services exist as navigation links in the header but route to the same set of data-backed pages.*

---

### Blog Listing `/blog`

**File:** `src/app/blog/page.tsx`

Grid of blog post cards with category filter, sorted by date.

**Categories:** Skin Care, Aesthetic Medicine, Wellness, Foot Care, Nutrition, Post-Treatment Care, Medical Advice, Clinic Updates

---

### Blog Post `/blog/[slug]`

**File:** `src/app/blog/[slug]/page.tsx`

Individual blog post with full content, author, date, read time, related posts.

**SEO:** Article schema (JSON-LD), BreadcrumbList

#### All 6 Blog Posts

| # | Slug | Title | Author | Category |
|---|------|-------|--------|----------|
| 1 | `ultimate-guide-laser-hair-removal` | The Ultimate Guide to Laser Hair Removal | Dr. Sarah Mitchell | Aesthetic Medicine |
| 2 | `skincare-routine-for-glowing-skin` | Build Your Perfect Medical-Grade Skincare Routine | Dr. Layla Haddad | Skin Care |
| 3 | `botox-myths-debunked` | 5 Common Botox Myths Debunked | Dr. Marc Antoine | Aesthetic Medicine |
| 4 | `importance-of-lymphatic-drainage` | Why Lymphatic Drainage Should Be Part of Your Wellness Routine | Marie Khalil | Wellness |
| 5 | `nutrition-for-healthy-skin` | Foods That Transform Your Skin | Dr. Nadia Farhat | Nutrition |
| 6 | `post-rhinoplasty-care-guide` | Essential Post-Rhinoplasty Care | Dr. Georges Khoury | Post-Treatment Care |

---

### Other Public Pages

| Page | File | Description |
|------|------|-------------|
| Doctor Profile | `src/app/doctors/[slug]/page.tsx` | Individual doctor page with bio, education, certifications, gallery, social links |
| Gift Voucher | `src/app/gift-voucher/page.tsx` | Gift voucher promotion with WhatsApp CTA |
| Membership | `src/app/membership/page.tsx` | 3 subscription plans (Essential, Premium, Elite) |
| Appointment | `src/app/appointment/page.tsx` | Booking page with WhatsApp integration |
| Contact | `src/app/contact/page.tsx` | Contact info, hours, map placeholder, form |
| Privacy Policy | `src/app/privacy-policy/page.tsx` | GDPR-compliant privacy policy |
| Terms | `src/app/terms/page.tsx` | Terms & conditions |
| 404 | `src/app/not-found.tsx` | Custom 404 with animated design |

---

### Doctor Profile `/doctors/[slug]`

**File:** `src/app/doctors/[slug]/page.tsx`

Individual doctor profile page with full professional details. Data loaded from Neon Postgres `doctors` table.

**Sections:**
1. **Hero** — Two-column: doctor photo (3:4 aspect) + info card (specialty, name, title, experience years, languages, short bio, social links, "Book Appointment" CTA)
2. **Full Biography** — Multi-paragraph rendering
3. **Education & Credentials** — Two-column grid with education cards (institution, degree, year) + certification cards
4. **Photo Gallery** — Responsive image grid from doctor's gallery
5. **CTA** — Gradient section with "Book Appointment" + "View All Specialists"

**SEO:** BreadcrumbList + Physician schema (name, jobTitle, medicalSpecialty, worksFor)

**Social Links:** Instagram, Facebook, LinkedIn with inline SVG icons (lucide-react doesn't have brand icons)

---

## Data Layer

### Service Data

Services are defined in `src/data/services.ts` with `generateStaticParams()` for static generation, and also managed dynamically from the `admin_services` DB table.

```typescript
interface Service {
  slug: string;
  title: string;
  shortDescription: string;
  category: "aesthetic" | "surgical" | "medical" | "wellness";
  icon: LucideIcon;
  heroImage: string;
  overview: string;
  whoIsItFor: string;
  benefits: string[];
  procedureSteps: string[];
  duration: string;
  recovery: string;
  expectedResults: string;
  faqs: { question: string; answer: string }[];
  relatedSlugs: string[];
  subServices?: { name: string; description: string }[];
}
```

### Blog Post Interface

```typescript
interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  image: string;
  author: string;
  date: string;
  readTime: string;
}
```

### Doctor Profile Interface (DB-driven)

```typescript
interface DoctorProfile {
  id: number;
  name: string;
  title: string;
  specialty: string;
  image: string;
  bio: string;
  slug: string;
  fullBio: string;
  education: { institution: string; degree: string; year: string }[];
  languages: string;
  experienceYears: number;
  certifications: { name: string; issuer: string; year: string }[];
  gallery: string[];
  socialLinks: {
    instagram?: string;
    facebook?: string;
    linkedin?: string;
  };
}
```

### Clinic Data

```typescript
// src/data/clinic.ts exports:
clinicInfo: {               // Contact details, hours, social links
  name, tagline, phone, whatsapp, email,
  address, mapUrl, hours, social
}
```

### Static Data Files

| File | Content |
|------|---------|
| `src/data/services.ts` | 20 services with full detail + helper functions |
| `src/data/blog.ts` | Blog post type definitions |
| `src/data/clinic.ts` | Clinic contact info, testimonial types |
| `src/data/admin.ts` | Admin types + mock dashboard metrics |
