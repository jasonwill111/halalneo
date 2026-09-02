<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import Icon from '#lib/components/site/icon.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '#lib/components/ui/card/index.js';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import Search from '@lucide/svelte/icons/search';
	import FlaskConical from '@lucide/svelte/icons/flask-conical';
	import Calculator from '@lucide/svelte/icons/calculator';
	import { onMount } from 'svelte';

	let { data } = $props();

	const slides = [
		{ image: '/images/hero-1.jpg', title: 'Halal trade\nintelligence.', subtitle: 'Research certification bodies, verify suppliers, and navigate global halal markets — all in one place.' },
		{ image: '/images/hero-2.jpg', title: 'Certification\nguides.', subtitle: 'Deep-dive into JAKIM, MUI, GSO, and 14+ certifying bodies. Standards, scope, and mutual recognition explained.' },
		{ image: '/images/hero-3.jpg', title: 'Market entry\nreports.', subtitle: 'Country-by-country analysis of halal regulations, import requirements, and sourcing opportunities.' }
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
		return () => { if (intervalId) clearInterval(intervalId); };
	});
</script>

<svelte:head>
	<link rel="preload" as="image" href={slides[0].image} fetchpriority="high" />
	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: 'HalalNeo',
		url: 'https://halalneo.com',
		description: 'Halal trade intelligence platform — certification guides, market reports, and supplier verification for global halal trade.',
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
<section class="flex flex-col items-center text-center py-6 sm:py-10">
	<span class="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2.5 py-0.5 text-[10px] font-medium text-secondary-foreground mb-3">
		<ShieldCheck class="size-2.5 text-primary"></ShieldCheck>
		Halal trade intelligence platform
	</span>

	<!-- Hero Carousel -->
	<div class="relative mb-4 w-full overflow-hidden rounded-xl">
		<div class="relative aspect-[16/6] sm:aspect-[16/5]">
			{#each slides as slide, i}
				<div class="absolute inset-0 transition-opacity duration-500 {i === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}">
					<img src={slide.image} alt={slide.title.replace(/\n/g, ' ')} class="absolute inset-0 h-full w-full object-cover" aria-hidden="true" loading="eager" fetchpriority={i === 0 ? 'high' : 'low'} width="1200" height="500" />
					<div class="h-full w-full bg-cover bg-center" style="background-image: url('{slide.image}')"></div>
					<div class="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/30"></div>
					<div class="absolute inset-0 flex items-center">
						<div class="px-6 sm:px-10 max-w-xl">
							<h1 class="text-lg sm:text-2xl font-bold tracking-tight sm:text-4xl lg:text-5xl leading-tight whitespace-pre-line" fetchpriority={i === 0 ? 'high' : undefined}>
								{slide.title}
							</h1>
							<p class="mt-2 max-w-md text-xs sm:text-sm text-muted-foreground">
								{slide.subtitle}
							</p>
							<div class="mt-3 flex flex-col gap-1.5 sm:flex-row sm:gap-2">
								<Button href={localizeHref('/knowledge-base')} size="lg">Explore Knowledge Base</Button>
								<Button href={localizeHref('/categories')} variant="outline" size="lg">Browse Categories</Button>
							</div>
						</div>
					</div>
				</div>
			{/each}
			<!-- Carousel Dots -->
			<div class="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
				{#each slides as _, i}
					<Button
						variant="ghost"
						size="icon"
						onclick={() => goToSlide(i)}
						class="size-2 rounded-full p-0 {i === currentSlide ? 'bg-primary hover:bg-primary/80' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'}"
						aria-label="Go to slide {i + 1}"
					></Button>
				{/each}
			</div>
		</div>
	</div>

	<p class="mb-4 text-[11px] text-muted-foreground">
		Researched data from <span class="font-medium text-foreground">{data.stats.kbSections} knowledge sections</span> · <span class="font-medium text-foreground">{data.stats.glossaryTerms} glossary terms</span>
	</p>
</section>

<!-- STATS -->
<section class="grid grid-cols-2 gap-2 lg:grid-cols-4">
	<div class="rounded-xl ring-1 ring-foreground/10 bg-card px-3 py-3 text-center">
		<div class="text-2xl font-bold text-primary">{data.stats.kbSections}</div>
		<div class="mt-0.5 text-xs text-muted-foreground">Knowledge sections</div>
	</div>
	<div class="rounded-xl ring-1 ring-foreground/10 bg-card px-3 py-3 text-center">
		<div class="text-2xl font-bold text-primary">{data.stats.glossaryTerms}</div>
		<div class="mt-0.5 text-xs text-muted-foreground">Glossary terms</div>
	</div>
	<div class="rounded-xl ring-1 ring-foreground/10 bg-card px-3 py-3 text-center">
		<div class="text-2xl font-bold text-primary">14+</div>
		<div class="mt-0.5 text-xs text-muted-foreground">Certifying bodies</div>
	</div>
	<div class="rounded-xl ring-1 ring-foreground/10 bg-card px-3 py-3 text-center">
		<div class="text-2xl font-bold text-primary">7</div>
		<div class="mt-0.5 text-xs text-muted-foreground">Market guides</div>
	</div>
</section>

<!-- TOOLS -->
<section>
	<div class="mb-3">
		<h2 class="text-lg font-semibold">Halal trade tools</h2>
		<p class="text-xs text-muted-foreground">Free tools to help you navigate halal certification and compliance.</p>
	</div>
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
		<a href={localizeHref('/tools/ingredient-checker')} class="group rounded-xl ring-1 ring-foreground/10 bg-card p-4 transition-all hover:shadow-md">
			<FlaskConical class="size-6 text-primary mb-2" />
			<h3 class="text-sm font-medium group-hover:text-primary transition-colors">Ingredient Checker</h3>
			<p class="mt-1 text-xs text-muted-foreground">Analyze ingredient lists for halal compliance instantly.</p>
		</a>
		<a href={localizeHref('/tools/certification-cost')} class="group rounded-xl ring-1 ring-foreground/10 bg-card p-4 transition-all hover:shadow-md">
			<Calculator class="size-6 text-primary mb-2" />
			<h3 class="text-sm font-medium group-hover:text-primary transition-colors">Certification Cost</h3>
			<p class="mt-1 text-xs text-muted-foreground">Estimate halal certification costs across 7 certifiers.</p>
		</a>
		<a href={localizeHref('/verify')} class="group rounded-xl ring-1 ring-foreground/10 bg-card p-4 transition-all hover:shadow-md">
			<Search class="size-6 text-primary mb-2" />
			<h3 class="text-sm font-medium group-hover:text-primary transition-colors">Verify Certificate</h3>
			<p class="mt-1 text-xs text-muted-foreground">Check halal certificate authenticity and scope.</p>
		</a>
	</div>
</section>

<!-- CATEGORIES -->
<section>
	<div class="mb-3 flex items-end justify-between">
		<h2 class="text-lg font-semibold">Browse by category</h2>
		<a href={localizeHref('/categories')} class="text-xs text-primary hover:underline">View all</a>
	</div>
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
		{#each data.categories as category}
			<a href={localizeHref(`/categories/${category.slug}`)} class="group rounded-xl ring-1 ring-foreground/10 bg-card p-3 transition-all hover:shadow-md">
				<div class="mb-2 text-lg sm:text-2xl">
					<Icon name={category.icon} class="size-5"></Icon>
				</div>
				<h3 class="text-sm font-medium group-hover:text-primary transition-colors">{category.name}</h3>
				<p class="mt-0.5 text-xs text-muted-foreground line-clamp-2">{category.description}</p>
			</a>
		{/each}
	</div>
</section>

<!-- MARKETPLACE COMING SOON -->
<section class="rounded-xl ring-1 ring-foreground/10 bg-card p-6 text-center sm:p-8">
	<Badge variant="secondary" class="mb-3">Coming Soon</Badge>
	<h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">Marketplace</h2>
	<p class="mx-auto mt-2 max-w-xl text-muted-foreground">
		We're building a verified supplier directory and product marketplace. Every listing will be backed by real halal certification data from recognized certifying bodies.
	</p>
	<div class="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
		<Button href={localizeHref('/register')} size="lg">Join the waitlist</Button>
		<Button href={localizeHref('/knowledge-base')} variant="outline" size="lg">Explore the knowledge base</Button>
	</div>
</section>

<!-- KB PREVIEW -->
<section>
	<div class="mb-4 flex items-end justify-between">
		<h2 class="text-lg font-semibold">Latest from the knowledge base</h2>
		<a href={localizeHref('/knowledge-base')} class="text-xs text-primary hover:underline">View all</a>
	</div>
	<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
		{#each data.kbArticles.slice(0, 6) as article}
			<a href={localizeHref(`/knowledge-base/${article.section}/${article.slug}`)} class="group rounded-xl ring-1 ring-foreground/10 bg-card p-3 transition-all hover:shadow-md">
				<Badge variant="secondary" class="mb-1.5 text-[10px]">{article.section}</Badge>
				<h3 class="text-sm font-medium leading-snug group-hover:text-primary transition-colors">{article.title}</h3>
				<p class="mt-1 text-xs text-muted-foreground line-clamp-2">{article.summary}</p>
			</a>
		{/each}
	</div>
</section>

<!-- CTA -->
<section class="mt-6 rounded-xl ring-1 ring-foreground/10 bg-card p-6 text-center sm:p-8">
	<h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">Navigate halal trade with confidence</h2>
	<p class="mx-auto mt-2 max-w-xl text-muted-foreground">
		Access comprehensive certification guides, market reports, and trade intelligence — built for B2B buyers and suppliers.
	</p>
	<div class="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
		<Button href={localizeHref('/knowledge-base')} size="lg">Start reading</Button>
		<Button href={localizeHref('/glossary')} variant="outline" size="lg">Browse the glossary</Button>
	</div>
</section>
