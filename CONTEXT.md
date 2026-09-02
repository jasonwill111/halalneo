# HalalNeo

HalalNeo is a halal trade intelligence platform connecting international buyers with certified halal suppliers. Phase 1 ships a comprehensive knowledge base, B2B marketplace (categories, products, suppliers, buyer/seller accounts), AI-powered tools, and an admin backend for content management.

## Language

**User**: An account on the platform, identified by email and password.
_Avoid_: account, customer, member

**Buyer**: A User whose role is `buyer` — a company or individual sourcing halal products.
_Avoid_: purchaser, customer, client

**Seller**: A User whose role is `seller` — operates a Supplier profile on the platform.
_Avoid_: vendor, supplier user

**Supplier**: A seller-side business entity on the platform.
_Avoid_: merchant, store, company, seller entity

**businessType**: A Supplier's mutually-exclusive business classification. Values: `manufacturer`, `wholesaler`, `trader`.
_Avoid_: supplier type, category, business category

**isBrand**: A boolean on Supplier marking brand-owner status. Orthogonal to `businessType` — a brand can be any of the three business types.
_Avoid_: brand type, brand tier

**Category**: A node in the product taxonomy tree; products are filed under categories and category pages list them.
_Avoid_: taxonomy, collection, group

**Product**: A sellable item offered by a Supplier; the atomic item shown on a product detail page.
_Avoid_: SKU, item, listing

**Halal certification**: Certification attesting a product or facility is halal, issued by a recognised certifying body.
_Avoid_: halal certificate (ambiguous), compliance

**Certifying body**: An organisation authorised to issue halal certifications (e.g. MUI, JAKIM, GAC, SFDA).
_Avoid_: halal authority, certification agency

**Service provider**: A company offering logistics, finance, testing, consulting, or other services to halal trade participants.
_Avoid_: vendor, partner

**Knowledge base**: The public content site covering halal trade topics (certification, trade process, logistics, packaging, market guides, glossary).
_Avoid_: blog, docs, wiki

**Article**: A unit of knowledge-base content, stored as Markdown in the repo and organised under a section.
_Avoid_: post, entry, page

**Section**: A top-level column of the knowledge base (e.g. Halal Certification, Trade & Sourcing, Country / Market Guides).
_Avoid_: category, channel, hub

**Glossary**: The knowledge base's terminology component.
_Avoid_: dictionary, terms

**Landing page**: A marketing page stored in the `pages` table (type: 'landing'). Used for promotional/CTA pages.
_Avoid_: marketing page, promo page

**Market guide**: Country-specific halal trade intelligence (certification requirements, import rules, costs, opportunities).
_Avoid_: country guide, regional guide

**Trade show**: International halal industry exhibition/event listed in the trade shows calendar.
_Avoid_: event, exhibition

**Admin**: A staff account that manages the platform. Staff roles are `super admin`, `admin`, `editor`; a regular User can never access the admin backend.
_Avoid_: back office, management account

**AI Tools**: Platform-powered content generation (product descriptions, KB articles, blog posts, landing pages). Admin-only, accessed via `/admin/ai-tools`.
_Avoid_: content generator, AI assistant

---

## Current Implementation Status

### Pages Implemented (55 routes)

| Section | Pages | Status |
|---------|-------|--------|
| Homepage | `/` | ✅ Hero carousel, stats, categories, featured products/suppliers, KB preview |
| Products | `/products`, `/products/[slug]` | ✅ Full catalog with detail pages (image, price, specs, certifications, FAQs, resources) |
| Suppliers | `/suppliers`, `/suppliers/[slug]` | ✅ Directory with profiles (cover, certifications, products, trade terms) |
| Categories | `/categories`, `/categories/[slug]` | ✅ Product taxonomy |
| Knowledge Base | `/knowledge-base`, `/knowledge-base/[section]`, `/knowledge-base/[section]/[article]` | ✅ 6 sections, 121 articles |
| Blog | `/blog`, `/blog/[slug]` | ✅ Blog with article detail |
| Market Guides | `/market-guides`, `/market-guides/[country]` | ✅ 7 countries (Indonesia, Malaysia, UAE, Saudi, Türkiye, Pakistan, USA) |
| Glossary | `/glossary` | ✅ 30+ terms, A-Z navigation |
| Trade Shows | `/trade-shows` | ✅ 20+ events with region filter |
| Certifying Bodies | `/certifying-bodies`, `/certifying-bodies/[slug]` | ✅ 14 bodies |
| Service Providers | `/service-providers`, `/service-providers/[slug]` | ✅ 10 providers |
| Verify | `/verify` | ✅ Certificate verification tool |
| AI Chat | `/tools/ai-chat` | ⏸️ Coming soon (temporarily disabled) |
| Ingredient Checker | `/tools/ingredient-checker` | ✅ AI ingredient analysis |
| Certification Cost | `/tools/certification-cost` | ✅ Cost estimator (7 certifiers × 6 categories × 4 sizes) |
| Search | `/search` | ✅ Full-text search across articles, glossary, suppliers, products |
| Pricing | `/pricing` | ✅ 4-tier pricing + Brand URL add-on |
| About | `/about` | ✅ Mission, milestones, team |
| FAQ | `/faq` | ✅ Accordion FAQ with search |
| Contact | `/contact` | ✅ Contact form |
| Auth | `/login`, `/register`, `/supplier/login` | ✅ Buyer + supplier auth |
| Buyer Account | `/account`, `/account/profile`, `/account/saved`, `/account/inquiries` | ✅ Dashboard + 3 sub-pages |
| Supplier Portal | `/supplier/onboarding`, `/supplier/dashboard`, `/supplier/products`, `/supplier/orders`, `/supplier/manage` | ✅ 6 pages |
| Admin | `/admin/*` | ✅ 14 pages (dashboard, users, products, suppliers, categories, blog, knowledge-base, glossary, certifying-bodies, service-providers, inquiries, pages, ai-tools, settings) |

### API Endpoints (22)

| Endpoint | Methods | Purpose |
|----------|---------|---------|
| `/api/products` | GET, POST | List/create products |
| `/api/products/[slug]` | GET, PUT, DELETE | CRUD product |
| `/api/suppliers` | GET | List suppliers |
| `/api/suppliers/[slug]` | GET | Supplier detail |
| `/api/categories` | GET, POST | List/create categories |
| `/api/categories/[slug]` | GET | Category detail |
| `/api/knowledge-base` | GET, POST | List/create KB articles |
| `/api/knowledge-base/[slug]` | GET | KB article detail |
| `/api/knowledge-base/sections` | GET | KB sections |
| `/api/blog` | GET | List blog posts |
| `/api/blog/[slug]` | GET | Blog post detail |
| `/api/certifying-bodies` | GET | List certifiers |
| `/api/certifying-bodies/[id]` | GET | Certifier detail |
| `/api/service-providers` | GET | List service providers |
| `/api/service-providers/[slug]` | GET | Provider detail |
| `/api/inquiries` | GET, POST | List/create inquiries (rate-limited) |
| `/api/verify` | GET | Certificate verification search |
| `/api/chat` | POST | AI chat (Mastra agent, auth required) |
| `/api/pages` | GET | CMS pages |
| `/api/pages/[slug]` | GET | CMS page detail |
| `/api/settings` | GET | Site settings |
| `/api/media/[key]` | GET | Media retrieval (R2 + 304 support) |
| `/api/media/upload` | POST | Media upload |

### Database Schema (14 tables + 35 indexes)

| Table | Purpose | Key |
|-------|---------|-----|
| `suppliers` | Supplier profiles with certifications JSON | slug |
| `products` | Product catalog | slug |
| `categories` | Product taxonomy | slug |
| `certifyingBodies` | Halal certification organizations | id |
| `knowledgeBase` | KB articles | slug |
| `pages` | Landing pages + blog posts | slug |
| `serviceProviders` | Service provider profiles | slug |
| `inquiries` | Buyer inquiries | id |
| `media` | R2 media files | id |
| `siteSettings` | KV site settings | key |

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | SvelteKit 3.0.0-next.25 RC |
| UI | Svelte 5.57.0 + shadcn-svelte |
| CSS | Tailwind CSS 4 |
| Database | Cloudflare D1 (SQLite) |
| Storage | Cloudflare R2 |
| Auth | Better Auth 1.7.2 |
| ORM | Drizzle ORM 0.45.2 |
| AI | Mastra 1.63.0 + Vercel AI SDK 7.0.85 |
| Hosting | Cloudflare Workers |
| i18n | Paraglide.js 2.25.0 (URL strategy) |

### Svelte 5 Conventions (Strict)

- **Runes only**: `$state`, `$derived`, `$state.raw`, `$props`, `$effect`
- **No legacy**: No `svelte:component`, no `class:`, no `$:`, no `on:click`
- **Keyed each blocks**: All `{#each}` blocks must have keys
- **`#lib` not `$lib`**; `$app/state` not `$app/stores`
- **UI primitives from shadcn-svelte**: No hand-written buttons, inputs, tables, dialogs

---

## Admin Workflow

### Creating a Supplier (3 steps, ~30 seconds)
1. Click "New supplier"
2. Fill Name + Country → auto-generates slug, logo initials, description
3. Click "Create supplier" → done

### Creating a Product (4 steps, ~45 seconds)
1. Click "New product"
2. Fill Name + Supplier + Category → auto-generates slug
3. Expand Pricing section → fill MOQ/price
4. Click "Create product" → done

### Generating Content with AI
- **Supplier description**: Click "✨ Generate" next to Description field
- **Product description**: Click "✨ Generate" next to Description field
- **KB article body**: Click "✨ Generate with AI" next to Body field
- **Blog post body**: Click "✨ Generate with AI" next to Body field
- **Landing page**: Select type "Marketing" → fill Target Audience/Region/Key Points/CTA → click "✨ Generate Landing Page"

### Form Organization
- **Basic Info** section: Always expanded (required fields)
- **Additional sections**: Collapsed by default, click to expand
- AI generation buttons appear when the form type is relevant

---

## SEO/GEO Implementation

### Meta Tags (all pages)
- `<title>` unique per page
- `<meta name="description">` unique per page
- `<meta name="robots">` dynamic (noindex for auth/admin)
- Open Graph tags (og:title, og:description, og:image, og:url)
- Twitter Card tags
- `<link rel="canonical">` per page

### JSON-LD Structured Data
- `Product` schema on product detail pages
- `Organization` schema on supplier/certifying body/service provider detail pages
- `BreadcrumbList` schema on all detail pages
- `FAQPage` schema on FAQ page
- `Event` schema on trade shows page
- `Article` schema on KB articles
- `BlogPosting` schema on blog articles
- `WebSite` + `SearchAction` schema on homepage

### GEO Meta Tags
- `geo.region`, `geo.placename`, `geo.position`, `ICBM`
- `hreflang` alternates (English only, ready for i18n)

### Sitemap
- Dynamic XML sitemap at `/sitemap.xml`
- Static routes + database-driven dynamic routes
- Proper priorities and changefreq

### Robots.txt
- `Allow: /`
- `Disallow: /admin/`, `/account/`, `/supplier/`, `/api/`
- Sitemap reference

---

## AI Content Generation Rules (Mandatory)

> **These rules apply to ALL AI models regardless of which LLM is used.**

### Core Principles

1. **Products = Strict mode** — AI must 100% use user-provided data, no additions/inferences
2. **KB / Landing Pages / Blog = Creative mode** — AI can design, think, innovate, but must use svelte-shadcn components
3. **All generated content** — Must auto-generate SEO meta title/description + keywords
4. **Landing Pages** — Must generate GEO content (localized for target region)

### Product Generation Constraints

| Rule | Detail |
|------|--------|
| Content source | Must be 100% from user-provided data |
| AI freedom | ❌ None — cannot add, infer, or creatively expand |
| Output format | Identical to manually created product format |
| Input fields | Product name, category, specs, price, MOQ, certification, images, videos |
| SEO | Auto-generate meta title/description + keywords |

**AI's role: Format + layout + SEO optimization, not creation**

### KB Article Generation Constraints

| Rule | Detail |
|------|--------|
| Content source | User provides topic, key points, style, audience |
| AI freedom | ✅ Yes — can design, think, innovate |
| Layout model | **Vertical + Horizontal** — grids, sidebars, tables, multi-column layouts allowed |
| Output format | svelte-shadcn components (❌ NOT markdown) |
| Input fields | Title, category, type, audience, key points, style, length, images/videos |
| SEO | Auto-generate meta title/description + keywords |
| Save to | Knowledge Base |

**AI's role: Creation + design + content generation**

### Landing Page Generation Constraints

| Rule | Detail |
|------|--------|
| Content source | User provides page purpose, audience, selling points, CTA |
| AI freedom | ✅ Yes — can freely design layout and content |
| Layout model | **Vertical + Horizontal** — hero sections, multi-column grids, card rows, split layouts, CTAs |
| Output format | svelte-shadcn components (❌ NOT markdown) |
| Input fields | Title, purpose, audience, selling points, CTA, keywords, target region |
| SEO | Auto-generate meta title/description + keywords |
| GEO | Must generate localized content for target region |
| Save to | Pages (Marketing) |

**AI's role: Creation + design + content generation + localization**

### Blog Generation Constraints

| Rule | Detail |
|------|--------|
| Content source | User provides topic, outline, references |
| AI freedom | ✅ Yes |
| Layout model | **Vertical only** — linear top-to-bottom flow |
| Allowed components | Images, quotes, callouts, data tables, lists, code blocks — but only stacked vertically |
| Forbidden layouts | Multi-column grids, side-by-side sections, sidebar+content |
| Output format | svelte-shadcn components |
| SEO | Auto-generate meta title/description + keywords |

### AI Tools Workflow

```
┌─────────────────┐
│  User inputs    │
│  parameters     │
└────────┬────────┘
         ▼
┌─────────────────┐
│  AI generates   │
│  content + SEO  │
│  + GEO (landing)│
└────────┬────────┘
         ▼
┌─────────────────┐
│  Preview        │ ◄── Regenerate
│  Preview SEO/GEO│ ◄── Cancel
└────────┬────────┘
         ▼
┌─────────────────┐
│  Save           │
│  Check slug     │
└────────┬────────┘
         ▼
┌─────────────────┐
│  Store to DB    │
└─────────────────┘
```

### Generated Content Format Requirements

| Content Type | Output Format | Layout Model | Component Library |
|-------------|---------------|-------------|-------------------|
| Product | Structured fields | N/A (form data) | shadcn-svelte |
| KB Article | Multi-section layout | Vertical + Horizontal (grids, sidebars, tables, multi-column) | svelte-shadcn |
| Landing Page | Multi-section layout | Vertical + Horizontal (hero, grids, cards, CTAs, multi-column) | svelte-shadcn |
| Blog | Article layout | **Vertical only** (linear flow, top-to-bottom) | svelte-shadcn |

**Layout Constraints:**
- **Blog**: Content flows strictly top-to-bottom. Can use rich components (images, quotes, callouts, data tables, lists, code blocks) but only in vertical stack. No side-by-side or multi-column layouts.
- **Landing Page / KB**: Free multi-directional layout. Can use grids, sidebars, card rows, split sections, hero with columns, etc.

**Markdown output is FORBIDDEN for any user-facing page content**

---

## Design System

### Typography

| Element | Font |
|---------|------|
| Body | Almarai (Arabic-supporting sans-serif) |
| Headings | Space Grotesk (geometric sans-serif) |

### Color Palette

**Light Mode**: Warm tones (hue 55-85), emerald green primary (hue 155)
**Dark Mode**: Deep navy (hue 250), bright emerald primary (hue 155)

### Component Rules

- All UI primitives from shadcn-svelte (`#lib/components/ui/`)
- Cards: `bg-card shadow-sm` (NO border)
- Buttons: `rounded-lg`, primary/secondary/outline/ghost variants
- Mobile tab bar: Telegram-style, `min(90vw, 360px)`, sticky bottom

### Layout

- All pages: `max-w-7xl mx-auto`
- Admin/Supplier: Sidebar (w-60) + Content
- Mobile-first responsive: <640px mobile, 640-1023px tablet, ≥1024px desktop

---

## Caching Strategy (Cloudflare Workers)

| Content Type | Cache Header |
|-------------|-------------|
| Static assets (fonts, icons) | `immutable` (1 year) |
| Reference content (KB, market guides) | `s-maxage=86400` |
| Listings (products, suppliers, blog) | `s-maxage=3600` |
| Homepage | `s-maxage=1800` |
| Auth pages | `no-store` |
| API verify | `s-maxage=120` |
| API chat | `no-store` |

---

## Backlog — Future Features

### Paid Services

- **Promotion**: Search ranking boost, featured listings, category/product top placement
- **AI Services**: Market analysis reports, competitor analysis, product photography optimization, SEO optimization
- **Trade Services**: Escrow (2-5%), factory inspection, product testing, logistics booking, customs documents
- **Content**: Professional photography, product video production, multilingual translation
- **Platform**: Custom domain, API access, dedicated account manager, verified badge, premium data reports

### Technical

- Multi-language (Arabic RTL + Indonesian) — Paraglide.js infrastructure ready
- RSS feed for blog/KB
- Server-side search optimization
- PWA offline support
- Push notifications
- CSV import/export for products/suppliers
- Bulk operations
- Audit logging
