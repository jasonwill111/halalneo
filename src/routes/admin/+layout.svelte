<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { Sheet, SheetContent, SheetTrigger } from '#lib/components/ui/sheet/index.js';
	import Menu from '@lucide/svelte/icons/menu';
	import AdminSidebar from '#lib/components/site/admin-sidebar.svelte';

	let { children, data } = $props();
	let sheetOpen = $state(false);

	function closeSheet() {
		sheetOpen = false;
	}
</script>

<svelte:head>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="flex h-dvh overflow-hidden bg-background text-foreground">
	<!-- Desktop sidebar -->
	<aside
		class="hidden lg:flex h-dvh w-60 shrink-0 flex-col border-r border-border/50 bg-card/60 backdrop-blur-xl"
		aria-label="Admin navigation"
	>
		<AdminSidebar variant="desktop" user={data.adminUser} />
	</aside>

	<!-- Mobile header with hamburger -->
	<div class="flex flex-1 flex-col overflow-hidden">
		<header class="flex h-14 items-center gap-3 border-b border-border/50 px-4 lg:hidden">
			<Sheet bind:open={sheetOpen}>
				<SheetTrigger>
					<Button variant="ghost" size="icon" aria-label="Open menu" class="size-9">
						<Menu class="size-5" />
					</Button>
				</SheetTrigger>
				<SheetContent side="left" class="w-60 p-0">
					<AdminSidebar variant="mobile" user={data.adminUser} onNavigate={closeSheet} />
				</SheetContent>
			</Sheet>
			<span class="text-sm font-bold tracking-tight text-primary">HalalNeo Admin</span>
		</header>

		<main class="h-dvh min-w-0 flex-1 overflow-y-auto">
			<div class="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
				{@render children()}
			</div>
		</main>
	</div>
</div>
