import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getBindings } from '#lib/server/bindings.js';
import { getDb } from '#lib/server/db/index.js';
import { requireAdmin } from '#lib/server/auth-guard.js';
import { getSession } from '#lib/server/auth.js';
import { media } from '#lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

/**
 * Media upload — cost red line (§5.11 / §5.12 of docs/development-rules.md).
 *
 * Workers must never process images (§5.10.4) and Cloudflare Image Resizing is
 * a paid feature (§5.12), so compression happens on the CLIENT before the
 * request is sent (see `#lib/utils/image-compress.ts` → `compressImageToWebP`).
 * The server only:
 *   1. rejects anything that is not already WebP/AVIF — original JPEG/PNG
 *      uploads are forbidden (§5.11 "禁止直接上传原图到 R2");
 *   2. derives the storage key from the SHA-256 of the bytes, so identical
 *      content always maps to the same key;
 *   3. `head()`s that key and skips `put()` when the object already exists
 *      (real dedupe: a Class B head instead of a Class A put + extra storage);
 *   4. writes immutable `Cache-Control` on every object (§5.12.2).
 */

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB — generous for an already-compressed still
const CACHE_CONTROL = 'public, max-age=31536000, immutable';

/** Content types accepted post-compression → key extension. */
const COMPRESSED_IMAGE_TYPES: Record<string, string> = {
	'image/webp': 'webp',
	'image/avif': 'avif'
};

function extensionOf(contentType: string): string | null {
	return COMPRESSED_IMAGE_TYPES[contentType.toLowerCase().split(';')[0].trim()] ?? null;
}

/**
 * Content-addressed key: same bytes ⇒ same key ⇒ `head()` dedupe can hit.
 * Flat under `media/` on purpose: the read route `/api/media/[key]` is a
 * single-segment param (and re-prefixes `media/` itself), so nested keys
 * like `media/sha256/…` would 404.
 */
function buildKey(hash: string, ext: string): string {
	return `media/${hash}.${ext}`;
}

async function sha256Hex(bytes: Uint8Array): Promise<string> {
	const digest = await crypto.subtle.digest('SHA-256', bytes as unknown as ArrayBuffer);
	return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('');
}

// ==================== POST: Upload ====================
export const POST: RequestHandler = async (event) => {
	// Early return before touching the request body (§5.10.3).
	const denied = await requireAdmin(event);
	if (denied) return denied;

	let r2: R2Bucket | undefined;
	let d1: D1Database | undefined;
	try {
		const b = getBindings();
		r2 = b.halalneo_assets;
		d1 = b.DB;
	} catch {
		r2 = undefined;
		d1 = undefined;
	}
	if (!d1) return json({ error: 'Database unavailable' }, { status: 503 });
	if (!r2) return json({ error: 'R2 bucket unavailable' }, { status: 503 });

	// Reject oversized uploads before reading them into memory.
	const contentLength = Number(event.request.headers.get('content-length') || 0);
	if (contentLength > MAX_SIZE) {
		return json({ error: `File too large (max ${MAX_SIZE / 1024 / 1024} MB)` }, { status: 413 });
	}

	const formData = await event.request.formData();
	const file = formData.get('file');
	if (!file || !(file instanceof File)) {
		return json({ error: 'No file provided' }, { status: 400 });
	}

	const contentType = file.type.toLowerCase().split(';')[0].trim();
	const ext = extensionOf(contentType);
	if (!ext) {
		return json(
			{
				error:
					'Only pre-compressed image/webp or image/avif uploads are accepted. ' +
					'Compress on the client first (see #lib/utils/image-compress.ts compressImageToWebP) — ' +
					'uploading originals to R2 is forbidden by docs/development-rules.md §5.11.'
			},
			{ status: 400 }
		);
	}

	if (file.size > MAX_SIZE) {
		return json({ error: `File too large (max ${MAX_SIZE / 1024 / 1024} MB)` }, { status: 413 });
	}

	try {
		const bytes = new Uint8Array(await file.arrayBuffer());
		const hash = await sha256Hex(bytes);
		const key = buildKey(hash, ext);
		const db = getDb(d1);
		// /api/media sits in hooks.server.ts PUBLIC_PATHS, so handleBetterAuth
		// never fills event.locals — resolve the session explicitly.
		const session = await getSession(event);
		const userId = typeof session?.user?.id === 'string' ? session.user.id : '';
		if (!userId) return json({ error: 'Unauthorized' }, { status: 401 });

		// §5.12.1 — head() before put(): skip the Class A write when the exact
		// bytes already live in the bucket.
		const existing = await r2.head(key);
		const deduped = Boolean(existing);
		if (!deduped) {
			await r2.put(key, bytes, {
				httpMetadata: { contentType, cacheControl: CACHE_CONTROL }
			});
		}

		const alt = formData.get('alt')?.toString() || null;

		// Metadata dedupe mirrors the object dedupe (media.key is UNIQUE).
		const [existingRow] = await db
			.select({
				id: media.id,
				key: media.key,
				contentType: media.contentType,
				size: media.size
			})
			.from(media)
			.where(eq(media.key, key))
			.limit(1);

		const record =
			existingRow ??
			(await db
				.insert(media)
				.values({
					key,
					filename: file.name,
					contentType,
					size: bytes.byteLength,
					uploadedBy: userId,
					alt
				})
				.returning({
					id: media.id,
					key: media.key,
					contentType: media.contentType,
					size: media.size
				})
				.get());

		let baseUrl = '';
		try {
			baseUrl = getBindings().ORIGIN || '';
		} catch {
			baseUrl = new URL(event.request.url).origin;
		}

		return json(
			{
				id: record.id,
				// Served URLs omit the `media/` storage prefix — the read route
				// re-adds it (see buildKey above).
				url: `${baseUrl}/api/media/${record.key.replace(/^media\//, '')}`,
				key: record.key,
				contentType: record.contentType,
				size: record.size,
				deduped,
				alt
			},
			{ status: existingRow ? 200 : 201 }
		);
	} catch (err) {
		const message = err instanceof Error ? err.message : 'Upload failed';
		return json({ error: message }, { status: 500 });
	}
};
