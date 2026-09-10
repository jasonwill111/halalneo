<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Card, CardContent, CardTitle } from '#lib/components/ui/card/index.js';
	import StatTile from '#lib/components/site/stat-tile.svelte';
	import Phone from '@lucide/svelte/icons/phone';
	import Mail from '@lucide/svelte/icons/mail';
	import MessageCircle from '@lucide/svelte/icons/message-circle';
	import Shield from '@lucide/svelte/icons/shield';
	import Star from '@lucide/svelte/icons/star';
	import Globe from '@lucide/svelte/icons/globe';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';

	let { data } = $props();

	const provider = $derived(data.item);
	const related = $derived(data.related ?? []);

	const baseUrl = 'https://halalneo.com';

	const breadcrumbSchema = $derived({
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
			{ '@type': 'ListItem', position: 2, name: 'Service Providers', item: `${baseUrl}/service-providers` },
			{ '@type': 'ListItem', position: 3, name: provider?.name ?? '', item: `${baseUrl}/service-providers/${data.slug}` }
		]
	});

	type ProviderType =
		| 'certification'
		| 'logistics'
		| 'finance'
		| 'payment'
		| 'insurance'
		| 'consulting';

	function typeLabel(type: ProviderType): string {
		const labels: Record<ProviderType, string> = {
			certification: 'Certification',
			logistics: 'Logistics',
			finance: 'Finance',
			payment: 'Payment',
			insurance: 'Insurance',
			consulting: 'Consulting'
		};
		return labels[type];
	}

	function initials(name: string | undefined): string {
		return (name ?? '')
			.split(' ')
			.map((w) => w[0])
			.slice(0, 2)
			.join('');
	}

	const yearEst = $derived((provider as any)?.createdAt ? String(new Date((provider as any).createdAt).getFullYear()) : '—');

	const hasContact = $derived(
		!!(provider?.website || provider?.email || provider?.phone || provider?.whatsapp || provider?.line)
	);

	const metaKeywords = $derived.by(() => {
		const kw = (provider as any)?.keywords;
		if (!kw) return null;
		if (Array.isArray(kw)) return kw.filter(Boolean).join(', ') || null;
		if (typeof kw === 'string') {
			try {
				const parsed = JSON.parse(kw);
				if (Array.isArray(parsed)) return parsed.filter(Boolean).join(', ') || null;
			} catch {}
			return kw.trim() || null;
		}
		return null;
	});
</script>

<svelte:head>
	{#if metaKeywords}
		<meta name="keywords" content={metaKeywords} />
	{/if}
	{#if provider}
		{@html `<script type="application/ld+json">${JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'Organization',
			name: provider.name,
			description: provider.description,
			url: provider.website ?? `${baseUrl}/service-providers/${data.slug}`,
			address: provider.country ? { '@type': 'PostalAddress', addressCountry: provider.country } : undefined,
			contactPoint: [
				...(provider.email ? [{ '@type': 'ContactPoint', contactType: 'email', email: provider.email }] : []),
				...(provider.phone ? [{ '@type': 'ContactPoint', contactType: 'telephone', telephone: provider.phone }] : [])
			],
			memberOf: { '@type': 'Organization', name: 'HalalNeo' }
		})}</script>`}
	{/if}
	{@html `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`}
</svelte:head>

<div class="mx-auto w-full max-w-6xl space-y-4 sm:space-y-6">
	{#if provider}
		<Breadcrumb items={[{ label: 'Service Providers', href: '/service-providers' }, { label: provider.name ?? 'Provider' }]} />

		<!-- Gradient hero with initials tile (schema has no cover image column) -->
		<div class="flex h-24 w-full items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 to-muted sm:h-32">
			<div class="flex size-12 items-center justify-center rounded-2xl border-4 border-background bg-primary/10 text-lg font-bold text-primary shadow-sm sm:size-14">
				{initials(provider.name) || '?'}
			</div>
		</div>

		<!-- Header -->
		<div>
			<h1 class="text-xl font-bold tracking-tight sm:text-2xl">{provider.name}</h1>
			<p class="mt-0.5 text-[10px] text-muted-foreground">{provider.country} · {typeLabel(provider.type as ProviderType)} · Est. {yearEst}</p>
			<div class="mt-1 flex flex-wrap gap-1">
				{#if provider.status === 'active'}
					<Badge variant="secondary" class="gap-0.5 text-[10px]">
						<Shield class="size-2 text-success" />
						Verified
					</Badge>
				{/if}
				<Badge variant="secondary" class="text-[10px]">{typeLabel(provider.type as ProviderType)}</Badge>
			</div>
			{#if provider.rating}
				<div class="mt-1 flex items-center gap-1">
					<Star class="size-2.5 fill-warn text-warn" />
					<span class="text-[10px] text-primary font-medium">{provider.rating}</span>
				</div>
			{/if}
		</div>

		<!-- Action buttons -->
		<div class="flex gap-1">
			{#if provider.whatsapp}
				<Button href="https://wa.me/{provider.whatsapp.replace(/[^0-9]/g, '')}" variant="outline" size="sm" class="h-7 flex-1 gap-1 text-[10px]" target="_blank" rel="noopener">
					<MessageCircle class="size-2.5" />
					WhatsApp
				</Button>
			{/if}
			{#if provider.line}
				<Button href="https://line.me/ti/p/{provider.line}" variant="outline" size="sm" class="h-7 flex-1 gap-1 text-[10px]" target="_blank" rel="noopener">
					Line
				</Button>
			{/if}
			{#if provider.email}
				<Button href="mailto:{provider.email}" variant="outline" size="sm" class="h-7 flex-1 gap-1 text-[10px]">
					<Mail class="size-2.5" />
					Email
				</Button>
			{/if}
			{#if provider.phone}
				<Button href="tel:{provider.phone}" variant="outline" size="sm" class="h-7 flex-1 gap-1 text-[10px]">
					<Phone class="size-2.5" />
					Phone
				</Button>
			{/if}
			{#if provider.website}
				<Button href={provider.website} variant="outline" size="sm" class="h-7 flex-1 gap-1 text-[10px]" target="_blank" rel="noopener">
					<Globe class="size-2.5" />
					Website
				</Button>
			{/if}
		</div>

		<!-- Stats -->
		<div class="grid grid-cols-2 gap-1 sm:grid-cols-4">
			<StatTile value={typeLabel(provider.type as ProviderType)} label="Type" tone="primary" />
			<StatTile value={provider.rating ?? '–'} label="Rating" tone="warn" />
			<StatTile value={provider.country ?? '—'} label="Country" tone="info" />
			<StatTile value={yearEst} label="Est." tone="success" />
		</div>

		<div class="grid gap-4 sm:gap-6 lg:grid-cols-[1fr_320px]">
			<div class="min-w-0 space-y-4 sm:space-y-6">
				<!-- About -->
				<section>
					<h2 class="mb-1 text-sm font-semibold">About</h2>
					<div class="text-xs leading-relaxed text-foreground/80">
						<p>{provider.description ?? 'No description available.'}</p>
					</div>
				</section>

				{#if related.length > 0}
					<section>
						<h2 class="mb-1.5 text-sm font-semibold">Related Service Providers</h2>
						<div class="grid grid-cols-2 gap-1.5">
							{#each related as rel (rel.slug)}
								<a href={localizeHref(`/service-providers/${rel.slug}`)} class="rounded-xl bg-card ring-1 ring-foreground/10 p-1.5 transition-all hover:shadow-md">
									<div class="flex items-center gap-1.5">
										<div class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-semibold">{initials(rel.name)}</div>
										<div class="min-w-0 flex-1">
											<h3 class="text-[10px] font-medium truncate">{rel.name}</h3>
											<p class="text-[10px] text-muted-foreground truncate">{rel.country} · {rel.rating ?? '–'}★</p>
										</div>
										{#if rel.status === 'active'}
											<Badge variant="secondary" class="hidden shrink-0 gap-0.5 text-[10px] sm:inline-flex">
												<Shield class="size-2 text-success" />
												Verified
											</Badge>
										{/if}
									</div>
								</a>
							{/each}
						</div>
					</section>
				{/if}
			</div>

			<!-- Contact card -->
			<aside class="lg:sticky lg:top-24 lg:self-start">
				<Card class="bg-card">
					<CardContent class="space-y-2 p-4">
						<CardTitle class="text-sm">Contact</CardTitle>
						{#if provider.website}
							<a
								href={provider.website}
								target="_blank"
								rel="noopener"
								class="flex items-center gap-2 text-xs font-medium text-primary hover:underline"
							>
								<Globe class="size-3.5 shrink-0 text-muted-foreground" />
								<span class="truncate">{provider.website.replace(/^https?:\/\//, '')}</span>
							</a>
						{/if}
						{#if provider.email}
							<a href="mailto:{provider.email}" class="flex items-center gap-2 text-xs font-medium hover:text-primary">
								<Mail class="size-3.5 shrink-0 text-muted-foreground" />
								<span class="truncate">{provider.email}</span>
							</a>
						{/if}
						{#if provider.phone}
							<a href="tel:{provider.phone}" class="flex items-center gap-2 text-xs font-medium hover:text-primary">
								<Phone class="size-3.5 shrink-0 text-muted-foreground" />
								{provider.phone}
							</a>
						{/if}
						{#if provider.whatsapp}
							<a
								href="https://wa.me/{provider.whatsapp.replace(/[^0-9]/g, '')}"
								target="_blank"
								rel="noopener"
								class="flex items-center gap-2 text-xs font-medium hover:text-primary"
							>
								<MessageCircle class="size-3.5 shrink-0 text-muted-foreground" />
								WhatsApp
							</a>
						{/if}
						{#if provider.line}
							<a
								href={provider.line.startsWith('http') ? provider.line : `https://line.me/R/ti/p/@${provider.line}`}
								target="_blank"
								rel="noopener"
								class="flex items-center gap-2 text-xs font-medium hover:text-primary"
							>
								<span class="flex size-3.5 shrink-0 items-center justify-center rounded-sm bg-success/15 text-[7px] font-black text-success">L</span>
								LINE<span class="truncate text-[10px] font-normal text-muted-foreground">{provider.line}</span>
							</a>
						{/if}
						{#if !hasContact}
							<p class="text-[11px] leading-relaxed text-muted-foreground">
								This provider has not listed direct contact details yet.
							</p>
						{/if}
					</CardContent>
				</Card>
			</aside>
		</div>
	{:else}
		<div class="flex min-h-[50vh] items-center justify-center">
			<div class="space-y-4 text-center">
				<p class="text-lg text-muted-foreground">Provider profile coming soon.</p>
				<Button href={localizeHref('/service-providers')} variant="outline">Browse Providers</Button>
			</div>
		</div>
	{/if}
</div>
