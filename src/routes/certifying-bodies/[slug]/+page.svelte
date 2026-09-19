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
			image: 'https://halalneo.com/api/media/og-certifiers.png',
			address: body?.country
				? { '@type': 'PostalAddress', addressCountry: body.country }
				: undefined,
			parentOrganization: { '@type': 'Organization', name: 'HalalNeo' },
			...(body?.website ? { sameAs: [body.website, `${baseUrl}/certifying-bodies/${data.slug}`] } : {})
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
    <div class="grid gap-6 lg:grid-cols-[1fr_320px]">
      <main class="space-y-4 sm:space-y-6">
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
            <ExternalLink href={body.website ?? ''} label="Official website" />
            <a
              href={localizeHref('/verify')}
              class="text-xs font-medium text-primary underline-offset-4 hover:underline"
            >
              Verify a certificate →
            </a>
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
                  <span class="text-2xs opacity-70">· {recognitionStatusLabel(entry.status)}</span>
                </Badge>
              {/each}
            </div>
          </section>
        {/if}

        {#if (data.certificationTypes ?? []).length > 0}
          <section class="space-y-4">
            <h2 class="text-xl font-semibold">Certification types</h2>
            <div class="flex flex-wrap gap-2">
              {#each data.certificationTypes as cat (cat.slug)}
                <Badge variant="secondary">{cat.name}</Badge>
              {/each}
            </div>
          </section>
        {/if}

        <section class="space-y-4">
          <h2 class="text-xl font-semibold">Certified suppliers</h2>
          {#if (data.certifiedSuppliers ?? []).length > 0}
            <div class="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {#each data.certifiedSuppliers as supplier (supplier.slug)}
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
          items={(data.relatedGuides ?? []).map((g) => ({
            label: g.country,
            description: g.region ?? '',
            href: `/market-guides/${g.slug}`
          }))}
        />
      </main>

      <aside class="hidden lg:block shrink-0">
        <div class="space-y-4 sticky top-24 z-10">
          <Card class="bg-card">
            <CardContent class="space-y-4 p-5">
              <div class="space-y-3">
                <h4 class="text-sm font-semibold">Contact & Links</h4>
                <a
                  href={localizeHref(body.website ?? '')}
                  target="_blank"
                  rel="noopener"
                  class="text-sm text-foreground/80 hover:text-primary"
                >
                  {(body.website ?? '').replace(/^https?:\/\//, '')}
                </a>
                <a
                  href={localizeHref('/verify')}
                  class="text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Verify a certificate →
                </a>
              </div>
            </CardContent>
          </Card>

          {#if recognitionEntries.length > 0}
            <Card class="bg-card">
              <CardContent class="space-y-3 p-5">
                <h4 class="text-sm font-semibold">Recognition</h4>
                <p class="text-xs text-muted-foreground line-clamp-2">
                  Recognized in {recognitionEntries.length} countries/regions
                </p>
                <div class="flex flex-wrap gap-1.5">
                  {#each recognitionEntries.slice(0, 4) as entry (entry.country)}
                    <Badge variant="outline" class="text-2xs gap-1">
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
                <Button href={localizeHref('/certifying-bodies')} variant="outline" size="sm" class="w-full">
                  All Certifying Bodies
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </aside>
    </div>
  {:else}
    <div class="flex min-h-[50vh] items-center justify-center">
      <div class="space-y-4 text-center">
        <p class="text-lg text-muted-foreground">Certifying body details coming soon.</p>
        <Button href={localizeHref('/certifying-bodies')} variant="outline">Browse Bodies</Button>
      </div>
    </div>
  {/if}
</div>
