# Haven Medical

> **Premium Medical & Aesthetic Clinic Website**  
> Built with Next.js 16 · Tailwind CSS 4 · GSAP · TypeScript

**Live:** https://haven-medical-clinic.vercel.app

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

| | Technology |
|---|---|
| Framework | Next.js 16.2.1 (App Router + Turbopack) |
| UI | React 19.2.4 + TypeScript 5 |
| Styling | Tailwind CSS 4 |
| Animations | GSAP 3.14.2 + ScrollTrigger |
| Icons | lucide-react 1.7.0 |

---

## What's Included

- **45 statically generated pages** — Home, About, 20 Services, 6 Blog Posts, Contact, Appointment, Gift Voucher, Membership, 8 Admin pages, 404
- **Admin dashboard** — Appointments, newsletter, subscribers, subscriptions, services, blog, settings
- **GSAP animations** — Scroll-triggered reveals, animated counters, magnetic hover, parallax
- **Full SEO** — Sitemap, robots.txt, JSON-LD structured data, Open Graph, Twitter cards
- **WCAG accessibility** — Skip-to-main, ARIA landmarks, focus-visible, reduced motion support
- **PWA manifest** — Installable web app support
- **WhatsApp integration** — Floating button + booking CTAs

---

## Documentation

Full documentation in the `docs/` folder:

| Document | Description |
|----------|-------------|
| [Architecture](docs/ARCHITECTURE.md) | Project structure, tech stack, data flow |
| [Design System](docs/DESIGN-SYSTEM.md) | Colors, typography, spacing, CSS utilities |
| [Components](docs/COMPONENTS.md) | All React components with props and usage |
| [Pages & Routes](docs/PAGES-ROUTES.md) | Every page, route, and data source |
| [Admin Dashboard](docs/ADMIN-DASHBOARD.md) | Admin panel, auth, data types, pages |
| [SEO & Accessibility](docs/SEO-ACCESSIBILITY.md) | Structured data, sitemap, ARIA, a11y |
| [Animations](docs/ANIMATIONS.md) | GSAP hooks, scroll triggers, motion system |
| [Scripts](docs/SCRIPTS.md) | All shell scripts and npm commands |
| [Deployment](docs/DEPLOYMENT.md) | Vercel deployment, GitHub, CI/CD |

---

## Scripts

```bash
./scripts/dev.sh [port]            # Start dev server
./scripts/build.sh                 # Lint + build
./scripts/deploy.sh --prod         # Deploy to Vercel
./scripts/push.sh "message"        # Git commit & push
./scripts/lint.sh [--fix]          # Type check + lint
./scripts/clean.sh [--all]         # Clean build artifacts
./scripts/generate-placeholders.sh # Create placeholder images
```

---

## License

Private project — Haven Medical Clinic.
