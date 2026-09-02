<script lang="ts">
	import { goto } from '$app/navigation';
	import { deleteItem, adminData } from '#lib/stores/admin-data.svelte.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Tabs, TabsList, TabsTrigger, TabsContent } from '#lib/components/ui/tabs/index.js';
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
	import Eye from '@lucide/svelte/icons/eye';
	import FileText from '@lucide/svelte/icons/file-text';
	import FolderOpen from '@lucide/svelte/icons/folder-open';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import BarChart3 from '@lucide/svelte/icons/bar-chart-3';

	let { data } = $props();

	let search = $state('');
	let activeTab = $state<'articles' | 'sections'>('articles');

	const articles = $derived(data.articles as any[]);
	const error = $derived(data.error as string | null);

	const filtered = $derived.by(() => {
		if (!search.trim()) return articles;
		const q = search.toLowerCase();
		return articles.filter(
			(a: any) =>
				a.title?.toLowerCase().includes(q) ||
				a.slug?.toLowerCase().includes(q) ||
				a.section?.toLowerCase().includes(q)
		);
	});

	const totalArticles = $derived(articles.length);
	const publishedCount = $derived(articles.filter((a: any) => a.status === 'published').length);
	const draftCount = $derived(articles.filter((a: any) => a.status === 'draft').length);
	const totalViews = $derived(articles.reduce((sum: number, a: any) => sum + (a.views ?? 0), 0));
	const sections = $derived([...new Set(articles.map((a: any) => a.section).filter(Boolean))]);

	const sectionColors: Record<string, string> = {
		'getting-started': 'bg-blue-500/10 text-blue-600',
		'halal-certification': 'bg-emerald-500/10 text-emerald-600',
		'product-guidelines': 'bg-amber-500/10 text-amber-600',
		'buying-shipping': 'bg-violet-500/10 text-violet-600',
		'supplier-verification': 'bg-rose-500/10 text-rose-600',
		'platform-usage': 'bg-cyan-500/10 text-cyan-600'
	};

	function sectionColor(slug: string): string {
		return sectionColors[slug] ?? 'bg-muted text-muted-foreground';
	}

	function formatSection(slug: string): string {
		return slug
			.split('-')
			.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
			.join(' ');
	}

	function deleteArticle(slug: string) {
		if (window.confirm('Delete this article? This cannot be undone.')) {
			deleteItem('kbArticles', slug);
		}
	}
</script>

<svelte:head>
	<title>Knowledge Base — HalalNeo Admin</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="space-y-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div class="space-y-1">
			<h1 class="text-3xl font-semibold tracking-tight">Knowledge Base</h1>
			<p class="max-w-2xl text-sm text-muted-foreground">
				Manage help articles and documentation across {sections.length} sections.
			</p>
		</div>
		<Button variant="default" size="sm" class="gap-1.5" onclick={() => goto('/admin/knowledge')}>
			<Plus class="size-4"></Plus>
			Add Article
		</Button>
	</div>

	{#if error}
		<div class="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm text-destructive">
			{error}
		</div>
	{/if}

	<div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
		<div class="rounded-xl bg-card p-3 shadow-sm">
			<div class="flex items-center justify-between mb-1">
				<span class="text-[10px] text-muted-foreground">Total Articles</span>
				<FileText class="size-4 text-muted-foreground"></FileText>
			</div>
			<div class="text-xl font-bold">{totalArticles}</div>
			<div class="text-[9px] text-emerald-600">{publishedCount} published</div>
		</div>
		<div class="rounded-xl bg-card p-3 shadow-sm">
			<div class="flex items-center justify-between mb-1">
				<span class="text-[10px] text-muted-foreground">Sections</span>
				<FolderOpen class="size-4 text-muted-foreground"></FolderOpen>
			</div>
			<div class="text-xl font-bold">{sections.length}</div>
			<div class="text-[9px] text-muted-foreground">active sections</div>
		</div>
		<div class="rounded-xl bg-card p-3 shadow-sm">
			<div class="flex items-center justify-between mb-1">
				<span class="text-[10px] text-muted-foreground">Drafts</span>
				<BookOpen class="size-4 text-muted-foreground"></BookOpen>
			</div>
			<div class="text-xl font-bold">{draftCount}</div>
			<div class="text-[9px] text-muted-foreground">unpublished</div>
		</div>
		<div class="rounded-xl bg-card p-3 shadow-sm">
			<div class="flex items-center justify-between mb-1">
				<span class="text-[10px] text-muted-foreground">Total Views</span>
				<BarChart3 class="size-4 text-muted-foreground"></BarChart3>
			</div>
			<div class="text-xl font-bold">{totalViews.toLocaleString()}</div>
			<div class="text-[9px] text-emerald-600">across all articles</div>
		</div>
	</div>

	<Tabs value={activeTab} onValueChange={(v) => activeTab = v}>
		<TabsList>
			<TabsTrigger value="articles">Articles <span class="ml-1 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] text-primary">{totalArticles}</span></TabsTrigger>
			<TabsTrigger value="sections">Sections <span class="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-[9px] text-muted-foreground">{sections.length}</span></TabsTrigger>
		</TabsList>
	</Tabs>

	{#if activeTab === 'articles'}
		<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
			<div class="relative flex-1 sm:max-w-xs">
				<Search class="pointer-events-none absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"></Search>
				<Input bind:value={search} placeholder="Search articles..." class="pl-8 text-[11px]" />
			</div>
		</div>

		<div class="rounded-xl ring-1 ring-foreground/10">
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
					{#each filtered as article (article.slug ?? article.id)}
						<TableRow>
							<TableCell>
								<div class="min-w-0">
									<p class="truncate font-medium">{article.title}</p>
									<p class="truncate text-xs text-muted-foreground">{article.slug}</p>
								</div>
							</TableCell>
							<TableCell>
								{#if article.section}
									<span class="inline-flex rounded-md px-1.5 py-0.5 text-[9px] font-medium {sectionColor(article.section)}">
										{formatSection(article.section)}
									</span>
								{:else}
									<span class="text-xs text-muted-foreground">—</span>
								{/if}
							</TableCell>
							<TableCell>
								<Badge
									variant={article.status === 'published'
										? 'default'
										: article.status === 'draft'
											? 'secondary'
											: 'outline'}
									class="capitalize text-[9px]"
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
										onclick={() => goto(`/admin/knowledge?edit=${article.slug}`)}
									>
										<Pencil class="size-3.5"></Pencil>
									</Button>
									<Button
										variant="ghost"
										size="icon"
										aria-label="Delete"
										class="size-8 hover:bg-destructive/10 hover:text-destructive"
										onclick={() => deleteArticle(article.slug)}
									>
										<Trash2 class="size-3.5"></Trash2>
									</Button>
								</div>
							</TableCell>
						</TableRow>
					{:else}
						<TableRow>
							<TableCell colspan={4} class="py-8 text-center text-sm text-muted-foreground">
								{error ? 'Failed to load articles.' : 'No articles found.'}
							</TableCell>
						</TableRow>
					{/each}
				</TableBody>
			</Table>
		</div>
	{:else}
		<div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
			{#each sections as section (section)}
				<div class="rounded-xl bg-card p-3 shadow-sm hover:shadow-md transition-shadow">
					<div class="flex items-start justify-between mb-2">
						<div class="flex size-8 items-center justify-center rounded-lg {sectionColor(section)}">
							<BookOpen class="size-4"></BookOpen>
						</div>
					</div>
					<h3 class="text-[11px] font-semibold">{formatSection(section)}</h3>
					<p class="text-[9px] text-muted-foreground mb-2">
						{articles.filter((a: any) => a.section === section).length} articles
					</p>
					<div class="flex items-center gap-2">
						<span class="text-[9px] text-green-600 font-medium">Active</span>
					</div>
				</div>
			{/each}
		</div>
	{/if}
</div>
