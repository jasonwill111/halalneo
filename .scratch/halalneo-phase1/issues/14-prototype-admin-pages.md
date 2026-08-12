# Admin backend pages

Type: prototype
Status: open
Blocked by: 13

## Question

Prototype the `/admin` backend screens on example data: staff login, dashboard, **user management** (buyers/sellers), **supplier approval** (pending → active/reject), **SKU/category management**, and **knowledge content** (editor role).

- Layout: sidebar + centered content, `max-w-7xl`, light/dark, mobile-first, all svelte-shadcn components.
- Show the approval queue and the review action clearly (this is the Phase-1 "killer feature" of the admin).
- Staff role gating per screen (super admin / admin / editor see different sections).
- Not functional auth yet — the screens are prototypes to react to (auth/RBAC is ticket 13; wiring is implementation).

Blocked by ticket 13 (RBAC defines what each screen can do). Use `/prototype`.
