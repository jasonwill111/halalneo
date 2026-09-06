-- Finish the lone draft post: full practical body + publish it.
UPDATE pages SET body='Most buying teams discover an expired supplier certificate at the worst possible moment — during customs clearance, or when a retailer asks for the file. A certification vault is a simple system: one place where every supplier certificate lives, with scope, expiry and issuing body recorded alongside the file itself. This workflow sets one up in an afternoon.

## Start with the four fields that matter

For each supplier certificate, record the certifying body (for example JAKIM, BPJPH or MUIS), the standard it certifies against (for example MS 1500:2019), the scope statement (which products and sites it covers), and the expiry date. The file itself — usually a PDF — is the fifth item. Anything missing one of these five is not a record, it is a liability: scope mismatches cause most rejections, so verify scope the way our [due-diligence checklist](/knowledge-base/due-diligence/verifying-supplier-certification) describes.

## Folder structure that survives staff turnover

Organise by supplier, then by certificate: `Supplier / Body-Year / certificate.pdf`. Add a single index file — a spreadsheet is fine — with one row per certificate and columns for the four fields plus the file path. Name files consistently: `supplier-body-expiry.pdf` (for example `nusantara-jakim-2027-03.pdf`) so an expired file is visible from the filename alone.

## Renewal diary: 90, 60, 30

Set reminders at 90, 60 and 30 days before each expiry. Ninety days is the moment to ask the supplier for the renewal timeline; sixty is the escalation point if nothing has moved; thirty is the stop-buy decision point for affected SKUs. Suppliers renew on their schedule, not yours — the diary converts their delay into your lead time.

## Verify, don''t just file

Filing a certificate is not verification. For each new certificate, check three things: the body appears on a recognised list (JAKIM''s foreign-body list is a good reference), the scope covers the exact products you buy, and the dates are valid. Record the verification date in the index. Our [verification tool](/verify) cross-references certificates against supplier and product records on HalalNeo.

## Review cadence

Revisit the vault quarterly: confirm renewals landed, archive superseded certificates instead of deleting them (audit trails matter), and drop suppliers who repeatedly let certification lapse — it predicts shipment problems. A vault with fifty current certificates beats a shared drive with five hundred unlabelled PDFs.',
status='published', published_at=1788900000, updated_at=1788900000 WHERE slug='how-to-build-a-certification-vault';
