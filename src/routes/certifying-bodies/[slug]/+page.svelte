<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Card, CardContent, CardHeader, CardTitle } from '#lib/components/ui/card/index.js';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';

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
					address: body.country ? { '@type': 'PostalAddress', addressCountry: body.country } : undefined
				}
			: null
	);

	const breadcrumbSchema = $derived({
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
			{ '@type': 'ListItem', position: 2, name: 'Certifying Bodies', item: `${baseUrl}/certifying-bodies` },
			{ '@type': 'ListItem', position: 3, name: body?.name ?? '', item: `${baseUrl}/certifying-bodies/${data.slug}` }
		]
	});

	type RecognitionStatus = 'recognised' | 'mutual' | 'pending';

	interface RecognitionEntry {
		country: string;
		status: RecognitionStatus;
	}

	const recognitionData: Record<string, RecognitionEntry[]> = {
		jakim: [
			{ country: 'Malaysia', status: 'recognised' },
			{ country: 'Indonesia', status: 'recognised' },
			{ country: 'Singapore', status: 'recognised' },
			{ country: 'Brunei', status: 'recognised' },
			{ country: 'Thailand', status: 'recognised' },
			{ country: 'Philippines', status: 'recognised' },
			{ country: 'Japan', status: 'recognised' },
			{ country: 'South Korea', status: 'recognised' },
			{ country: 'China', status: 'mutual' },
			{ country: 'Australia', status: 'recognised' },
			{ country: 'New Zealand', status: 'recognised' },
			{ country: 'India', status: 'mutual' },
			{ country: 'Pakistan', status: 'recognised' },
			{ country: 'Turkey', status: 'mutual' },
			{ country: 'UAE', status: 'recognised' },
			{ country: 'Saudi Arabia', status: 'recognised' },
			{ country: 'Qatar', status: 'recognised' },
			{ country: 'Kuwait', status: 'recognised' }
		],
		bpjph: [
			{ country: 'Indonesia', status: 'recognised' },
			{ country: 'Malaysia', status: 'mutual' },
			{ country: 'Singapore', status: 'mutual' },
			{ country: 'Brunei', status: 'mutual' },
			{ country: 'Saudi Arabia', status: 'recognised' },
			{ country: 'UAE', status: 'recognised' },
			{ country: 'Turkey', status: 'pending' },
			{ country: 'Japan', status: 'pending' }
		],
		muis: [
			{ country: 'Singapore', status: 'recognised' },
			{ country: 'Malaysia', status: 'mutual' },
			{ country: 'Indonesia', status: 'mutual' },
			{ country: 'Brunei', status: 'mutual' },
			{ country: 'Thailand', status: 'recognised' },
			{ country: 'Japan', status: 'recognised' },
			{ country: 'South Korea', status: 'recognised' },
			{ country: 'Australia', status: 'recognised' },
			{ country: 'New Zealand', status: 'recognised' },
			{ country: 'India', status: 'pending' },
			{ country: 'Pakistan', status: 'pending' },
			{ country: 'UAE', status: 'mutual' },
			{ country: 'Saudi Arabia', status: 'mutual' }
		],
		sfda: [
			{ country: 'Saudi Arabia', status: 'recognised' },
			{ country: 'UAE', status: 'mutual' },
			{ country: 'Bahrain', status: 'mutual' },
			{ country: 'Kuwait', status: 'mutual' },
			{ country: 'Oman', status: 'mutual' },
			{ country: 'Qatar', status: 'mutual' },
			{ country: 'Malaysia', status: 'mutual' },
			{ country: 'Indonesia', status: 'pending' }
		],
		moiat: [
			{ country: 'UAE', status: 'recognised' },
			{ country: 'Saudi Arabia', status: 'mutual' },
			{ country: 'Bahrain', status: 'mutual' },
			{ country: 'Kuwait', status: 'mutual' },
			{ country: 'Oman', status: 'mutual' },
			{ country: 'Qatar', status: 'mutual' },
			{ country: 'Malaysia', status: 'pending' },
			{ country: 'Indonesia', status: 'pending' }
		],
		ifanca: [
			{ country: 'United States', status: 'recognised' },
			{ country: 'Malaysia', status: 'mutual' },
			{ country: 'Indonesia', status: 'mutual' },
			{ country: 'Singapore', status: 'mutual' },
			{ country: 'UAE', status: 'mutual' },
			{ country: 'Saudi Arabia', status: 'pending' },
			{ country: 'Turkey', status: 'pending' }
		],
		gimdes: [
			{ country: 'Turkey', status: 'recognised' },
			{ country: 'Malaysia', status: 'mutual' },
			{ country: 'Indonesia', status: 'mutual' },
			{ country: 'UAE', status: 'pending' },
			{ country: 'Saudi Arabia', status: 'pending' },
			{ country: 'Pakistan', status: 'pending' }
		],
		sanha: [
			{ country: 'South Africa', status: 'recognised' },
			{ country: 'Malaysia', status: 'mutual' },
			{ country: 'Indonesia', status: 'mutual' },
			{ country: 'UAE', status: 'mutual' },
			{ country: 'Saudi Arabia', status: 'pending' },
			{ country: 'Nigeria', status: 'pending' }
		]
	};

	const recognitionEntries = $derived(
		recognitionData[slug] ?? recognitionData[body?.id] ?? []
	);

	function getStatusBadgeClasses(status: RecognitionStatus): string {
		switch (status) {
			case 'recognised':
				return 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-300';
			case 'mutual':
				return 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300';
			case 'pending':
				return 'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-800 dark:bg-sky-950 dark:text-sky-300';
		}
	}

	function getStatusLabel(status: RecognitionStatus): string {
		switch (status) {
			case 'recognised':
				return 'Recognised';
			case 'mutual':
				return 'Mutual Recognition';
			case 'pending':
				return 'Pending';
		}
	}

	function getRegion(country: string): string {
		const map: Record<string, string> = {
			Malaysia: 'Southeast Asia',
			Indonesia: 'Southeast Asia',
			Thailand: 'Southeast Asia',
			'Saudi Arabia': 'Middle East',
			UAE: 'Middle East',
			Turkey: 'Middle East',
			Pakistan: 'South Asia',
			Singapore: 'Southeast Asia',
			'United Kingdom': 'Europe',
			'United States': 'Americas',
			'South Africa': 'Africa',
			Australia: 'Oceania'
		};
		return map[country] ?? 'Other';
	}
</script>

<svelte:head>
	<title>{body?.name ?? 'Certifying Body'} — HalalNeo</title>
	<meta name="description" content={body?.description?.slice(0, 160) ?? `${body?.name ?? 'Halal certifying body'} — recognized halal certification authority in ${body?.country ?? ''}.`} />
	{#if certBodySchema}
		{@html `<script type="application/ld+json">${JSON.stringify(certBodySchema)}</script>`}
	{/if}
	{@html `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`}
</svelte:head>

<div class="container mx-auto max-w-7xl px-4 py-8">
	{#if body}
		<Breadcrumb items={[{ label: 'Certifying Bodies', href: '/certifying-bodies' }, { label: body.name ?? 'Certifying Body' }]} />
		<article class="space-y-8">
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
					<Badge variant="outline">{getRegion(body.country)}</Badge>
				</div>
			</header>

			<div class="grid gap-6 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>About</CardTitle>
					</CardHeader>
					<CardContent class="space-y-3">
						<p class="text-muted-foreground">
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
							<span
								class="inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium {getStatusBadgeClasses(
									entry.status
								)}"
							>
								<span
									class="size-1.5 rounded-full {entry.status === 'recognised'
										? 'bg-emerald-500'
										: entry.status === 'mutual'
											? 'bg-amber-500'
											: 'bg-sky-500'}"
								></span>
								{entry.country}
								<span class="text-[10px] opacity-70">· {getStatusLabel(entry.status)}</span>
							</span>
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
										href={localizeHref(`/suppliers/${supplier.slug}`)}
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
		</article>
	{:else}
		<div class="flex min-h-[50vh] items-center justify-center">
			<div class="space-y-4 text-center">
				<p class="text-lg text-muted-foreground">Certifying body details coming soon.</p>
				<Button href="/certifying-bodies" variant="outline">Browse Bodies</Button>
			</div>
		</div>
	{/if}
</div>
