import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { supplierMembers } from '#lib/server/db/schema.js';
import { eq } from 'drizzle-orm';
import { getSession } from '#lib/server/auth.js';

// ==================== GET: my supplier memberships (login) ====================
// Used by dashboards/publish UIs to scope actions to the caller's suppliers.
export const GET: RequestHandler = async (event) => {
	const session = await getSession(event);
	const userId = (session?.user as any)?.id as string | undefined;
	if (!userId) return json({ error: 'Unauthorized' }, { status: 401 });

	const db = getDb(getBindings().DB);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	try {
		const rows = await db
			.select({ supplierSlug: supplierMembers.supplierSlug, role: supplierMembers.role })
			.from(supplierMembers)
			.where(eq(supplierMembers.userId, userId));
		return json({ items: rows });
	} catch (e: any) {
		return json({ error: e?.message ?? 'Failed' }, { status: 500 });
	}
};
