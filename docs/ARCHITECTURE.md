# Architecture

## Tech Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | Next.js | 16.2.1 | App Router, SSG, Turbopack |
| UI Library | React | 19.2.4 | Component rendering |
| Language | TypeScript | 5.x | Type safety |
| Styling | Tailwind CSS | 4.x | Utility-first CSS |
| PostCSS | @tailwindcss/postcss | 4.x | CSS processing |
| Animations | GSAP | 3.14.2 | Scroll animations, timelines |
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
│   ├── og-image.jpg             # Open Graph image (1200×630)
│   ├── logo.png                 # PNG logo for schema.org
│   ├── icon-192.png             # PWA icon (192×192)
│   └── icon-512.png             # PWA icon (512×512)
├── scripts/                     # Shell scripts (see SCRIPTS.md)
├── src/
│   ├── app/                     # Next.js App Router pages
│   │   ├── admin/               # Admin dashboard (8 pages)
│   │   ├── about/
│   │   ├── appointment/
│   │   ├── blog/
│   │   │   └── [slug]/          # Dynamic blog posts
│   │   ├── contact/
│   │   ├── gift-voucher/
│   │   ├── membership/
│   │   ├── services/
│   │   │   └── [slug]/          # Dynamic service pages
│   │   ├── globals.css          # Design system & theme
│   │   ├── home-client.tsx      # Animated homepage (client)
│   │   ├── layout.tsx           # Root layout + metadata
│   │   ├── manifest.ts          # PWA manifest
│   │   ├── page.tsx             # Homepage (server wrapper)
│   │   ├── robots.ts            # robots.txt generator
│   │   ├── sitemap.ts           # sitemap.xml generator
│   │   └── not-found.tsx        # 404 page
│   ├── components/              # Shared UI components
│   │   ├── Header.tsx           # Navigation + mega menu
│   │   ├── Footer.tsx           # Footer + newsletter
│   │   ├── Logo.tsx             # SVG logo component
│   │   ├── NewsletterSignup.tsx # Email signup form
│   │   ├── ScrollProgress.tsx   # Scroll progress bar
│   │   ├── ScrollReveal.tsx     # IntersectionObserver wrapper
│   │   ├── SkipToMain.tsx       # Skip-to-content link
│   │   └── WhatsAppFAB.tsx      # WhatsApp floating button
│   ├── data/                    # Static data & mock content
│   │   ├── admin.ts             # Admin types + mock data
│   │   ├── blog.ts              # Blog posts + categories
│   │   ├── clinic.ts            # Doctors, testimonials, info
│   │   └── services.ts          # 20 services + helpers
│   └── lib/                     # Utilities & libraries
│       ├── animations.ts        # GSAP hooks (7 hooks)
│       ├── schema.ts            # JSON-LD structured data
│       └── whatsapp.ts          # WhatsApp URL helpers
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
└── Haven Logo.svg               # Source logo file
```

---

## Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                    Static Data Layer                     │
│                                                         │
│  src/data/services.ts  →  20 services with full detail  │
│  src/data/blog.ts      →  6 blog posts + 8 categories   │
│  src/data/clinic.ts    →  4 doctors, 5 testimonials     │
│  src/data/admin.ts     →  Mock admin data (dashboard)   │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│                   Next.js App Router                     │
│                                                         │
│  Static Generation (SSG)                                │
│  ├── generateStaticParams() for /services/[slug]        │
│  ├── generateStaticParams() for /blog/[slug]            │
│  └── All other pages pre-rendered at build time         │
│                                                         │
│  Metadata API                                           │
│  ├── Root metadata in layout.tsx (OG, Twitter, robots)  │
│  ├── Per-page metadata via generateMetadata()           │
│  └── JSON-LD schemas injected via <script> tags         │
└──────────────────┬──────────────────────────────────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────────┐
│                   Client-Side Layer                      │
│                                                         │
│  Animations  →  GSAP + ScrollTrigger (dynamic import)   │
│  Auth        →  sessionStorage (admin login gate)       │
│  Newsletter  →  Simulated API (client-side state)       │
│  WhatsApp    →  External wa.me links                    │
└─────────────────────────────────────────────────────────┘
```

---

## Rendering Strategy

| Route Pattern | Strategy | Notes |
|--------------|----------|-------|
| `/` | SSG (Static) | Server wrapper + client component for GSAP |
| `/about` | SSG | Fully static |
| `/services` | SSG | Static listing page |
| `/services/[slug]` | SSG + `generateStaticParams` | 20 static service pages |
| `/blog` | SSG | Static listing page |
| `/blog/[slug]` | SSG + `generateStaticParams` | 6 static blog post pages |
| `/admin/*` | SSG | Client-side auth gate (sessionStorage) |
| `/sitemap.xml` | SSG | Auto-generated at build |
| `/robots.txt` | SSG | Auto-generated at build |
| `/manifest.webmanifest` | SSG | PWA manifest |

---

## Key Conventions

1. **Server Components by default** — Only marked `"use client"` when interactivity is needed
2. **Dynamic imports** — GSAP ScrollTrigger loaded via `import()` to reduce bundle size
3. **`prefers-reduced-motion`** — All animations respect this media query
4. **Semantic HTML** — `<article>`, `<nav>`, `<address>`, `<blockquote>`, proper heading hierarchy
5. **Data files** — All content lives in `src/data/` as TypeScript with full interfaces
6. **Tailwind 4** — Uses `@theme inline` block in globals.css for custom properties
