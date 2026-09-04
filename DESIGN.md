---
name: HalalNeo
description: Halal trade intelligence for buyers and suppliers
colors:
  certified-green: 'oklch(0.45 0.14 155)'
  certified-green-dark: 'oklch(0.75 0.14 155)'
  warm-cream: 'oklch(0.975 0.008 85)'
  pure-white: 'oklch(1 0 0)'
  deep-navy: 'oklch(0.16 0.015 250)'
  washed-navy: 'oklch(0.19 0.018 250)'
  sage-mist: 'oklch(0.95 0.01 85)'
  sage-stone: 'oklch(0.50 0.02 55)'
  sage-border: 'oklch(0.94 0.006 85)'
  alert-red: 'oklch(0.58 0.24 27)'
  dark-mode-text: 'oklch(0.93 0.005 250)'
typography:
  display:
    fontFamily: 'Plus Jakarta Sans, Almarai, ui-sans-serif, system-ui, sans-serif'
    fontSize: 'clamp(2.25rem, 5vw, 3.75rem)'
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: '-0.02em'
  headline:
    fontFamily: 'Plus Jakarta Sans, Almarai, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1.875rem'
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: 'Plus Jakarta Sans, Almarai, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1.125rem'
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: 'Plus Jakarta Sans, Almarai, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: 'Plus Jakarta Sans, Almarai, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.75rem'
    fontWeight: 500
    lineHeight: 1.3
rounded:
  sm: '6px'
  md: '8px'
  lg: '10px'
  xl: '12px'
spacing:
  base: '8px'
  card: '16px'
  section: '32px'
components:
  button-primary:
    backgroundColor: '{colors.certified-green}'
    textColor: '{colors.pure-white}'
    rounded: '{rounded.md}'
    padding: '0 16px'
    size: '32px'
  button-outline:
    backgroundColor: 'transparent'
    textColor: '{colors.sage-stone}'
    rounded: '{rounded.md}'
    border: '1px solid {colors.sage-border}'
  input-default:
    backgroundColor: 'transparent'
    textColor: '{colors.sage-stone}'
    rounded: '{rounded.md}'
    size: '32px'
  card-default:
    backgroundColor: '{colors.pure-white}'
    textColor: '{colors.sage-stone}'
    rounded: '{rounded.xl}'
---

# Design System: HalalNeo

## Overview

**Creative North Star: "The Verified Ledger"**

HalalNeo is a halal trade platform whose trust mechanism is certification intelligence: every supplier profile and SKU surfaces certifying body, standard, and scope. The visual system reads like a precision ledger — calm, documented, and trustworthy — with a warm, confident B2B marketplace energy. Surfaces are flat and calm at rest, and only interactive elements lift with a soft shadow. The green halal identity is used sparingly and meaningfully: green marks verification, certification, and action; it never decorates.

Density is tighter than a consumer app — controls are compact (32px), corners are gently squared (8–12px), and information is arranged in scannable, ledger-like rows. The system is mobile-first, centered on a `max-w-7xl` container, and ships equally-crafted light and dark themes. Depth is communicated through tonal layering and translucency on floating surfaces (sticky header, stat cards), plus a hybrid elevation model: a 1px ring outlines resting surfaces and interactive cards lift with an ambient shadow on hover.

**Key Characteristics:**

- Verification-led: green = certified; badges, rings, and status chips read like a certificate ledger.
- Flat at rest, lifted on interaction: ring-only resting cards, shadow on hover.
- Translucent floating surfaces (sticky header `bg-background/90`, stat cards `bg-card/70`) with backdrop blur.
- Compact, ledger-like controls: 32px buttons/inputs, 8px control radius, 12px card radius.
- Light/dark as equal first-class themes; warm cream light, navy-blue dark; everything centered in `max-w-7xl`.
- Type set in Space Grotesk (headings) and Almarai (body), both self-hosted.

## Colors

Sage-tinted green family — neutrals carry a green cast (hue ~152–155), so nothing ever reads as cold grey. Primary green is the single saturated accent; its rarity is the point.

### Primary

- **Certified Green** (`oklch(0.45 0.14 155)`, light `--primary`): primary buttons, links, active nav, verified badges, focus rings, icons marking certification. The only saturated hue on a screen.
- **Certified Green (Dark)** (`oklch(0.72 0.14 155)`, dark `--primary`): same role in dark mode — brighter to hold contrast on dark surfaces.
- **Chart Emerald** (`oklch(0.55 0.12 185)`, `--chart-2`): secondary chart/graph accent.

### Neutral

- **Warm Cream** (`oklch(0.975 0.008 85)`, light `--background`): page surface in light mode — a warm off-white, not pure white.
- **Pure White** (`oklch(1 0 0)`, light `--card`): card surface in light mode.
- **Light Mode Text** (`oklch(0.22 0.02 55)`, light `--foreground`): primary text and icons.
- **Deep Navy** (`oklch(0.16 0.015 250)`, dark `--background`): page surface in dark mode — a cool navy-blue, not sage-tinted.
- **Washed Navy** (`oklch(0.19 0.018 250)`, dark `--card`): card surface in dark mode.
- **Dark Mode Text** (`oklch(0.93 0.005 250)`, dark `--foreground`): primary text in dark mode.
- **Sage Mist** (`oklch(0.95 0.01 85)`, `--muted` / `--secondary`): muted fill, secondary buttons, table striping.
- **Sage Stone** (`oklch(0.50 0.02 55)`, `--muted-foreground`): secondary text, placeholders, captions.
- **Sage Border** (`oklch(0.94 0.006 85)`, `--border` / `--input`): hairline borders and input strokes.

### Semantic accents

Five muted-role colors for wayfinding, never for large surfaces. Each has a light and dark `--*` value wired via `@theme inline` to `text-*` / `bg-*` utilities. Usage is capped: icon tiles (`bg-*/10`), status badges, stat numerals — ≤3 hues per screen.

- **Info Blue** (`--info`: light `oklch(0.55 0.15 255)` / dark `oklch(0.72 0.14 255)`): tools, links-out, informational badges.
- **Warn Amber** (`--warn`: light `oklch(0.55 0.15 75)` / dark `oklch(0.75 0.14 80)`): pending states, caution badges.
- **Success Green** (`--success`: light `oklch(0.5 0.16 150)` / dark `oklch(0.7 0.15 150)`): certified/verified-positive states distinct from primary buttons.
- **Accent Purple** (`--accent-purple`: light `oklch(0.55 0.18 300)` / dark `oklch(0.72 0.16 300)`): consultants/services, fourth category slot.
- **Accent Rose** (`--accent-rose`: light `oklch(0.55 0.19 12)` / dark `oklch(0.72 0.16 12)`): editorial/blog, fifth category slot.

### Named Rules

**The Rare Green Rule.** Primary green appears on ≤10% of any given screen — buttons, links, badges, and active states only. Green is evidence; it marks what is certified and what you can act on. If a surface starts feeling green, verification has stopped meaning something.

## Typography

**Display / Headline Font:** Space Grotesk (weights 400 / 700, self-hosted woff2) with `Almarai, ui-sans-serif, system-ui, sans-serif` fallback.
**Body Font:** Almarai (weights 300 / 400 / 700 / 800, self-hosted woff2) with `ui-sans-serif, system-ui, sans-serif` fallback.

**Character:** Space Grotesk is a geometric grotesque with technical precision for headings; Almarai is a warm geometric sans with Arabic-friendly humanism for body text. The pairing balances trade authority with approachability.

### Hierarchy

- **Display** (600, `clamp(2.25rem, 5vw, 3.75rem)`, 1.1, -0.02em): hero headlines. Balanced via `text-balance`.
- **Headline** (600, 1.875rem, 1.2, -0.01em): page-level `h1` on interior pages and section `h2`s.
- **Title** (600, 1.125rem, 1.3): card titles, sidebar headings.
- **Body** (400, 1rem, 1.6): paragraph text and list content. Measure stays 65–75ch (`max-w-2xl` on reading blocks).
- **Label** (500, 0.75rem, 1.3): badge text, metadata, uppercase optional for eyebrows only where a section needs a field label.
- **Micro** (500, 0.625rem, 1.3): stat card labels, compact metadata, timestamp text — dense surfaces where every pixel counts.

### Named Rules

**The Ledger Row Rule.** Data reads in rows: label left, value right, both on the same line (`flex items-center justify-between`), 14px body for values against 12–13px muted labels. Tables and data rows never wrap to two-column card layouts without a reason.

## Layout

- **Container:** `max-w-7xl` (1280px), centered, `px-4 sm:px-6`; interior pages often constrain intro blocks to `max-w-2xl`.
- **Grids:** card grids `grid gap-4 sm:grid-cols-2 lg:grid-cols-3` (occasionally `lg:grid-cols-4` for the home supplier strip). One column on mobile, two on tablet, three on desktop.
- **Rhythm:** sections separated by `space-y-8` or `Separator class="my-14"`; more space above a heading than below it; card internals at `gap-4` (16px).
- **Density:** compact controls — buttons and inputs are `h-8` (32px); tight but not cramped. Mobile-first: single column → tablet → desktop.
- **Header:** `sticky top-0 z-40 border-b bg-background/90 backdrop-blur`; mobile nav via a right-side Sheet with the same nav items.
- **Footer:** `bg-muted/40` translucent, `grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4` link columns with a brand block and a small print/copyright bar.

## Elevation & Depth

Hybrid model: **tonal layering + a defined shadow scale**. Depth is mostly tonal (surface → card → popover fills) with translucency and backdrop blur on floating chrome; shadows are reserved for interactivity and overlays, never ambient.

- Resting cards: flat `bg-card` with `ring-1 ring-foreground/10`. No shadow at rest — the ring is the outline, not a shadow.
- Interactive cards (`hoverable`): lift with `shadow-md` on hover (200ms ease) while keeping the ring. Shadow marks "you can act here."
- Floating chrome: sticky header `bg-background/90 backdrop-blur`, translucent stat cards `bg-card/70 backdrop-blur-sm`.
- Overlays (menus, popovers, sheets, selects): `shadow-md`/`shadow-lg` from the scale below, with `ring-1 ring-foreground/10`.

### Shadow Vocabulary

- **sm** (`0 1px 2px 0 rgb(0 0 0 / 0.05)`): subtle dividers, tab active states.
- **md** (`0 4px 12px -2px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.04)`): hover lift on interactive cards, dropdown menus, selects.
- **lg** (`0 12px 32px -4px rgb(0 0 0 / 0.12), 0 4px 8px -4px rgb(0 0 0 / 0.05)`): sheets, dialogs, large popovers.
- **glass** (`0 8px 32px -4px rgb(0 0 0 / 0.15), 0 0 0 1px rgb(255 255 255 / 0.05) inset`): glassmorphic floating surfaces (sticky header, stat cards).

### Named Rules

**The Flat-by-Default Rule.** Surfaces are flat at rest. Shadows appear only as a response to state — hover, open, or focus. A resting card with a drop shadow is a mistake.

## Shapes

Ledger-like form language: gently squared corners with a controlled radius scale based on a 10px root (`--radius: 0.625rem`).

- Controls (buttons, inputs, textareas, menu items): `rounded-md` (8px).
- Cards and popovers: `rounded-xl` (14px).
- Badges/chips: pill `rounded-4xl` — the one rounded exception, reserved for small certification/status chips.
- Hairline borders everywhere (`border-border`); no colored left-borders above 1px.

## Components

### Buttons

- **Shape:** `rounded-md` (8px), compact heights (default 32px, sm 28px, lg 36px).
- **Primary:** Certified Green fill, white text, `hover:bg-primary/80`, active press `translate-y-px`. The only saturated button on a screen.
- **Outline:** `border-border bg-background hover:bg-muted hover:text-foreground`; transparent fill, hairline border — the workhorse secondary.
- **Ghost:** transparent, `hover:bg-muted`; used in nav and icon actions.
- **Secondary:** Sage Mist fill with dark sage text.
- **Destructive:** translucent red (`bg-destructive/10 text-destructive`), never a loud fill.
- **Focus:** `ring-3 ring-ring/50` (green) around the control; not offset.
- Icons inside buttons render at 16px via the `data-icon="inline-start|inline-end"` slot convention; multiline CTA text uses `whitespace-normal min-w-0` to avoid overflow.

### Chips / Badges

- **Style:** pill `rounded-4xl`, 20px tall, 12px medium text.
- **Default (verified):** Certified Green fill, white text.
- **Secondary / outline:** Sage Mist fill or hairline border — used for neutral status (pending), categories, and metadata.
- **Destructive:** translucent red text — used for failed/expired certification.

### Cards / Containers

- **Corner Style:** `rounded-xl` (14px), `overflow-hidden`.
- **Background:** `bg-card` (Pure White light / Washed Sage dark).
- **Shadow Strategy:** ring-only at rest; `hoverable` cards lift with `shadow-md` on hover (200ms).
- **Border:** `ring-1 ring-foreground/10` instead of a border — the ring is the outline.
- **Internal Padding:** `16px` (`--card-spacing`), `12px` for `size="sm"`.

### Inputs / Fields

- **Style:** hairline `border-input` (Sage Border), transparent fill, `rounded-md` (8px), 32px tall.
- **Focus:** `border-ring` + `ring-3 ring-ring/50` in Certified Green; never a glow, always a ring.
- **Error:** `aria-invalid:border-destructive` + `ring-destructive/20`.
- **Placeholder:** Sage Stone; labels above the field via the Field wrapper (label, optional description, error slot).

### Navigation

- **Style:** sticky translucent header (`bg-background/90 backdrop-blur`) with a border-bottom hairline; nav links are plain text turning green on hover, active page in green; right cluster holds theme toggle (Sun/Moon), search icon button, and Sign in (green) / mobile hamburger (Sheet).
- **Mobile:** hamburger opens a right-side Sheet (`w-3/4 sm:max-w-sm`) with the same items as rows plus Sign in / Create account buttons.
- **Footer:** four-column responsive grid (brand + Marketplace / Resources / Company columns); copyright bar with the demo-data disclaimer.

### Accordion (FAQ)

- Items separated by hairline borders; trigger is title-weight text with a chevron that rotates on open; content is body text with muted color. No card nesting.

### Signature Component: Verification Ledger

- Supplier profiles and SKU pages render certification as a ledger row — certifying body, standard, scope, and expiry in a bordered table (`Table` with header row, `border-border` hairlines), status chips (Verified / Pending / Expired) color-coded green/neutral/red. This table is the platform's trust artifact; it must always read as precise, documented, and scannable.

## Do's and Don'ts

### Do:

- **Do** use green to mark only certification, verification, and primary action. When in doubt, use outline or ghost.
- **Do** keep resting surfaces flat — ring-only cards, no resting drop shadows. Lift only interactive cards on hover.
- **Do** keep controls compact (32px) and corners ledger-like (8px controls, 14px cards).
- **Do** center content in `max-w-7xl`, constrain prose to `max-w-2xl`, and keep body measure 65–75ch.
- **Do** ship light and dark as equal themes; verify every surface in both.
- **Do** write certification data in ledger rows (label/value on one line) and keep status chips pill-shaped.
- **Do** use `text-balance` on headings and `whitespace-normal min-w-0` on multiline button labels.

### Don't:

- **Don't** let green exceed ~10% of a screen — it stops meaning "certified" when it becomes decorative.
- **Don't** put a drop shadow on a resting card, or a colored left-border above 1px on any card/callout.
- **Don't** nest cards inside cards, or use identical same-size icon-card grids as the sole page structure.
- **Don't** use grey that isn't warm-tinted in light mode or blue-tinted in dark mode.
- **Don't** use gradient text, glassmorphism, or system display faces. Space Grotesk (headings) and Almarai (body) self-hosted are the type voices.
- **Don't** invent testimonials, market statistics, or real-data claims beyond the labelled demo dataset — present demo data as demo.
