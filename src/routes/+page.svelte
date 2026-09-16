<script lang="ts">
 	import { localizeHref } from '#lib/paraglide/runtime.js';
 	import Icon from '#lib/components/site/icon.svelte';
 	import StatTile from '#lib/components/site/stat-tile.svelte';
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
 	import { TILE_COLORS } from '#lib/utils/tile-colors.js';
 	import ShieldCheck from '@lucide/svelte/icons/shield-check';
 	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
 	import BookOpen from '@lucide/svelte/icons/book-open';
 	import Search from '@lucide/svelte/icons/search';
 	import FlaskConical from '@lucide/svelte/icons/flask-conical';
 	import Calculator from '@lucide/svelte/icons/calculator';
 	import Banknote from '@lucide/svelte/icons/banknote';
 	import FileText from '@lucide/svelte/icons/file-text';
 	import Globe from '@lucide/svelte/icons/globe';
 	import Calendar from '@lucide/svelte/icons/calendar';
 	import Briefcase from '@lucide/svelte/icons/briefcase';
 	import Newspaper from '@lucide/svelte/icons/newspaper';
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

<SeoMeta 
 	title="HalalNeo - Halal Trade Intelligence Platform for Global Halal Markets"
 	description="Research certification bodies, verify suppliers, and navigate global halal markets. JAKIM, MUI, GSO guides, market entry reports, and supplier verification."
 	ogTitle="HalalNeo - Halal Trade Intelligence"
 	ogDescription="Comprehensive halal certification guides, supplier verification, and market entry intelligence."
 	keywords="halal, halal certification, halal suppliers, JAKIM, MUI, GSO, halal trade, halal market, halal intelligence, halal verification"
 	canonical="/"
/>

<svelte:head>
	<link
		rel="preload"
		as="image"
		href={slides[0].image}
		imagesrcset={`${slides[0].image}?w=768 768w, ${slides[0].image} 1200w`}
		imagesizes="100vw"
		fetchpriority="high"
	/>
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
<section class="flex flex-col items-center py-2 text-center sm:py-4">
	<span
		class="animate-enter glass-sm relative mb-2 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium text-secondary-foreground"
	>
		<ShieldCheck class="size-2.5 text-primary" />
		Verified Halal Trade Intelligence
	</span>
	<div class="space-y-3 sm:space-y-4 text-center">
		<h1 class="animate-enter text-3xl font-semibold tracking-tight sm:text-4xl">
			{slides[currentSlide].title}
		</h1>
		<p class="animate-enter text-sm text-muted-foreground sm:text-base">
			{slides[currentSlide].subtitle}
		</p>
	</div>
</section>

<!-- SLIDER -->
<div class="relative mt-12 w-full rounded-none sm:rounded-xl">
	<div class="relative overflow-hidden rounded-xl">
		<div
			class="flex transition-transform duration-700 ease-out"
			style="transform: translateX(-{currentSlide * 100}%)
		"
		>
			{#each slides as slide, i}
				<div class="w-full shrink-0 sm:w-1/2">
					<div class="relative min-h-[200px]">
						<img
							{slide.image}
							alt={slide.title}
							class="h-full w-full object-cover"
							loading="lazy"
							width="600"
							height="400"
						/>
						<div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-black/20"></div>
						<div class="relative z-10 p-8">
							<h3 class="mb-1 text-2xl font-semibold sm:text-3xl">
								{slide.title}
							</h3>
							<p class="mb-4 text-sm leading-relaxed text-gray-200">
								{slide.subtitle}
							</p>
						</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
	<div class="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
		{#each slides as slide, i}
			<button
				onclick={() => goToSlide(i)}
				class={cn(
					'h-2 w-2 rounded-full transition-all duration-300',
					currentSlide === i ? 'bg-primary h-8' : 'bg-gray-400'
				)}
			></button>
		{/each}
	</div>
	<button
		disabled={currentSlide === 0}
		onClick={() => { if (currentSlide > 0) { currentSlide = 0; } }}
		class={cn(
			'absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/80 p-3 shadow-lg transition-all hover:bg-white',
			currentSlide === 0 && 'pointer-events-none opacity-50'
		)}
	><ArrowUpRight class="size-5 rotate-90" /></button>
	<button
		disabled={currentSlide === slides.length - 1}
		onClick={() => { if (currentSlide < slides.length - 1) { currentSlide++; } }}
		class={cn(
			'absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/80 p-3 shadow-lg transition-all hover:bg-white',
			currentSlide === slides.length - 1 && 'pointer-events-none opacity-50'
		)}
	><ArrowUpRight class="size-5 -rotate-90" /></button>
</div>

<!-- LETTER -->
<section class="space-y-8 sm:space-y-12 py-24 sm:py-32">
	<div class="animate-enter space-y-8 text-center">
		<h2 class="animate-enter text-2xl font-semibold tracking-tight sm:text-3xl">
			Halal trade intelligence.
		</h2>
		<p class="animate-enter max-w-3xl mx-auto text-base text-muted-foreground sm:text-lg">
			Research certification bodies, verify suppliers, and navigate global halal markets — all in one place.
		</p>
	</div>
	<div class="animate-enter grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
		<StatTile
			title="15+ certification bodies"
			value="JAKIM, MUI, ESMA"
			description="Cross-referenced database of certifying bodies worldwide"
			tone="success"
		/>
		<StatTile
			title="Public registers"
			value="Verified"
			description="Public certificate registers cross-checked"
			tone="info"
		/>
		<StatTile
			title="Scope tracking"
			value="Valid"
			description="Certificate validity shown on every profile"
			tone="warning"
		/>
		<StatTile
			title="Methodology"
			value="Public"
			description="How we source and verify data"
			tone="primary"
		/>
	</div>
</section>

<!-- RESOURCES -->
<section class="space-y-8 sm:space-y-12 py-24 sm:py-32">
	<div class="animate-enter space-y-8 text-center">
		<h2 class="animate-enter text-2xl font-semibold tracking-tight sm:text-3xl">
			Resources for your halal business
		</h2>
		<p class="animate-enter max-w-3xl mx-auto text-base text-muted-foreground sm:text-lg">
			Everything you need to succeed in global halal markets — guides, tools, and intelligence.
		</p>
	</div>
	<div class="animate-enter grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
		<a
			href="/verify"
			class="animate-enter group relative block overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
		>
			<div class="space-y-3">
				<ShieldCheck
					class="size-6 text-success"
				/>
				<h3 class="text-lg font-semibold">Verify Certificate</h3>
				<p class="text-sm text-muted-foreground">
					Check certificate authenticity against issuing bodies
				</p>
			</div>
		</a>
		<a
			href="/tools/ingredient-checker"
			class="animate-enter group relative block overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
		>
			<div class="space-y-3">
				<FlaskConical
					class="size-6 text-warn"
				/>
				<h3 class="text-lg font-semibold">Ingredient Checker</h3>
				<p class="text-sm text-muted-foreground">
					AI verdict on halal, haram, mashbooh
				</p>
			</div>
		</a>
		<a
			href="/tools/certification-cost"
			class="animate-enter group relative block overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
		>
			<div class="space-y-3">
				<Calculator
					class="size-6 text-accent-purple"
				/>
				<h3 class="text-lg font-semibold">Certification Cost</h3>
				<p class="text-sm text-muted-foreground">
					Estimate registration fees by certifier
				</p>
			</div>
		</a>
		<a
			href="/tools/landed-cost"
			class="animate-enter group relative block overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
		>
			<div class="space-y-3">
				<Banknote
					class="size-6 text-accent-rose"
				/>
				<h3 class="text-lg font-semibold">Landed Cost</h3>
				<p class="text-sm text-muted-foreground">
					True per-unit cost with duties & fees
				</p>
			</div>
		</a>
		<a
			href="/tools/rfq-builder"
			class="animate-enter group relative block overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
		>
			<div class="space-y-3">
				<FileText
					class="size-6 text-info"
				/>
				<h3 class="text-lg font-semibold">RFQ Builder</h3>
				<p class="text-sm text-muted-foreground">
					Draft sourcing documents
				</p>
			</div>
		</a>
		<a
			href="/export-docs"
			class="animate-enter group relative block overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
		>
			<div class="space-y-3">
				<Newspaper
					class="size-6 text-primary"
				/>
				<h3 class="text-lg font-semibold">Export Docs</h3>
				<p class="text-sm text-muted-foreground">
					Templates for suppliers & importers
				</p>
			</div>
		</a>
	</div>
</section>

<!-- MARKET GUIDES -->
<section class="space-y-8 sm:space-y-12 py-24 sm:py-32">
	<div class="animate-enter space-y-8 text-center">
		<h2 class="animate-enter text-2xl font-semibold tracking-tight sm:text-3xl">
			Market entry intelligence
		</h2>
		<p class="animate-enter max-w-3xl mx-auto text-base text-muted-foreground sm:text-lg">
			Regional analysis of halal regulations, import requirements, and sourcing opportunities.
		</p>
	</div>
	<div class="animate-enter grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
		<a
			href="/market-guides"
			class="animate-enter group relative block overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
		>
			<div class="space-y-3">
				<Globe class="size-6" />
				<h3 class="text-lg font-semibold">All Market Guides</h3>
				<p class="text-sm text-muted-foreground">
					Country-by.Country entry requirements
				</p>
			</div>
		</a>
		<a
			href="/trade-shows"
			class="animate-enter group relative block overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
		>
			<div class="space-y-3">
				<Calendar class="size-6" />
				<h3 class="text-lg font-semibold">Trade Shows</h3>
				<p class="text-sm text-muted-foreground">
					Global HALAL exhibitions & events
				</p>
			</div>
		</a>
		<a
			href="/faq"
			class="animate-enter group relative block overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all hover:border-primary/50 hover:shadow-md"
		>
			<div class="space-y-3">
				<HelpCircle class="size-6" />
				<h3 class="text-lg font-semibold">FAQ</h3>
				<p class="text-sm text-muted-foreground">
					Common questions & answers
				</p>
			</div>
		</a>
	</div>
</section>
