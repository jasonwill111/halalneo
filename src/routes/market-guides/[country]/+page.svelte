<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Card, CardContent, CardTitle } from '#lib/components/ui/card/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import StatTile from '#lib/components/site/stat-tile.svelte';
	import GuideHero from '#lib/components/site/guide-hero.svelte';
	import { MANDATE_STATUSES, type MandateStatus } from '#lib/utils/mandate.js';
	import { cn } from '#lib/utils.js';
	import { COUNTRY_IMAGES } from '#lib/data/country-images.js';
	import FileCheckIcon from '@lucide/svelte/icons/file-check';
	import TrendingUpIcon from '@lucide/svelte/icons/trending-up';
	import ShieldAlertIcon from '@lucide/svelte/icons/shield-alert';
	import LightbulbIcon from '@lucide/svelte/icons/lightbulb';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';

	let { data } = $props();
	const guide = $derived(data.guide);

	const countryImages = COUNTRY_IMAGES;

	const status = $derived(MANDATE_STATUSES[guide.mandateStatus as MandateStatus]);

	const relatedGuides = $derived(
		(data.allGuides ?? [])
			.filter((g: any) => g.slug !== guide.slug)
			.filter((g: any) => g.region === guide.region || guide.mandateStatus === g.mandateStatus)
			.slice(0, 3)
	);

	function parsePop(s: string | null | undefined): { value: number; unit: string } | null {
		if (!s) return null;
		const match = String(s).replace(/,/g, '').match(/[\d.]+/);
		const value = match ? parseFloat(match[0]) : NaN;
		if (!Number.isFinite(value)) return null;
		const lower = String(s).toLowerCase();
		const unit = lower.includes('billion') ? 'b' : lower.includes('million') ? 'm' : lower.includes('thousand') ? 'k' : '';
		return { value, unit };
	}

	// Share of Muslims in total population — only when both are numeric with matching units
	const popShare = $derived.by(() => {
		const m = parsePop(guide.muslimPopulation);
		const t = parsePop(guide.totalPopulation);
		if (!m || !t || m.unit !== t.unit || t.value <= 0) return null;
		return Math.round((m.value / t.value) * 100);
	});
	const popHint = $derived(
		guide.totalPopulation
			? `${guide.totalPopulation} total${popShare !== null ? ` · ${popShare}% Muslim` : ''}`
			: undefined
	);

	const jsonLd = $derived(
		JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'Article',
			headline: `Halal Market Guide: ${guide.country}`,
			description: guide.summary,
			about: {
				'@type': 'Country',
				name: guide.country
			},
			publisher: {
				'@type': 'Organization',
				name: 'HalalNeo',
				url: 'https://halalneo.com'
			}
		})
	);
</script>

<svelte:head>
	<!-- Title + description render once via root layout from loader `seo`
	     (which prefers guide.metaTitle/metaDescription). -->
	{#if countryImages[guide.country]}
		<link rel="preload" as="image" href={countryImages[guide.country]} fetchpriority="high" />
	{/if}
	{@html `<script type="application/ld+json">${jsonLd}</script>`}
</svelte:head>

<Breadcrumb
	items={[
		{ label: 'Market Guides', href: '/market-guides' },
		{ label: guide.country, href: `/market-guides/${guide.slug}` }
	]}
/>

<section class="space-y-4 sm:space-y-8">
	{#if countryImages[guide.country]}
		<div class="relative overflow-hidden rounded-xl">
			<img
				src={countryImages[guide.country]}
				alt={guide.country}
				class="aspect-[5/2] w-full object-cover"
				loading="eager"
				fetchpriority="high"
				decoding="async"
				width="1200"
				height="480"
			/>
			<div class="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
		</div>
	{:else}
		<GuideHero
			country={guide.country}
			flag={guide.flag}
			region={guide.region}
			class="aspect-[5/2] w-full"
		/>
	{/if}
	<div class="max-w-3xl space-y-3">
		<div class="flex items-center gap-3">
			<span class="text-4xl">{guide.flag}</span>
			<div>
				<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">{guide.country}</h1>
				<p class="text-sm text-muted-foreground">{guide.region}</p>
			</div>
		</div>
		<div class="flex flex-wrap items-center gap-2">
			<span class={cn('rounded-full px-2 py-0.5 text-xs font-medium', status?.tone)}>
				{status?.label}{guide.mandatorySince ? ` — ${guide.mandatorySince}` : ''}
			</span>
		</div>
		<p class="text-base leading-relaxed text-foreground">{guide.summary}</p>
	</div>

	<div class="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
		<StatTile value={guide.muslimPopulation} label="Muslim population" tone="info" hint={popHint} />
		<StatTile value={guide.marketSizeUsd} label="Market size" tone="success" />
		<StatTile value={guide.processingTime} label="Processing time" tone="warn" />
		<StatTile value={guide.certificateValidity} label="Certificate validity" tone="accent-purple" />
	</div>

	<div class="grid gap-4 lg:grid-cols-2">
		<Card class="bg-card">
			<CardContent class="space-y-3 p-5">
				<div class="flex items-center gap-2">
					<FileCheckIcon class="size-4 text-primary" />
					<CardTitle class="text-base">Import Requirements</CardTitle>
				</div>
				<ul class="space-y-2">
					{#each guide.importRequirements as req (req)}
						<li class="flex items-start gap-2 text-sm text-foreground/80">
							<span class="mt-1.5 size-1.5 shrink-0 rounded-full bg-primary"></span>
							{req}
						</li>
					{/each}
				</ul>
			</CardContent>
		</Card>

		<Card class="bg-card">
			<CardContent class="space-y-3 p-5">
				<div class="flex items-center gap-2">
					<ShieldAlertIcon class="size-4 text-primary" />
					<CardTitle class="text-base">Certification Facts</CardTitle>
				</div>
				<dl class="space-y-2.5 text-sm">
					<div class="flex items-center justify-between gap-4">
						<dt class="text-xs text-muted-foreground">Standard basis</dt>
						<dd class="text-right font-medium">{guide.standardBasis}</dd>
					</div>
					<div class="flex items-center justify-between gap-4">
						<dt class="text-xs text-muted-foreground">Estimated cost</dt>
						<dd class="text-right font-medium">{guide.estimatedCostUsd}</dd>
					</div>
					<div class="flex items-start justify-between gap-4">
						<dt class="text-xs text-muted-foreground">Certifying bodies</dt>
						<dd class="flex flex-wrap justify-end gap-1">
							{#each guide.certifyingBodies ?? [] as cb (cb.slug)}
								{@const bySlug = cb.slug ? data.validCertifierIds?.includes(cb.slug) : false}
								{@const byName = data.certifierLinksByName?.[String(cb.name ?? '').trim().toLowerCase()]}
								{@const bodyId = bySlug ? cb.slug : byName}
								{#if bodyId}
									<a href={localizeHref(`/certifying-bodies/${bodyId}`)}>
										<Badge
											variant="secondary"
											class="text-[10px] transition-colors hover:text-primary hover:shadow-md"
											>{cb.name}</Badge
										>
									</a>
								{:else}
									<Badge variant="secondary" class="text-[10px]">{cb.name}</Badge>
								{/if}
							{/each}
						</dd>
					</div>
				</dl>
				<Button
					href={localizeHref('/certifying-bodies')}
					variant="outline"
					size="sm"
					class="w-full"
				>
					Browse All Certifying Bodies
					<ArrowRightIcon class="size-3" />
				</Button>
			</CardContent>
		</Card>
	</div>

	<div class="grid gap-4 lg:grid-cols-3">
		<Card class="bg-card">
			<CardContent class="space-y-3 p-5">
				<div class="flex items-center gap-2">
					<LightbulbIcon class="size-4 text-primary" />
					<CardTitle class="text-sm">Key Insights</CardTitle>
				</div>
				<ul class="space-y-2">
					{#each guide.keyInsights as insight (insight)}
						<li class="flex items-start gap-2 text-xs leading-relaxed text-foreground/80">
							<span class="mt-1.5 size-1 shrink-0 rounded-full bg-primary"></span>
							{insight}
						</li>
					{/each}
				</ul>
			</CardContent>
		</Card>

		<Card class="bg-card">
			<CardContent class="space-y-3 p-5">
				<div class="flex items-center gap-2">
					<TrendingUpIcon class="size-4 text-success" />
					<CardTitle class="text-sm">Opportunities</CardTitle>
				</div>
				<ul class="space-y-2">
					{#each guide.opportunities as opp (opp)}
						<li class="flex items-start gap-2 text-xs leading-relaxed text-foreground/80">
							<span class="mt-1.5 size-1 shrink-0 rounded-full bg-success"></span>
							{opp}
						</li>
					{/each}
				</ul>
			</CardContent>
		</Card>

		<Card class="bg-card">
			<CardContent class="space-y-3 p-5">
				<div class="flex items-center gap-2">
					<ShieldAlertIcon class="size-4 text-warn" />
					<CardTitle class="text-sm">Challenges</CardTitle>
				</div>
				<ul class="space-y-2">
					{#each guide.challenges as ch (ch)}
						<li class="flex items-start gap-2 text-xs leading-relaxed text-foreground/80">
							<span class="mt-1.5 size-1 shrink-0 rounded-full bg-warn"></span>
							{ch}
						</li>
					{/each}
				</ul>
			</CardContent>
		</Card>
	</div>

	{#if relatedGuides.length > 0}
		<div class="space-y-3">
			<h2 class="text-lg font-semibold tracking-tight">Related markets</h2>
			<div class="grid gap-3 sm:grid-cols-3">
				{#each relatedGuides as rel (rel.slug)}
					<Button
						href={localizeHref(`/market-guides/${rel.slug}`)}
						variant="outline"
						class="h-auto justify-between p-4 text-left"
					>
						<span class="flex items-center gap-2">
							<span class="text-lg">{rel.flag}</span>
							<span>
								<span class="block text-sm font-medium">{rel.country}</span>
								<span class="block text-[10px] text-muted-foreground">{rel.region}</span>
							</span>
						</span>
						<ArrowRightIcon class="size-4 shrink-0 text-muted-foreground" />
					</Button>
				{/each}
			</div>
		</div>
	{/if}
</section>
