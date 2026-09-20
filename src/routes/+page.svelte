<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import Icon from '#lib/components/site/icon.svelte';
	import StatTile from '#lib/components/site/stat-tile.svelte';
	import { reveal } from '#lib/actions/reveal.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { TILE_COLORS } from '#lib/utils/tile-colors.js';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import Search from '@lucide/svelte/icons/search';
	import FlaskConical from '@lucide/svelte/icons/flask-conical';
	import Calculator from '@lucide/svelte/icons/calculator';
	import Banknote from '@lucide/svelte/icons/banknote';
	import FileText from '@lucide/svelte/icons/file-text';
	import Globe from '@lucide/svelte/icons/globe';
	import Calendar from '@lucide/svelte/icons/calendar';
	import Briefcase from '@lucide/svelte/icons/briefcase';
	import Newspaper from '@lucide/svelte/icons/newspaper';
	import Play from '@lucide/svelte/icons/play';
	import Pause from '@lucide/svelte/icons/pause';
	import SectionHead from '#lib/components/site/section-head.svelte';
	import { onMount } from 'svelte';
	import SeoMeta from '#lib/components/seo-meta.svelte';
	let { data } = $props();

	const categoryColors = TILE_COLORS;

	const slides = [
		{
			image: '/api/media/hero-1.webp',
			title: 'Halal trade\nintelligence.',
			subtitle:
				'Research certification bodies, verify suppliers, and navigate global halal markets — all in one place.'
		},
		{
			image: '/api/media/hero-2.webp',
			title: 'Certification\nguides.',
			subtitle:
				'Deep-dive into JAKIM, MUI, GSO, and 14+ certifying bodies. Standards, scope, and mutual recognition explained.'
		},
		{
			image: '/api/media/hero-3.webp',
			title: 'Market entry\nreports.',
			subtitle:
				'Country-by-country analysis of halal regulations, import requirements, and sourcing opportunities.'
		}
	];

	let currentSlide = $state(0);
	let paused = $state(false);
	let intervalId: ReturnType<typeof setInterval> | undefined;

	function nextSlide() {
		currentSlide = (currentSlide + 1) % slides.length;
	}

	function stopAutoplay() {
		if (intervalId) clearInterval(intervalId);
		intervalId = undefined;
	}

	function startAutoplay() {
		stopAutoplay();
		// §7.3 / prefers-reduced-motion: never autoplay for users who opt out,
		// and the pause control below is the required stop for everyone else.
		if (paused) return;
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
		intervalId = setInterval(nextSlide, 5000);
	}

	function goToSlide(i: number) {
		currentSlide = i;
		startAutoplay();
	}

	function togglePause() {
		paused = !paused;
		if (paused) stopAutoplay();
		else startAutoplay();
	}

	onMount(() => {
		startAutoplay();
		return stopAutoplay;
	});
</script>

<SeoMeta
	title="HalalNeo - Halal Trade Intelligence Platform for Global Halal Markets"
	description="Research certification bodies, verify suppliers, and navigate global halal markets. JAKIM, MUI, GSO guides, market entry reports, and supplier verification."
	ogTitle="HalalNeo - Halal Trade Intelligence"
	ogDescription="Comprehensive halal certification guides, supplier verification, and market entry intelligence."
	keywords="halal, halal certification, halal suppliers, JAKIM, MUI, GSO, halal trade, halal market, halal intelligence, halal verification"
	canonical="/"
/>

<svelte:head>
	<link rel="preload" as="image" href={slides[0].image} fetchpriority="high" />
	{@html `\u003cscript type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: 'HalalNeo',
		url: 'https://halalneo.com',
		description:
			'Halal trade intelligence platform — certification guides, market reports, and supplier verification for global halal trade.',
		potentialAction: {
			'@type': 'SearchAction',
			target: {
				'@type': 'EntryPoint',
				urlTemplate: 'https://halalneo.com/search?q={search_term_string}'
			},
			'query-input': 'required name=search_term_string'
		},
		// Speakable specification for voice assistants (GEO)
		speakable: {
			'@type': 'SpeakableSpecification',
			ssml: 'HalalNeo — your trusted halal trade intelligence platform. Research certifying bodies, verify suppliers, and navigate global halal markets.',
			cssSelector: ['h1', 'meta[name="description"]', '.hero-tagline']
		},
		// WebApplication signal for app-store style indexing
		applicationCategory: 'BusinessApplication',
		operatingSystem: 'Web',
		softwareVersion: '2026.1',
		provider: {
			'@type': 'Organization',
			name: 'HalalNeo',
			url: 'https://halalneo.com'
		}
	})}\u003c/script>`}
</svelte:head>

<!-- HERO -->
<section class="flex flex-col items-center py-2 text-center sm:py-4">
	<span
		class="animate-enter glass-sm relative mb-2 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-2xs font-medium text-secondary-foreground"
	>
		<ShieldCheck class="size-2.5 text-primary"></ShieldCheck>
		Halal B2B marketplace & trade intelligence
	</span>

	<!-- Hero Carousel -->
	<div
		class="animate-enter pattern-girih relative mb-2 w-full overflow-hidden rounded-xl shadow-lg sm:mb-3"
		style="--enter-delay: 60ms"
	>
		<div class="relative aspect-[16/10] sm:aspect-[16/5]">
			{#each slides as slide, i (i)}
				<div
					class="absolute inset-0 transition-opacity duration-deliberate {i === currentSlide
						? 'z-10 opacity-100'
						: 'z-0 opacity-0'}"
					inert={i !== currentSlide}
					aria-hidden={i !== currentSlide}
				>
					<img
						src={slide.image}
						alt={slide.title.replace(/\n/g, ' ')}
						class="absolute inset-0 h-full w-full object-cover"
						aria-hidden="true"
						loading={i === 0 ? 'eager' : 'lazy'}
						fetchpriority={i === 0 ? 'high' : undefined}
						decoding="async"
						width="1200"
						height="500"
					/>
					<div
						class="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/30"
					></div>
					<div class="absolute inset-0 flex items-center">
						<div class="max-w-xl px-4 pb-6 sm:px-10 sm:pb-0">
							{#if i === 0}
								<h1
									class="text-base leading-tight font-bold tracking-tight whitespace-pre-line sm:text-2xl sm:text-4xl lg:text-5xl"
								>
									{slide.title}
								</h1>
							{:else}
								<p
									class="text-base leading-tight font-bold tracking-tight whitespace-pre-line sm:text-2xl sm:text-4xl lg:text-5xl"
									aria-hidden="true"
								>
									{slide.title}
								</p>
							{/if}
							<p class="mt-1.5 max-w-md text-2xs-plus text-muted-foreground sm:mt-2 sm:text-sm">
								{slide.subtitle}
							</p>
							<div class="mt-2.5 flex flex-col gap-1.5 sm:mt-3 sm:flex-row sm:gap-2">
								<Button href={localizeHref('/knowledge-base')} size="sm" class="sm:size-lg"
									>Explore Knowledge Base</Button
								>
								<Button
									href={localizeHref('/categories')}
									variant="outline"
									size="sm"
									class="sm:size-lg">Browse Categories</Button
								>
							</div>
						</div>
					</div>
				</div>
			{/each}
			<!-- Carousel Dots -->
			<div class="absolute bottom-2 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 sm:bottom-3">
				{#each slides as _, i (i)}
					<Button
						variant="ghost"
						size="icon"
						onclick={() => goToSlide(i)}
						class="flex size-11 items-center justify-center bg-transparent! hover:bg-transparent!"
						aria-label="Go to slide {i + 1}"
						aria-current={i === currentSlide ? 'true' : undefined}
					>
						<span
							class="size-1.5 rounded-full transition-colors sm:size-2 {i === currentSlide
								? 'bg-primary'
								: 'bg-muted-foreground/70'}"
						></span>
					</Button>
				{/each}
			</div>
			<!-- Autoplay pause control (WCAG 2.2.2: moving content > 5s needs a pause) -->
			<button
				type="button"
				onclick={togglePause}
				aria-label={paused ? 'Resume carousel' : 'Pause carousel'}
				class="glass-sm absolute end-2 bottom-2 z-20 flex size-11 items-center justify-center rounded-md text-foreground/80 transition-colors hover:text-foreground sm:bottom-3"
			>
				{#if paused}
					<Play class="size-4" />
				{:else}
					<Pause class="size-4" />
				{/if}
			</button>
		</div>
	</div>
	<p
		class="animate-enter relative mb-2 text-2xs text-muted-foreground sm:mb-3 sm:text-2xs-plus"
		style="--enter-delay: 120ms"
	>
		Researched data from <span class="font-medium text-foreground"
			>{data.stats.kbSections} knowledge sections</span
		>
		· <span class="font-medium text-foreground">{data.stats.glossaryTerms} glossary terms</span>
	</p>
</section>
<!-- STATS -->
<section class="flex gap-1 sm:gap-2 lg:grid lg:grid-cols-4">
	<StatTile value={data.stats.kbSections} label="KB sections" tone="info" />
	<StatTile value={data.stats.glossaryTerms} label="Glossary" tone="warn" />
	<StatTile value={`${data.stats.certifierCount}+`} label="Certifiers" tone="success" />
	<StatTile value={data.stats.guideCount} label="Guides" tone="teal" />
</section>

<!-- TOOLS -->
<section {@attach reveal}>
	<SectionHead
		number="01"
		title="Halal trade tools"
		description="Free tools to help you navigate halal certification and compliance."
		href="/tools"
		linkLabel="View all"
	/>
	<div
		class="-mx-4 flex scrollbar-none gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-3 sm:px-0 lg:grid-cols-3"
	>
		{#each [{ href: '/tools/ingredient-checker', icon: FlaskConical, tone: 'text-info', name: 'Ingredient Checker', desc: 'Analyze ingredients for halal compliance.' }, { href: '/tools/certification-cost', icon: Calculator, tone: 'text-warn', name: 'Certification Cost', desc: 'Estimate costs across 7 certifiers.' }, { href: '/tools/landed-cost', icon: Banknote, tone: 'text-success', name: 'Landed Cost', desc: 'True per-unit cost, duty to door.' }, { href: '/tools/rfq-builder', icon: FileText, tone: 'text-teal', name: 'RFQ Builder', desc: 'RFQs suppliers actually answer.' }, { href: '/export-docs', icon: FileText, tone: 'text-info', name: 'Export Docs', desc: 'Templates for suppliers & importers.' }, { href: '/verify', icon: Search, tone: 'text-success', name: 'Verify Certificate', desc: 'Check certificate authenticity.' }] as tool (tool.href)}
			<a
				href={localizeHref(tool.href)}
				class="group press-scale flex w-[200px] shrink-0 items-center gap-2.5 rounded-xl bg-card p-2.5 ring-1 ring-foreground/10 transition-[transform,box-shadow] duration-base ease-spring hover:-translate-y-0.5 hover:shadow-md sm:w-auto sm:rounded-xl sm:p-4"
			>
				<tool.icon class="size-4 shrink-0 {tool.tone} sm:size-6" />
				<div class="min-w-0">
					<h3 class="text-xs font-medium transition-colors group-hover:text-primary sm:text-sm">
						{tool.name}
					</h3>
					<p class="truncate text-2xs text-muted-foreground sm:text-xs">
						{tool.desc}
					</p>
				</div>
			</a>
		{/each}
	</div>
</section>

<!-- CATEGORIES -->
<section {@attach reveal}>
	<SectionHead number="02" title="Browse by category" href="/categories" linkLabel="View all" />
	<div class="grid grid-cols-2 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
		{#each data.categories.slice(0, 6) as category, i (category.slug)}
			<a
				href={localizeHref(`/category/${category.slug}`)}
				class="group press-scale flex items-center gap-3 rounded-xl bg-card p-3 ring-1 ring-foreground/10 transition-[transform,box-shadow] duration-base ease-spring hover:-translate-y-0.5 hover:shadow-md sm:rounded-xl sm:p-4"
			>
				<div
					class="flex size-10 shrink-0 items-center justify-center rounded-lg {categoryColors[
						i % categoryColors.length
					]}"
				>
					<Icon name={category.icon ?? ''} class="size-5"></Icon>
				</div>
				<div class="min-w-0">
					<h3 class="truncate text-sm font-medium transition-colors group-hover:text-primary">
						{category.name}
					</h3>
					<p class="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{category.description}</p>
				</div>
			</a>
		{/each}
	</div>
</section>

<!-- MARKETPLACE -->
<section
	{@attach reveal}
	class="rounded-xl bg-card p-3 ring-1 ring-foreground/10 sm:rounded-xl sm:p-5"
>
	<div class="text-center">
		<Badge variant="secondary" class="mb-2 sm:mb-3">Launching 2026</Badge>
		<h2 class="text-base font-semibold tracking-tight sm:text-2xl lg:text-3xl">
			Verified Supplier Marketplace
		</h2>
		<p class="mx-auto mt-1.5 max-w-xl text-xs text-muted-foreground sm:mt-2 sm:text-sm">
			Every supplier listing backed by real halal certification data — certifying body, standard,
			scope and expiry shown up front. No unverifiable claims.
		</p>
	</div>
	<div class="mt-4 grid grid-cols-3 gap-3 sm:mx-auto sm:mt-6 sm:max-w-lg">
		<div class="rounded-xl bg-muted/50 p-3 text-center">
			<p class="text-base font-bold text-info tabular-nums sm:text-lg">
				{data.stats.verifiedSuppliers}
			</p>
			<p class="text-2xs text-muted-foreground sm:text-xs">Verified suppliers</p>
		</div>
		<div class="rounded-xl bg-muted/50 p-3 text-center">
			<p class="text-base font-bold text-warn tabular-nums sm:text-lg">
				{data.stats.certifierCount}
			</p>
			<p class="text-2xs text-muted-foreground sm:text-xs">Certifying bodies</p>
		</div>
		<div class="rounded-xl bg-muted/50 p-3 text-center">
			<p class="text-base font-bold text-success tabular-nums sm:text-lg">
				{data.stats.guideCount}
			</p>
			<p class="text-2xs text-muted-foreground sm:text-xs">Market guides</p>
		</div>
	</div>
	<div class="mt-4 flex flex-col items-center justify-center gap-2 sm:mt-6 sm:flex-row sm:gap-3">
		<Button href={localizeHref('/register')} size="sm" class="sm:size-lg">Join the waitlist</Button>
		<Button href={localizeHref('/suppliers')} variant="outline" size="sm" class="sm:size-lg"
			>Browse suppliers</Button
		>
	</div>
</section>

<!-- KB PREVIEW -->
<section {@attach reveal}>
	<SectionHead
		number="03"
		title="Latest from the knowledge base"
		href="/knowledge-base"
		linkLabel="View all"
	/>
	<div
		class="-mx-4 flex scrollbar-none gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-3 sm:px-0 lg:grid-cols-3"
	>
		{#each data.kbArticles.slice(0, 6) as article (article.slug)}
			<a
				href={localizeHref(`/knowledge-base/${article.section}/${article.slug}`)}
				class="group press-scale w-[220px] shrink-0 rounded-xl bg-card p-2.5 ring-1 ring-foreground/10 transition-[transform,box-shadow] duration-base ease-spring hover:-translate-y-0.5 hover:shadow-md sm:w-auto sm:rounded-xl sm:p-3"
			>
				<Badge variant="secondary" class="mb-1 text-2xs">{article.section}</Badge>
				<h3
					class="line-clamp-2 text-xs leading-snug font-medium transition-colors group-hover:text-primary sm:text-sm"
				>
					{article.title}
				</h3>
				<p
					class="mt-0.5 line-clamp-1 text-2xs text-muted-foreground sm:mt-1 sm:line-clamp-2 sm:text-xs"
				>
					{article.summary}
				</p>
			</a>
		{/each}
	</div>
</section>

<!-- EXPLORE ECOSYSTEM -->
<section {@attach reveal}>
	<SectionHead
		number="04"
		title="Explore the halal trade ecosystem"
		description="Market guides, trade shows, consultants and insights."
	/>
	<div class="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
		{#each [{ href: '/market-guides', label: 'Market guides', desc: 'Country-by-country entry requirements', icon: Globe, tone: 'info' }, { href: '/trade-shows', label: 'Trade shows', desc: 'Global halal exhibitions & events', icon: Calendar, tone: 'warn' }, { href: '/service-providers', label: 'Service providers', desc: 'Certification consultants & labs', icon: Briefcase, tone: 'teal' }, { href: '/blog', label: 'Blog', desc: 'Industry insights & announcements', icon: Newspaper, tone: 'gold' }] as item (item.href)}
			<a
				href={localizeHref(item.href)}
				class="group press-scale flex items-center gap-2.5 rounded-xl bg-card p-3 ring-1 ring-foreground/10 transition-[transform,box-shadow] duration-base ease-spring hover:-translate-y-0.5 hover:shadow-md sm:rounded-xl sm:p-4"
			>
				<div
					class={`flex size-9 shrink-0 items-center justify-center rounded-lg ${item.tone === 'info' ? 'bg-info/10 text-info' : item.tone === 'warn' ? 'bg-warn/10 text-warn' : item.tone === 'teal' ? 'bg-teal/10 text-teal' : 'bg-gold/10 text-gold'}`}
				>
					<item.icon class="size-4" />
				</div>
				<div class="min-w-0">
					<h3
						class="truncate text-xs font-medium transition-colors group-hover:text-primary sm:text-sm"
					>
						{item.label}
					</h3>
					<p class="mt-0.5 line-clamp-2 text-2xs leading-snug text-muted-foreground sm:text-xs">
						{item.desc}
					</p>
				</div>
			</a>
		{/each}
	</div>
</section>

<!-- CTA -->
<section
	{@attach reveal}
	class="rounded-xl border border-primary/15 bg-primary/[0.04] p-3 text-center ring-1 ring-foreground/10 sm:rounded-xl sm:p-5"
>
	<h2 class="text-base font-semibold tracking-tight sm:text-2xl lg:text-3xl">
		Navigate halal trade with confidence
	</h2>
	<p class="mx-auto mt-1.5 max-w-xl text-xs text-muted-foreground sm:mt-2 sm:text-sm">
		Access comprehensive certification guides, market reports, and trade intelligence — built for
		B2B buyers and suppliers.
	</p>
	<div class="mt-4 flex flex-col items-center justify-center gap-2 sm:mt-6 sm:flex-row sm:gap-3">
		<Button href={localizeHref('/knowledge-base')} size="sm" class="sm:size-lg"
			>Start reading</Button
		>
		<Button
			href={localizeHref('/tools/ingredient-checker')}
			variant="outline"
			size="sm"
			class="sm:size-lg">Try the Ingredient Checker</Button
		>
	</div>
</section>

<!-- TRUST / METHODOLOGY -->
<section {@attach reveal} class="grid gap-3 sm:gap-4 lg:grid-cols-5 lg:gap-6">
	<div class="space-y-2 lg:col-span-2 lg:pt-1">
		<h2 class="text-sm font-semibold text-foreground">How we verify</h2>
		<p class="text-xs leading-relaxed text-muted-foreground sm:text-sm">
			All certification data on HalalNeo is sourced from publicly available registers of accredited
			halal certifying bodies. We cross-reference certificate numbers, issuing organisations and
			scope details against the original body's published records.
		</p>
	</div>
	<div class="grid grid-cols-2 gap-2 sm:gap-3 lg:col-span-3">
		<div class="rounded-xl bg-card p-3 ring-1 ring-foreground/10">
			<p class="text-xs font-medium">JAKIM · MUI · ESMA</p>
			<p class="mt-0.5 text-2xs text-muted-foreground">
				{data.stats.certifierCount} certifying body databases
			</p>
		</div>
		<div class="rounded-xl bg-card p-3 ring-1 ring-foreground/10">
			<p class="text-xs font-medium">Public certificate registers</p>
			<p class="mt-0.5 text-2xs text-muted-foreground">Cross-referenced against issuing bodies</p>
		</div>
		<div class="rounded-xl bg-card p-3 ring-1 ring-foreground/10">
			<p class="text-xs font-medium">Scope & expiry tracking</p>
			<p class="mt-0.5 text-2xs text-muted-foreground">
				Certificate validity shown on every profile
			</p>
		</div>
		<div class="rounded-xl bg-card p-3 ring-1 ring-foreground/10">
			<p class="text-xs font-medium">Open methodology</p>
			<p class="mt-0.5 text-2xs text-muted-foreground">How we source and verify data</p>
		</div>
	</div>
</section>
