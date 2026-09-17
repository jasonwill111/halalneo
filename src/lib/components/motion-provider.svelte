<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { canUseMotion, prefersReducedMotion } from '#lib/utils/motion';
	import { browser } from '$app/environment';
	import { animate } from 'motion';

	let reducedMotion = $state(true);
	let usesMotion = $state(false);
	let rafId = $state(0);

	// Track active press animations per element (avoids duplicate animations, Apple §3)
	const pressAnims = new WeakMap<HTMLElement, ReturnType<typeof animate>>();

	// Cancel an animation safely using its .cancel() method
	function cancelAnim(anim: ReturnType<typeof animate> | undefined) {
		if (anim && typeof (anim as { cancel?: () => void }).cancel === 'function') {
			(anim as { cancel: () => void }).cancel();
		}
	}

	// 在设备上注入全局运动增强
	onMount(() => {
		if (!browser) return;

		reducedMotion = prefersReducedMotion();
		usesMotion = canUseMotion();

		// 为全局可触摸元素添加增强
		injectEnhancements();

		// 监听减少运动偏好变化
		const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		const handleChange = (e: MediaQueryListEvent) => {
			reducedMotion = e.matches;
		};

		mediaQuery.addEventListener('change', handleChange);

		// 清理
		return () => {
			mediaQuery.removeEventListener('change', handleChange);
			if (rafId) cancelAnimationFrame(rafId);
		};
	});

	// 注入全局运动增强
	function injectEnhancements() {
		// 增强所有按钮
		const buttons = document.querySelectorAll('button, [role="button"]');
		buttons.forEach((button) => {
			button.addEventListener('pointerdown', handleButtonPress);
			button.addEventListener('touchstart', handleButtonPress);
		});

		// 增强卡片悬浮
		const cards = document.querySelectorAll('.card');
		cards.forEach((card) => {
			card.style.touchAction = 'pan-x';
			card.style.cursor = 'pointer';
		});
	}

	// 按钮按压处理
	function handleButtonPress(e: Event) {
		if (reducedMotion || !usesMotion) return;

		const target = e.target as HTMLElement;
		
		// 只增强符合要求的按钮（不是内联事件）
		if (target.dataset.noMotion) return;

		// 如果有当前动画，先取消
		cancelAnim(pressAnims.get(target));

		// 创建弹簧动画（可中断）
		const anim = animate(target, {
			scale: 0.97,
		}, {
			type: 'spring',
			damping: 1.0,
			stiffness: 200,
			duration: 0.1,
		});

		pressAnims.set(target, anim);

		// Release: spring back to rest (Apple §3, §5 — interruptible, starts from current value)
		const handleEnd = () => {
			cancelAnim(pressAnims.get(target));
			// Animate back to scale 1 with a critically damped spring
			animate(target, { scale: 1 }, {
				type: 'spring',
				damping: 1.0,
				stiffness: 200,
				duration: 0.3,
			});
			pressAnims.delete(target);
		};

		document.addEventListener('mouseup', handleEnd, { once: true });
		document.addEventListener('touchend', handleEnd, { once: true });
	}
</script>

{slot}
