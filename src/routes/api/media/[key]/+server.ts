import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getBindings } from '#lib/server/bindings.js';
import { getDb } from '#lib/server/db/index.js';
import { requireAdmin } from '#lib/server/auth-guard.js';
import { media } from '#lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

/**
 * Media read — cost red line (§5.12.3).
 *
 * Every stored object is already WebP/AVIF (upload route rejects originals), so
 * there is no server-side resizing here and no `?w=` variant API — Cloudflare
 * Image Resizing is a paid feature (§5.12) and Worker image processing is
 * forbidden (§5.10.4). Responsive sizing is done with plain `width`/`height`
 * attributes + CSS on the client.
 *
 * Order of operations is what saves Class B bytes:
 *   1. `head()` (tiny) — never `get()` first;
 *   2. answer If-None-Match with 304 from the head ETag, before fetching body;
 *   3. only then `get()`, with a `range` when the client asked for one (206).
 */

const CACHE_CONTROL = 'public, max-age=31536000, immutable';

function getR2(): R2Bucket | undefined {
	try {
		return getBindings().halalneo_assets;
	} catch {
		return undefined;
	}
}

/** ETag normalisation: strip quotes + the `W/` prefix before comparing. */
function bareEtag(tag: string): string {
	return tag
		.replace(/^\s*(?:W\/)?"/g, '')
		.replace(/"$/g, '')
		.trim();
}

/** Weak If-None-Match matcher: `*`, single tag, or comma-separated list. */
function ifNoneMatch(value: string, etag: string): boolean {
	if (value.trim() === '*') return true;
	const target = bareEtag(etag);
	return value
		.split(',')
		.map((t) => bareEtag(t))
		.filter(Boolean)
		.includes(target);
}

interface ByteRange {
	offset: number;
	length: number;
	start: number;
	end: number;
}

/** Parse a single-range `Range: bytes=a-b` header against a known size. */
function parseRange(header: string, size: number): ByteRange | null {
	const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
	if (!match) return null;
	const rawStart = match[1];
	const rawEnd = match[2];
	if (!rawStart && !rawEnd) return null;

	let start: number;
	let end: number;
	if (!rawStart) {
		// Open suffix range: last N bytes.
		const suffix = Number(rawEnd);
		if (!Number.isFinite(suffix) || suffix <= 0) return null;
		start = Math.max(0, size - suffix);
		end = size - 1;
	} else {
		start = Number(rawStart);
		end = rawEnd ? Number(rawEnd) : size - 1;
	}
	if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start >= size) {
		return null;
	}
	end = Math.min(end, size - 1);
	return { offset: start, length: end - start + 1, start, end };
}

/**
 * Resolve the byte window actually delivered. `R2Range` is a union whose third
 * member carries only `suffix`, so it must be narrowed before it can be echoed
 * back in `Content-Range` (RFC 9110 §14.21). We never send a suffix request —
 * `parseRange` turns those into offset/length — but the arm is still handled
 * explicitly, so every other fallback is simply the window that was asked for.
 */
function computeDeliveredRange(
	returned: NonNullable<R2ObjectBody['range']> | undefined,
	asked: ByteRange,
	size: number
): { offset: number; end: number; length: number } {
	let offset = asked.offset;
	let length = asked.length;

	if (returned) {
		if ('suffix' in returned) {
			// bytes=-N → the final N bytes of the object.
			length = Math.min(returned.suffix, size);
			offset = size - length;
		} else {
			// Both remaining arms declare `offset` and `length`, one of them as the
			// optional half; the `suffix` arm above has been narrowed away, so these
			// reads are legal without a cast.
			offset = returned.offset ?? asked.offset;
			const remaining = Math.max(size - offset, 0);
			length = Math.min(returned.length ?? remaining, remaining);
		}
	}

	const end = Math.min(offset + length - 1, size - 1);
	return { offset, end, length: Math.max(end - offset + 1, 0) };
}

function baseHeaders(etag: string, contentType: string): Headers {
	const headers = new Headers();
	headers.set('Content-Type', contentType);
	headers.set('Cache-Control', CACHE_CONTROL);
	headers.set('ETag', etag);
	headers.set('Accept-Ranges', 'bytes');
	return headers;
}

// ==================== GET: Serve media by key ====================
export const GET: RequestHandler = async ({ params, request }) => {
	const key = params.key;
	if (!key || key.includes('..')) {
		return json({ error: 'Invalid key' }, { status: 400 });
	}

	const r2 = getR2();
	if (!r2) return json({ error: 'R2 unavailable' }, { status: 503 });

	// Reconstruct full key with media/ prefix if not present
	const fullKey = key.startsWith('media/') ? key : `media/${key}`;

	try {
		// 1. head(): cheapest Class B op, and the only one a cache-hit client pays.
		const head = await r2.head(fullKey);
		if (!head) return json({ error: 'Not found' }, { status: 404 });

		const etag = head.httpEtag;
		const contentType = head.httpMetadata?.contentType ?? 'application/octet-stream';

		// 2. 304 before any body read (§5.12.3).
		const ifNoneMatchHeader = request.headers.get('if-none-match');
		if (ifNoneMatchHeader && ifNoneMatch(ifNoneMatchHeader, etag)) {
			return new Response(null, {
				status: 304,
				headers: { ETag: etag, 'Cache-Control': CACHE_CONTROL, 'Accept-Ranges': 'bytes' }
			});
		}

		// 3. Range, but only when If-Range still matches (RFC 9110 §14.2.3).
		const ifRange = request.headers.get('if-range');
		const rangeHeader = request.headers.get('range');
		const rangeOk = !ifRange || ifNoneMatch(ifRange, etag);
		const range = rangeHeader && rangeOk ? parseRange(rangeHeader, head.size) : null;

		const object = range
			? await r2.get(fullKey, { range: { offset: range.offset, length: range.length } })
			: await r2.get(fullKey);
		if (!object) return json({ error: 'Not found' }, { status: 404 });

		const headers = baseHeaders(etag, contentType);

		if (range) {
			// Echo the window R2 actually delivered (`computeDeliveredRange` narrows the
			// `R2Range` union and falls back to what we asked for — `parseRange()` derived
			// it from `head.size`, so there is normally nothing left to clamp).
			const delivered = computeDeliveredRange(object.range, range, head.size);
			headers.set('Content-Range', `bytes ${delivered.offset}-${delivered.end}/${head.size}`);
			headers.set('Content-Length', String(delivered.length));
			return new Response(object.body, { status: 206, headers });
		}

		headers.set('Content-Length', String(head.size));
		return new Response(object.body, { headers });
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Failed to serve media';
		return json({ error: message }, { status: 500 });
	}
};

// ==================== DELETE: Remove media ====================
export const DELETE: RequestHandler = async (event) => {
	const key = event.params.key;
	if (!key) {
		return json({ error: 'Missing key' }, { status: 400 });
	}

	// Media is a shared asset store: only allowlisted admins may delete.
	const denied = await requireAdmin(event);
	if (denied) return denied;

	let d1: D1Database | undefined;
	try {
		d1 = getBindings().DB;
	} catch {
		d1 = undefined;
	}
	if (!d1) return json({ error: 'Database unavailable' }, { status: 503 });

	const r2 = getR2();
	if (!r2) return json({ error: 'R2 unavailable' }, { status: 503 });

	const fullKey = key.startsWith('media/') ? key : `media/${key}`;
	const db = getDb(d1);

	try {
		// Find the media record
		const record = await db
			.select({ id: media.id, key: media.key, thumbnailKey: media.thumbnailKey })
			.from(media)
			.where(eq(media.key, fullKey))
			.limit(1)
			.get();

		if (!record) {
			return json({ error: 'Media not found' }, { status: 404 });
		}

		// Delete from R2
		await r2.delete(record.key);
		if (record.thumbnailKey) {
			await r2.delete(record.thumbnailKey);
		}

		// Delete from D1
		await db.delete(media).where(eq(media.id, record.id));

		return json({ success: true, deleted: record.key });
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Delete failed';
		return json({ error: message }, { status: 500 });
	}
};
