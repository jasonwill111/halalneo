<script lang="ts">
	import { adminData } from '$lib/stores/admin-data.svelte';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Badge } from '$lib/components/ui/badge';
	import { Button } from '$lib/components/ui/button';
	import { localizeHref } from '$lib/paraglide/runtime.js';
	import Users from '@lucide/svelte/icons/users';
	import Store from '@lucide/svelte/icons/store';
	import Package from '@lucide/svelte/icons/package';
	import FolderTree from '@lucide/svelte/icons/folder-tree';
	import BadgeCheck from '@lucide/svelte/icons/badge-check';

	const activeSuppliers = $derived(adminData.merchants.filter((m) => m.status === 'active').length);
	const pendingSuppliers = $derived(adminData.merchants.filter((m) => m.status === 'pending').length);
	const certifiedProducts = $derived(adminData.skus.filter((s) => s.certStatus === 'certified').length);
	const pendingProducts = $derived(adminData.skus.filter((s) => s.certStatus === 'pending').length);
	const expiredProducts = $derived(adminData.skus.filter((s) => s.certStatus === 'expired').length);
</script>

<svelte:head><title>Dashboard — HalalNeo Admin</title></svelte:head>

<div class="space-y-8">
	<div class="space-y-1">
		<h1 class="text-3xl font-semibold tracking-tight">Dashboard</h1>
		<p class="max-w-2xl text-sm text-muted-foreground">
			Operational overview of the HalalNeo demo dataset.
		</p>
	</div>

	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<Card>
			<CardHeader class="gap-2">
				<Users class="size-5 text-primary"></Users>
				<CardTitle class="text-2xl">{adminData.merchants.length}</CardTitle>
				<CardDescription>Suppliers (sellers)</CardDescription>
			</CardHeader>
		</Card>
		<Card>
			<CardHeader class="gap-2">
				<Package class="size-5 text-primary"></Package>
				<CardTitle class="text-2xl">{adminData.skus.length}</CardTitle>
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
					{certifiedProducts} verified · {pendingProducts} pending · {expiredProducts} expired
				</CardDescription>
			</CardHeader>
			<CardContent class="flex flex-wrap items-center gap-2">
				<Badge variant="default">Certified {certifiedProducts}</Badge>
				<Badge variant="secondary">Pending {pendingProducts}</Badge>
				<Badge variant="destructive">Expired {expiredProducts}</Badge>
			</CardContent>
		</Card>
	</div>

	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		<Card>
			<CardHeader>
				<CardTitle class="text-lg">Knowledge base</CardTitle>
				<CardDescription>{adminData.kbSections.length} sections · {adminData.kbArticles.length} articles</CardDescription>
			</CardHeader>
			<CardContent>
				<Button href={localizeHref('/admin/knowledge')} variant="outline" size="sm">Manage articles</Button>
			</CardContent>
		</Card>
		<Card>
			<CardHeader>
				<CardTitle class="text-lg">Content</CardTitle>
				<CardDescription>{adminData.glossary.length} glossary terms · {adminData.blogPosts.length} blog posts</CardDescription>
			</CardHeader>
			<CardContent>
				<Button href={localizeHref('/admin/blog')} variant="outline" size="sm">Manage blog</Button>
			</CardContent>
		</Card>
		<Card>
			<CardHeader>
				<CardTitle class="text-lg">AI tools</CardTitle>
				<CardDescription>{adminData.aiTools.filter((t) => t.status === 'active').length} of {adminData.aiTools.length} enabled</CardDescription>
			</CardHeader>
			<CardContent>
				<Button href={localizeHref('/admin/ai-tools')} variant="outline" size="sm">Manage tools</Button>
			</CardContent>
		</Card>
	</div>
</div>