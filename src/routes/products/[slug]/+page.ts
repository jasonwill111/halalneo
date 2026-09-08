import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

// Detail pages moved to /product/[slug]; keep the plural URL as a permanent redirect.
export const load: PageLoad = async ({ params }) => {
	redirect(301, `/product/${params.slug}`);
};
