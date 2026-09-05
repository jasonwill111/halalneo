<script lang="ts">
	import {
		adminData,
		upsertItem,
		deleteItem
	} from '#lib/stores/admin-data.svelte.js';
	import type { Page } from '#lib/data/types.js';
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
	import Sparkles from '@lucide/svelte/icons/sparkles';

	let search = $state('');
	let dialogOpen = $state(false);
	let editing = $state<Page | null>(null);
	let formError = $state('');
	let aiLoading = $state(false);

	type PageForm = {
		slug: string;
		title: string;
		type: 'landing' | 'blog';
		excerpt: string;
		body: string;
		status: 'published' | 'draft' | 'archived';
		targetAudience: string;
		keyPoints: string;
		cta: string;
		targetRegion: string;
	};

	let form = $state<PageForm>({
		slug: '',
		title: '',
		type: 'landing',
		excerpt: '',
		body: '',
		status: 'draft',
		targetAudience: '',
		keyPoints: '',
		cta: '',
		targetRegion: ''
	});

	const typeLabels: Record<Page['type'], string> = {
		landing: 'Marketing',
		blog: 'Blog'
	};

	const pages = $derived(adminData.pages ?? []);
	const published = $derived(pages.filter((p) => p.status === 'published').length);

	const filtered = $derived.by(() => {
		if (!search.trim()) return pages;
		const q = search.toLowerCase();
		return pages.filter(
			(p) =>
				p.title.toLowerCase().includes(q) ||
				p.slug.includes(q)
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
			title: '',
			type: 'landing',
			excerpt: '',
			body: '',
			status: 'draft',
			targetAudience: '',
			keyPoints: '',
			cta: '',
			targetRegion: ''
		};
		formError = '';
		dialogOpen = true;
	}

	function openEdit(page: Page) {
		editing = page;
		form = {
			slug: page.slug,
			title: page.title,
			type: page.type,
			excerpt: page.excerpt ?? '',
			body: page.body ?? '',
			status: page.status,
			targetAudience: (page as any).targetAudience ?? '',
			keyPoints: (page as any).keyPoints ?? '',
			cta: (page as any).cta ?? '',
			targetRegion: (page as any).targetRegion ?? ''
		};
		formError = '';
		dialogOpen = true;
	}

	function save() {
		if (!form.title.trim()) {
			formError = 'Title is required.';
			return;
		}
		if (form.slug && !/^[a-z0-9-]+$/.test(form.slug)) {
			formError = 'Slug may only contain lowercase letters, numbers and dashes.';
			return;
		}
		const updated: Page = {
			slug: form.slug || slugify(form.title),
			title: form.title.trim(),
			type: form.type,
			excerpt: form.excerpt.trim() || undefined,
			body: form.body.trim(),
			status: form.status,
			views: editing?.views ?? 0
		};
		upsertItem<Page>('pages', updated, editing ?? undefined);
		dialogOpen = false;
	}

	function remove(page: Page) {
		if (window.confirm(`Delete page "${page.title}"?`)) {
			deleteItem('pages', page.slug);
		}
	}

	function typeLabel(t: string): string {
		return t === 'blog' ? 'Blog' : t === 'landing' ? 'Marketing' : t;
	}

	async function generateLandingPage() {
		aiLoading = true;
		await new Promise((r) => setTimeout(r, 1000));
		const audience = form.targetAudience || 'businesses and professionals';
		const points = form.keyPoints || 'quality products, competitive pricing, reliable delivery';
		const cta = form.cta || 'Get Started Today';
		const region = form.targetRegion || 'global';
		form.excerpt = form.excerpt || `${form.title} — tailored for ${audience} in the ${region} market.`;
		form.body = `## ${form.title}\n\n### Hero Section\n\n**Headline:** ${form.title}\n**Subheadline:** ${form.excerpt}\n**CTA:** ${cta}\n\n---\n\n### Key Benefits\n\n${points.split(',').map((p: string) => `- **${p.trim()}** — Why this matters for ${audience}`).join('\n')}\n\n---\n\n### Why Choose Us\n\n[Expand on unique value proposition for ${region} market]\n\n---\n\n### How It Works\n\n1. **Step One** — [Describe first step]\n2. **Step Two** — [Describe second step]\n3. **Step Three** — [Describe third step]\n\n---\n\n### Testimonials\n\n> "[Add customer quote for ${region} market]"\n> — Customer Name, Company\n\n---\n\n### FAQ\n\n**Q: [Common question for ${audience}?]**\nA: [Answer addressing the concern]\n\n**Q: [Another question?]**\nA: [Answer]\n\n---\n\n### ${cta}\n\n[Final CTA section with contact/registration link]\n\n---\n\n*Target Region: ${region} | Audience: ${audience}*`;
		aiLoading = false;
	}
</script>

<svelte:head>
	<title>Pages — HalalNeo Admin</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div class="flex flex-col gap-1">
			<h1 class="text-3xl font-semibold tracking-tight">Pages</h1>
			<p class="max-w-2xl text-sm text-muted-foreground">
				Manage landing pages and blog content.
			</p>
		</div>
		<Button variant="default" size="sm" onclick={openCreate}>
			<Plus class="size-4"></Plus>
			Generate New Page
		</Button>
	</div>

	<div class="relative max-w-sm">
		<Search class="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"></Search>
		<Input bind:value={search} placeholder="Search pages..." class="pl-9" />
	</div>

	<div class="mb-3 grid grid-cols-1 sm:grid-cols-3 gap-2">
		<div class="rounded-xl bg-card p-3 ring-1 ring-foreground/10">
			<p class="text-[10px] text-muted-foreground">Total Pages</p>
			<p class="text-xl font-bold">{pages.length}</p>
		</div>
		<div class="rounded-xl bg-card p-3 ring-1 ring-foreground/10">
			<p class="text-[10px] text-muted-foreground">Published</p>
			<p class="text-xl font-bold">{pages.length > 0 ? Math.round((published / pages.length) * 100) : 0}%</p>
		</div>
		<div class="rounded-xl bg-card p-3 ring-1 ring-foreground/10">
			<p class="text-[10px] text-muted-foreground">Total Views</p>
			<p class="text-xl font-bold">{pages.reduce((sum, p) => sum + (p.views ?? 0), 0).toLocaleString()}</p>
		</div>
	</div>

	<div class="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
		<Table>
			<TableHeader>
				<TableRow class="hover:bg-transparent">
					<TableHead>Title</TableHead>
					<TableHead>Type</TableHead>
					<TableHead>Status</TableHead>
					<TableHead>Views</TableHead>
					<TableHead class="text-right">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#each filtered as p (p.slug)}
					<TableRow>
						<TableCell>
							<div class="min-w-0">
								<p class="truncate font-medium">{p.title}</p>
								<p class="truncate text-xs text-muted-foreground">{p.slug}</p>
							</div>
						</TableCell>
						<TableCell>{typeLabel(p.type)}</TableCell>
						<TableCell>
							<Badge variant={p.status === 'published' ? 'default' : 'secondary'} class="capitalize text-[10px]">{p.status}</Badge>
						</TableCell>
						<TableCell class="text-muted-foreground">{(p.views ?? 0).toLocaleString()}</TableCell>
						<TableCell class="text-right">
							<div class="flex items-center justify-end gap-1">
								<Button variant="ghost" size="icon" aria-label="Edit" class="size-8" onclick={() => openEdit(p)}>
									<Pencil class="size-3.5"></Pencil>
								</Button>
								<Button
									variant="ghost"
									size="icon"
									aria-label="Delete"
									class="size-8 hover:bg-destructive/10 hover:text-destructive"
									onclick={() => remove(p)}
								>
									<Trash2 class="size-3.5"></Trash2>
								</Button>
							</div>
						</TableCell>
					</TableRow>
				{:else}
					<TableRow>
						<TableCell colspan={5} class="py-8 text-center text-sm text-muted-foreground">
							No pages found.
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
			<DialogTitle>{editing ? 'Edit page' : 'New page'}</DialogTitle>
			<DialogDescription>
				Create or update a page in the site.
			</DialogDescription>
		</DialogHeader>

		<div class="flex flex-col gap-4">
			<Field.Field>
				<Field.FieldLabel>Title *</Field.FieldLabel>
				<Input bind:value={form.title} placeholder="Page title" />
			</Field.Field>

			<div class="grid grid-cols-2 gap-4">
				<Field.Field>
					<Field.FieldLabel>Slug</Field.FieldLabel>
					<Input bind:value={form.slug} placeholder="page-slug" disabled={!!editing} />
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Type</Field.FieldLabel>
					<Select bind:value={form.type} type="single">
						<SelectTrigger class="w-full">
							{typeLabels[form.type]}
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								{#each Object.entries(typeLabels) as [value, label] (value)}
									<SelectItem {value}>{label}</SelectItem>
								{/each}
							</SelectGroup>
						</SelectContent>
					</Select>
				</Field.Field>
			</div>

			<Field.Field>
				<Field.FieldLabel>Status</Field.FieldLabel>
				<Select bind:value={form.status} type="single">
					<SelectTrigger class="w-full">{form.status}</SelectTrigger>
					<SelectContent>
						<SelectGroup>
							<SelectItem value="published">published</SelectItem>
							<SelectItem value="draft">draft</SelectItem>
							<SelectItem value="archived">archived</SelectItem>
						</SelectGroup>
					</SelectContent>
				</Select>
			</Field.Field>

			<Field.Field>
				<Field.FieldLabel>Excerpt</Field.FieldLabel>
				<Input bind:value={form.excerpt} placeholder="Short description..." />
			</Field.Field>

			{#if form.type === 'landing'}
				<div class="rounded-lg border border-dashed border-border p-4 space-y-3">
					<p class="text-xs font-medium text-muted-foreground uppercase tracking-wide">Landing Page Settings</p>
					<div class="grid grid-cols-2 gap-3">
						<Field.Field>
							<Field.FieldLabel>Target Audience</Field.FieldLabel>
							<Input bind:value={form.targetAudience} placeholder="e.g. food importers in UAE" />
						</Field.Field>
						<Field.Field>
							<Field.FieldLabel>Target Region</Field.FieldLabel>
							<Input bind:value={form.targetRegion} placeholder="e.g. Middle East, Southeast Asia" />
						</Field.Field>
					</div>
					<Field.Field>
						<Field.FieldLabel>Key Selling Points</Field.FieldLabel>
						<Input bind:value={form.keyPoints} placeholder="Comma separated: quality, certification, delivery" />
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel>Call to Action</Field.FieldLabel>
						<Input bind:value={form.cta} placeholder="e.g. Get a Free Quote, Contact Us" />
					</Field.Field>
				</div>
			{/if}

			<Field.Field>
				<div class="flex items-center justify-between">
					<Field.FieldLabel>Body</Field.FieldLabel>
					{#if form.type === 'landing'}
						<Button variant="outline" size="sm" type="button" onclick={generateLandingPage} disabled={aiLoading || !form.title.trim()}>
							<Sparkles class="size-3.5" />
							{aiLoading ? 'Generating...' : 'Generate Landing Page'}
						</Button>
					{/if}
				</div>
				<Textarea bind:value={form.body} rows={6} placeholder="Page content..." />
			</Field.Field>
		</div>

		{#if formError}
			<p class="text-sm text-destructive">{formError}</p>
		{/if}

		<DialogFooter>
			<Button variant="outline" onclick={() => (dialogOpen = false)}>Cancel</Button>
			<Button variant="default" onclick={save}>
				{editing ? 'Save changes' : 'Create page'}
			</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
