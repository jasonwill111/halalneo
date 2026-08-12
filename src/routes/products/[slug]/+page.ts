import { skus } from '$lib/data/skus';
import type { EntryGenerator } from './$types';

export const entries: EntryGenerator = () => skus.map((s) => ({ slug: s.slug }));
