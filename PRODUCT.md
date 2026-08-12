# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences, equally first-class:

- **Buyers** — B2B procurement and food-business professionals sourcing halal products across borders. Their job: find genuinely certified suppliers and verify the certification before committing to a shipment. (Dialog: `Buyer` in `CONTEXT.md`.)
- **Sellers / Suppliers** — certified manufacturers, wholesalers and traders who need to surface their halal certification to qualified buyers and stand out against unverified competitors. (Dialog: `Seller` for the user, `Merchant` for the business entity, buyer-facing label `Supplier` in `CONTEXT.md`.)
- **Staff** — internal `super admin` / `admin` / `editor` accounts managing users, approving suppliers and curating content via the `/admin` backend. Regular Users can never access the admin backend.

## Product Purpose

HalalNeo is a halal trade platform that makes halal sourcing trustworthy. Phase 1 delivers a researched halal trade **knowledge base** plus the structural foundation of a **B2B marketplace** — the Category / Merchant / SKU model, buyer & seller registration, and Category / Merchant / SKU / Account pages running on curated example data — all behind an admin backend. Success for Phase 1 is a live, coherent, demonstrably useful website at `halalneo.jasonwill.workers.dev` that proves the product and the craft.

## Positioning

HalalNeo's defensible mechanism is **certification intelligence**: it turns the fragmented halal certification patchwork (dozens of authorities, standards that do not transfer across markets, hard-to-verify certificates) into readable, verifiable trade information — certifying body, standard, and scope surfaced on every supplier profile and SKU. That claim is the thing a neighboring directory or marketplace cannot truthfully copy.

Confirmed growth path, in this order: **knowledge base first (authority) → marketplace as suppliers join → halal trade platform.** The knowledge base is not a blog; it is the entry point and the trust layer that the marketplace scales on top of.

## Operating Context

- Cross-border B2B halal trade: ten-stage sourcing journey, Incoterms 2020, certification treated as a shipment/batch-specific commercial document matching invoice and BOL verbatim.
- Certification is the recurring object of trust: scope, recognition lists, expiry and audit history are what buyers actually check (see due-diligence research).
- Content is authored as Markdown edited via git (no CMS backend for content).
- Deployment is a Cloudflare Worker on the free `workers.dev` subdomain (no custom domain in this phase) with D1 (drizzle, schema ready) and R2 (binary assets) wired.
- Phase 1 runs on curated **example/demo data**; real supplier/SKU volume is intentionally future work. Nothing about the deployed data should be presented as real market statistics.

## Capabilities and Constraints

**In Phase 1:** knowledge base (6 sections + glossary + full-text search) with real researched content; marketplace structure — Categories, Merchants, SKUs with detail pages; buyer/seller registration with role-based `/account`; self-serve `request information` affordances; `/admin` backend. Live demo auth for buyer/seller flows.

**Hard constraints:**
- **Design constraints (user-committed):** green (halal) palette; content centered with `max-w-7xl`; light/dark toggle on all pages (public + admin); mobile-first and mobile-responsive on mobile / tablet / desktop; every UI component is a svelte-shadcn component — no other component libraries.
- **i18n:** English only for now, but the `/en/` URL architecture must stay ready for more languages. Do not build other locales.
- **Roles:** `User.role` ∈ {`buyer`, `seller`}; `Merchant.businessType` ∈ {`manufacturer`, `wholesaler`, `trader`} (mutually exclusive) + `isBrand` (orthogonal boolean); `reseller` deliberately excluded.
- **Supplier approval:** a `Merchant` starts `pending` on seller registration; an `admin` reviews it to `active` (publicly visible) or rejects.
- **Tech:** SvelteKit 2 + Svelte 5, Tailwind v4, better-auth (email/password, sveltekitCookies + D1 adapter), drizzle-orm, lucide icons, paraglide. TypeScript.
- **Vocabulary is binding:** `CONTEXT.md` defines the domain language (Buyer, Seller, Merchant, Category, SKU, Halal certification, Certifying body, Knowledge base, Article, Section, Glossary, Admin) — use it and avoid listed anti-terms.

**Undecided / deferred product facts (recorded, not invented):** custom domain strategy; buyer-side features beyond registration (favorites, inquiry) → Phase 2; seller self-service dashboard → Phase 2; buyer-seller messaging → Phase 2; whether/when the marketplace moves from example data to real data; R2 usage details (merchant logos, SKU images, article images); SEO strategy.

## Brand Commitments

- Name: **HalalNeo**, with the green crescent-and-star mark (`src/lib/assets/favicon.svg`).
- Green halal-responsive colour palette, light and dark themes of equal quality; radius, spacing and centering conventions per the user design constraints above.
- Tagline established in product copy: **"Halal trade intelligence for buyers and suppliers."** Hero formulation: **"Source halal. Verify it. Ship it."** (three-beat, mirrors the Source → Verify → Ship workflow). About-page framing: verification-first, knowledge-not-noise, built-for-cross-border.
- Domain vocabulary in `CONTEXT.md` is a brand commitment; alternate terms are anti-terms to avoid — e.g. never "vendor", "store", "dictionary", "blog".

## Evidence on Hand

- `CONTEXT.md` — approved domain vocabulary (binding).
- `.scratch/halalneo-phase1/map.md` — scope, roles, constraints, decisions, out-of-scope list.
- Research (real, sourced): `legacy knowledge base research` under `.scratch/halalneo-phase1/research/` — halal certification landscape, trade & sourcing process, logistics, packaging/labeling, country/market guides (8 markets, 3 recognition tiers; Indonesia's Oct 2026 mandatory-expansion event).
- Curated demo dataset: `src/lib/data/` — 12 SKUs, 7 merchants (6 active), 7 categories, 6 KB sections, 15 KB articles, 30 glossary terms, 8 certifying bodies (JAKIM, BPJPH/MUI, MUIS, SFDA, MOIAT, IFANCA, GIMDES, SANHA).
- Live prototype at `http://localhost:5173/` (dev) and deployed `halalneo.jasonwill.workers.dev`.
- What must NOT be fabricated: real market statistics beyond the demo data, customer testimonials, pricing/licensing/deployment sales claims, absorbed authentication claims (auth is demo/localStorage in the live prototype; better-auth D1 path is wired but not the active store).

## Product Principles

1. **Certification intelligence is the product.** Every supplier and SKU must surface certifying body, standard and scope; verification information is first-class, not metadata.
2. **Knowledge leads; marketplace scales.** The knowledge base earns authority first; supplier growth and halal-trade features layer on top as the audience grows.
3. **Two-sided by design.** Buyers and sellers are equally primary; flows for both are first-class and role-consistent.
4. **Trust through verification, not claims.** Nothing on the platform overstates what is real; demo data is labelled demo, and certificates point back to the issuing bodies.
5. **Say it plainly, in the domain's words.** Copy uses `CONTEXT.md` vocabulary, is English-only, and matches the verified tone — precise and trade-professional.

## Accessibility & Inclusion

No product-specific accessibility requirement or user cohort need has been established beyond the committed responsive (mobile/tablet/desktop) and light/dark parity design constraints. Do not invent an a11y requirement that is not evidenced.