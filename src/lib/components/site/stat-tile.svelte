<script lang="ts">
	import type { Snippet } from 'svelte';

	type Tone = 'info' | 'warn' | 'success' | 'accent-purple' | 'accent-rose' | 'primary';

	interface Props {
		value: string | number;
		label: string;
		tone?: Tone;
		hint?: string;
		icon?: Snippet;
		loading?: boolean;
	}

	let { value, label, tone = 'info', hint, icon, loading = false }: Props = $props();

	const toneClass = $derived(
		{
			info: 'text-info',
			warn: 'text-warn',
			success: 'text-success',
			'accent-purple': 'text-accent-purple',
			'accent-rose': 'text-accent-rose',
			primary: 'text-primary'
		}[tone]
	);
</script>

<div
	class="min-w-0 flex-1 rounded-md bg-card px-1.5 py-1.5 text-center ring-1 ring-foreground/10 sm:rounded-xl sm:px-3 sm:py-3"
>
	<div class="flex items-center justify-center gap-1.5">
		{#if icon}
			<span class={toneClass}>
				{@render icon()}
			</span>
		{/if}
		{#if loading}
			<div class="h-6 w-12 animate-pulse rounded bg-muted"></div>
		{:else}
			<div class="text-base font-bold sm:text-2xl {toneClass}">{value}</div>
		{/if}
	</div>
	<div class="truncate text-[10px] text-muted-foreground sm:text-xs">{label}</div>
	{#if hint}
		<div class="hidden truncate text-[10px] text-muted-foreground/70 sm:block">{hint}</div>
	{/if}
</div>
