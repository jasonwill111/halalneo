import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createAuth } from '#lib/server/auth.js';
import { getDb } from '#lib/server/db/index.js';
import { media } from '#lib/server/db/schema.js';

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const THUMBNAIL_WIDTH = 300;
const COMPRESS_QUALITY = 82;

function generateKey(filename: string, suffix = ''): string {
	const ext = getExtension(filename);
	const hash = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
	const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
	const suffixPart = suffix ? `_${suffix}` : '';
	return `media/${date}/${hash}${suffixPart}.${ext}`;
}

function getExtension(filename: string): string {
	const dot = filename.lastIndexOf('.');
	if (dot === -1) return 'bin';
	return filename.slice(dot + 1).toLowerCase();
}

function isImageType(type: string): boolean {
	return (IMAGE_TYPES as readonly string[]).includes(type);
}

function uint8ToStream(data: Uint8Array): ReadableStream<Uint8Array> {
	return new Response(new Blob([data as unknown as BlobPart])).body as ReadableStream<Uint8Array>;
}

async function compressImage(
	images: ImagesBinding | undefined,
	data: Uint8Array,
	contentType: string
): Promise<{ data: Uint8Array; contentType: string } | null> {
	if (!images) return null;

	try {
		const stream = uint8ToStream(data);
		const result = await images
			.input(stream)
			.transform({})
			.output({
				format: 'image/webp',
				quality: COMPRESS_QUALITY
			});

		const outputData = await collectStream(result.image());
		return {
			data: outputData,
			contentType: result.contentType()
		};
	} catch {
		return null;
	}
}

async function generateThumbnail(
	images: ImagesBinding | undefined,
	data: Uint8Array
): Promise<{ data: Uint8Array; contentType: string } | null> {
	if (!images) return null;

	try {
		const stream = uint8ToStream(data);
		const result = await images
			.input(stream)
			.transform({
				width: THUMBNAIL_WIDTH,
				fit: 'scale-down'
			})
			.output({
				format: 'image/webp',
				quality: COMPRESS_QUALITY
			});

		const outputData = await collectStream(result.image());
		return {
			data: outputData,
			contentType: result.contentType()
		};
	} catch {
		return null;
	}
}

async function collectStream(stream: ReadableStream<Uint8Array>): Promise<Uint8Array> {
	const reader = stream.getReader();
	const chunks: Uint8Array[] = [];
	let totalLength = 0;

	while (true) {
		const { done, value } = await reader.read();
		if (done) break;
		chunks.push(value);
		totalLength += value.length;
	}

	const result = new Uint8Array(totalLength);
	let offset = 0;
	for (const chunk of chunks) {
		result.set(chunk, offset);
		offset += chunk.length;
	}
	return result;
}

// ==================== POST: Upload ====================
export const POST: RequestHandler = async ({ request, platform }) => {
	const db = platform?.env?.DB;
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	// Pre-check file size before reading into memory
	const contentLength = Number(request.headers.get('content-length') || 0);
	if (contentLength > MAX_SIZE) {
		return json({ error: `File too large (max ${MAX_SIZE / 1024 / 1024} MB)` }, { status: 413 });
	}

	const auth = createAuth(db);
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

	const formData = await request.formData();
	const file = formData.get('file');

	if (!file || !(file instanceof File)) {
		return json({ error: 'No file provided' }, { status: 400 });
	}

	const contentType = file.type;
	if (!isImageType(contentType)) {
		return json(
			{ error: `Unsupported type: ${contentType}. Allowed: JPEG, PNG, WebP` },
			{ status: 400 }
		);
	}

	if (file.size > MAX_SIZE) {
		return json({ error: `File too large (max ${MAX_SIZE / 1024 / 1024} MB)` }, { status: 400 });
	}

	const images = platform?.env?.IMAGES as ImagesBinding | undefined;
	const r2 = platform?.env?.halalneo_assets as R2Bucket | undefined;
	if (!r2) return json({ error: 'R2 bucket unavailable' }, { status: 503 });

	try {
		const originalKey = generateKey(file.name);
		const originalData = new Uint8Array(await file.arrayBuffer());

		// Compress original
		let finalData = originalData;
		let finalContentType = contentType;
		let compressed = false;

		if (images) {
			const compressedResult = await compressImage(images, originalData, contentType);
			if (compressedResult) {
				finalData = new Uint8Array(compressedResult.data.buffer as ArrayBuffer);
				finalContentType = compressedResult.contentType;
				compressed = true;
			}
		}

		// Generate thumbnail
		let thumbnailKey: string | null = null;
		if (images) {
			const thumbResult = await generateThumbnail(images, originalData);
			if (thumbResult) {
				thumbnailKey = generateKey(file.name, 'thumb');
				await r2.put(thumbnailKey, thumbResult.data, {
					httpMetadata: {
						contentType: thumbResult.contentType,
						cacheControl: 'public, max-age=31536000, immutable'
					}
				});
			}
		}

		// Upload final image to R2
		await r2.put(originalKey, finalData, {
			httpMetadata: {
				contentType: finalContentType,
				cacheControl: 'public, max-age=31536000, immutable'
			}
		});

		// Save metadata to D1
		const alt = formData.get('alt')?.toString() || null;
		const dbClient = getDb(db);
		const record = await dbClient
			.insert(media)
			.values({
				key: originalKey,
				filename: file.name,
				contentType: finalContentType,
				size: finalData.byteLength,
				uploadedBy: session.user.id,
				thumbnailKey,
				alt
			})
			.returning()
			.get();

		const baseUrl = platform?.env?.ORIGIN || '';

		return json(
			{
				id: record.id,
				url: `${baseUrl}/api/media/${record.key}`,
				key: record.key,
				thumbnailUrl: thumbnailKey ? `${baseUrl}/api/media/${thumbnailKey}` : null,
				thumbnailKey,
				contentType: finalContentType,
				originalContentType: contentType,
				size: finalData.byteLength,
				originalSize: originalData.byteLength,
				compressed,
				alt
			},
			{ status: 201 }
		);
	} catch (e: any) {
		return json({ error: e?.message ?? 'Upload failed' }, { status: 500 });
	}
};


