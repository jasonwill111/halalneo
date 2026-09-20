<script lang="ts">
	import type { Snippet } from 'svelte';
	import EmptyMedia, {
		type EmptyMediaVariant
	} from '#lib/components/ui/empty/empty-media.svelte';
	import Mark from './mark.svelte';
	import { cn } from '#lib/utils.js';

	interface Props {
		class?: string;
		variant?: EmptyMediaVariant;
		children?: Snippet;
	}

	// Branded empty-state icon slot: low-opacity octagram (design plan §3.3)
	// behind the foreground icon, one tier up from the page texture (4-6%).
	let { class: className, variant = 'default', children }: Props = $props();
</script>

<EmptyMedia {variant} class={cn(className)}>
	<span class="relative inline-flex items-center justify-center text-muted-foreground">
		<Mark variant="pattern" class="absolute size-16 opacity-30 dark:opacity-40" />
		<span class="relative inline-flex">{@render children?.()}</span>
	</span>
</EmptyMedia>
