# Deployment

---

## Live URLs

| Environment | URL |
|-------------|-----|
| **Production** | https://haven-medical-clinic.vercel.app |
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

No environment variables are currently required. The site is fully static with mock data.

For future backend integration, you may need:

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SITE_URL` | Production URL for metadata |
| `DATABASE_URL` | Database connection (if adding backend) |
| `SMTP_HOST` / `SMTP_USER` / `SMTP_PASS` | Newsletter email sending |
| `WHATSAPP_NUMBER` | WhatsApp business number |

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

To enable automatic deployments on every push:

1. Go to Vercel Dashboard → Project Settings → Git
2. Connect Git Repository: `stephanelkhoury-dev/Haven-Medical-Clinic`
3. Set production branch to `main`
4. Every push to `main` will auto-deploy

> **Note:** If the GitHub integration fails to connect, use `npx vercel --prod` after each push.

---

## Build Output

The production build generates **45 static pages**:

```
Route (app)
├ ○ /                        (Static)
├ ○ /about                   (Static)
├ ○ /admin                   (Static)
├ ○ /admin/appointments      (Static)
├ ○ /admin/blog              (Static)
├ ○ /admin/newsletter        (Static)
├ ○ /admin/services          (Static)
├ ○ /admin/settings          (Static)
├ ○ /admin/subscribers       (Static)
├ ○ /admin/subscriptions     (Static)
├ ○ /appointment             (Static)
├ ○ /blog                    (Static)
├ ● /blog/[slug]             (SSG × 6)
├ ○ /contact                 (Static)
├ ○ /gift-voucher            (Static)
├ ○ /manifest.webmanifest    (Static)
├ ○ /membership              (Static)
├ ○ /robots.txt              (Static)
├ ○ /services                (Static)
├ ● /services/[slug]         (SSG × 17)
└ ○ /sitemap.xml             (Static)
```

---

## Custom Domain

To add a custom domain (e.g., `www.havenmedical.com`):

1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add your domain
3. Configure DNS records as instructed by Vercel:
   - A record: `76.76.21.21`
   - CNAME for www: `cname.vercel-dns.com`
4. Update `metadataBase` in `src/app/layout.tsx` to match the new domain
5. Update `BASE` in `src/lib/schema.ts`
6. Update sitemap host in `src/app/sitemap.ts`
7. Rebuild and deploy

---

## Performance Optimizations

| Optimization | Implementation |
|-------------|---------------|
| Static Generation | All 45 pages pre-rendered at build time |
| Font preloading | Inter + Playfair loaded with `preload: true`, `display: "swap"` |
| Dynamic imports | GSAP ScrollTrigger loaded via `import()` on client only |
| Image optimization | Next.js `<Image>` not used (placeholder SVGs); use `next/image` for production |
| CSS purging | Tailwind 4 automatically tree-shakes unused styles |
| Bundle splitting | Next.js automatic code splitting per route |

---

## Pre-Production Checklist

- [ ] Replace placeholder images with real photos
- [ ] Update `clinicInfo` in `src/data/clinic.ts` with real phone, email, address
- [ ] Update WhatsApp number in `src/data/clinic.ts`
- [ ] Update social media URLs
- [ ] Set `metadataBase` to production domain
- [ ] Create real OG image (1200×630)
- [ ] Create real PWA icons (192×192, 512×512)
- [ ] Add real blog post content (currently using excerpts)
- [ ] Connect backend API for admin features (replace mock data)
- [ ] Set up SMTP for newsletter sending
- [ ] Add Google Analytics / tracking
- [ ] Configure custom domain on Vercel
- [ ] Change admin password from `Haven2024!`
- [ ] Test on real mobile devices
- [ ] Run Lighthouse audit
