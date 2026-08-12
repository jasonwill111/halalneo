import { kbArticles } from '$lib/data/kb-articles';
import type { EntryGenerator } from './$types';

export const entries: EntryGenerator = () =>
	kbArticles.map((a) => ({ section: a.section, article: a.slug }));
