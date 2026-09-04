<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import Icon from '#lib/components/site/icon.svelte';
	import { reveal } from '#lib/actions/reveal.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle,
		CardDescription
	} from '#lib/components/ui/card/index.js';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import Search from '@lucide/svelte/icons/search';
	import FlaskConical from '@lucide/svelte/icons/flask-conical';
	import Calculator from '@lucide/svelte/icons/calculator';
	import SectionHead from '#lib/components/site/section-head.svelte';
	import { onMount } from 'svelte';

	let { data } = $props();

	const categoryColors = [
		'bg-info/10 text-info',
		'bg-warn/10 text-warn',
		'bg-success/10 text-success',
		'bg-accent-purple/10 text-accent-purple',
		'bg-accent-rose/10 text-accent-rose',
		'bg-primary/10 text-primary'
	];

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
	let intervalId: ReturnType<typeof setInterval> | undefined;

	function nextSlide() {
		currentSlide = (currentSlide + 1) % slides.length;
	}

	function goToSlide(i: number) {
		currentSlide = i;
		if (intervalId) clearInterval(intervalId);
		intervalId = setInterval(nextSlide, 5000);
	}

	onMount(() => {
		intervalId = setInterval(nextSlide, 5000);
		return () => {
			if (intervalId) clearInterval(intervalId);
		};
	});
</script>

<svelte:head>
	<link rel="preload" as="image" href={slides[0].image} fetchpriority="high" />
	{@html `<script type="application/ld+json">${JSON.stringify({
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
		}
	})}</script>`}
</svelte:head>

<!-- HERO -->
<section class="flex flex-col items-center py-4 text-center sm:py-10">
	<span
		class="mb-2 inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground sm:mb-3"
	>
		<ShieldCheck class="size-2.5 text-primary"></ShieldCheck>
		Halal B2B marketplace & trade intelligence
	</span>

	<!-- Hero Carousel -->
	<div class="relative mb-3 w-full overflow-hidden rounded-xl sm:mb-4">
		<div class="relative aspect-[16/7] sm:aspect-[16/6]">
			{#each slides as slide, i}
				<div
					class="absolute inset-0 transition-opacity duration-500 {i === currentSlide
						? 'z-10 opacity-100'
						: 'z-0 opacity-0'}"
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
						<div class="max-w-xl px-4 sm:px-10">
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
							<p class="mt-1.5 max-w-md text-[11px] text-muted-foreground sm:mt-2 sm:text-sm">
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
				{#each slides as _, i}
					<Button
						variant="ghost"
						size="icon"
						onclick={() => goToSlide(i)}
						class="size-1.5 rounded-full p-0 sm:size-2 {i === currentSlide
							? 'bg-primary hover:bg-primary/80'
							: 'bg-muted-foreground/30 hover:bg-muted-foreground/50'}"
						aria-label="Go to slide {i + 1}"
					></Button>
				{/each}
			</div>
		</div>
	</div>

	<p class="mb-3 text-[10px] text-muted-foreground sm:mb-4 sm:text-[11px]">
		Researched data from <span class="font-medium text-foreground"
			>{data.stats.kbSections} knowledge sections</span
		>
		· <span class="font-medium text-foreground">{data.stats.glossaryTerms} glossary terms</span>
	</p>
</section>

<!-- STATS -->
<section class="flex gap-1 sm:gap-2 lg:grid lg:grid-cols-4">
	<div
		class="min-w-0 flex-1 rounded-md bg-card px-1.5 py-1.5 text-center ring-1 ring-foreground/10 sm:rounded-xl sm:px-3 sm:py-3"
	>
		<div class="text-base font-bold text-info sm:text-2xl">{data.stats.kbSections}</div>
		<div class="truncate text-[10px] text-muted-foreground sm:text-xs">KB sections</div>
	</div>
	<div
		class="min-w-0 flex-1 rounded-md bg-card px-1.5 py-1.5 text-center ring-1 ring-foreground/10 sm:rounded-xl sm:px-3 sm:py-3"
	>
		<div class="text-base font-bold text-warn sm:text-2xl">{data.stats.glossaryTerms}</div>
		<div class="truncate text-[10px] text-muted-foreground sm:text-xs">Glossary</div>
	</div>
	<div
		class="min-w-0 flex-1 rounded-md bg-card px-1.5 py-1.5 text-center ring-1 ring-foreground/10 sm:rounded-xl sm:px-3 sm:py-3"
	>
		<div class="text-base font-bold text-success sm:text-2xl">14+</div>
		<div class="truncate text-[10px] text-muted-foreground sm:text-xs">Certifiers</div>
	</div>
	<div
		class="min-w-0 flex-1 rounded-md bg-card px-1.5 py-1.5 text-center ring-1 ring-foreground/10 sm:rounded-xl sm:px-3 sm:py-3"
	>
		<div class="text-base font-bold text-accent-purple sm:text-2xl">7</div>
		<div class="truncate text-[10px] text-muted-foreground sm:text-xs">Guides</div>
	</div>
</section>

<!-- TOOLS -->
<section {@attach reveal}>
	<SectionHead
		number="01"
		title="Halal trade tools"
		description="Free tools to help you navigate halal certification and compliance."
	/>
	<div
		class="-mx-4 flex scrollbar-none gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:gap-3 sm:px-0"
	>
		<a
			href={localizeHref('/tools/ingredient-checker')}
			class="group flex w-[200px] shrink-0 items-center gap-2.5 rounded-lg bg-card p-2.5 ring-1 ring-foreground/10 transition-all hover:shadow-md hover:-translate-y-0.5 sm:w-auto sm:rounded-xl sm:p-4"
		>
			<FlaskConical class="size-4 shrink-0 text-info sm:size-6" />
			<div class="min-w-0">
				<h3 class="text-xs font-medium transition-colors group-hover:text-primary sm:text-sm">
					Ingredient Checker
				</h3>
				<p class="truncate text-[10px] text-muted-foreground sm:text-xs">
					Analyze ingredients for halal compliance.
				</p>
			</div>
		</a>
		<a
			href={localizeHref('/tools/certification-cost')}
			class="group flex w-[200px] shrink-0 items-center gap-2.5 rounded-lg bg-card p-2.5 ring-1 ring-foreground/10 transition-all hover:shadow-md hover:-translate-y-0.5 sm:w-auto sm:rounded-xl sm:p-4"
		>
			<Calculator class="size-4 shrink-0 text-warn sm:size-6" />
			<div class="min-w-0">
				<h3 class="text-xs font-medium transition-colors group-hover:text-primary sm:text-sm">
					Certification Cost
				</h3>
				<p class="truncate text-[10px] text-muted-foreground sm:text-xs">
					Estimate costs across 7 certifiers.
				</p>
			</div>
		</a>
		<a
			href={localizeHref('/verify')}
			class="group flex w-[200px] shrink-0 items-center gap-2.5 rounded-lg bg-card p-2.5 ring-1 ring-foreground/10 transition-all hover:shadow-md hover:-translate-y-0.5 sm:w-auto sm:rounded-xl sm:p-4"
		>
			<Search class="size-4 shrink-0 text-success sm:size-6" />
			<div class="min-w-0">
				<h3 class="text-xs font-medium transition-colors group-hover:text-primary sm:text-sm">
					Verify Certificate
				</h3>
				<p class="truncate text-[10px] text-muted-foreground sm:text-xs">
					Check certificate authenticity.
				</p>
			</div>
		</a>
	</div>
</section>

<!-- CATEGORIES -->
<section {@attach reveal}>
	<SectionHead number="02" title="Browse by category" href="/categories" linkLabel="View all" />
	<div class="grid gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3">
		{#each data.categories.slice(0, 6) as category, i}
			<a
				href={localizeHref(`/categories/${category.slug}`)}
				class="group flex items-center gap-3 rounded-lg bg-card p-3 ring-1 ring-foreground/10 transition-all hover:shadow-md hover:-translate-y-0.5 sm:rounded-xl sm:p-4"
			>
				<div
					class="flex size-10 shrink-0 items-center justify-center rounded-lg {categoryColors[
						i % categoryColors.length
					]}"
				>
					<Icon name={category.icon} class="size-5"></Icon>
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

<!-- MARKETPLACE COMING SOON -->
<section
	{@attach reveal}
	class="rounded-lg bg-card p-4 ring-1 ring-foreground/10 sm:rounded-xl sm:p-6"
>
	<div class="text-center">
		<Badge variant="secondary" class="mb-2 sm:mb-3">Launching 2026</Badge>
		<h2 class="text-xl font-semibold tracking-tight sm:text-2xl sm:text-3xl">Verified Supplier Marketplace</h2>
		<p class="mx-auto mt-1.5 max-w-xl text-xs text-muted-foreground sm:mt-2 sm:text-sm">
			Every supplier listing backed by real halal certification data — certifying body, standard, scope and
			expiry shown up front. No unverifiable claims.
		</p>
	</div>
	<div class="mt-4 grid grid-cols-3 gap-3 sm:mt-6 sm:max-w-lg sm:mx-auto">
		<div class="rounded-xl bg-muted/50 p-3 text-center">
			<p class="text-lg font-bold text-info">50+</p>
			<p class="text-[10px] text-muted-foreground sm:text-xs">Verified suppliers</p>
		</div>
		<div class="rounded-xl bg-muted/50 p-3 text-center">
			<p class="text-lg font-bold text-warn">14+</p>
			<p class="text-[10px] text-muted-foreground sm:text-xs">Certifying bodies</p>
		</div>
		<div class="rounded-xl bg-muted/50 p-3 text-center">
			<p class="text-lg font-bold text-success">7</p>
			<p class="text-[10px] text-muted-foreground sm:text-xs">Market guides</p>
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
		{#each data.kbArticles.slice(0, 6) as article}
			<a
				href={localizeHref(`/knowledge-base/${article.section}/${article.slug}`)}
				class="group w-[220px] shrink-0 rounded-lg bg-card p-2.5 ring-1 ring-foreground/10 transition-all hover:shadow-md hover:-translate-y-0.5 sm:w-auto sm:rounded-xl sm:p-3"
			>
				<Badge variant="secondary" class="mb-1 text-[10px] sm:text-[10px]">{article.section}</Badge>
				<h3
					class="line-clamp-2 text-xs leading-snug font-medium transition-colors group-hover:text-primary sm:text-sm"
				>
					{article.title}
				</h3>
				<p
					class="mt-0.5 line-clamp-1 text-[10px] text-muted-foreground sm:mt-1 sm:line-clamp-2 sm:text-xs"
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
		<a
			href={localizeHref('/market-guides')}
			class="group flex items-center gap-2.5 rounded-lg bg-card p-3 ring-1 ring-foreground/10 transition-all hover:shadow-md hover:-translate-y-0.5 sm:rounded-xl sm:p-4"
		>
			<div class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-info/10 text-info">
				<Icon name="globe" class="size-4.5" />
			</div>
			<div class="min-w-0">
				<h3 class="truncate text-xs font-medium transition-colors group-hover:text-primary sm:text-sm">
					Market guides
				</h3>
				<p class="mt-0.5 line-clamp-2 text-[10px] leading-snug text-muted-foreground sm:text-xs">
					Country-by-country entry requirements
				</p>
			</div>
		</a>
		<a
			href={localizeHref('/trade-shows')}
			class="group flex items-center gap-2.5 rounded-lg bg-card p-3 ring-1 ring-foreground/10 transition-all hover:shadow-md hover:-translate-y-0.5 sm:rounded-xl sm:p-4"
		>
			<div class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-warn/10 text-warn">
				<Icon name="calendar" class="size-4.5" />
			</div>
			<div class="min-w-0">
				<h3 class="truncate text-xs font-medium transition-colors group-hover:text-primary sm:text-sm">
					Trade shows
				</h3>
				<p class="mt-0.5 line-clamp-2 text-[10px] leading-snug text-muted-foreground sm:text-xs">
					Global halal exhibitions & events
				</p>
			</div>
		</a>
		<a
			href={localizeHref('/service-providers')}
			class="group flex items-center gap-2.5 rounded-lg bg-card p-3 ring-1 ring-foreground/10 transition-all hover:shadow-md hover:-translate-y-0.5 sm:rounded-xl sm:p-4"
		>
			<div
				class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-purple/10 text-accent-purple"
			>
				<Icon name="briefcase" class="size-4.5" />
			</div>
			<div class="min-w-0">
				<h3 class="truncate text-xs font-medium transition-colors group-hover:text-primary sm:text-sm">
					Service providers
				</h3>
				<p class="mt-0.5 line-clamp-2 text-[10px] leading-snug text-muted-foreground sm:text-xs">
					Certification consultants & labs
				</p>
			</div>
		</a>
		<a
			href={localizeHref('/blog')}
			class="group flex items-center gap-2.5 rounded-lg bg-card p-3 ring-1 ring-foreground/10 transition-all hover:shadow-md hover:-translate-y-0.5 sm:rounded-xl sm:p-4"
		>
			<div
				class="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent-rose/10 text-accent-rose"
			>
				<Icon name="newspaper" class="size-4.5" />
			</div>
			<div class="min-w-0">
				<h3 class="truncate text-xs font-medium transition-colors group-hover:text-primary sm:text-sm">
					Blog
				</h3>
				<p class="mt-0.5 line-clamp-2 text-[10px] leading-snug text-muted-foreground sm:text-xs">
					Industry insights & announcements
				</p>
			</div>
		</a>
	</div>
</section>

<!-- CTA -->
<section
	{@attach reveal}
	class="rounded-lg bg-card p-4 text-center ring-1 ring-foreground/10 sm:rounded-xl sm:p-6"
>
	<h2 class="text-xl font-semibold tracking-tight sm:text-2xl sm:text-3xl">
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
		<Button href={localizeHref('/tools/ingredient-checker')} variant="outline" size="sm" class="sm:size-lg"
			>Try the Ingredient Checker</Button
		>
	</div>
</section>

<!-- TRUST / METHODOLOGY -->
<section {@attach reveal} class="space-y-4">
	<div class="max-w-2xl space-y-2">
		<h2 class="text-sm font-semibold text-foreground">How we verify</h2>
		<p class="text-xs text-muted-foreground sm:text-sm">
			All certification data on HalalNeo is sourced from publicly available registers of accredited halal
			certifying bodies. We cross-reference certificate numbers, issuing organisations and scope details
			against the original body's published records.
		</p>
	</div>
	<div class="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
		<div class="rounded-lg bg-card p-3 ring-1 ring-foreground/10">
			<p class="text-xs font-medium">JAKIM · MUI · ESMA</p>
			<p class="mt-0.5 text-[10px] text-muted-foreground">14+ certifying body databases</p>
		</div>
		<div class="rounded-lg bg-card p-3 ring-1 ring-foreground/10">
			<p class="text-xs font-medium">Public certificate registers</p>
			<p class="mt-0.5 text-[10px] text-muted-foreground">Cross-referenced against issuing bodies</p>
		</div>
		<div class="rounded-lg bg-card p-3 ring-1 ring-foreground/10">
			<p class="text-xs font-medium">Scope & expiry tracking</p>
			<p class="mt-0.5 text-[10px] text-muted-foreground">Certificate validity shown on every profile</p>
		</div>
		<div class="rounded-lg bg-card p-3 ring-1 ring-foreground/10">
			<p class="text-xs font-medium">Open methodology</p>
			<p class="mt-0.5 text-[10px] text-muted-foreground">How we source and verify data</p>
		</div>
	</div>
</section>
