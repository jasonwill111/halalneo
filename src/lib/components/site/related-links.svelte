<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';

	let {
		title = 'Related',
		items,
		compact = false
	}: {
		title?: string;
		items: { label: string; description?: string; href: string }[];
		compact?: boolean;
	} = $props();
</script>

{#if items.length > 0}
	<section class="mt-8 border-t border-border pt-6">
		<h2 class="mb-3 text-sm font-semibold text-foreground">{title}</h2>
		<div class="grid gap-2 {compact ? 'sm:grid-cols-2' : 'sm:grid-cols-3'}">
			{#each items as item (item.href)}
				<a
					href={localizeHref(item.href)}
					class="group flex items-center gap-2 rounded-lg bg-card p-2.5 ring-1 ring-foreground/10 transition-all hover:shadow-md"
				>
					<div class="min-w-0 flex-1">
						<h3 class="truncate text-xs font-medium transition-colors group-hover:text-primary">
							{item.label}
						</h3>
						{#if item.description}
							<p class="mt-0.5 truncate text-[10px] text-muted-foreground">{item.description}</p>
						{/if}
					</div>
					<ArrowUpRight
						class="size-3.5 shrink-0 text-muted-foreground/50 transition-colors group-hover:text-primary"
					/>
				</a>
			{/each}
		</div>
	</section>
{/if}
