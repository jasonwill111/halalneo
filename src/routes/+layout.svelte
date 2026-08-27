<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import { localizeHref, deLocalizeUrl, localizeUrl } from '#lib/paraglide/runtime.js';
	import { cn } from '#lib/utils.js';
	import { mode, toggleMode } from 'mode-watcher';
	import { ModeWatcher } from 'mode-watcher';
	import { page } from '$app/state';
	import Sun from '@lucide/svelte/icons/sun';
	import Moon from '@lucide/svelte/icons/moon';
	import MenuIcon from '@lucide/svelte/icons/menu';
	import SearchIcon from '@lucide/svelte/icons/search';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Sheet, SheetContent, SheetTrigger } from '#lib/components/ui/sheet/index.js';
	import MobileTab from '#lib/components/mobile-tab.svelte';

	let { children } = $props();

	const isAdminRoute = $derived(deLocalizeUrl(page.url.href).pathname.startsWith('/admin'));

	const siteName = 'HalalNeo';
	const defaultDescription = 'Halal trade intelligence for buyers and suppliers — certification, sourcing and market guides in one place.';
	const baseUrl = 'https://halalneo.com';

	const seo = $derived.by(() => {
		const path = deLocalizeUrl(page.url.href).pathname;
		const title = page.data?.seo?.title ?? `${path === '/' ? 'Home' : path.split('/').pop()?.replace(/-/g, ' ')} — ${siteName}`;
		const description = page.data?.seo?.description ?? defaultDescription;
		const canonical = localizeUrl(`${baseUrl}${path}`).toString();
		const ogImage = page.data?.seo?.ogImage ?? `${baseUrl}/og-default.png`;
		return { title, description, canonical, ogImage, path };
	});

	const organizationSchema = {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: siteName,
		url: baseUrl,
		logo: `${baseUrl}/favicon.svg`,
		description: defaultDescription,
		sameAs: []
	};

	const breadcrumbSchema = $derived.by(() => {
		const segments = seo.path.split('/').filter(Boolean);
		if (segments.length === 0) return null;
		const items = [
			{ name: 'Home', position: 1, item: baseUrl }
		];
		segments.forEach((seg, i) => {
			items.push({
				name: seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
				position: i + 2,
				item: `${baseUrl}/${segments.slice(0, i + 1).join('/')}`
			});
		});
		return {
			'@context': 'https://schema.org',
			'@type': 'BreadcrumbList',
			itemListElement: items.map((item) => ({
				'@type': 'ListItem',
				...item
			}))
		};
	});

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

<svelte:head>
	<link rel="icon" href={favicon} />
	<title>{seo.title}</title>
	<meta name="description" content={seo.description} />
	<link rel="canonical" href={seo.canonical} />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content={siteName} />
	<meta property="og:title" content={seo.title} />
	<meta property="og:description" content={seo.description} />
	<meta property="og:url" content={seo.canonical} />
	<meta property="og:image" content={seo.ogImage} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={seo.title} />
	<meta name="twitter:description" content={seo.description} />
	<meta name="twitter:image" content={seo.ogImage} />
	{@html `<script type="application/ld+json">${JSON.stringify(organizationSchema)}</script>`}
	{#if breadcrumbSchema}
		{@html `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`}
	{/if}
</svelte:head>

<div class="flex min-h-dvh flex-col bg-background text-foreground">
	{#if isAdminRoute}
		{@render children()}
	{:else}
		<header class="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
			<div
				class="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-4 px-4 sm:h-16 sm:px-6"
			>
				<a href={localizeHref('/')} class="flex shrink-0 items-center gap-2 transition-opacity hover:opacity-80">
					<img src={favicon} alt="HalalNeo" class="size-7" />
					<span class="text-lg font-bold tracking-tight text-primary">HalalNeo</span>
				</a>

				<nav class="hidden items-center gap-1 lg:flex" aria-label="Main">
					{#each navItems as item}
						<Button
							href={localizeHref(item.href)}
							variant={isActive(page.url.pathname, item.href) ? 'secondary' : 'ghost'}
							size="sm"
							class="text-sm"
						>
							{item.label}
						</Button>
					{/each}
				</nav>

				<div class="flex items-center gap-1">
					<Button href={localizeHref('/search')} variant="ghost" size="icon" aria-label="Search" class="hidden sm:inline-flex">
						<SearchIcon class="size-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						aria-label="Toggle theme"
						onclick={() => toggleMode()}
					>
						{#if mode.current === 'dark'}
							<Sun class="size-4" />
						{:else}
							<Moon class="size-4" />
						{/if}
					</Button>
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
									class="justify-start"
								>
									Home
								</Button>
								{#each navItems as item}
									<Button
										href={localizeHref(item.href)}
										variant={isActive(page.url.pathname, item.href) ? 'secondary' : 'ghost'}
										class="justify-start"
									>
										{item.label}
									</Button>
								{/each}
								<Button href={localizeHref('/search')} variant="ghost" class="justify-start">
									<SearchIcon class="size-4" />
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

		<main class="mx-auto w-full max-w-7xl flex-1 px-4 pb-24 pt-6 sm:px-6 sm:pb-10 sm:pt-8">
			{@render children()}
		</main>

		<footer class="border-t border-border/50 bg-muted/30">
			<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6">
				<div class="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
					<div class="flex items-center gap-2">
						<img src={favicon} alt="HalalNeo" class="size-5" />
						<span class="text-sm font-semibold text-primary">{siteName}</span>
					</div>
					<p class="text-center text-xs text-muted-foreground sm:text-left">
						© {new Date().getFullYear()} {siteName}. Halal trade intelligence — verify all certificates with listed certifying bodies.
					</p>
				</div>
			</div>
		</footer>

		<MobileTab />
	{/if}
</div>
