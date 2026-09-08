import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

// Detail pages moved to /supplier/[slug]; keep the plural URL as a permanent redirect.
export const load: PageLoad = async ({ params }) => {
	redirect(301, `/supplier/${params.slug}`);
};
