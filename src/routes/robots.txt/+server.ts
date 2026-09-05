import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const body = `User-agent: *
Allow: /
Disallow: /admin/
Disallow: /account/
Disallow: /supplier/
Disallow: /api/

# AI answer engines — allowed to READ public content (GEO).
# Answers/search indexing only; training is opted out below
# via the Cloudflare AI content signal (ai-train=no).
User-agent: GPTBot
Allow: /
Disallow: /admin/
Disallow: /account/
Disallow: /supplier/
Disallow: /api/

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: ClaudeBot
Allow: /
Disallow: /admin/
Disallow: /account/
Disallow: /supplier/
Disallow: /api/

User-agent: Claude-Web
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Bytespider
Allow: /

# Aggressive scrapers still blocked
User-agent: CCBot
Disallow: /

Sitemap: https://halalneo.com/sitemap.xml`;

	return new Response(body, {
		headers: {
			'Content-Type': 'text/plain',
			'Cache-Control': 'public, max-age=86400'
		}
	});
};
