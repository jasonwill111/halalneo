/**
 * GA4 analytics helpers (client-side only).
 *
 * The gtag stub itself is installed synchronously in `src/app.html`
 * (works even before the library loads — commands queue on `dataLayer`).
 * Because SvelteKit navigates client-side, the automatic page_view must be
 * disabled (`send_page_view: false` in the `config` call) and every route
 * change reported manually — see the `afterNavigate` hook in the root layout.
 */

export const GA_MEASUREMENT_ID = 'G-7XP063VED4';

declare global {
	interface Window {
		dataLayer?: unknown[][];
		gtag?: (...args: unknown[]) => void;
	}
}

/** Returns true when the gtag stub from `app.html` is present. */
export function isAnalyticsReady(): boolean {
	return typeof window !== 'undefined' && typeof window.gtag === 'function';
}

/**
 * Report a page view for a client-side navigation.
 * No-op when analytics is unavailable (Save-Data users, blockers, SSR).
 */
export function trackPageView(url: URL, title: string): void {
	if (!isAnalyticsReady()) return;
	window.gtag?.('event', 'page_view', {
		page_path: url.pathname + url.search,
		page_location: url.href,
		page_title: title
	});
}
