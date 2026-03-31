# Design System

The design system is defined in `src/app/globals.css` using Tailwind CSS 4's `@theme inline` block. All colors, fonts, and utilities are available as Tailwind classes throughout the project.

---

## Color Palette

Derived from the **Haven Logo** (`Haven Logo.svg`):

| Token | Hex | Tailwind Class | Usage |
|-------|-----|---------------|-------|
| `primary` | `#1fbda6` | `text-primary`, `bg-primary` | Brand teal — buttons, links, accents |
| `primary-light` | `#3dd4bd` | `text-primary-light` | Hover states, gradients |
| `primary-dark` | `#179e8b` | `bg-primary-dark` | Active/pressed states |
| `secondary` | `#616161` | `text-secondary` | Supporting gray |
| `secondary-light` | `#8a8a8a` | `text-secondary-light` | Lighter supporting gray |
| `accent` | `#1fbda6` | `text-accent`, `bg-accent` | Same as primary (unified brand) |
| `accent-light` | `#66d4c3` | `text-accent-light` | Light accent variant |
| `background` | `#FAFBFA` | `bg-background` | Page backgrounds |
| `foreground` | `#3b3b3b` | `text-foreground` | Body text |
| `dark` | `#3b3b3b` | `text-dark`, `bg-dark` | Dark UI / footer |
| `dark-light` | `#616161` | `text-dark-light` | Muted body text |
| `muted` | `#F2F4F3` | `bg-muted` | Section backgrounds |
| `muted-dark` | `#E4E8E6` | `bg-muted-dark` | Darker section backgrounds |
| `white` | `#FFFFFF` | `text-white`, `bg-white` | White |
| `border` | `#D9E0DD` | `border-border` | Default borders |
| `border-light` | `#EDF0EE` | `border-border-light` | Subtle borders |

### Logo Color Origins

| Logo Element | Hex | Mapped To |
|-------------|-----|-----------|
| Teal wave accent | `#1fbda6` | `primary`, `accent` |
| Heading text | `#3b3b3b` | `dark`, `foreground` |
| Letter forms | `#616161` | `secondary`, `dark-light` |
| Background | `#fff` | `white` |

---

## Typography

### Fonts

| Role | Font | Weight | CSS Variable | Tailwind |
|------|------|--------|-------------|----------|
| Body | Inter | 400-700 | `--font-inter` | `font-sans` |
| Headings | Playfair Display | 400-900 | `--font-playfair` | `font-heading` |

Both loaded from Google Fonts with `display: "swap"` and `preload: true`.

### Heading Usage

```html
<!-- Use the heading font family -->
<h1 class="font-[family-name:var(--font-heading)]">Title</h1>

<!-- Body text uses Inter by default -->
<p>Body copy renders in Inter automatically.</p>
```

---

## CSS Utilities

Custom utility classes defined in `globals.css`:

### Cards & Surfaces

| Class | Description |
|-------|-------------|
| `.glass` | Frosted glass effect (`backdrop-blur`, semi-transparent bg) |
| `.card-hover` | Smooth elevation on hover (translateY + shadow) |
| `.shimmer` | Shimmer loading animation |

### Text Effects

| Class | Description |
|-------|-------------|
| `.gradient-text` | Gradient text using primary colors |
| `.section-divider` | Centered decorative divider line |
| `.img-reveal` | Clip-path reveal animation |

### Interactive

| Class | Description |
|-------|-------------|
| `.whatsapp-pulse` | Green pulse ring animation for WhatsApp FAB |

---

## Keyframe Animations

| Name | Effect | Duration |
|------|--------|----------|
| `fadeInUp` | Fade in + slide up 20px | 0.6s |
| `fadeIn` | Simple opacity fade | 0.5s |
| `slideInLeft` | Slide from left 30px | 0.6s |
| `slideInRight` | Slide from right 30px | 0.6s |
| `scaleIn` | Scale from 0.9 to 1 | 0.4s |
| `shimmer` | Shimmer sweep across element | 2s (infinite) |
| `float` | Gentle floating up/down | 6s (infinite) |
| `pulse-ring` | Expanding ring pulse | 2s (infinite) |
| `gentleBob` | Subtle bobbing motion | 3s (infinite) |

All animations are **disabled** when `prefers-reduced-motion: reduce` is active.

---

## Scrollbar

Custom scrollbar styling for WebKit browsers:

- **Track:** `--color-muted`
- **Thumb:** `--color-secondary` (hover: `--color-primary`)
- **Width:** 8px

---

## Selection

- **Background:** `--color-secondary`
- **Text:** `--color-dark`

---

## Focus Styles

```css
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
  border-radius: 4px;
}
```

Non-keyboard focus (`:focus:not(:focus-visible)`) has no visible outline.
