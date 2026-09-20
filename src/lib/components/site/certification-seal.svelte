<script lang="ts">
	import { cn } from '#lib/utils.js';

	type SealStatus = 'certified' | 'pending' | 'expired' | 'not-certified';

	interface Props {
		/** Certifier display name, e.g. "JAKIM". */
		name: string;
		status?: SealStatus;
		scope?: string | null;
		/** Render the full name line under the ring (off in dense card rows). */
		showName?: boolean;
		class?: string;
	}

	// rub el hizb (two interlocked squares) scaled into the 56px ring interior —
	// same motif as site/mark.svelte, kept tiny so it reads as a seal core.
	const SQUARE_A = 'M18.5 18.5L37.5 18.5L37.5 37.5L18.5 37.5Z';
	const SQUARE_B = 'M28 12.6L43.4 28L28 43.4L12.6 28Z';

	let {
		name,
		status = 'certified',
		scope = null,
		showName = false,
		class: className
	}: Props = $props();

	const statusClass = $derived(
		status === 'certified'
			? 'text-success'
			: status === 'pending'
				? 'text-warn'
				: 'text-destructive'
	);

	const abbr = $derived.by(() => {
		const first = name.split(/[-–(,]/)[0].trim();
		const letters = first.replace(/[^A-Za-z0-9]/g, '');
		return (letters || name).slice(0, 7).toUpperCase();
	});

	const fullName = $derived(`${name}${scope ? ` — ${scope}` : ''}`);
</script>

<div
	class={cn('group/seal relative inline-flex w-fit flex-col items-center', statusClass, className)}
	role="img"
	aria-label={`Halal certification seal: ${fullName}`}
	title={fullName}
>
	<svg viewBox="0 0 56 56" class="seal-ring size-10 shrink-0" aria-hidden="true" focusable="false">
		<circle
			cx="28"
			cy="28"
			r="26"
			fill="none"
			stroke="currentColor"
			stroke-width="2.5"
			stroke-dasharray="163.4"
			stroke-dashoffset="163.4"
			class="animate-[seal-draw_var(--transition-duration-slow)_var(--ease-spring)_forwards]"
		/>
		<path d={SQUARE_A} fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.55" />
		<path d={SQUARE_B} fill="none" stroke="currentColor" stroke-width="1.5" opacity="0.55" />
		<text
			x="28"
			y="31.5"
			text-anchor="middle"
			font-size={abbr.length > 5 ? 8 : 10}
			font-weight="600"
			letter-spacing="0.5"
			fill="currentColor"
		>
			{abbr}
		</text>
	</svg>
	{#if showName}
		<span class="mt-1 max-w-16 truncate text-center text-2xs leading-tight text-muted-foreground">
			{name}
		</span>
	{/if}
	{#if scope}
		<span
			class="pointer-events-none absolute top-full left-1/2 z-50 mt-1 hidden w-max max-w-52 -translate-x-1/2 rounded-md border border-border bg-popover px-2 py-1 text-2xs text-popover-foreground shadow-md group-hover/seal:block"
		>
			{scope}
		</span>
	{/if}
</div>

<style>
	@keyframes seal-draw {
		to {
			stroke-dashoffset: 0;
		}
	}
</style>
