# Supplier approval workflow

Type: grilling
Status: open
Blocked by: 11

## Question

Decide the supplier (Merchant) approval workflow. User decision: a seller-registered merchant starts **pending** and only becomes publicly visible after an `admin` approves.

- State machine: `pending` → `active` | `rejected` (can a rejected merchant resubmit?). Where does state live — on Merchant row or a workflow/audit table?
- Who sees what: buyers see only `active` merchants/SKUs; seller sees own status; admin reviews in `/admin`.
- Review UX in the admin backend (the approval screen itself is ticket 14; this ticket decides the workflow/state semantics).
- Notifications to the seller on approval/rejection — in Phase-1?

Blocked by ticket 11 (registration must exist to feed the workflow) and by 09 (Merchant table). Bring `/grilling` + `/domain-modeling`.
