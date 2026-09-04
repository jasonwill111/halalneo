<script lang="ts">
	import ExternalLink from '@lucide/svelte/icons/external-link';

	let {
		href,
		label,
		variant = 'button'
	}: {
		href: string;
		label: string;
		variant?: 'button' | 'link';
	} = $props();
</script>

{#if href}
	<a
		{href}
		target="_blank"
		rel="noopener noreferrer"
		class={variant === 'button'
			? 'inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-all hover:text-primary hover:shadow-md'
			: 'inline-flex items-center gap-1 text-xs font-medium text-primary underline-offset-4 hover:underline'}
	>
		{label}
		<ExternalLink class="size-3" />
	</a>
{:else}
	<span class="text-[10px] text-muted-foreground">Official website not on record</span>
{/if}
