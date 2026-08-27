export interface CompressOptions {
	maxWidth?: number;
	maxHeight?: number;
	quality?: number;
	format?: 'image/jpeg' | 'image/webp' | 'image/png';
}

const DEFAULTS: CompressOptions = {
	maxWidth: 1920,
	maxHeight: 1920,
	quality: 0.82,
	format: 'image/jpeg'
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

			if (width > opts.maxWidth! || height > opts.maxHeight!) {
				const ratio = Math.min(opts.maxWidth! / width, opts.maxHeight! / height);
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

export function formatFileSize(bytes: number): string {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
