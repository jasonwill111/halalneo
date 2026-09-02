<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	let { items }: { items: { label: string; href?: string }[] } = $props();
</script>

<nav class="mb-3 flex items-center gap-1 text-[10px] text-muted-foreground">
	<a href={localizeHref('/')} class="hover:text-primary transition-colors">Home</a>
	{#each items as item, i}
		<ChevronRight class="size-2.5"></ChevronRight>
		{#if item.href && i < items.length - 1}
			<a href={localizeHref(item.href)} class="hover:text-primary transition-colors">{item.label}</a>
		{:else}
			<span class="text-foreground font-medium">{item.label}</span>
		{/if}
	{/each}
</nav>
