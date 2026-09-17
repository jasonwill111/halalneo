import { animate, cancel } from 'motion';
import { prefersReducedMotion } from '#lib/utils/motion.js';

// Apple Design spring curves (§4) — damping 1.0 = critically damped, 0.8 = momentum bounce
const SPRING = { damping: 1.0, stiffness: 200 } as const;

// Track active press animations per element (avoids duplicate animations)
const pressAnims = new WeakMap<HTMLElement, ReturnType<typeof animate>>();

/**
 * Simple press feedback — scale down on press, spring back on release.
 * Used by apple-press-button.svelte for instant down-state feedback (Apple §1, §10).
 */
export function notifyPress(element: HTMLElement) {
	if (!element || prefersReducedMotion()) return;

	// Cancel any existing press animation on this element
	const existing = pressAnims.get(element);
	if (existing) cancel(existing);

	// Press down: scale 0.97 (matches Apple's touch-down highlight)
	const anim = animate(element, { scale: 0.97 }, {
		type: 'spring',
		...SPRING,
		duration: 0.1,
	});
	pressAnims.set(element, anim);

	// Release: spring back to scale 1 with velocity handoff (§3, §5)
	const release = () => {
		const current = pressAnims.get(element);
		if (current) cancel(current);
		animate(element, { scale: 1 }, {
			type: 'spring',
			...SPRING,
			duration: 0.3,
		});
		pressAnims.delete(element);
		document.removeEventListener('mouseup', release);
		document.removeEventListener('touchend', release);
	};

	document.addEventListener('mouseup', release, { once: true });
	document.addEventListener('touchend', release, { once: true });
}

/**
 * Full press action — binds pointer events with setPointerCapture (§2)
 * and velocity-aware release springs (§3, §5).
 */
export function applePress(element: HTMLElement, options: {
	scale?: number;
	stiffness?: number;
	damping?: number;
} = {}) {
	if (!element || prefersReducedMotion()) return { destroy: () => {} };

	const config = {
		scale: 0.97,
		stiffness: SPRING.stiffness,
		damping: SPRING.damping,
		...options,
	};

	function handlePressStart(e: PointerEvent | TouchEvent) {
		if (element.dataset.noMotion) return;

		// setPointerCapture ensures tracking continues outside the element bounds (§2)
		if (e instanceof PointerEvent) {
			element.setPointerCapture(e.pointerId);
		}

		// Cancel any existing animation, then spring to press scale
		const existing = pressAnims.get(element);
		if (existing) cancel(existing);

		const anim = animate(element, { scale: config.scale }, {
			type: 'spring',
			stiffness: config.stiffness,
			damping: config.damping,
			duration: 0.1,
		});
		pressAnims.set(element, anim);
	}

	function handlePressEnd(e: PointerEvent | TouchEvent) {
		if (e instanceof PointerEvent) {
			element.releasePointerCapture(e.pointerId);
		}

		// Spring back to rest — interruptible, starts from current value (§3)
		const existing = pressAnims.get(element);
		if (existing) cancel(existing);

		animate(element, { scale: 1 }, {
			type: 'spring',
			stiffness: config.stiffness,
			damping: config.damping,
			duration: 0.3,
		});
		pressAnims.delete(element);
	}

	element.addEventListener('pointerdown', handlePressStart);
	element.addEventListener('pointerup', handlePressEnd);
	element.addEventListener('pointercancel', handlePressEnd);
	element.addEventListener('pointerleave', handlePressEnd);
	element.addEventListener('touchstart', handlePressStart, { passive: true });
	element.addEventListener('touchend', handlePressEnd, { passive: true });

	return {
		destroy() {
			element.removeEventListener('pointerdown', handlePressStart);
			element.removeEventListener('pointerup', handlePressEnd);
			element.removeEventListener('pointercancel', handlePressEnd);
			element.removeEventListener('pointerleave', handlePressEnd);
			element.removeEventListener('touchstart', handlePressStart);
			element.removeEventListener('touchend', handlePressEnd);
			const anim = pressAnims.get(element);
			if (anim) {
				cancel(anim);
				pressAnims.delete(element);
			}
		},
	};
}

/**
 * Scroll-reveal with spring settle (§11).
 * Elements fade+slide in from below when they enter the viewport.
 */
export function revealSpring(element: HTMLElement, options: {
	threshold?: number;
	rootMargin?: string;
	stiffness?: number;
	damping?: number;
} = {}) {
	if (prefersReducedMotion()) {
		element.style.opacity = '1';
		element.style.transform = 'translateY(0)';
		return { destroy: () => {} };
	}

	const config = {
		threshold: 0.1,
		rootMargin: '0px',
		stiffness: SPRING.stiffness,
		damping: SPRING.damping,
		...options,
	};

	// Start hidden
	element.style.opacity = '0';
	element.style.transform = 'translateY(20px)';
	element.style.willChange = 'opacity, transform';

	const observer = new IntersectionObserver((entries) => {
		for (const entry of entries) {
			if (entry.isIntersecting) {
				animate(element, {
					opacity: 1,
					transform: 'translateY(0)',
				}, {
					type: 'spring',
					stiffness: config.stiffness,
					damping: config.damping,
					duration: 0.3,
				});

				element.style.willChange = 'auto';
				observer.unobserve(entry.target);
			}
		}
	}, {
		threshold: config.threshold,
		rootMargin: config.rootMargin,
	});

	observer.observe(element);

	return {
		destroy() {
			observer.disconnect();
		},
	};
}
