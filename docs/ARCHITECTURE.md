# Architecture

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | Next.js | 16.2.1 | App Router, ISR, Turbopack |
| UI Library | React | 19.2.4 | Component rendering |
| Language | TypeScript | 5.x | Type safety |
| Database | Neon Postgres | — | Serverless PostgreSQL (11 tables) |
| DB Driver | @neondatabase/serverless | 1.x | HTTP-based SQL client |
| Styling | Tailwind CSS | 4.x | Utility-first CSS |
| PostCSS | @tailwindcss/postcss | 4.x | CSS processing |
| Animations | CSS + IntersectionObserver | — | Scroll reveals, stagger effects |
| Counter Animation | GSAP | 3.14.2 | Animated number counters only |
| Icons | lucide-react | 1.7.0 | SVG icon components |
| Linting | ESLint + eslint-config-next | 9.x | Code quality |

---

## Project Structure

```
Haven Medical Clinic/
├── docs/                        # Documentation (you are here)
├── public/                      # Static assets
│   ├── images/
│   │   ├── blog/                # Blog featured images
│   │   ├── doctors/             # Doctor portrait photos
│   │   └── services/            # Service hero images
│   ├── og-image.webp            # Open Graph image (1200×630)
│   ├── logo.png                 # PNG logo for schema.org
│   ├── icon-192.png             # PWA icon (192×192)
│   └── icon-512.png             # PWA icon (512×512)
├── scripts/                     # Shell scripts (see SCRIPTS.md)
├── src/
│   ├── app/                     # Next.js App Router pages
│   │   ├── admin/               # Admin dashboard (10 pages)
│   │   │   ├── appointments/
│   │   │   ├── blog/
│   │   │   ├── doctors/
│   │   │   ├── newsletter/
│   │   │   ├── services/
│   │   │   ├── settings/
│   │   │   ├── subscribers/
│   │   │   ├── subscriptions/
│   │   │   └── testimonials/
│   │   ├── api/                 # 22+ REST API endpoints
│   │   │   ├── admin/           # CRUD APIs (doctors, blog, services, etc.)
│   │   │   ├── images/[id]/     # Image serving endpoint
│   │   │   └── instagram/       # Instagram feed proxy
│   │   ├── about/
│   │   ├── appointment/
│   │   ├── blog/
│   │   │   └── [slug]/          # Dynamic blog posts
│   │   ├── contact/
│   │   ├── doctors/
│   │   │   └── [slug]/          # Dynamic doctor profile pages
│   │   ├── gift-voucher/
│   │   ├── membership/
│   │   ├── privacy-policy/
│   │   ├── services/
│   │   │   └── [slug]/          # Dynamic service pages
│   │   ├── terms/
│   │   ├── globals.css          # Design system & theme
│   │   ├── home-client.tsx      # Animated homepage (client)
│   │   ├── layout.tsx           # Root layout + metadata
│   │   ├── manifest.ts          # PWA manifest
│   │   ├── page.tsx             # Homepage (server wrapper)
│   │   ├── robots.ts            # robots.txt generator
│   │   ├── sitemap.ts           # sitemap.xml generator (dynamic)
│   │   └── not-found.tsx        # 404 page
│   ├── components/              # Shared UI components (10)
│   │   ├── Header.tsx           # Navigation + mega menu
│   │   ├── Footer.tsx           # Footer + newsletter
│   │   ├── LayoutShell.tsx      # Admin vs public layout router
│   │   ├── Logo.tsx             # SVG logo component
│   │   ├── NewsletterSignup.tsx # Email signup form
│   │   ├── ScrollProgress.tsx   # Scroll progress bar
│   │   ├── ScrollReveal.tsx     # IntersectionObserver wrapper
│   │   ├── SkipToMain.tsx       # Skip-to-content link
│   │   ├── SocialFeed.tsx       # Instagram grid + Facebook embed
│   │   └── WhatsAppFAB.tsx      # WhatsApp floating button
│   ├── data/                    # Static data & type definitions
│   │   ├── admin.ts             # Admin types + mock dashboard data
│   │   ├── blog.ts              # Blog post type definitions
│   │   ├── clinic.ts            # Clinic info, testimonial types
│   │   └── services.ts          # Service data + helpers
│   └── lib/                     # Utilities & libraries
│       ├── animations.ts        # GSAP hooks (legacy, mostly unused)
│       ├── db.ts                # Neon Postgres connection
│       ├── schema.ts            # 10 JSON-LD schema generators
│       └── whatsapp.ts          # WhatsApp URL helpers
├── package.json
├── tsconfig.json
├── next.config.ts               # Security headers, redirects, CSP
├── postcss.config.mjs
└── eslint.config.mjs
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                   Neon Postgres Database                  │
│                                                         │
│  11 tables: doctors, blog_posts, admin_services,        │
│  appointments, subscribers, campaigns, testimonials,    │
│  media, settings, subscription_plans,                   │
│  member_subscriptions                                    │
│                                                         │
│  See DATABASE-API.md for full schema                    │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│                22+ REST API Endpoints                    │
│                                                         │
│  /api/admin/doctors     →  CRUD doctors                 │
│  /api/admin/blog        →  CRUD blog posts              │
│  /api/admin/services    →  CRUD services                │
│  /api/admin/upload      →  File upload (BYTEA)          │
│  /api/images/[id]       →  Image serving (1yr cache)    │
│  /api/admin/seed        →  DB seeding                   │
│  ... and more (see DATABASE-API.md)                     │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│                   Next.js App Router                     │
│                                                         │
│  ISR (Incremental Static Regeneration)                  │
│  ├── revalidate = 60 on all public dynamic pages        │
│  ├── /services/[slug]  — DB-driven service pages        │
│  ├── /blog/[slug]      — DB-driven blog posts           │
│  ├── /doctors/[slug]   — DB-driven doctor profiles      │
│  └── Sitemap auto-generates from DB                     │
│                                                         │
│  Static Data (src/data/)                                │
│  ├── services.ts  — 20 services with generateStaticParams │
│  ├── clinic.ts    — Clinic info, default testimonials   │
│  └── admin.ts     — Dashboard mock metrics              │
│                                                         │
│  Metadata API                                           │
│  ├── Root metadata in layout.tsx (OG, Twitter, robots)  │
│  ├── Per-page metadata via generateMetadata()           │
│  └── 10 JSON-LD schemas injected via <script> tags      │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│                   Client-Side Layer                      │
│                                                         │
│  Animations  →  CSS + IntersectionObserver (scroll)     │
│              →  GSAP only for Counter number animation  │
│  Auth        →  sessionStorage (admin login gate)       │
│  Newsletter  →  API-backed subscriber management       │
│  Instagram   →  /api/instagram feed proxy               │
│  WhatsApp    →  External wa.me links                    │
│  Images      →  Served from DB via /api/images/[id]     │
└─────────────────────────────────────────────────────────┘
```

---

## Rendering Strategy

| Route Pattern | Strategy | Notes |
|--------------|----------|-------|
| `/` | ISR (revalidate=60) | Server wrapper + client component |
| `/about` | ISR (revalidate=60) | Doctors loaded from DB |
| `/services` | ISR (revalidate=60) | Services from DB |
| `/services/[slug]` | ISR + `generateStaticParams` | DB-driven service pages |
| `/blog` | ISR (revalidate=60) | Blog posts from DB |
| `/blog/[slug]` | ISR (revalidate=60) | DB-driven blog posts |
| `/doctors/[slug]` | ISR (revalidate=60) | DB-driven doctor profiles |
| `/privacy-policy` | Static | Legal page |
| `/terms` | Static | Legal page |
| `/admin/*` | Client-side | Session auth gate |
| `/api/*` | Serverless functions | REST API endpoints |
| `/sitemap.xml` | Dynamic | Queries DB for slugs |
| `/robots.txt` | Static | Auto-generated |

---

## Security

### HTTP Headers (next.config.ts)

| Header | Value |
|--------|-------|
| `Strict-Transport-Security` | `max-age=63072000; includeSubDomains; preload` |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `SAMEORIGIN` |
| `X-DNS-Prefetch-Control` | `on` |
| `Referrer-Policy` | `origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=()` |
| `Cross-Origin-Opener-Policy` | `same-origin` |
| `Content-Security-Policy` | Full CSP with whitelisted sources |

### CSP Whitelisted Sources

- `'self'` — Site origin
- `fonts.googleapis.com` / `fonts.gstatic.com` — Google Fonts
- `*.facebook.com` / `*.fbcdn.net` — Facebook embed
- `*.cdninstagram.com` — Instagram images
- `*.youtube.com` / `*.ytimg.com` — YouTube embeds
- `*.google.com` / `*.gstatic.com` — Google services
- `*.googletagmanager.com` — GTM
- `*.neon.tech` — Database connections
- `wa.me` / `api.whatsapp.com` — WhatsApp

---

## Key Conventions

1. **Server Components by default** — Only marked `"use client"` when interactivity is needed
2. **ISR over SSG** — All public pages use `revalidate = 60` for fresh data without full rebuilds
3. **CSS animations first** — Scroll reveals use IntersectionObserver + CSS transitions; GSAP only for number counting
4. **GSAP deferred** — Loaded via `requestIdleCallback` to avoid blocking initial render
5. **`prefers-reduced-motion`** — All animations respect this media query
6. **Semantic HTML** — `<article>`, `<nav>`, `<address>`, `<blockquote>`, proper heading hierarchy
7. **Database-driven content** — Blog, services, doctors, testimonials all managed via admin CMS
8. **Image storage** — Uploaded images stored as BYTEA in PostgreSQL, served via `/api/images/[id]` with 1-year cache
9. **Tailwind 4** — Uses `@theme inline` block in globals.css for custom properties
10. **optimizePackageImports** — lucide-react tree-shaken at build time
