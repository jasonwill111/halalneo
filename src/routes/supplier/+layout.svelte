<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Sheet, SheetContent, SheetTrigger } from '#lib/components/ui/sheet/index.js';
	import Menu from '@lucide/svelte/icons/menu';
	import LogIn from '@lucide/svelte/icons/log-in';
	import SupplierSidebar from '#lib/components/site/supplier-sidebar.svelte';

	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();
	let sheetOpen = $state(false);

	function closeSheet() {
		sheetOpen = false;
	}
</script>

<svelte:head>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="flex h-dvh overflow-hidden bg-background text-foreground">
	<!-- Desktop sidebar (fixed height, own scroll, §4.2) -->
	<aside
		class="hidden lg:flex h-dvh w-60 shrink-0 flex-col border-r border-border/50 bg-card/60 backdrop-blur-xl"
		aria-label="Supplier navigation"
	>
		<SupplierSidebar
			variant="desktop"
			user={data.supplierUser}
			profile={data.supplierProfile}
		/>
	</aside>

	<!-- Mobile header with hamburger -->
	<div class="flex flex-1 flex-col overflow-hidden">
		<header class="flex h-14 shrink-0 items-center gap-3 border-b border-border/50 px-4 lg:hidden">
			<Sheet bind:open={sheetOpen}>
				<SheetTrigger>
					<Button variant="ghost" size="icon" aria-label="Open menu" class="size-9">
						<Menu class="size-5" />
					</Button>
				</SheetTrigger>
				<SheetContent side="left" class="w-60 p-0">
					<SupplierSidebar
						variant="mobile"
						user={data.supplierUser}
						profile={data.supplierProfile}
						onNavigate={closeSheet}
					/>
				</SheetContent>
			</Sheet>
			<span class="truncate text-sm font-bold tracking-tight text-primary">Supplier Portal</span>
		</header>

		<main class="min-h-0 flex-1 overflow-y-auto">
			{#if !data.supplierUser}
				<!-- Session gate: the portal shell is meaningless without a signed-in
				     user, and /supplier/* is not guarded in hooks.server.ts. -->
				<div class="mx-auto flex min-h-[60dvh] w-full max-w-md flex-col items-center justify-center gap-3 px-4 py-10 text-center">
					<div
						class="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary"
					>
						<LogIn class="size-6" />
					</div>
					<h1 class="text-lg font-semibold tracking-tight">Supplier sign-in required</h1>
					<p class="text-sm text-muted-foreground">
						Sign in with the account your supplier profile is linked to to manage your
						listings and inquiries.
					</p>
					<div class="mt-1 flex flex-wrap items-center justify-center gap-2">
						<Button href={localizeHref('/supplier/login')} size="sm">Sign in</Button>
						<Button href={localizeHref('/')} variant="outline" size="sm">Back to site</Button>
					</div>
					<p class="text-xs text-muted-foreground">
						Not a supplier yet?
						<a href={localizeHref('/supplier/onboarding')} class="text-primary hover:underline"
							>Apply to become a supplier</a
						>
					</p>
				</div>
			{:else}
				<div class="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
					{@render children()}
				</div>
			{/if}
		</main>
	</div>
</div>
