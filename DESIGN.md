---
name: HalalNeo
description: Halal trade intelligence for buyers and suppliers
colors:
  certified-green: 'oklch(0.44 0.15 158)'
  certified-green-dark: 'oklch(0.74 0.15 158)'
  warm-cream: 'oklch(0.978 0.01 88)'
  pure-white: 'oklch(1 0 0)'
  deep-navy: 'oklch(0.15 0.02 248)'
  washed-navy: 'oklch(0.185 0.024 250)'
  sage-mist: 'oklch(0.935 0.011 85)'
  sage-stone: 'oklch(0.46 0.022 60)'
  sage-border: 'oklch(0.895 0.012 85)'
  alert-red: 'oklch(0.57 0.235 27)'
  dark-mode-text: 'oklch(0.935 0.006 250)'
typography:
  display:
    fontFamily: 'Space Grotesk, Almarai, ui-sans-serif, system-ui, sans-serif'
    fontSize: 'clamp(2.25rem, 5vw, 3.75rem)'
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: '-0.02em'
  headline:
    fontFamily: 'Space Grotesk, Almarai, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1.875rem'
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: 'Space Grotesk, Almarai, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1.125rem'
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: 'Space Grotesk, Almarai, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: 'Space Grotesk, Almarai, ui-sans-serif, system-ui, sans-serif'
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

Density is tighter than a consumer app — controls are compact (32px), corners are gently squared (8–12px), and information is arranged in scannable, ledger-like rows. The system is mobile-first and compact: listing grids start at 2 columns even on phones, card imagery is capped, secondary descriptions hide on small screens. Everything is centered on a `max-w-7xl` container, and ships equally-crafted light and dark themes. Depth is communicated through tonal layering and translucency on floating surfaces (sticky header, popovers, hero), plus a hybrid elevation model: a 1px ring outlines resting surfaces and interactive elements lift with an ambient shadow on hover.

**Key Characteristics:**

- Verification-led: green = certified; badges, rings, and status chips read like a certificate ledger.
- Flat at rest, lifted on interaction: ring-only resting cards, shadow on hover.
- Translucent floating surfaces (sticky header, popovers, sheets, hero accents) with backdrop blur — never on list grids (performance).
- Compact, ledger-like controls: 32px buttons/inputs, 8px control radius, 12px card radius.
- Mobile density: 2-column listing grids, capped imagery, truncated titles, stepped-down padding — phones show more, not less.
- Light/dark as equal first-class themes; warm cream light, navy-blue dark; everything centered in `max-w-7xl`.
- Type set in Space Grotesk (headings) and Almarai (body), both self-hosted.

## Colors

Sage-tinted green family — neutrals carry a warm cast (hue ~85–88 light) or deep-navy cast (hue ~250 dark), so nothing ever reads as cold grey. Primary green is the single saturated accent; its rarity is the point.

### Primary

- **Certified Green** (`oklch(0.44 0.15 158)`, light `--primary`): primary buttons, links, active nav, verified badges, focus rings, icons marking certification. The only saturated hue on a screen. (WCAG: 6.56:1 white-on-green.)
- **Certified Green (Dark)** (`oklch(0.74 0.15 158)`, dark `--primary`): same role in dark mode — brighter to hold contrast on dark surfaces. (WCAG: 9.19:1.)
- **Chart Emerald** (`oklch(0.55 0.12 185)`, `--chart-2`): secondary chart/graph accent.

### Neutral

- **Warm Cream** (`oklch(0.978 0.01 88)`, light `--background`): page surface in light mode — a warm off-white, not pure white.
- **Pure White** (`oklch(1 0 0)`, light `--card`): card surface in light mode.
- **Light Mode Text** (`oklch(0.21 0.022 55)`, light `--foreground`): primary text and icons. (16.69:1 on cream.)
- **Deep Navy** (`oklch(0.15 0.02 248)`, dark `--background`): page surface in dark mode.
- **Washed Navy** (`oklch(0.185 0.024 250)`, dark `--card`): card surface in dark mode.
- **Dark Mode Text** (`oklch(0.935 0.006 250)`, dark `--foreground`): primary text in dark mode. (16.25:1.)
- **Sage Mist** (`oklch(0.935 0.011 85)`, `--muted` / `--secondary`): muted fill, secondary buttons, table striping.
- **Sage Stone** (`oklch(0.46 0.022 60)`, `--muted-foreground`): secondary text, placeholders, captions — darkened until 10px labels pass AA (6.73:1 light / 6.58:1 dark).
- **Sage Border** (`oklch(0.895 0.012 85)`, `--border` / `--input`): hairline borders and input strokes — visible, not whisper-thin.

### Semantic accents

Five muted-role colors for wayfinding, never for large surfaces. Each has a light and dark `--*` value wired via `@theme inline` to `text-*` / `bg-*` utilities. Usage is capped: icon tiles (`bg-*/10`), status badges, stat numerals — ≤3 hues per screen.

- **Info Blue** (`--info`: light `oklch(0.52 0.15 255)` / dark `oklch(0.72 0.14 255)`): tools, links-out, informational badges.
- **Warn Amber** (`--warn`: light `oklch(0.52 0.15 75)` / dark `oklch(0.75 0.14 80)`): pending states, caution badges.
- **Success Green** (`--success`: light `oklch(0.5 0.16 150)` / dark `oklch(0.7 0.15 150)`): certified/verified-positive states distinct from primary buttons.
- **Accent Purple** (`--accent-purple`: light `oklch(0.55 0.18 300)` / dark `oklch(0.72 0.16 300)`): consultants/services, fourth category slot.
- **Accent Rose** (`--accent-rose`: light `oklch(0.55 0.19 12)` / dark `oklch(0.72 0.16 12)`): editorial/blog, fifth category slot.

All five pass WCAG AA (≥4.5:1) as text on their own `/10` badge tints in both modes — verified by measurement, not by eye. (Light warn/info were darkened 0.55→0.52 for exactly this reason.)

**Badge vocabulary (listing + detail pages).** Status and classification badges use a fixed color-to-meaning map, shared via `#lib/utils/region.ts` + `tile-colors.ts`: certified = Success + ShieldCheck; cert-pending = Warn; not-certified = Destructive; country = region map (`regionBadgeClass`); business type = Manufacturer Info / Wholesaler Purple / Trader Rose; brand owner = Rose. Certification chips on card images sit on `bg-background/80 backdrop-blur-sm` so they read over photos.

### Named Rules

**The Rare Green Rule.** Primary green appears on ≤10% of any given screen — buttons, links, badges, and active states only. Green is evidence; it marks what is certified and what you can act on. If a surface starts feeling green, verification has stopped meaning something.

## Typography

**Display / Headline Font:** Space Grotesk (weights 400 / 700, self-hosted woff2) with `Almarai, ui-sans-serif, system-ui, sans-serif` fallback.
**Body Font:** Almarai (weights 400 / 700, self-hosted woff2) with `ui-sans-serif, system-ui, sans-serif` fallback.

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

- **Container:** `max-w-7xl` (1280px), centered, `px-4 sm:px-6`; interior pages often constrain intro blocks to `max-w-2xl`; detail bodies start at `max-w-6xl` (never `max-w-4xl` whitespace).
- **Grids:** listing grids start at 2 columns on mobile and step up (`grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`); card imagery capped (`aspect-[16/10]` or smaller on mobile); secondary descriptions hidden on phones (`hidden sm:block`); titles truncate; padding steps down (`p-2.5` vs `sm:p-4`).
- **Rhythm:** sections separated by `space-y-4` (mobile) / `space-y-6` (sm+); card internals at `gap-2`/`gap-3`; more space above a heading than below it.
- **Density:** compact controls — buttons and inputs are `h-8` (32px); labels 10–11px, body 12–14px; tight but not cramped. No decorative text above `text-base` on mobile (hero titles excepted).
- **Detail pages:** single-column stack on mobile; two columns (content + sticky sidebar) on desktop.
- **Lists paginate:** every listing page uses the shared `Paginator` (`PAGE_SIZE` matched to grid columns: 8/9/12 for 2/3/4 cols); filters reset to page 1; hidden when a single page suffices.
- **Header:** `sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl`; mobile nav via a bottom glass tab bar (Explore/Menu popovers) plus a `md–lg`-only hamburger Sheet.
- **Footer:** `bg-muted/30` translucent, `grid-cols-2 sm:grid-cols-3 lg:grid-cols-6` (brand + 5 link groups) with a copyright bar.

## Elevation & Depth

Hybrid model: **tonal layering + a defined shadow scale**. Depth is mostly tonal (surface → card → popover fills) with translucency and backdrop blur on floating chrome; shadows are reserved for interactivity and overlays, never ambient. Backdrop blur is allowlisted to header / floating tab bar / popovers / sheets / hero accents — never on list-card grids (GPU cost).

### Motion

Animation is GPU-cheap only (`opacity` / `transform`), and every animation dies under `prefers-reduced-motion`:

- **Scroll reveal:** `reveal` attach action adds `.in` via IntersectionObserver; `.reveal/.in` transition in `layout.css` with `--reveal-delay` stagger support.
- **Entrance:** `.animate-enter` (slide-up 0.55s) with `--enter-delay` stagger for hero sequences.
- **Ambient:** `.animate-float` / `.animate-glow` reserved for hero decor blobs.
- Interactive cards lift on hover (200ms); buttons inherit primitive transitions. No page-transition choreography — navigations stay instant.

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

**Radius audit rule (2026-09).** Only three corner values exist on any surface: `rounded-md` (8px) for controls, `rounded-xl` (14px) for cards/popovers/panels (incl. the mobile glass tab bar and its popovers, Select/Dropdown panels, alerts), and pills for chips. `rounded-2xl/3xl` are banned; `rounded-lg` is reserved for icon tiles / avatar initials tiles / stat tiles only. Pages must not hand-roll card corners — use the shared `Card` or `rounded-xl bg-card ring-1`.

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
- **Mobile:** bottom glass tab bar (Home / Categories / Products / Explore / Menu) with glass Explore/Menu popovers mirroring desktop nav; a hamburger Sheet covers `md–lg` widths with Sign in / Create account buttons.
- **Footer:** four-column responsive grid (brand + Marketplace / Resources / Company columns); copyright bar with the demo-data disclaimer.

### Accordion (FAQ)

- Items separated by hairline borders; trigger is title-weight text with a chevron that rotates on open; content is body text with muted color. No card nesting.

### Signature Component: Verification Ledger

- Supplier profiles render certification as rich cards — certifying body, standard, scope, certificate number, and expiry with status chips (Verified / Pending / Expired) color-coded green/neutral/red. Expired certificates flag destructive-red on both chip and date. This block is the platform's trust artifact; it must always read as precise, documented, and scannable.

## Do's and Don'ts

### Do:

- **Do** use green to mark only certification, verification, and primary action. When in doubt, use outline or ghost.
- **Do** keep resting surfaces flat — ring-only cards, no resting drop shadows. Lift only interactive cards on hover.
- **Do** keep controls compact (32px) and corners ledger-like (8px controls, 14px cards).
- **Do** keep listing grids ≥2 columns on mobile with capped imagery and stepped-down padding — phones show more, not less.
- **Do** paginate every listing page (shared Paginator, PAGE_SIZE matched to columns).
- **Do** center content in `max-w-7xl`, constrain prose to `max-w-2xl`, and keep body measure 65–75ch.
- **Do** ship light and dark as equal themes; verify every surface in both.
- **Do** write certification data in ledger rows (label/value on one line) and keep status chips pill-shaped.
- **Do** use `text-balance` on headings and `whitespace-normal min-w-0` on multiline button labels.

### Don't:

- **Don't** let green exceed ~10% of a screen — it stops meaning "certified" when it becomes decorative.
- **Don't** put a drop shadow on a resting card, or a colored left-border above 1px on any card/callout.
- **Don't** nest cards inside cards, or use identical same-size icon-card grids as the sole page structure.
- **Don't** use grey that isn't warm-tinted in light mode or blue-tinted in dark mode.
- **Don't** use gradient text, system display faces. Space Grotesk (headings) and Almarai (body) self-hosted are the type voices.
- **Don't** use glassmorphism outside floating surfaces (header, tab bar, popovers, sheets, hero accents) — list grids stay flat for GPU performance.
- **Don't** invent testimonials, market statistics, or real-data claims beyond the labelled demo dataset — present demo data as demo.
