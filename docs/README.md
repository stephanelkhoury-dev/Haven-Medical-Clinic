# Haven Medical — Documentation Index

> Premium Medical & Aesthetic Clinic Website  
> Built with Next.js 16 · React 19 · Neon Postgres · Tailwind CSS 4 · TypeScript

**Live:** https://haven-beautyclinic.com

---

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

**Admin Dashboard:** `/admin`  
**Credentials:** `admin` / `Haven2024!`

---

## Documentation

| Document | Description |
|----------|-------------|
| [Architecture](ARCHITECTURE.md) | Project structure, tech stack, data flow, rendering strategy |
| [Database & API](DATABASE-API.md) | All 11 DB tables, 22+ API endpoints, file uploads |
| [Design System](DESIGN-SYSTEM.md) | Colors, typography, spacing, CSS utilities |
| [Components](COMPONENTS.md) | All 10 React components with props and usage |
| [Pages & Routes](PAGES-ROUTES.md) | Every page, route, and data source |
| [Admin Dashboard](ADMIN-DASHBOARD.md) | Admin panel, auth, 10 pages, CRUD operations |
| [SEO & Accessibility](SEO-ACCESSIBILITY.md) | 10 schema generators, sitemap, ARIA, a11y |
| [Animations](ANIMATIONS.md) | CSS animations, IntersectionObserver, GSAP counter |
| [Scripts](SCRIPTS.md) | All shell scripts and npm commands |
| [Deployment](DEPLOYMENT.md) | Vercel deployment, Neon DB, custom domain |

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js (App Router + Turbopack) | 16.2.1 |
| UI | React | 19.2.4 |
| Language | TypeScript | 5.x |
| Database | Neon Postgres (serverless) | — |
| Styling | Tailwind CSS | 4.x |
| Animations | CSS + IntersectionObserver + GSAP (counter only) | 3.14.2 |
| Icons | lucide-react | 1.7.0 |
| Linting | ESLint | 9.x |

---

## Live URLs

| Environment | URL |
|-------------|-----|
| Production | https://haven-beautyclinic.com |
| Vercel | https://haven-medical-clinic.vercel.app |
| GitHub | https://github.com/stephanelkhoury-dev/Haven-Medical-Clinic |

---

## Project Stats

- **15 public pages** with ISR (revalidate every 60s)
- **11 admin pages** with session-based auth
- **22+ API endpoints** (REST, file upload, image serving)
- **11 database tables** (Neon Postgres)
- **10 reusable components**
- **10 JSON-LD schema generators**
- **10 shell scripts**
- **8 security headers** (CSP, HSTS, X-Frame-Options, etc.)
