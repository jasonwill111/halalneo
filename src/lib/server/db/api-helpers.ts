import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';

export function getDbFromPlatform(_platform: unknown) {
	try {
		const d1 = getBindings().DB;
		if (!d1) return null;
		return getDb(d1);
	} catch {
		// cloudflare:workers unavailable (unit tests / non-worker context)
		return null;
	}
}

export function parseQuery(url: URL) {
	const limit = Math.min(Number(url.searchParams.get('limit')) || 20, 100);
	const offset = Number(url.searchParams.get('offset')) || 0;
	const search = url.searchParams.get('search') || undefined;
	return { limit, offset, search };
}
