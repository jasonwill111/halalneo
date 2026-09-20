<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Skeleton } from '#lib/components/ui/skeleton/index.js';
	import { Tabs, TabsList, TabsTrigger } from '#lib/components/ui/tabs/index.js';
	import Box from '@lucide/svelte/icons/box';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import { toast } from 'svelte-sonner';
	import { onMount } from 'svelte';
	import Paginator from '#lib/components/site/paginator.svelte';
	import type { ApiList } from '#lib/types/api.js';

	// One saved-product row from /api/favorites (product info joined server-side).
	interface FavoriteRow {
		productSlug: string;
		name?: string | null;
		image?: string | null;
		shortDescription?: string | null;
		priceMin?: string | number | null;
		certStatus?: string | null;
		originCountry?: string | null;
	}

	// One followed-supplier row from /api/follows (supplier info joined server-side).
	interface FollowingRow {
		supplierSlug: string;
		name?: string | null;
		country?: string | null;
		logoInitials?: string | null;
	}

	// Server-backed lists (login required; account routes are guarded).
	let savedProducts = $state<FavoriteRow[]>([]);
	let following = $state<FollowingRow[]>([]);
	let loading = $state(true);

	onMount(async () => {
		try {
			const [favRes, folRes] = await Promise.all([
				fetch('/api/favorites'),
				fetch('/api/follows')
			]);
			if (favRes.ok)
				savedProducts = ((await favRes.json()) as ApiList<FavoriteRow>).items ?? [];
			if (folRes.ok) following = ((await folRes.json()) as ApiList<FollowingRow>).items ?? [];
			if (!favRes.ok && !folRes.ok) toast.error('Could not load your saved items.');
		} catch {
			toast.error('Network error — could not load your saved items.');
		} finally {
			loading = false;
		}
	});

	let busySlug = $state<string | null>(null);

	async function unfollow(slug: string, name: string) {
		if (busySlug) return;
		busySlug = slug;
		try {
			const res = await fetch(`/api/follows?supplierSlug=${encodeURIComponent(slug)}`, {
				method: 'DELETE'
			});
			if (!res.ok) {
				const body = (await res.json().catch(() => ({}))) as { error?: string };
				toast.error(body.error ?? 'Could not unfollow. Please try again.');
				return;
			}
			following = following.filter((f) => f.supplierSlug !== slug);
			toast.success(`Unfollowed ${name}.`);
		} catch {
			toast.error('Network error — could not unfollow. Please try again.');
		} finally {
			busySlug = null;
		}
	}

	async function removeFavorite(slug: string, name: string) {
		if (busySlug) return;
		busySlug = slug;
		try {
			const res = await fetch(`/api/favorites?productSlug=${encodeURIComponent(slug)}`, {
				method: 'DELETE'
			});
			if (!res.ok) {
				const body = (await res.json().catch(() => ({}))) as { error?: string };
				toast.error(body.error ?? 'Could not remove. Please try again.');
				return;
			}
			savedProducts = savedProducts.filter((p) => p.productSlug !== slug);
			toast.info(`Removed ${name} from your saved items.`);
		} catch {
			toast.error('Network error — could not remove. Please try again.');
		} finally {
			busySlug = null;
		}
	}

	let tab = $state('products');

	// Client-side pagination: lists come fully fetched (API caps at 200/follows).
	const PAGE_SIZE = 9;
	let page = $state(1);
	$effect(() => {
		// reset to first page whenever the visible list or tab changes
		void tab;
		void savedProducts.length;
		void following.length;
		page = 1;
	});
	const visibleCount = $derived(tab === 'following' ? following.length : savedProducts.length);
	const totalPages = $derived(Math.max(1, Math.ceil(visibleCount / PAGE_SIZE)));
	const pagedProducts = $derived(
		savedProducts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
	);
	const pagedFollowing = $derived(following.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE));
</script>

<svelte:head>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="flex-1">
	<Tabs bind:value={tab} class="mb-3">
		<TabsList variant="line">
			<TabsTrigger value="products"
				>Products <span class="ms-1 opacity-70">({savedProducts.length})</span></TabsTrigger
			>
			<TabsTrigger value="following"
				>Following <span class="ms-1 opacity-70">({following.length})</span></TabsTrigger
			>
		</TabsList>
	</Tabs>

	{#if loading}
		<div class="grid grid-cols-2 gap-2 sm:grid-cols-2 lg:grid-cols-3">
			{#each Array(4) as _, i (i)}
				<Skeleton class="h-44 rounded-xl" />
			{/each}
		</div>
	{:else if tab === 'following'}
		{#if following.length === 0}
			<div class="rounded-xl bg-card p-8 text-center ring-1 ring-foreground/10">
				<Box class="mx-auto size-8 text-muted-foreground/30"></Box>
				<p class="mt-2 text-2xs-plus text-muted-foreground">
					You're not following any suppliers yet.
				</p>
			</div>
		{:else}
			<div class="grid grid-cols-2 gap-2 sm:grid-cols-2 lg:grid-cols-3">
				{#each pagedFollowing as f (f.supplierSlug)}
					<article
						class="group relative rounded-xl bg-card p-2.5 ring-1 ring-foreground/10 transition-[transform,box-shadow] duration-base ease-spring hover:-translate-y-0.5 hover:shadow-md"
					>
						<a href={`/supplier/${f.supplierSlug}`} class="block">
							<div
								class="mb-2 flex h-20 items-center justify-center rounded-md bg-primary/10 text-xs font-bold text-primary"
							>
								{f.logoInitials ?? (f.name ?? '?').slice(0, 2).toUpperCase()}
							</div>
							<h3
								class="line-clamp-2 text-xs font-medium transition-colors group-hover:text-primary"
							>
								{f.name ?? f.supplierSlug}
							</h3>
							{#if f.country}
								<p class="mt-0.5 line-clamp-1 text-2xs text-muted-foreground">{f.country}</p>
							{/if}
						</a>
						<Button
							variant="ghost"
							size="sm"
							class="mt-1.5 h-6 text-2xs text-muted-foreground hover:text-destructive"
							onclick={() => unfollow(f.supplierSlug, f.name ?? f.supplierSlug)}
							disabled={busySlug !== null}
							aria-busy={busySlug === f.supplierSlug}
							aria-label={`Unfollow ${f.name ?? f.supplierSlug}`}
						>
							{#if busySlug === f.supplierSlug}
								<Loader2 class="size-3 animate-spin" />
								Unfollowing…
							{:else}
								Unfollow
							{/if}
						</Button>
					</article>
				{/each}
			</div>
			<Paginator bind:page {totalPages} />
		{/if}
	{:else if savedProducts.length === 0}
		<div class="rounded-xl bg-card p-8 text-center ring-1 ring-foreground/10">
			<Box class="mx-auto size-8 text-muted-foreground/30"></Box>
			<p class="mt-2 text-2xs-plus text-muted-foreground">No saved products yet.</p>
			<p class="mt-1 text-2xs text-muted-foreground">
				Tap the heart on any product to save it here.
			</p>
		</div>
	{:else}
		<div class="grid grid-cols-2 gap-2 sm:grid-cols-2 lg:grid-cols-3">
			{#each pagedProducts as item (item.productSlug)}
				<article
					class="group relative rounded-xl bg-card p-2.5 ring-1 ring-foreground/10 transition-[transform,box-shadow] duration-base ease-spring hover:-translate-y-0.5 hover:shadow-md"
				>
					<a href={`/product/${item.productSlug}`} class="block">
						{#if item.image}
							<img
								src={item.image}
								alt={item.name ?? 'Product'}
								class="mb-2 h-20 w-full rounded-md object-cover"
								loading="lazy"
							/>
						{:else}
							<div
								class="mb-2 flex h-20 items-center justify-center rounded-md bg-muted text-muted-foreground/30"
							>
								<Box class="size-6"></Box>
							</div>
						{/if}
						{#if item.certStatus}
							<Badge variant="secondary" class="px-1.5 text-2xs">{item.certStatus}</Badge>
						{/if}
						<h3
							class="mt-1.5 line-clamp-2 text-xs font-medium transition-colors group-hover:text-primary"
						>
							{item.name ?? item.productSlug}
						</h3>
						{#if item.priceMin}
							<p class="mt-1 text-xs font-bold text-primary">${item.priceMin}</p>
						{/if}
						{#if item.shortDescription}
							<p class="mt-0.5 line-clamp-1 text-2xs text-muted-foreground">
								{item.shortDescription}
							</p>
						{/if}
					</a>
					<Button
						variant="ghost"
						size="sm"
						class="absolute top-2 end-2 h-6 px-1.5 text-2xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:bg-transparent hover:text-destructive"
						onclick={(e) => {
							e.preventDefault();
							removeFavorite(item.productSlug, item.name ?? item.productSlug);
						}}
					>
						Remove
					</Button>
				</article>
			{/each}
		</div>
		<Paginator bind:page {totalPages} />
	{/if}
</div>
