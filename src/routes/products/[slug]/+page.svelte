<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Card, CardContent, CardHeader, CardTitle } from '#lib/components/ui/card/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Field, FieldLabel } from '#lib/components/ui/field/index.js';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle
	} from '#lib/components/ui/dialog/index.js';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import Send from '@lucide/svelte/icons/send';
	import Heart from '@lucide/svelte/icons/heart';
	import MessageCircle from '@lucide/svelte/icons/message-circle';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import RelatedLinks from '#lib/components/site/related-links.svelte';
	import { isFavorite, toggleFavorite } from '#lib/favorites.js';
	import { sanitizeHtml } from '#lib/sanitize.js';
	import { page } from '$app/state';

	let { data } = $props();

	// Inquiry dialog state
	let inquiryOpen = $state(false);
	let inquirySubject = $state('');
	let inquiryMessage = $state('');
	let inquiryEmail = $state('');
	let inquirySending = $state(false);
	let inquiryResult = $state<{ type: 'success' | 'error'; message: string } | null>(null);

	// Favorite state — initialized client-side to avoid SSR/CSR mismatch
	let favorited = $state(false);

	async function submitInquiry() {
		if (!inquirySubject.trim() || !inquiryMessage.trim()) return;
		inquirySending = true;
		inquiryResult = null;
		try {
			const res = await fetch('/api/inquiries', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					buyerSlug: inquiryEmail.trim() || 'anonymous',
					supplierSlug: item?.supplierSlug ?? null,
					productSlug: item?.slug ?? null,
					subject: inquirySubject.trim(),
					message: inquiryMessage.trim()
				})
			});
			if (res.ok) {
				inquiryResult = { type: 'success', message: 'Inquiry sent successfully!' };
				inquirySubject = '';
				inquiryMessage = '';
				inquiryEmail = '';
			} else {
				const errBody = ((await res.json()) as any);
				inquiryResult = { type: 'error', message: errBody.error ?? 'Failed to send inquiry.' };
			}
		} catch {
			inquiryResult = { type: 'error', message: 'Network error. Please try again.' };
		} finally {
			inquirySending = false;
		}
	}

	const seo = $derived(data.seo ?? {});
	const item = $derived(data.item);

	const baseUrl = 'https://halalneo.com';
	const ogImage = $derived(seo.ogImage ?? `${baseUrl}/api/media/og-default.png`);

	const breadcrumbs = $derived.by(() => {
		const items = [
			{ name: 'Home', url: baseUrl },
			{ name: 'Products', url: `${baseUrl}/products` }
		];
		if (item?.name) items.push({ name: item.name, url: `${baseUrl}/products/${data.slug}` });
		return items;
	});

	const breadcrumbSchema = $derived({
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: breadcrumbs.map((b, i) => ({
			'@type': 'ListItem',
			position: i + 1,
			name: b.name,
			item: b.url
		}))
	});

	const priceDisplay = $derived(
		item?.priceMin
			? `$${item.priceMin}${item.priceMax ? ` - $${item.priceMax}` : ''}${item.priceUnit ? ` / ${item.priceUnit}` : ''}`
			: 'Price on request'
	);

	const heartClass = $derived(`size-4 ${favorited ? 'text-primary' : ''}`);
	const heartFill = $derived(favorited ? 'currentColor' : 'none');

	const features = $derived(Array.isArray(item?.features) ? item.features : []);

	const specifications = $derived(
		typeof item?.specifications === 'object' && item.specifications ? item.specifications : {}
	);

	const faqs = $derived(Array.isArray(item?.faqs) ? item.faqs : []);

	const resources = $derived(Array.isArray(item?.resources) ? item.resources : []);

	let activeTab = $state('description');

	// Initialize favorite state from localStorage (client-only)
	$effect(() => {
		if (item?.slug) {
			favorited = isFavorite(item.slug);
		}
	});

	function handleToggleFavorite() {
		if (!item?.slug) return;
		favorited = toggleFavorite(item.slug);
	}

	const productSchema = $derived(
		item
			? {
					'@context': 'https://schema.org',
					'@type': 'Product',
					name: item.name ?? '',
					description: item.shortDescription ?? item.description ?? '',
					image: item.image ?? ogImage,
					url: `${baseUrl}/products/${item.slug}`,
					brand: { '@type': 'Brand', name: item.supplierSlug ?? '' },
					category: item.categorySlug ?? '',
					...(item.priceMin
						? {
								offers: {
									'@type': 'Offer',
									url: `${baseUrl}/products/${item.slug}`,
									itemCondition: 'https://schema.org/NewCondition',
									priceCurrency: 'USD',
									price: item.priceMin
								}
							}
						: {}),
					manufacturer: { '@type': 'Organization', name: item.supplierSlug ?? '' }
				}
			: null
	);
</script>

<svelte:head>
	<title>{seo.title ?? `${item?.name ?? 'Product'} — HalalNeo`}</title>
	{#if item?.image}
		<link rel="preload" as="image" href={item.image} fetchpriority="high" />
	{/if}
	<meta name="description" content={seo.description ?? item?.shortDescription ?? ''} />
	{#if productSchema}
		{@html `<script type="application/ld+json">${JSON.stringify(productSchema)}</script>`}
	{/if}
	{#if faqs.length > 0}
		{@html `<script type="application/ld+json">${JSON.stringify({
			'@context': 'https://schema.org',
			'@type': 'FAQPage',
			mainEntity: faqs.map((f: any) => ({
				'@type': 'Question',
				name: typeof f === 'string' ? f : (f.question ?? ''),
				acceptedAnswer: {
					'@type': 'Answer',
					text: typeof f === 'string' ? '' : (f.answer ?? '')
				}
			}))
		})}</script>`}
	{/if}
	{@html `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`}
</svelte:head>

{#if item}
	<div class="mx-auto max-w-5xl space-y-6">
		<Breadcrumb
			items={[{ label: 'Products', href: '/products' }, { label: item.name ?? 'Product' }]}
		/>

		<!-- Top: Image + Info -->
		<div class="grid gap-6 lg:grid-cols-5">
			<!-- Image -->
			<div class="lg:col-span-2">
				<div
					class="flex aspect-square w-full items-center justify-center rounded-xl border border-border bg-muted"
				>
					{#if item.image}
						<img
							src={item.image}
							alt={item.name}
							class="h-full w-full rounded-xl object-cover"
							loading="eager"
							fetchpriority="high"
							decoding="async"
							width="512"
							height="512"
							onerror={(e) => {
								(e.currentTarget as HTMLElement).style.display = 'none';
							}}
						/>
					{:else}
						<span class="text-sm text-muted-foreground">No image available</span>
					{/if}
				</div>
			</div>

			<!-- Product Info -->
			<div class="space-y-4 lg:col-span-3">
				<div>
					<h1 class="text-xl font-bold tracking-tight sm:text-2xl">{item.name}</h1>
					{#if item.shortDescription}
						<p class="mt-1 text-sm text-muted-foreground">{item.shortDescription}</p>
					{/if}
				</div>

				<!-- Certification badges -->
				<div class="flex flex-wrap gap-1.5">
					{#if item.certStatus === 'certified'}
						<Badge variant="secondary" class="gap-1">
							<ShieldCheck class="size-2.5 text-success"></ShieldCheck>
							Halal Certified
						</Badge>
					{/if}
					{#if item.originCountry}
						<Badge variant="secondary">{item.originCountry}</Badge>
					{/if}
					<Badge variant="secondary">{item.categorySlug}</Badge>
				</div>

				<!-- Price card -->
				<div class="space-y-3 rounded-xl bg-card p-4">
					<div>
						<div class="text-2xl font-bold text-primary">{priceDisplay}</div>
						{#if item.moq}
							<div class="text-xs text-muted-foreground">MOQ: {item.moq}</div>
						{/if}
					</div>

					<div class="grid grid-cols-2 gap-2 text-sm">
						<div class="rounded-xl bg-muted/50 px-3 py-2">
							<div class="text-xs text-muted-foreground">Origin</div>
							<div class="font-medium">{item.originCountry ?? '—'}</div>
						</div>
						<div class="rounded-xl bg-muted/50 px-3 py-2">
							<div class="text-xs text-muted-foreground">Units</div>
							<div class="font-medium">{item.units ?? '—'}</div>
						</div>
					</div>

					<div class="flex gap-2">
						<Button
							class="flex-1 gap-2"
							onclick={() => {
								inquiryResult = null;
								inquiryOpen = true;
							}}
						>
							<Send class="size-4"></Send>
							Send Inquiry
						</Button>
						<Button
							variant="outline"
							size="icon"
							class="size-8 shrink-0"
							onclick={handleToggleFavorite}
							aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
						>
							<Heart class={heartClass} fill={heartFill}></Heart>
						</Button>
					</div>
				</div>

				<!-- Share -->
				<div class="flex items-center gap-2">
					<span class="text-xs text-muted-foreground">Share:</span>
					<a
						href="https://www.facebook.com/sharer/sharer.php?u={encodeURIComponent(page.url.href)}"
						target="_blank"
						rel="noopener noreferrer"
					>
						<Button variant="outline" size="icon" class="size-8 rounded-full text-[10px]">f</Button>
					</a>
					<a
						href="https://www.linkedin.com/sharing/share-offsite/?url={encodeURIComponent(
							page.url.href
						)}"
						target="_blank"
						rel="noopener noreferrer"
					>
						<Button variant="outline" size="icon" class="size-8 rounded-full text-[10px]">in</Button
						>
					</a>
					<a
						href="https://twitter.com/intent/tweet?url={encodeURIComponent(page.url.href)}"
						target="_blank"
						rel="noopener noreferrer"
					>
						<Button variant="outline" size="icon" class="size-8 rounded-full text-[10px]">X</Button>
					</a>
				</div>
			</div>
		</div>

		<Separator class="my-6"></Separator>

		<!-- Tabs -->
		<div class="flex gap-4 overflow-x-auto border-b border-border">
			{#each ['description', 'specs', 'certifications', 'faq', 'resources'] as tab}
				<Button
					variant="ghost"
					size="sm"
					onclick={() => (activeTab = tab)}
					class={`rounded-none border-b-2 pb-3 text-sm font-medium whitespace-nowrap ${activeTab === tab ? 'border-primary text-foreground' : 'border-transparent text-muted-foreground hover:text-foreground'}`}
				>
					{tab === 'faq' ? 'FAQ' : tab.charAt(0).toUpperCase() + tab.slice(1)}
				</Button>
			{/each}
		</div>

		<!-- Tab Content -->
		<div class="flex flex-col gap-6 lg:grid lg:grid-cols-3 lg:gap-8">
			<div class="space-y-4 lg:col-span-2">
				{#if activeTab === 'description'}
					<h2 class="text-base font-semibold">Product Description</h2>
					<div class="prose prose-sm max-w-none text-sm leading-relaxed overflow-hidden">
						{#if item.description}
							{@html sanitizeHtml(item.description)}
						{:else}
							<p>{item.shortDescription ?? 'No description available.'}</p>
						{/if}
					</div>
					{#if features.length > 0}
						<h3 class="mt-4 text-sm font-medium text-foreground">Key Features</h3>
						<ul class="mt-1 list-inside list-disc space-y-1 text-sm">
							{#each features as feature}
								<li>
									{typeof feature === 'string'
										? feature
										: (feature.value ?? JSON.stringify(feature))}
								</li>
							{/each}
						</ul>
					{/if}
				{:else if activeTab === 'specs'}
					<h2 class="text-base font-semibold">Specifications</h2>
					{#if Object.keys(specifications).length > 0}
						<dl class="space-y-2 text-sm">
							{#each Object.entries(specifications) as [key, value]}
								<div class="flex justify-between border-t border-border pt-2">
									<dt class="text-muted-foreground">{key}</dt>
									<dd class="font-medium">
										{typeof value === 'string' ? value : JSON.stringify(value)}
									</dd>
								</div>
							{/each}
						</dl>
					{:else}
						<p class="text-sm text-muted-foreground">No specifications listed.</p>
					{/if}
				{:else if activeTab === 'certifications'}
					<h2 class="text-base font-semibold">Certifications</h2>
					<div class="space-y-2">
						{#if item.certStatus === 'certified'}
							<div class="flex items-center gap-2 rounded-xl bg-success/5 p-3">
								<ShieldCheck class="size-5 text-success"></ShieldCheck>
								<div>
									<p class="text-sm font-medium">Halal Certified</p>
									<p class="text-xs text-muted-foreground">
										Verified by recognized certifying body
									</p>
								</div>
							</div>
						{:else}
							<p class="text-sm text-muted-foreground">No certifications listed.</p>
						{/if}
					</div>
				{:else if activeTab === 'faq'}
					<h2 class="text-base font-semibold">Frequently Asked Questions</h2>
					{#if faqs.length > 0}
						<div class="space-y-3">
							{#each faqs as faq}
								<Card class="p-3">
									<h3 class="text-sm font-medium">
										{typeof faq === 'string' ? faq : (faq.question ?? faq.q ?? 'Question')}
									</h3>
									<p class="mt-1 text-xs text-muted-foreground">
										{typeof faq === 'string' ? '' : (faq.answer ?? faq.a ?? '')}
									</p>
								</Card>
							{/each}
						</div>
					{:else}
						<p class="text-sm text-muted-foreground">No FAQs for this product.</p>
					{/if}
				{:else if activeTab === 'resources'}
					<h2 class="text-base font-semibold">Resources</h2>
					{#if resources.length > 0}
						<div class="space-y-2">
							{#each resources as res}
								<div class="flex items-center justify-between rounded-xl border border-border p-3">
									<span class="text-sm font-medium"
										>{typeof res === 'string' ? res : (res.name ?? 'Resource')}</span
									>
									<Button variant="outline" size="sm">Download</Button>
								</div>
							{/each}
						</div>
					{:else}
						<p class="text-sm text-muted-foreground">No resources available.</p>
					{/if}
				{/if}
			</div>

			<!-- Quick Info sidebar -->
			<div class="space-y-4">
				<Card class="p-4">
					<h3 class="mb-3 text-sm font-semibold">Quick Info</h3>
					<dl class="space-y-2 text-sm">
						<div class="flex justify-between">
							<dt class="text-muted-foreground">Origin</dt>
							<dd class="font-medium">{item.originCountry ?? '—'}</dd>
						</div>
						<div class="flex justify-between border-t border-border pt-2">
							<dt class="text-muted-foreground">Category</dt>
							<dd class="font-medium">
								<a
									href={localizeHref(`/categories/${item.categorySlug}`)}
									class="text-primary underline-offset-4 hover:underline">{item.categorySlug}</a
								>
							</dd>
						</div>
						<div class="flex justify-between border-t border-border pt-2">
							<dt class="text-muted-foreground">MOQ</dt>
							<dd class="font-medium">{item.moq ?? '—'}</dd>
						</div>
						<div class="flex justify-between border-t border-border pt-2">
							<dt class="text-muted-foreground">Units</dt>
							<dd class="font-medium">{item.units ?? '—'}</dd>
						</div>
						<div class="flex justify-between border-t border-border pt-2">
							<dt class="text-muted-foreground">Price</dt>
							<dd class="font-medium">{priceDisplay}</dd>
						</div>
					</dl>
				</Card>

				<!-- Supplier card -->
				<Card class="p-4">
					<h3 class="mb-3 text-sm font-semibold">Supplier</h3>
					<p class="text-sm">{item.supplierSlug}</p>
					<Button
						href={localizeHref(`/suppliers/${item.supplierSlug}`)}
						variant="outline"
						size="sm"
						class="mt-2 w-full"
					>
						View Supplier Profile
					</Button>
				</Card>
			</div>
		</div>

		<RelatedLinks
			title="Related products"
			items={(data.relatedProducts ?? []).map((p: any) => ({
				label: p.name,
				description: p.originCountry ?? p.supplierSlug,
				href: `/products/${p.slug}`
			}))}
		/>
	</div>
{:else}
	<div class="flex min-h-[50vh] items-center justify-center">
		<div class="space-y-4 text-center">
			<p class="text-lg text-muted-foreground">Product not found.</p>
			<Button href={localizeHref('/products')} variant="outline">Browse Products</Button>
		</div>
	</div>
{/if}

<!-- Inquiry Dialog -->
<Dialog bind:open={inquiryOpen}>
	<DialogContent class="sm:max-w-md">
		<DialogHeader>
			<DialogTitle>Send Inquiry</DialogTitle>
			<DialogDescription>
				{#if item?.supplierSlug}
					Contact {item.supplierSlug} about {item.name ?? 'this product'}.
				{:else}
					Send an inquiry about {item?.name ?? 'this product'}.
				{/if}
			</DialogDescription>
		</DialogHeader>

		{#if inquiryResult}
			<div
				class={`rounded-xl px-3 py-2 text-sm ${inquiryResult.type === 'success' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}
			>
				{inquiryResult.message}
			</div>
		{/if}

		<form
			class="space-y-3"
			onsubmit={(e) => {
				e.preventDefault();
				submitInquiry();
			}}
		>
			<Field>
				<FieldLabel>Email (optional)</FieldLabel>
				<Input type="email" bind:value={inquiryEmail} placeholder="you@company.com" />
			</Field>
			<Field>
				<FieldLabel>Subject</FieldLabel>
				<Input type="text" bind:value={inquirySubject} placeholder="Inquiry about product..." />
			</Field>
			<Field>
				<FieldLabel>Message</FieldLabel>
				<textarea
					bind:value={inquiryMessage}
					placeholder="I'm interested in..."
					rows={4}
					class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50"
				></textarea>
			</Field>
			<DialogFooter>
				<Button
					type="submit"
					disabled={inquirySending || !inquirySubject.trim() || !inquiryMessage.trim()}
				>
					{inquirySending ? 'Sending...' : 'Send Inquiry'}
				</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>
