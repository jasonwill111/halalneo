import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { AwsClient } from 'aws4fetch';
import { createAuth } from '#lib/server/auth.js';

const ALLOWED_TYPES = [
	'image/jpeg',
	'image/png',
	'image/webp',
	'image/gif',
	'image/svg+xml',
	'application/pdf'
];
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

function generateKey(filename: string): string {
	const ext = filename.split('.').pop() ?? 'bin';
	const hash = crypto.randomUUID().replace(/-/g, '').slice(0, 16);
	const date = new Date().toISOString().slice(0, 10).replace(/-/g, '');
	return `media/${date}/${hash}.${ext}`;
}

export const POST: RequestHandler = async ({ request, platform }) => {
	const db = platform?.env?.DB;
	if (!db) return json({ error: 'Database unavailable' }, { status: 503 });

	const auth = createAuth(db);
	const session = await auth.api.getSession({ headers: request.headers });
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

	const body = await request.json().catch(() => null);
	if (!body?.filename || !body?.contentType) {
		return json({ error: 'filename and contentType required' }, { status: 400 });
	}

	if (!ALLOWED_TYPES.includes(body.contentType)) {
		return json({ error: `Unsupported type: ${body.contentType}` }, { status: 400 });
	}

	if (body.size && body.size > MAX_SIZE) {
		return json({ error: 'File too large (max 10 MB)' }, { status: 400 });
	}

	const key = generateKey(body.filename);

	const accountId = platform?.env?.CLOUDFLARE_ACCOUNT_ID;
	const accessKeyId = platform?.env?.R2_ACCESS_KEY_ID;
	const secretAccessKey = platform?.env?.R2_SECRET_ACCESS_KEY;

	if (!accountId || !accessKeyId || !secretAccessKey) {
		return json({ error: 'R2 credentials not configured' }, { status: 500 });
	}

	const aws = new AwsClient({
		region: 'auto',
		accessKeyId,
		secretAccessKey
	});

	const bucketName = 'halalneo-media';
	const endpoint = `https://${accountId}.r2.cloudflarestorage.com/${bucketName}/${key}`;

	const presigned = await aws.sign(endpoint, {
		method: 'PUT',
		headers: {
			'Content-Type': body.contentType,
			'Cache-Control': 'public, max-age=31536000, immutable'
		},
		expiresIn: 300 // 5 minutes
	});

	return json({
		uploadUrl: presigned.url.toString(),
		key,
		method: 'PUT',
		headers: Object.fromEntries(presigned.headers.entries())
	});
};
