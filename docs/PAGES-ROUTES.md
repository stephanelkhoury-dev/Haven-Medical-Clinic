# Pages & Routes

The website has **45 statically generated pages** across public-facing and admin sections.

---

## Route Map

```
/                          → Homepage (animated, GSAP)
/about                     → About Us
/services                  → Service listing (4 categories)
/services/[slug]           → Individual service page (×20)
/blog                      → Blog listing
/blog/[slug]               → Blog post page (×6)
/gift-voucher              → Gift voucher page
/membership                → Membership plans (3 tiers)
/appointment               → Book appointment (WhatsApp CTA)
/contact                   → Contact page (map, form)
/admin                     → Admin dashboard
/admin/appointments        → Manage appointments
/admin/newsletter          → Newsletter campaigns
/admin/subscribers         → Subscriber management
/admin/subscriptions       → Subscription plans & members
/admin/services            → Service management
/admin/blog                → Blog management
/admin/settings            → Settings (5 tabs)
/sitemap.xml               → Auto-generated sitemap
/robots.txt                → Auto-generated robots
/manifest.webmanifest      → PWA manifest
```

---

## Public Pages

### Homepage `/`

**Files:** `src/app/page.tsx` (server) + `src/app/home-client.tsx` (client)

The homepage is split into a server component (metadata, JSON-LD) and a client component (GSAP animations).

**Sections:**
1. **Hero** — Animated headline, subtitle, CTA buttons, floating cards
2. **Stats Bar** — Animated counters (10+ years, 500+ patients, 17 treatments, 4 doctors)
3. **Featured Services** — 6 service cards from data
4. **About Preview** — Brief about section with USP grid
5. **Testimonials** — Client reviews
6. **Gift Voucher CTA** — Promotional banner
7. **Blog Preview** — Latest 3 blog posts
8. **CTA / Contact Section** — WhatsApp button + mini map

**SEO:** Organization schema (JSON-LD), FAQ schema, BreadcrumbList

---

### About `/about`

**File:** `src/app/about/page.tsx`

Full about page with clinic story, mission, values, doctor profiles grid.

**Data sources:** `doctors[]` and `clinicInfo` from `src/data/clinic.ts`

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
| Gift Voucher | `src/app/gift-voucher/page.tsx` | Gift voucher promotion with WhatsApp CTA |
| Membership | `src/app/membership/page.tsx` | 3 subscription plans (Essential, Premium, Elite) |
| Appointment | `src/app/appointment/page.tsx` | Booking page with WhatsApp integration |
| Contact | `src/app/contact/page.tsx` | Contact info, hours, map placeholder, form |
| 404 | `src/app/not-found.tsx` | Custom 404 with animated design |

---

## Data Layer

### Service Interface

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

**Helper functions:**
- `getServiceBySlug(slug)` — Find service by URL slug
- `getServicesByCategory(category)` — Filter by category
- `getRelatedServices(slugs)` — Get array of related services

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

### Clinic Data

```typescript
// src/data/clinic.ts exports:
doctors: Doctor[]           // 4 doctors with name, title, specialty, image, bio
testimonials: Testimonial[] // 5 client reviews, all 5-star
clinicInfo: {               // Contact details, hours, social links
  name, tagline, phone, whatsapp, email,
  address, mapUrl, hours, social
}
```

### Doctor Profiles

| Name | Title | Specialty |
|------|-------|-----------|
| Dr. Georges Khoury | Medical Director | Plastic & Reconstructive Surgery |
| Dr. Layla Haddad | Dermatologist | Dermatology & Aesthetic Medicine |
| Dr. Marc Antoine | Aesthetic Physician | Injectable Treatments & Facial Aesthetics |
| Dr. Nadia Farhat | Nutritionist | Clinical Nutrition & Dietetics |
