<script lang="ts">
	import { navigating } from '$app/state';

	// §3.1 global navigation feedback: a thin token-coloured bar while a route change is
	// in flight. `fixed` + height-only means zero layout shift; opacity animation only, so
	// the global `prefers-reduced-motion` rule neutralises it without hiding the state.
	// Kit 3.0.0-next has no `pending` in `$app/state`, so `navigating` is the signal.

	/** Instant/preloaded navigations should not flash the bar. */
	const SHOW_DELAY_MS = 150;

	let visible = $state(false);

	$effect(() => {
		if (navigating.to === null) {
			visible = false;
			return;
		}
		const timer = setTimeout(() => {
			visible = true;
		}, SHOW_DELAY_MS);
		return () => clearTimeout(timer);
	});
</script>

{#if visible}
	<div
		role="progressbar"
		aria-label="Loading page"
		class="pointer-events-none fixed inset-x-0 top-0 z-[60] h-0.5 bg-primary/15"
	>
		<div class="h-full w-full animate-pulse bg-primary"></div>
	</div>
{/if}
