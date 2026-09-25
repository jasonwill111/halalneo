import type { LayoutServerLoad } from './$types';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { supplierMembers, suppliers } from '#lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

export type SupplierPortalUser = {
	id: string;
	name: string;
	email: string;
	image: string | null;
};

export type SupplierPortalProfile = {
	slug: string;
	name: string;
	country: string;
	status: string | null;
	logoInitials: string | null;
	businessType: string | null;
};

/**
 * Session-derived supplier identity for the whole portal.
 *
 * `locals.user` is already resolved by `handleBetterAuth` for every
 * non-public path (this one included), so the only cost added here is two
 * indexed reads: `supplier_members.user_id` (idx_members_user) and a
 * `suppliers` primary-key lookup.
 *
 * NOTE: `/supplier/[slug]` and `/supplier/onboarding` render through
 * `+layout@.svelte`, so their *components* skip this layout — but the load
 * function still runs for them. That is why this file never redirects and
 * always resolves to plain data.
 */
export const load: LayoutServerLoad = async (
	event
): Promise<{
	supplierUser: SupplierPortalUser | null;
	supplierSlug: string | null;
	supplierProfile: SupplierPortalProfile | null;
}> => {
	const user = event.locals.user;
	if (!user) return { supplierUser: null, supplierSlug: null, supplierProfile: null };

	const supplierUser: SupplierPortalUser = {
		id: user.id,
		name: user.name,
		email: user.email,
		image: user.image ?? null
	};

	let db: ReturnType<typeof getDb> | null;
	try {
		db = getDb(getBindings().DB);
	} catch {
		db = null; // no D1 binding (build time / preview without DB)
	}
	if (!db) return { supplierUser, supplierSlug: null, supplierProfile: null };

	// Membership lookup — the user ↔ supplier link created by the admin
	// activation hook in `api/suppliers/[slug]` (PUT) when a supplier flips
	// to active and its email matches a registered account.
	let supplierSlug: string | null;
	try {
		const [member] = await db
			.select({ supplierSlug: supplierMembers.supplierSlug })
			.from(supplierMembers)
			.where(eq(supplierMembers.userId, user.id))
			.limit(1);
		supplierSlug = member?.supplierSlug ?? null;
	} catch {
		supplierSlug = null;
	}

	if (!supplierSlug) return { supplierUser, supplierSlug: null, supplierProfile: null };

	let supplierProfile: SupplierPortalProfile | null;
	try {
		const [row] = await db
			.select({
				slug: suppliers.slug,
				name: suppliers.name,
				country: suppliers.country,
				status: suppliers.status,
				logoInitials: suppliers.logoInitials,
				businessType: suppliers.businessType
			})
			.from(suppliers)
			.where(eq(suppliers.slug, supplierSlug))
			.limit(1);
		supplierProfile = row ?? null;
	} catch {
		supplierProfile = null;
	}

	return { supplierUser, supplierSlug, supplierProfile };
};
