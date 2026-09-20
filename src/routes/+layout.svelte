<script lang="ts">
	import './layout.css';
	import Mark from '#lib/components/site/mark.svelte';
	import { localizeHref, deLocalizeUrl, localizeUrl, locales } from '#lib/paraglide/runtime.js';
	import { cn } from '#lib/utils.js';
	import { mode, userPrefersMode } from 'mode-watcher';
	import { switchTheme } from '#lib/utils/theme-toggle.js';
	import { ModeWatcher } from 'mode-watcher';
	import { page } from '$app/state';
	import Sun from '@lucide/svelte/icons/sun';
	import Moon from '@lucide/svelte/icons/moon';
	import SearchIcon from '@lucide/svelte/icons/search';
	import UserIcon from '@lucide/svelte/icons/user';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Toaster } from '#lib/components/ui/sonner/index.js';
	import MobileTab from '#lib/components/mobile-tab.svelte';
	import BackToTop from '#lib/components/site/back-to-top.svelte';
	import NavProgress from '#lib/components/site/nav-progress.svelte';
	import { initWebVitals } from '#lib/vitals.js';
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
	import { afterNavigate } from '$app/navigation';
	import { trackPageView } from '#lib/utils/analytics.js';

	let { children } = $props();

	// GA4 SPA tracking: report every client-side route change (covers the
	// initial load too). No-op when analytics is unavailable.
	afterNavigate((navigation) => {
		const url = navigation.to?.url;
		if (url) trackPageView(url, document.title);
	});

	// §1.3 theme-color follows the *effective* mode: the static media-query
	// metas in app.html cover pre-JS; once hydrated, a manual light/dark pick
	// rewrites them (system mode restores the originals).
	const THEME_COLOR_LIGHT = 'oklch(0.968 0.013 88)'; // == light --background
	const THEME_COLOR_DARK = 'oklch(0.16 0.022 205)'; // == dark --background
	let themeMetaDefaults: {
		el: HTMLMetaElement;
		media: string | null;
		content: string;
	}[] = [];
	$effect(() => {
		const m = userPrefersMode.current;
		if (typeof document === 'undefined') return;
		if (themeMetaDefaults.length === 0) {
			themeMetaDefaults = Array.from(
				document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]')
			).map((el) => ({
				el,
				media: el.getAttribute('media'),
				content: el.getAttribute('content') ?? ''
			}));
		}
		for (const t of themeMetaDefaults) {
			if (m === 'system') {
				if (t.media) t.el.setAttribute('media', t.media);
				else t.el.removeAttribute('media');
				t.el.setAttribute('content', t.content);
			} else {
				t.el.removeAttribute('media');
				t.el.setAttribute('content', m === 'dark' ? THEME_COLOR_DARK : THEME_COLOR_LIGHT);
			}
		}
	});

	// Chromeless portals: these routes render their own fixed-height shell
	// (sidebar + internal scroll), so the site header / footer / mobile bottom
	// tab must not stack on top of them. Public supplier pages
	// (`/supplier/onboarding`, `/supplier/[slug]`) keep the normal site chrome.
	const PORTAL_PREFIXES = [
		'/admin',
		'/supplier/dashboard',
		'/supplier/products',
		'/supplier/orders',
		'/supplier/manage',
		'/supplier/profile',
		'/supplier/login'
	];
	const isPortalRoute = $derived.by(() => {
		const path = deLocalizeUrl(page.url.href).pathname;
		return PORTAL_PREFIXES.some((p) => path === p || path.startsWith(p + '/'));
	});

	const siteName = 'HalalNeo';
	const defaultDescription =
		'Halal trade intelligence for buyers and suppliers — certification, sourcing and market guides in one place.';
	const baseUrl = 'https://halalneo.com';

	const seo = $derived.by(() => {
		const path = deLocalizeUrl(page.url.href).pathname;
		const title =
			page.data?.seo?.title ??
			`${path === '/' ? 'Home' : path.split('/').pop()?.replace(/-/g, ' ')} — ${siteName}`;
		const description = page.data?.seo?.description ?? defaultDescription;
		const canonical = localizeUrl(`${baseUrl}${path}`).toString();
		const ogImage = page.data?.seo?.ogImage ?? `${baseUrl}/brand/og-default.png`;
		const robots =
			page.data?.seo?.robots ??
			'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
		const ogType = page.data?.seo?.ogType ?? 'website';
		return { title, description, canonical, ogImage, path, robots, ogType };
	});

	const supportedLocales = locales;
	const siteUrl = baseUrl;

	const organizationSchema = {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: siteName,
		url: siteUrl,
		logo: `${siteUrl}/brand/icon-512.png`,
		description: defaultDescription,
		contactPoint: {
			'@type': 'ContactPoint',
			contactType: 'customer service',
			email: 'support@halalneo.com'
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
	let headerHasContent = $state(false);

	// Real-user Core Web Vitals -> /api/vitals -> Analytics Engine (once per load).
	// $effect only runs in the browser, so no browser guard is needed.
	$effect(() => {
		initWebVitals();
	});

	function onScroll() {
		const scrollY = window.scrollY;
		headerHasContent = scrollY > 4;
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
<Toaster offset={76} />
<NavProgress />

<svelte:head>
	<title>{seo.title}</title>
	<meta name="description" content={seo.description} />
	<link rel="canonical" href={seo.canonical} />
	<meta property="og:type" content={seo.ogType || 'website'} />
	<meta property="og:site_name" content={siteName} />
	<meta property="og:title" content={seo.title} />
	<meta property="og:description" content={seo.description} />
	<meta property="og:url" content={seo.canonical} />
	<meta property="og:image" content={seo.ogImage} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content={seo.title} />
	<meta property="og:locale" content="en" />
	{#each supportedLocales as locale (locale)}
		<link
			rel="alternate"
			hreflang={locale}
			href={localizeUrl(`${baseUrl}${seo.path}`, { locale }).toString()}
		/>
	{/each}
	<link
		rel="alternate"
		hreflang="x-default"
		href={localizeUrl(`${baseUrl}${seo.path}`, { locale: 'en' }).toString()}
	/>
	<link
		rel="alternate"
		type="application/rss+xml"
		title="HalalNeo — Halal Trade Blog"
		href={`${baseUrl}/rss.xml`}
	/>
	<meta name="robots" content={seo.robots} />
	<meta name="format-detection" content="telephone=no" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:site" content="@halalneo" />
	<meta name="twitter:title" content={seo.title} />
	<meta name="twitter:description" content={seo.description} />
	<meta name="twitter:image" content={seo.ogImage} />
	{@html `\u003cscript type="application/ld+json">${JSON.stringify(organizationSchema)}\u003c/script>`}
	{#if breadcrumbSchema}
		{@html `\u003cscript type="application/ld+json">${JSON.stringify(breadcrumbSchema)}\u003c/script>`}
	{/if}
</svelte:head>

<svelte:window onscroll={onScroll} />

<div class="flex min-h-dvh flex-col bg-background text-foreground">
	{#if !isPortalRoute}
		<a
			href="#main-content"
			class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-60 focus:rounded-md focus:bg-primary focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
			>Skip to content</a
		>
	{/if}
	{#if isPortalRoute}
		{@render children()}
	{:else}
		<header
			class="header-scroll-edge sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl transition-transform duration-slow supports-[backdrop-filter]:bg-background/90 max-md:transition-transform max-md:duration-slow {headerHidden
				? 'max-md:-translate-y-full'
				: 'max-md:translate-y-0'} {headerHasContent ? 'has-content' : ''}"
		>
			<div
				class="mx-auto flex min-h-12 w-full max-w-7xl flex-wrap items-center justify-between gap-x-2 gap-y-1 px-4 sm:min-h-14 sm:gap-x-4 sm:px-6"
			>
				<a
					href={localizeHref('/')}
					class="flex shrink-0 items-center gap-2 transition-opacity hover:opacity-80"
				>
					<Mark variant="outline" class="size-7 shrink-0 text-primary" />
					<span class="text-lg font-bold tracking-tight text-primary">HalalNeo</span>
				</a>

				<NavigationMenuRoot
					viewport={false}
					class="hidden md:flex md:max-w-none md:min-w-0 md:justify-start"
				>
					<NavigationMenuList class="flex-wrap">
						{#each primaryNav as item (item.href)}
							<NavigationMenuItem>
								<NavigationMenuLink
									href={localizeHref(item.href)}
									class={cn(
										navigationMenuTriggerStyle(),
										'md:px-2.5 md:text-xs lg:px-4 lg:text-sm',
										isActive(deLocalizeUrl(page.url.href).pathname, item.href) && 'bg-muted'
									)}
								>
									{item.label}
								</NavigationMenuLink>
							</NavigationMenuItem>
						{/each}
						{#each navGroups as group (group.label)}
							<NavigationMenuItem>
								<NavigationMenuTrigger
									class={cn(
										'md:px-2.5 md:text-xs lg:px-4 lg:text-sm',
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
					<Button href={localizeHref('/search')} variant="ghost" size="icon" aria-label="Search">
						<SearchIcon class="size-4" />
					</Button>
					<Button
						variant="ghost"
						size="icon"
						aria-label="Toggle theme"
						onclick={() => switchTheme()}
					>
						{#if mode.current === 'dark'}
							<Sun class="size-4" />
						{:else}
							<Moon class="size-4" />
						{/if}
					</Button>
					<Button href={localizeHref('/account')} variant="ghost" size="icon" aria-label="Account">
						<UserIcon class="size-4" />
					</Button>
					<Button
						href={localizeHref('/login')}
						variant="default"
						size="sm"
						class="hidden lg:inline-flex"
					>
						Sign in
					</Button>
				</div>
			</div>
		</header>

		<main
			id="main-content"
			class="mx-auto w-full max-w-7xl flex-1 scroll-mt-16 space-y-4 px-4 pt-3 pb-12 sm:space-y-6 sm:px-6 sm:pt-4 sm:pb-8"
		>
			{@render children()}
		</main>

		<footer class="pattern-girih border-t border-border/50 bg-muted/30">
			<div class="mx-auto max-w-7xl px-4 pt-2 pb-24 sm:px-6 sm:pt-4 md:pb-3">
				<div class="hidden gap-3 sm:grid sm:grid-cols-3 sm:gap-4 lg:grid-cols-7">
					<!-- Brand -->
					<div class="col-span-2 space-y-2 sm:col-span-1 lg:col-span-1">
						<a href={localizeHref('/')} class="flex items-center gap-2">
							<Mark variant="outline" class="size-5 shrink-0 text-primary" />
							<span class="text-sm font-bold text-primary">{siteName}</span>
						</a>
						<p class="max-w-xs text-xs leading-relaxed text-muted-foreground">
							Halal trade intelligence for buyers and suppliers — certification, sourcing and market
							guides in one place.
						</p>
					</div>
					<!-- Marketplace -->
					<nav class="space-y-1" aria-label="Marketplace">
						<p class="text-xs font-semibold tracking-wide text-foreground">Marketplace</p>
						<ul class="space-y-0.5">
							{#each primaryNav as item (item.href)}
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
								<a
									href={localizeHref('/search')}
									class="text-xs text-muted-foreground transition-colors hover:text-foreground"
									>Search</a
								>
							</li>
						</ul>
					</nav>
					<!-- Link columns -->
					{#each navGroups as group (group.label)}
						<nav class="space-y-1" aria-label={group.label}>
							<p class="text-xs font-semibold tracking-wide text-foreground">{group.label}</p>
							<ul class="space-y-0.5">
								{#each group.items as item (item.href)}
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
				<div
					class="mt-2 flex items-center justify-center border-t border-border/50 pt-2 sm:mt-3 sm:justify-between sm:pt-2"
				>
					<p class="text-2xs text-muted-foreground sm:text-xs">
						© {new Date().getFullYear()} HalalNeo. All rights reserved.
					</p>
				</div>
			</div>
		</footer>

		<MobileTab />
	{/if}
	<BackToTop />
</div>
