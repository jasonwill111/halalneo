# Knowledge base search approach

Type: grilling
Status: open
Blocked by: 07

## Question

Decide the full-text search approach for the knowledge base (user chose: yes, lightweight client-side search).

- Which library/approach (e.g. FlexSearch, MiniSearch, Lunr, or a hand-rolled index over the article corpus). Constraint: client-side, no external service, content is static Markdown in repo.
- Index build strategy: build-time vs runtime (SvelteKit + Cloudflare; build-time precomputed index is preferred for Workers).
- UX scope: where search lives (per-section? global), result surface, and mobile behavior.

Blocked by ticket 07 (content model defines what gets indexed). Bring `/grilling` and `/prototype` if a search result mockup helps decide.
