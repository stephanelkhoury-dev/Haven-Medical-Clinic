# Deployment

---

## Live URLs

| Environment | URL |
|-------------|-----|
| **Production** | https://haven-beautyclinic.com |
| **Vercel** | https://haven-medical-clinic.vercel.app |
| **GitHub** | https://github.com/stephanelkhoury-dev/Haven-Medical-Clinic |
| **Vercel Dashboard** | https://vercel.com/stephanelkhourys-projects/haven-medical-clinic |

---

## Vercel

### Project Info

| Setting | Value |
|---------|-------|
| Project Name | `haven-medical-clinic` |
| Framework | Next.js (auto-detected) |
| Build Command | `next build` |
| Output Directory | `.next` |
| Node.js Version | 18.x (Vercel default) |
| Team/Scope | `stephanelkhourys-projects` |
| Custom Domain | `haven-beautyclinic.com` |

### Deploy Commands

```bash
# Preview deployment
npx vercel

# Production deployment
npx vercel --prod

# Or use the script
./scripts/deploy.sh --prod
```

### Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `DATABASE_URL` | **Yes** | Neon Postgres connection string |
| `NEXT_PUBLIC_SITE_URL` | No | Production URL for metadata (defaults to haven-beautyclinic.com) |

The `DATABASE_URL` must be set in both local `.env.local` and Vercel project settings.

---

## Database (Neon Postgres)

| Setting | Value |
|---------|-------|
| Provider | Neon (neon.tech) |
| Plan | Free tier |
| Database | `neondb` |
| Driver | `@neondatabase/serverless` |
| Connection | HTTP-based (serverless, no pooler needed) |
| Auto-suspend | After 5 minutes idle (free tier) |

### Database Seeding

To initialize or reset the database schema and seed data:

```bash
# POST request to seed endpoint
curl -X POST https://haven-beautyclinic.com/api/admin/seed
```

This creates all 11 tables and inserts default data. See [DATABASE-API.md](DATABASE-API.md) for full schema.

---

## GitHub

### Repository

| | |
|---|---|
| URL | https://github.com/stephanelkhoury-dev/Haven-Medical-Clinic |
| Visibility | Public |
| Branch | `main` |
| Email | stephanelkhoury2000@gmail.com |

### Push Workflow

```bash
# Quick push via script
./scripts/push.sh "Your commit message"

# Manual push
git add -A
git commit -m "Your message"
git push origin main
```

### Auto-Deploy

Vercel is configured to auto-deploy on every push to `main`:

1. Push to `main` branch
2. Vercel detects the push via GitHub integration
3. Builds the project (`next build`)
4. Deploys to production if on `main`

> **Fallback:** If auto-deploy fails, use `npx vercel --prod` manually.

---

## Rendering & Caching

### ISR Strategy

All public pages use **Incremental Static Regeneration** with a 60-second revalidation window:

```typescript
export const revalidate = 60; // Re-generate page every 60 seconds
```

This means:
- First request after 60s triggers a background regeneration
- Users always see cached content (never a loading state)
- Content updates appear within ~60 seconds of a DB change
- No full rebuild needed for content changes

### Image Caching

Images served from `/api/images/[id]` include aggressive caching:

```
Cache-Control: public, max-age=31536000, immutable
```

Static images in `/public/images/` also get 1-year cache via `next.config.ts` headers.

---

## Build Output

The production build generates ISR pages with serverless API functions:

```
Route (app)
├ ○ /                        (ISR: 60s)
├ ○ /about                   (ISR: 60s)
├ ○ /admin                   (Client-side)
├ ○ /admin/appointments      (Client-side)
├ ○ /admin/blog              (Client-side)
├ ○ /admin/doctors           (Client-side)
├ ○ /admin/newsletter        (Client-side)
├ ○ /admin/services          (Client-side)
├ ○ /admin/settings          (Client-side)
├ ○ /admin/subscribers       (Client-side)
├ ○ /admin/subscriptions     (Client-side)
├ ○ /admin/testimonials      (Client-side)
├ ○ /appointment             (ISR: 60s)
├ ○ /blog                    (ISR: 60s)
├ ● /blog/[slug]             (ISR: 60s, dynamic)
├ ○ /contact                 (ISR: 60s)
├ ● /doctors/[slug]          (ISR: 60s, dynamic)
├ ○ /gift-voucher            (Static)
├ ○ /manifest.webmanifest    (Static)
├ ○ /membership              (Static)
├ ○ /privacy-policy          (Static)
├ ○ /robots.txt              (Static)
├ ○ /services                (ISR: 60s)
├ ● /services/[slug]         (ISR: 60s, dynamic)
├ ○ /sitemap.xml             (Dynamic)
├ ○ /terms                   (Static)
├ ƒ /api/admin/*             (Serverless functions)
├ ƒ /api/images/[id]         (Serverless function)
└ ƒ /api/instagram           (Serverless function)
```

---

## Performance Optimizations

| Optimization | Implementation |
|-------------|---------------|
| ISR Caching | All public pages cached with 60s revalidation |
| Font preloading | Inter + Playfair loaded with `preload: true`, `display: "swap"` |
| GSAP deferred | Loaded via `requestIdleCallback`, only for Counter |
| CSS animations | Scroll reveals use CSS + IntersectionObserver (zero JS overhead) |
| Image optimization | Next.js `<Image>` with WebP/AVIF, `minimumCacheTTL: 31536000` |
| CSS purging | Tailwind 4 automatically tree-shakes unused styles |
| Bundle splitting | Next.js automatic code splitting per route |
| Package optimization | `optimizePackageImports: ["lucide-react"]` |
| Security headers | HSTS, CSP, X-Frame-Options, COOP, etc. |
| Image caching | 1-year cache on `/api/images/[id]` and `/public/images/` |

---

## Security Headers

All routes receive 8 security headers via `next.config.ts`. See [ARCHITECTURE.md](ARCHITECTURE.md) for the full list.
