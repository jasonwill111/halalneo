import type { RequestHandler } from './$types';
import { resolve } from '$app/paths';

export const GET: RequestHandler = async () => {
	const body = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /account/
Disallow: /supplier/
Disallow: /api/

Sitemap: https://halalneo.com${resolve('/sitemap.xml')}`;

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain',
			'Cache-Control': 'public, max-age=86400'
		}
	});
};
