import { and, eq } from 'drizzle-orm';
import { buyers, suppliers } from '#lib/server/db/schema.js';
import type { getDb } from '#lib/server/db/index.js';

type DomainDb = ReturnType<typeof getDb>;
type SupplierBusinessType = 'manufacturer' | 'wholesaler' | 'trader';

export interface BuyerProfileInput {
	companyName?: string | null;
	phone?: string | null;
	country?: string | null;
}

export interface PendingSupplierInput {
	ownerUserId: string;
	slug: string;
	name: string;
	country: string;
	businessType: SupplierBusinessType;
	description?: string | null;
	website?: string | null;
	email?: string | null;
}

export async function ensureBuyerRecord(
	db: DomainDb,
	userId: string,
	input: BuyerProfileInput = {}
): Promise<void> {
	await db
		.insert(buyers)
		.values({
			userId,
			companyName: input.companyName ?? null,
			phone: input.phone ?? null,
			country: input.country ?? null
		})
		.onConflictDoNothing();
}

export async function getSupplierForUser(
	db: DomainDb,
	userId: string
): Promise<typeof suppliers.$inferSelect | null> {
	const [supplier] = await db
		.select()
		.from(suppliers)
		.where(eq(suppliers.ownerUserId, userId))
		.limit(1);
	return supplier ?? null;
}

export async function isApprovedSupplier(db: DomainDb, userId: string): Promise<boolean> {
	const supplier = await getSupplierForUser(db, userId);
	return supplier?.status === 'active';
}

export async function createPendingSupplier(
	db: DomainDb,
	input: PendingSupplierInput
): Promise<typeof suppliers.$inferSelect> {
	const [supplier] = await db
		.insert(suppliers)
		.values({
			slug: input.slug,
			ownerUserId: input.ownerUserId,
			name: input.name,
			country: input.country,
			businessType: input.businessType,
			description: input.description ?? null,
			website: input.website ?? null,
			email: input.email ?? null,
			status: 'pending'
		})
		.returning();
	return supplier;
}

export async function supplierBelongsToUser(
	db: DomainDb,
	userId: string,
	supplierSlug: string
): Promise<boolean> {
	const [row] = await db
		.select({ ownerUserId: suppliers.ownerUserId })
		.from(suppliers)
		.where(and(eq(suppliers.ownerUserId, userId), eq(suppliers.slug, supplierSlug)))
		.limit(1);
	return Boolean(row);
}
