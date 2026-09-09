import { ORIGIN, BETTER_AUTH_SECRET } from '$app/env/private';
import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { getRequestEvent } from '$app/server';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import type { RequestEvent } from '@sveltejs/kit';

const authConfig = {
	baseURL: ORIGIN,
	secret: BETTER_AUTH_SECRET,
	emailAndPassword: { enabled: true },
	plugins: [
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	]
} satisfies Omit<Parameters<typeof betterAuth>[0], 'database'>;

export const createAuth = (d1: D1Database) =>
	betterAuth({
		...authConfig,
		database: drizzleAdapter(getDb(d1), { provider: 'sqlite' })
	});

/**
 * Get the current session from a request event.
 * Returns null if not authenticated.
 */
export async function getSession(event: RequestEvent): Promise<{ session: any; user: any } | null> {
	// Prefer session already resolved by handleBetterAuth middleware
	if (event.locals.session && event.locals.user) {
		return { session: event.locals.session, user: event.locals.user };
	}

	let db: any = null;
	try {
		db = getBindings().DB;
	} catch {
		db = null;
	}
	if (!db) return null;

	const authInstance = createAuth(db);
	const result = await authInstance.api.getSession({ headers: event.request.headers });
	if (!result) return null;

	return { session: result.session, user: result.user };
}

/**
 * DO NOT USE!
 *
 * This instance is used by the `auth` CLI for schema generation ONLY.
 * To access `auth` at runtime, use `event.locals.auth`.
 */
export const auth = createAuth(null!);
