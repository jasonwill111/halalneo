<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import { localizeHref, deLocalizeUrl } from '$lib/paraglide/runtime.js';
	import { cn } from '$lib/utils.js';
	import { mode, toggleMode } from 'mode-watcher';
	import { ModeWatcher } from 'mode-watcher';
	import { page } from '$app/state';
	import Sun from '@lucide/svelte/icons/sun';
	import Moon from '@lucide/svelte/icons/moon';
	import MenuIcon from '@lucide/svelte/icons/menu';
	import SearchIcon from '@lucide/svelte/icons/search';
	import { Button } from '$lib/components/ui/button';
	import { Sheet, SheetContent, SheetTrigger } from '$lib/components/ui/sheet';

	let { children } = $props();

	const isAdminRoute = $derived(deLocalizeUrl(page.url).pathname.startsWith('/admin'));

	const navItems = [
		{ label: 'Knowledge Base', href: '/knowledge-base' },
		{ label: 'Categories', href: '/categories' },
		{ label: 'Suppliers', href: '/suppliers' },
		{ label: 'Products', href: '/products' },
		{ label: 'AI Tools', href: '/tools' },
		{ label: 'Blog', href: '/blog' },
		{ label: 'About', href: '/about' }
	];

	function isActive(pathname: string, href: string): boolean {
		return pathname === href;
	}
</script>

<ModeWatcher />

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="flex min-h-dvh flex-col bg-background text-foreground">
	{#if isAdminRoute}
		{@render children()}
	{:else}
		<header class="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur">
			<div
				class="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6"
			>
				<a href={localizeHref('/')} class="flex shrink-0 items-center gap-2">
					<img src={favicon} alt="HalalNeo" class="size-7" />
					<span class="font-semibold tracking-tight text-primary">HalalNeo</span>
				</a>

				<nav class="hidden items-center gap-1 lg:flex" aria-label="Main">
					{#each navItems as item}
						<Button
							href={localizeHref(item.href)}
							variant={isActive(page.url.pathname, item.href) ? 'secondary' : 'ghost'}
							size="sm"
						>
							{item.label}
						</Button>
					{/each}
				</nav>

				<div class="flex items-center gap-1">
					<Button href={localizeHref('/search')} variant="ghost" size="icon" aria-label="Search">
						<SearchIcon class="size-4" />
					</Button>
					<button
						type="button"
						onclick={() => toggleMode()}
						class="inline-flex size-8 items-center justify-center rounded-lg border border-transparent text-sm font-medium transition-all outline-none select-none hover:bg-muted hover:text-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-expanded:bg-muted"
						aria-label="Toggle theme"
					>
						{#if mode.current === 'dark'}
							<Sun class="size-4" />
						{:else}
							<Moon class="size-4" />
						{/if}
					</button>
					<Button
						href={localizeHref('/login')}
						variant="default"
						size="sm"
						class="hidden sm:inline-flex"
					>
						Sign in
					</Button>
					<Sheet>
						<SheetTrigger>
							{#snippet child({ props })}
								<Button
									{...props}
									variant="ghost"
									size="icon"
									aria-label="Open menu"
									class="lg:hidden"
								>
									<MenuIcon class="size-4" />
								</Button>
							{/snippet}
						</SheetTrigger>
						<SheetContent side="right" class="w-72">
							<div class="flex flex-col gap-1 px-2 pt-6">
								<Button
									href={localizeHref('/')}
									variant={isActive(page.url.pathname, '/') ? 'secondary' : 'ghost'}
									class={cn('justify-start')}
								>
									Home
								</Button>
								{#each navItems as item}
									<Button
										href={localizeHref(item.href)}
										variant={isActive(page.url.pathname, item.href) ? 'secondary' : 'ghost'}
										class={cn('justify-start')}
									>
										{item.label}
									</Button>
								{/each}
								<Button href={localizeHref('/search')} variant="ghost" class="justify-start">
									<SearchIcon class="size-4"></SearchIcon>
									Search
								</Button>
								<div class="mt-4 border-t border-border pt-4">
									<Button href={localizeHref('/login')} variant="default" class="w-full">
										Sign in
									</Button>
									<Button href={localizeHref('/register')} variant="outline" class="mt-2 w-full">
										Create account
									</Button>
								</div>
							</div>
						</SheetContent>
					</Sheet>
				</div>
			</div>
		</header>

		<main class="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
			{@render children()}
		</main>

		<footer class="border-t border-border bg-muted/40">
			<div class="mx-auto w-full max-w-7xl px-4 pt-8 sm:px-6">
				<div class="grid grid-cols-2 gap-8 pb-8 sm:grid-cols-3 lg:grid-cols-4">
					<div class="col-span-2 space-y-3 sm:col-span-1">
						<div class="flex items-center gap-2">
							<img src={favicon} alt="HalalNeo" class="size-6" />
							<span class="text-base font-semibold text-primary">HalalNeo</span>
						</div>
						<p class="max-w-xs text-sm text-muted-foreground">
							Halal trade intelligence for buyers and suppliers — certification, sourcing and market
							guides in one place.
						</p>
					</div>
					<div class="space-y-3">
						<h4 class="text-sm font-semibold">Marketplace</h4>
						<ul class="space-y-1.5 text-sm text-muted-foreground">
							<li>
								<a class="transition hover:text-foreground" href={localizeHref('/categories')}
									>Categories</a
								>
							</li>
							<li>
								<a class="transition hover:text-foreground" href={localizeHref('/suppliers')}
									>Suppliers</a
								>
							</li>
							<li>
								<a class="transition hover:text-foreground" href={localizeHref('/products')}
									>Products</a
								>
							</li>
							<li>
								<a class="transition hover:text-foreground" href={localizeHref('/tools')}
									>AI Tools</a
								>
							</li>
						</ul>
					</div>
					<div class="space-y-3">
						<h4 class="text-sm font-semibold">Resources</h4>
						<ul class="space-y-1.5 text-sm text-muted-foreground">
							<li>
								<a class="transition hover:text-foreground" href={localizeHref('/knowledge-base')}
									>Knowledge Base</a
								>
							</li>
							<li>
								<a class="transition hover:text-foreground" href={localizeHref('/blog')}>Blog</a>
							</li>
							<li>
								<a class="transition hover:text-foreground" href={localizeHref('/glossary')}
									>Glossary</a
								>
							</li>
							<li>
								<a class="transition hover:text-foreground" href={localizeHref('/search')}>Search</a
								>
							</li>
							<li>
								<a class="transition hover:text-foreground" href={localizeHref('/faq')}>FAQ</a>
							</li>
						</ul>
					</div>
					<div class="col-span-2 space-y-3 sm:col-span-1">
						<h4 class="text-sm font-semibold">Company</h4>
						<ul class="space-y-1.5 text-sm text-muted-foreground">
							<li>
								<a class="transition hover:text-foreground" href={localizeHref('/about')}>About</a>
							</li>
							<li>
								<a class="transition hover:text-foreground" href={localizeHref('/contact')}
									>Contact</a
								>
							</li>
							<li>
								<a class="transition hover:text-foreground" href={localizeHref('/login')}>Sign in</a
								>
							</li>
							<li>
								<a class="transition hover:text-foreground" href={localizeHref('/register')}
									>Create account</a
								>
							</li>
						</ul>
					</div>
				</div>
				<div class="border-t border-border/60 py-5 text-xs text-muted-foreground">
					© {new Date().getFullYear()} HalalNeo. For demonstration only — verify all certificates with
					the listed certifying bodies.
				</div>
			</div>
		</footer>
	{/if}
</div>
