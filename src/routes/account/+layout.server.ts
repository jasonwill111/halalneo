import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';
import { getSession } from '#lib/server/auth.js';

export type AccountUser = {
	name: string;
	email: string;
};

/**
 * Buyer portal guard + session identity for the whole `/account` subtree.
 *
 * `/account` is not in the `PUBLIC_*` allowlists in `hooks.server.ts`, so
 * `handleBetterAuth` has already resolved `locals.session`/`locals.user` before
 * this runs — `getSession()` returns from locals and costs zero extra D1 reads.
 * Anonymous visitors are sent to the buyer sign-in page with the requested
 * path in `?next=` (only an absolute in-site path ever reaches `redirect()`,
 * and `safeNextPath()` on the login page re-validates it).
 */
export const load: LayoutServerLoad = async (event): Promise<{ user: AccountUser }> => {
	const result = await getSession(event);
	if (!result) {
		redirect(307, `/login?next=${encodeURIComponent(event.url.pathname)}`);
	}
	return {
		user: {
			name: result.user.name,
			email: result.user.email
		}
	};
};
