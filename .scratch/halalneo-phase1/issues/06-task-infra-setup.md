# Cloudflare + GitHub infra setup
Type: task
Status: claimed
Blocked by: none

## Question

Provision the Phase-1 infrastructure so everything else has a place to run. The repo is currently **not** a git repo.

- `git init`, create GitHub repo `halalneo` (owner = user's account), connect origin, initial commit.
- Create Cloudflare D1 database and R2 bucket; wire bindings (`DB`, `R2`) into `wrangler.jsonc`.
- Verify `wrangler types`, `drizzle-kit` push works against D1, and `vite dev`/`wrangler dev` run.
- Confirm deploy target: free `workers.dev` subdomain (`halalneo.workers.dev`), no custom domain.
- Record any credentials/secrets created and where they live (`.env`, wrangler secrets).

This is a **task** (provisioning to unblock decisions) — the agent drives it alone where possible; hands the user a checklist for anything needing their Cloudflare/GitHub accounts.
