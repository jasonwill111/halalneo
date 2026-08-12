import { blogPosts } from '$lib/data/blog';
import type { EntryGenerator } from './$types';

export const entries: EntryGenerator = () =>
	blogPosts.filter((p) => p.status === 'published').map((p) => ({ slug: p.slug }));
