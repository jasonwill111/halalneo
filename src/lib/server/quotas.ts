import { gte, and, eq, sql } from 'drizzle-orm';
import { getDb } from '#lib/server/db/index.js';

type Db = ReturnType<typeof getDb>;

// Weekly publishing quotas (anti-spam by design). Paid plans raise the cap
// but NEVER remove it. Plan resolution is a stub returning 'free' until
// payment integration lands — then wire it to the subscription source.
export const QUOTA_BY_PLAN = {
	buyingRequest: { free: 1, pro: 5, business: 20 },
	promotion: { free: 1, pro: 5, business: 20 },
	supplierUpdate: { free: 1, pro: 7, business: 30 }
} as const;

export type QuotaKind = keyof typeof QUOTA_BY_PLAN;
export type Plan = 'free' | 'pro' | 'business';

/** Forward-compatible plan resolver. Always 'free' until payments land. */
export function resolvePlan(_userId?: string | null): Plan {
	// TODO(payments): look up subscription (e.g. better-auth additionalFields
	// `plan` on user, or a subscriptions table) and return pro/business.
	return 'free';
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Count rows created by `key` in `column` within the trailing 7 days and
 * compare against the plan cap. Returns { allowed, remaining, limit, resetAt }.
 */
export async function checkWeeklyQuota(
	db: Db,
	table: any,
	column: any,
	key: string,
	kind: QuotaKind,
	plan: Plan = 'free'
): Promise<{ allowed: boolean; remaining: number; limit: number; resetAt: Date }> {
	const limit = QUOTA_BY_PLAN[kind][plan] ?? QUOTA_BY_PLAN[kind].free;
	const since = new Date(Date.now() - WEEK_MS);
	const rows = await db
		.select({ n: sql<number>`count(*)` })
		.from(table)
		.where(and(eq(column, key), gte(table.createdAt, since)));
	const used = rows[0]?.n ?? 0;
	return {
		allowed: used < limit,
		remaining: Math.max(0, limit - used),
		limit,
		resetAt: new Date(Date.now() + WEEK_MS)
	};
}
