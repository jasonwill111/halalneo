<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { cn, type WithElementRef } from '#lib/utils.js';
	import type { HTMLAttributes } from 'svelte/elements';

	let {
		ref = $bindable(null),
		class: className,
		number,
		title,
		description,
		href,
		linkLabel,
		children,
		...restProps
	}: WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		/** Section number, e.g. '01'. Omit for a plain section head. */
		number?: string;
		title: string;
		description?: string;
		/** Optional trailing link, e.g. '/categories'. */
		href?: string;
		/** Label for the trailing link, e.g. 'View all'. */
		linkLabel?: string;
	} = $props();
</script>

<div bind:this={ref} class={cn('mb-3 sm:mb-4', className)} {...restProps}>
	<div class="flex flex-wrap items-baseline gap-x-3 gap-y-1">
		{#if number}
			<span
				class="text-xl font-extrabold tracking-tight text-primary/70 tabular-nums sm:text-2xl"
				aria-hidden="true"
			>
				{number}
			</span>
		{/if}
		<h2 class="text-base font-semibold sm:text-lg">{title}</h2>
		{#if href && linkLabel}
			<a
				href={localizeHref(href)}
				class="ml-auto text-[11px] text-primary hover:underline sm:text-xs">{linkLabel}</a
			>
		{:else if description}
			<p class="w-full text-[11px] text-muted-foreground sm:text-xs sm:w-auto sm:ml-auto sm:text-right">
				{description}
			</p>
		{/if}
	</div>
	{#if children}
		{@render children()}
	{/if}
</div>
