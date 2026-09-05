<script lang="ts">
	import { adminData, upsertItem, deleteItem } from '#lib/stores/admin-data.svelte.js';
	import type { TradeShow } from '#lib/data/types.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '#lib/components/ui/table/index.js';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle
	} from '#lib/components/ui/dialog/index.js';
	import {
		Select,
		SelectGroup,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '#lib/components/ui/select/index.js';
	import Search from '@lucide/svelte/icons/search';
	import Plus from '@lucide/svelte/icons/plus';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import CollapsibleSection from '#lib/components/site/collapsible-section.svelte';
	import StatTile from '#lib/components/site/stat-tile.svelte';

	let search = $state('');
	let dialogOpen = $state(false);
	let editing = $state<TradeShow | null>(null);
	let formError = $state('');

	// Collapsible section state
	let detailsExpanded = $state(false);
	let seoExpanded = $state(false);

	type ShowForm = {
		id: string;
		name: string;
		city: string;
		country: string;
		region: string;
		startDate: string;
		endDate: string;
		venue: string;
		website: string;
		scale: string;
		description: string;
		focus: string;
		exhibitors: string;
		visitors: string;
		metaTitle: string;
		metaDescription: string;
		keywords: string;
		status: string;
	};

	let form = $state<ShowForm>({
		id: '',
		name: '',
		city: '',
		country: '',
		region: '',
		startDate: '',
		endDate: '',
		venue: '',
		website: '',
		scale: 'medium',
		description: '',
		focus: '',
		exhibitors: '',
		visitors: '',
		metaTitle: '',
		metaDescription: '',
		keywords: '',
		status: 'active'
	});

	const regionOptions = ['Asia', 'Europe', 'Middle East', 'North America', 'Africa', 'Oceania'];
	const scaleOptions = ['mega', 'large', 'medium', 'regional'];

	const shows = $derived(adminData.tradeShows ?? []);

	const filtered = $derived.by(() => {
		if (!search.trim()) return shows;
		const q = search.toLowerCase();
		return shows.filter(
			(s) =>
				s.name.toLowerCase().includes(q) ||
				s.country?.toLowerCase().includes(q) ||
				s.city?.toLowerCase().includes(q) ||
				s.id.includes(q)
		);
	});

	function slugify(s: string): string {
		return s
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');
	}

	function openCreate() {
		editing = null;
		form = {
			id: '',
			name: '',
			city: '',
			country: '',
			region: '',
			startDate: '',
			endDate: '',
			venue: '',
			website: '',
			scale: 'medium',
			description: '',
			focus: '',
			exhibitors: '',
			visitors: '',
			metaTitle: '',
			metaDescription: '',
			keywords: '',
			status: 'active'
		};
		formError = '';
		detailsExpanded = false;
		seoExpanded = false;
		dialogOpen = true;
	}

	function openEdit(s: TradeShow) {
		editing = s;
		form = {
			id: s.id,
			name: s.name,
			city: s.city ?? '',
			country: s.country ?? '',
			region: s.region ?? '',
			startDate: s.startDate ?? '',
			endDate: s.endDate ?? '',
			venue: s.venue ?? '',
			website: s.website ?? '',
			scale: s.scale ?? 'medium',
			description: s.description ?? '',
			focus: (s.focus ?? []).join(', '),
			exhibitors: s.exhibitors != null ? String(s.exhibitors) : '',
			visitors: s.visitors != null ? String(s.visitors) : '',
			metaTitle: s.metaTitle ?? '',
			metaDescription: s.metaDescription ?? '',
			keywords: s.keywords ?? '',
			status: s.status ?? 'active'
		};
		formError = '';
		detailsExpanded = false;
		seoExpanded = false;
		dialogOpen = true;
	}

	function parseCommaList(val: string): string[] {
		return val
			.split(',')
			.map((s) => s.trim())
			.filter(Boolean);
	}

	function save() {
		if (!form.name.trim()) {
			formError = 'Show name is required.';
			return;
		}
		if (form.id && !/^[a-z0-9-]+$/.test(form.id)) {
			formError = 'ID may only contain lowercase letters, numbers and dashes.';
			return;
		}

		const updated: TradeShow = {
			id: form.id || slugify(form.name),
			name: form.name.trim(),
			city: form.city.trim() || undefined,
			country: form.country.trim() || undefined,
			region: form.region.trim() || undefined,
			startDate: form.startDate.trim() || undefined,
			endDate: form.endDate.trim() || undefined,
			venue: form.venue.trim() || undefined,
			website: form.website.trim() || undefined,
			scale: form.scale.trim() || undefined,
			description: form.description.trim() || undefined,
			focus: parseCommaList(form.focus),
			exhibitors: form.exhibitors ? Number(form.exhibitors) : undefined,
			visitors: form.visitors ? Number(form.visitors) : undefined,
			metaTitle: form.metaTitle.trim() || undefined,
			metaDescription: form.metaDescription.trim() || undefined,
			keywords: form.keywords.trim() || undefined,
			status: (form.status as TradeShow['status']) ?? 'active'
		};
		upsertItem<TradeShow>('tradeShows', updated, editing ?? undefined);
		dialogOpen = false;
	}

	function remove(s: TradeShow) {
		if (window.confirm(`Delete trade show ${s.name}?`)) {
			deleteItem('tradeShows', s.id);
		}
	}

	function statusColor(s: string): string {
		if (s === 'active') return 'bg-success/10 text-success';
		if (s === 'draft') return 'bg-warn/10 text-warn';
		if (s === 'archived') return 'bg-destructive/10 text-destructive';
		return 'bg-muted text-muted-foreground';
	}

	function formatDate(d: string): string {
		if (!d) return '—';
		try {
			return new Date(d).toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric'
			});
		} catch {
			return d;
		}
	}
</script>

<svelte:head>
	<title>Trade Shows — HalalNeo Admin</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div class="flex flex-col gap-1">
			<h1 class="text-3xl font-semibold tracking-tight">Trade Shows</h1>
			<p class="max-w-2xl text-sm text-muted-foreground">
				Manage halal trade shows, exhibitions, and industry events.
			</p>
		</div>
		<Button variant="default" size="sm" onclick={openCreate}>
			<Plus class="size-4"></Plus>
			Add Show
		</Button>
	</div>

	<div class="relative max-w-sm">
		<Search
			class="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
		></Search>
		<Input bind:value={search} placeholder="Search shows..." class="pl-9" />
	</div>

	<div class="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
		<StatTile value={shows.length} label="Total Shows" />
		<StatTile value={shows.filter((s) => s.status === 'active').length} label="Active" />
		<StatTile value={shows.filter((s) => s.scale === 'mega').length} label="Mega Shows" />
	</div>

	<div class="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
		<Table>
			<TableHeader>
				<TableRow class="hover:bg-transparent">
					<TableHead>Name</TableHead>
					<TableHead>Location</TableHead>
					<TableHead>Dates</TableHead>
					<TableHead>Scale</TableHead>
					<TableHead>Status</TableHead>
					<TableHead class="text-right">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#each filtered as s (s.id)}
					<TableRow>
						<TableCell>
							<div class="min-w-0">
								<p class="truncate font-medium">{s.name}</p>
								<p class="truncate text-xs text-muted-foreground">{s.id}</p>
							</div>
						</TableCell>
						<TableCell>{s.city ? `${s.city}, ${s.country}` : (s.country ?? '—')}</TableCell>
						<TableCell class="text-xs"
							>{formatDate(s.startDate ?? '')} — {formatDate(s.endDate ?? '')}</TableCell
						>
						<TableCell class="capitalize">{s.scale ?? '—'}</TableCell>
						<TableCell>
							<Badge
								variant="secondary"
								class={`px-1.5 py-0.5 text-[10px] capitalize ${statusColor(s.status ?? 'active')}`}
								>{s.status ?? 'active'}</Badge
							>
						</TableCell>
						<TableCell class="text-right">
							<div class="flex items-center justify-end gap-1">
								<Button
									variant="ghost"
									size="icon"
									aria-label="Edit"
									class="size-8"
									onclick={() => openEdit(s)}
								>
									<Pencil class="size-3.5"></Pencil>
								</Button>
								<Button
									variant="ghost"
									size="icon"
									aria-label="Delete"
									class="size-8 hover:bg-destructive/10 hover:text-destructive"
									onclick={() => remove(s)}
								>
									<Trash2 class="size-3.5"></Trash2>
								</Button>
							</div>
						</TableCell>
					</TableRow>
				{:else}
					<TableRow>
						<TableCell colspan={6} class="py-8 text-center text-sm text-muted-foreground">
							No trade shows found.
						</TableCell>
					</TableRow>
				{/each}
			</TableBody>
		</Table>
	</div>
</div>

<Dialog bind:open={dialogOpen}>
	<DialogContent class="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
		<DialogHeader>
			<DialogTitle>{editing ? 'Edit trade show' : 'New trade show'}</DialogTitle>
			<DialogDescription>Create or update a trade show listing.</DialogDescription>
		</DialogHeader>

		<div class="flex flex-col gap-4">
			<Field.Field>
				<Field.FieldLabel>Name *</Field.FieldLabel>
				<Input bind:value={form.name} placeholder="MIHAS 2026" />
			</Field.Field>

			<div class="grid grid-cols-2 gap-4">
				<Field.Field>
					<Field.FieldLabel>ID</Field.FieldLabel>
					<Input bind:value={form.id} placeholder="mihas-2026" disabled={!!editing} />
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Scale</Field.FieldLabel>
					<Select bind:value={form.scale} type="single">
						<SelectTrigger class="w-full">{form.scale}</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								{#each scaleOptions as sc (sc)}
									<SelectItem value={sc}>{sc}</SelectItem>
								{/each}
							</SelectGroup>
						</SelectContent>
					</Select>
				</Field.Field>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<Field.Field>
					<Field.FieldLabel>City</Field.FieldLabel>
					<Input bind:value={form.city} placeholder="Kuala Lumpur" />
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Country</Field.FieldLabel>
					<Input bind:value={form.country} placeholder="Malaysia" />
				</Field.Field>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<Field.Field>
					<Field.FieldLabel>Region</Field.FieldLabel>
					<Select bind:value={form.region} type="single">
						<SelectTrigger class="w-full">
							{form.region || 'Select region'}
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								{#each regionOptions as r (r)}
									<SelectItem value={r}>{r}</SelectItem>
								{/each}
							</SelectGroup>
						</SelectContent>
					</Select>
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Status</Field.FieldLabel>
					<Select bind:value={form.status} type="single">
						<SelectTrigger class="w-full">{form.status}</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectItem value="active">active</SelectItem>
								<SelectItem value="draft">draft</SelectItem>
								<SelectItem value="archived">archived</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
				</Field.Field>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<Field.Field>
					<Field.FieldLabel>Start Date</Field.FieldLabel>
					<Input bind:value={form.startDate} type="date" />
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>End Date</Field.FieldLabel>
					<Input bind:value={form.endDate} type="date" />
				</Field.Field>
			</div>

			<Field.Field>
				<Field.FieldLabel>Description</Field.FieldLabel>
				<Textarea bind:value={form.description} rows={3} placeholder="Show description..." />
			</Field.Field>

			<!-- ===================== VENUE & DETAILS (collapsed) ===================== -->
			<CollapsibleSection title="Venue & Details" bind:open={detailsExpanded}>
				<Field.Field>
					<Field.FieldLabel>Venue</Field.FieldLabel>
					<Input
						bind:value={form.venue}
						placeholder="Malaysia International Trade and Exhibition Centre"
					/>
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Website</Field.FieldLabel>
					<Input bind:value={form.website} placeholder="https://example.com" />
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Focus (comma-separated)</Field.FieldLabel>
					<Input bind:value={form.focus} placeholder="Food & Beverage, Pharmaceuticals, ..." />
				</Field.Field>
				<div class="grid grid-cols-2 gap-4">
					<Field.Field>
						<Field.FieldLabel>Exhibitors</Field.FieldLabel>
						<Input bind:value={form.exhibitors} type="number" placeholder="1200" />
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel>Visitors</Field.FieldLabel>
						<Input bind:value={form.visitors} type="number" placeholder="50000" />
					</Field.Field>
				</div>
			</CollapsibleSection>

			<!-- ===================== SEO & METADATA (collapsed) ===================== -->
			<CollapsibleSection title="SEO & Metadata" bind:open={seoExpanded}>
				<Field.Field>
					<Field.FieldLabel>Meta Title</Field.FieldLabel>
					<Input
						bind:value={form.metaTitle}
						maxlength={60}
						placeholder="SEO page title (max 60 chars)"
					/>
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Meta Description</Field.FieldLabel>
					<Textarea
						bind:value={form.metaDescription}
						maxlength={160}
						rows={2}
						placeholder="SEO description (max 160 chars)"
					/>
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Keywords</Field.FieldLabel>
					<Input
						bind:value={form.keywords}
						placeholder="Comma separated: halal, trade show, malaysia"
					/>
				</Field.Field>
			</CollapsibleSection>
		</div>

		{#if formError}
			<p class="text-sm text-destructive">{formError}</p>
		{/if}

		<DialogFooter>
			<Button variant="outline" onclick={() => (dialogOpen = false)}>Cancel</Button>
			<Button variant="default" onclick={save}>
				{editing ? 'Save changes' : 'Create show'}
			</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
