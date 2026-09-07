import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDbFromPlatform } from '#lib/server/db/api-helpers.js';
import { suppliers, inquiries } from '#lib/server/db/schema.js';
import { eq, sql, and } from 'drizzle-orm';
import { invalidateCache } from '#lib/server/cache.js';
import { z } from 'zod';

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 3;

function checkRateLimit(ip: string): boolean {
	const now = Date.now();
	const entry = rateLimitMap.get(ip);
	if (!entry || now > entry.resetAt) {
		rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
		return true;
	}
	if (entry.count >= RATE_LIMIT_MAX) return false;
	entry.count++;
	return true;
}

const applicationSchema = z.object({
	company: z.string().min(2).max(200),
	country: z.string().min(2).max(100),
	businessType: z.enum(['manufacturer', 'wholesaler', 'trader']).optional().default('manufacturer'),
	primaryProducts: z.string().max(300).optional().default(''),
	contactEmail: z.string().email().max(200),
	halalCertification: z.string().max(200).optional().default(''),
	registrationNo: z.string().max(100).optional().default(''),
	website: z.string().max(300).optional().default('')
});

function slugify(s: string): string {
	return s
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/(^-|-$)/g, '')
		.slice(0, 60);
}

function initialsFromName(name: string): string {
	return (
		name
			.split(/\s+/)
			.map((p) => p[0])
			.filter(Boolean)
			.slice(0, 2)
			.join('')
			.toUpperCase() || 'SU'
	);
}

export const GET: RequestHandler = async ({ platform, url }) => {
	const db = getDbFromPlatform(platform);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const limit = Math.min(Number(url.searchParams.get('limit')) || 20, 100);
	const status = url.searchParams.get('status') || undefined;

	try {
		const conditions = [];
		if (status) conditions.push(eq(suppliers.status, status as 'active' | 'pending' | 'suspended'));

		const where = conditions.length > 1 ? and(...conditions) : conditions.length === 1 ? conditions[0] : undefined;

		const [countResult] = await db
			.select({ count: sql<number>`count(*)` })
			.from(suppliers)
			.where(where);
		const rows = await db
			.select({
				slug: suppliers.slug,
				name: suppliers.name,
				country: suppliers.country,
				businessType: suppliers.businessType,
				status: suppliers.status,
				logoInitials: suppliers.logoInitials,
				email: suppliers.email,
				website: suppliers.website,
				createdAt: suppliers.createdAt
			})
			.from(suppliers)
			.where(where)
			.orderBy(sql`${suppliers.createdAt} DESC`)
			.limit(limit);

		return json({ items: rows, total: countResult?.count ?? 0 });
	} catch (e: any) {
		return json({ error: e?.message ?? 'Query failed' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, platform }) => {
	const ip = request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || 'unknown';
	if (!checkRateLimit(ip)) {
		return json({ error: 'Too many applications. Please try again in a minute.' }, { status: 429 });
	}

	const db = getDbFromPlatform(platform);
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
	if (!body) return json({ error: 'Request body is required' }, { status: 400 });

	const parsed = applicationSchema.safeParse(body);
	if (!parsed.success) {
		return json({ error: 'Validation failed', details: parsed.error.flatten().fieldErrors }, { status: 400 });
	}

	const data = parsed.data;
	const baseSlug = slugify(data.company);
	let finalSlug = baseSlug || `supplier-${Date.now()}`;

	try {
		let attempt = 0;
		while (attempt < 10) {
			const [existing] = await db.select({ slug: suppliers.slug }).from(suppliers).where(eq(suppliers.slug, finalSlug)).limit(1);
			if (!existing) break;
			attempt++;
			finalSlug = `${baseSlug}-${attempt + 1}`;
		}

		const [row] = await db
			.insert(suppliers)
			.values({
				slug: finalSlug,
				name: data.company.trim(),
				country: data.country.trim(),
				businessType: data.businessType,
				isBrand: false,
				status: 'pending',
				logoInitials: initialsFromName(data.company),
				description: '',
				email: data.contactEmail.trim(),
				website: data.website.trim() || null
			})
			.returning();

		await db.insert(inquiries).values({
			buyerSlug: data.contactEmail.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 60),
			supplierSlug: finalSlug,
			subject: `[Supplier Application] ${data.company.trim()}`,
			message: [
				`Company: ${data.company.trim()}`,
				`Country: ${data.country.trim()}`,
				`Business type: ${data.businessType}`,
				`Primary products: ${data.primaryProducts || '-'}`,
				`Halal certification: ${data.halalCertification || '-'}`,
				`Registration no: ${data.registrationNo || '-'}`,
				`Website: ${data.website || '-'}`,
				`Contact email: ${data.contactEmail.trim()}`,
				'',
				'Status: pending admin review.'
			].join('\n'),
			status: 'pending'
		});

		await invalidateCache('/api/suppliers', '/api/inquiries');

		return json(
			{
				ok: true,
				slug: row.slug,
				message: 'Application received. Our team will review your details and respond within 1-3 business days.'
			},
			{ status: 201 }
		);
	} catch (e: any) {
		if (e?.message?.includes('UNIQUE constraint')) {
			return json({ error: 'A supplier with this name already exists. Please contact us directly.' }, { status: 409 });
		}
		return json({ error: e?.message ?? 'Internal error' }, { status: 500 });
	}
};
