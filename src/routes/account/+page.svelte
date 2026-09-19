<script lang="ts">
	import type { PageProps } from './$types';
	import { onMount } from 'svelte';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Card, CardContent } from '#lib/components/ui/card/index.js';
	import { Skeleton } from '#lib/components/ui/skeleton/index.js';
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

	onMount(async () => {
		try {
			const [favRes, folRes, iqRes] = await Promise.all([
				fetch('/api/favorites'),
				fetch('/api/follows'),
				fetch('/api/inquiries/mine')
			]);
			if (favRes.ok)
				favorites = ((await favRes.json()) as { items?: FavoriteRow[] }).items?.slice(0, 4) ?? [];
			if (folRes.ok)
				follows = ((await folRes.json()) as { items?: FollowingRow[] }).items?.slice(0, 4) ?? [];
			if (iqRes.ok)
				inquiries = ((await iqRes.json()) as { items?: MyInquiry[] }).items?.slice(0, 4) ?? [];
		} catch {
			// overview tiles stay usable when the activity fetch fails
		} finally {
			loading = false;
		}
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

<div class="space-y-5">
	<div>
		<h1 class="text-sm font-bold text-foreground">Welcome back, {firstName}</h1>
		<p class="mt-0.5 text-2xs text-muted-foreground">Here's a quick overview of your account.</p>
	</div>

	<div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
		{#each links as link (link.href)}
			<a href={localizeHref(link.href)} class="group block">
				<Card class="h-full transition-colors group-hover:border-primary/30 group-hover:shadow-md">
					<CardContent class="flex flex-col gap-2.5 p-4">
						<div class="flex items-center justify-between">
							<div
								class="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary"
							>
								<link.icon class="size-4"></link.icon>
							</div>
							<ArrowUpRight
								class="size-3.5 text-muted-foreground transition-colors group-hover:text-primary"
							></ArrowUpRight>
						</div>
						<div>
							<h3 class="text-2xs-plus font-bold text-foreground">{link.label}</h3>
							<p class="mt-0.5 text-2xs leading-relaxed text-muted-foreground">
								{link.description}
							</p>
						</div>
					</CardContent>
				</Card>
			</a>
		{/each}
	</div>

	<div class="grid gap-3 lg:grid-cols-2">
		<Card>
			<CardContent class="space-y-2 p-4">
				<div class="flex items-center justify-between">
					<h2 class="text-2xs-plus font-bold text-foreground">Latest inquiries</h2>
					<a
						href={localizeHref('/account/inquiries')}
						class="text-2xs font-medium text-primary hover:underline">View all</a
					>
				</div>
				{#if loading}
					<div class="space-y-2">
						<Skeleton class="h-8" /><Skeleton class="h-8" /><Skeleton class="h-8" />
					</div>
				{:else if inquiries.length === 0}
					<p class="text-2xs text-muted-foreground">
						No inquiries yet — send one from any product or supplier page.
					</p>
				{:else}
					<ul class="divide-y divide-border">
						{#each inquiries as q (q.id)}
							<li class="flex items-center justify-between gap-2 py-1.5">
								<span class="truncate text-2xs-plus text-foreground">{q.subject}</span>
								<span class={`${inquiryStatusClass(q.status)} shrink-0 text-2xs font-medium`}
									>{q.status}</span
								>
							</li>
						{/each}
					</ul>
				{/if}
			</CardContent>
		</Card>
		<Card>
			<CardContent class="space-y-2 p-4">
				<div class="flex items-center justify-between">
					<h2 class="text-2xs-plus font-bold text-foreground">Saved & followed</h2>
					<a
						href={localizeHref('/account/saved')}
						class="text-2xs font-medium text-primary hover:underline">View all</a
					>
				</div>
				{#if loading}
					<div class="space-y-2">
						<Skeleton class="h-8" /><Skeleton class="h-8" /><Skeleton class="h-8" />
					</div>
				{:else if favorites.length === 0 && follows.length === 0}
					<p class="text-2xs text-muted-foreground">
						Nothing saved yet — tap the heart on products or follow suppliers you trade with.
					</p>
				{:else}
					<ul class="divide-y divide-border">
						{#each favorites as f (f.productSlug)}
							<li class="py-1.5">
								<a
									href={localizeHref(`/product/${f.productSlug}`)}
									class="truncate text-2xs-plus text-foreground hover:text-primary"
									>{f.name ?? f.productSlug}</a
								>
							</li>
						{/each}
						{#each follows as s (s.supplierSlug)}
							<li class="flex items-center justify-between gap-2 py-1.5">
								<a
									href={localizeHref(`/supplier/${s.supplierSlug}`)}
									class="truncate text-2xs-plus text-foreground hover:text-primary"
									>{s.name ?? s.supplierSlug}</a
								>
								{#if s.country}
									<span class="shrink-0 text-2xs text-muted-foreground">{s.country}</span>
								{/if}
							</li>
						{/each}
					</ul>
				{/if}
			</CardContent>
		</Card>
	</div>
</div>
