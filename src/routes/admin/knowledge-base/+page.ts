export const prerender = false;

export const load = async ({ fetch }) => {
	try {
		const res = await fetch('/api/kb?limit=50');
		if (res.ok) {
			const data = await res.json();
			return { articles: data.articles ?? data ?? [], error: null };
		}
		return { articles: [], error: `Failed to load: ${res.status}` };
	} catch (e) {
		return { articles: [], error: 'Failed to connect to API.' };
	}
};
