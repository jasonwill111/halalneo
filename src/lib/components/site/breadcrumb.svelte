<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	let { items }: { items: { label: string; href?: string }[] } = $props();
</script>

<nav class="mb-3 flex items-center gap-1 text-2xs text-muted-foreground">
	<a href={localizeHref('/')} class="transition-colors hover:text-primary">Home</a>
	{#each items as item, i (item.href ?? item.label)}
		<ChevronRight class="size-2.5 rtl:rotate-180"></ChevronRight>
		{#if item.href && i < items.length - 1}
			<a href={localizeHref(item.href)} class="transition-colors hover:text-primary">{item.label}</a
			>
		{:else}
			<span class="font-medium text-foreground">{item.label}</span>
		{/if}
	{/each}
</nav>
