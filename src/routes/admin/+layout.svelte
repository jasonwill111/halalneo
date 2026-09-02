<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { getCurrentAccount, signOut } from '#lib/stores/auth.svelte.js';
	import { mode, toggleMode } from 'mode-watcher';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Avatar, AvatarFallback } from '#lib/components/ui/avatar/index.js';
	import { Sheet, SheetContent, SheetTrigger } from '#lib/components/ui/sheet/index.js';
	import Sun from '@lucide/svelte/icons/sun';
	import Moon from '@lucide/svelte/icons/moon';
	import LogOut from '@lucide/svelte/icons/log-out';
	import Home from '@lucide/svelte/icons/home';
	import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
	import Users from '@lucide/svelte/icons/users';
	import Store from '@lucide/svelte/icons/store';
	import Package from '@lucide/svelte/icons/package';
	import FolderTree from '@lucide/svelte/icons/folder-tree';
	import BadgeCheck from '@lucide/svelte/icons/badge-check';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import Languages from '@lucide/svelte/icons/languages';
	import Newspaper from '@lucide/svelte/icons/newspaper';
	import Bot from '@lucide/svelte/icons/bot';
	import Settings from '@lucide/svelte/icons/settings';
	import Mail from '@lucide/svelte/icons/mail';
	import Handshake from '@lucide/svelte/icons/handshake';
	import Globe from '@lucide/svelte/icons/globe';
	import CalendarDays from '@lucide/svelte/icons/calendar-days';
	import Menu from '@lucide/svelte/icons/menu';
	import { cn } from '#lib/utils.js';
	import { page } from '$app/state';

	let { children } = $props();
	let sheetOpen = $state(false);

	const navItems = [
		{ label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
		{ label: 'Users', href: '/admin/users', icon: Users },
		{ label: 'Suppliers', href: '/admin/suppliers', icon: Store },
		{ label: 'Products', href: '/admin/products', icon: Package },
		{ label: 'Categories', href: '/admin/categories', icon: FolderTree },
		{ label: 'Certifying Bodies', href: '/admin/certifying-bodies', icon: BadgeCheck },
		{ label: 'Service Providers', href: '/admin/service-providers', icon: Handshake },
		{ label: 'Market Guides', href: '/admin/market-guides', icon: Globe },
		{ label: 'Trade Shows', href: '/admin/trade-shows', icon: CalendarDays },
		{ label: 'Inquiries', href: '/admin/inquiries', icon: Mail },
		{ label: 'Pages', href: '/admin/pages', icon: BookOpen },
		{ label: 'Knowledge Base', href: '/admin/knowledge', icon: BookOpen },
		{ label: 'Glossary', href: '/admin/glossary', icon: Languages },
		{ label: 'Blog', href: '/admin/blog', icon: Newspaper },
		{ label: 'AI Tools', href: '/admin/ai-tools', icon: Bot },
		{ label: 'Settings', href: '/admin/settings', icon: Settings }
	];

	let currentAccount = $derived(getCurrentAccount());

	function isActive(pathname: string, href: string): boolean {
		if (href === '/admin') return pathname === '/admin' || pathname === '/admin/';
		return pathname === href;
	}

	function initials(name: string): string {
		return name
			.split(' ')
			.map((p) => p[0])
			.filter(Boolean)
			.slice(0, 2)
			.join('')
			.toUpperCase();
	}

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
		<div class="flex h-14 shrink-0 items-center gap-2 border-b border-border/50 px-4 sm:h-16">
			<span class="text-base font-bold tracking-tight text-primary">HalalNeo Admin</span>
		</div>

		<nav class="flex-1 space-y-0.5 overflow-y-auto px-3 py-3" aria-label="Admin pages">
			{#each navItems as item}
				<Button
					href={localizeHref(item.href)}
					variant={isActive(page.url.pathname, item.href) ? 'secondary' : 'ghost'}
					class={cn('w-full justify-start gap-2.5 text-sm')}
					aria-current={isActive(page.url.pathname, item.href) ? 'page' : undefined}
				>
					<item.icon class="size-4 shrink-0" />
					{item.label}
				</Button>
			{/each}
		</nav>

		<div class="shrink-0 border-t border-border/50 px-3 py-3">
			<div class="flex items-center gap-2.5 rounded-lg px-2 py-2">
				<Avatar class="size-8">
					<AvatarFallback class="bg-primary/15 text-xs font-semibold text-primary">
						{currentAccount ? initials(currentAccount.fullName) : 'AD'}
					</AvatarFallback>
				</Avatar>
				<div class="min-w-0 flex-1">
					<p class="truncate text-sm font-medium">
						{currentAccount ? currentAccount.fullName : 'Not signed in'}
					</p>
					{#if currentAccount}
						<p class="truncate text-xs text-muted-foreground">{currentAccount.email}</p>
					{/if}
				</div>
			</div>
			<div class="flex items-center gap-1 border-t border-border/50 pt-2">
				<Button
					variant="ghost"
					size="icon"
					aria-label="Toggle theme"
					onclick={() => toggleMode()}
					class="size-8"
				>
					{#if mode.current === 'dark'}
						<Sun class="size-4" />
					{:else}
						<Moon class="size-4" />
					{/if}
				</Button>
				<Button
					href={localizeHref('/')}
					variant="ghost"
					size="icon"
					aria-label="Back to homepage"
					class="size-8"
				>
					<Home class="size-4" />
				</Button>
				<Button
					variant="ghost"
					size="icon"
					aria-label="Sign out"
					class="size-8"
					onclick={() => {
						signOut();
						window.location.href = localizeHref('/');
					}}
				>
					<LogOut class="size-4" />
				</Button>
			</div>
		</div>
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
					<div class="flex h-14 shrink-0 items-center gap-2 border-b border-border/50 px-4">
						<span class="text-base font-bold tracking-tight text-primary">HalalNeo Admin</span>
					</div>
					<nav class="flex-1 space-y-0.5 overflow-y-auto px-3 py-3" aria-label="Admin pages">
						{#each navItems as item}
							<Button
								href={localizeHref(item.href)}
								variant={isActive(page.url.pathname, item.href) ? 'secondary' : 'ghost'}
								class={cn('w-full justify-start gap-2.5 text-sm')}
								aria-current={isActive(page.url.pathname, item.href) ? 'page' : undefined}
								onclick={closeSheet}
							>
								<item.icon class="size-4 shrink-0" />
								{item.label}
							</Button>
						{/each}
					</nav>
					<div class="shrink-0 border-t border-border/50 px-3 py-3">
						<div class="flex items-center gap-1">
							<Button variant="ghost" size="icon" aria-label="Toggle theme" onclick={() => toggleMode()} class="size-8">
								{#if mode.current === 'dark'}
									<Sun class="size-4" />
								{:else}
									<Moon class="size-4" />
								{/if}
							</Button>
							<Button href={localizeHref('/')} variant="ghost" size="icon" aria-label="Back to homepage" class="size-8">
								<Home class="size-4" />
							</Button>
							<Button variant="ghost" size="icon" aria-label="Sign out" class="size-8" onclick={() => { signOut(); window.location.href = localizeHref('/'); }}>
								<LogOut class="size-4" />
							</Button>
						</div>
					</div>
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
