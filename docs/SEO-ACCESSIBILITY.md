# SEO & Accessibility

---

## SEO

### Metadata

Root metadata is defined in `src/app/layout.tsx` and inherited by all pages:

| Field | Value |
|-------|-------|
| `metadataBase` | `https://www.havenmedical.com` |
| `title.default` | Haven Medical \| Premium Medical & Aesthetic Clinic in Beirut |
| `title.template` | `%s \| Haven Medical` |
| `description` | Premium aesthetic treatments, surgical procedures, and wellness services |
| `keywords` | 10 keywords (medical clinic Beirut, aesthetic treatments, etc.) |
| `authors` | Haven Medical |
| `robots` | index, follow, max-image-preview: large |
| `formatDetection` | telephone: true, email: true, address: true |

### Open Graph

| Property | Value |
|----------|-------|
| `type` | website |
| `locale` | en_US |
| `siteName` | Haven Medical |
| `image` | `/og-image.jpg` (1200×630) |
| Image alt | Haven Medical Clinic — Premium medical and aesthetic clinic in Beirut |

### Twitter Card

| Property | Value |
|----------|-------|
| `card` | summary_large_image |
| `image` | `/og-image.jpg` |

### Canonical URLs

Every page sets `alternates.canonical` via the metadata API.

---

### Structured Data (JSON-LD)

**File:** `src/lib/schema.ts`

6 schema generators, injected as `<script type="application/ld+json">`:

| Function | Schema Type | Used On |
|----------|------------|---------|
| `getOrganizationSchema()` | `MedicalClinic` | Root layout (every page) |
| `getBreadcrumbSchema(items)` | `BreadcrumbList` | Homepage, service pages, blog pages |
| `getServiceSchema(service)` | `MedicalProcedure` | `/services/[slug]` |
| `getFAQSchema(faqs)` | `FAQPage` | Homepage, service pages |
| `getArticleSchema(post)` | `Article` | `/blog/[slug]` |

#### Organization Schema Details

```json
{
  "@type": "MedicalClinic",
  "name": "Haven Medical",
  "telephone": "+961 XX XXX XXX",
  "email": "info@havenmedical.com",
  "address": { "@type": "PostalAddress", "addressLocality": "Beirut", "addressCountry": "LB" },
  "openingHoursSpecification": [ "Mon-Fri 09:00-18:00", "Sat 09:00-14:00" ],
  "medicalSpecialty": ["Dermatology", "Plastic Surgery", "Otolaryngology", "Physical Therapy"],
  "priceRange": "$$$"
}
```

---

### Sitemap

**File:** `src/app/sitemap.ts`

Auto-generated `sitemap.xml` with all public URLs:

| URL Pattern | Count | Priority | Change Freq |
|------------|-------|----------|-------------|
| `/` | 1 | 1.0 | weekly |
| `/about`, `/services`, etc. | 7 | 0.8 | monthly |
| `/services/[slug]` | 17 | 0.7 | monthly |
| `/blog/[slug]` | 6 | 0.6 | monthly |

**Total:** ~34 URLs

---

### Robots.txt

**File:** `src/app/robots.ts`

```
User-Agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Sitemap: https://www.havenmedical.com/sitemap.xml
```

---

### PWA Manifest

**File:** `src/app/manifest.ts`

```json
{
  "name": "Haven Medical — Premium Medical & Aesthetic Clinic",
  "short_name": "Haven Medical",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#FAFBFA",
  "theme_color": "#1fbda6",
  "icons": [
    { "src": "/icon-192.png", "sizes": "192x192" },
    { "src": "/icon-512.png", "sizes": "512x512" }
  ]
}
```

---

## Accessibility (WCAG 2.1)

### Skip Navigation

**Component:** `src/components/SkipToMain.tsx`

- First focusable element in DOM
- Links to `#main-content`
- Visible only on keyboard focus

### Landmarks & ARIA

| Element | Attribute | Value |
|---------|----------|-------|
| `<header>` | implicit | banner |
| `<nav>` (desktop) | `aria-label` | Main navigation |
| `<nav>` (mobile) | `aria-label` | Mobile navigation |
| `<main>` | `id`, `role` | `main-content`, `main` |
| `<footer>` | `role`, `aria-label` | `contentinfo`, Site footer |
| All sections | `aria-label` or `aria-labelledby` | Descriptive labels |

### Interactive Elements

| Pattern | Implementation |
|---------|---------------|
| Mobile menu toggle | `aria-expanded`, `aria-controls="mobile-nav"` |
| Decorative icons | `aria-hidden="true"` |
| Logo links | `aria-label="Haven Medical — go to homepage"` |
| WhatsApp FAB | `aria-label="Chat with Haven Medical on WhatsApp"` |
| Scroll progress | `role="progressbar"`, `aria-valuemin`, `aria-valuemax` |

### Focus Management

```css
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: 4px;
}
```

All buttons and links have `focus-visible:ring-2 focus-visible:ring-accent` Tailwind classes.

### Reduced Motion

All animations are disabled when `prefers-reduced-motion: reduce`:

1. **CSS:** All `animation-duration` and `transition-duration` set to `0.01ms`
2. **GSAP hooks:** Check `window.matchMedia("(prefers-reduced-motion: reduce)")` and bail out
3. **Scroll behavior:** Falls back to `auto` from `smooth`

### Semantic HTML Elements Used

| Element | Usage |
|---------|-------|
| `<article>` | Blog posts, testimonial cards |
| `<blockquote>` | Testimonial text |
| `<address>` | Clinic contact information |
| `<nav>` | All navigation sections |
| `<section>` | Page sections with labels |
| `<time>` | Blog dates |

### Color Contrast

The teal primary (`#1fbda6`) on white background meets WCAG AA for large text. Body text uses `#3b3b3b` on `#FAFBFA` which passes AAA contrast ratio.
