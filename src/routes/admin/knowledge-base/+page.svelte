<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		KB_SECTIONS,
		kbSectionLabel,
		type KbAdminRow
	} from '#lib/schemas/knowledge.js';
	import { parseTagList } from '#lib/schemas/content.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Tabs, TabsList, TabsTrigger } from '#lib/components/ui/tabs/index.js';
	import { Skeleton } from '#lib/components/ui/skeleton/index.js';
	import { Empty, EmptyContent, EmptyMedia } from '#lib/components/ui/empty/index.js';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '#lib/components/ui/table/index.js';
	import Search from '@lucide/svelte/icons/search';
	import Plus from '@lucide/svelte/icons/plus';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import AlertTriangle from '@lucide/svelte/icons/alert-triangle';
	import FileText from '@lucide/svelte/icons/file-text';
	import FolderOpen from '@lucide/svelte/icons/folder-open';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import BarChart3 from '@lucide/svelte/icons/bar-chart-3';
	import Paginator from '#lib/components/site/paginator.svelte';
	import ConfirmDialog from '#lib/components/site/confirm-dialog.svelte';
	import { toast } from 'svelte-sonner';

	const PAGE_SIZE = 10;

	type LoadError = { kind: 'network' | 'auth' | 'server'; message: string };

	let articles = $state<KbAdminRow[]>([]);
	let loading = $state(true);
	let loadError = $state<LoadError | null>(null);
	let search = $state('');
	let page = $state(1);
	let activeTab = $state<'articles' | 'sections'>('articles');
	let confirmSlug = $state<string | null>(null);
	let confirmTitle = $state('');
	let deleting = $state(false);

	const filtered = $derived.by(() => {
		if (!search.trim()) return articles;
		const q = search.toLowerCase();
		return articles.filter(
			(a) =>
				a.title.toLowerCase().includes(q) ||
				a.slug.toLowerCase().includes(q) ||
				kbSectionLabel(a.section).toLowerCase().includes(q) ||
				parseTagList(a.tags).some((t) => t.toLowerCase().includes(q))
		);
	});

	const totalPages = $derived(Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
	const paged = $derived(filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));

	$effect(() => {
		void search;
		page = 1;
	});

	const totalArticles = $derived(articles.length);
	const publishedCount = $derived(articles.filter((a) => a.status === 'published').length);
	const draftCount = $derived(articles.filter((a) => a.status === 'draft').length);
	const totalViews = $derived(articles.reduce((sum, a) => sum + (a.views ?? 0), 0));

	/**
	 * Cards come from the DB enum (`KB_SECTIONS`), not from the loaded rows, so a
	 * section with zero articles is still visible to the admin instead of
	 * silently disappearing.
	 */
	const sectionCards = $derived(
		KB_SECTIONS.map((section) => ({
			slug: section,
			label: kbSectionLabel(section),
			count: articles.filter((a) => a.section === section).length
		}))
	);

	const sectionColors: Record<string, string> = {
		'halal-certification': 'bg-success/10 text-success',
		'trade-sourcing': 'bg-info/10 text-info',
		logistics: 'bg-accent-purple/10 text-accent-purple',
		'packaging-labeling': 'bg-warn/10 text-warn',
		'country-market-guides': 'bg-accent-rose/10 text-accent-rose',
		'due-diligence': 'bg-info/10 text-info'
	};

	function sectionColor(slug: string): string {
		return sectionColors[slug] ?? 'bg-muted text-muted-foreground';
	}

	async function loadArticles() {
		loading = true;
		loadError = null;
		try {
			// status=all → admin overview (drafts included), never edge-cached.
			const res = await fetch('/api/knowledge-base?status=all&limit=100');
			if (!res.ok) {
				const data = (await res.json().catch(() => ({}))) as { error?: string };
				loadError = {
					kind: res.status === 401 || res.status === 403 ? 'auth' : 'server',
					message: data.error ?? `Request failed (${res.status})`
				};
				articles = [];
			} else {
				const data = (await res.json()) as { items?: KbAdminRow[] };
				articles = data.items ?? [];
			}
		} catch {
			loadError = { kind: 'network', message: 'Could not reach the knowledge base API.' };
			articles = [];
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		void loadArticles();
	});

	function deleteArticle(slug: string, title: string) {
		confirmSlug = slug;
		confirmTitle = title;
	}

	async function confirmedDelete() {
		if (!confirmSlug) return;
		deleting = true;
		try {
			const res = await fetch(`/api/knowledge-base/${encodeURIComponent(confirmSlug)}`, {
				method: 'DELETE'
			});
			if (res.ok) {
				toast.success('Article deleted');
				await loadArticles();
			} else {
				const data = (await res.json().catch(() => ({}))) as { error?: string };
				toast.error(data.error ?? 'Failed to delete article.');
			}
		} catch {
			toast.error('Network error — the article was not deleted.');
		} finally {
			deleting = false;
			confirmSlug = null;
			confirmTitle = '';
		}
	}
</script>

<svelte:head>
	<title>Knowledge Base — HalalNeo Admin</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="space-y-4 sm:space-y-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div class="space-y-1">
			<h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">Knowledge Base</h1>
			<p class="max-w-2xl text-sm text-muted-foreground">
				Manage help articles and documentation across {KB_SECTIONS.length} sections.
			</p>
		</div>
		<Button variant="default" size="sm" class="gap-1.5" onclick={() => goto('/admin/knowledge')}>
			<Plus class="size-4"></Plus>
			Add Article
		</Button>
	</div>

	<div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
		<div class="rounded-xl bg-card p-3 ring-1 ring-foreground/10">
			<div class="mb-1 flex items-center justify-between">
				<span class="text-2xs text-muted-foreground">Total Articles</span>
				<FileText class="size-4 text-muted-foreground"></FileText>
			</div>
			{#if loading}
				<Skeleton class="h-6 w-10" />
			{:else}
				<div class="text-xl font-bold">{totalArticles}</div>
			{/if}
			<div class="text-2xs text-success">{publishedCount} published</div>
		</div>
		<div class="rounded-xl bg-card p-3 ring-1 ring-foreground/10">
			<div class="mb-1 flex items-center justify-between">
				<span class="text-2xs text-muted-foreground">Sections</span>
				<FolderOpen class="size-4 text-muted-foreground"></FolderOpen>
			</div>
			<div class="text-xl font-bold">{sectionCards.filter((s) => s.count > 0).length}</div>
			<div class="text-2xs text-muted-foreground">of {KB_SECTIONS.length} in use</div>
		</div>
		<div class="rounded-xl bg-card p-3 ring-1 ring-foreground/10">
			<div class="mb-1 flex items-center justify-between">
				<span class="text-2xs text-muted-foreground">Drafts</span>
				<BookOpen class="size-4 text-muted-foreground"></BookOpen>
			</div>
			{#if loading}
				<Skeleton class="h-6 w-10" />
			{:else}
				<div class="text-xl font-bold">{draftCount}</div>
			{/if}
			<div class="text-2xs text-muted-foreground">unpublished</div>
		</div>
		<div class="rounded-xl bg-card p-3 ring-1 ring-foreground/10">
			<div class="mb-1 flex items-center justify-between">
				<span class="text-2xs text-muted-foreground">Total Views</span>
				<BarChart3 class="size-4 text-muted-foreground"></BarChart3>
			</div>
			{#if loading}
				<Skeleton class="h-6 w-14" />
			{:else}
				<div class="text-xl font-bold">{totalViews.toLocaleString()}</div>
			{/if}
			<div class="text-2xs text-success">across all articles</div>
		</div>
	</div>

	<Tabs
		value={activeTab}
		onValueChange={(v) => {
			activeTab = v === 'sections' ? 'sections' : 'articles';
		}}
	>
		<TabsList>
			<TabsTrigger value="articles"
				>Articles <span
					class="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-2xs text-primary"
					>{totalArticles}</span
				></TabsTrigger
			>
			<TabsTrigger value="sections"
				>Sections <span
					class="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-2xs text-muted-foreground"
					>{sectionCards.filter((s) => s.count > 0).length}</span
				></TabsTrigger
			>
		</TabsList>
	</Tabs>

	{#if loadError}
		<!-- Real failure: a retry action, never the "empty" copy (§3.1). -->
		<div
			class="flex flex-col items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"
		>
			<div class="flex min-w-0 items-start gap-2">
				<AlertTriangle class="mt-0.5 size-4 shrink-0 text-destructive" />
				<div class="min-w-0">
					<p class="text-sm font-medium text-destructive">
						{loadError.kind === 'network'
							? 'Connection failed'
							: loadError.kind === 'auth'
								? 'Admin session expired'
								: 'Could not load articles'}
					</p>
					<p class="text-xs text-muted-foreground">
						{loadError.kind === 'auth'
							? 'Sign in again from /admin/login to manage the knowledge base.'
							: loadError.message}
					</p>
				</div>
			</div>
			<Button variant="outline" size="sm" class="gap-1.5" onclick={() => void loadArticles()}>
				<RefreshCw class="size-3.5" />
				Retry
			</Button>
		</div>
	{:else if activeTab === 'articles'}
		<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
			<div class="relative flex-1 sm:max-w-xs">
				<Search
					class="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground"
				></Search>
				<Input bind:value={search} placeholder="Search articles..." class="pl-8 text-2xs-plus" />
			</div>
		</div>

		<div class="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
			<Table>
				<TableHeader>
					<TableRow class="hover:bg-transparent">
						<TableHead>Article</TableHead>
						<TableHead>Section</TableHead>
						<TableHead>Status</TableHead>
						<TableHead class="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{#if loading}
						{#each Array(5) as _, i (i)}
							<TableRow>
								<TableCell><Skeleton class="h-4 w-40" /></TableCell>
								<TableCell><Skeleton class="h-4 w-28" /></TableCell>
								<TableCell><Skeleton class="h-4 w-16" /></TableCell>
								<TableCell class="text-right"><Skeleton class="ml-auto h-8 w-16" /></TableCell>
							</TableRow>
						{/each}
					{:else if filtered.length === 0}
						<TableRow>
							<TableCell colspan={4} class="py-8">
								{#if articles.length === 0}
									<Empty>
										<EmptyMedia variant="icon"><FileText class="size-6" /></EmptyMedia>
										<div class="space-y-1">
											<p class="font-medium">No articles yet</p>
											<p class="text-sm text-muted-foreground">
												Nothing has been written to the knowledge base yet.
											</p>
										</div>
										<EmptyContent>
											<Button
												variant="default"
												size="sm"
												class="gap-1.5"
												onclick={() => goto('/admin/knowledge')}
											>
												<Plus class="size-4" />
												Add Article
											</Button>
										</EmptyContent>
									</Empty>
								{:else}
									<Empty>
										<EmptyMedia variant="icon"><Search class="size-6" /></EmptyMedia>
										<div class="space-y-1">
											<p class="font-medium">No matching articles</p>
											<p class="text-sm text-muted-foreground">
												Nothing matches “{search}”. Try another word.
											</p>
										</div>
										<EmptyContent>
											<Button variant="outline" size="sm" onclick={() => (search = '')}
												>Clear search</Button
											>
										</EmptyContent>
									</Empty>
								{/if}
							</TableCell>
						</TableRow>
					{:else}
						{#each paged as article (article.slug)}
							<TableRow>
								<TableCell>
									<div class="min-w-0">
										<p class="truncate font-medium">{article.title}</p>
										<p class="truncate text-xs text-muted-foreground">{article.slug}</p>
									</div>
								</TableCell>
								<TableCell>
									<span
										class="inline-flex rounded-md px-1.5 py-0.5 text-2xs font-medium {sectionColor(
											article.section
										)}"
									>
										{kbSectionLabel(article.section)}
									</span>
								</TableCell>
								<TableCell>
									<Badge
										variant={article.status === 'published'
											? 'default'
											: article.status === 'draft'
												? 'secondary'
												: 'outline'}
										class="text-2xs capitalize"
									>
										{article.status ?? 'unknown'}
									</Badge>
								</TableCell>
								<TableCell class="text-right">
									<div class="flex items-center justify-end gap-1">
										<Button
											variant="ghost"
											size="icon"
											aria-label="Edit"
											class="size-8"
											onclick={() =>
												goto(`/admin/knowledge?edit=${encodeURIComponent(article.slug)}`)}
										>
											<Pencil class="size-3.5"></Pencil>
										</Button>
										<Button
											variant="ghost"
											size="icon"
											aria-label="Delete"
											class="size-8 hover:bg-destructive/10 hover:text-destructive"
											onclick={() => deleteArticle(article.slug, article.title)}
										>
											<Trash2 class="size-3.5"></Trash2>
										</Button>
									</div>
								</TableCell>
							</TableRow>
						{/each}
					{/if}
				</TableBody>
			</Table>
		</div>

		<div class="flex justify-center">
			<Paginator bind:page {totalPages} />
		</div>
	{:else if loading}
		<div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
			{#each Array(6) as _, i (i)}
				<div class="rounded-xl bg-card p-3 ring-1 ring-foreground/10">
					<Skeleton class="mb-2 size-8 rounded-lg" />
					<Skeleton class="mb-2 h-3 w-28" />
					<Skeleton class="h-2.5 w-16" />
				</div>
			{/each}
		</div>
	{:else}
		<div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
			{#each sectionCards as section (section.slug)}
				<div
					class="rounded-xl bg-card p-3 ring-1 ring-foreground/10 transition-shadow hover:shadow-md"
				>
					<div class="mb-2 flex items-start justify-between">
						<div
							class="flex size-8 items-center justify-center rounded-lg {sectionColor(section.slug)}"
						>
							<BookOpen class="size-4"></BookOpen>
						</div>
					</div>
					<h3 class="text-2xs-plus font-semibold">{section.label}</h3>
					<p class="mb-2 text-2xs text-muted-foreground">{section.count} articles</p>
					<div class="flex items-center gap-2">
						<span
							class="text-2xs font-medium {section.count > 0 ? 'text-success' : 'text-muted-foreground'}"
						>
							{section.count > 0 ? 'Active' : 'Empty'}
						</span>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>

<ConfirmDialog
	open={confirmSlug !== null}
	title="Delete article?"
	description={confirmSlug
		? `Delete article "${confirmTitle}"? This cannot be undone.`
		: undefined}
	confirmLabel={deleting ? 'Deleting...' : 'Delete'}
	onconfirm={confirmedDelete}
/>
