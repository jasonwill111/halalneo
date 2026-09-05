import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createAuth } from '#lib/server/auth.js';
import { getDb } from '#lib/server/db/index.js';
import { media } from '#lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

// ==================== GET: Serve media by key ====================
// Supports `?w=480|768|1200` for responsive variants (Cloudflare Images
// transform). SVG sources are served as-is (no raster transform).
// Each variant URL is immutable-cacheable (width is part of the key).
const RESPONSIVE_WIDTHS = new Set([480, 768, 1200]);

function uint8ToStream(data: Uint8Array): ReadableStream<Uint8Array> {
	return new Response(new Blob([data as unknown as BlobPart])).body as ReadableStream<Uint8Array>;
}

export const GET: RequestHandler = async ({ params, platform, request, url }) => {
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

		const contentType = object.httpMetadata?.contentType ?? '';
		const askedWidth = Number(url.searchParams.get('w'));
		const width = RESPONSIVE_WIDTHS.has(askedWidth) ? askedWidth : null;
		const images = platform?.env?.IMAGES as ImagesBinding | undefined;

		// Responsive variant: transform raster sources, serve as WebP.
		if (width && images && !contentType.includes('svg')) {
			try {
				const input = new Uint8Array(await object.arrayBuffer());
				const result = await images
					.input(uint8ToStream(input))
					.transform({ width })
					.output({ format: 'image/webp', quality: 80 });
				const outBytes = new Uint8Array(await new Response(result.image()).arrayBuffer());
				const headers = new Headers();
				headers.set('Content-Type', 'image/webp');
				headers.set('Content-Length', String(outBytes.length));
				headers.set('ETag', `"${fullKey}-w${width}"`);
				headers.set('Cache-Control', 'public, max-age=31536000, immutable');
				return new Response(outBytes, { headers });
			} catch {
				// Fall through to original on transform failure
			}
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
