import type { User, Session } from 'better-auth';
import { createAuth } from '#lib/server/auth.js';

// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Platform {
			// AGNES_API_KEY is provisioned via `wrangler secret` (not in
			// wrangler.jsonc, so absent from generated worker-configuration.d.ts)
			env: Env & { AGNES_API_KEY?: string };
			ctx: ExecutionContext;
			caches: CacheStorage;
			cf?: IncomingRequestCfProperties;
		}

		interface Locals {
			user?: User;
			session?: Session;
			auth: ReturnType<typeof createAuth>;
		}

		// interface Error {}
		// interface PageData {}
		// interface PageState {}
	}
}

export {};
