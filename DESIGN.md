---
name: HalalNeo
description: Halal trade intelligence for buyers and suppliers
colors:
  certified-green: 'oklch(0.4 0.15 158)'
  certified-green-dark: 'oklch(0.77 0.185 154)'
  warm-cream: 'oklch(0.968 0.013 88)'
  off-white-card: 'oklch(0.991 0.006 88)'
  off-white: 'oklch(0.985 0.004 88)'
  scrim: 'oklch(0.17 0.012 265)'
  deep-navy: 'oklch(0.16 0.022 205)'
  washed-navy: 'oklch(0.2 0.026 205)'
  sage-mist: 'oklch(0.935 0.011 85)'
  sage-stone: 'oklch(0.295 0.022 60)'
  sage-border: 'oklch(0.895 0.012 85)'
  alert-red: 'oklch(0.53 0.235 27)'
  alert-red-dark: 'oklch(0.66 0.22 27)'
  light-ink: 'oklch(0.21 0.022 55)'
  dark-mode-text: 'oklch(0.915 0.008 210)'
semantic:
  info: 'light oklch(0.52 0.15 255) / dark oklch(0.72 0.14 255)'
  warn: 'light oklch(0.52 0.15 75) / dark oklch(0.75 0.14 80)'
  success: 'light oklch(0.5 0.16 150) / dark oklch(0.72 0.17 152)'
  teal: 'light oklch(0.52 0.12 185) / dark oklch(0.72 0.12 185)'
  gold: 'light oklch(0.52 0.11 80) / dark oklch(0.78 0.13 84)'
typography:
  display:
    fontFamily: 'Space Grotesk, Almarai, ui-sans-serif, system-ui, sans-serif'
    fontSize: 'clamp(2.25rem, 5vw, 3.75rem)'
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: '-0.02em'
  headline:
    fontFamily: 'Space Grotesk, Almarai, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1.875rem'
    fontWeight: 600
    lineHeight: 1.2
  title:
    fontFamily: 'Space Grotesk, Almarai, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1.125rem'
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: 'Almarai, Space Grotesk, ui-sans-serif, system-ui, sans-serif'
    fontSize: '1rem'
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: 'Space Grotesk, Almarai, ui-sans-serif, system-ui, sans-serif'
    fontSize: '0.75rem'
    fontWeight: 500
    lineHeight: 1.3
textScale:
  4xs: '0.4375rem (7px) / line-height 1.2 — dense meta chips only'
  3xs: '0.5625rem (9px) / line-height 1.3'
  2xs: '0.625rem (10px) / line-height 1.35 — labels'
  2xs-plus: '0.6875rem (11px) / line-height 1.4'
rounded:
  sm: '6px'
  md: '8px'
  lg: '10px (icon/avatar/stat tiles only)'
  xl: '14px (cards, popovers, panels)'
shadows:
  sm: '0 1px 2px 0 oklch(0.35 0.05 60 / 0.06)'
  md: '0 4px 12px -2px oklch(0.35 0.05 60 / 0.1), 0 2px 4px -2px oklch(0.35 0.05 60 / 0.05)'
  lg: '0 12px 32px -4px oklch(0.35 0.05 60 / 0.14), 0 4px 8px -4px oklch(0.35 0.05 60 / 0.06)'
  xl: '0 24px 56px -8px oklch(0.35 0.05 60 / 0.18), 0 8px 16px -8px oklch(0.35 0.05 60 / 0.07)'
  glass: '0 8px 32px -4px oklch(0.35 0.05 60 / 0.15), 0 0 0 1px rgb(255 255 255 / 0.05) inset'
opacity:
  disabled: 0.5
  subtle: 0.1
  noticeable: 0.2
  pattern-girih: '0.04 light / 0.06 dark (--pattern-opacity, .pattern-girih texture overlay)'
animation:
  transition-duration-fast: '120ms (utility: duration-fast)'
  transition-duration-base: '200ms (utility: duration-base)'
  transition-duration-slow: '320ms (utility: duration-slow)'
  transition-duration-deliberate: '550ms (utility: duration-deliberate)'
  default-transition-duration: '120ms (= --transition-duration-fast)'
  default-transition-timing-function: 'cubic-bezier(0.4, 0, 0.2, 1) (= --ease-in-out)'
  ease-in: 'cubic-bezier(0.4, 0, 1, 1)'
  ease-out: 'cubic-bezier(0, 0, 0.2, 1)'
  ease-in-out: 'cubic-bezier(0.4, 0, 0.2, 1)'
  ease-spring: 'cubic-bezier(0.22, 1, 0.36, 1)'
screens:
  base: '<640px (mobile)'
  sm: '>=640px (tablet)'
  lg: '>=1024px (desktop)'
  xl: '>=1280px (4-col large screens only)'
spacing:
  base: '8px'
  card: '16px'
  section: '32px'
components:
  button-primary:
    backgroundColor: '{colors.certified-green}'
    textColor: '{colors.off-white}'
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
    backgroundColor: '{colors.off-white-card}'
    textColor: '{colors.light-ink}'
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
- Light/dark as equal first-class themes; warm cream light, deep-teal ink dark; everything centered in `max-w-7xl`.
- Type set in Space Grotesk (headings) and Almarai (body), both self-hosted.

## Colors

Sage-tinted green family — neutrals carry a warm cast (hue ~85–88 light) or deep-teal cast (hue ~205 dark), so nothing ever reads as cold grey. Primary green is the single saturated accent; its rarity is the point.

### Primary

- **Certified Green** (`oklch(0.4 0.15 158)`, light `--primary`): primary buttons, links, active nav, verified badges, focus rings, icons marking certification. The only saturated hue on a screen. Darkened from 0.44 so white-on-green buttons and green link text both clear WCAG AA (4.58:1 / 4.40:1 — was 2.88:1).
- **Certified Green (Dark)** (`oklch(0.77 0.185 154)`, dark `--primary`): same role in dark mode — brighter to hold contrast on dark surfaces. (WCAG: 7.02:1 on ink.)
- **Chart Teal** (`oklch(0.52 0.12 185)`, `--chart-2`): secondary chart/graph accent.

### Neutral

- **Warm Cream** (`oklch(0.968 0.013 88)`, light `--background`): page surface in light mode — a warm off-white, deepened slightly from 0.978 to cut glare and let cards read as lifted paper.
- **Off-White Card** (`oklch(0.991 0.006 88)`, light `--card`): card surface in light mode — lifted above Warm Cream but never pure white (§1.3 非纯白).
- **Light Mode Text** (`oklch(0.21 0.022 55)`, light `--foreground` / `--card-foreground`): primary text and icons. (7.11:1 on cream.)
- **Deep Teal Ink** (`oklch(0.16 0.022 205)`, dark `--background`): page surface in dark mode — a deep-teal ink scale (MongoDB-ink inspired, hue 205), chroma reduced from 0.028 so the large canvas reads calmer during long reading.
- **Washed Navy** (`oklch(0.2 0.026 205)`, dark `--card`): card surface in dark mode — lifted off the page, never pure black.
- **Dark Mode Text** (`oklch(0.915 0.008 210)`, dark `--foreground`): primary text in dark mode — softened from 0.935 to reduce halation while staying 9.23:1.
- **Sage Mist** (`oklch(0.935 0.011 85)`, `--muted` / `--secondary`): muted fill, secondary buttons, table striping.
- **Sage Stone** (`oklch(0.295 0.022 60)`, `--muted-foreground`): secondary text, placeholders, captions — darkened until it clears AA as body-adjacent text (4.54:1 light / 6.25:1 dark; was 2.60:1 light).
- **Sage Border** (`oklch(0.895 0.012 85)`, `--border` / `--input`): hairline borders and input strokes — visible, not whisper-thin.

### On-image surfaces

Photographic surfaces are theme-independent, so their two tokens deliberately ignore the light/dark switch:

- **Off-White** (`oklch(0.985 0.004 88)` light / `oklch(0.915 0.008 210)` dark, `--on-dark` → `text-on-dark`): caption/heading text sitting on a dark image or gradient. Reserved for that; never used as a page foreground.
- **Scrim** (`oklch(0.17 0.012 265)`, `--scrim` → `from-scrim/80 via-scrim/40`): the fixed dark ink that grades a photo under overlaid text. Defined in `:root` only and intentionally _not_ redefined in `.dark` — an inverted scrim would make captions unreadable. Native `black`/`white` utilities are banned (§色板禁令); these two tokens are the only sanctioned way to put light text on imagery.

### Semantic accents

Five muted-role colors for wayfinding, never for large surfaces. Each has a light and dark `--*` value wired via `@theme inline` to `text-*` / `bg-*` utilities. Usage is capped: icon tiles (`bg-*/10`), status badges, stat numerals — ≤3 hues per screen.

- **Info Blue** (`--info`: light `oklch(0.52 0.15 255)` / dark `oklch(0.72 0.14 255)`): tools, links-out, informational badges.
- **Warn Amber** (`--warn`: light `oklch(0.52 0.15 75)` / dark `oklch(0.75 0.14 80)`): pending states, caution badges.
- **Success Green** (`--success`: light `oklch(0.5 0.16 150)` / dark `oklch(0.72 0.17 152)`): certified/verified-positive states distinct from primary buttons.
- **Accent Teal** (`--teal`: light `oklch(0.52 0.12 185)` / dark `oklch(0.72 0.12 185)`): secondary wayfinding — services/consultants, region chips, fourth category slot. Replaced Accent Purple 2026-09-20 (§design-upgrade-plan 1.1 — off-family hues removed).
- **Accent Gold** (`--gold`: light `oklch(0.52 0.11 80)` / dark `oklch(0.78 0.13 84)`): editorial/blog, fifth category slot; future home of certification-seal accents. Replaced Accent Rose 2026-09-20. Gold is chip/scale-scale only — never large surfaces.

All five pass WCAG AA (≥4.5:1) as text on their own `/10` badge tints in both modes — verified by measurement, not by eye. (Light warn/info were darkened 0.55→0.52 for exactly this reason.)

**Badge vocabulary (listing + detail pages).** Status and classification badges use a fixed color-to-meaning map, shared via `#lib/utils/region.ts` + `tile-colors.ts`: certified = Success + ShieldCheck; cert-pending = Warn; not-certified = Destructive; country = region map (`regionBadgeClass`); business type = Manufacturer Info / Wholesaler Teal / Trader Gold; brand owner = Teal. Chips sitting on card imagery use **opaque** fills (`bg-background/80`, semantic `/10` tints) — never `backdrop-blur` on a list card (§1.4). Text drawn directly onto a photo instead rides a `from-scrim/80 via-scrim/40` gradient with `text-on-dark`.

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
- **Label** (500, `text-xs` = 0.75rem): badge text, metadata, uppercase optional for eyebrows only where a section needs a field label.
- **Micro** (500, `text-2xs` = 0.625rem, 1.35): stat card labels, compact metadata, timestamp text — dense surfaces where every pixel counts.

**Sub-label scale (tokens, `@theme inline`).** The dense end of the scale is tokenised so no page ever writes an arbitrary size; each token carries its own line-height, and Tailwind v4 exposes them as classes:

- `text-2xs` — `0.625rem` (10px) / 1.35: the default label size on mobile dense surfaces.
- `text-2xs-plus` — `0.6875rem` (11px) / 1.4: labels that need a touch more breath on `sm+`.
- `text-3xs` — `0.5625rem` (9px) / 1.3: table microcopy, only where 10px genuinely overflows.
- `text-4xs` — `0.4375rem` (7px) / 1.2: dense meta chips only (numeric deltas inside small badges) — never for running text.

Arbitrary values (`text-[10px]`, `text-[0.8rem]`, …) are banned everywhere outside the vendored `src/lib/components/ui/` primitives; the leading combo form (`text-2xs/relaxed`) is preferred over hand-setting `leading-[…]`, since each token already ships a tuned line-height.

### Named Rules

**The Ledger Row Rule.** Data reads in rows: label left, value right, both on the same line (`flex items-center justify-between`), 14px body for values against 12–13px muted labels. Tables and data rows never wrap to two-column card layouts without a reason.

**Tabular figures on changing values.** Any date, price, quantity or expiry rendered as data carries `tabular-nums` (cert "Valid until", trade-show date ranges, RFQ quantity/price tiles), so digits stay column-aligned as values update.

## Layout

- **Container:** `max-w-7xl` (1280px), centered, `px-4 sm:px-6`; interior pages often constrain intro blocks to `max-w-2xl`; detail bodies start at `max-w-6xl` (never `max-w-4xl` whitespace).
- **Grids:** listing grids start at 2 columns on mobile and step up (`grid-cols-2 sm:grid-cols-3 lg:grid-cols-4`); card imagery capped (`aspect-[16/10]` or smaller on mobile); secondary descriptions hidden on phones (`hidden sm:block`); titles truncate; padding steps down (`p-2.5` vs `sm:p-4`). Sparse grids (item count can be < one row) use `sm:grid-cols-[repeat(auto-fit,minmax(260–280px,1fr))]` — `auto-fit` (not `auto-fill`) so few items stretch across the full row instead of leaving empty tracks.
- **Space utilization:** every page fills its horizontal band (side whitespace only from the container max-width); narrow centered forms get a right rail (`/rfqs/new`: form + `w-72` guidance aside in a `max-w-7xl` flex row) instead of floating in empty space; short detail pages append a `RelatedLinks` section (`/promotions/[id]` "More quick deals"); account overview surfaces latest inquiries + saved/followed activity so a logged-in dashboard is never half-empty.
- **Rhythm:** sections separated by `space-y-4` (mobile) / `space-y-6` (sm+); card internals at `gap-2`/`gap-3`; more space above a heading than below it.
- **Density:** compact controls — buttons and inputs are `h-8` (32px); labels 10–11px, body 12–14px; tight but not cramped. No decorative text above `text-base` on mobile (hero titles excepted). Page lead paragraphs are `text-xs sm:text-sm`; section `h2`s cap at `text-base` on mobile and step up at `sm:`; `CardTitle` renders `text-sm sm:text-base` (never `text-lg` on phones); share buttons collapse to icon-only marks (`X` / `in` / `WA` / `f` + link glyph) below `sm`.
- **Detail pages:** single-column stack on mobile; two columns (content + sticky sidebar) on desktop.
- **Lists paginate:** every listing page uses the shared `Paginator` (`PAGE_SIZE` matched to grid columns: 8/9/12 for 2/3/4 cols); filters reset to page 1; hidden when a single page suffices.
- **Header:** `sticky top-0 z-50 border-b bg-background/80 backdrop-blur-xl`; mobile nav via a bottom glass tab bar (Explore/Menu popovers) plus a `md–lg`-only hamburger Sheet.
- **Footer:** `bg-muted/30` translucent, `grid-cols-2 sm:grid-cols-3 lg:grid-cols-6` (brand + 5 link groups) with a copyright bar.

## Elevation & Depth

Hybrid model: **tonal layering + a defined shadow scale**. Depth is mostly tonal (surface → card → popover fills) with translucency and backdrop blur on floating chrome; shadows are reserved for interactivity and overlays, never ambient. Backdrop blur is allowlisted to header / floating tab bar / popovers / sheets / hero accents — never on list-card grids (GPU cost).

### Motion

Animation is GPU-cheap only (`opacity` / `transform`), and every animation dies under `prefers-reduced-motion`:

- **Durations are tokens, never numbers.** `--transition-duration-{fast,base,slow,deliberate}` (120/200/320/550ms) is the namespace Tailwind v4 resolves `duration-*` against, so markup writes `duration-base`, not `duration-200`. The bare `--duration-*` aliases exist only for raw CSS inside `layout.css`.
- **Bare `transition` is token-backed too.** `--default-transition-duration` points at `fast` (120ms) and `--default-transition-timing-function` at `--ease-in-out`, so no control silently inherits Tailwind's 150ms default.
- **Scroll reveal:** `reveal` attach action adds `.in` via IntersectionObserver; `.reveal/.in` transition in `layout.css` with `--reveal-delay` stagger support.
- **Entrance:** `.animate-enter` (slide-up 0.55s) with `--enter-delay` stagger for hero sequences.
- **Ambient:** `.animate-float` / `.animate-glow` reserved for hero decor blobs.
- **Easing:** `ease-spring` (`cubic-bezier(0.22, 1, 0.36, 1)`) is the signature curve — write the class, not `ease-[cubic-bezier(…)]`.
- Interactive cards lift on hover (`duration-base`); buttons inherit primitive transitions. No page-transition choreography — navigations stay instant. Card hover transitions name exact properties (`transition-[transform,box-shadow]`, never `transition-all`); a page-load entrance uses the 0/60/120ms `--enter-delay` rhythm.

- Resting cards: flat `bg-card` with `ring-1 ring-foreground/10`. No shadow at rest — the ring is the outline, not a shadow.
- Interactive cards (`hoverable`): lift with `hover:-translate-y-0.5` + `shadow-md` on hover (`transition-[transform,box-shadow] duration-base ease-spring`) while keeping the ring. Shadow marks "you can act here." Vendored `ui/card`'s `hoverable` variant stays `shadow-md`/`ease-out` internally — custom cards match its `shadow-md` magnitude, not the plan's `shadow-lg`, so hover depth is one consistent step site-wide.
- Floating chrome (the only blur allowlist): sticky header `bg-background/80 backdrop-blur-xl`, mobile glass tab bar + its scrim, admin/supplier sidebar `bg-card/60 backdrop-blur-xl`, and popover/sheet/dialog overlays. Cards and stat tiles stay flat `bg-card` + ring — no blur, ever.
- Overlays (menus, popovers, sheets, selects): `shadow-md`/`shadow-lg` from the scale below, with `ring-1 ring-foreground/10`.

### Shadow Vocabulary

- **sm** (`0 1px 2px 0 oklch(0.35 0.05 60 / 0.06)`): subtle dividers, tab active states.
- **md** (`0 4px 12px -2px oklch(0.35 0.05 60 / 0.1), 0 2px 4px -2px oklch(0.35 0.05 60 / 0.05)`): hover lift on interactive cards, dropdown menus, selects.
- **lg** (`0 12px 32px -4px oklch(0.35 0.05 60 / 0.14), 0 4px 8px -4px oklch(0.35 0.05 60 / 0.06)`): sheets, dialogs, large popovers.
- **xl** (`0 24px 56px -8px oklch(0.35 0.05 60 / 0.18), 0 8px 16px -8px oklch(0.35 0.05 60 / 0.07)`): command palettes, the heaviest floating surfaces.
- **glass** (`0 8px 32px -4px oklch(0.35 0.05 60 / 0.15), 0 0 0 1px rgb(255 255 255 / 0.05) inset`): glassmorphic floating surfaces (sticky header, stat cards).

All shadows carry the warm-ochre hue (60) of the light-mode palette at low alpha instead of generic black — on cream surfaces a neutral black shadow reads as dirt; the tinted one reads as ambient occlusion.

### Named Rules

**The Flat-by-Default Rule.** Surfaces are flat at rest. Shadows appear only as a response to state — hover, open, or focus. A resting card with a drop shadow is a mistake.

## Shapes

Ledger-like form language: gently squared corners with a controlled radius scale based on a 10px root (`--radius: 0.625rem`).

- Controls (buttons, inputs, textareas, menu items): `rounded-md` (8px).
- Cards and popovers: `rounded-xl` (14px).
- Badges/chips: pill `rounded-4xl` — the one rounded exception, reserved for small certification/status chips.
- Hairline borders everywhere (`border-border`); no colored left-borders above 1px.

**Radius audit rule (2026-09).** Only three corner values exist on any surface: `rounded-md` (8px) for controls, `rounded-xl` (14px) for cards/popovers/panels (incl. the mobile glass tab bar and its popovers, Select/Dropdown panels, alerts), and pills for chips. `rounded-2xl/3xl` are banned; `rounded-lg` is reserved for icon tiles / avatar initials tiles / stat tiles only. Pages must not hand-roll card corners — use the shared `Card` or `rounded-xl bg-card ring-1`.

### Brand Mark & Girih Texture (design plan §2)

- The single brand motif is the octagram (rub el hizb interlocked-squares geometry — an artistic tradition, never a religious symbol per §8.2 red lines). One shared component owns it: `site/mark.svelte`, three variants — `outline` (logo/brand chips), `solid` (seal cores), `pattern` (large faint watermark behind empty/error states). Geometry lives in the component's path constants only; pages must never copy the star SVG.
- `.pattern-girih` overlays the star-grid texture via a CSS mask tinted by `currentColor` at `--pattern-opacity` (0.04 light / 0.06 dark). Whitelist — the only allowed hosts: hero carousel container, site footer, admin/supplier sidebar brand bars, login/register pages, 404/error page. Banned on list grids, tables, and modals (§1.4 discipline). Zero JS, zero blur.
- `site/certification-seal` renders a certification as a ring + micro-octagram + certifier abbreviation seal (40px). Status colors: `certified` → `success`, `pending` → `warn`, `expired`/`not-certified` → `destructive`. Hover reveals full certifier name (+ scope tooltip, CSS-only `group-hover`, hidden at rest). Motion is one `duration-slow` `stroke-dashoffset` draw-in; zero blur. Hosts: supplier cert cards, product cert tab, verify result cards. Per §8.2 a seal is an artistic motif, never an imitation of a real certifier's logo.
- `site/icon` accepts `verified` — overlays a 10px `success` octagram corner badge on category icons (products-page category tiles when the category holds certified products). No other icon carries the badge.
- `site/branded-empty-media` is the Empty icon slot everywhere (replaces raw `ui/empty` `EmptyMedia` in pages): the foreground lucide icon centered over a 64px `mark pattern` octagram watermark at `opacity-30 dark:opacity-40` (one tier above the 4–6% page texture). Never hand-stack the star behind icons ad hoc.
- Brand assets are generated, not hand-drawn: `pnpm brand` (`scripts/gen-brand-assets.mjs`) parses the path constants from `mark.svelte` and the oklch tokens from `layout.css`, then rasterizes to `static/brand/` — favicon.svg + favicon-32.png, apple-touch-icon.png (180), manifest PNG icons (192/512, maskable-safe), and the 1200×630 `og-default.png` social card (primary-green, girih texture, octagram, Space Grotesk wordmark). Assets live in `/static` (never R2, §5.12). `app.html` theme-color metas are the hex equivalents of light/dark `--background` (browsers ignore oklch in meta tags) — re-run `pnpm brand` and re-sync both after any token change.

## Components

### Buttons

- **Shape:** `rounded-md` (8px), compact heights (default 32px, sm 28px, lg 36px).
- **Primary:** Certified Green fill, Off-White text (`--primary-foreground`), `hover:bg-primary/80`, active press `translate-y-px`. The only saturated button on a screen.
- **Outline:** `border-border bg-background hover:bg-muted hover:text-foreground`; transparent fill, hairline border — the workhorse secondary.
- **Ghost:** transparent, `hover:bg-muted`; used in nav and icon actions.
- **Secondary:** Sage Mist fill with dark sage text.
- **Destructive:** translucent red (`bg-destructive/10 text-destructive`), never a loud fill.
- **Focus:** `ring-3 ring-ring/50` (green) around the control; not offset.
- Icons inside buttons render at 16px via the `data-icon="inline-start|inline-end"` slot convention; multiline CTA text uses `whitespace-normal min-w-0` to avoid overflow.

### Chips / Badges

- **Style:** pill `rounded-4xl`, 20px tall, 12px medium text.
- **Default (verified):** Certified Green fill, Off-White text (`--primary-foreground`).
- **Secondary / outline:** Sage Mist fill or hairline border — used for neutral status (pending), categories, and metadata.
- **Destructive:** translucent red text — used for failed/expired certification.

### Cards / Containers

- **Corner Style:** `rounded-xl` (14px), `overflow-hidden`.
- **Background:** `bg-card` (Off-White Card `oklch(0.991 0.006 88)` light / Washed Navy `oklch(0.2 0.026 205)` dark) — neither end is pure white or pure black.
- **Shadow Strategy:** ring-only at rest; `hoverable` cards lift with `shadow-md` on hover (`duration-base`).
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

### Shared Site Components (must-reuse, never rewrite in pages)

- `site/stat-tile` (value + label + tone + hint) for stat tiles; `site/filter-pills` (ToggleGroup, `options` + `bind:value`) for all single-select filters — never hand-roll filter buttons.
- `site/paginator` (`bind:page` + `totalPages`, PAGE_SIZE 8/9/12 for 2/3/4-col grids, reset to page 1 on filter change), `site/section-head` (number/title/description/link) for section headers.
- `site/collapsible-section`, `site/share-buttons`, `site/related-links`, `site/guide-hero` (guide fallback), `site/confirm-dialog` (replaces `window.confirm`), `site/breadcrumb`, `site/image-upload` (client WebP compression → `POST /api/media/upload`, fills a URL field via `onuploaded` — use for every R2-backed image field instead of pasting URLs only).
- Portals: `site/account-nav`, `site/admin-sidebar`, `site/supplier-sidebar` (fixed bottom cluster: user + email + theme + home + sign-out).
- Brand: `site/mark` (octagram motif, variants `outline|solid|pattern`) — the only source of the star geometry; `site/certification-seal` (ring + abbreviation trust seal, status-colored); `site/branded-empty-media` (Empty icon slot, star watermark); `.pattern-girih` texture hosts are whitelisted (see Brand Mark & Girih Texture).
- Listing grids start at `grid-cols-2` on mobile with compact cards (`p-2.5` vs `sm:p-4`, truncated titles, secondary descriptions `hidden sm:block`); empty states inside grids must span full width (`col-span-full`).

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
- **Don't** write arbitrary values the scale already covers: `text-[10px]`, `duration-300`, `ease-[cubic-bezier(…)]`, `leading-[…]`. Use `text-2xs`, `duration-slow`, `ease-spring`, and the tokens' built-in line-heights. (Vendored `src/lib/components/ui/` primitives are the only exemption.)
- **Don't** put a native Tailwind palette class (`green-500`, `slate-200`, `bg-white`, `from-black/…`) or an `rgb()`/`rgba()`/hex literal anywhere in markup or CSS — semantic tokens only, and `--on-dark` / `--scrim` are the sanctioned on-image pair.
- **Don't** re-implement Card/Button/Badge/Tabs as page-level `:global()` CSS with hardcoded fills. Pages compose `bg-card` + `ring-1 ring-foreground/10` + `rounded-xl` and semantic chips (`bg-success/10 text-success`), or use the shared components; the Data Quality Dashboard is the cautionary tale.

## States & Feedback (统一状态反馈)

Every data surface implements the same three states — loading, empty, and error — using shared primitives. No ad-hoc "Loading…" text blocks.

### Loading (Skeleton)

- Skeletons (`ui/skeleton`) mirror the loaded layout: grid pages render 8–12 skeleton cards with the same grid classes; table pages render 4–6 skeleton rows.
- Skeleton blocks use `animate-pulse rounded-md bg-muted` (the primitive default); never spinners for full-page loads. Inline button submissions may use `Loader2` icon swap + `disabled` state instead.
- Stat tiles already ship a `loading` prop that swaps the numeral for a pulsing block — reuse it.

### Empty

- Use `ui/empty` (`Empty`, `EmptyTitle`, `EmptyDescription`) with `site/branded-empty-media` as the icon slot (octagram watermark + muted lucide icon, see Brand Mark & Girih Texture) and one clear next action (e.g. "Clear filters", "Publish the first story"). Match the list's grid width; don't stretch a full-width card.
- Empty states must state _why_ it's empty when it isn't obviously zero: "No products match these filters" not just "No products".

### Error

- Fetch/render errors surface an inline Alert (`ui/alert` variant="destructive") with the failure summary and a retry action where the operation is idempotent. Never silent `catch`.
- API mutations that fail must show feedback (Toast error, see below) — a dead button after a failed request is a bug.

### Operation feedback (操作反馈)

- **Toast (sonner)**: light success/notice feedback for create/update/delete — "Supplier approved", "Story published". Mount the `Toaster` once per layout; call `toast.success()` / `toast.error()` from the mutation site. Toasts are brief (≤5s), self-dismiss, and never carry the only copy of an error message.
- **AlertDialog (`ui/alert-dialog`)**: required gate before any destructive action (delete supplier/product/article/etc.) — destructive-styled confirm button, cancel primary. `window.confirm()` is banned in admin/portal code.
- In admin tables, after a mutation succeeds: toast + optimistic list update (or refetch), so the row reflects the new state without a full reload.

## Forms (表单体验)

- Validation is Zod schemas, shared between API layer (`safeParse` in `+server.ts`) and client (Zod runs in the browser too — same library, field-level schemas per form). Server returns field errors as `{ error: 'Validation failed', details: { field: [message] } }` (Zod `flatten().fieldErrors`); the client merges them via `mergeServerDetails` (`#lib/utils/forms.ts`) onto per-field messages.
- Errors render via `ui/field` (`FieldError`, conditional `{#if}` — never render an empty error slot) under the input, `aria-invalid` styling from the primitives; focus jumps to the first invalid field on submit via shared `focusFirstInvalid(formEl)` (same file). Exemplars: `/contact`, `/rfqs/new`. New forms must reuse this helper, not hand-roll error mapping.
- Never wipe the user's input on failed submit. Inline validation on blur for format checks (email/URL), submit-time for the rest.
- Submit buttons disable + swap icon while pending (no double submit); success feedback via Toast; failure keeps values and shows field errors.

## Accessibility (a11y)

- Every interactive element is keyboard reachable: visible `focus-visible` ring (green, ring-3/50) on all controls; nothing `outline-none` without a replacement ring. Global default `outline-color` is solid `outline-ring` (no alpha), never `outline-ring/50`.
- A "Skip to content" link is the first focusable element on every front page (hidden until focused), targeting `<main id="main-content">`.
- The hero carousel honours `prefers-reduced-motion` (no autoplay) and always exposes a visible pause/resume control; non-active slides are `inert` so they leave the tab order.
- Icon-only buttons carry `aria-label` (the admin delete/enable buttons already do). Links with icons have visually-hidden or plain text.
- Touch targets ≥44px effective on mobile — compact 32px controls must gain padding/margin slack on `sm` and below via size bump (or keep 32px only where a larger fallback exists nearby).
- Color is never the sole signal: status badges pair color with icon/text (Certified ✓, Pending clock, Expired ✕) — the badge vocabulary already enforces this.
- All contrast: text ≥4.5:1, verified in both themes (the palette was darkened for exactly this — see Colors).
- `prefers-reduced-motion` kills all animation globally (already wired in `layout.css`).

## Front-site vs Admin differentiation (前后台差异化)

- **Front site** (`src/routes/+layout.svelte` shell): marketing-grade polish — sticky glass header, hero moments, `max-w-7xl` container, scroll-reveal choreography, footer grid. Motion and flourish live here.
- **Admin/portal** (`src/routes/admin/`, `supplier/`): efficiency-first — fixed-height shell (`h-dvh overflow-hidden`), persistent sidebar, dense tables, `max-w-6xl` content, no reveal animations, no hero. Every extra pixel serves scanning speed.
- Shared primitives keep both portals visually one system; density and motion differ, not palette or radius.
- Admin stays `noindex` (robots meta already set in `admin/+layout.svelte`).

## Performance & Cost (性能与成本)

- GPU-only animation (`opacity`/`transform`); `backdrop-blur` allowlisted to header/floaters/hero — never on list grids (GPU cost).
- List APIs: limit ≤100 + column projection; `cacheKey: queryCacheKey(url)` wherever query params change results; WHERE columns covered by D1 indexes; `LIKE '%…%'` only for small tables (<500 rows), FTS otherwise.
- Imagery: `srcset` + `sizes`, lazy below-the-fold, eager + `fetchpriority="high"` for LCP images, explicit width/height (no CLS).
- R2 media served with compression; Workers cache for immutable assets. PageSpeed targets: LCP <2.5s, CLS <0.1, INP <200ms.
