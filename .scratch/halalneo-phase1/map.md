# HalalNeo Phase-1 — Wayfinding Map

## Destination

A live Phase-1 halal trade website on Cloudflare: a **knowledge base** with real researched content (6 sections + glossary + search), **plus** the structural foundation of a B2B marketplace — the Category / Merchant / SKU data model, buyer/seller registration, and Category / Merchant / SKU detail pages running on example data, all behind an `/admin` backend (super admin / admin / editor) that manages users, approves suppliers, and manages SKUs. The map is done when Phase-1 is implemented and deployed to `halalneo.workers.dev`.

## Notes

- **Domain**: halal trade B2B. This map carries **execution** (user override — build Phase-1, not just decisions): decision tickets unlock implementation tickets that ship working code.
- **Consult**: `CONTEXT.md` for vocabulary, `docs/agents/*` for tracker/triage/domain conventions, `/grilling` and `/domain-modeling` for decision tickets, `/prototype` for page design tickets, shadcn-svelte + Tailwind (repo already has Tailwind v4) for all UI.
- **Design constraints (user)**: green (halal) palette; all content centered with `max-w-7xl`; light/dark toggle on all pages (public + admin); mobile-first & mobile-responsive everywhere; every UI component is a svelte-shadcn component. Do not use other component libs.
- **i18n**: English only for now (frontend + content); paraglide structure already in the repo — keep URL `/en/` prefix architecture so more languages can be added later. Do not build other locales yet.
- **Data**: D1 via drizzle (already wired). Content as Markdown in the repo (no CMS backend for content — editors edit via git). R2 for binary assets (images).
- **Infra**: Cloudflare Workers on free `workers.dev` subdomain, D1, R2, GitHub repo `halalneo` (to be created — not yet a git repo). No custom domain for now.
- **Auth**: better-auth (email/password) already integrated with sveltekitCookies + D1 adapter. Public Users are `buyer` or `seller`; staff (super admin / admin / editor) are separate. Regular users cannot access `/admin`.
- **Roles**: `User.role` ∈ {`buyer`, `seller`}. Merchant carries `businessType` ∈ {`manufacturer`, `wholesaler`, `trader`} (mutually exclusive) + `isBrand` (orthogonal boolean).
- **Supplier approval**: Merchant starts `pending` on seller registration; `admin` reviews → `active` (publicly visible) or rejected.

## Decisions so far

<!-- the index — one line per closed ticket: enough to judge relevance, then zoom the link for the detail the ticket holds -->

- [Halal certification landscape](issues/01-research-halal-certification.md) — patchwork regime, no single standard; dominant trio JAKIM/MUI-BPJPH/MUIS + Gulf GSO 2055; certs don't transfer across markets; ~4–7wk, $250–7k/yr; buyers want scope, recognition, verifiable cert numbers. Findings: `research/01-halal-certification.md`.
- [B2B trade & sourcing process](issues/02-research-trade-process.md) — 10-stage sourcing journey; halal certificate is a shipment/batch-specific commercial doc matching invoice/BOL verbatim under L/C. Incoterms 2020 + payment risk spectrum. Findings: `research/02-trade-process.md`.
- [Halal logistics & supply chain](issues/03-research-logistics.md) — halal logistics = certified process discipline (segregation, traceability, temp control), not a label; MS 2400 / HAS 23000-5 / SMIIC 17; destination customs recognition is the common rejection point. Findings: `research/03-logistics.md`.
- [Packaging & labeling requirements](issues/04-research-packaging-labeling.md) — two layers: general labeling law (Codex CXS 1-1985) + halal rules (CAC/GL 24-1997); regulated logos vs unregulated claims; haram/najis materials banned. Findings: `research/04-packaging-labeling.md`.
- [Country & market guides](issues/05-research-country-market-guides.md) — 8 markets in 3 recognition tiers; Indonesia's Oct 2026 mandatory expansion is the biggest market event; recognised cert = listing precondition. Findings: `research/05-country-market-guides.md`.

_Settled during charting (in `CONTEXT.md`): Merchant classification (`businessType` + `isBrand`), User roles buyer/seller, staff roles, destination boundary._

## Not yet specified

<!-- in-scope fog you can't ticket yet; graduates as the frontier advances -->

- Custom domain strategy (halalneo.com vs worker.dev) — deferred to post-Phase-1.
- Buyer-side account features beyond registration (favorites, contact supplier, inquiry) — likely Phase-2.
- Merchant/SKU content seeding volume & who writes it (editor via git).
- R2 usage details (merchant logos, SKU images, article images) — ticket when image handling is wired.
- SEO strategy (sitemap, meta, structured data) — ticket after content model settles.
- How buyers contact sellers (inquiry flow) — likely out of scope for Phase-1, confirm later.
- Halal certification _workflow_ (merchants apply for certification through the platform) vs. certification as informational field — the latter is in scope; the former is Phase-2.

## Out of scope

<!-- work consciously ruled out of this effort; never graduates -->

- Full B2B commerce: transactions, payment/escrow, ordering, check out.
- Seller-side dashboard (merchants managing their own listings) — Phase-2.
- Buyer-seller messaging / inquiry system — Phase-2.
- Multi-language content (only the `/en/` architecture is kept ready).
- B2C retail / consumer marketplace.
- Custom domain purchase.
- `reseller` businessType (dropped deliberately — B2C connotation; see `CONTEXT.md`).
