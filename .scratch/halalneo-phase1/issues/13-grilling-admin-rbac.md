# Admin RBAC & /admin access
Type: grilling
Status: open
Blocked by: 06

## Question

Decide the staff role model and `/admin` access control. User-confirmed matrix:

| Role | Responsibilities |
|---|---|
| super admin | manage admin accounts, global config |
| admin | approve suppliers (pending→active), manage users (buyers/sellers), manage SKUs/categories |
| editor | maintain knowledge-base content (articles/glossary) |

- How staff roles are represented in the data model (separate `admin`/staff table vs role field on User) — a regular User can never access `/admin`.
- Access control mechanics: route guards on `/admin/**`, server-side enforcement, and what the `/admin` login looks like (staff credentials, separate from public login).
- What each role can and cannot do — enough granularity for Phase-1 without overbuilding (no org/multi-tenancy).

Blocked by ticket 06 (D1). Bring `/grilling` + `/domain-modeling`; better-auth skills have role/admin-plugin guidance.
