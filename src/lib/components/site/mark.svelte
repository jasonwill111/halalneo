<script lang="ts">
	import { cn } from '#lib/utils.js';

	type Variant = 'outline' | 'solid' | 'pattern';

	interface Props {
		variant?: Variant;
		class?: string;
	}

	// Rub el hizb (octagram): two interlocked squares, 64x64 grid.
	const SQUARE_A = 'M15 15L49 15L49 49L15 49Z';
	const SQUARE_B = 'M32 7.96L56.04 32L32 56.04L7.96 32Z';
	const SOLID_STAR =
		'M32 7.96 L 39.04 15 L 49 15 L 49 24.96 L 56.04 32 L 49 39.04 L 49 49 L 39.04 49 L 32 56.04 L 24.96 49 L 15 49 L 15 39.04 L 7.96 32 L 15 24.96 L 15 15 L 24.96 15 Z';

	let { variant = 'outline', class: className }: Props = $props();
</script>

{#if variant === 'solid'}
	<svg viewBox="0 0 64 64" class={cn('size-6', className)} fill="currentColor" aria-hidden="true">
		<path d={SOLID_STAR}></path>
	</svg>
{:else if variant === 'pattern'}
	<svg
		viewBox="0 0 64 64"
		class={cn('size-6 opacity-[0.06] dark:opacity-[0.09]', className)}
		fill="none"
		stroke="currentColor"
		stroke-width="2.5"
		aria-hidden="true"
	>
		<path d={SQUARE_A}></path>
		<path d={SQUARE_B}></path>
	</svg>
{:else}
	<svg
		viewBox="0 0 64 64"
		class={cn('size-6', className)}
		fill="none"
		stroke="currentColor"
		stroke-width="4"
		stroke-linejoin="round"
		aria-hidden="true"
	>
		<path d={SQUARE_A}></path>
		<path d={SQUARE_B}></path>
	</svg>
{/if}
