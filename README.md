# Haven Medical Clinic

> **Premium Medical & Aesthetic Clinic Website — Qornet Chehwan, Lebanon**  
> Built with Next.js 16 · Tailwind CSS 4 · Neon PostgreSQL · TypeScript

**Live:** https://haven-beautyclinic.com  
**Admin:** https://haven-beautyclinic.com/admin

---

## Quick Start

```bash
npm install
npm run dev          # Development server → http://localhost:3000
npm run build        # Production build
npm start            # Serve production build
```

Or use the setup script:

```bash
./scripts/setup.sh   # Install, generate placeholders, build
```

**Admin Dashboard:** `/admin` — Username: `admin` · Password: `Haven2024!`

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16.2.1 (App Router + Turbopack) |
| UI | React 19.2.4 + TypeScript 5 |
| Database | Neon PostgreSQL (serverless, 11 tables) |
| Styling | Tailwind CSS 4 with `@theme inline` custom properties |
| Animations | GSAP 3.14.2 (deferred) + CSS IntersectionObserver |
| Icons | lucide-react 1.7.0 (tree-shaken) |
| Hosting | Vercel (ISR, Edge CDN) |
| Domain | haven-beautyclinic.com |
| Image Storage | PostgreSQL BYTEA + `/api/images/[id]` (1yr cache) |

---

## Features

### Public Website
- **14 public pages** — Home, About, Services, Blog, Doctors, Contact, Appointment, Gift Voucher, Membership, Privacy Policy, Terms
- **17 dynamic service pages** — Each with procedure steps, FAQs, pricing, before/after, related services
- **6 blog posts** — Medical content with SEO-optimized metadata
- **Individual doctor profiles** — Gallery, education, certifications, social links
- **WhatsApp integration** — Floating button + pre-filled booking messages
- **Instagram feed** — Server-side proxy with 1hr cache
- **Newsletter signup** — 3 variants (default, footer, inline)
- **ISR caching** — All public pages cached with 60s revalidation

### Admin Dashboard
- **10 admin pages** — Dashboard, Appointments, Services, Doctors, Testimonials, Blog, Newsletter, Subscribers, Subscriptions, Settings
- **Full CMS** — Create, edit, delete all content from the database
- **Image upload** — JPEG/PNG/WebP/GIF up to 5MB, stored as BYTEA in PostgreSQL
- **Doctor profiles** — Tabbed editor (Basic Info, Biography, Credentials, Gallery, Social)
- **Newsletter campaigns** — Create, schedule, track open/click rates
- **5-tab settings** — General, Notifications, Appearance, Email, Data

### SEO & Performance
- **Lighthouse scores** — Performance 90+, Accessibility 100, Best Practices 96, SEO 100
- **8 JSON-LD schemas** — MedicalClinic, WebSite, BreadcrumbList, MedicalProcedure, FAQPage, MedicalWebPage, MedicalBusiness, ItemList
- **Structured data** — Open Graph, Twitter Cards, 30+ keywords
- **Auto-generated** — sitemap.xml, robots.txt, manifest.webmanifest, apple-icon, favicon
- **8 security headers** — CSP, HSTS, COOP, X-Frame-Options, X-Content-Type-Options

### Accessibility (WCAG 2.1)
- Skip-to-main navigation link
- ARIA landmarks and roles throughout
- Focus-visible ring on interactive elements
- Reduced motion support (`prefers-reduced-motion`)
- Semantic HTML5 with proper heading hierarchy
- Color contrast ≥ 4.5:1

---

## Database Schema

11 PostgreSQL tables managed via Neon serverless:

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `appointments` | Patient bookings | name, phone, service, date, time, status |
| `blog_posts` | Blog content | slug, title, content, category, image, author |
| `campaigns` | Email campaigns | subject, status, recipients, open_rate |
| `subscribers` | Newsletter subscribers | email, name, status, source |
| `subscription_plans` | Membership tiers | name, price, features (JSONB) |
| `member_subscriptions` | Active members | member info, plan, status, billing |
| `settings` | Clinic config | key-value pairs (JSONB) |
| `admin_services` | Service pages | slug, title, category, benefits/faqs (JSONB) |
| `media` | Image library | filename, url, category, file_data (BYTEA) |
| `doctors` | Team members | name, slug, education/certifications/gallery (JSONB) |
| `testimonials` | Patient reviews | name, treatment, text, rating |

Seed the database: `POST /api/admin/seed`

---

## API Reference

### Admin API — 22+ endpoints under `/api/admin/`

| Endpoint | Methods | Description |
|----------|---------|-------------|
| `/api/admin/appointments` | GET, POST | List & create appointments |
| `/api/admin/appointments/[id]` | PUT, DELETE | Update & delete appointment |
| `/api/admin/blog` | GET, POST | List & create blog posts |
| `/api/admin/blog/[slug]` | PUT, DELETE | Update & delete blog post |
| `/api/admin/campaigns` | GET, POST | List & create campaigns |
| `/api/admin/campaigns/[id]` | PUT, DELETE | Update & delete campaign |
| `/api/admin/doctors` | GET, POST | List & create doctors |
| `/api/admin/doctors/[id]` | PUT, DELETE | Update & delete doctor |
| `/api/admin/media` | GET, POST | List & create media entries |
| `/api/admin/media/[id]` | PUT, DELETE | Update & delete media |
| `/api/admin/members` | GET, POST | List & create members |
| `/api/admin/members/[id]` | PUT, DELETE | Update & delete member |
| `/api/admin/plans` | GET, POST | List & create subscription plans |
| `/api/admin/plans/[id]` | PUT, DELETE | Update & delete plan |
| `/api/admin/seed` | POST | Create tables & seed data |
| `/api/admin/services` | GET, POST | List & create services |
| `/api/admin/services/[slug]` | PUT, DELETE | Update & delete service |
| `/api/admin/settings` | GET, PUT | Get & update settings |
| `/api/admin/stats` | GET | Dashboard statistics |
| `/api/admin/subscribers` | GET, POST | List & create subscribers |
| `/api/admin/subscribers/[id]` | PUT, DELETE | Update & delete subscriber |
| `/api/admin/testimonials` | GET, POST | List & create testimonials |
| `/api/admin/testimonials/[id]` | PUT, DELETE | Update & delete testimonial |
| `/api/admin/upload` | POST | Upload image (max 5MB) |

### Public API

| Endpoint | Description |
|----------|-------------|
| `/api/images/[id]` | Serve uploaded images with 1yr cache |
| `/api/instagram` | Instagram feed proxy with 1hr cache |

---

## Project Structure

```
haven-medical/
├── docs/                    # Project documentation
├── public/images/           # Static images (services, blog, doctors)
├── scripts/                 # Shell scripts (dev, build, deploy, etc.)
├── src/
│   ├── app/
│   │   ├── layout.tsx       # Root layout (fonts, metadata, JSON-LD)
│   │   ├── globals.css      # Theme variables, animations, utilities
│   │   ├── page.tsx         # Homepage server component
│   │   ├── home-client.tsx  # Homepage client component (animations)
│   │   ├── about/           # About page
│   │   ├── admin/           # Admin dashboard (10 pages)
│   │   ├── api/             # API routes (22+ endpoints)
│   │   ├── appointment/     # Booking page
│   │   ├── blog/            # Blog listing + [slug] detail
│   │   ├── contact/         # Contact page
│   │   ├── doctors/         # Doctor profile pages [slug]
│   │   ├── gift-voucher/    # Gift voucher page
│   │   ├── membership/      # Membership tiers page
│   │   ├── privacy-policy/  # Privacy policy
│   │   ├── services/        # Services listing + [slug] detail
│   │   └── terms/           # Terms of service
│   ├── components/          # 10 reusable components
│   ├── data/                # Static data (services, blog, clinic info)
│   └── lib/                 # Utilities (db, schema, whatsapp, animations)
├── package.json
├── next.config.ts           # Headers, redirects, image optimization
├── tsconfig.json
└── eslint.config.mjs
```

---

## Documentation

Full documentation in the `docs/` folder:

| Document | Description |
|----------|-------------|
| [Architecture](docs/ARCHITECTURE.md) | Tech stack, project structure, data flow, rendering strategy |
| [Design System](docs/DESIGN-SYSTEM.md) | Colors, typography, CSS utilities, animations |
| [Components](docs/COMPONENTS.md) | All 10 React components with props and usage |
| [Pages & Routes](docs/PAGES-ROUTES.md) | Every page, route, dynamic segments |
| [Admin Dashboard](docs/ADMIN-DASHBOARD.md) | CMS features, auth, API reference |
| [Database & API](docs/DATABASE-API.md) | Full schema, all endpoints, data flow |
| [SEO & Accessibility](docs/SEO-ACCESSIBILITY.md) | Structured data, sitemap, WCAG compliance |
| [Animations](docs/ANIMATIONS.md) | GSAP hooks, CSS animations, scroll effects |
| [Scripts](docs/SCRIPTS.md) | All shell scripts and npm commands |
| [Deployment](docs/DEPLOYMENT.md) | Vercel deployment, environment variables |

---

## Scripts

```bash
./scripts/dev.sh [port]            # Start dev server (default: 3000)
./scripts/build.sh                 # Lint + build
./scripts/deploy.sh --prod         # Deploy to Vercel production
./scripts/push.sh "message"        # Git commit & push to main
./scripts/lint.sh [--fix]          # Type check + lint
./scripts/clean.sh [--all]         # Clean build artifacts
./scripts/generate-placeholders.sh # Create placeholder images
./scripts/setup.sh                 # Full project setup
./scripts/install.sh [--clean]     # Install dependencies
./scripts/start.sh [port]          # Serve production build
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | Neon PostgreSQL connection string |
| `INSTAGRAM_ACCESS_TOKEN` | No | Instagram Graph API token (for social feed) |

---

## License

Private project — Haven Medical Clinic, Qornet Chehwan, Lebanon.
