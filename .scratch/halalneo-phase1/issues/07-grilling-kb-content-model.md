# Knowledge base content model
Type: grilling
Status: open
Blocked by: none

## Question

Decide how knowledge-base content is authored, stored, and rendered.

- Markdown frontmatter schema for articles (title, slug, section, tags, summary, updatedAt, author?).
- How the 6 sections (Halal Certification, Trade & Sourcing, Logistics & Supply Chain, Packaging & Labeling, Country / Market Guides, Glossary) map to routes and files.
- How the Glossary works (term definitions, linking from articles) — reuses `CONTEXT.md` language or separate content?
- i18n-ready storage: English now, but structured so future locales can be added (e.g. per-locale content dirs vs single dir + locale frontmatter). Do not build other locales.
- Rendering approach (e.g. mdsvex vs manual md parsing) and whether the research findings in tickets 01–05 will be authored into this structure.

This ticket is unblocked and decision-shaped — bring `/grilling` and `/domain-modeling`, and reference `docs/agents/domain.md` (single-context layout).
