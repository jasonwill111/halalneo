import { kbSections } from '$lib/data/kb-sections';
import type { EntryGenerator } from './$types';

export const entries: EntryGenerator = () => kbSections.map((s) => ({ section: s.slug }));
