<script lang="ts">
	import { ToggleGroup } from '#lib/components/ui/toggle-group/index.js';
	import { cn } from '#lib/utils.js';

	interface Option {
		value: string;
		label: string;
		count?: number;
	}

	interface Props {
		options: Option[];
		value: string;
		size?: 'sm' | 'default';
		variant?: 'default' | 'outline';
		ariaLabel?: string;
		class?: string;
	}

	let {
		options,
		value = $bindable(''),
		size = 'sm',
		variant = 'outline',
		ariaLabel,
		class: className
	}: Props = $props();
</script>

<ToggleGroup
	type="single"
	bind:value
	{size}
	{variant}
	class={cn('flex flex-wrap gap-1.5', className)}
	aria-label={ariaLabel}
>
	{#each options as opt (opt.value)}
		<ToggleGroup.Item {size} {variant} value={opt.value} class="gap-1.5">
			<span>{opt.label}</span>
			{#if opt.count !== undefined}
				<span class="opacity-70">{opt.count}</span>
			{/if}
		</ToggleGroup.Item>
	{/each}
</ToggleGroup>
