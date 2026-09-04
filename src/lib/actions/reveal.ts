/**
 * Scroll-reveal action: adds `.reveal` on mount, then `.in` when the element
 * enters the viewport. Reduced-motion users see content immediately because
 * layout.css disables the transition and shows `.reveal` at full opacity.
 *
 * Usage: <div use:reveal>...</div>
 */
export function reveal(node: HTMLElement) {
	node.classList.add('reveal');

	if (typeof IntersectionObserver === 'undefined') {
		node.classList.add('in');
		return;
	}

	const observer = new IntersectionObserver(
		(entries) => {
			for (const entry of entries) {
				if (entry.isIntersecting) {
					node.classList.add('in');
					observer.disconnect();
				}
			}
		},
		{ threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
	);

	observer.observe(node);

	return {
		destroy() {
			observer.disconnect();
		}
	};
}
