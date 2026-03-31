# Animations

All animations are powered by **GSAP 3.14.2** with **ScrollTrigger** (loaded dynamically). The animation system lives in `src/lib/animations.ts` and is consumed via custom React hooks.

---

## Architecture

```
src/lib/animations.ts          ← 7 reusable hooks
src/app/home-client.tsx        ← Homepage GSAP timeline
src/app/globals.css            ← CSS keyframe animations
src/components/ScrollReveal.tsx ← IntersectionObserver fallback
```

### Key Design Decisions

1. **Dynamic import** — ScrollTrigger is loaded via `import("gsap/ScrollTrigger")` only on the client to reduce initial bundle
2. **Reduced motion** — Every hook checks `prefers-reduced-motion: reduce` and returns early
3. **Server/Client split** — Homepage uses `"use client"` for GSAP; server wrapper handles metadata
4. **Cleanup** — All hooks return cleanup functions to kill GSAP instances on unmount

---

## Hooks Reference

### `useMagnetic(strength?)`

Magnetic hover effect — element subtly follows the cursor.

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `strength` | `number` | `0.3` | Pull strength (0-1) |

**Returns:** `ref` to attach to the target element

```tsx
const ref = useMagnetic(0.3);
<button ref={ref}>Hover me</button>
```

---

### `useParallax(speed?)`

Scroll-based parallax movement.

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `speed` | `number` | `0.5` | Parallax speed multiplier |

**Returns:** `ref` to attach to the target element

```tsx
const ref = useParallax(0.3);
<div ref={ref}>I move slower on scroll</div>
```

---

### `useTextReveal()`

Character-by-character text reveal on scroll.

**Returns:** `ref` to attach to the text element

```tsx
const ref = useTextReveal();
<h2 ref={ref}>This text reveals character by character</h2>
```

---

### `useStaggerReveal(stagger?)`

Staggered children reveal on scroll — each child animates in sequence.

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `stagger` | `number` | `0.1` | Delay between children |

**Returns:** `ref` to attach to the parent element

```tsx
const ref = useStaggerReveal(0.15);
<div ref={ref}>
  <div>Card 1</div>  <!-- animates first -->
  <div>Card 2</div>  <!-- animates 0.15s later -->
  <div>Card 3</div>  <!-- animates 0.3s later -->
</div>
```

---

### `useScrollReveal(direction?)`

Directional reveal on scroll (up, down, left, right).

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `direction` | `"up" \| "down" \| "left" \| "right"` | `"up"` | Reveal direction |

**Returns:** `ref` to attach to the target element

```tsx
const ref = useScrollReveal("left");
<section ref={ref}>Slides in from left on scroll</section>
```

---

### `useCountUp(target, duration?)`

Animated number counter that triggers on scroll.

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `target` | `number` | — | Final number to count to |
| `duration` | `number` | `2` | Animation duration in seconds |

**Returns:** `ref` to attach to the number display element

```tsx
const ref = useCountUp(500, 2.5);
<span ref={ref}>0</span> <!-- animates 0 → 500 -->
```

---

### `useScrollProgress()`

Tracks page scroll progress (0-100%) and updates a bar width.

**Returns:** `ref` to attach to the progress bar element

```tsx
const barRef = useScrollProgress();
<div ref={barRef} style={{ width: "0%" }} />
```

Used by `src/components/ScrollProgress.tsx`.

---

## Homepage Animation Timeline

The homepage (`src/app/home-client.tsx`) uses a custom GSAP timeline:

### Hero Sequence

```
t=0.0s  → Subtitle fades in + slides up
t=0.2s  → Main title fades in + slides up
t=0.4s  → Description fades in + slides up
t=0.6s  → CTA buttons fade in + slides up
t=0.8s  → Hero image fades in + scales from 0.95
t=1.0s  → Floating cards stagger in
```

### Scroll-Triggered Sections

Each section uses `useScrollReveal()` or `useStaggerReveal()`:

| Section | Animation |
|---------|-----------|
| Stats bar | `useCountUp()` for each number |
| Services grid | `useStaggerReveal(0.1)` — cards appear sequentially |
| About section | `useScrollReveal("up")` |
| Testimonials | `useStaggerReveal(0.15)` |
| Gift voucher CTA | `useScrollReveal("up")` |
| Blog preview | `useStaggerReveal(0.1)` |
| Contact section | `useScrollReveal("up")` |

### Floating Elements

- **Scroll indicator** — Gentle bobbing animation (`gentleBob` keyframe)
- **Floating cards** — CSS `float` animation (6s infinite)

---

## CSS Animations

Defined in `src/app/globals.css`:

| Animation | Effect | Duration | CSS Class |
|-----------|--------|----------|-----------|
| `fadeInUp` | Opacity 0→1, translateY 20→0 | 0.6s | `animate-[fadeInUp_0.6s]` |
| `fadeIn` | Opacity 0→1 | 0.5s | `animate-[fadeIn_0.5s]` |
| `slideInLeft` | Opacity + translateX -30→0 | 0.6s | — |
| `slideInRight` | Opacity + translateX 30→0 | 0.6s | — |
| `scaleIn` | Opacity + scale 0.9→1 | 0.4s | — |
| `shimmer` | Background position sweep | 2s ∞ | `.shimmer` |
| `float` | translateY 0→-10→0 | 6s ∞ | `animate-[float_6s]` |
| `pulse-ring` | Scale 1→1.5, opacity 1→0 | 2s ∞ | `.whatsapp-pulse::after` |
| `gentleBob` | translateY 0→-6→0 | 3s ∞ | `animate-[gentleBob_3s]` |

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

2. **GSAP level:**
   ```typescript
   if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
   ```

3. **ScrollReveal component:** Shows content immediately without transition
