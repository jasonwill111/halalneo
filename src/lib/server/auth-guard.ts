import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { getBindings } from '#lib/server/bindings.js';
import { getDb } from '#lib/server/db/index.js';
import { supplierMembers, suppliers } from '#lib/server/db/schema.js';
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

export type DbClient = NonNullable<ReturnType<typeof getDb>>;

/** True when userId owns an active supplier or has a legacy membership row. */
export async function isSupplierMember(
	db: DbClient,
	userId: string,
	supplierSlug: string
): Promise<boolean> {
	const [ownedSupplier] = await db
		.select({ status: suppliers.status })
		.from(suppliers)
		.where(and(eq(suppliers.ownerUserId, userId), eq(suppliers.slug, supplierSlug)))
		.limit(1);
	if (ownedSupplier) return ownedSupplier.status === 'active';

	const [legacyMember] = await db
		.select({ userId: supplierMembers.userId })
		.from(supplierMembers)
		.where(and(eq(supplierMembers.userId, userId), eq(supplierMembers.supplierSlug, supplierSlug)))
		.limit(1);
	return Boolean(legacyMember);
}

/**
 * Guard for admin+supplier shared reads: admins pass without a supplierSlug,
 * any other caller must be a member of the requested supplierSlug. Returns a
 * 401/403/503 Response when denied, otherwise null.
 */
export async function requireAdminOrSupplier(
	event: RequestEvent,
	supplierSlug: string | undefined
): Promise<Response | null> {
	const session = await getSession(event);
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });
	if (isAdminEmail(session.user?.email)) return null;
	if (!supplierSlug) return json({ error: 'Forbidden' }, { status: 403 });
	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });
	if (!(await isSupplierMember(db, session.user.id, supplierSlug))) {
		return json({ error: 'Forbidden' }, { status: 403 });
	}
	return null;
}
