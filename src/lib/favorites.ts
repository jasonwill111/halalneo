const STORAGE_KEY = 'halalneo_favorites';

export function getFavorites(): string[] {
	if (typeof window === 'undefined') return [];
	try {
		return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
	} catch {
		return [];
	}
}

export function toggleFavorite(slug: string): boolean {
	const favorites = getFavorites();
	const index = favorites.indexOf(slug);
	if (index > -1) {
		favorites.splice(index, 1);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
		return false;
	} else {
		favorites.push(slug);
		localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
		return true;
	}
}

export function isFavorite(slug: string): boolean {
	return getFavorites().includes(slug);
}
