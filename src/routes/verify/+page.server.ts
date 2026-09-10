import type { PageServerLoad } from './$types';
import { getDb } from '#lib/server/db/index.js';
import { getBindings } from '#lib/server/bindings.js';
import { certifyingBodies } from '#lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ url }) => {
	const q = url.searchParams.get('q') ?? '';

	let certifiers: { id: string; name: string; country: string }[] = [];
	try {
		const db = getDb(getBindings().DB);
		certifiers = await db
			.select({ id: certifyingBodies.id, name: certifyingBodies.name, country: certifyingBodies.country })
			.from(certifyingBodies)
			.where(eq(certifyingBodies.status, 'active'))
			.limit(100);
	} catch {
		certifiers = [];
	}

	return {
		q,
		certifiers,
		seo: {
			title: q
				? `Verify "${q}" — Halal Certificate Check`
				: 'Halal Certificate Verification — Search by Brand, Product or Certifier',
			description:
				'Search halal certification status across JAKIM, MUI, ESMA, GAC, IFANCA and 50+ certifying bodies. Verify certificates by number, brand or product name.',
			ogImage: 'https://halalneo.com/api/media/og-default.png'
		}
	};
};
