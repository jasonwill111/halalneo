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
	import {
		costTiers,
		classifyRequirement,
		PHASE_TONES,
		recognitionForGuide,
		relatedPosts,
		upcomingShowsInMarket,
		storiesInMarket,
		keyLinks,
		winPlays,
		type GuideShow
	} from '#lib/data/guide-playbook.js';
	import { recognitionStatusClasses, recognitionStatusLabel } from '#lib/data/recognition.js';
	import FileCheckIcon from '@lucide/svelte/icons/file-check';
	import TrendingUpIcon from '@lucide/svelte/icons/trending-up';
	import ShieldAlertIcon from '@lucide/svelte/icons/shield-alert';
	import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';
	import LightbulbIcon from '@lucide/svelte/icons/lightbulb';
	import ArrowRightIcon from '@lucide/svelte/icons/arrow-right';
	import CalculatorIcon from '@lucide/svelte/icons/calculator';
	import Link2Icon from '@lucide/svelte/icons/link-2';
	import NewspaperIcon from '@lucide/svelte/icons/newspaper';
	import TrophyIcon from '@lucide/svelte/icons/trophy';
	import CalendarDaysIcon from '@lucide/svelte/icons/calendar-days';
	import ExternalLinkIcon from '@lucide/svelte/icons/external-link';

	let { data } = $props();
	const guide = $derived(data.guide);

	// ---- Playbook derivations (all computed from the guide row + shared data)
	const bodySlugs = $derived(
		((guide.certifyingBodies ?? []) as { slug?: string }[])
			.map((b) => String(b.slug ?? '').trim())
			.filter(Boolean)
	);
	const tiers = $derived(
		costTiers(guide.estimatedCostUsd, guide.processingTime, guide.certificateValidity)
	);
	let activeTier = $state('growth');
	const activeTierData = $derived(
		(tiers ?? []).find((t) => t.id === activeTier) ?? (tiers ?? [])[0]
	);
	const steps = $derived(
		((guide.importRequirements ?? []) as string[]).map((req) => ({
			text: req,
			phase: classifyRequirement(req)
		}))
	);
	const recognition = $derived(recognitionForGuide(guide.country, bodySlugs));
	const signals = $derived(relatedPosts(guide.slug, guide.country, data.posts ?? []));
	const marketShows = $derived(
		upcomingShowsInMarket(guide.country, (data.shows ?? []) as GuideShow[])
	);
	const marketStories = $derived(storiesInMarket(guide.country, data.stories ?? []));
	const links = keyLinks();
	const plays = $derived(winPlays(guide.opportunities ?? undefined));

	const countryImages = COUNTRY_IMAGES;

	const status = $derived(MANDATE_STATUSES[guide.mandateStatus as MandateStatus]);

	interface GuideSummaryRow {
		slug: string;
		region?: string | null;
		mandateStatus?: string | null;
	}

	const relatedGuides = $derived(
		(data.allGuides ?? [])
			.filter((g: GuideSummaryRow) => g.slug !== guide.slug)
			.filter(
				(g: GuideSummaryRow) => g.region === guide.region || guide.mandateStatus === g.mandateStatus
			)
			.slice(0, 3)
	);

	function parsePop(s: string | null | undefined): { value: number; unit: string } | null {
		if (!s) return null;
		const match = String(s)
			.replace(/,/g, '')
			.match(/[\d.]+/);
		const value = match ? parseFloat(match[0]) : NaN;
		if (!Number.isFinite(value)) return null;
		const lower = String(s).toLowerCase();
		const unit = lower.includes('billion')
			? 'b'
			: lower.includes('million')
				? 'm'
				: lower.includes('thousand')
					? 'k'
					: '';
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
			image: `https://halalneo.com/api/media/og-certifiers.png`,
			about: {
				'@type': 'Country',
				name: guide.country
			},
			publisher: {
				'@type': 'Organization',
				name: 'HalalNeo',
				url: 'https://halalneo.com',
				logo: {
					'@type': 'ImageObject',
					url: 'https://halalneo.com/api/media/og-default.png',
					width: 600,
					height: 600
				}
			},
			mainEntityOfPage: {
				'@type': 'WebPage',
				'@id': `https://halalneo.com/market-guides/${guide.slug}`
			},
			datePublished: (() => {
				if (!guide.mandatorySince) return new Date().toISOString();
				const parsed = new Date(guide.mandatorySince);
				return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
			})(),
			language: 'en'
		})
	);
</script>

<svelte:head>
	<!-- Title + description render once via root layout from loader `seo`
	     (which prefers guide.metaTitle/metaDescription). -->
	{#if countryImages[guide.country]}
		<link rel="preload" as="image" href={countryImages[guide.country]} fetchpriority="high" />
	{/if}
	{@html `\u003cscript type="application/ld+json">${jsonLd}\u003c/script>`}
</svelte:head>

<Breadcrumb
	items={[
		{ label: 'Market Guides', href: '/market-guides' },
		{ label: guide.country, href: `/market-guides/${guide.slug}` }
	]}
/>

<div class="mx-auto max-w-6xl space-y-6 py-8">
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
			flag={guide.flag ?? ''}
			region={guide.region ?? ''}
			class="aspect-[5/2] w-full"
		/>
	{/if}

	<div class="space-y-6">
		<div class="space-y-3">
			<div class="flex items-center gap-3">
				<span class="text-2xl sm:text-4xl">{guide.flag}</span>
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
			<p class="text-sm leading-relaxed text-foreground sm:text-base">{guide.summary}</p>
		</div>

		<div class="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
			<StatTile
				value={guide.muslimPopulation ?? ''}
				label="Muslim population"
				tone="info"
				hint={popHint}
			/>
			<StatTile value={guide.marketSizeUsd ?? ''} label="Market size" tone="success" />
			<StatTile value={guide.processingTime ?? ''} label="Processing time" tone="warn" />
			<StatTile
				value={guide.certificateValidity ?? ''}
				label="Certificate validity"
				tone="accent-purple"
			/>
		</div>

		<div class="grid gap-4 lg:grid-cols-2">
			<Card class="bg-card">
				<CardContent class="space-y-3 p-5">
					<div class="flex items-center gap-2">
						<FileCheckIcon class="size-4 text-primary" />
						<CardTitle class="text-sm sm:text-base">Market entry steps</CardTitle>
					</div>
					<ol class="space-y-0">
						{#each steps as step, i (step.text)}
							<li class="relative flex gap-3 pb-4 last:pb-0">
								{#if i < steps.length - 1}
									<span
										class="absolute top-7 left-[13px] h-[calc(100%-1.75rem)] w-px bg-border"
										aria-hidden="true"
									></span>
								{/if}
								<span
									class="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary ring-1 ring-foreground/10"
								>
									{i + 1}
								</span>
								<div class="min-w-0 space-y-1">
									<span
										class={`inline-block rounded-full px-1.5 py-0.5 text-2xs font-medium ${PHASE_TONES[step.phase]}`}
									>
										{step.phase}
									</span>
									<p class="text-sm leading-relaxed text-foreground/80">{step.text}</p>
								</div>
							</li>
						{/each}
					</ol>
					{#if guide.challenges?.[0]}
						<p class="rounded-lg bg-warn/10 px-3 py-2 text-xs leading-relaxed text-warn">
							Watch out: {guide.challenges?.[0]}
						</p>
					{/if}
				</CardContent>
			</Card>

			<Card class="bg-card">
				<CardContent class="space-y-3 p-5">
					<div class="flex items-center gap-2">
						<ShieldAlertIcon class="size-4 text-primary" />
						<CardTitle class="text-sm sm:text-base">Certification Facts</CardTitle>
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
									{@const byName =
										data.certifierLinksByName?.[
											String(cb.name ?? '')
												.trim()
												.toLowerCase()
										]}
									{@const bodyId = bySlug ? cb.slug : byName}
									{#if bodyId}
										<a href={localizeHref(`/certifying-bodies/${bodyId}`)}>
											<Badge
												variant="secondary"
												class="text-2xs transition-colors hover:text-primary hover:shadow-md"
												>{cb.name}</Badge
											>
										</a>
									{:else}
										<Badge variant="secondary" class="text-2xs">{cb.name}</Badge>
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

		{#if tiers && activeTierData}
			<Card class="bg-card">
				<CardContent class="space-y-3 p-5">
					<div class="flex flex-wrap items-center justify-between gap-2">
						<div class="flex items-center gap-2">
							<CalculatorIcon class="size-4 text-primary" />
							<CardTitle class="text-sm sm:text-base">Cost estimator</CardTitle>
						</div>
						<div class="flex gap-1.5" role="group" aria-label="Business size">
							{#each tiers as tier (tier.id)}
								<Button
									variant={activeTier === tier.id ? 'default' : 'outline'}
									size="sm"
									class="h-7 text-xs"
									onclick={() => (activeTier = tier.id)}
									aria-pressed={activeTier === tier.id}
								>
									{tier.id === 'sme' ? 'SME' : tier.id === 'growth' ? 'Growth' : 'Enterprise'}
								</Button>
							{/each}
						</div>
					</div>
					<div class="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
						<StatTile value={activeTierData.range} label={activeTierData.label} tone="success" />
						<StatTile value={guide.processingTime ?? ''} label="Processing time" tone="warn" />
						<StatTile
							value={guide.certificateValidity ?? ''}
							label="Certificate validity"
							tone="accent-purple"
						/>
					</div>
					<p class="text-xs leading-relaxed text-muted-foreground">
						{activeTierData.note} Guide figure: {guide.estimatedCostUsd}
					</p>
					<Button
						href={localizeHref('/tools/certification-cost')}
						variant="outline"
						size="sm"
						class="w-full sm:w-auto"
					>
						Open full cost estimator
						<ArrowRightIcon class="size-3" />
					</Button>
				</CardContent>
			</Card>
		{/if}

		{#if recognition.outbound.length > 0 || recognition.inbound.length > 0}
			<Card class="bg-card">
				<CardContent class="space-y-4 p-5">
					<div class="flex items-center gap-2">
						<ShieldCheckIcon class="size-4 text-primary" />
						<CardTitle class="text-sm sm:text-base">Will this certificate travel?</CardTitle>
					</div>
					<div class="grid grid-cols-2 gap-3 sm:grid-cols-2">
						<div class="space-y-2">
							<h3 class="text-xs font-semibold text-foreground">
								This market's bodies, accepted in
							</h3>
							{#if recognition.outbound.length === 0}
								<p class="text-xs text-muted-foreground">No mapped recognition yet.</p>
							{:else}
								<ul class="space-y-1.5">
									{#each recognition.outbound.slice(0, 8) as row (row.bodySlug + row.country)}
										<li class="flex items-center justify-between gap-2 text-xs">
											<span class="truncate text-foreground/80">
												<span class="font-medium">{row.bodyName}</span> → {row.country}
											</span>
											<span
												class={`shrink-0 rounded-full border px-1.5 py-0.5 text-2xs font-medium ${recognitionStatusClasses(row.status)}`}
											>
												{recognitionStatusLabel(row.status)}
											</span>
										</li>
									{/each}
								</ul>
								{#if recognition.outbound.length > 8}
									<p class="text-2xs-plus text-muted-foreground">
										+{recognition.outbound.length - 8} more markets
									</p>
								{/if}
							{/if}
						</div>
						<div class="space-y-2">
							<h3 class="text-xs font-semibold text-foreground">
								Foreign bodies this market accepts
							</h3>
							{#if recognition.inbound.length === 0}
								<p class="text-xs text-muted-foreground">No mapped recognition yet.</p>
							{:else}
								<ul class="space-y-1.5">
									{#each recognition.inbound.slice(0, 8) as row (row.bodySlug + row.country)}
										<li class="flex items-center justify-between gap-2 text-xs">
											<span class="truncate font-medium text-foreground/80">{row.bodyName}</span>
											<span
												class={`shrink-0 rounded-full border px-1.5 py-0.5 text-2xs font-medium ${recognitionStatusClasses(row.status)}`}
											>
												{recognitionStatusLabel(row.status)}
											</span>
										</li>
									{/each}
								</ul>
								{#if recognition.inbound.length > 8}
									<p class="text-2xs-plus text-muted-foreground">
										+{recognition.inbound.length - 8} more bodies
									</p>
								{/if}
							{/if}
						</div>
					</div>
					<p class="text-2xs-plus leading-relaxed text-muted-foreground">
						Statuses are indicative — confirm with the issuing body before shipping.
					</p>
				</CardContent>
			</Card>
		{/if}

		<div class="grid gap-4 lg:grid-cols-3">
			<Card class="bg-card">
				<CardContent class="space-y-3 p-5">
					<div class="flex items-center gap-2">
						<LightbulbIcon class="size-4 text-primary" />
						<CardTitle class="text-sm">Key Insights</CardTitle>
					</div>
					<ul class="space-y-2">
						{#each guide.keyInsights ?? [] as insight (insight)}
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
						{#each guide.opportunities ?? [] as opp (opp)}
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
						{#each guide.challenges ?? [] as ch (ch)}
							<li class="flex items-start gap-2 text-xs leading-relaxed text-foreground/80">
								<span class="mt-1.5 size-1 shrink-0 rounded-full bg-warn"></span>
								{ch}
							</li>
						{/each}
					</ul>
				</CardContent>
			</Card>
		</div>
	</div>

	<div class="grid gap-6 lg:grid-cols-[1fr_320px]">
		<main class="space-y-6">
			<div class="grid gap-4 lg:grid-cols-2">
				<Card class="bg-card">
					<CardContent class="space-y-3 p-5">
						<div class="flex items-center gap-2">
							<NewspaperIcon class="size-4 text-primary" />
							<CardTitle class="text-sm">Regulatory signals</CardTitle>
						</div>
						{#if signals.length === 0 && marketShows.length === 0}
							<p class="text-xs leading-relaxed text-muted-foreground">
								No tagged updates for this market yet — the latest industry analysis is on the blog.
							</p>
						{:else}
							<ul class="space-y-2.5">
								{#each signals as post (post.slug)}
									<li>
										<a href={localizeHref(`/blog/${post.slug}`)} class="group block">
											<p
												class="line-clamp-2 text-xs leading-snug font-medium transition-colors group-hover:text-primary"
											>
												{post.title}
											</p>
										</a>
									</li>
								{/each}
								{#each marketShows as show (show.id)}
									<li class="flex items-start gap-2 text-xs text-foreground/80">
										<CalendarDaysIcon class="mt-0.5 size-3.5 shrink-0 text-info" />
										<span>
											<a
												href={localizeHref(`/trade-shows/${show.id}`)}
												class="font-medium hover:text-primary"
											>
												{show.name}
											</a>
											<span class="text-muted-foreground"> · {show.city}, {show.country}</span>
										</span>
									</li>
								{/each}
							</ul>
						{/if}
						<div class="flex flex-wrap gap-1.5">
							<Button href={localizeHref('/blog')} variant="outline" size="sm" class="h-7 text-xs">
								All analysis
							</Button>
							<Button
								href={localizeHref('/trade-shows')}
								variant="outline"
								size="sm"
								class="h-7 text-xs"
							>
								Trade shows
							</Button>
						</div>
					</CardContent>
				</Card>

				<Card class="bg-card">
					<CardContent class="space-y-3 p-5">
						<div class="flex items-center gap-2">
							<TrophyIcon class="size-4 text-success" />
							<CardTitle class="text-sm">How exporters win here</CardTitle>
						</div>
						{#if plays.length === 0 && marketStories.length === 0}
							<p class="text-xs leading-relaxed text-muted-foreground">
								No recorded wins for this market yet — be the first story we feature.
							</p>
						{:else}
							<ul class="space-y-2">
								{#each plays as play (play)}
									<li class="flex items-start gap-2 text-xs leading-relaxed text-foreground/80">
										<span class="mt-1.5 size-1 shrink-0 rounded-full bg-success"></span>
										{play}
									</li>
								{/each}
								{#each marketStories as story (story.slug)}
									<li>
										<a
											href={localizeHref(`/success-stories/${story.slug}`)}
											class="group block rounded-lg bg-muted/50 px-2.5 py-2 ring-1 ring-transparent transition-all hover:ring-foreground/10"
										>
											<p
												class="line-clamp-2 text-xs leading-snug font-medium transition-colors group-hover:text-primary"
											>
												{story.title}
											</p>
											{#if story.dealValue}
												<p class="mt-0.5 text-2xs font-semibold text-success">{story.dealValue}</p>
											{/if}
										</a>
									</li>
								{/each}
							</ul>
						{/if}
						<div class="flex flex-wrap gap-1.5">
							<Button
								href={localizeHref('/tools/rfq-builder')}
								variant="outline"
								size="sm"
								class="h-7 text-xs"
							>
								Build an RFQ
							</Button>
							<Button
								href={localizeHref('/success-stories')}
								variant="outline"
								size="sm"
								class="h-7 text-xs"
							>
								All stories
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		</main>

		<aside class="hidden shrink-0 lg:block">
			<div class="sticky top-24 z-10 space-y-4">
				<Card class="bg-card">
					<CardContent class="space-y-3 p-5">
						<div class="flex items-center gap-2">
							<Link2Icon class="size-4 text-primary" />
							<CardTitle class="text-sm">Key links</CardTitle>
						</div>
						<ul class="space-y-1.5">
							{#each links as link (link.href)}
								<li>
									{#if link.external}
										<a
											href={link.href}
											target="_blank"
											rel="noopener"
											class="group flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs ring-1 ring-transparent transition-all hover:bg-muted hover:ring-foreground/10"
										>
											<span>
												<span class="block font-medium transition-colors group-hover:text-primary"
													>{link.label}</span
												>
												<span class="block text-2xs text-muted-foreground">{link.description}</span>
											</span>
											<ExternalLinkIcon class="size-3.5 shrink-0 text-muted-foreground" />
										</a>
									{:else}
										<a
											href={localizeHref(link.href)}
											class="group flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs ring-1 ring-transparent transition-all hover:bg-muted hover:ring-foreground/10"
										>
											<span>
												<span class="block font-medium transition-colors group-hover:text-primary"
													>{link.label}</span
												>
												<span class="block text-2xs text-muted-foreground">{link.description}</span>
											</span>
											<ArrowRightIcon
												class="size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
											/>
										</a>
									{/if}
								</li>
							{/each}
						</ul>
					</CardContent>
				</Card>

				{#if relatedGuides.length > 0}
					<Card class="bg-card">
						<CardContent class="space-y-3 p-5">
							<div class="flex items-center gap-2">
								<TrophyIcon class="size-4 text-success" />
								<CardTitle class="text-sm">Related markets</CardTitle>
							</div>
							<div class="space-y-2">
								{#each relatedGuides as rel (rel.slug)}
									<Button
										href={localizeHref(`/market-guides/${rel.slug}`)}
										variant="outline"
										class="h-auto w-full justify-between p-4 text-left"
									>
										<span class="flex items-center gap-2">
											<span class="text-lg">{rel.flag}</span>
											<span>
												<span class="block text-sm font-medium">{rel.country}</span>
												<span class="block text-2xs text-muted-foreground">{rel.region}</span>
											</span>
										</span>
										<ArrowRightIcon class="size-4 shrink-0 text-muted-foreground" />
									</Button>
								{/each}
							</div>
						</CardContent>
					</Card>
				{/if}

				<Card class="border-primary/20 bg-primary/5">
					<CardContent class="space-y-3 p-5">
						<h4 class="text-sm font-semibold">Need more help?</h4>
						<p class="text-xs text-muted-foreground">
							Connect with experts or get a cost estimate.
						</p>
						<Button
							href={localizeHref('/tools/certification-cost')}
							variant="default"
							size="sm"
							class="w-full"
						>
							Calculate Costs
						</Button>
						<Button href={localizeHref('/contact')} variant="outline" size="sm" class="w-full">
							Contact Us
						</Button>
					</CardContent>
				</Card>
			</div>
		</aside>
	</div>
</div>
