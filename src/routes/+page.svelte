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
<section class="flex flex-col items-center text-center py-4 sm:py-10">
	<span class="inline-flex items-center gap-1.5 rounded-full border border-border bg-secondary px-2 py-0.5 text-[10px] font-medium text-secondary-foreground mb-2 sm:mb-3">
		<ShieldCheck class="size-2.5 text-primary"></ShieldCheck>
		Halal trade intelligence platform
	</span>

	<!-- Hero Carousel -->
	<div class="relative mb-3 sm:mb-4 w-full overflow-hidden rounded-xl">
		<div class="relative aspect-[16/7] sm:aspect-[16/5]">
			{#each slides as slide, i}
				<div class="absolute inset-0 transition-opacity duration-500 {i === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}">
					<img src={slide.image} alt={slide.title.replace(/\n/g, ' ')} class="absolute inset-0 h-full w-full object-cover" aria-hidden="true" loading="eager" fetchpriority={i === 0 ? 'high' : 'low'} width="1200" height="500" />
					<div class="h-full w-full bg-cover bg-center" style="background-image: url('{slide.image}')"></div>
					<div class="absolute inset-0 bg-gradient-to-r from-background/95 via-background/70 to-background/30"></div>
					<div class="absolute inset-0 flex items-center">
						<div class="px-4 sm:px-10 max-w-xl">
							<h1 class="text-base sm:text-2xl font-bold tracking-tight sm:text-4xl lg:text-5xl leading-tight whitespace-pre-line" fetchpriority={i === 0 ? 'high' : undefined}>
								{slide.title}
							</h1>
							<p class="mt-1.5 sm:mt-2 max-w-md text-[11px] sm:text-sm text-muted-foreground">
								{slide.subtitle}
							</p>
							<div class="mt-2.5 sm:mt-3 flex flex-col gap-1.5 sm:flex-row sm:gap-2">
								<Button href={localizeHref('/knowledge-base')} size="sm" class="sm:size-lg">Explore Knowledge Base</Button>
								<Button href={localizeHref('/categories')} variant="outline" size="sm" class="sm:size-lg">Browse Categories</Button>
							</div>
						</div>
					</div>
				</div>
			{/each}
			<!-- Carousel Dots -->
			<div class="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-20">
				{#each slides as _, i}
					<Button
						variant="ghost"
						size="icon"
						onclick={() => goToSlide(i)}
						class="size-1.5 sm:size-2 rounded-full p-0 {i === currentSlide ? 'bg-primary hover:bg-primary/80' : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'}"
						aria-label="Go to slide {i + 1}"
					></Button>
				{/each}
			</div>
		</div>
	</div>

	<p class="mb-3 sm:mb-4 text-[10px] sm:text-[11px] text-muted-foreground">
		Researched data from <span class="font-medium text-foreground">{data.stats.kbSections} knowledge sections</span> · <span class="font-medium text-foreground">{data.stats.glossaryTerms} glossary terms</span>
	</p>
</section>

<!-- STATS -->
<section class="flex gap-1 sm:gap-2 lg:grid lg:grid-cols-4">
	<div class="flex-1 min-w-0 rounded-md sm:rounded-xl ring-1 ring-foreground/10 bg-card px-1.5 py-1.5 sm:px-3 sm:py-3 text-center">
		<div class="text-base sm:text-2xl font-bold text-primary">{data.stats.kbSections}</div>
		<div class="text-[9px] sm:text-xs text-muted-foreground truncate">KB sections</div>
	</div>
	<div class="flex-1 min-w-0 rounded-md sm:rounded-xl ring-1 ring-foreground/10 bg-card px-1.5 py-1.5 sm:px-3 sm:py-3 text-center">
		<div class="text-base sm:text-2xl font-bold text-primary">{data.stats.glossaryTerms}</div>
		<div class="text-[9px] sm:text-xs text-muted-foreground truncate">Glossary</div>
	</div>
	<div class="flex-1 min-w-0 rounded-md sm:rounded-xl ring-1 ring-foreground/10 bg-card px-1.5 py-1.5 sm:px-3 sm:py-3 text-center">
		<div class="text-base sm:text-2xl font-bold text-primary">14+</div>
		<div class="text-[9px] sm:text-xs text-muted-foreground truncate">Certifiers</div>
	</div>
	<div class="flex-1 min-w-0 rounded-md sm:rounded-xl ring-1 ring-foreground/10 bg-card px-1.5 py-1.5 sm:px-3 sm:py-3 text-center">
		<div class="text-base sm:text-2xl font-bold text-primary">7</div>
		<div class="text-[9px] sm:text-xs text-muted-foreground truncate">Guides</div>
	</div>
</section>

<!-- TOOLS -->
<section>
	<div class="mb-2 sm:mb-3">
		<h2 class="text-base sm:text-lg font-semibold">Halal trade tools</h2>
		<p class="text-[11px] sm:text-xs text-muted-foreground">Free tools to help you navigate halal certification and compliance.</p>
	</div>
	<div class="flex gap-2 sm:grid sm:grid-cols-3 sm:gap-3 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
		<a href={localizeHref('/tools/ingredient-checker')} class="group flex items-center gap-2.5 rounded-lg sm:rounded-xl ring-1 ring-foreground/10 bg-card p-2.5 sm:p-4 transition-all hover:shadow-md shrink-0 w-[200px] sm:w-auto">
			<FlaskConical class="size-4 sm:size-6 text-primary shrink-0" />
			<div class="min-w-0">
				<h3 class="text-xs sm:text-sm font-medium group-hover:text-primary transition-colors">Ingredient Checker</h3>
				<p class="text-[10px] sm:text-xs text-muted-foreground truncate">Analyze ingredients for halal compliance.</p>
			</div>
		</a>
		<a href={localizeHref('/tools/certification-cost')} class="group flex items-center gap-2.5 rounded-lg sm:rounded-xl ring-1 ring-foreground/10 bg-card p-2.5 sm:p-4 transition-all hover:shadow-md shrink-0 w-[200px] sm:w-auto">
			<Calculator class="size-4 sm:size-6 text-primary shrink-0" />
			<div class="min-w-0">
				<h3 class="text-xs sm:text-sm font-medium group-hover:text-primary transition-colors">Certification Cost</h3>
				<p class="text-[10px] sm:text-xs text-muted-foreground truncate">Estimate costs across 7 certifiers.</p>
			</div>
		</a>
		<a href={localizeHref('/verify')} class="group flex items-center gap-2.5 rounded-lg sm:rounded-xl ring-1 ring-foreground/10 bg-card p-2.5 sm:p-4 transition-all hover:shadow-md shrink-0 w-[200px] sm:w-auto">
			<Search class="size-4 sm:size-6 text-primary shrink-0" />
			<div class="min-w-0">
				<h3 class="text-xs sm:text-sm font-medium group-hover:text-primary transition-colors">Verify Certificate</h3>
				<p class="text-[10px] sm:text-xs text-muted-foreground truncate">Check certificate authenticity.</p>
			</div>
		</a>
	</div>
</section>

<!-- CATEGORIES -->
<section>
	<div class="mb-2 sm:mb-3 flex items-end justify-between">
		<h2 class="text-base sm:text-lg font-semibold">Browse by category</h2>
		<a href={localizeHref('/categories')} class="text-[11px] sm:text-xs text-primary hover:underline">View all</a>
	</div>
	<div class="grid grid-cols-3 sm:grid-cols-3 gap-1.5 sm:gap-3 lg:grid-cols-3">
		{#each data.categories.slice(0, 6) as category}
			<a href={localizeHref(`/categories/${category.slug}`)} class="group rounded-lg sm:rounded-xl ring-1 ring-foreground/10 bg-card p-2 sm:p-3 transition-all hover:shadow-md">
				<div class="mb-1 sm:mb-2">
					<Icon name={category.icon} class="size-3.5 sm:size-5"></Icon>
				</div>
				<h3 class="text-[10px] sm:text-sm font-medium group-hover:text-primary transition-colors leading-tight">{category.name}</h3>
				<p class="mt-0.5 text-[9px] sm:text-xs text-muted-foreground line-clamp-2 hidden sm:block">{category.description}</p>
			</a>
		{/each}
	</div>
</section>

<!-- MARKETPLACE COMING SOON -->
<section class="rounded-lg sm:rounded-xl ring-1 ring-foreground/10 bg-card p-4 sm:p-6 text-center sm:p-8">
	<Badge variant="secondary" class="mb-2 sm:mb-3">Coming Soon</Badge>
	<h2 class="text-xl sm:text-2xl font-semibold tracking-tight sm:text-3xl">Marketplace</h2>
	<p class="mx-auto mt-1.5 sm:mt-2 max-w-xl text-xs sm:text-sm text-muted-foreground">
		We're building a verified supplier directory and product marketplace. Every listing will be backed by real halal certification data from recognized certifying bodies.
	</p>
	<div class="mt-4 sm:mt-6 flex flex-col items-center justify-center gap-2 sm:gap-3 sm:flex-row">
		<Button href={localizeHref('/register')} size="sm" class="sm:size-lg">Join the waitlist</Button>
		<Button href={localizeHref('/knowledge-base')} variant="outline" size="sm" class="sm:size-lg">Explore the knowledge base</Button>
	</div>
</section>

<!-- KB PREVIEW -->
<section>
	<div class="mb-2 sm:mb-4 flex items-end justify-between">
		<h2 class="text-base sm:text-lg font-semibold">Latest from the knowledge base</h2>
		<a href={localizeHref('/knowledge-base')} class="text-[11px] sm:text-xs text-primary hover:underline">View all</a>
	</div>
	<div class="flex gap-2 sm:grid sm:grid-cols-2 sm:gap-3 lg:grid-cols-3 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
		{#each data.kbArticles.slice(0, 6) as article}
			<a href={localizeHref(`/knowledge-base/${article.section}/${article.slug}`)} class="group rounded-lg sm:rounded-xl ring-1 ring-foreground/10 bg-card p-2.5 sm:p-3 transition-all hover:shadow-md shrink-0 w-[220px] sm:w-auto">
				<Badge variant="secondary" class="mb-1 text-[8px] sm:text-[10px]">{article.section}</Badge>
				<h3 class="text-xs sm:text-sm font-medium leading-snug group-hover:text-primary transition-colors line-clamp-2">{article.title}</h3>
				<p class="mt-0.5 sm:mt-1 text-[10px] sm:text-xs text-muted-foreground line-clamp-1 sm:line-clamp-2">{article.summary}</p>
			</a>
		{/each}
	</div>
</section>

<!-- CTA -->
<section class="mt-4 sm:mt-6 rounded-lg sm:rounded-xl ring-1 ring-foreground/10 bg-card p-4 sm:p-6 text-center sm:p-8">
	<h2 class="text-xl sm:text-2xl font-semibold tracking-tight sm:text-3xl">Navigate halal trade with confidence</h2>
	<p class="mx-auto mt-1.5 sm:mt-2 max-w-xl text-xs sm:text-sm text-muted-foreground">
		Access comprehensive certification guides, market reports, and trade intelligence — built for B2B buyers and suppliers.
	</p>
	<div class="mt-4 sm:mt-6 flex flex-col items-center justify-center gap-2 sm:gap-3 sm:flex-row">
		<Button href={localizeHref('/knowledge-base')} size="sm" class="sm:size-lg">Start reading</Button>
		<Button href={localizeHref('/glossary')} variant="outline" size="sm" class="sm:size-lg">Browse the glossary</Button>
	</div>
</section>
