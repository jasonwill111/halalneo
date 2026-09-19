import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { getBindings } from '#lib/server/bindings.js';
import { getSession } from '#lib/server/auth.js';

/**
 * Admin allowlist shared with the /admin route guard in hooks.server.ts:
 * session user email must be in the ADMIN_EMAILS worker secret.
 */
export function isAdminEmail(email: string | null | undefined): boolean {
	let allowlist: string[];
	try {
		allowlist = ((getBindings().ADMIN_EMAILS as string | undefined) ?? '')
			.split(',')
			.map((s) => s.trim().toLowerCase())
			.filter(Boolean);
	} catch {
		allowlist = [];
	}
	const normalized = (email ?? '').toLowerCase();
	return Boolean(normalized) && allowlist.includes(normalized);
}

/** Returns a 401/403 Response when the caller is not an allowlisted admin, otherwise null. */
export async function requireAdmin(event: RequestEvent): Promise<Response | null> {
	const session = await getSession(event);
	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}
	if (!isAdminEmail(session.user?.email)) {
		return json({ error: 'Forbidden' }, { status: 403 });
	}
	return null;
}
