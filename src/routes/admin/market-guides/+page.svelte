<script lang="ts">
	import { adminData, upsertItem, deleteItem } from '#lib/stores/admin-data.svelte.js';
	import type { MarketGuide } from '#lib/data/types.js';
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
	let editing = $state<MarketGuide | null>(null);
	let formError = $state('');

	// Collapsible section state
	let marketExpanded = $state(false);
	let requirementsExpanded = $state(false);
	let insightsExpanded = $state(false);
	let seoExpanded = $state(false);

	type GuideForm = {
		slug: string;
		country: string;
		flag: string;
		region: string;
		muslimPopulation: string;
		totalPopulation: string;
		marketSizeUsd: string;
		mandateStatus: string;
		mandatorySince: string;
		certifyingBodiesJson: string;
		importRequirements: string;
		standardBasis: string;
		certificateValidity: string;
		estimatedCostUsd: string;
		processingTime: string;
		keyInsights: string;
		opportunities: string;
		challenges: string;
		summary: string;
		metaTitle: string;
		metaDescription: string;
		keywords: string;
		status: string;
	};

	let form = $state<GuideForm>({
		slug: '',
		country: '',
		flag: '',
		region: '',
		muslimPopulation: '',
		totalPopulation: '',
		marketSizeUsd: '',
		mandateStatus: 'voluntary',
		mandatorySince: '',
		certifyingBodiesJson: '[]',
		importRequirements: '',
		standardBasis: '',
		certificateValidity: '',
		estimatedCostUsd: '',
		processingTime: '',
		keyInsights: '',
		opportunities: '',
		challenges: '',
		summary: '',
		metaTitle: '',
		metaDescription: '',
		keywords: '',
		status: 'active'
	});

	const regionOptions = [
		'Southeast Asia',
		'Middle East',
		'South Asia',
		'Europe',
		'East Asia',
		'North America',
		'Africa',
		'Oceania'
	];

	const mandateOptions = ['mandatory', 'phasing-in', 'voluntary'];

	const guides = $derived(adminData.marketGuides ?? []);

	const filtered = $derived.by(() => {
		if (!search.trim()) return guides;
		const q = search.toLowerCase();
		return guides.filter(
			(g) =>
				g.country.toLowerCase().includes(q) ||
				g.slug.includes(q) ||
				g.region?.toLowerCase().includes(q)
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
			slug: '',
			country: '',
			flag: '',
			region: '',
			muslimPopulation: '',
			totalPopulation: '',
			marketSizeUsd: '',
			mandateStatus: 'voluntary',
			mandatorySince: '',
			certifyingBodiesJson: '[]',
			importRequirements: '',
			standardBasis: '',
			certificateValidity: '',
			estimatedCostUsd: '',
			processingTime: '',
			keyInsights: '',
			opportunities: '',
			challenges: '',
			summary: '',
			metaTitle: '',
			metaDescription: '',
			keywords: '',
			status: 'active'
		};
		formError = '';
		marketExpanded = false;
		requirementsExpanded = false;
		insightsExpanded = false;
		seoExpanded = false;
		dialogOpen = true;
	}

	function openEdit(g: MarketGuide) {
		editing = g;
		form = {
			slug: g.slug,
			country: g.country,
			flag: g.flag ?? '',
			region: g.region ?? '',
			muslimPopulation: g.muslimPopulation ?? '',
			totalPopulation: g.totalPopulation ?? '',
			marketSizeUsd: g.marketSizeUsd ?? '',
			mandateStatus: g.mandateStatus ?? 'voluntary',
			mandatorySince: g.mandatorySince ?? '',
			certifyingBodiesJson: JSON.stringify(g.certifyingBodies ?? [], null, 2),
			importRequirements: (g.importRequirements ?? []).join(', '),
			standardBasis: g.standardBasis ?? '',
			certificateValidity: g.certificateValidity ?? '',
			estimatedCostUsd: g.estimatedCostUsd ?? '',
			processingTime: g.processingTime ?? '',
			keyInsights: (g.keyInsights ?? []).join(', '),
			opportunities: (g.opportunities ?? []).join(', '),
			challenges: (g.challenges ?? []).join(', '),
			summary: g.summary ?? '',
			metaTitle: g.metaTitle ?? '',
			metaDescription: g.metaDescription ?? '',
			keywords: g.keywords ?? '',
			status: g.status ?? 'active'
		};
		formError = '';
		marketExpanded = false;
		requirementsExpanded = false;
		insightsExpanded = false;
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
		if (!form.country.trim()) {
			formError = 'Country is required.';
			return;
		}
		if (!form.slug && !form.country.trim()) {
			formError = 'Slug or country is required to generate a slug.';
			return;
		}
		if (form.slug && !/^[a-z0-9-]+$/.test(form.slug)) {
			formError = 'Slug may only contain lowercase letters, numbers and dashes.';
			return;
		}

		let certifyingBodies: { slug: string; name: string }[] = [];
		try {
			const parsed = JSON.parse(form.certifyingBodiesJson);
			if (Array.isArray(parsed)) certifyingBodies = parsed;
		} catch {
			formError = 'Certifying Bodies must be valid JSON array.';
			return;
		}

		const updated: MarketGuide = {
			slug: form.slug || slugify(form.country),
			country: form.country.trim(),
			flag: form.flag.trim() || undefined,
			region: form.region.trim() || undefined,
			muslimPopulation: form.muslimPopulation.trim() || undefined,
			totalPopulation: form.totalPopulation.trim() || undefined,
			marketSizeUsd: form.marketSizeUsd.trim() || undefined,
			mandateStatus: form.mandateStatus.trim() || undefined,
			mandatorySince: form.mandatorySince.trim() || undefined,
			certifyingBodies,
			importRequirements: parseCommaList(form.importRequirements),
			standardBasis: form.standardBasis.trim() || undefined,
			certificateValidity: form.certificateValidity.trim() || undefined,
			estimatedCostUsd: form.estimatedCostUsd.trim() || undefined,
			processingTime: form.processingTime.trim() || undefined,
			keyInsights: parseCommaList(form.keyInsights),
			opportunities: parseCommaList(form.opportunities),
			challenges: parseCommaList(form.challenges),
			summary: form.summary.trim() || undefined,
			metaTitle: form.metaTitle.trim() || undefined,
			metaDescription: form.metaDescription.trim() || undefined,
			keywords: form.keywords.trim() || undefined,
			status: (form.status as MarketGuide['status']) ?? 'active'
		};
		upsertItem<MarketGuide>('marketGuides', updated, editing ?? undefined);
		dialogOpen = false;
	}

	function remove(g: MarketGuide) {
		if (window.confirm(`Delete market guide for ${g.country}?`)) {
			deleteItem('marketGuides', g.slug);
		}
	}

	function statusColor(s: string): string {
		if (s === 'active') return 'bg-success/10 text-success';
		if (s === 'draft') return 'bg-warn/10 text-warn';
		if (s === 'archived') return 'bg-destructive/10 text-destructive';
		return 'bg-muted text-muted-foreground';
	}
</script>

<svelte:head>
	<title>Market Guides — HalalNeo Admin</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div class="flex flex-col gap-1">
			<h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">Market Guides</h1>
			<p class="max-w-2xl text-sm text-muted-foreground">
				Manage country-specific halal market intelligence guides.
			</p>
		</div>
		<Button variant="default" size="sm" onclick={openCreate}>
			<Plus class="size-4"></Plus>
			Add Guide
		</Button>
	</div>

	<div class="relative max-w-sm">
		<Search
			class="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
		></Search>
		<Input bind:value={search} placeholder="Search guides..." class="pl-9" />
	</div>

	<div class="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
		<StatTile value={guides.length} label="Total Guides" />
		<StatTile value={guides.filter((g) => g.status === 'active').length} label="Active" />
		<StatTile
			value={guides.filter((g) => g.mandateStatus === 'mandatory').length}
			label="Mandatory Markets"
		/>
	</div>

	<div class="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
		<Table>
			<TableHeader>
				<TableRow class="hover:bg-transparent">
					<TableHead>Country</TableHead>
					<TableHead>Region</TableHead>
					<TableHead>Mandate</TableHead>
					<TableHead>Market Size</TableHead>
					<TableHead>Status</TableHead>
					<TableHead class="text-right">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#each filtered as g (g.slug)}
					<TableRow>
						<TableCell>
							<div class="min-w-0">
								<p class="truncate font-medium">{g.flag ?? ''} {g.country}</p>
								<p class="truncate text-xs text-muted-foreground">{g.slug}</p>
							</div>
						</TableCell>
						<TableCell>{g.region ?? '—'}</TableCell>
						<TableCell class="capitalize">{g.mandateStatus ?? '—'}</TableCell>
						<TableCell>{g.marketSizeUsd ?? '—'}</TableCell>
						<TableCell>
							<Badge
								variant="secondary"
								class={`px-1.5 py-0.5 text-[10px] capitalize ${statusColor(g.status ?? 'active')}`}
								>{g.status ?? 'active'}</Badge
							>
						</TableCell>
						<TableCell class="text-right">
							<div class="flex items-center justify-end gap-1">
								<Button
									variant="ghost"
									size="icon"
									aria-label="Edit"
									class="size-8"
									onclick={() => openEdit(g)}
								>
									<Pencil class="size-3.5"></Pencil>
								</Button>
								<Button
									variant="ghost"
									size="icon"
									aria-label="Delete"
									class="size-8 hover:bg-destructive/10 hover:text-destructive"
									onclick={() => remove(g)}
								>
									<Trash2 class="size-3.5"></Trash2>
								</Button>
							</div>
						</TableCell>
					</TableRow>
				{:else}
					<TableRow>
						<TableCell colspan={6} class="py-8 text-center text-sm text-muted-foreground">
							No market guides found.
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
			<DialogTitle>{editing ? 'Edit market guide' : 'New market guide'}</DialogTitle>
			<DialogDescription>Create or update a country market guide.</DialogDescription>
		</DialogHeader>

		<div class="flex flex-col gap-4">
			<div class="grid grid-cols-2 gap-4">
				<Field.Field>
					<Field.FieldLabel>Country *</Field.FieldLabel>
					<Input bind:value={form.country} placeholder="Indonesia" />
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Slug</Field.FieldLabel>
					<Input bind:value={form.slug} placeholder="indonesia" disabled={!!editing} />
				</Field.Field>
			</div>

			<div class="grid grid-cols-2 gap-4">
				<Field.Field>
					<Field.FieldLabel>Flag (emoji)</Field.FieldLabel>
					<Input bind:value={form.flag} placeholder="🇮🇩" />
				</Field.Field>
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
			</div>

			<div class="grid grid-cols-2 gap-4">
				<Field.Field>
					<Field.FieldLabel>Mandate Status</Field.FieldLabel>
					<Select bind:value={form.mandateStatus} type="single">
						<SelectTrigger class="w-full">{form.mandateStatus}</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								{#each mandateOptions as m (m)}
									<SelectItem value={m}>{m}</SelectItem>
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

			<Field.Field>
				<Field.FieldLabel>Summary</Field.FieldLabel>
				<Textarea bind:value={form.summary} rows={3} placeholder="Brief market overview..." />
			</Field.Field>

			<!-- ===================== MARKET DATA (collapsed) ===================== -->
			<CollapsibleSection title="Market Data" bind:open={marketExpanded}>
				<div class="grid grid-cols-2 gap-4">
					<Field.Field>
						<Field.FieldLabel>Muslim Population</Field.FieldLabel>
						<Input bind:value={form.muslimPopulation} placeholder="~230 million" />
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel>Total Population</Field.FieldLabel>
						<Input bind:value={form.totalPopulation} placeholder="~275 million" />
					</Field.Field>
				</div>
				<div class="grid grid-cols-2 gap-4">
					<Field.Field>
						<Field.FieldLabel>Market Size (USD)</Field.FieldLabel>
						<Input bind:value={form.marketSizeUsd} placeholder="$220B+" />
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel>Mandatory Since</Field.FieldLabel>
						<Input bind:value={form.mandatorySince} placeholder="October 2024" />
					</Field.Field>
				</div>
				<div class="grid grid-cols-2 gap-4">
					<Field.Field>
						<Field.FieldLabel>Estimated Cost (USD)</Field.FieldLabel>
						<Input bind:value={form.estimatedCostUsd} placeholder="$500–$2,000" />
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel>Processing Time</Field.FieldLabel>
						<Input bind:value={form.processingTime} placeholder="3–6 months" />
					</Field.Field>
				</div>
				<div class="grid grid-cols-2 gap-4">
					<Field.Field>
						<Field.FieldLabel>Certificate Validity</Field.FieldLabel>
						<Input bind:value={form.certificateValidity} placeholder="4 years" />
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel>Standard Basis</Field.FieldLabel>
						<Input bind:value={form.standardBasis} placeholder="HAS 23000" />
					</Field.Field>
				</div>
				<Field.Field>
					<Field.FieldLabel>Certifying Bodies (JSON)</Field.FieldLabel>
					<Textarea
						bind:value={form.certifyingBodiesJson}
						rows={3}
						placeholder={'[{"slug":"bpjph","name":"BPJPH"}]'}
					/>
				</Field.Field>
			</CollapsibleSection>

			<!-- ===================== REQUIREMENTS (collapsed) ===================== -->
			<CollapsibleSection title="Import Requirements" bind:open={requirementsExpanded}>
				<Field.Field>
					<Field.FieldLabel>Import Requirements (comma-separated)</Field.FieldLabel>
					<Textarea
						bind:value={form.importRequirements}
						rows={3}
						placeholder="Halal certificate, Labeling in local language, ..."
					/>
				</Field.Field>
			</CollapsibleSection>

			<!-- ===================== INSIGHTS (collapsed) ===================== -->
			<CollapsibleSection title="Insights, Opportunities & Challenges" bind:open={insightsExpanded}>
				<Field.Field>
					<Field.FieldLabel>Key Insights (comma-separated)</Field.FieldLabel>
					<Textarea
						bind:value={form.keyInsights}
						rows={2}
						placeholder="Largest Muslim population, ..."
					/>
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Opportunities (comma-separated)</Field.FieldLabel>
					<Textarea
						bind:value={form.opportunities}
						rows={2}
						placeholder="Growing middle class, ..."
					/>
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Challenges (comma-separated)</Field.FieldLabel>
					<Textarea bind:value={form.challenges} rows={2} placeholder="Complex regulations, ..." />
				</Field.Field>
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
						placeholder="Comma separated: halal, indonesia, certification"
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
				{editing ? 'Save changes' : 'Create guide'}
			</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
