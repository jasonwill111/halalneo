import { aiTools } from '$lib/data/ai-tools';
import type { EntryGenerator } from './$types';

export const entries: EntryGenerator = () =>
	aiTools.filter((t) => t.status === 'active').map((t) => ({ slug: t.slug }));
