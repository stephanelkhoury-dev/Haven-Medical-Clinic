# Animations

The animation system uses a **performance-first approach**: CSS animations + IntersectionObserver for all scroll reveals, with GSAP used only for the animated number counter. This ensures minimal JavaScript overhead and excellent Lighthouse scores.

---

## Architecture

```
src/app/home-client.tsx        ← CSS animations + IntersectionObserver hooks
                                 (useRevealOnScroll, useStaggerOnScroll)
                                 GSAP only for Counter component
src/app/globals.css            ← CSS keyframe animations + scroll-reveal classes
src/components/ScrollReveal.tsx ← IntersectionObserver wrapper for interior pages
src/lib/animations.ts          ← Legacy GSAP hooks (mostly unused, kept for reference)
```

### Key Design Decisions

1. **CSS-first approach** — All scroll reveals use CSS transitions triggered by IntersectionObserver, not GSAP
2. **GSAP deferred** — Loaded via `requestIdleCallback` only when Counter component is visible
3. **Reduced motion** — Every animation checks `prefers-reduced-motion: reduce` and disables
4. **Server/Client split** — Homepage uses `"use client"` for animations; server wrapper handles metadata
5. **No GSAP scroll hooks on homepage** — Replaced for better Lighthouse TBT/CLS scores

---

## Primary Animation System (CSS + IntersectionObserver)

### `useRevealOnScroll()` (Homepage inline hook)

IntersectionObserver-based reveal that adds/removes CSS classes.

**Behavior:**
1. Element starts with `scroll-reveal-hidden` class (opacity: 0, translateY: 20px)
2. When element enters viewport (10% threshold), class is replaced with `animate-fade-in-up`
3. CSS transition handles the animation (0.6s ease-out)
4. Respects `prefers-reduced-motion` — shows immediately

```tsx
const ref = useRevealOnScroll();
<section ref={ref}>Content fades in on scroll</section>
```

### `useStaggerOnScroll(staggerMs)` (Homepage inline hook)

Same as `useRevealOnScroll` but staggers children with `setTimeout`.

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `staggerMs` | `number` | `100` | Delay between children in ms |

```tsx
const ref = useStaggerOnScroll(150);
<div ref={ref}>
  <div>Card 1</div>  <!-- animates first -->
  <div>Card 2</div>  <!-- animates 150ms later -->
  <div>Card 3</div>  <!-- animates 300ms later -->
</div>
```

### `<ScrollReveal>` Component (Interior pages)

**File:** `src/components/ScrollReveal.tsx`

Reusable wrapper component for interior pages (about, services, blog, doctors).

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `ReactNode` | — | Content to reveal |
| `className` | `string` | `""` | Additional classes |
| `delay` | `number` | `0` | Delay in ms before reveal |

---

## GSAP (Counter Only)

GSAP is used **only** for the animated number counter on the homepage stats bar. It is loaded lazily to minimize performance impact.

### Loading Strategy

```typescript
// Deferred loading via requestIdleCallback
function loadGsapDeferred() {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => loadGsap());
  } else {
    setTimeout(() => loadGsap(), 200);
  }
}
```

### Counter Component

Animated number counter that counts from 0 to target on scroll.

```tsx
<Counter target={500} duration={2} suffix="+" />
// Animates: 0 → 500+ over 2 seconds when scrolled into view
```

Uses `gsap.to()` with `scrollTrigger` to animate a proxy object, updating the DOM on each frame.

---

## Legacy GSAP Hooks (src/lib/animations.ts)

These hooks exist in the codebase but are **not used on the homepage** (replaced with CSS + IntersectionObserver for performance). They remain available for potential use on other pages.

| Hook | Purpose | Status |
|------|---------|--------|
| `useMagnetic(strength)` | Magnetic hover effect | Available, not actively used |
| `useParallax(speed)` | Scroll parallax (uses RAF, not GSAP) | Available |
| `useTextReveal()` | Character-by-character text reveal | Available, not actively used |
| `useStaggerReveal(stagger)` | Staggered children reveal | **Replaced** by `useStaggerOnScroll` |
| `useScrollReveal(direction)` | Directional reveal on scroll | **Replaced** by `useRevealOnScroll` |

---

## Homepage Animation Timeline

### Hero Sequence (Pure CSS)

The hero uses CSS animation classes with stagger delays:

```
stagger-1  → Subtitle fades in + slides up (delay: 0.1s)
stagger-2  → Main title fades in + slides up (delay: 0.2s)
stagger-3  → Description fades in + slides up (delay: 0.3s)
stagger-4  → CTA buttons fade in + slides up (delay: 0.4s)
stagger-5  → Hero image fades in + scales in (delay: 0.5s)
stagger-6  → Floating cards appear (delay: 0.6s)
```

All use `animate-fade-in-up` CSS animation with `animation-delay` via stagger classes.

### Scroll-Triggered Sections

Each section uses `useRevealOnScroll()` or `useStaggerOnScroll()`:

| Section | Animation |
|---------|-----------|
| Stats bar | `Counter` component (GSAP — only GSAP usage) |
| Services grid | `useStaggerOnScroll(100)` — cards appear sequentially |
| About section | `useRevealOnScroll()` |
| Doctors | `useStaggerOnScroll(100)` |
| Testimonials | `useStaggerOnScroll(150)` |
| Gift voucher CTA | `useRevealOnScroll()` |
| Blog preview | `useStaggerOnScroll(100)` |
| Social feed | `useRevealOnScroll()` |
| Contact section | `useRevealOnScroll()` |

### Floating Elements

- **Scroll indicator** — CSS `gentleBob` animation (3s infinite)
- **Floating cards** — CSS `float` animation (6s infinite)

---

## CSS Animations

Defined in `src/app/globals.css`:

| Animation | Effect | Duration | CSS Class |
|-----------|--------|----------|-----------|
| `fadeInUp` | Opacity 0→1, translateY 20→0 | 0.6s | `animate-fade-in-up` |
| `fadeIn` | Opacity 0→1 | 0.5s | `animate-[fadeIn_0.5s]` |
| `slideInLeft` | Opacity + translateX -30→0 | 0.6s | — |
| `slideInRight` | Opacity + translateX 30→0 | 0.6s | — |
| `scaleIn` | Opacity + scale 0.9→1 | 0.4s | — |
| `shimmer` | Background position sweep | 2s ∞ | `.shimmer` |
| `float` | translateY 0→-10→0 | 6s ∞ | `animate-float` |
| `pulse-ring` | Scale 1→1.5, opacity 1→0 | 2s ∞ | `.whatsapp-pulse::after` |
| `gentleBob` | translateY 0→-6→0 | 3s ∞ | `animate-gentle-bob` |

### Scroll Reveal CSS Classes

| Class | Purpose |
|-------|---------|
| `.scroll-reveal-hidden` | Initial state: opacity 0, translateY 20px |
| `.animate-fade-in-up` | Reveal state: opacity 1, translateY 0, transition 0.6s |
| `.stagger-1` through `.stagger-6` | Animation delays (0.1s increments) |

---

## Reduced Motion Support

When `prefers-reduced-motion: reduce` is detected:

1. **CSS level:**
   ```css
   *, *::before, *::after {
     animation-duration: 0.01ms !important;
     transition-duration: 0.01ms !important;
     scroll-behavior: auto !important;
   }
   ```

2. **IntersectionObserver hooks:** Check `window.matchMedia` and show content immediately without animation

3. **GSAP Counter:** Checks reduced motion preference and shows final number immediately

4. **ScrollReveal component:** Shows content immediately without transition
