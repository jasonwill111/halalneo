<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Sheet, SheetContent, SheetTrigger } from '#lib/components/ui/sheet/index.js';
	import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
	import Boxes from '@lucide/svelte/icons/boxes';
	import ClipboardList from '@lucide/svelte/icons/clipboard-list';
	import ChartColumn from '@lucide/svelte/icons/chart-column';
	import UserRound from '@lucide/svelte/icons/user-round';
	import Settings from '@lucide/svelte/icons/settings';
	import LogOut from '@lucide/svelte/icons/log-out';
	import Menu from '@lucide/svelte/icons/menu';
	import { adminData } from '#lib/stores/admin-data.svelte.js';

	let { children } = $props();
	let sheetOpen = $state(false);

	const SUPPLIER_SLUG = 'nusantara-foods';
	const supplier = $derived(adminData.suppliers.find((s) => s.slug === SUPPLIER_SLUG));
	const supplierName = $derived(supplier?.name ?? 'Supplier');
	const supplierInitials = $derived(supplier?.logoInitials ?? 'S');

	const nav = [
		{ label: 'Dashboard', href: '/supplier/dashboard', icon: LayoutDashboard },
		{ label: 'My Products', href: '/supplier/products', icon: Boxes },
		{ label: 'Orders', href: '/supplier/orders', icon: ClipboardList },
		{ label: 'Analytics', href: '/supplier/analytics', icon: ChartColumn },
		{ label: 'Profile', href: '/supplier/profile', icon: UserRound },
		{ label: 'Settings', href: '/supplier/settings', icon: Settings }
	];

	function isActive(href: string): boolean {
		return page.url.pathname === href;
	}

	function closeSheet() {
		sheetOpen = false;
	}
</script>

<div class="mx-auto flex w-full max-w-7xl flex-1 gap-4 px-4 pb-24 pt-3 sm:px-6 sm:pb-10">
	<!-- Desktop sidebar -->
	<aside class="hidden w-60 shrink-0 lg:block">
		<div class="sticky top-20 space-y-0.5 rounded-xl bg-card p-1.5 ring-1 ring-foreground/10">
			<div class="mb-1 flex items-center gap-2.5 border-b border-border px-2.5 pb-2 pt-1">
				<div class="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary">{supplierInitials}</div>
				<div class="min-w-0">
					<p class="truncate text-[11px] font-semibold">{supplierName}</p>
					<p class="text-[10px] text-muted-foreground">Premium Supplier</p>
				</div>
			</div>
			{#each nav as item}
				<a
					href={item.href}
					class={`flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-[11px] font-medium transition-colors ${isActive(item.href) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent'}`}
				>
					<item.icon class="size-3.5"></item.icon>
					{item.label}
				</a>
			{/each}
			<div class="my-0.5 border-t border-border"></div>
			<Button variant="ghost" size="sm" class="w-full justify-start gap-2.5 text-[11px] text-destructive">
				<LogOut class="size-3.5"></LogOut>
				Sign Out
			</Button>
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
				<div class="flex items-center gap-2.5 border-b border-border px-4 py-3">
					<div class="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary">{supplierInitials}</div>
					<div class="min-w-0">
						<p class="truncate text-[11px] font-semibold">{supplierName}</p>
						<p class="text-[10px] text-muted-foreground">Premium Supplier</p>
					</div>
				</div>
					<nav class="space-y-0.5 px-3 py-3">
						{#each nav as item}
							<a
								href={item.href}
								onclick={closeSheet}
								class={`flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-[11px] font-medium transition-colors ${isActive(item.href) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent'}`}
							>
								<item.icon class="size-3.5"></item.icon>
								{item.label}
							</a>
						{/each}
					</nav>
				</SheetContent>
			</Sheet>
			<span class="text-sm font-bold">Supplier Portal</span>
		</div>

		{@render children()}
	</div>
</div>
