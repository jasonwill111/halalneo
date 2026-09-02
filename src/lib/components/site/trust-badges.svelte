<script lang="ts">
	import { Badge } from '#lib/components/ui/badge/index.js';
	import BadgeCheckIcon from '@lucide/svelte/icons/badge-check';
	import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';

	let {
		certifications = [],
		status = 'pending',
		compact = false
	}: {
		certifications?: unknown[];
		status?: string;
		compact?: boolean;
	} = $props();

	const parsedCerts = $derived.by(() => {
		const raw = certifications ?? [];
		let list: unknown[] = [];
		if (typeof raw === 'string') {
			try {
				list = JSON.parse(raw);
			} catch {
				list = [];
			}
		} else if (Array.isArray(raw)) {
			list = raw;
		}
		return list.map((c: any) => {
			if (typeof c === 'string') return c;
			if (c?.body?.name) return c.body.name;
			if (c?.name && !c?.scope) return c.name;
			if (c?.name) return c.name;
			return '';
		}).filter(Boolean);
	});

	const wellKnown = $derived(
		parsedCerts.filter((n) =>
			['JAKIM', 'MUI', 'ESMA', 'GAC', 'IFANCA', 'SFDA', 'GIMDES', 'HFC', 'BPJPH', 'LPPOM', 'HSA', 'PSQCA'].some(
				(k) => n.toUpperCase().includes(k)
			)
		)
	);

	const verified = $derived(status === 'active' || status === 'certified');
</script>

{#if compact}
	<div class="flex flex-wrap items-center gap-1">
		{#if verified}
			<span class="inline-flex items-center gap-1 rounded-md bg-green-500/15 px-1.5 py-0.5 text-[10px] font-medium text-green-600 dark:text-green-400">
				<ShieldCheckIcon class="size-3" />
				Verified
			</span>
		{/if}
		{#each wellKnown.slice(0, 2) as name}
			<span class="inline-flex items-center gap-1 rounded-md bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary">
				<BadgeCheckIcon class="size-3" />
				{name.split(/[-–]/)[0].trim()}
			</span>
		{/each}
		{#if parsedCerts.length > wellKnown.length}
			<span class="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
				+{parsedCerts.length - wellKnown.length}
			</span>
		{/if}
	</div>
{:else}
	<div class="flex flex-wrap items-center gap-1.5">
		{#if verified}
			<Badge class="bg-green-500/15 text-green-600 dark:text-green-400 hover:bg-green-500/25">
				<ShieldCheckIcon class="size-3" />
				Verified Supplier
			</Badge>
		{/if}
		{#each parsedCerts.slice(0, 4) as name}
			<Badge variant="secondary" class="gap-1">
				<BadgeCheckIcon class="size-3 text-primary" />
				{name}
			</Badge>
		{/each}
		{#if parsedCerts.length > 4}
			<Badge variant="secondary">+{parsedCerts.length - 4}</Badge>
		{/if}
	</div>
{/if}
