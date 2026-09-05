<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import ChevronDown from '@lucide/svelte/icons/chevron-down';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import type { Snippet } from 'svelte';

	interface Props {
		title: string;
		description?: string;
		defaultOpen?: boolean;
		open?: boolean;
		icon?: Snippet;
		headerAction?: Snippet;
		children: Snippet;
	}

	let {
		title,
		description,
		defaultOpen = true,
		open = $bindable(defaultOpen),
		icon,
		headerAction,
		children
	}: Props = $props();
</script>

<section class="rounded-lg border border-border/60 bg-card/50">
	<Button
		variant="ghost"
		size="sm"
		type="button"
		onclick={() => (open = !open)}
		class="h-auto w-full justify-between rounded-lg px-3 py-2.5 text-left font-medium hover:bg-accent/50"
		aria-expanded={open}
	>
		<span class="flex items-center gap-2">
			{#if icon}<span class="text-muted-foreground">{@render icon()}</span>{/if}
			<span class="text-sm">{title}</span>
			{#if description}
				<span class="text-[10px] text-muted-foreground">— {description}</span>
			{/if}
		</span>
		<span class="flex items-center gap-2">
			{#if headerAction}{@render headerAction()}{/if}
			{#if open}
				<ChevronDown class="size-4 text-muted-foreground" />
			{:else}
				<ChevronRight class="size-4 text-muted-foreground" />
			{/if}
		</span>
	</Button>
	{#if open}
		<div class="space-y-3 border-t border-border/60 p-3">
			{@render children()}
		</div>
	{/if}
</section>
