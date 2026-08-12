# Cloudflare + GitHub infra setup

Type: task
Status: resolved
Blocked by: none

## Question

Provision the Phase-1 infrastructure so everything else has a place to run. The repo is currently **not** a git repo.

- `git init`, create GitHub repo `halalneo` (owner = user's account), connect origin, initial commit.
- Create Cloudflare D1 database and R2 bucket; wire bindings (`DB`, `R2`) into `wrangler.jsonc`.
- Verify `wrangler types`, `drizzle-kit` push works against D1, and `vite dev`/`wrangler dev` run.
- Confirm deploy target: free `workers.dev` subdomain (`halalneo.workers.dev`), no custom domain.
- Record any credentials/secrets created and where they live (`.env`, wrangler secrets).

This is a **task** (provisioning to unblock decisions) — the agent drives it alone where possible; hands the user a checklist for anything needing their Cloudflare/GitHub accounts.

## Resolution

**Git + GitHub**

- Repo initialized and pushed: `https://github.com/jasonwill111/halalneo` (origin, branch `main`).
- Git identity set repo-locally (`jasonwill111` / `jasonwill111@users.noreply.github.com`) since no global identity was present.

**Cloudflare (free tier)**

- D1 database `halalneo-db` created (id `458def90-808e-4d30-b76b-1a911638e61b`), bound as `DB`. (Initially created as `halalneo`; renamed to match the account's `*-db` convention and deleted the old empty one.)
- R2 bucket `halalneo-media` created, bound as `halalneo_assets`. (Initially created as `halalneo-assets`; renamed to match the account's `*-media` convention and deleted the old empty one.)
- Bindings wired into `wrangler.jsonc`; `wrangler types` regenerated into `worker-configuration.d.ts`.
- `compatibility_flags` set to `nodejs_compat` (paraglide uses Node `AsyncLocalStorage` via `async_hooks`).

**Deploy target**

- Live on the free Workers subdomain: `https://halalneo.jasonwill.workers.dev` (workers_dev subdomain; the ticket's assumed `halalneo.workers.dev` was not the actual account subdomain). `wrangler deploy` succeeds; production 200 with paraglide locale rendering (`<html lang="en" dir="ltr">`).

**Scaffold repair (pre-existing breakage, unblocks everything)**

- The scaffold's `hooks.ts` / `hooks.server.ts` imported `$lib/paraglide/*` but paraglide was never installed → nothing built or deployed.
- Wired up paraglide-js v2 (deprecated `@inlang/paraglide-sveltekit` replaced with `@inlang/paraglide-js`):
  - `project.inlang/settings.json` (single locale `en`), `messages/en.json`.
  - `paraglideVitePlugin` added to `vite.config.ts` (strategy `url`, `cookie`, `baseLocale`), output `src/lib/paraglide`.
  - `src/app.html` now renders `%paraglide.lang%` / `%paraglide.dir%`.
- `worker-configuration.d.ts` `mainModule` line stripped via `scripts/worker-types.mjs` (workaround for sveltejs/language-tools#2982; upstream fix deferred to SvelteKit 3). Wired into `build`, `check`, `gen`.
- Generated `src/lib/paraglide/` added to `.gitignore` and `.prettierignore`.

**Verification**

- `pnpm check` → `svelte-check found 0 errors and 0 warnings`.
- `pnpm lint` → formatting clean; only 2 non-failing eslint warnings (unused disables in generated types file).
- `pnpm build` → succeeds. `wrangler deploy` → success, verified 200.
- `drizzle-kit push` NOT run: requires `CLOUDFLARE_D1_TOKEN` (or equivalent credentials) which is empty in `.env` — deferred to the content-model ticket.

**Credentials**

- `.env` holds Cloudflare account id / D1 ids / `BETTER_AUTH_SECRET` scaffold placeholder (gitignored). No wrangler secrets were set yet.
