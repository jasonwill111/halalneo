<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import ChevronLeft from '@lucide/svelte/icons/chevron-left';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';

	interface Props {
		page: number;
		totalPages: number;
	}

	let { page = $bindable(1), totalPages }: Props = $props();
</script>

{#if totalPages > 1}
	<nav class="mt-6 flex items-center justify-center gap-1" aria-label="Pagination">
		<Button
			variant="outline"
			size="icon"
			class="size-8"
			disabled={page === 1}
			onclick={() => (page = Math.max(1, page - 1))}
			aria-label="Previous page"
		>
			<ChevronLeft class="size-4" />
		</Button>
		{#each Array(totalPages) as _, i}
			{@const p = i + 1}
			{#if p === 1 || p === totalPages || Math.abs(p - page) <= 1}
				<Button
					variant={p === page ? 'default' : 'outline'}
					size="icon"
					class="size-8 text-xs"
					aria-label={`Page ${p}`}
					aria-current={p === page ? 'page' : undefined}
					onclick={() => (page = p)}>{p}</Button
				>
			{:else if Math.abs(p - page) === 2}
				<span class="px-1 text-xs text-muted-foreground">…</span>
			{/if}
		{/each}
		<Button
			variant="outline"
			size="icon"
			class="size-8"
			disabled={page === totalPages}
			onclick={() => (page = Math.min(totalPages, page + 1))}
			aria-label="Next page"
		>
			<ChevronRight class="size-4" />
		</Button>
	</nav>
{/if}
