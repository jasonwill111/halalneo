<script lang="ts">
	import ArrowUp from '@lucide/svelte/icons/arrow-up';
	import { Button } from '#lib/components/ui/button/index.js';
	import { onMount } from 'svelte';

	let visible = $state(false);
	let processing = $state(false);

	// Mount-only listeners (window + admin inner main) — no reactive deps,
	// so onMount is the right primitive (not $effect).
	onMount(() => {
		// Public pages scroll on window; admin layout scrolls an inner main.h-dvh.
		const innerMain = document.querySelector('main.h-dvh');
		const onScroll = () => {
			const y = Math.max(window.scrollY, innerMain?.scrollTop ?? 0);
			visible = y > 400;
		};
		onScroll();
		window.addEventListener('scroll', onScroll, { passive: true });
		innerMain?.addEventListener('scroll', onScroll, { passive: true });
		return () => {
			window.removeEventListener('scroll', onScroll);
			innerMain?.removeEventListener('scroll', onScroll);
		};
	});

	function scrollToTop() {
		if (processing) return;
		processing = true;
		window.scrollTo({ top: 0, behavior: 'smooth' });
		setTimeout(() => (processing = false), 600);
	}
</script>

{#if visible}
	<Button
		variant="outline"
		size="icon"
		onclick={scrollToTop}
		aria-label="Back to top"
		class="fixed end-3 bottom-20 z-50 flex size-11 items-center justify-center rounded-full shadow-md motion-safe:animate-fade-in md:end-4 md:bottom-4 md:size-9"
	>
		<ArrowUp class="size-4" />
	</Button>
{/if}
