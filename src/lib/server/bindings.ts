// Central bindings accessor — SvelteKit 3 (adapter-cloudflare 8) removed
// `event.platform`; bindings come from the `cloudflare:workers` runtime module
// (production) which the adapter emulates in dev/preview.
// Types come from the generated worker-configuration.d.ts (Cloudflare.Env),
// extended with wrangler secrets that are provisioned at deploy time
// (ADMIN_EMAILS) or absent from wrangler.jsonc (AGNES_API_KEY).
import { env } from 'cloudflare:workers';

export type Bindings = Cloudflare.Env & {
	ADMIN_EMAILS?: string;
	AGNES_API_KEY?: string;
};

export function getBindings(): Bindings {
	return env as Bindings;
}

export function getD1() {
	const d1 = (env as Bindings).DB;
	if (!d1) throw new Error('D1 binding DB is unavailable');
	return d1;
}
