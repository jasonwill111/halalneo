import { error } from '@sveltejs/kit';
import { desc, eq, inArray, sql } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import { requireAdmin } from '#lib/server/auth-guard.js';
import { getBindings } from '#lib/server/bindings.js';
import { getDb } from '#lib/server/db/index.js';
import { supplierMembers, suppliers, user as authUser } from '#lib/server/db/schema.js';

/**
 * Hard ceiling (§5.9): this list never reads more than 100 accounts. `total`
 * comes back alongside the rows so the page can tell the operator that the
 * table is truncated instead of silently hiding accounts.
 */
const ROW_LIMIT = 100;

export type AdminUserRow = {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	createdAt: number;
	/** Supplier company this login is linked to through `supplier_members`. */
	supplierSlug: string | null;
	supplierName: string | null;
};

type UserRecord = {
	id: string;
	name: string;
	email: string;
	emailVerified: boolean | null;
	createdAt: Date | number;
};
type MemberRecord = { userId: string; supplierSlug: string; supplierName: string };
type CountRecord = { count: number };

export type AdminUsersData = {
	seo: { title: string; description: string };
	users: AdminUserRow[];
	total: number;
	limit: number;
};

function toEpochMs(value: Date | number): number {
	return value instanceof Date ? value.getTime() : Number(value);
}

/** Drizzle client for the request's D1 binding, or `null` (build time / preview without DB). */
function openDb(): ReturnType<typeof getDb> | null {
	try {
		return getDb(getBindings().DB);
	} catch {
		return null;
	}
}

/**
 * Real Better Auth accounts (the `user` table), replacing the removed
 * localStorage demo store. Read-only by design: buyer/seller lifecycle writes
 * need the better-auth `admin` plugin (extra columns + endpoints), which is not
 * enabled in `src/lib/server/auth.ts`.
 */
export const load: PageServerLoad = async (event): Promise<AdminUsersData> => {
	const denied = await requireAdmin(event);
	if (denied) throw error(denied.status, denied.status === 401 ? 'Please sign in.' : 'Forbidden');

	const seo = {
		title: 'Users — HalalNeo Admin',
		description: 'Registered HalalNeo accounts.'
	};

	const db = openDb();
	if (!db) return { seo, users: [], total: 0, limit: ROW_LIMIT };

	// Two subrequests total: the projected page + count in one batch, then the
	// membership lookup for exactly those ids (idx_members_user covers the
	// WHERE, suppliers is joined by primary key — no N+1 loop).
	const [records, totalRows] = (await db.batch([
		db
			.select({
				id: authUser.id,
				name: authUser.name,
				email: authUser.email,
				emailVerified: authUser.emailVerified,
				createdAt: authUser.createdAt
			})
			.from(authUser)
			.orderBy(desc(authUser.createdAt))
			.limit(ROW_LIMIT),
		db.select({ count: sql<number>`count(*)` }).from(authUser)
	])) as [UserRecord[], CountRecord[]];

	const rows = records ?? [];
	const memberships = new Map<string, MemberRecord>();
	if (rows.length > 0) {
		const memberRows = await db
			.select({
				userId: supplierMembers.userId,
				supplierSlug: suppliers.slug,
				supplierName: suppliers.name
			})
			.from(supplierMembers)
			.innerJoin(suppliers, eq(suppliers.slug, supplierMembers.supplierSlug))
			.where(
				inArray(
					supplierMembers.userId,
					rows.map((row) => row.id)
				)
			)
			.limit(ROW_LIMIT);
		for (const member of memberRows ?? []) {
			if (!memberships.has(member.userId)) memberships.set(member.userId, member);
		}
	}

	const users: AdminUserRow[] = rows.map((row) => {
		const member = memberships.get(row.id);
		return {
			id: row.id,
			name: row.name,
			email: row.email,
			emailVerified: row.emailVerified === true,
			createdAt: toEpochMs(row.createdAt),
			supplierSlug: member?.supplierSlug ?? null,
			supplierName: member?.supplierName ?? null
		};
	});

	return { seo, users, total: totalRows?.[0]?.count ?? users.length, limit: ROW_LIMIT };
};
