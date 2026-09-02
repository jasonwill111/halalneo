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
	import UserIcon from '@lucide/svelte/icons/user';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Sheet, SheetContent, SheetTrigger } from '#lib/components/ui/sheet/index.js';
	import MobileTab from '#lib/components/mobile-tab.svelte';
	import {
		NavigationMenuRoot,
		NavigationMenuItem,
		NavigationMenuLink,
		NavigationMenuList,
		NavigationMenuTrigger,
		NavigationMenuContent,
		navigationMenuTriggerStyle
	} from '#lib/components/ui/navigation-menu/index.js';
	import { primaryNav, navGroups } from '#lib/data/navigation.js';

	let { children } = $props();

	const isAdminRoute = $derived(deLocalizeUrl(page.url.href).pathname.startsWith('/admin'));

	const siteName = 'HalalNeo';
	const defaultDescription =
		'Halal trade intelligence for buyers and suppliers —certification, sourcing and market guides in one place.';
	const baseUrl = 'https://halalneo.com';

	const seo = $derived.by(() => {
		const path = deLocalizeUrl(page.url.href).pathname;
		const title =
			page.data?.seo?.title ??
			`${path === '/' ? 'Home' : path.split('/').pop()?.replace(/-/g, ' ')} — ${siteName}`;
		const description = page.data?.seo?.description ?? defaultDescription;
		const canonical = localizeUrl(`${baseUrl}${path}`).toString();
		const ogImage = page.data?.seo?.ogImage ?? `${baseUrl}/og-default.svg`;
		const robots = page.data?.seo?.robots ?? 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
		return { title, description, canonical, ogImage, path, robots };
	});

	const supportedLocales = ['en'] as const;
	const siteUrl = baseUrl;

	const organizationSchema = {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: siteName,
		url: siteUrl,
		logo: `${siteUrl}/favicon.svg`,
		description: defaultDescription,
		sameAs: [
			'https://twitter.com/halalneo',
			'https://www.linkedin.com/company/halalneo',
			'https://www.facebook.com/halalneo'
		],
		contactPoint: {
			'@type': 'ContactPoint',
			contactType: 'customer service',
			email: 'hello@halalneo.com'
		},
		address: {
			'@type': 'PostalAddress',
			addressCountry: 'US'
		}
	};

	const breadcrumbSchema = $derived.by(() => {
		const segments = seo.path.split('/').filter(Boolean);
		if (segments.length === 0) return null;
		const items = [{ name: 'Home', position: 1, item: baseUrl }];
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

	function isActive(pathname: string, href: string): boolean {
		if (href === '/') return pathname === '/';
		return pathname === href || pathname.startsWith(href + '/');
	}

	function isGroupActive(pathname: string, items: { href: string }[]): boolean {
		return items.some((i) => isActive(pathname, i.href));
	}

	let lastScrollY = 0;
	let headerHidden = $state(false);

	function onScroll() {
		const scrollY = window.scrollY;
		if (scrollY < 10) {
			headerHidden = false;
		} else if (scrollY > lastScrollY + 5) {
			headerHidden = true;
		} else if (scrollY < lastScrollY - 5) {
			headerHidden = false;
		}
		lastScrollY = scrollY;
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
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content={seo.title} />
	<meta property="og:locale" content="en" />
	{#each supportedLocales as locale}
		<link rel="alternate" hreflang={locale} href={localizeUrl(`${baseUrl}${seo.path}`, { locale }).toString()} />
	{/each}
	<link rel="alternate" hreflang="x-default" href={localizeUrl(`${baseUrl}${seo.path}`, { locale: 'en' }).toString()} />
	<meta name="geo.region" content="US" />
	<meta name="geo.placename" content="United States" />
	<meta name="geo.position" content="38.8951;-77.0364" />
	<meta name="ICBM" content="38.8951, -77.0364" />
	<meta name="robots" content={seo.robots} />
	<meta name="format-detection" content="telephone=no" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content="@halalneo" />
	<meta name="twitter:title" content={seo.title} />
	<meta name="twitter:description" content={seo.description} />
	<meta name="twitter:image" content={seo.ogImage} />
	{@html `<script type="application/ld+json">${JSON.stringify(organizationSchema)}</script>`}
	{#if breadcrumbSchema}
		{@html `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`}
	{/if}
</svelte:head>

<svelte:window onscroll={onScroll} />

<div class="flex min-h-dvh flex-col bg-background text-foreground">
	{#if isAdminRoute}
		{@render children()}
	{:else}
		<header
			class="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl transition-transform duration-300 supports-[backdrop-filter]:bg-background/60 max-md:transition-transform max-md:duration-300 {headerHidden
				? 'max-md:-translate-y-full'
				: 'max-md:translate-y-0'}"
		>
			<div
				class="mx-auto flex h-12 w-full max-w-7xl items-center justify-between gap-2 px-4 sm:h-14 sm:gap-4 sm:px-6"
			>
				<a
					href={localizeHref('/')}
					class="flex shrink-0 items-center gap-2 transition-opacity hover:opacity-80"
				>
					<img src={favicon} alt="HalalNeo" class="size-7" width="28" height="28" loading="eager" decoding="async" />
					<span class="text-lg font-bold tracking-tight text-primary">HalalNeo</span>
				</a>

			<NavigationMenuRoot viewport={false} class="hidden lg:flex lg:justify-start">
				<NavigationMenuList>
					{#each primaryNav as item (item.href)}
						<NavigationMenuItem>
							<NavigationMenuLink
								href={localizeHref(item.href)}
								class={cn(
									navigationMenuTriggerStyle(),
									isActive(deLocalizeUrl(page.url.href).pathname, item.href) && 'bg-muted'
								)}
							>
								{item.label}
							</NavigationMenuLink>
						</NavigationMenuItem>
					{/each}
					{#each navGroups as group}
						<NavigationMenuItem>
							<NavigationMenuTrigger
								class={cn(
									isGroupActive(deLocalizeUrl(page.url.href).pathname, group.items) && 'bg-muted'
								)}
							>
								{group.label}
							</NavigationMenuTrigger>
							<NavigationMenuContent>
								<div class="grid w-[280px] gap-1 p-2">
									{#each group.items as item (item.href)}
										<NavigationMenuLink
											href={localizeHref(item.href)}
											class={cn(
												'flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted',
												isActive(deLocalizeUrl(page.url.href).pathname, item.href) && 'bg-muted'
											)}
										>
											<item.icon class="size-4 shrink-0 text-muted-foreground" />
											{item.label}
										</NavigationMenuLink>
									{/each}
								</div>
							</NavigationMenuContent>
						</NavigationMenuItem>
					{/each}
				</NavigationMenuList>
		</NavigationMenuRoot>

				<div class="flex items-center gap-1">
				<Button
					href={localizeHref('/search')}
					variant="ghost"
					size="icon"
					aria-label="Search"
				>
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
						href={localizeHref('/account')}
						variant="ghost"
						size="icon"
						aria-label="Account"
						class="md:hidden"
					>
						<UserIcon class="size-4" />
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
									class="hidden md:inline-flex lg:hidden"
								>
									<MenuIcon class="size-4" />
								</Button>
							{/snippet}
						</SheetTrigger>
						<SheetContent side="right" class="w-72 overflow-y-auto">
							<div class="flex flex-col gap-4 px-2 pt-6">
								<!-- Primary -->
								<div class="flex flex-col gap-1">
									<p class="px-3 pb-1 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">Browse</p>
									<Button
										href={localizeHref('/')}
										variant={isActive(deLocalizeUrl(page.url.href).pathname, '/') ? 'secondary' : 'ghost'}
										class="justify-start"
									>
										Home
									</Button>
									{#each primaryNav as item}
										<Button
											href={localizeHref(item.href)}
											variant={isActive(deLocalizeUrl(page.url.href).pathname, item.href) ? 'secondary' : 'ghost'}
											class="justify-start"
										>
											{item.label}
										</Button>
									{/each}
								</div>
								<!-- Groups -->
								{#each navGroups as group}
									<div class="flex flex-col gap-1">
										<p class="px-3 pb-1 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">{group.label}</p>
										{#each group.items as item}
											<Button
												href={localizeHref(item.href)}
												variant={isActive(deLocalizeUrl(page.url.href).pathname, item.href) ? 'secondary' : 'ghost'}
												class="justify-start"
											>
												<item.icon class="size-4 text-muted-foreground" />
												{item.label}
											</Button>
										{/each}
									</div>
								{/each}
								<div class="mt-2 border-t border-border pt-4">
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

		<main class="mx-auto w-full max-w-7xl flex-1 px-4 pt-3 pb-12 sm:px-6 sm:pt-4 sm:pb-8">
			{@render children()}
		</main>

		<footer class="border-t border-border/50 bg-muted/30">
			<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
				<div class="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
					<!-- Brand -->
					<div class="col-span-2 space-y-2 sm:col-span-1 lg:col-span-1">
						<a href={localizeHref('/')} class="flex items-center gap-2">
							<img src={favicon} alt="HalalNeo" class="size-5" width="20" height="20" loading="lazy" decoding="async" />
							<span class="text-sm font-bold text-primary">{siteName}</span>
						</a>
						<p class="max-w-xs text-xs leading-relaxed text-muted-foreground">
							Halal trade intelligence for buyers and suppliers — certification, sourcing and market
							guides in one place.
						</p>
					</div>
					<!-- Marketplace -->
					<nav class="space-y-2" aria-label="Marketplace">
						<p class="text-xs font-semibold tracking-wide text-foreground">Marketplace</p>
						<ul class="space-y-1.5">
							{#each primaryNav as item}
								<li>
									<a
										href={localizeHref(item.href)}
										class="text-xs text-muted-foreground transition-colors hover:text-foreground"
									>
										{item.label}
									</a>
								</li>
							{/each}
							<li>
								<a href={localizeHref('/search')} class="text-xs text-muted-foreground transition-colors hover:text-foreground">Search</a>
							</li>
						</ul>
					</nav>
					<!-- Link columns -->
					{#each navGroups as group}
						<nav class="space-y-2" aria-label={group.label}>
							<p class="text-xs font-semibold tracking-wide text-foreground">{group.label}</p>
							<ul class="space-y-1.5">
								{#each group.items as item}
									<li>
										<a
											href={localizeHref(item.href)}
											class="text-xs text-muted-foreground transition-colors hover:text-foreground"
										>
											{item.label}
										</a>
									</li>
								{/each}
							</ul>
						</nav>
					{/each}
				</div>
				<div class="mt-8 flex flex-col items-center justify-between gap-2 border-t border-border/50 pt-4 sm:flex-row">
					<p class="text-[10px] text-muted-foreground sm:text-xs">
						© {new Date().getFullYear()}
						{siteName}
					</p>
					<nav class="flex items-center gap-3" aria-label="Footer utility">
						<a href={localizeHref('/about')} class="text-[10px] text-muted-foreground hover:text-foreground sm:text-xs">About</a>
						<a href={localizeHref('/contact')} class="text-[10px] text-muted-foreground hover:text-foreground sm:text-xs">Contact</a>
						<a href={localizeHref('/faq')} class="text-[10px] text-muted-foreground hover:text-foreground sm:text-xs">FAQ</a>
						<a href={localizeHref('/privacy')} class="text-[10px] text-muted-foreground hover:text-foreground sm:text-xs">Privacy Policy</a>
						<a href={localizeHref('/terms')} class="text-[10px] text-muted-foreground hover:text-foreground sm:text-xs">Terms of Service</a>
					</nav>
				</div>
			</div>
		</footer>

		<MobileTab />
	{/if}
</div>
