/**
 * Typed readers for the `/api` JSON boundary used by `+page.ts` / `+page.server.ts`
 * loaders. They encode the long-standing `res.ok ? data.items ?? [] : []` fallback
 * shape once, so no loader needs an unchecked cast (§5.4, §5.9.4).
 */
import type { ApiList } from '#lib/types/api.js';

/** `{ items, total }` envelope of a list endpoint, or an empty envelope when it failed. */
export async function readList<T>(res: Response): Promise<ApiList<T>> {
	if (!res.ok) return {};
	return (await res.json()) as ApiList<T>;
}

/** `{ items }` list payload, or `[]` when the request failed. */
export async function readItems<T>(res: Response): Promise<T[]> {
	const data = await readList<T>(res);
	return data.items ?? [];
}

/** `{ total }` counter of a list payload, or `0` when the request failed. */
export async function readTotal(res: Response): Promise<number> {
	if (!res.ok) return 0;
	const data = (await res.json()) as { total?: number };
	return data.total ?? 0;
}

/** Whole JSON body of a request that already passed an `res.ok` guard. */
export async function readJson<T>(res: Response): Promise<T> {
	return (await res.json()) as T;
}
