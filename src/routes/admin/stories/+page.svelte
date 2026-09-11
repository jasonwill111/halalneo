<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Card } from '#lib/components/ui/card/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import { Field, FieldLabel } from '#lib/components/ui/field/index.js';
	import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '#lib/components/ui/table/index.js';
	import {
		Dialog,
		DialogContent,
		DialogFooter,
		DialogHeader,
		DialogTitle
	} from '#lib/components/ui/dialog/index.js';
	import Plus from '@lucide/svelte/icons/plus';

	let stories = $state<any[]>([]);
	let loading = $state(true);

	let dialogOpen = $state(false);
	let slug = $state('');
	let title = $state('');
	let excerpt = $state('');
	let body = $state('');
	let supplierSlug = $state('');
	let buyerCountry = $state('');
	let dealValue = $state('');
	let image = $state('');
	let sending = $state(false);
	let formError = $state<string | null>(null);

	async function refresh() {
		loading = true;
		try {
			const res = await fetch('/api/success-stories?status=all&limit=100');
			if (res.ok) stories = (((await res.json()) as any).items ?? []);
		} catch {
			stories = [];
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		refresh();
	});

	async function publish() {
		if (!slug.trim() || !title.trim() || !body.trim()) return;
		sending = true;
		formError = null;
		try {
			const res = await fetch('/api/success-stories', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					slug: slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g, '-'),
					title: title.trim(),
					excerpt: excerpt.trim() || null,
					body,
					supplierSlug: supplierSlug.trim() || null,
					buyerCountry: buyerCountry.trim() || null,
					dealValue: dealValue.trim() || null,
					image: image.trim() || null
				})
			});
			const j = (await res.json().catch(() => ({}))) as any;
			if (res.ok) {
				dialogOpen = false;
				slug = '';
				title = '';
				excerpt = '';
				body = '';
				supplierSlug = '';
				buyerCountry = '';
				dealValue = '';
				image = '';
				await refresh();
			} else {
				formError = j.error ?? 'Failed to publish.';
			}
		} finally {
			sending = false;
		}
	}
</script>

<svelte:head>
	<title>Success Stories — Admin</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="mb-3 flex items-center justify-between gap-2">
	<div>
		<h1 class="text-lg font-bold">Success Stories</h1>
		<p class="text-[11px] text-muted-foreground">Editorial case studies — site page + supplier sections.</p>
	</div>
	<Button size="sm" class="gap-1 text-xs" onclick={() => ((formError = null), (dialogOpen = true))}>
		<Plus class="size-3.5" />
		Publish story
	</Button>
</div>

<Card class="p-0">
	{#if loading}
		<p class="p-6 text-center text-xs text-muted-foreground">Loading…</p>
	{:else if stories.length === 0}
		<p class="p-6 text-center text-xs text-muted-foreground">No stories yet — publish the first one.</p>
	{:else}
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead class="text-[10px]">Title</TableHead>
					<TableHead class="text-[10px]">Supplier</TableHead>
					<TableHead class="text-[10px]">Deal</TableHead>
					<TableHead class="text-[10px]">Status</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#each stories as s (s.slug)}
					<TableRow>
						<TableCell class="max-w-[220px] truncate text-[11px] font-medium">{s.title}</TableCell>
						<TableCell class="text-[10px] text-muted-foreground">{s.supplierSlug ?? '—'}</TableCell>
						<TableCell class="text-[10px] text-muted-foreground">{s.dealValue ?? '—'}</TableCell>
						<TableCell>
							<Badge variant="secondary" class="text-[10px]">{s.status ?? 'draft'}</Badge>
						</TableCell>
					</TableRow>
				{/each}
			</TableBody>
		</Table>
	{/if}
</Card>

<Dialog bind:open={dialogOpen}>
	<DialogContent class="max-h-[90vh] overflow-y-auto sm:max-w-lg">
		<DialogHeader>
			<DialogTitle>Publish success story</DialogTitle>
		</DialogHeader>
		{#if formError}
			<p class="rounded-xl bg-destructive/10 px-3 py-2 text-xs text-destructive">{formError}</p>
		{/if}
		<form
			class="space-y-2"
			onsubmit={(e) => {
				e.preventDefault();
				publish();
			}}
		>
			<div class="grid gap-2 sm:grid-cols-2">
				<Field>
					<FieldLabel>Slug *</FieldLabel>
					<Input type="text" bind:value={slug} placeholder="nusantara-foods-uae-deal" class="text-xs" />
				</Field>
				<Field>
					<FieldLabel>Deal value</FieldLabel>
					<Input type="text" bind:value={dealValue} placeholder="$120K first order" class="text-xs" />
				</Field>
			</div>
			<Field>
				<FieldLabel>Title *</FieldLabel>
				<Input type="text" bind:value={title} placeholder="How X won..." class="text-xs" />
			</Field>
			<Field>
				<FieldLabel>Excerpt</FieldLabel>
				<Input type="text" bind:value={excerpt} placeholder="One-line summary" class="text-xs" />
			</Field>
			<Field>
				<FieldLabel>Body (Markdown) *</FieldLabel>
				<Textarea bind:value={body} rows={6} class="text-xs" placeholder="The story: buyer need, how the match happened, outcome..." />
			</Field>
			<div class="grid gap-2 sm:grid-cols-3">
				<Field>
					<FieldLabel>Supplier slug</FieldLabel>
					<Input type="text" bind:value={supplierSlug} class="text-xs" />
				</Field>
				<Field>
					<FieldLabel>Buyer country</FieldLabel>
					<Input type="text" bind:value={buyerCountry} class="text-xs" />
				</Field>
				<Field>
					<FieldLabel>Image URL</FieldLabel>
					<Input type="text" bind:value={image} class="text-xs" />
				</Field>
			</div>
			<DialogFooter>
				<Button type="submit" size="sm" disabled={sending || !slug.trim() || !title.trim() || !body.trim()}>
					{sending ? 'Publishing...' : 'Publish'}
				</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>
