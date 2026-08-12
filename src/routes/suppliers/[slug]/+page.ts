import { merchants } from '$lib/data/merchants';
import type { EntryGenerator } from './$types';

export const entries: EntryGenerator = () => merchants.map((m) => ({ slug: m.slug }));
