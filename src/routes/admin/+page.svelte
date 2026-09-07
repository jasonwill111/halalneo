<script lang="ts">
	import { adminData } from '#lib/stores/admin-data.svelte.js';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '#lib/components/ui/card/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import Users from '@lucide/svelte/icons/users';
	import Store from '@lucide/svelte/icons/store';
	import Package from '@lucide/svelte/icons/package';
	import FolderTree from '@lucide/svelte/icons/folder-tree';
	import BadgeCheck from '@lucide/svelte/icons/badge-check';
	import Inbox from '@lucide/svelte/icons/inbox';
	import Mail from '@lucide/svelte/icons/mail';
	import Clock from '@lucide/svelte/icons/clock';

	let { data } = $props();

	const activeSuppliers = $derived(adminData.suppliers.filter((s) => s.status === 'active').length);
	const pendingSuppliers = $derived(
		adminData.suppliers.filter((s) => s.status === 'pending').length
	);
	const certifiedProducts = $derived(
		adminData.products.filter((s) => s.certStatus === 'certified').length
	);
	const pendingProducts = $derived(
		adminData.products.filter((s) => s.certStatus === 'pending').length
	);
	const notCertifiedProducts = $derived(
		adminData.products.filter((s) => s.certStatus === 'not-certified').length
	);

	const liveApplications = $derived(
		(data.applications ?? []) as Array<{
			slug: string;
			name: string;
			country: string;
			businessType: string;
			email: string | null;
			createdAt: number | string;
		}>
	);
	const livePendingCount = $derived(data.pendingCount ?? 0);

	function formatTime(ts: number | string): string {
		const d = new Date(ts);
		const now = Date.now();
		const diff = now - d.getTime();
		const minutes = Math.floor(diff / 60_000);
		if (minutes < 1) return 'just now';
		if (minutes < 60) return `${minutes}m ago`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}h ago`;
		const days = Math.floor(hours / 24);
		if (days < 7) return `${days}d ago`;
		return d.toISOString().slice(0, 10);
	}
</script>

<div class="space-y-8">
	<div class="space-y-1">
		<h1 class="text-3xl font-semibold tracking-tight">Dashboard</h1>
		<p class="max-w-2xl text-sm text-muted-foreground">
			Operational overview of the HalalNeo demo dataset.
		</p>
	</div>

	{#if livePendingCount > 0}
		<Card class="border-info/30 bg-info/5">
			<CardHeader>
				<div class="flex items-center justify-between gap-3">
					<div class="flex items-center gap-2">
						<Inbox class="size-5 text-info"></Inbox>
						<CardTitle class="text-lg">Recent supplier applications</CardTitle>
					</div>
					<Badge variant="secondary">{livePendingCount} pending</Badge>
				</div>
				<CardDescription>
					New applications submitted through <a href="/supplier/onboarding" class="underline underline-offset-2 hover:text-foreground">/supplier/onboarding</a>. Approve or reject each from <a href="/admin/inquiries" class="underline underline-offset-2 hover:text-foreground">/admin/inquiries</a>; the supplier slug becomes public once status is set to active.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ul class="divide-y divide-border">
					{#each liveApplications.slice(0, 5) as app (app.slug)}
						<li class="flex items-center gap-3 py-2.5">
							<div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-xs font-semibold text-primary">
								{app.name
									.split(/\s+/)
									.map((p) => p[0])
									.filter(Boolean)
									.slice(0, 2)
									.join('')
									.toUpperCase()}
							</div>
							<div class="min-w-0 flex-1">
								<p class="truncate text-sm font-medium">{app.name}</p>
								<p class="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
									<span>{app.country}</span>
									<span aria-hidden="true">·</span>
									<span class="capitalize">{app.businessType}</span>
									{#if app.email}
										<span aria-hidden="true">·</span>
										<a href="mailto:{app.email}" class="inline-flex items-center gap-1 hover:text-foreground">
											<Mail class="size-3"></Mail>
											{app.email}
										</a>
									{/if}
								</p>
							</div>
							<div class="flex shrink-0 items-center gap-1 text-[10px] text-muted-foreground">
								<Clock class="size-3"></Clock>
								{formatTime(app.createdAt)}
							</div>
						</li>
					{/each}
				</ul>
				{#if liveApplications.length > 5}
					<p class="mt-3 text-[10px] text-muted-foreground">
						Showing 5 of {livePendingCount}. Manage all in /admin/inquiries.
					</p>
				{/if}
			</CardContent>
		</Card>
	{/if}

	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<Card>
			<CardHeader class="gap-2">
				<Users class="size-5 text-primary"></Users>
				<CardTitle class="text-2xl">{adminData.suppliers.length}</CardTitle>
				<CardDescription>Suppliers (sellers)</CardDescription>
			</CardHeader>
		</Card>
		<Card>
			<CardHeader class="gap-2">
				<Package class="size-5 text-primary"></Package>
				<CardTitle class="text-2xl">{adminData.products.length}</CardTitle>
				<CardDescription>Products (SKUs)</CardDescription>
			</CardHeader>
		</Card>
		<Card>
			<CardHeader class="gap-2">
				<FolderTree class="size-5 text-primary"></FolderTree>
				<CardTitle class="text-2xl">{adminData.categories.length}</CardTitle>
				<CardDescription>Categories</CardDescription>
			</CardHeader>
		</Card>
		<Card>
			<CardHeader class="gap-2">
				<BadgeCheck class="size-5 text-primary"></BadgeCheck>
				<CardTitle class="text-2xl">{adminData.certifyingBodies.length}</CardTitle>
				<CardDescription>Certifying bodies</CardDescription>
			</CardHeader>
		</Card>
	</div>

	<div class="grid gap-4 lg:grid-cols-2">
		<Card>
			<CardHeader>
				<CardTitle>Supplier status</CardTitle>
				<CardDescription>{activeSuppliers} active · {pendingSuppliers} pending</CardDescription>
			</CardHeader>
			<CardContent class="flex flex-wrap items-center gap-2">
				<Badge variant="default">Active {activeSuppliers}</Badge>
				<Badge variant="secondary">Pending {pendingSuppliers}</Badge>
			</CardContent>
		</Card>
		<Card>
			<CardHeader>
				<CardTitle>Product certification</CardTitle>
				<CardDescription>
					{certifiedProducts} verified · {pendingProducts} pending · {notCertifiedProducts} not certified
				</CardDescription>
			</CardHeader>
			<CardContent class="flex flex-wrap items-center gap-2">
				<Badge variant="default">Certified {certifiedProducts}</Badge>
				<Badge variant="secondary">Pending {pendingProducts}</Badge>
				<Badge variant="destructive">Not certified {notCertifiedProducts}</Badge>
			</CardContent>
		</Card>
	</div>

	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		<Card>
			<CardHeader>
				<CardTitle class="text-lg">Knowledge base</CardTitle>
				<CardDescription
					>{adminData.kbSections.length} sections · {adminData.kbArticles.length} articles</CardDescription
				>
			</CardHeader>
			<CardContent>
				<Button href={localizeHref('/admin/knowledge')} variant="outline" size="sm"
					>Manage articles</Button
				>
			</CardContent>
		</Card>
		<Card>
			<CardHeader>
				<CardTitle class="text-lg">Content</CardTitle>
				<CardDescription
					>{adminData.glossary.length} glossary terms · {adminData.blogPosts.length} blog posts</CardDescription
				>
			</CardHeader>
			<CardContent>
				<Button href={localizeHref('/admin/blog')} variant="outline" size="sm">Manage blog</Button>
			</CardContent>
		</Card>
		<Card>
			<CardHeader>
				<CardTitle class="text-lg">AI tools</CardTitle>
				<CardDescription
					>{adminData.aiTools.filter((t) => t.status === 'active').length} of {adminData.aiTools
						.length} enabled</CardDescription
				>
			</CardHeader>
			<CardContent>
				<Button href={localizeHref('/admin/ai-tools')} variant="outline" size="sm"
					>Manage tools</Button
				>
			</CardContent>
		</Card>
	</div>
</div>
