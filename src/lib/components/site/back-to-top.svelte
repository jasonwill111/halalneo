<script lang="ts">
	import ArrowUp from '@lucide/svelte/icons/arrow-up';
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
	<button
		onclick={scrollToTop}
		aria-label="Back to top"
		class="fixed right-3 bottom-3 z-50 flex size-8 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-md transition-all duration-300 outline-none hover:shadow-lg hover:border-primary/30 focus-visible:ring-3 focus-visible:ring-ring/50 active:scale-95 motion-safe:animate-fade-in sm:right-4 sm:bottom-4"
	>
		<ArrowUp class="size-4" />
	</button>
{/if}
