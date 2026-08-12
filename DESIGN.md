---
name: HalalNeo
description: Halal trade intelligence for buyers and suppliers
colors:
  certified-green: "oklch(0.455 0.107 151.75)"
  certified-green-dark: "oklch(0.685 0.127 152.05)"
  verified-emerald: "oklch(0.6 0.118 184.704)"
  ink-sage: "oklch(0.208 0.02 152.25)"
  ink-sage-dark: "oklch(0.985 0.002 100)"
  pure-white: "oklch(1 0 0)"
  deep-ink-sage: "oklch(0.173 0.018 152.25)"
  sage-mist: "oklch(0.967 0.008 109.583)"
  sage-stone: "oklch(0.553 0.023 153.58)"
  sage-border: "oklch(0.912 0.015 154.06)"
  alert-red: "oklch(0.577 0.245 27.325)"
typography:
  display:
    fontFamily: "Almarai, ui-sans-serif, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 5vw, 3.75rem)"
    fontWeight: 600
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Almarai, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.2
  title:
    fontFamily: "Almarai, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Almarai, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Almarai, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.3
rounded:
  md: "6px"
  lg: "8px"
  xl: "12px"
spacing:
  base: "8px"
  card: "16px"
  section: "32px"
components:
  button-primary:
    backgroundColor: "{colors.certified-green}"
    textColor: "{colors.pure-white}"
    rounded: "{rounded.lg}"
    padding: "0 16px"
    size: "32px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.ink-sage}"
    rounded: "{rounded.lg}"
    border: "1px solid {colors.sage-border}"
  input-default:
    backgroundColor: "transparent"
    textColor: "{colors.ink-sage}"
    rounded: "{rounded.lg}"
    size: "32px"
  card-default:
    backgroundColor: "{colors.pure-white}"
    textColor: "{colors.ink-sage}"
    rounded: "{rounded.xl}"
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
- Light/dark as equal first-class themes, both sage-tinted; everything centered in `max-w-7xl`.
- Type set in Almarai (self-hosted), a warm geometric sans built for Arabic-friendly trade markets.

## Colors

Sage-tinted green family — neutrals carry a green cast (hue ~152–155), so nothing ever reads as cold grey. Primary green is the single saturated accent; its rarity is the point.

### Primary
- **Certified Green** (`oklch(0.455 0.107 151.75)`, light `--primary`): primary buttons, links, active nav, verified badges, focus rings, icons marking certification. The only saturated hue on a screen.
- **Certified Green (Dark)** (`oklch(0.685 0.127 152.05)`, dark `--primary`): same role in dark mode — brighter to hold contrast on dark sage surfaces.
- **Verified Emerald** (`oklch(0.6 0.118 184.704)`, `--chart-2`): secondary chart/graph accent and positive status tinting.

### Neutral
- **Pure White** (`oklch(1 0 0)`, light `--background` / `--card`): page and card surface in light mode.
- **Ink Sage** (`oklch(0.208 0.02 152.25)`, light `--foreground`): primary text and icons.
- **Deep Ink-Sage** (`oklch(0.173 0.018 152.25)`, dark `--background`): page surface in dark mode.
- **Washed Sage** (`oklch(0.24 0.022 152.1)`, dark `--card`): card surface in dark mode.
- **Sage Mist** (`oklch(0.967 0.008 109.583)`, `--muted` / `--secondary`): muted fill, secondary buttons, table striping.
- **Sage Stone** (`oklch(0.553 0.023 153.58)`, `--muted-foreground`): secondary text, placeholders, captions.
- **Sage Border** (`oklch(0.912 0.015 154.06)`, `--border` / `--input`): hairline borders and input strokes. In dark mode borders are `oklch(1 0 0 / 10%)` translucent white.

### Named Rules
**The Rare Green Rule.** Primary green appears on ≤10% of any given screen — buttons, links, badges, and active states only. Green is evidence; it marks what is certified and what you can act on. If a surface starts feeling green, verification has stopped meaning something.

## Typography

**Display / Body Font:** Almarai (weights 300 / 400 / 700 / 800, self-hosted woff2) with `ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif` fallback. No Google Fonts.

**Character:** Almarai is a warm geometric sans with an Arabic-friendly humanism that suits a halal trade platform — confident in headings, legible at small sizes in trade data. The family carries the whole system; hierarchy is created by weight, size, and tracking, not by switching faces.

### Hierarchy
- **Display** (600, `clamp(2.25rem, 5vw, 3.75rem)`, 1.1, -0.02em): hero headlines. Balanced via `text-balance`.
- **Headline** (600, 1.875rem, 1.2, -0.01em): page-level `h1` on interior pages and section `h2`s.
- **Title** (600, 1.125rem, 1.3): card titles, sidebar headings.
- **Body** (400, 1rem, 1.6): paragraph text and list content. Measure stays 65–75ch (`max-w-2xl` on reading blocks).
- **Label** (500, 0.75rem, 1.3): badge text, metadata, uppercase optional for eyebrows only where a section needs a field label.

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

### Named Rules
**The Flat-by-Default Rule.** Surfaces are flat at rest. Shadows appear only as a response to state — hover, open, or focus. A resting card with a drop shadow is a mistake.

## Shapes

Ledger-like form language: gently squared corners with a controlled radius scale derived from a base of 8px (`--radius: 0.5rem`).

- Controls (buttons, inputs, textareas, menu items): `rounded-lg` (8px).
- Cards and popovers: `rounded-xl` (12px).
- Badges/chips: pill `rounded-4xl` — the one rounded exception, reserved for small certification/status chips.
- Hairline borders everywhere (`border-border`); no colored left-borders above 1px.

## Components

### Buttons
- **Shape:** `rounded-lg` (8px), compact heights (default 32px, sm 28px, lg 36px).
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
- **Corner Style:** `rounded-xl` (12px), `overflow-hidden`.
- **Background:** `bg-card` (Pure White light / Washed Sage dark).
- **Shadow Strategy:** ring-only at rest; `hoverable` cards lift with `shadow-md` on hover (200ms).
- **Border:** `ring-1 ring-foreground/10` instead of a border — the ring is the outline.
- **Internal Padding:** `16px` (`--card-spacing`), `12px` for `size="sm"`.

### Inputs / Fields
- **Style:** hairline `border-input` (Sage Border light / translucent white dark), transparent fill, `rounded-lg` (8px), 32px tall.
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
- **Do** keep controls compact (32px) and corners ledger-like (8px controls, 12px cards).
- **Do** center content in `max-w-7xl`, constrain prose to `max-w-2xl`, and keep body measure 65–75ch.
- **Do** ship light and dark as equal themes, both sage-tinted; verify every surface in both.
- **Do** write certification data in ledger rows (label/value on one line) and keep status chips pill-shaped.
- **Do** use `text-balance` on headings and `whitespace-normal min-w-0` on multiline button labels.

### Don't:
- **Don't** let green exceed ~10% of a screen — it stops meaning "certified" when it becomes decorative.
- **Don't** put a drop shadow on a resting card, or a colored left-border above 1px on any card/callout.
- **Don't** nest cards inside cards, or use identical same-size icon-card grids as the sole page structure.
- **Don't** use grey that isn't sage-tinted; the neutral cast is hue ~152–155.
- **Don't** use gradient text, glassmorphism, or system display faces. Almarai self-hosted is the type voice.
- **Don't** invent testimonials, market statistics, or real-data claims beyond the labelled demo dataset — present demo data as demo.
