<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Card, CardContent, CardHeader, CardTitle } from '#lib/components/ui/card/index.js';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import RelatedLinks from '#lib/components/site/related-links.svelte';
	import ExternalLink from '#lib/components/site/external-link.svelte';
	import { getRegion, regionBadgeClass } from '#lib/utils/region.js';
	import {
		RECOGNITION_DATA,
		recognitionStatusClasses,
		recognitionStatusLabel
	} from '#lib/data/recognition.js';

	let { data } = $props();

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

	const breadcrumbSchema = $derived({
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
			{
				'@type': 'ListItem',
				position: 2,
				name: 'Certifying Bodies',
				item: `${baseUrl}/certifying-bodies`
			},
			{
				'@type': 'ListItem',
				position: 3,
				name: body?.name ?? '',
				item: `${baseUrl}/certifying-bodies/${data.slug}`
			}
		]
	});

	const recognitionEntries = $derived(
		RECOGNITION_DATA[slug] ?? RECOGNITION_DATA[body?.id] ?? []
	);
</script>

<svelte:head>
	<title>{body?.name ?? 'Certifying Body'} — HalalNeo</title>
	<meta
		name="description"
		content={body?.description?.slice(0, 160) ??
			`${body?.name ?? 'Halal certifying body'} — recognized halal certification authority in ${body?.country ?? ''}.`}
	/>
	{#if certBodySchema}
		{@html `<script type="application/ld+json">${JSON.stringify(certBodySchema)}</script>`}
	{/if}
	{@html `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`}
</svelte:head>

<div class="py-8">
	{#if body}
		<Breadcrumb
			items={[
				{ label: 'Certifying Bodies', href: '/certifying-bodies' },
				{ label: body.name ?? 'Certifying Body' }
			]}
		/>
		<article class="space-y-4 sm:space-y-8">
			<header class="space-y-3">
				<div class="flex items-center gap-3">
					<div
						class="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-base font-semibold text-primary"
					>
						{body.name.slice(0, 2).toUpperCase()}
					</div>
					<div class="space-y-1">
						<h1 class="text-3xl font-bold tracking-tight">{body.name}</h1>
						<p class="text-muted-foreground">{body.country}</p>
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
				<div class="flex flex-wrap items-center gap-2">
					<ExternalLink href={body.website} label="Official website" />
					<a
						href={localizeHref('/verify')}
						class="text-xs font-medium text-primary underline-offset-4 hover:underline"
					>
						Verify a certificate →
					</a>
				</div>
			</header>

			<div class="grid gap-4 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>About</CardTitle>
					</CardHeader>
					<CardContent class="space-y-3">
						<p class="text-sm text-foreground/80">
							{body.name} is the recognized halal certification authority in {body.country},
							operating under the {body.standard} standard. The body certifies food, beverage, pharmaceutical,
							and medical device products for domestic and international markets.
						</p>
						<div class="grid grid-cols-2 gap-4 text-sm">
							<div>
								<p class="text-muted-foreground">Country</p>
								<p class="font-medium">{body.country}</p>
							</div>
							<div>
								<p class="text-muted-foreground">Region</p>
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
						<h2 class="text-xl font-semibold">Recognition status</h2>
						<p class="mt-1 text-sm text-muted-foreground">
							Countries and jurisdictions that recognise {body.name} halal certification.
						</p>
					</div>
					<div class="flex flex-wrap gap-2">
						{#each recognitionEntries as entry}
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
								<span class="text-[10px] opacity-70">· {recognitionStatusLabel(entry.status)}</span>
							</Badge>
						{/each}
					</div>
				</section>
			{/if}

			{#if (data.certificationTypes ?? []).length > 0}
				<section class="space-y-4">
					<h2 class="text-xl font-semibold">Certification types</h2>
					<div class="flex flex-wrap gap-2">
						{#each data.certificationTypes as cat}
							<Badge variant="secondary">{cat.name}</Badge>
						{/each}
					</div>
				</section>
			{/if}

			<section class="space-y-4">
				<h2 class="text-xl font-semibold">Certified suppliers</h2>
				{#if (data.certifiedSuppliers ?? []).length > 0}
					<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
						{#each data.certifiedSuppliers as supplier}
							<Card>
								<CardContent class="flex items-center justify-between p-4">
									<div class="space-y-1">
										<p class="font-medium">{supplier.name}</p>
										<p class="text-sm text-muted-foreground">{supplier.country}</p>
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
					<p class="text-muted-foreground">No certified suppliers listed yet.</p>
				{/if}
			</section>

			<RelatedLinks
				title="Related market guides"
				items={(data.relatedGuides ?? []).map((g: any) => ({
					label: g.country,
					description: g.region,
					href: `/market-guides/${g.slug}`
				}))}
			/>
		</article>
	{:else}
		<div class="flex min-h-[50vh] items-center justify-center">
			<div class="space-y-4 text-center">
				<p class="text-lg text-muted-foreground">Certifying body details coming soon.</p>
				<Button href={localizeHref('/certifying-bodies')} variant="outline">Browse Bodies</Button>
			</div>
		</div>
	{/if}
</div>
