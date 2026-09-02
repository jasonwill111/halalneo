import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const body = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /account/
Disallow: /supplier/
Disallow: /api/

Sitemap: https://halalneo.com/sitemap.xml`;

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain',
			'Cache-Control': 'public, max-age=86400'
		}
	});
};
