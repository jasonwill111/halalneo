<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle
	} from '#lib/components/ui/card/index.js';
	import Star from '@lucide/svelte/icons/star';
	import Phone from '@lucide/svelte/icons/phone';
	import Mail from '@lucide/svelte/icons/mail';
	import Globe from '@lucide/svelte/icons/globe';
	import MessageCircle from '@lucide/svelte/icons/message-circle';
	import Shield from '@lucide/svelte/icons/shield';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Send from '@lucide/svelte/icons/send';
	import Users from '@lucide/svelte/icons/users';
	import ClipboardList from '@lucide/svelte/icons/clipboard-list';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';

	let { data } = $props();

	const provider = $derived(data.item);
	const slug = $derived(data.slug);

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
	const related = $derived(data.related ?? []);

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

	const serviceAreas = $derived(
		Array.isArray((provider as any)?.serviceAreas) ? (provider as any).serviceAreas :
		typeof (provider as any)?.serviceAreas === 'string' ? (() => { try { return JSON.parse((provider as any).serviceAreas); } catch { return []; } })() : []
	);

	const services = $derived(
		provider?.type ? [{ title: `${typeLabel(provider.type as ProviderType)} Services`, desc: provider.description ?? 'Professional halal services', color: 'bg-primary/10 text-primary' }] : []
	);
</script>

<svelte:head>
	<title>{provider?.name ?? 'Service Provider'} — HalalNeo</title>
	<meta name="description" content={provider?.description?.slice(0, 160) ?? `${provider?.name ?? 'Halal service provider'} — professional halal services in ${provider?.country ?? ''}.`} />
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

<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6">
	{#if provider}
		<Breadcrumb items={[{ label: 'Service Providers', href: '/service-providers' }, { label: provider.name ?? 'Provider' }]} />

		<div class="mb-3 aspect-[3/1] max-h-[100px] w-full rounded-lg border border-border bg-muted sm:max-h-none sm:aspect-[3/1]"></div>

		<div class="mb-3">
			<div class="flex items-start gap-3">
				<div class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary text-lg font-bold">
					{initials(provider.name)}
				</div>
				<div class="min-w-0 flex-1">
					<h1 class="text-sm font-semibold tracking-tight leading-tight">{provider.name}</h1>
					<p class="mt-0.5 text-[10px] text-muted-foreground">{provider.country} · {typeLabel(provider.type as ProviderType)} · Est. {yearEst}</p>
					<div class="mt-1 flex flex-wrap gap-1">
						<Badge variant="secondary" class="gap-0.5 text-[9px]">
							<Shield class="size-2 text-green-600" />
							Verified
						</Badge>
						<Badge variant="secondary" class="text-[9px]">{typeLabel(provider.type as ProviderType)}</Badge>
					</div>
					{#if provider.rating}
						<div class="mt-1 flex items-center gap-1">
							<span class="text-[10px] text-primary font-medium">{provider.rating}★</span>
							<span class="text-[9px] text-muted-foreground">(128 reviews)</span>
						</div>
					{/if}
				</div>
			</div>
			<div class="mt-2 flex gap-1">
				{#if provider.whatsapp}
					<a href="https://wa.me/{provider.whatsapp.replace(/[^0-9]/g, '')}" class="inline-flex h-7 flex-1 items-center justify-center gap-1 rounded-md border border-border px-2 text-[10px] font-medium hover:bg-accent transition-colors" target="_blank" rel="noopener">
						<MessageCircle class="size-2.5" />
						WhatsApp
					</a>
				{/if}
				{#if provider.line}
					<a href="https://line.me/ti/p/{provider.line}" class="inline-flex h-7 flex-1 items-center justify-center gap-1 rounded-md border border-border px-2 text-[10px] font-medium hover:bg-accent transition-colors" target="_blank" rel="noopener">
						Line
					</a>
				{/if}
				{#if provider.email}
					<a href="mailto:{provider.email}" class="inline-flex h-7 flex-1 items-center justify-center gap-1 rounded-md border border-border px-2 text-[10px] font-medium hover:bg-accent transition-colors">
						<Mail class="size-2.5" />
						Email
					</a>
				{/if}
				{#if provider.phone}
					<a href="tel:{provider.phone}" class="inline-flex h-7 flex-1 items-center justify-center gap-1 rounded-md border border-border px-2 text-[10px] font-medium hover:bg-accent transition-colors">
						<Phone class="size-2.5" />
						Phone
					</a>
				{/if}
			</div>
		</div>

		<div class="mb-3 grid grid-cols-2 gap-1 sm:grid-cols-4">
			<div class="rounded-lg bg-card shadow-sm p-1.5 text-center">
				<div class="text-xs font-bold text-primary">{services.length}</div>
				<div class="text-[8px] text-muted-foreground">Services</div>
			</div>
			<div class="rounded-lg bg-card shadow-sm p-1.5 text-center">
				<div class="text-xs font-bold text-primary">{provider.rating ?? '–'}{provider.rating ? '★' : ''}</div>
				<div class="text-[8px] text-muted-foreground">Rating</div>
			</div>
			<div class="rounded-lg bg-card shadow-sm p-1.5 text-center">
				<div class="text-xs font-bold text-primary">{provider.country ?? '—'}</div>
				<div class="text-[8px] text-muted-foreground">Country</div>
			</div>
			<div class="rounded-lg bg-card shadow-sm p-1.5 text-center">
				<div class="text-xs font-bold text-primary">{yearEst}</div>
				<div class="text-[8px] text-muted-foreground">Est.</div>
			</div>
		</div>

		<div class="mb-4">
			<h2 class="mb-1 text-sm font-semibold">About</h2>
			<div class="prose prose-xs max-w-none text-muted-foreground">
				{#if provider.description}
					<p class="text-[11px]">{provider.description}</p>
				{:else}
					<p class="text-[11px]">No description available.</p>
				{/if}
			</div>
		</div>

		<div class="mb-3">
			<h2 class="mb-1 text-sm font-semibold">Services Offered</h2>
			<div class="grid gap-1.5 sm:grid-cols-2">
				{#each services as svc}
					<div class="rounded-lg bg-card shadow-sm p-1.5">
						<div class="flex items-center gap-1.5">
							<div class="flex size-6 shrink-0 items-center justify-center rounded-lg {svc.color}">
								<Shield class="size-3.5" />
							</div>
							<div class="min-w-0 flex-1">
								<h3 class="text-[10px] font-medium truncate">{svc.title}</h3>
								<p class="text-[9px] text-muted-foreground">{svc.desc}</p>
							</div>
						</div>
					</div>
				{/each}
			</div>
		</div>

		{#if serviceAreas.length > 0}
			<div class="mb-3">
				<h2 class="mb-1 text-sm font-semibold">Service Areas</h2>
				<div class="flex flex-wrap gap-1">
					{#each serviceAreas as area}
						<Badge variant="secondary" class="text-[9px]">{typeof area === 'string' ? area : area.name ?? area}</Badge>
					{/each}
				</div>
			</div>
		{/if}

		{#if (provider as any)?.pricing || (provider as any)?.paymentMethods}
			<div class="mb-3">
				<h2 class="mb-1 text-sm font-semibold">Pricing</h2>
				<div class="rounded-lg bg-card shadow-sm p-1.5">
					<dl class="space-y-0.5 text-[10px]">
						{#if (provider as any).pricing}
							<div class="flex justify-between py-0.5"><dt class="text-muted-foreground">Pricing</dt><dd class="font-medium">{(provider as any).pricing}</dd></div>
						{/if}
						{#if (provider as any).paymentMethods}
							<div class="flex justify-between py-0.5 {(provider as any).pricing ? 'border-t border-border' : ''}"><dt class="text-muted-foreground">Payment</dt><dd class="font-medium">{(provider as any).paymentMethods}</dd></div>
						{/if}
					</dl>
				</div>
			</div>
		{/if}

		{#if (provider as any)?.reviews && Array.isArray((provider as any).reviews) && (provider as any).reviews.length > 0}
			<div class="mb-3">
				<h2 class="mb-1 text-sm font-semibold">Reviews</h2>
				<div class="grid gap-1.5 sm:grid-cols-2">
					{#each (provider as any).reviews as review}
						<div class="rounded-lg bg-card shadow-sm p-1.5">
							<div class="mb-0.5 text-[10px] text-primary">{'★'.repeat(review.stars ?? 5)}{'☆'.repeat(5 - (review.stars ?? 5))}</div>
							<p class="mb-1 text-[10px] text-muted-foreground italic line-clamp-2">{review.text ?? review.comment ?? ''}</p>
							<div class="flex items-center gap-1.5">
								<div class="flex size-6 items-center justify-center rounded-full bg-secondary text-[9px] font-medium">{review.initials ?? (review.name ?? '').split(' ').map((w: string) => w[0]).slice(0, 2).join('')}</div>
								<div>
									<p class="text-[10px] font-medium">{review.name ?? ''}</p>
									<p class="text-[8px] text-muted-foreground">{review.company ?? ''}</p>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		{#if related.length > 0}
			<div class="mb-3">
				<h2 class="mb-1 text-sm font-semibold">Related Service Providers</h2>
				<div class="grid gap-1.5 sm:grid-cols-2">
					{#each related as rel}
						<a href={localizeHref(`/service-providers/${rel.slug}`)} class="rounded-lg bg-card shadow-sm p-1.5 transition-all hover:shadow-md">
							<div class="flex items-center gap-1.5">
								<div class="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary text-xs font-semibold">{initials(rel.name)}</div>
								<div class="min-w-0 flex-1">
									<h3 class="text-[10px] font-medium truncate">{rel.name}</h3>
									<p class="text-[9px] text-muted-foreground">{rel.country} · {rel.rating ?? '–'}★</p>
								</div>
								<Badge variant="secondary" class="shrink-0 gap-0.5 text-[8px]">
									<Shield class="size-2 text-green-600" />
									Verified
								</Badge>
							</div>
						</a>
					{/each}
				</div>
			</div>
		{/if}
	{:else}
		<div class="flex min-h-[50vh] items-center justify-center">
			<div class="space-y-4 text-center">
				<p class="text-lg text-muted-foreground">Provider profile coming soon.</p>
				<Button href={localizeHref('/service-providers')} variant="outline">Browse Providers</Button>
			</div>
		</div>
	{/if}
</div>
