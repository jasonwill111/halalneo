<script lang="ts">
	import UtensilsCrossed from '@lucide/svelte/icons/utensils-crossed';
	import Drumstick from '@lucide/svelte/icons/drumstick';
	import Milk from '@lucide/svelte/icons/milk';
	import Candy from '@lucide/svelte/icons/candy';
	import CupSoda from '@lucide/svelte/icons/cup-soda';
	import Pill from '@lucide/svelte/icons/pill';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import Handshake from '@lucide/svelte/icons/handshake';
	import Truck from '@lucide/svelte/icons/truck';
	import Package from '@lucide/svelte/icons/package';
	import Globe from '@lucide/svelte/icons/globe';
	import SearchCheck from '@lucide/svelte/icons/search-check';
	import Calendar from '@lucide/svelte/icons/calendar';
	import Briefcase from '@lucide/svelte/icons/briefcase';
	import Newspaper from '@lucide/svelte/icons/newspaper';
	import Syringe from '@lucide/svelte/icons/syringe';
	import FlaskConical from '@lucide/svelte/icons/flask-conical';

	const icons = {
		UtensilsCrossed,
		Drumstick,
		Milk,
		Candy,
		CupSoda,
		Pill,
		Sparkles,
		ShieldCheck,
		Handshake,
		Truck,
		Package,
		Globe,
		SearchCheck,
		Calendar,
		Briefcase,
		Newspaper,
		Syringe,
		FlaskConical
	} as const;

	// rub el hizb micro-badge (same motif as site/mark.svelte), scaled from the 64 grid
	const STAR_A = 'M15 15L49 15L49 49L15 49Z';
	const STAR_B = 'M32 7.96L56.04 32L32 56.04L7.96 32Z';

	let {
		name,
		verified = false,
		class: className = 'size-4'
	}: { name: string; verified?: boolean; class?: string } = $props();

	const Icon = $derived(icons[name as keyof typeof icons] ?? Sparkles);
</script>

{#if verified}
	<span class="relative inline-flex shrink-0">
		<Icon class={className} />
		<svg
			viewBox="0 0 64 64"
			class="absolute -top-1 -end-1 size-2.5 text-success sm:size-2"
			fill="none"
			stroke="currentColor"
			stroke-width="7"
			aria-hidden="true"
		>
			<path d={STAR_A} />
			<path d={STAR_B} />
		</svg>
	</span>
{:else}
	<Icon class={className} />
{/if}
