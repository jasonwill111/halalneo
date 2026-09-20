<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Card } from '#lib/components/ui/card/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import { Field, FieldLabel, FieldError } from '#lib/components/ui/field/index.js';
	import { Skeleton } from '#lib/components/ui/skeleton/index.js';
	import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '#lib/components/ui/table/index.js';
	import {
		Dialog,
		DialogContent,
		DialogFooter,
		DialogHeader,
		DialogTitle
	} from '#lib/components/ui/dialog/index.js';
	import { Empty } from '#lib/components/ui/empty/index.js';
	import BrandedEmptyMedia from '#lib/components/site/branded-empty-media.svelte';
	import { toast } from 'svelte-sonner';
	import ConfirmDialog from '#lib/components/site/confirm-dialog.svelte';
	import { z } from 'zod';
	import { focusFirstInvalid } from '#lib/utils/forms.js';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import FileText from '@lucide/svelte/icons/file-text';
	import type { ApiList, SuccessStoryItem } from '#lib/types/api.js';

	let stories = $state<SuccessStoryItem[]>([]);
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
	let fieldErrors = $state<Record<string, string>>({});
	let formEl = $state<HTMLFormElement | undefined>(undefined);

	const storySchema = z.object({
		slug: z.string().trim().min(1, 'Slug is required.').regex(/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, numbers and dashes.'),
		title: z.string().trim().min(1, 'Title is required.'),
		body: z.string().trim().min(1, 'Body is required.')
	});

	let confirmSlug = $state<string | null>(null);
	let confirmTitle = $state('');

	async function refresh() {
		loading = true;
		try {
			const res = await fetch('/api/success-stories?status=all&limit=100');
			if (res.ok) stories = ((await res.json()) as ApiList<SuccessStoryItem>).items ?? [];
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
		fieldErrors = {};
		const parsed = storySchema.safeParse({ slug, title, body });
		if (!parsed.success) {
			for (const issue of parsed.error.issues) {
				const key = String(issue.path[0] ?? '');
				if (key && !fieldErrors[key]) fieldErrors = { ...fieldErrors, [key]: issue.message };
			}
			focusFirstInvalid(formEl);
			return;
		}
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
			const j = (await res.json().catch(() => ({}))) as { error?: string };
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
				toast.success('Story published');
			} else {
				formError = j.error ?? 'Failed to publish.';
				toast.error(formError ?? 'Failed to publish.');
			}
		} finally {
			sending = false;
		}
	}

	async function remove(slug: string) {
		confirmSlug = slug;
		confirmTitle = stories.find((s) => s.slug === slug)?.title ?? slug;
	}

	async function confirmedRemove() {
		if (!confirmSlug) return;
		try {
			const res = await fetch(`/api/success-stories/${confirmSlug}`, { method: 'DELETE' });
			if (res.ok) {
				toast.success('Story deleted');
				await refresh();
			} else {
				const j = (await res.json().catch(() => ({}))) as { error?: string };
				toast.error(j.error ?? 'Failed to delete.');
			}
		} finally {
			confirmSlug = null;
		}
	}
</script>

<svelte:head>
	<title>Success Stories — Admin</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="flex items-center justify-between gap-2">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">Success Stories</h1>
		<p class="text-sm text-muted-foreground">Editorial case studies — site page + supplier sections.</p>
	</div>
	<Button size="sm" class="gap-1 text-xs" onclick={() => ((formError = null), (dialogOpen = true))}>
		<Plus class="size-3.5" />
		Publish story
	</Button>
</div>

<div class="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
<Card class="p-0 ring-0">
	{#if loading}
		<div class="space-y-2 p-4">
			{#each Array(4) as _, i (i)}
				<Skeleton class="h-9 w-full" />
			{/each}
		</div>
	{:else if stories.length === 0}
		<div class="p-6">
			<Empty>
				<BrandedEmptyMedia><FileText class="size-6 text-muted-foreground" /></BrandedEmptyMedia>
				<div class="space-y-1 text-center">
					<p class="font-medium">No stories yet</p>
					<p class="text-sm text-muted-foreground">Publish the first success story.</p>
				</div>
			</Empty>
		</div>
	{:else}
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead class="text-2xs">Title</TableHead>
					<TableHead class="text-2xs">Supplier</TableHead>
					<TableHead class="text-2xs">Deal</TableHead>
					<TableHead class="text-2xs">Status</TableHead>
					<TableHead class="text-2xs text-end">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#each stories as s (s.slug)}
					<TableRow>
						<TableCell class="max-w-[220px] truncate text-2xs-plus font-medium">{s.title}</TableCell>
						<TableCell class="text-2xs text-muted-foreground">{s.supplierSlug ?? '—'}</TableCell>
						<TableCell class="text-2xs text-muted-foreground">{s.dealValue ?? '—'}</TableCell>
						<TableCell>
							<Badge variant="secondary" class="text-2xs">{s.status ?? 'draft'}</Badge>
						</TableCell>
						<TableCell class="text-end">
							<Button
								variant="ghost"
								size="icon"
								aria-label="Delete"
								class="hover:bg-destructive/10 hover:text-destructive"
								onclick={() => remove(s.slug)}
							>
								<Trash2 class="size-4" />
							</Button>
						</TableCell>
					</TableRow>
				{/each}
			</TableBody>
		</Table>
	{/if}
</Card>
</div>

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
			bind:this={formEl}
			onsubmit={(e) => {
				e.preventDefault();
				publish();
			}}
		>
			<div class="grid gap-2 sm:grid-cols-2">
				<Field>
					<FieldLabel>Slug *</FieldLabel>
					<Input type="text" bind:value={slug} placeholder="nusantara-foods-uae-deal" class="text-xs" aria-invalid={!!fieldErrors.slug} oninput={() => (fieldErrors = { ...fieldErrors, slug: '' })} />
					{#if fieldErrors.slug}<FieldError>{fieldErrors.slug}</FieldError>{/if}
				</Field>
				<Field>
					<FieldLabel>Deal value</FieldLabel>
					<Input type="text" bind:value={dealValue} placeholder="$120K first order" class="text-xs" />
				</Field>
			</div>
			<Field>
				<FieldLabel>Title *</FieldLabel>
				<Input type="text" bind:value={title} placeholder="How X won..." class="text-xs" aria-invalid={!!fieldErrors.title} oninput={() => (fieldErrors = { ...fieldErrors, title: '' })} />
				{#if fieldErrors.title}<FieldError>{fieldErrors.title}</FieldError>{/if}
			</Field>
			<Field>
				<FieldLabel>Excerpt</FieldLabel>
				<Input type="text" bind:value={excerpt} placeholder="One-line summary" class="text-xs" />
			</Field>
			<Field>
				<FieldLabel>Body (Markdown) *</FieldLabel>
				<Textarea bind:value={body} rows={6} class="text-xs" placeholder="The story: buyer need, how the match happened, outcome..." aria-invalid={!!fieldErrors.body} oninput={() => (fieldErrors = { ...fieldErrors, body: '' })} />
				{#if fieldErrors.body}<FieldError>{fieldErrors.body}</FieldError>{/if}
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
				<Button type="submit" size="sm" disabled={sending}>
					{sending ? 'Publishing...' : 'Publish'}
				</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>

<ConfirmDialog
	open={confirmSlug !== null}
	title="Delete story?"
	description={`Delete story "${confirmTitle}"? This cannot be undone.`}
	confirmLabel="Delete"
	onconfirm={confirmedRemove}
/>
