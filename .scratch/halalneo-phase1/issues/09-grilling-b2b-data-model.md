# B2B data model

Type: grilling
Status: open
Blocked by: 06

## Question

Decide the D1 (drizzle) schema for the B2B structure: Category, Merchant, SKU — plus the seed/example data strategy.

- **Category**: taxonomy tree (top-level product categories, e.g. Meat & Poultry, Dairy, Beverages, Processed Foods, Cosmetics, Supplements…). Depth? Is Category shared between knowledge base and marketplace, or separate?
- **Merchant**: fields for company identity, `businessType` ∈ {manufacturer, wholesaler, trader}, `isBrand` boolean, approval state (`pending`/`active`/rejected), country, contact, certification info (or a related Certification table).
- **SKU**: product name, category, description, images, unit, min order quantity, country of origin, cert status. Price — in or out of Phase-1? (User scope: "display-type B2B site" — confirm whether SKUs carry price yet.)
- Relationship shape (one Merchant → many SKUs; SKU → one Category) and example seed data to exercise pages.
- How this maps onto the existing drizzle `schema.ts` (currently only a placeholder `task` table) and Better Auth's `User` table.

Blocked by ticket 06 (D1 must exist to develop against). Bring `/grilling` + `/domain-modeling`; vocab in `CONTEXT.md`.
