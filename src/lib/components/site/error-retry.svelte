<script lang="ts">
	import { refreshAll } from '$app/navigation';
	import { Button } from '#lib/components/ui/button/index.js';
	import type { LoadFailure } from '#lib/utils/load-error.js';
	import LoaderCircle from '@lucide/svelte/icons/loader-circle';
	import RotateCw from '@lucide/svelte/icons/rotate-cw';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import WifiOff from '@lucide/svelte/icons/wifi-off';

	interface Props {
		/** Failure recorded by a loader (`data.loadError`) or a client-side fetch. `null` renders nothing. */
		failure: LoadFailure | null | undefined;
		/** What could not be loaded, e.g. "products" → "Couldn’t load products". */
		subject?: string;
		/**
		 * Custom refetch for pages that fetch in `+page.svelte`. Loader-driven pages omit this
		 * and get `refreshAll()`, which re-runs `+page.ts`.
		 */
		onretry?: (() => void | Promise<void>) | undefined;
	}

	let { failure, subject = 'this list', onretry }: Props = $props();

	let retrying = $state(false);

	const title = $derived(
		failure?.kind === 'network' ? 'You appear to be offline' : `Couldn’t load ${subject}`
	);

	async function retry() {
		if (retrying || !failure) return;
		retrying = true;
		try {
			await (onretry ? onretry() : refreshAll());
		} finally {
			retrying = false;
		}
	}
</script>

{#if failure}
	<div
		role="alert"
		class="flex w-full flex-col items-center gap-3 rounded-xl border border-dashed border-destructive/20 bg-destructive/5 p-6 text-center"
	>
		<div
			class="flex size-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive"
		>
			{#if failure.kind === 'network'}
				<WifiOff class="size-5" />
			{:else}
				<TriangleAlert class="size-5" />
			{/if}
		</div>
		<div class="max-w-sm space-y-1">
			<p class="text-sm font-medium tracking-tight">{title}</p>
			<p class="text-sm/relaxed text-muted-foreground">
				{failure.message}{#if failure.status > 0}
					<span class="text-2xs"> (error {failure.status})</span>
				{/if}
			</p>
		</div>
		<Button variant="outline" size="sm" disabled={retrying} onclick={retry}>
			{#if retrying}
				<LoaderCircle class="size-3.5 animate-spin" data-icon="inline-start" />
				Retrying…
			{:else}
				<RotateCw class="size-3.5" data-icon="inline-start" />
				Try again
			{/if}
		</Button>
	</div>
{/if}
