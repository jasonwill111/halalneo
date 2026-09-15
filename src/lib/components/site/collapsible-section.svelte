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

	let contentEl = $state<HTMLDivElement | undefined>(undefined);
	let height = $state(0);

	$effect(() => {
		if (contentEl) {
			height = contentEl.scrollHeight;
		}
	});
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
			<span class="transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]" class:rotate-180={open}>
				<ChevronDown class="size-4 text-muted-foreground" />
			</span>
		</span>
	</Button>
	<div
		bind:this={contentEl}
		style:--content-height="{height}px"
		class="content-animate overflow-hidden transition-[height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]"
		data-state={open ? 'open' : 'closed'}
	>
		<div class="space-y-3 border-t border-border/60 p-3">
			{@render children()}
		</div>
	</div>
</section>
