<script lang="ts">
	import Globe from '@lucide/svelte/icons/globe';
	import { cn } from '#lib/utils.js';

	interface Props {
		country: string;
		flag?: string;
		region?: string;
		class?: string;
		rounded?: string;
	}

	let { country, flag, region, class: className, rounded = 'rounded-xl' }: Props = $props();

	// Deterministic gradient per country (stable hue from name hash)
	const hue = $derived(
		[...country].reduce((acc, ch) => acc + ch.charCodeAt(0), 0) % 360
	);
</script>

<div
	class={cn(
		'relative flex items-center justify-center overflow-hidden',
		rounded,
		className
	)}
	style={`background: linear-gradient(135deg, hsl(${hue} 45% 32%) 0%, hsl(${(hue + 40) % 360} 50% 22%) 100%)`}
	role="img"
	aria-label={`${country} market illustration`}
>
	<div
		class="pointer-events-none absolute inset-0 opacity-20"
		style="background-image: radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px); background-size: 22px 22px;"
	></div>
	<div class="relative flex flex-col items-center gap-1 p-4 text-center">
		{#if flag}
			<span class="text-3xl leading-none drop-shadow-md">{flag}</span>
		{:else}
			<Globe class="size-6 text-white/70" />
		{/if}
		<span class="text-sm font-bold tracking-tight text-white drop-shadow-md">{country}</span>
		{#if region}
			<span class="text-[10px] font-medium tracking-wide text-white/70 uppercase">{region}</span>
		{/if}
	</div>
</div>
