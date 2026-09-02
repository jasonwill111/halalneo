import { getDb } from '#lib/server/db/index.js';

export function getDbFromPlatform(platform: App.Platform | undefined) {
	const d1 = platform?.env?.DB;
	if (!d1) return null;
	return getDb(d1);
}

export function parseQuery(url: URL) {
	const limit = Math.min(Number(url.searchParams.get('limit')) || 20, 100);
	const offset = Number(url.searchParams.get('offset')) || 0;
	const search = url.searchParams.get('search') || undefined;
	return { limit, offset, search };
}
