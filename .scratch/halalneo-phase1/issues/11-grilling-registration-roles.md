# Registration, roles & auth
Type: grilling
Status: open
Blocked by: 06

## Question

Decide how registration and roles work with the existing Better Auth + D1 setup.

- **Registration flow**: public signup lets the user choose `buyer` or `seller`. Seller registration additionally captures merchant info (company name, `businessType`, `isBrand`, country, contact). Where do these extra fields live — on the User row or a separate Merchant table? (Merchant table decided in ticket 09; this ticket decides the signup UX + linkage.)
- **Role modeling**: how `role` is stored and enforced with Better Auth (custom `role`/`additionalFields`, or the organization/admin plugin? Do not overbuild — Phase-1 needs buyer/seller only, plus staff roles from ticket 13).
- **Session/guardrails**: what a logged-in user sees (buyer vs seller), and that regular users can never reach `/admin`.
- Email verification / welcome flow: in or out of Phase-1?

Blocked by ticket 06 (D1). Bring `/grilling` + `/domain-modeling`; the better-auth skills have current plugin guidance.
