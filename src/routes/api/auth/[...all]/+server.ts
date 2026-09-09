import type { RequestHandler } from './$types';
import { createAuth } from '#lib/server/auth.js';
import { getBindings } from '#lib/server/bindings.js';

async function handleAuth(request: Request) {
	let d1: any = null;
	try {
		d1 = getBindings().DB;
	} catch {
		d1 = null;
	}
	if (!d1) return new Response('Database unavailable', { status: 503 });
	return createAuth(d1).handler(request);
}

export const GET: RequestHandler = async ({ request }) => handleAuth(request);
export const POST: RequestHandler = async ({ request }) => handleAuth(request);
