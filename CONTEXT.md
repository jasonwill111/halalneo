# HalalNeo

HalalNeo is a halal trade intelligence platform connecting international buyers with certified halal suppliers. Phase 1 ships a comprehensive knowledge base, B2B marketplace (categories, products, suppliers, buyer/seller accounts), AI-powered tools, and an admin backend for content management.

## Language

**User**: An account on the platform, identified by email and password.
_Avoid_: account, customer, member

**Buyer**: A User whose role is `buyer` — a company or individual sourcing halal products.
_Avoid_: purchaser, customer, client

**Seller**: A User whose role is `seller` — operates a Supplier profile on the platform.
_Avoid_: vendor, supplier user

**Supplier**: A seller-side business entity on the platform. Public detail pages live at `/supplier/[slug]` (singular); `/supplier/onboarding`, `/supplier/login`, `/supplier/dashboard` etc. are portal routes that take precedence over the dynamic detail slug — company slugs matching these are rejected at application time.
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

### Pages Implemented (72 routes)

| Section | Pages | Status |
|---------|-------|--------|
| Homepage | `/` | ✅ Hero carousel, stats, categories, featured products/suppliers, KB preview |
| Products | `/products` (listing), `/product/[slug]` (detail) | ✅ Full catalog with detail pages (image, price, specs, certifications, FAQs, resources); old `/products/[slug]` 301s to `/product/[slug]` |
| Suppliers | `/suppliers` (listing), `/supplier/[slug]` (detail) | ✅ Directory with profiles (cover, certifications, products, trade terms); old `/suppliers/[slug]` 301s to `/supplier/[slug]`; detail page uses the root layout |
| Categories | `/categories` (listing), `/category/[slug]` (detail) | ✅ Product taxonomy; old `/categories/[slug]` 301s to `/category/[slug]` |
| Knowledge Base | `/knowledge-base`, `/knowledge-base/[section]`, `/knowledge-base/[section]/[article]` | ✅ 6 sections, 125 articles (Markdown bodies, rendered + TOC) |
| Blog | `/blog`, `/blog/[slug]` | ✅ 8 posts (7 published + 1 evergreen) |
| Market Guides | `/market-guides`, `/market-guides/[country]` | ✅ 11 countries (Indonesia, Malaysia, UAE, Saudi Arabia, Türkiye, Pakistan, USA, Thailand, Singapore, Bangladesh, Egypt) |
| Glossary | `/glossary` | ✅ 83 terms, A-Z letter-pill pagination + search |
| Trade Shows | `/trade-shows`, `/trade-shows/[id]` | ✅ 20 events with region filter + pagination, detail pages with Event JSON-LD |
| Certifying Bodies | `/certifying-bodies`, `/certifying-bodies/[slug]` | ✅ 15 bodies with recognition data |
| Service Providers | `/service-providers`, `/service-providers/[slug]` | ✅ 14 providers |
| Verify | `/verify` | ✅ Certificate verification tool |
| Tools hub | `/tools` | ✅ 6 tools directory |
| AI Chat | `/tools/ai-chat` | ⏸️ Coming soon teaser page |
| Ingredient Checker | `/tools/ingredient-checker` | ✅ AI ingredient analysis |
| Certification Cost | `/tools/certification-cost` | ✅ Cost estimator (7 certifiers × 6 categories × 4 sizes) |
| Landed Cost | `/tools/landed-cost` | ✅ CIF+duty+VAT+clearance+cert amortisation calculator |
| RFQ Builder | `/tools/rfq-builder` | ✅ RFQ text generator (copy/download/**publish to Buying Requests**) |
| Buying Requests | `/rfqs`, `/rfqs/[id]`, `/rfqs/new` | ✅ Public RFQ board (login to post, 1/week free quota, supplier quote dialog) |
| Quick Deals | `/promotions`, `/promotions/[id]` | ✅ Supplier clearance board (member publish, 1/week free quota) |
| Success Stories | `/success-stories`, `/success-stories/[slug]` | ✅ Editorial case studies (admin publish at `/admin/stories`) |
| Search | `/search` | ✅ Full-text search across articles, glossary, suppliers, products |
| Pricing | `/pricing` | ✅ 4-tier pricing + Brand URL add-on |
| About | `/about` | ✅ Mission, milestones, team |
| FAQ | `/faq` | ✅ Accordion FAQ with search |
| Contact | `/contact` | ✅ Contact form |
| Auth | `/login`, `/register`, `/supplier/login` | ✅ Buyer + supplier auth (demo/localStorage) |
| Admin Auth | `/admin/login`, `/api/auth/*` | ✅ Real better-auth (email/password, D1) gated by `ADMIN_EMAILS` allowlist |
| Buyer Account | `/account`, `/account/profile`, `/account/saved`, `/account/inquiries` | ✅ Dashboard + 3 sub-pages |
| Supplier Portal | `/supplier/onboarding`, `/supplier/dashboard`, `/supplier/products`, `/supplier/orders`, `/supplier/manage` | ✅ 6 pages |
| Admin | `/admin/*` | ✅ 14 pages (dashboard, users, products, suppliers, categories, blog, knowledge-base, glossary, certifying-bodies, service-providers, inquiries, pages, ai-tools, settings) |

### API Endpoints (40 files)

| Endpoint | Methods | Purpose |
|----------|---------|---------|
| `/api/products` | GET, POST | List/create products (query-keyed cache; GET defaults `status=active`) |
| `/api/products/[slug]` | GET, PUT, DELETE | CRUD product (GET 404s non-active for anonymous) |
| `/api/suppliers` | GET | List suppliers (query-keyed cache; GET defaults `status=active`) |
| `/api/suppliers/[slug]` | GET | Supplier detail (404s non-active for anonymous) |
| `/api/categories` | GET, POST | List/create categories (GET defaults `status=active`) |
| `/api/categories/[slug]` | GET | Category detail (404s inactive for anonymous) |
| `/api/knowledge-base` | GET, POST | List/create KB articles (GET defaults `status=published`) |
| `/api/knowledge-base/[slug]` | GET | KB article detail (404s unpublished for anonymous) |
| `/api/knowledge-base/sections` | GET | KB sections |
| `/api/blog` | GET | List blog posts (defaults `status=published`) |
| `/api/blog/[slug]` | GET | Blog post detail (404s unpublished for anonymous) |
| `/api/certifying-bodies` | GET | List certifiers (defaults `status=active`) |
| `/api/certifying-bodies/[id]` | GET | Certifier detail (404s inactive for anonymous) |
| `/api/service-providers` | GET | List service providers (defaults `status=active`) |
| `/api/service-providers/[slug]` | GET | Provider detail (404s inactive for anonymous) |
| `/api/market-guides` | GET | List market guides (defaults `status=active`) |
| `/api/market-guides/[slug]` | GET | Guide detail (404s inactive for anonymous) |
| `/api/trade-shows` | GET | List trade shows (defaults `status=active`; `?scale=` filters scale) |
| `/api/trade-shows/[id]` | GET | Show detail (404s inactive for anonymous) |
| `/api/search` | GET | Federated search (capped 55 rows, query-keyed cache; suppliers+products filtered `status=active`) |
| `/api/inquiries` | GET, POST | POST creates inquiry (rate-limited, public); GET requires session |
| `/api/rfqs` | GET, POST | Buying-requests board (GET defaults `status=active`); POST requires login, 1/week free quota |
| `/api/rfqs/[id]` | GET | RFQ detail (404s non-active for anonymous) |
| `/api/promotions` | GET, POST | Deals board (GET defaults `status=active`); POST requires supplier membership, 1/week/supplier quota |
| `/api/promotions/[id]` | GET | Deal detail (404s non-active for anonymous) |
| `/api/follows` | GET, POST, DELETE | Follow/unfollow suppliers (login); GET `?countFor=` public count |
| `/api/supplier-updates` | GET, POST | Supplier posts feed (GET defaults `status=active`); POST requires membership, 1/week/supplier quota |
| `/api/supplier-memberships` | GET | My supplier memberships (login) |
| `/api/views` | GET, POST | POST records detail views (public beacon, increments denormalized counters); GET supplier analytics (member-only) |
| `/api/success-stories` | GET, POST | Stories (GET defaults `status=published`, `?status=all` admin-only uncached); POST admin-only |
| `/api/supplier-applications` | GET, POST | Supplier onboarding: POST creates pending supplier + inquiry record (rate-limited, public); GET requires session |
| `/api/verify` | GET | Certificate verification search (suppliers+products filtered `status=active`) |
| `/api/vitals` | POST | RUM web-vitals ingestion (Analytics Engine; 503 until binding enabled) |
| `/api/chat` | POST | AI chat (Mastra agent, auth required) |
| `/api/auth/*` | GET, POST | better-auth handlers (sign-up/sign-in/sign-out/session); never cached |
| `/api/pages` | GET | CMS pages |
| `/api/pages/[slug]` | GET | CMS page detail |
| `/api/settings` | GET | Site settings |
| `/api/media/[key]` | GET | Media retrieval (R2 + 304 support) |
| `/api/media/upload` | POST | Media upload |

### Database Schema (19 tables, 50 indexes in production)

| Table | Purpose | Key |
|-------|---------|-----|
| `suppliers` | Supplier profiles with certifications JSON | slug |
| `products` | Product catalog | slug |
| `categories` | Product taxonomy | slug |
| `certifyingBodies` | Halal certification organizations (15 rows) | id |
| `knowledgeBase` | KB articles (125 rows, Markdown bodies) | slug |
| `pages` | Landing pages + blog posts + glossary | slug |
| `marketGuides` | Country guides (11 rows, `status='active'`) | slug |
| `tradeShows` | Exhibition calendar (20 rows) | id |
| `serviceProviders` | Service provider profiles | slug |
| `inquiries` | Buyer inquiries | id |
| `buyingRequests` | Public RFQ board (quota: 1/week free) | id |
| `promotions` | Quick-deal offers (quota: 1/week/supplier) | id |
| `supplierMembers` | User↔supplier publish rights | (userId, supplierSlug) |
| `follows` | Buyer follows on suppliers | (userId, supplierSlug) |
| `supplierUpdates` | Supplier posts feed (quota: 1/week/supplier) | id |
| `pageViews` | Analytics beacon rows (supplier|product) | id |
| `successStories` | Editorial case studies (draft|published) | slug |
| `products_fts` / `suppliers_fts` | FTS5 side tables + sync triggers (replaces LIKE scans on unbounded tables) | rowid |
| `media` | R2 media files | id |
| `siteSettings` | KV site settings | key |

List-query discipline: `limit` ≤ 100 + column projection on every list
endpoint; query-dependent results use explicit `queryCacheKey(url)`
(path-only keys merge filter combos); every WHERE column is covered
by a D1 index; `LIKE '%x%'` scans only on tables < 500 rows.

---

## Roadmap (decided 2026-09-11, B2B competitive review)

| # | Feature | Shape | Status |
|---|---------|-------|--------|
| 1 | Buying Requests (RFQ list) | Public list; posting requires login; quota 1 free/week (paid tiers raise cap, never unlimited) | ✅ shipped 2026-09-11 |
| 2 | Quick Deals → seller `/promotions` | Inventory-clearance list; supplier-published, time-boxed, 1/week free | ✅ shipped 2026-09-11 |
| 3 | Follow suppliers + supplier updates | Follow extends favorites; supplier posts on own detail page, 1/week free | ✅ shipped 2026-09-11 |
| 4 | Supplier analytics dashboard | Profile/product view stats via `/api/views` beacon; reserved as paid feature | ✅ beacon + dashboard live 2026-09-11 |
| 5 | Site-level success stories | `/success-stories` + supplier-detail sections; admin publish at `/admin/stories` | ✅ shipped 2026-09-11 |
| 6 | Tenders board | Institutional procurement; admin-published only at launch | later |
| 7 | Trade show × supplier linkage | Exhibitor cross-links, "meet at" CTAs | backlog |
| 8 | In-site buyer↔supplier messaging | Deferred — reply-threading on inquiries first, only if leads prove demand | backlog |
| 9 | i18n expansion (`ms/id/ar`) | Paraglide infra ready, `['en']` only for now | backlog |
| 10 | Mobile app via Tauri 2.0 | Built on the website, future | backlog |
| 11 | Escrow/transactions | Only if the site enters the transaction flow | backlog |
| 12 | Blockchain certificates | Rejected for now — see note below | rejected |

Blockchain note: our trust bottleneck is ISSUER audit integrity
(JAKIM/MUI on-site audits), not document tampering — a chain faithfully
records whatever the issuer asserts (oracle problem). The 80/20 is
expiry enforcement (auto-suspend on cert expiry), verify-tool depth, and
certifier-direct feeds — all without a chain. Revisit only if we handle
transactions or certifiers expose anchorable APIs.

---

## Tech Stack

| Component | Technology |
|-----------|------------|
| Framework | SvelteKit 3.0.0-next.27 RC |
| UI | Svelte 5.57.0 + shadcn-svelte |
| CSS | Tailwind CSS 4.3.3 |
| Database | Cloudflare D1 (SQLite) |
| Storage | Cloudflare R2 |
| Auth | Better Auth 1.7.4 (schema regenerated — byte-identical to 1.7.3, no migration) |
| ORM | Drizzle ORM 0.45.2 + FTS5 side tables (`products_fts`, `suppliers_fts` with triggers) |
| AI | Mastra 1.65.0 + Vercel AI SDK 7.0.97 |
| Hosting | Cloudflare Workers (adapter-cloudflare 8.0.0-next.7) |
| Runtime | `compatibility_date 2026-09-09` + `nodejs_compat` (explicit). `new_module_registry` REJECTED 2026-09-10: hangs every request ~61s → 500 on adapter-8 output (preview-verified); revisit when Cloudflare sets a default date |
| Bindings | `cloudflare:workers` module via `#lib/server/bindings.ts` (adapter 8 removed `event.platform`) |
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

- All UI primitives from shadcn-svelte (`#lib/components/ui/`, bits-ui headless — never React shadcn). No raw `<button>/<input>/<select>/<textarea>/<table>` outside `ui/` internals.
- Shared site components in `#lib/components/site/` (stat-tile, filter-pills, collapsible-section, share-buttons, related-links, guide-hero, paginator, account-nav/admin-sidebar/supplier-sidebar) — reuse, never rewrite per page.
- Cards: `bg-card` + `ring-1 ring-foreground/10` (compact `p-3`/`p-4`); hover lift + shadow on linked cards.
- Buttons: `rounded-lg`, primary/secondary/outline/ghost variants.
- Mobile tab bar: glass dock, `min(90vw, 360px)`, sticky bottom.

### Responsive Density (mobile-first compact)

- Breakpoints: base (<640 mobile) / sm (≥640 tablet) / lg (≥1024 desktop).
- Listing grids are ≥2 columns on mobile (`grid-cols-2` up); card images capped (`aspect-[16/10]` or smaller); secondary descriptions hidden on mobile (`hidden sm:block`); titles truncate; padding steps down (p-2.5 vs sm:p-4).
- Detail pages stack single-column on mobile, two columns (content + sticky sidebar) on desktop; content containers start at `max-w-6xl`.
- Type scale: labels 10-11px, body 12-14px; no decorative text above text-base on mobile (hero titles excepted).
- Every listing page paginates via shared `site/paginator.svelte` (PAGE_SIZE matched to grid columns: 8/9/12 for 2/3/4 cols); filters reset to page 1.

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
| Listings (products, suppliers, blog, rfqs, promotions, stories) | `s-maxage=300` (matches worker TTL — longer edge TTL would serve data the worker already considers stale) |
| Homepage | `s-maxage=1800` |
| Auth pages + session-scoped GETs (inquiries, supplier-applications, follows, memberships, views, stories?status=all) | `no-store` (edge cache is anonymous-shared — public directive would leak private data) |
| API verify/search/rfq/promotions/stories | `s-maxage=120–300` |
| API chat | `no-store` |

---

## Backlog — Future Features

### Supplier Test Mode (live)

Supplier onboarding is open during a limited **supplier test mode**: all plan
tiers are free while the first suppliers are onboarded. Flow: public
`/supplier/onboarding` (3-step form) → POST `/api/supplier-applications`
creates a `suppliers` row (`status='pending'`) + an inquiry record as the
admin notification → admin reviews (dashboard shows pending applications)
→ admin approves or rejects from the dashboard review dialog (Approve sets
`status='active'`; Reject requires feedback and sets `status='rejected'`;
both persist feedback to `suppliers.admin_notes` via PUT
`/api/suppliers/[slug]`) → public `/suppliers/[slug]` goes live (only
`active` suppliers are publicly resolvable — the detail API 404s
non-active rows for anonymous requests and the listing filters
`status=active`). Products are uploaded by admin via
`/admin/products` on the supplier's behalf. No payment infrastructure yet;
paid plans will be announced with ≥30 days' notice. Pricing shown on
`/pricing` is the post-test-mode standard.

#### Known boundaries (not tested / not built)

- No email service: application confirmation is copy-only, nothing sent.
- `/supplier/*` portal (dashboard/products/orders) still runs demo data
  (hardcoded `nusantara-foods`); supplier self-service is future work —
  admin-mediated upload is the current model.
- Mobile verified via viewport screenshots only, no real-device testing.
- English only (i18n infrastructure ready but unused).
- No payment/subscription flows (none exist by design in test mode).

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
