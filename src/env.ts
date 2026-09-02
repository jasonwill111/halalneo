import { defineEnvVars } from '@sveltejs/kit/env';

// Reviewed 2026-08-26 (kit-3 migration task): both vars intentionally fall back
// to '' —better-auth infers baseURL from the request when ORIGIN is empty and
// throws its own actionable error at first use when the secret is empty.
export const variables = defineEnvVars({
	ORIGIN: { schema: (input) => input ?? '' },
	BETTER_AUTH_SECRET: { schema: (input) => input ?? '' }
});
