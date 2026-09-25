<script lang="ts">
	import type { PageProps } from './$types';
	import { onMount } from 'svelte';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Card, CardContent } from '#lib/components/ui/card/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import {
		Empty,
		EmptyContent,
		EmptyDescription,
		EmptyHeader,
		EmptyTitle
	} from '#lib/components/ui/empty/index.js';
	import { Skeleton } from '#lib/components/ui/skeleton/index.js';
	import BrandedEmptyMedia from '#lib/components/site/branded-empty-media.svelte';
	import ErrorRetry from '#lib/components/site/error-retry.svelte';
	import type { LoadFailure } from '#lib/utils/load-error.js';
	import { describeFetchFailure, describeThrownFailure } from '#lib/utils/load-error.js';
	import UserRound from '@lucide/svelte/icons/user-round';
	import Heart from '@lucide/svelte/icons/heart';
	import Mail from '@lucide/svelte/icons/mail';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';

	// `data.user` is guaranteed by src/routes/account/+layout.server.ts, which
	// redirects anonymous visitors to /login?next=/account.
	let { data }: PageProps = $props();

	const firstName = $derived(
		(data.user.name.trim() || data.user.email.split('@')[0] || 'there').split(/\s+/)[0]
	);

	const links = [
		{
			label: 'Profile',
			href: '/account/profile',
			icon: UserRound,
			description: 'Manage your personal and company information.'
		},
		{
			label: 'Saved Items',
			href: '/account/saved',
			icon: Heart,
			description: 'View your saved products and manufacturers.'
		},
		{
			label: 'Inquiries',
			href: '/account/inquiries',
			icon: Mail,
			description: 'Track your product inquiries and messages.'
		}
	];

	interface FavoriteRow {
		productSlug: string;
		name?: string | null;
	}
	interface FollowingRow {
		supplierSlug: string;
		name?: string | null;
		country?: string | null;
	}
	interface MyInquiry {
		id: string;
		subject: string;
		status: string;
		createdAt?: string | null;
	}

	let favorites = $state<FavoriteRow[]>([]);
	let follows = $state<FollowingRow[]>([]);
	let inquiries = $state<MyInquiry[]>([]);
	let loading = $state(true);
	let failure = $state<LoadFailure | null>(null);

	async function loadOverview(): Promise<void> {
		loading = true;
		failure = null;
		try {
			const [favRes, folRes, iqRes] = await Promise.all([
				fetch('/api/favorites'),
				fetch('/api/follows'),
				fetch('/api/inquiries/mine')
			]);
			if (!favRes.ok) failure = describeFetchFailure(favRes);
			if (!folRes.ok && !failure) failure = describeFetchFailure(folRes);
			if (!iqRes.ok && !failure) failure = describeFetchFailure(iqRes);
			if (favRes.ok)
				favorites = ((await favRes.json()) as { items?: FavoriteRow[] }).items?.slice(0, 4) ?? [];
			if (folRes.ok)
				follows = ((await folRes.json()) as { items?: FollowingRow[] }).items?.slice(0, 4) ?? [];
			if (iqRes.ok)
				inquiries = ((await iqRes.json()) as { items?: MyInquiry[] }).items?.slice(0, 4) ?? [];
		} catch (error) {
			failure = describeThrownFailure(error);
		} finally {
			loading = false;
		}
	}

	onMount(() => {
		void loadOverview();
	});

	function inquiryStatusClass(status: string): string {
		if (status === 'active') return 'text-success';
		if (status === 'flagged') return 'text-warn';
		return 'text-muted-foreground';
	}
</script>

<svelte:head>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="min-w-0 space-y-4">
	<div class="min-w-0 space-y-1">
		<h1 class="text-xl sm:text-2xl">Welcome back, {firstName}</h1>
		<p class="max-w-2xl text-xs text-muted-foreground sm:text-sm">
			Here's a quick overview of your account.
		</p>
	</div>

	<div class="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-3">
		{#each links as link (link.href)}
			<a href={localizeHref(link.href)} class="group block min-w-0">
				<Card
					class="h-full min-w-0 transition-colors group-hover:border-primary/30 group-hover:shadow-md"
				>
					<CardContent class="flex min-w-0 flex-col gap-2 p-3">
						<div class="flex items-center justify-between gap-2">
							<div
								class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
							>
								<link.icon class="size-4"></link.icon>
							</div>
							<ArrowUpRight
								class="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
							></ArrowUpRight>
						</div>
						<div class="min-w-0">
							<h3 class="text-xs font-semibold text-foreground">{link.label}</h3>
							<p class="mt-0.5 hidden text-xs leading-relaxed text-muted-foreground sm:block">
								{link.description}
							</p>
						</div>
					</CardContent>
				</Card>
			</a>
		{/each}
	</div>

	{#if loading}
		<div class="grid min-w-0 gap-3 sm:grid-cols-2">
			{#each Array(2) as _, i (i)}
				<Card class="min-w-0">
					<CardContent class="space-y-3 p-4">
						<Skeleton class="h-4 w-28" />
						<Skeleton class="h-8 w-full" />
						<Skeleton class="h-8 w-full" />
						<Skeleton class="h-8 w-full" />
					</CardContent>
				</Card>
			{/each}
		</div>
	{:else if failure}
		<ErrorRetry {failure} subject="account activity" onretry={loadOverview} />
	{:else}
		<div class="grid min-w-0 gap-3 sm:grid-cols-2">
			<Card class="min-w-0">
				<CardContent class="min-w-0 p-0">
					<div class="flex items-center justify-between gap-2 p-4 pb-0">
						<h2 class="text-sm font-semibold text-foreground">Latest inquiries</h2>
						<a
							href={localizeHref('/account/inquiries')}
							class="shrink-0 text-xs font-medium text-primary hover:underline">View all</a
						>
					</div>
					<div class="p-4 pt-3">
						{#if inquiries.length === 0}
							<Empty class="min-h-40 border border-border/60 bg-card/40 p-5">
								<EmptyHeader>
									<BrandedEmptyMedia variant="icon">
										<Mail class="size-6 text-muted-foreground"></Mail>
									</BrandedEmptyMedia>
									<EmptyTitle>No inquiries yet</EmptyTitle>
									<EmptyDescription class="text-xs sm:text-sm">
										Start a conversation from a product or supplier page to track it here.
									</EmptyDescription>
								</EmptyHeader>
								<EmptyContent>
									<Button href={localizeHref('/suppliers')} variant="outline" size="sm">
										Browse suppliers
									</Button>
								</EmptyContent>
							</Empty>
						{:else}
							<ul class="min-w-0 divide-y divide-border">
								{#each inquiries as q (q.id)}
									<li class="flex min-w-0 items-center justify-between gap-2 py-2">
										<span class="min-w-0 text-xs break-words text-foreground">{q.subject}</span>
										<span class={`${inquiryStatusClass(q.status)} shrink-0 text-2xs font-medium`}
											>{q.status}</span
										>
									</li>
								{/each}
							</ul>
						{/if}
					</div>
				</CardContent>
			</Card>
			<Card class="min-w-0">
				<CardContent class="min-w-0 p-0">
					<div class="flex items-center justify-between gap-2 p-4 pb-0">
						<h2 class="text-sm font-semibold text-foreground">Saved & followed</h2>
						<a
							href={localizeHref('/account/saved')}
							class="shrink-0 text-xs font-medium text-primary hover:underline">View all</a
						>
					</div>
					<div class="p-4 pt-3">
						{#if favorites.length === 0 && follows.length === 0}
							<Empty class="min-h-40 border border-border/60 bg-card/40 p-5">
								<EmptyHeader>
									<BrandedEmptyMedia variant="icon">
										<Heart class="size-6 text-muted-foreground"></Heart>
									</BrandedEmptyMedia>
									<EmptyTitle>Nothing saved yet</EmptyTitle>
									<EmptyDescription class="text-xs sm:text-sm">
										Save products or follow suppliers to keep them close at hand.
									</EmptyDescription>
								</EmptyHeader>
								<EmptyContent>
									<Button href={localizeHref('/products')} variant="outline" size="sm">
										Browse products
									</Button>
								</EmptyContent>
							</Empty>
						{:else}
							<ul class="min-w-0 divide-y divide-border">
								{#each favorites as f (f.productSlug)}
									<li class="min-w-0 py-2">
										<a
											href={localizeHref(`/product/${f.productSlug}`)}
											class="block min-w-0 text-xs break-words text-foreground hover:text-primary"
											>{f.name ?? f.productSlug}</a
										>
									</li>
								{/each}
								{#each follows as s (s.supplierSlug)}
									<li class="flex min-w-0 items-center justify-between gap-2 py-2">
										<a
											href={localizeHref(`/supplier/${s.supplierSlug}`)}
											class="min-w-0 text-xs break-words text-foreground hover:text-primary"
											>{s.name ?? s.supplierSlug}</a
										>
										{#if s.country}
											<span class="shrink-0 text-2xs text-muted-foreground">{s.country}</span>
										{/if}
									</li>
								{/each}
							</ul>
						{/if}
					</div>
				</CardContent>
			</Card>
		</div>
	{/if}
</div>
