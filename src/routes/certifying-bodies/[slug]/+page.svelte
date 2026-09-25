<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Card, CardContent, CardHeader, CardTitle } from '#lib/components/ui/card/index.js';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import GlobeIcon from '@lucide/svelte/icons/globe';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import RelatedLinks from '#lib/components/site/related-links.svelte';
	import ExternalLink from '#lib/components/site/external-link.svelte';
	import CertificationSeal from '#lib/components/site/certification-seal.svelte';
	import {
		Empty,
		EmptyHeader,
		EmptyTitle,
		EmptyDescription,
		EmptyContent
	} from '#lib/components/ui/empty/index.js';
	import BrandedEmptyMedia from '#lib/components/site/branded-empty-media.svelte';
	import { getRegion, regionBadgeClass } from '#lib/utils/region.js';
	import {
		RECOGNITION_DATA,
		recognitionStatusClasses,
		recognitionStatusLabel
	} from '#lib/data/recognition.js';

	let { data } = $props();

	interface RelatedGuide {
		country: string;
		region?: string | null;
		slug: string;
	}

	const body = $derived(data.item);
	const slug = $derived(data.slug);

	const baseUrl = 'https://halalneo.com';

	const certBodySchema = $derived(
		body
			? {
					'@context': 'https://schema.org',
					'@type': 'Organization',
					name: body.name,
					description: body.description ?? '',
					url: `${baseUrl}/certifying-bodies/${data.slug}`,
					address: body.country
						? { '@type': 'PostalAddress', addressCountry: body.country }
						: undefined
				}
			: null
	);

	const recognitionEntries = $derived(
		RECOGNITION_DATA[slug] ?? RECOGNITION_DATA[body?.id ?? ''] ?? []
	);
</script>

<svelte:head>
	<!-- Title + description render once via root layout from loader `seo`
	     (which prefers body.metaTitle/metaDescription). -->
	{#if certBodySchema}
		{@html `\u003cscript type="application/ld+json">${JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'Organization',
			name: body?.name,
			description: body?.description ?? '',
			url: `${baseUrl}/certifying-bodies/${data.slug}`,
			image: 'https://halalneo.com/brand/og-default.png',
			address: body?.country
				? { '@type': 'PostalAddress', addressCountry: body.country }
				: undefined,
			parentOrganization: { '@type': 'Organization', name: 'HalalNeo' },
			...(body?.website
				? { sameAs: [body.website, `${baseUrl}/certifying-bodies/${data.slug}`] }
				: {})
		})}\u003c/script>`}
	{/if}
</svelte:head>

<div class="mx-auto max-w-6xl py-8">
	{#if body}
		<Breadcrumb
			items={[
				{ label: 'Certifying Bodies', href: '/certifying-bodies' },
				{ label: body.name ?? 'Certifying Body' }
			]}
		/>
		<div class="grid gap-4 sm:gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
			<main class="min-w-0 space-y-4 sm:space-y-6">
				<header class="space-y-3">
					<div class="flex min-w-0 items-center gap-3">
						<CertificationSeal name={body.name} status="certified" showName class="shrink-0" />
						<div class="min-w-0 space-y-1">
							<h1 class="text-xl font-bold tracking-tight break-words sm:text-2xl">{body.name}</h1>
							<p class="text-xs text-muted-foreground sm:text-sm">{body.country}</p>
						</div>
					</div>
					<div class="flex flex-wrap gap-2">
						<Badge variant="secondary">{body.standard}</Badge>
						<Badge
							variant="outline"
							class="text-sm font-semibold {regionBadgeClass(getRegion(body.country))}"
							>{getRegion(body.country)}</Badge
						>
					</div>
					<div class="flex min-w-0 flex-wrap items-center gap-2">
						<ExternalLink href={body.website ?? ''} label="Official website" />
						<Button
							href={localizeHref('/verify')}
							variant="outline"
							size="sm"
							class="h-7 min-w-0 text-xs"
						>
							Verify a certificate
						</Button>
					</div>
				</header>

				<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<Card>
						<CardHeader>
							<CardTitle>About</CardTitle>
						</CardHeader>
						<CardContent class="space-y-3">
							{#if body.description}
								<p class="text-sm text-foreground/80">{body.description}</p>
							{:else}
								<p class="text-sm text-foreground/80">
									{body.name} is the recognized halal certification authority in {body.country},
									operating under the {body.standard} standard. The body certifies food, beverage, pharmaceutical,
									and medical device products for domestic and international markets.
								</p>
							{/if}
							<div class="grid grid-cols-2 gap-4 text-sm">
								<div>
									<p class="text-xs text-muted-foreground sm:text-sm">Country</p>
									<p class="font-medium">{body.country}</p>
								</div>
								<div>
									<p class="text-xs text-muted-foreground sm:text-sm">Region</p>
									<p class="font-medium">{getRegion(body.country)}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Recognition status</CardTitle>
						</CardHeader>
						<CardContent class="space-y-3">
							<div class="space-y-1.5 text-sm">
								<div class="flex items-center justify-between">
									<span class="text-muted-foreground">Standard</span>
									<span class="font-medium">{body.standard}</span>
								</div>
								<div class="flex items-center justify-between">
									<span class="text-muted-foreground">Region</span>
									<span class="font-medium">{getRegion(body.country)}</span>
								</div>
								<div class="flex items-center justify-between">
									<span class="text-muted-foreground">Active suppliers</span>
									<span class="font-medium">{(data.certifiedSuppliers ?? []).length}</span>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{#if recognitionEntries.length > 0}
					<section class="space-y-4">
						<div>
							<h2 class="text-sm font-semibold sm:text-base">Recognition status</h2>
							<p class="mt-1 text-sm text-muted-foreground">
								Countries and jurisdictions that recognise {body.name} halal certification.
							</p>
						</div>
						<div class="overflow-x-auto pb-1">
							<div class="flex min-w-max gap-2">
								{#each recognitionEntries as entry (entry.country)}
									<Badge
										variant="outline"
										class={`gap-1.5 ${recognitionStatusClasses(entry.status)}`}
									>
										<span
											class="size-1.5 rounded-full {entry.status === 'recognised'
												? 'bg-success'
												: entry.status === 'mutual'
													? 'bg-warn'
													: 'bg-info'}"
										></span>
										{entry.country}
										<span class="text-2xs opacity-70">· {recognitionStatusLabel(entry.status)}</span
										>
									</Badge>
								{/each}
							</div>
						</div>
					</section>
				{/if}

				{#if (data.certificationTypes ?? []).length > 0}
					<section class="space-y-4">
						<h2 class="text-sm font-semibold sm:text-base">Certification types</h2>
						<div class="flex flex-wrap gap-2">
							{#each data.certificationTypes as cat (cat.slug)}
								<Badge variant="secondary">{cat.name}</Badge>
							{/each}
						</div>
					</section>
				{/if}

				<section class="space-y-4">
					<h2 class="text-sm font-semibold sm:text-base">Certified suppliers</h2>
					{#if (data.certifiedSuppliers ?? []).length > 0}
						<div class="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3">
							{#each data.certifiedSuppliers as supplier (supplier.slug)}
								<Card class="min-w-0">
									<CardContent class="flex min-w-0 items-center justify-between gap-2 p-2.5 sm:p-3">
										<div class="min-w-0 space-y-1">
											<p class="truncate font-medium">{supplier.name}</p>
											<p class="truncate text-xs text-muted-foreground">{supplier.country}</p>
										</div>
										<Button
											href={localizeHref(`/supplier/${supplier.slug}`)}
											variant="ghost"
											size="sm"
										>
											<ArrowUpRight class="size-4"></ArrowUpRight>
										</Button>
									</CardContent>
								</Card>
							{/each}
						</div>
					{:else}
						<p class="text-xs text-muted-foreground sm:text-sm">
							No certified suppliers listed yet.
						</p>
					{/if}
				</section>

				<RelatedLinks
					title="Related market guides"
					items={((data.relatedGuides ?? []) as RelatedGuide[]).map((g) => ({
						label: g.country,
						description: g.region ?? '',
						href: `/market-guides/${g.slug}`
					}))}
				/>
			</main>

			<aside class="min-w-0 space-y-4 lg:shrink-0">
				<div class="space-y-4 lg:sticky lg:top-24 lg:z-10">
					<Card class="bg-card">
						<CardContent class="space-y-4 p-4 sm:p-5">
							<div class="space-y-3">
								<h4 class="text-sm font-semibold">Contact & Links</h4>
								{#if body.website}
									<a
										href={body.website}
										target="_blank"
										rel="noopener"
										class="block text-xs break-all text-foreground/80 hover:text-primary"
									>
										{body.website.replace(/^https?:\/\//, '')}
									</a>
								{:else}
									<p class="text-xs text-muted-foreground">No official website listed.</p>
								{/if}
								<Button
									href={localizeHref('/verify')}
									variant="outline"
									size="sm"
									class="h-7 w-full min-w-0 text-xs"
								>
									Verify a certificate
								</Button>
							</div>
						</CardContent>
					</Card>

					{#if recognitionEntries.length > 0}
						<Card class="bg-card">
							<CardContent class="space-y-3 p-5">
								<h4 class="text-sm font-semibold">Recognition</h4>
								<p class="line-clamp-2 text-xs text-muted-foreground">
									Recognized in {recognitionEntries.length} countries/regions
								</p>
								<div class="flex flex-wrap gap-1.5">
									{#each recognitionEntries.slice(0, 4) as entry (entry.country)}
										<Badge variant="outline" class="gap-1 text-2xs">
											{entry.country}
										</Badge>
									{/each}
									{#if recognitionEntries.length > 4}
										<Badge variant="outline" class="text-2xs">
											+{recognitionEntries.length - 4} more
										</Badge>
									{/if}
								</div>
							</CardContent>
						</Card>
					{/if}

					<Card class="bg-card">
						<CardContent class="space-y-4 p-5">
							<div class="space-y-2">
								<h4 class="text-sm font-semibold">Related Resources</h4>
								{#if data.relatedGuides && data.relatedGuides.length > 0}
									<div class="space-y-2">
										{#each data.relatedGuides.slice(0, 3) as g (g.slug)}
											<a href={localizeHref(`/market-guides/${g.slug}`)}>
												<h5 class="text-xs font-medium group-hover:text-primary">{g.country}</h5>
												<p class="text-2xs text-muted-foreground">{g.region}</p>
											</a>
										{/each}
									</div>
								{:else}
									<p class="text-xs text-muted-foreground">No related guides yet.</p>
								{/if}
							</div>
							<div class="space-y-2">
								<Button
									href={localizeHref('/certifying-bodies')}
									variant="outline"
									size="sm"
									class="w-full"
								>
									All Certifying Bodies
								</Button>
							</div>
						</CardContent>
					</Card>
				</div>
			</aside>
		</div>
	{:else}
		<Empty class="min-h-[50vh] border border-dashed">
			<EmptyHeader>
				<BrandedEmptyMedia><GlobeIcon class="size-6 text-muted-foreground" /></BrandedEmptyMedia>
				<EmptyTitle>Certifying body not found</EmptyTitle>
				<EmptyDescription>This certifying body profile is not available right now.</EmptyDescription
				>
			</EmptyHeader>
			<EmptyContent>
				<Button href={localizeHref('/certifying-bodies')} size="sm">Browse certifying bodies</Button
				>
			</EmptyContent>
		</Empty>
	{/if}
</div>
