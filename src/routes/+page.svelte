<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import Icon from '#lib/components/site/icon.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '#lib/components/ui/card/index.js';
	import { Avatar, AvatarFallback } from '#lib/components/ui/avatar/index.js';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import { onMount } from 'svelte';

	let { data } = $props();

	const slides = [
		{ image: '/images/hero-1.jpg', title: 'Source halal.\nVerify it.\nShip it.', subtitle: 'Connect with certified halal suppliers worldwide. Browse verified products and simplify your supply chain.' },
		{ image: '/images/hero-2.jpg', title: 'Certified products.\nVerified suppliers.\nGlobal reach.', subtitle: 'Every listing backed by real halal certification data from recognized certifying bodies.' },
		{ image: '/images/hero-3.jpg', title: 'Trade intelligence.\nMarket guides.\nDue diligence.', subtitle: 'Make informed sourcing decisions with comprehensive halal trade knowledge.' }
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
		description: 'Halal trade intelligence platform connecting halal manufacturers, suppliers, and buyers worldwide.',
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
								<Button href={localizeHref('/products')} size="lg">Browse Products</Button>
								<Button href={localizeHref('/knowledge-base')} variant="outline" size="lg">Knowledge Base</Button>
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
		Trusted data from <span class="font-medium text-foreground">{data.stats.kbSections} certifying bodies</span>
	</p>
</section>

<section class="grid grid-cols-2 gap-2 lg:grid-cols-4">
	<div class="rounded-xl ring-1 ring-foreground/10 bg-card px-3 py-3 text-center">
		<div class="text-2xl font-bold text-primary">{data.stats.verifiedSuppliers}</div>
		<div class="mt-0.5 text-xs text-muted-foreground">Verified suppliers</div>
	</div>
	<div class="rounded-xl ring-1 ring-foreground/10 bg-card px-3 py-3 text-center">
		<div class="text-2xl font-bold text-primary">{data.stats.certifiedProducts}</div>
		<div class="mt-0.5 text-xs text-muted-foreground">Certified products</div>
	</div>
	<div class="rounded-xl ring-1 ring-foreground/10 bg-card px-3 py-3 text-center">
		<div class="text-2xl font-bold text-primary">{data.stats.kbSections}</div>
		<div class="mt-0.5 text-xs text-muted-foreground">Knowledge sections</div>
	</div>
	<div class="rounded-xl ring-1 ring-foreground/10 bg-card px-3 py-3 text-center">
		<div class="text-2xl font-bold text-primary">{data.stats.glossaryTerms}</div>
		<div class="mt-0.5 text-xs text-muted-foreground">Glossary terms</div>
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

<!-- FEATURED PRODUCTS -->
<section>
	<div class="mb-4 flex items-end justify-between">
		<h2 class="text-lg font-semibold">Featured products</h2>
		<a href={localizeHref('/products')} class="text-xs text-primary hover:underline">View all</a>
	</div>
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
		{#each data.featuredProducts as product}
			<div class="rounded-xl ring-1 ring-foreground/10 bg-card p-3 transition-all hover:shadow-md">
				<div class="mb-2 aspect-square rounded-md bg-muted flex items-center justify-center text-muted-foreground">
					{#if product.image}
						<img src={product.image} alt={product.name} class="h-full w-full rounded-md object-cover" loading="lazy" decoding="async" width="400" height="400" onerror={(e) => { e.currentTarget.style.display='none'; }}>
					{:else}
						<span class="text-xs">No image</span>
					{/if}
				</div>
				<h3 class="text-sm font-medium leading-snug">{product.name}</h3>
				<p class="text-xs text-muted-foreground mt-0.5">{product.originCountry} · {product.certStatus}</p>
				{#if product.priceMin || product.priceMax}
					<div class="mt-1 text-sm font-semibold text-primary">
						{product.priceMin ? `$${product.priceMin}` : ''}{product.priceMin && product.priceMax ? ' - ' : ''}{product.priceMax ? `$${product.priceMax}` : ''}
						{#if product.priceUnit}<span class="text-xs font-normal text-muted-foreground">/{product.priceUnit}</span>{/if}
					</div>
				{/if}
				{#if product.moq}
					<p class="text-xs text-muted-foreground">MOQ: {product.moq}</p>
				{/if}
				<a href={localizeHref(`/products/${product.slug}`)} class="mt-3 inline-flex h-8 w-full items-center justify-center rounded-md border border-border text-xs font-medium hover:bg-accent transition-colors">View details</a>
			</div>
		{/each}
	</div>
</section>

<!-- FEATURED SUPPLIERS -->
<section>
	<div class="mb-4 flex items-end justify-between">
		<h2 class="text-lg font-semibold">Featured suppliers</h2>
		<a href={localizeHref('/suppliers')} class="text-xs text-primary hover:underline">View all</a>
	</div>
	<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
		{#each data.featuredSuppliers as supplier}
			<div class="rounded-xl ring-1 ring-foreground/10 bg-card p-3 transition-all hover:shadow-md">
				<div class="flex items-center gap-2">
					<Avatar>
						<AvatarFallback>{supplier.logoInitials}</AvatarFallback>
					</Avatar>
					<div>
						<h3 class="text-sm font-medium leading-snug">{supplier.name}</h3>
						<p class="text-xs text-muted-foreground">{supplier.country}</p>
					</div>
				</div>
				<p class="mt-2 text-xs text-muted-foreground line-clamp-2">{supplier.description}</p>
				<div class="mt-2">
					<Badge variant="secondary" class="capitalize">{supplier.businessType}</Badge>
				</div>
				<div class="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground">
					<ShieldCheck class="size-3 text-primary"></ShieldCheck>
					{supplier.certifications.length} certs
				</div>
				<a href={localizeHref(`/suppliers/${supplier.slug}`)} class="mt-2 inline-flex h-7 w-full items-center justify-center rounded-md border border-border text-xs font-medium hover:bg-accent transition-colors">View profile</a>
			</div>
		{/each}
	</div>
</section>

<!-- KB PREVIEW -->
<section>
	<div class="mb-4 flex items-end justify-between">
		<h2 class="text-lg font-semibold">Knowledge base</h2>
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
	<h2 class="text-2xl font-semibold tracking-tight sm:text-3xl">Ready to start sourcing?</h2>
	<p class="mx-auto mt-2 max-w-xl text-muted-foreground">
		Create a buyer account to shortlist certified suppliers and products, and keep up with halal trade intelligence.
	</p>
	<div class="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
		<Button href={localizeHref('/register')} size="lg">Create a free account</Button>
		<Button href={localizeHref('/glossary')} variant="outline" size="lg">Browse the glossary</Button>
	</div>
</section>
