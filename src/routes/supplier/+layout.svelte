<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { Sheet, SheetContent, SheetTrigger } from '#lib/components/ui/sheet/index.js';
	import Menu from '@lucide/svelte/icons/menu';
	import SupplierSidebar from '#lib/components/site/supplier-sidebar.svelte';
	import { adminData } from '#lib/stores/admin-data.svelte.js';

	let { children } = $props();
	let sheetOpen = $state(false);

	const SUPPLIER_SLUG = 'nusantara-foods';
	const supplier = $derived(adminData.suppliers.find((s) => s.slug === SUPPLIER_SLUG));
	const supplierName = $derived(supplier?.name ?? 'Supplier');
	const supplierInitials = $derived(supplier?.logoInitials ?? 'S');

	function closeSheet() {
		sheetOpen = false;
	}
</script>

<div class="mx-auto flex w-full max-w-7xl flex-1 gap-4 px-4 pb-24 pt-3 sm:px-6 sm:pb-10">
	<!-- Desktop sidebar -->
	<aside class="hidden w-60 shrink-0 lg:block">
		<div class="sticky top-20 space-y-0.5 rounded-xl bg-card p-1.5 ring-1 ring-foreground/10">
			<SupplierSidebar variant="desktop" {supplierName} {supplierInitials} />
		</div>
	</aside>

	<!-- Mobile hamburger -->
	<div class="flex flex-1 flex-col min-w-0">
		<div class="mb-3 flex items-center gap-3 lg:hidden">
			<Sheet bind:open={sheetOpen}>
				<SheetTrigger>
					<Button variant="ghost" size="icon" aria-label="Open menu" class="size-9 shrink-0">
						<Menu class="size-5" />
					</Button>
				</SheetTrigger>
				<SheetContent side="left" class="w-60 p-0">
					<SupplierSidebar
						variant="mobile"
						{supplierName}
						{supplierInitials}
						onNavigate={closeSheet}
					/>
				</SheetContent>
			</Sheet>
			<span class="text-sm font-bold">Supplier Portal</span>
		</div>

		{@render children()}
	</div>
</div>
