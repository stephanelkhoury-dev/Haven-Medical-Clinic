# Components

All shared components live in `src/components/`. There are **10 components** in total.

---

## Logo

**File:** `src/components/Logo.tsx`

The official Haven Medical logo rendered as an inline SVG. Supports dark and white variants.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `className` | `string` | `""` | Tailwind classes (primarily for sizing) |
| `white` | `boolean` | `false` | Render white variant (for dark backgrounds) |

### Usage

```tsx
import Logo from "@/components/Logo";

<Logo className="h-12 w-auto" />          // Default (dark text, teal accent)
<Logo className="h-12 w-auto" white />    // White variant for footer/dark bg
```

### Color Mapping

| Variant | Text | Accent | Subtext |
|---------|------|--------|---------|
| Default | `#3b3b3b` | `#1fbda6` | `#616161` |
| White | `#fff` | `#1fbda6` | `rgba(255,255,255,0.7)` |

---

## Header

**File:** `src/components/Header.tsx`  
**Type:** Client Component (`"use client"`)

Fixed top navigation with mega menu, mobile responsive, scroll-aware background.

### Features

- **Scroll detection** — Adds glass effect after 20px scroll
- **Mega menu** — 4-column dropdown for Services (hover on desktop)
- **Mobile menu** — Full-screen slide-down with accordion
- **Top bar** — Hours, phone, email (desktop only)
- **CTA Button** — "Book Appointment" link
- **Logo** — Uses `<Logo />` component

### Navigation Structure

```
Home | About Us | Services (mega menu) | Gift Voucher | Membership | Blog | Appointment | Contact
```

### Service Mega Menu Groups

| Group | Items |
|-------|-------|
| Aesthetic Treatments | Laser Hair Removal, Botox & Fillers, Skin Boosters, Facial Treatments |
| Surgical Procedures | Rhinoplasty, Blepharoplasty, Face Lifting, Lip Lift, Otoplasty |
| Medical & Specialist Care | ORL Consultations, Gyneco-Aesthetic, Psychosexology, Physiotherapy, Nutritionist |
| Wellness & Body Care | Lymphatic Drainage, Deep Tissue Massage, Medical Pedicure |

### Accessibility

- `aria-label="Main navigation"` on `<nav>`
- `aria-expanded` + `aria-controls` on mobile toggle
- `aria-label` on logo link
- `focus-visible` ring on all interactive elements

---

## Footer

**File:** `src/components/Footer.tsx`  
**Type:** Server Component

4-column grid layout with brand info, quick links, services, and contact details.

### Sections

1. **Brand** — Logo (white variant), tagline, Instagram + Facebook social icons
2. **Quick Links** — About, Gift Voucher, Membership, Blog, Appointment, Contact
3. **Services** — 6 featured service links
4. **Contact** — Address, phone, email, hours

### Additions

- **Newsletter signup** — Centered below the grid
- **WhatsApp button** — Green CTA button
- **Bottom bar** — Copyright + Privacy Policy / Terms links

---

## NewsletterSignup

**File:** `src/components/NewsletterSignup.tsx`  
**Type:** Client Component (`"use client"`)

Email signup form with simulated API submission.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `"default" \| "footer" \| "inline"` | `"default"` | Visual style variant |

### Variants

| Variant | Description |
|---------|-------------|
| `default` | Standard form with label |
| `footer` | Compact for dark footer background |
| `inline` | Single-line inline form |

### States

- **Idle** — Shows email input + submit button
- **Submitting** — Shows "Subscribing..." disabled state
- **Success** — Shows confirmation message

---

## ScrollProgress

**File:** `src/components/ScrollProgress.tsx`  
**Type:** Client Component (`"use client"`)

Fixed gradient bar at the top of the viewport showing page scroll progress.

### Implementation

- Uses `useScrollProgress()` hook from `src/lib/animations.ts`
- Gradient: `from-primary via-accent to-primary-light`
- Fixed position, z-index 60

### Accessibility

- `role="progressbar"`
- `aria-label="Page scroll progress"`
- `aria-valuemin={0}` / `aria-valuemax={100}`

---

## ScrollReveal

**File:** `src/components/ScrollReveal.tsx`  
**Type:** Client Component (`"use client"`)

IntersectionObserver-based scroll reveal wrapper. Used by some interior pages.

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | Content to reveal |
| `className` | `string` | `""` | Additional classes |
| `delay` | `number` | `0` | Delay in ms before reveal |

### Behavior

- Starts invisible (`opacity-0 translate-y-8`)
- Triggers when element enters viewport (10% threshold)
- Transitions to visible (`opacity-100 translate-y-0`)
- Respects `prefers-reduced-motion` (shows immediately)

---

## SkipToMain

**File:** `src/components/SkipToMain.tsx`  
**Type:** Server Component

Accessibility skip link for keyboard navigation. Hidden visually, appears on Tab focus.

### Behavior

- Links to `#main-content`
- Positioned absolutely, appears on `:focus`
- Styled with primary background + white text

---

## WhatsAppFAB

**File:** `src/components/WhatsAppFAB.tsx`  
**Type:** Server Component

Floating action button (bottom-right) linking to WhatsApp.

### Features

- Fixed position: `bottom-6 right-6`
- WhatsApp green (`#25D366`) background
- Pulse ring animation (CSS `whatsapp-pulse`)
- SVG WhatsApp icon (not lucide — custom SVG)
- `aria-label="Chat with Haven Medical on WhatsApp"`
- Opens `wa.me` link with pre-filled message

---

## LayoutShell

**File:** `src/components/LayoutShell.tsx`  
**Type:** Client Component (`"use client"`)

Conditional layout wrapper that routes between admin and public layouts based on the current path.

### Behavior

- Uses `usePathname()` from `next/navigation`
- **Admin routes** (`/admin/*`): Renders children only — no header, footer, or scroll progress
- **Public routes**: Renders full public layout:
  1. `<ScrollProgress />`
  2. `<Header />`
  3. `<main id="main-content">{children}</main>`
  4. `<Footer />`
  5. `<WhatsAppFAB />`

### Usage

```tsx
// In layout.tsx
<LayoutShell>{children}</LayoutShell>
```

---

## SocialFeed

**File:** `src/components/SocialFeed.tsx`  
**Type:** Client Component (`"use client"`)

Instagram grid + Facebook page embed, dynamically imported on the homepage with `ssr: false`.

### Sub-Components

| Component | Description |
|-----------|-------------|
| `InstagramGrid` | Fetches posts from `/api/instagram`, displays 6 posts in grid with hover overlays. Falls back to placeholder CTA. |
| `FacebookEmbed` | Embeds Facebook Page Plugin via iframe |

### Layout

- Instagram: 7/12 columns — 2×3 (mobile) / 3×3 (desktop) grid
- Facebook: 5/12 columns — iframe embed

### Features

- "Follow on Instagram" + "Follow on Facebook" CTA buttons
- Hover overlay on Instagram posts with like/comment counts
- Error fallback UI when API fails
