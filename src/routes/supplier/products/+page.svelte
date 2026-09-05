<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Tabs, TabsList, TabsTrigger } from '#lib/components/ui/tabs/index.js';
	import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '#lib/components/ui/table/index.js';
	import Plus from '@lucide/svelte/icons/plus';
	import MoreHorizontal from '@lucide/svelte/icons/more-horizontal';
	import { adminData, getCategory } from '#lib/stores/admin-data.svelte.js';

	// TODO: Replace with authenticated user's supplier slug from session/load function
	const SUPPLIER_SLUG = 'nusantara-foods';

	let statusTab = $state('all');
	const products = $derived(
		adminData.products
			.filter((p) => p.supplierSlug === SUPPLIER_SLUG)
			.map((p) => ({
				name: p.name,
				category: getCategory(p.categorySlug)?.name ?? p.categorySlug,
				price: p.priceRange,
				moq: p.moq,
				cert: p.certStatus === 'certified' ? 'Certified' : p.certStatus === 'pending' ? 'Pending' : 'N/A',
				status: (p.status ?? 'active') as 'active' | 'pending',
				views: p.views ?? 0
			}))
	);
	const visibleProducts = $derived(
		statusTab === 'all' ? products : products.filter((p) => p.status === statusTab)
	);
	const activeCount = $derived(products.filter((p) => p.status === 'active').length);
	const pendingCount = $derived(products.filter((p) => p.status === 'pending').length);
</script>

<svelte:head>
	<title>My Products — HalalNeo</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="mb-3 flex items-center justify-between">
	<div>
		<h2 class="text-sm font-bold">My Products</h2>
		<p class="text-[10px] text-muted-foreground">{products.length} listings</p>
	</div>
	<Button size="sm" class="text-[10px]">
		<Plus class="size-3"></Plus>
		Add Product
	</Button>
</div>

<Tabs bind:value={statusTab} class="mb-2">
	<TabsList variant="line">
		<TabsTrigger value="all">All ({products.length})</TabsTrigger>
		<TabsTrigger value="active">Active ({activeCount})</TabsTrigger>
		<TabsTrigger value="pending">Pending ({pendingCount})</TabsTrigger>
	</TabsList>
</Tabs>

<div class="overflow-x-auto rounded-xl bg-card">
	{#if visibleProducts.length === 0}
		<div class="flex flex-col items-center justify-center py-12 text-center">
			<p class="text-sm font-medium text-muted-foreground">No products yet</p>
			<p class="text-[10px] text-muted-foreground">Add your first product to get started.</p>
		</div>
	{:else}
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead class="text-[10px]">Product</TableHead>
					<TableHead class="text-[10px]">Category</TableHead>
					<TableHead class="text-[10px]">Price</TableHead>
					<TableHead class="text-[10px]">MOQ</TableHead>
					<TableHead class="text-[10px]">Cert</TableHead>
					<TableHead class="text-[10px]">Status</TableHead>
					<TableHead class="text-[10px]"></TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#each visibleProducts as p}
					<TableRow>
						<TableCell class="font-medium">{p.name}</TableCell>
						<TableCell class="text-muted-foreground">{p.category}</TableCell>
						<TableCell class="font-semibold">{p.price}</TableCell>
						<TableCell class="text-muted-foreground">{p.moq}</TableCell>
						<TableCell class="text-muted-foreground">{p.cert}</TableCell>
						<TableCell><Badge variant={p.status === 'active' ? 'default' : 'secondary'} class="capitalize">{p.status}</Badge></TableCell>
						<TableCell>
							<Button variant="ghost" size="icon" class="size-7">
								<MoreHorizontal class="size-4"></MoreHorizontal>
							</Button>
						</TableCell>
					</TableRow>
				{/each}
			</TableBody>
		</Table>
	{/if}
</div>
