import { categories } from '$lib/data/categories';
import type { EntryGenerator } from './$types';

export const entries: EntryGenerator = () => categories.map((c) => ({ slug: c.slug }));
