import type { RequestHandler } from './$types';
import { resolve } from '$app/paths';

const BASE_URL = 'https://halalneo.com';

const staticRoutes = [
	'/',
	'/about',
	'/faq',
	'/contact',
	'/blog',
	'/categories',
	'/suppliers',
	'/products',
	'/tools',
	'/knowledge-base',
	'/glossary',
	'/search',
	'/login',
	'/register'
];

export const prerender = true;

export const GET: RequestHandler = async () => {
	const urls = staticRoutes
		.map(
			(route) => `<url>
  <loc>${BASE_URL}${resolve(route)}</loc>
  <changefreq>${route === '/' ? 'daily' : 'weekly'}</changefreq>
  <priority>${route === '/' ? '1.0' : '0.8'}</priority>
</url>`
		)
		.join('\n');

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

	return new Response(body, {
		headers: {
			'Content-Type': 'application/xml',
			'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400'
		}
	});
};
