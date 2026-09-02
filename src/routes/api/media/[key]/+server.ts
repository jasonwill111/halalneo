import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createAuth } from '#lib/server/auth.js';
import { getDb } from '#lib/server/db/index.js';
import { media } from '#lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

// ==================== GET: Serve media by key ====================
export const GET: RequestHandler = async ({ params, platform, request }) => {
	const key = params.key;
	if (!key) {
		return json({ error: 'Missing key' }, { status: 400 });
	}

	const r2 = platform?.env?.halalneo_assets as R2Bucket | undefined;
	if (!r2) return json({ error: 'R2 unavailable' }, { status: 503 });

	// Reconstruct full key with media/ prefix if not present
	const fullKey = key.startsWith('media/') ? key : `media/${key}`;

	try {
		const object = await r2.get(fullKey);
		if (!object) {
			return json({ error: 'Not found' }, { status: 404 });
		}

		const headers = new Headers();
		object.writeHttpMetadata(headers);
		headers.set('Cache-Control', 'public, max-age=31536000, immutable');
		headers.set('ETag', object.httpEtag);
		headers.set('Content-Length', String(object.size));
		if (object.httpMetadata?.contentType) {
			headers.set('Content-Type', object.httpMetadata.contentType);
		}

		// 304 check using the fetched object's ETag
		const ifNoneMatch = request.headers.get('If-None-Match');
		if (ifNoneMatch && ifNoneMatch.replace(/"/g, '') === object.httpEtag.replace(/"/g, '')) {
			return new Response(null, { status: 304, headers: { ETag: object.httpEtag } });
		}

		return new Response(object.body, { headers });
	} catch (e: any) {
		return json({ error: e?.message ?? 'Failed to serve media' }, { status: 500 });
	}
};

// ==================== DELETE: Remove media ====================
export const DELETE: RequestHandler = async ({ params, request, platform }) => {
	const key = params.key;
	if (!key) {
		return json({ error: 'Missing key' }, { status: 400 });
	}

	const db = platform?.env?.DB;
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const auth = createAuth(db);
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

	const r2 = platform?.env?.halalneo_assets as R2Bucket | undefined;
	if (!r2) return json({ error: 'R2 unavailable' }, { status: 503 });

	const fullKey = key.startsWith('media/') ? key : `media/${key}`;
	const dbClient = getDb(db);

	try {
		// Find the media record
		const record = await dbClient.query.media.findFirst({
			where: eq(media.key, fullKey)
		});

		if (!record) {
			return json({ error: 'Media not found' }, { status: 404 });
		}

		// Delete from R2
		await r2.delete(record.key);
		if (record.thumbnailKey) {
			await r2.delete(record.thumbnailKey);
		}

		// Delete from D1
		await dbClient.delete(media).where(eq(media.id, record.id));

		return json({ success: true, deleted: record.key });
	} catch (e: any) {
		return json({ error: e?.message ?? 'Delete failed' }, { status: 500 });
	}
};
