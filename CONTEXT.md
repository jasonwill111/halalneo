# HalalNeo

HalalNeo is a halal trade platform. Phase 1 ships a halal trade knowledge base plus the structural foundation of a B2B marketplace (categories, merchant pages, SKU pages, buyer/seller accounts, and an admin backend).

## Language

**User**: An account on the platform, identified by email and password.
_Avoid_: account, customer, member

**Buyer**: A User whose role is `buyer` — a company or individual sourcing halal products.
_Avoid_: purchaser, customer, client

**Seller**: A User whose role is `seller` — operates a Merchant profile on the platform.
_Avoid_: vendor, supplier user

**Merchant**: The seller-side business entity displayed on the platform; the buyer-facing label is "Supplier".
_Avoid_: store, company, seller entity

**businessType**: A Merchant's mutually-exclusive business classification. Values: `manufacturer`, `wholesaler`, `trader`. Formerly included `supplier`, renamed to `trader` to avoid clashing with the generic "supplier" label.
_Avoid_: supplier type, merchant category, business category

**isBrand**: A boolean on Merchant marking brand-owner status. Orthogonal to `businessType` — a brand can be any of the three business types.
_Avoid_: brand type, brand tier

**Category**: A node in the product taxonomy tree; SKUs are filed under categories and category pages list them.
_Avoid_: taxonomy, collection, group

**SKU**: A sellable product unit offered by a Merchant; the atomic item shown on a SKU detail page.
_Avoid_: product, item, listing

**Halal certification**: Certification attesting a product or facility is halal, issued by a recognised certifying body.
_Avoid_: halal certificate (ambiguous), compliance

**Certifying body**: An organisation authorised to issue halal certifications (e.g. MUI, JAKIM, GAC, SFDA).
_Avoid_: halal authority, certification agency

**Knowledge base**: The public content site covering halal trade topics (certification, trade process, logistics, packaging, market guides, glossary).
_Avoid_: blog, docs, wiki

**Article**: A unit of knowledge-base content, stored as Markdown in the repo and organised under a section.
_Avoid_: post, entry, page

**Section**: A top-level column of the knowledge base (e.g. Halal Certification, Trade & Sourcing, Country / Market Guides).
_Avoid_: category, channel, hub

**Glossary**: The knowledge base's terminology component.
_Avoid_: dictionary, terms

**Admin**: A staff account that manages the platform. Staff roles are `super admin`, `admin`, `editor`; a regular User can never access the admin backend.
_Avoid_: back office, management account
