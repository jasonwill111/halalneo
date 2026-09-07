import type { RequestHandler } from './$types';
import { createAuth } from '#lib/server/auth.js';

async function handleAuth(request: Request, platform: App.Platform | undefined) {
	const d1 = (platform?.env as App.Platform['env'] | undefined)?.DB;
	if (!d1) return new Response('Database unavailable', { status: 503 });
	return createAuth(d1).handler(request);
}

export const GET: RequestHandler = async ({ request, platform }) => handleAuth(request, platform);
export const POST: RequestHandler = async ({ request, platform }) => handleAuth(request, platform);
