/**
 * Minimal real-user Core Web Vitals collector (no dependency).
 * Observes LCP + CLS + INP and beacons them to /api/vitals on pagehide.
 *
 * Notes / known approximations (v1):
 * - INP here is the max observed interaction latency, an upper bound on the
 *   true p98-based INP. Good enough for trend detection, not for CrUX parity.
 * - Values accumulate across SPA navigations; the page label is read lazily
 *   at send time (the page being left). Per-navigation attribution is a
 *   future improvement.
 */
export function initWebVitals(): void {
	if (typeof window === 'undefined' || typeof PerformanceObserver === 'undefined') return;

	const pending = new Map<string, number>();

	function send(): void {
		if (pending.size === 0) return;
		const page = window.location.pathname.slice(0, 200) || '/';
		const payload = JSON.stringify(
			[...pending.entries()].map(([metric, value]) => ({ metric, value, page }))
		);
		pending.clear();
		try {
			if (navigator.sendBeacon) {
				navigator.sendBeacon('/api/vitals', payload);
			} else {
				void fetch('/api/vitals', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: payload,
					keepalive: true
				});
			}
		} catch {
			// telemetry must never throw
		}
	}

	// Largest Contentful Paint — last entry wins
	try {
		const lcpObs = new PerformanceObserver((list) => {
			const entries = list.getEntries();
			const last = entries[entries.length - 1] as PerformanceEntry & {
				renderTime?: number;
				loadTime?: number;
			};
			if (last) pending.set('LCP', Math.round(last.renderTime || last.loadTime || 0));
		});
		lcpObs.observe({ type: 'largest-contentful-paint', buffered: true });
	} catch {
		// unsupported browser — skip
	}

	// Cumulative Layout Shift — sum of unexpected shifts
	try {
		let cls = 0;
		const clsObs = new PerformanceObserver((list) => {
			for (const e of list.getEntries() as (PerformanceEntry & {
				hadRecentInput?: boolean;
				value?: number;
			})[]) {
				if (!e.hadRecentInput && typeof e.value === 'number') cls += e.value;
			}
			pending.set('CLS', Math.round(cls * 1000) / 1000);
		});
		clsObs.observe({ type: 'layout-shift', buffered: true });
	} catch {
		// unsupported browser — skip
	}

	// Interaction to Next Paint (approximation: max event duration)
	try {
		const inpObs = new PerformanceObserver((list) => {
			let max = pending.get('INP') ?? 0;
			for (const e of list.getEntries() as (PerformanceEntry & {
				interactionId?: number;
			})[]) {
				if (e.interactionId && e.duration > max) max = Math.round(e.duration);
			}
			if (max > 0) pending.set('INP', max);
		});
		inpObs.observe({
			type: 'event',
			buffered: true,
			durationThreshold: 16
		} as PerformanceObserverInit);
	} catch {
		// unsupported browser — skip
	}

	document.addEventListener('visibilitychange', () => {
		if (document.visibilityState === 'hidden') send();
	});
	window.addEventListener('pagehide', send);
}
