/**
 * Client-side image compression (§5.11 of docs/development-rules.md).
 *
 * Workers must not process images (§5.10.4) and Cloudflare Image Resizing is a
 * paid feature (§5.12), so the only sanctioned pipeline is: compress in the
 * browser → upload the already-compressed bytes. `/api/media/upload` rejects
 * anything that is not `image/webp` / `image/avif` for exactly this reason, so
 * `compressImageToWebP` is the helper every upload UI should call first.
 */

export interface CompressOptions {
	maxWidth?: number;
	maxHeight?: number;
	quality?: number;
	/** Only compressed still formats — originals must never reach R2 (§5.11). */
	format?: 'image/webp' | 'image/avif';
}

const DEFAULTS: Required<CompressOptions> = {
	maxWidth: 1920,
	maxHeight: 1920,
	quality: 0.82,
	format: 'image/webp'
};

export async function compressImage(
	file: File,
	options: CompressOptions = {}
): Promise<{ blob: Blob; width: number; height: number }> {
	const opts = { ...DEFAULTS, ...options };

	return new Promise((resolve, reject) => {
		const img = new Image();
		const url = URL.createObjectURL(file);

		img.onload = () => {
			URL.revokeObjectURL(url);

			let { width, height } = img;

			if (width > opts.maxWidth || height > opts.maxHeight) {
				const ratio = Math.min(opts.maxWidth / width, opts.maxHeight / height);
				width = Math.round(width * ratio);
				height = Math.round(height * ratio);
			}

			const canvas = document.createElement('canvas');
			canvas.width = width;
			canvas.height = height;

			const ctx = canvas.getContext('2d');
			if (!ctx) {
				reject(new Error('Failed to get canvas context'));
				return;
			}

			ctx.drawImage(img, 0, 0, width, height);

			canvas.toBlob(
				(blob) => {
					if (!blob) {
						reject(new Error('Failed to compress image'));
						return;
					}
					resolve({ blob, width, height });
				},
				opts.format,
				opts.quality
			);
		};

		img.onerror = () => {
			URL.revokeObjectURL(url);
			reject(new Error('Failed to load image'));
		};

		img.src = url;
	});
}

/**
 * Ready-to-upload WebP: downscale + re-encode on the client, returning a `File`
 * whose `type` is `image/webp` so it can be appended straight into the
 * `FormData` sent to `POST /api/media/upload`.
 */
export async function compressImageToWebP(
	file: File,
	options: CompressOptions = {}
): Promise<File> {
	const { blob } = await compressImage(file, { ...options, format: 'image/webp' });
	const dot = file.name.lastIndexOf('.');
	const base = dot === -1 ? file.name : file.name.slice(0, dot);
	return new File([blob], `${base || 'image'}.webp`, { type: 'image/webp' });
}

export function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
