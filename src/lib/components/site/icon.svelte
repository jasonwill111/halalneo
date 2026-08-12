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
		SearchCheck
	} as const;

	let {
		name,
		class: className = 'size-4'
	}: { name: string; class?: string } = $props();

	const Icon = $derived(icons[name as keyof typeof icons] ?? Sparkles);
</script>

<Icon class={className} />