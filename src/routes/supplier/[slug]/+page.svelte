<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Card, CardContent, CardTitle } from '#lib/components/ui/card/index.js';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import { Field, FieldLabel } from '#lib/components/ui/field/index.js';
	import StatTile from '#lib/components/site/stat-tile.svelte';
	import ShareButtons from '#lib/components/site/share-buttons.svelte';
	import RelatedLinks from '#lib/components/site/related-links.svelte';
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
	import Globe from '@lucide/svelte/icons/globe';
	import Mail from '@lucide/svelte/icons/mail';
	import Phone from '@lucide/svelte/icons/phone';
	import MessageCircle from '@lucide/svelte/icons/message-circle';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Factory from '@lucide/svelte/icons/factory';
	import Users from '@lucide/svelte/icons/users';
	import Building2 from '@lucide/svelte/icons/building-2';
	import CalendarCheck from '@lucide/svelte/icons/calendar-check';
	import CalendarPlus from '@lucide/svelte/icons/calendar-plus';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import { getRegion, regionBadgeClass } from '#lib/utils/region.js';
	import { TILE_COLORS } from '#lib/utils/tile-colors.js';
	import { isFavorite, toggleFavorite } from '#lib/favorites.js';
	import Package from '@lucide/svelte/icons/package';

	let { data } = $props();

	// Save/favorite state — uses shared favorites util (same store as products)
	let saved = $state(false);

	function toggleSave() {
		if (!data.item?.slug) return;
		saved = toggleFavorite(data.item.slug);
	}

	// Initialize saved state from localStorage
	$effect(() => {
		if (data.item?.slug) {
			saved = isFavorite(data.item.slug);
		}
	});

	// Inquiry dialog state
	let inquiryOpen = $state(false);
	let inquirySubject = $state('');
	let inquiryMessage = $state('');
	let inquiryEmail = $state('');
	let inquirySending = $state(false);
	let inquiryResult = $state<{ type: 'success' | 'error'; message: string } | null>(null);

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
					supplierSlug: data.slug ?? null,
					productSlug: null,
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

	const item = $derived(data.item);
	const products = $derived(data.products ?? []);

	function typeBadgeCls(type?: string | null): string {
		if (type === 'manufacturer') return 'bg-info/10 text-info border-info/20';
		if (type === 'wholesaler') return 'bg-accent-purple/10 text-accent-purple border-accent-purple/20';
		if (type === 'trader') return 'bg-accent-rose/10 text-accent-rose border-accent-rose/20';
		return '';
	}

	function productPrice(p: any): string {
		if (!p?.priceMin) return '';
		const range = p.priceMax ? `$${p.priceMin}–$${p.priceMax}` : `$${p.priceMin}`;
		return p.priceUnit ? `${range}/${p.priceUnit}` : range;
	}

	const baseUrl = 'https://halalneo.com';

	const supplierSchema = $derived(
		item
			? {
					'@context': 'https://schema.org',
					'@type': 'Organization',
					name: item.name,
					description: item.description ?? '',
					url: `${baseUrl}/supplier/${data.slug}`,
					address: item.country
						? { '@type': 'PostalAddress', addressCountry: item.country }
						: undefined,
					employeeCount: item.employeeCount ?? undefined,
					numberOfEmployees: item.employeeCount
						? { '@type': 'QuantitativeValue', value: item.employeeCount }
						: undefined
				}
			: null
	);

	const breadcrumbSchema = $derived({
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
			{ '@type': 'ListItem', position: 2, name: 'Suppliers', item: `${baseUrl}/suppliers` },
			{
				'@type': 'ListItem',
				position: 3,
				name: item?.name ?? 'Supplier',
				item: `${baseUrl}/supplier/${data.slug}`
			}
		]
	});

	const certifications = $derived.by(() => {
		const raw = item?.certifications;
		if (!raw) return [];
		let arr: any[];
		if (typeof raw === 'string') {
			try {
				arr = JSON.parse(raw);
			} catch {
				return [{ name: raw, bodyId: '', country: '', standard: '', scope: '', number: '', expiry: '', status: 'certified' }];
			}
		} else {
			arr = raw;
		}
		if (!Array.isArray(arr)) return [];
		return arr.map((c: any) => {
			if (typeof c === 'string')
				return { name: c, bodyId: '', country: '', standard: '', scope: '', number: '', expiry: '', status: 'certified' };
			return {
				name: c.body?.name ?? c.name ?? c.bodyId ?? 'Certified',
				bodyId: c.body?.id ?? c.bodyId ?? '',
				country: c.body?.country ?? c.country ?? '',
				standard: c.body?.standard ?? c.standard ?? '',
				scope: c.scope ?? '',
				number: c.number ?? c.id ?? '',
				expiry: c.expiry ?? '',
				status: c.status ?? 'certified'
			};
		});
	});

	const isExpired = (expiry: string): boolean => {
		if (!expiry) return false;
		const t = new Date(expiry).getTime();
		return !isNaN(t) && t < Date.now();
	};

	const mainMarkets = $derived.by(() => {
		const raw = item?.mainMarkets;
		if (!raw) return [];
		if (Array.isArray(raw)) return raw.filter(Boolean).map(String);
		if (typeof raw === 'string') {
			try {
				const parsed = JSON.parse(raw);
				if (Array.isArray(parsed)) return parsed.filter(Boolean).map(String);
			} catch {
				return raw.split(/[,;]/).map((s: string) => s.trim()).filter(Boolean);
			}
		}
		return [];
	});

	const hasDirectContact = $derived(
		!!(item?.email || item?.phone || item?.whatsapp || item?.line || item?.website)
	);

	// Header cert badges are capped at 3 on all viewports; the rest live behind #certifications.
	const visibleCerts = $derived(certifications.slice(0, 3));
	const hiddenCertCount = $derived(certifications.length - visibleCerts.length);

	const memberSinceYear = $derived.by(() => {
		const raw = item?.createdAt;
		if (!raw) return null;
		const d = new Date(raw);
		return isNaN(d.getTime()) ? null : d.getFullYear();
	});

	const metaKeywords = $derived.by(() => {
		const kw = item?.keywords;
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
	<title>{item?.metaTitle ?? `${item?.name ?? 'Supplier'} — HalalNeo`}</title>
	<meta
		name="description"
		content={item?.metaDescription ??
			item?.description?.slice(0, 160) ??
			`Halal-certified supplier ${item?.name ?? ''} from ${item?.country ?? ''}.`}
	/>
	{#if metaKeywords}
		<meta name="keywords" content={metaKeywords} />
	{/if}
	{#if supplierSchema}
		{@html `<script type="application/ld+json">${JSON.stringify(supplierSchema)}</script>`}
	{/if}
	{#if item?.coverImage}
		<link rel="preload" as="image" href={item.coverImage} fetchpriority="high" />
	{/if}
	{@html `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`}
</svelte:head>

{#if item}
	<Breadcrumb
		items={[{ label: 'Suppliers', href: '/suppliers' }, { label: item.name ?? 'Supplier' }]}
	/>

	<!-- Cover image -->
	<div class="relative h-36 w-full overflow-hidden rounded-xl bg-muted sm:h-48">
		{#if item.coverImage}
			<img
				src={item.coverImage}
				alt={`${item.name} cover image`}
				class="h-full w-full object-cover"
				loading="eager"
				fetchpriority="high"
				decoding="async"
				width="1200"
				height="640"
				onerror={(e) => {
					(e.currentTarget as HTMLElement).style.display = 'none';
				}}
			/>
		{:else}
			<div class="h-full w-full bg-gradient-to-br from-primary/10 to-muted"></div>
		{/if}
	</div>

	<!-- Company info -->
	<div class="relative mx-auto -mt-8 max-w-6xl">
		<div class="mb-3 flex items-end gap-4">
			<div
				class="flex size-12 items-center justify-center rounded-xl border-4 border-background bg-primary/10 text-lg font-bold text-primary shadow-sm"
			>
				{item.logoInitials ?? item.name?.slice(0, 2) ?? '?'}
			</div>
			<div class="min-w-0 flex-1">
				<div class="flex flex-wrap items-center gap-2">
					<h1 class="text-xl font-bold tracking-tight">{item.name}</h1>
					{#if item.isBrand}
						<Badge variant="secondary" class="text-[10px]">Brand owner</Badge>
					{/if}
				</div>
				<p class="mt-0.5 text-[10px] text-muted-foreground">
					Est. {item.yearEstablished ?? '—'}
				</p>
				<div class="mt-1 flex flex-wrap gap-1">
					{#if item.status === 'active'}
						<span class="inline-flex items-center gap-1 rounded-full border border-success/20 bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">
							<ShieldCheck class="size-2.5"></ShieldCheck>
							Verified
						</span>
					{/if}
					{#if item.country}
						<Badge variant="outline" class="text-[10px] font-medium {regionBadgeClass(getRegion(item.country))}">
							{item.country}
						</Badge>
					{/if}
					{#if item.businessType}
						<Badge variant="outline" class="text-[10px] font-medium capitalize {typeBadgeCls(item.businessType)}">
							{item.businessType}
						</Badge>
					{/if}
					{#each visibleCerts as cert (cert.bodyId || cert.name)}
						{#if cert.bodyId}
							<a href={localizeHref(`/certifying-bodies/${cert.bodyId}`)}>
								<Badge
									variant="outline"
									class="text-xs font-semibold transition-colors hover:shadow-md {cert.country
										? regionBadgeClass(getRegion(cert.country))
										: 'bg-muted text-muted-foreground'}">{cert.name}</Badge
								>
							</a>
						{:else}
							<Badge
								variant="outline"
								class="text-xs font-semibold {cert.country
									? regionBadgeClass(getRegion(cert.country))
									: 'bg-muted text-muted-foreground'}">{cert.name}</Badge
							>
						{/if}
					{/each}
					{#if hiddenCertCount > 0}
						<a href="#certifications">
							<Badge variant="secondary" class="text-[10px]">+{hiddenCertCount} more</Badge>
						</a>
					{/if}
				</div>
			</div>
		</div>

		<!-- Action buttons -->
		<div class="mb-3 flex gap-1">
			<Button variant="outline" size="sm" class="h-7 flex-1 gap-1 text-[10px]" onclick={toggleSave}>
				<Heart class="size-2.5" fill={saved ? 'currentColor' : 'none'}></Heart>
				{saved ? 'Saved' : 'Save'}
			</Button>
			{#if item.website}
				<Button
					href={item.website}
					target="_blank"
					rel="noopener"
					variant="outline"
					size="sm"
					class="h-7 flex-1 gap-1 text-[10px]"
				>
					<Globe class="size-2.5"></Globe>
					Website
				</Button>
			{/if}
			<Button
				size="sm"
				class="h-7 flex-[2] text-[10px]"
				onclick={() => {
					inquiryResult = null;
					inquiryOpen = true;
				}}
			>
				<Send class="size-2.5"></Send>
				Contact Supplier
			</Button>
		</div>

		<!-- Share -->
		<div class="mb-3 flex flex-wrap items-center gap-2">
			<span class="text-[10px] text-muted-foreground">Share:</span>
			<ShareButtons title={item.name ?? 'HalalNeo supplier'} text={item.description ?? ''} />
		</div>

		<!-- Stats row -->
		<div class="mb-4 grid grid-cols-2 gap-1 sm:grid-cols-4">
			<StatTile value={products.length} label="Products" tone="primary" />
			<StatTile value={certifications.length} label="Certifications" tone="success" />
			<StatTile value={mainMarkets.length > 0 ? mainMarkets.length : (item.mainMarkets?.length ?? '—')} label="Markets" tone="info" />
			<StatTile value={item.yearEstablished ?? '—'} label="Est." tone="success" />
		</div>

		<div class="grid gap-3 sm:gap-4 lg:grid-cols-5">
			<div class="min-w-0 space-y-4 lg:col-span-3">
				<!-- About -->
				<section>
					<h2 class="mb-1 text-sm font-semibold">About</h2>
					<div class="text-xs leading-relaxed text-foreground/80">
						<p>{item.description ?? 'No description available.'}</p>
					</div>
				</section>

				<!-- Certifications -->
				{#if certifications.length > 0}
					<section id="certifications" class="scroll-mt-24">
						<h2 class="mb-1.5 text-sm font-semibold">Certifications</h2>
						<div class="grid gap-1.5 sm:grid-cols-2">
							{#each certifications as cert (cert.bodyId || cert.name)}
								{@const expired = isExpired(cert.expiry)}
								<Card class="p-3">
									<CardContent class="space-y-1.5 p-0">
										<div class="flex items-start justify-between gap-2">
											<div class="flex items-center gap-1.5">
												<div
													class="flex size-6 shrink-0 items-center justify-center rounded-lg {expired ? 'bg-destructive/10 text-destructive' : 'bg-success/10 text-success'}"
												>
													<ShieldCheck class="size-3.5"></ShieldCheck>
												</div>
												{#if cert.bodyId}
													<a
														href={localizeHref(`/certifying-bodies/${cert.bodyId}`)}
														class="text-[11px] font-semibold hover:text-primary"
													>
														{cert.name}
													</a>
												{:else}
													<h3 class="text-[11px] font-semibold">{cert.name}</h3>
												{/if}
											</div>
											{#if expired}
												<Badge variant="destructive" class="shrink-0 text-[10px]">Expired</Badge>
											{:else if cert.status}
												<Badge variant="secondary" class="shrink-0 text-[10px] capitalize">{cert.status}</Badge>
											{/if}
										</div>
										{#if cert.scope}
											<p class="text-[11px] text-muted-foreground">Scope: {cert.scope}</p>
										{/if}
										<dl class="space-y-0.5 text-[10px]">
											{#if cert.standard}
												<div class="flex justify-between gap-2"><dt class="text-muted-foreground">Standard</dt><dd class="font-medium">{cert.standard}</dd></div>
											{/if}
											{#if cert.number}
												<div class="flex justify-between gap-2"><dt class="text-muted-foreground">Certificate</dt><dd class="font-medium">{cert.number}</dd></div>
											{/if}
											{#if cert.expiry}
												<div class="flex justify-between gap-2"><dt class="text-muted-foreground">Valid until</dt><dd class="font-medium {expired ? 'text-destructive' : ''}">{cert.expiry}</dd></div>
											{/if}
										</dl>
									</CardContent>
								</Card>
							{/each}
						</div>
					</section>
				{/if}

				<!-- Products -->
				{#if products.length > 0}
					<section>
						<div class="mb-1 flex items-center justify-between">
							<h2 class="text-sm font-semibold">Products ({products.length})</h2>
						</div>
						<div class="grid grid-cols-2 gap-1.5 sm:grid-cols-3">
							{#each products as product, i (product.slug)}
								<a
									href={localizeHref(`/product/${product.slug}`)}
									class="group flex flex-col rounded-xl bg-card ring-1 ring-foreground/10 transition-all hover:-translate-y-0.5 hover:shadow-md"
								>
									<div class="relative aspect-[16/10] overflow-hidden rounded-t-xl bg-muted">
										{#if product.image}
											<img
												src={product.image}
												alt={product.name}
												class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
												loading="lazy"
											/>
										{:else}
											<div class="flex h-full w-full items-center justify-center {TILE_COLORS[i % TILE_COLORS.length]}">
												<Package class="size-6 opacity-60"></Package>
											</div>
										{/if}
										{#if product.certStatus === 'certified'}
											<span class="absolute top-1 left-1 inline-flex items-center gap-0.5 rounded-full border border-success/20 bg-background/80 px-1.5 py-px text-[9px] font-semibold text-success backdrop-blur-sm">
												<ShieldCheck class="size-2.5"></ShieldCheck>
												Cert
											</span>
										{/if}
									</div>
									<div class="flex flex-1 flex-col gap-1 p-2">
										<h3 class="line-clamp-2 text-[11px] font-medium leading-snug transition-colors group-hover:text-primary">
											{product.name}
										</h3>
										<div class="mt-auto flex items-center justify-between gap-1.5">
											<span class="truncate text-[10px] font-semibold text-primary">
												{productPrice(product) || (product.moq ? `MOQ ${product.moq}` : '')}
											</span>
											{#if product.moq && product.priceMin}
												<span class="truncate text-[9px] text-muted-foreground">MOQ {product.moq}</span>
											{/if}
										</div>
									</div>
								</a>
							{/each}
						</div>
					</section>
				{/if}
			</div>

			<aside class="min-w-0 space-y-3 sm:space-y-4 lg:col-span-2 lg:sticky lg:top-20 lg:self-start">
				<!-- Company facts -->
				<Card class="p-4">
					<CardTitle class="mb-3 text-sm">Company facts</CardTitle>
					<CardContent class="space-y-2 p-0 text-xs">
						<div class="flex items-start gap-2">
							<Building2 class="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
							<div class="min-w-0 flex-1">
								<p class="text-[10px] text-muted-foreground">Business type</p>
								<p class="font-medium">{item.businessType ?? '—'}</p>
							</div>
						</div>
						<Separator />
						<div class="flex items-start gap-2">
							<CalendarCheck class="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
							<div class="min-w-0 flex-1">
								<p class="text-[10px] text-muted-foreground">Established</p>
								<p class="font-medium">{item.yearEstablished ?? '—'}</p>
							</div>
						</div>
						{#if memberSinceYear}
							<Separator />
							<div class="flex items-start gap-2">
								<CalendarPlus class="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
								<div class="min-w-0 flex-1">
									<p class="text-[10px] text-muted-foreground">Member since</p>
									<p class="font-medium">{memberSinceYear}</p>
								</div>
							</div>
						{/if}
						{#if item.employeeCount}
							<Separator />
							<div class="flex items-start gap-2">
								<Users class="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
								<div class="min-w-0 flex-1">
									<p class="text-[10px] text-muted-foreground">Employees</p>
									<p class="font-medium">{item.employeeCount}</p>
								</div>
							</div>
						{/if}
						{#if item.productionCapacity}
							<Separator />
							<div class="flex items-start gap-2">
								<Factory class="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
								<div class="min-w-0 flex-1">
									<p class="text-[10px] text-muted-foreground">Production capacity</p>
									<p class="font-medium">{item.productionCapacity}</p>
								</div>
							</div>
						{/if}
						{#if mainMarkets.length > 0}
							<Separator />
							<div class="flex items-start gap-2">
								<MapPin class="mt-0.5 size-3.5 shrink-0 text-muted-foreground" />
								<div class="min-w-0 flex-1">
									<p class="text-[10px] text-muted-foreground">Markets served</p>
									<div class="mt-1 flex flex-wrap gap-1">
										{#each mainMarkets as m (m)}
											<Badge variant="secondary" class="text-[10px]">{m}</Badge>
										{/each}
									</div>
								</div>
							</div>
						{/if}
					</CardContent>
				</Card>

				<!-- Contact -->
				<Card class="p-4">
					<CardTitle class="mb-3 text-sm">Contact</CardTitle>
					<CardContent class="space-y-2 p-0 text-xs">
						{#if item.website}
							<a
								href={item.website}
								target="_blank"
								rel="noopener"
								class="flex items-center gap-2 font-medium text-primary hover:underline"
							>
								<Globe class="size-3.5 shrink-0 text-muted-foreground" />
								<span class="truncate">{item.website.replace(/^https?:\/\//, '')}</span>
							</a>
						{/if}
						{#if item.email}
							<a href="mailto:{item.email}" class="flex items-center gap-2 font-medium hover:text-primary">
								<Mail class="size-3.5 shrink-0 text-muted-foreground" />
								<span class="truncate">{item.email}</span>
							</a>
						{/if}
						{#if item.phone}
							<a href="tel:{item.phone}" class="flex items-center gap-2 font-medium hover:text-primary">
								<Phone class="size-3.5 shrink-0 text-muted-foreground" />
								{item.phone}
							</a>
						{/if}
						{#if item.whatsapp}
							<a
								href="https://wa.me/{String(item.whatsapp).replace(/[^0-9]/g, '')}"
								target="_blank"
								rel="noopener"
								class="flex items-center gap-2 font-medium hover:text-primary"
							>
								<MessageCircle class="size-3.5 shrink-0 text-muted-foreground" />
								WhatsApp
							</a>
						{/if}
						{#if item.line}
							<a
								href={item.line.startsWith('http') ? item.line : `https://line.me/R/ti/p/@${item.line}`}
								target="_blank"
								rel="noopener"
								class="flex items-center gap-2 font-medium hover:text-primary"
							>
								<span class="flex size-3.5 shrink-0 items-center justify-center rounded-sm bg-success/15 text-[7px] font-black text-success">L</span>
								LINE<span class="truncate text-[10px] font-normal text-muted-foreground">{item.line}</span>
							</a>
						{/if}
						{#if !hasDirectContact}
							<p class="text-[11px] leading-relaxed text-muted-foreground">
								This supplier has not listed direct contact details. Send an inquiry and
								they typically respond within 2 business days.
							</p>
						{/if}
						<Button
							size="sm"
							class="mt-1 w-full text-[11px]"
							onclick={() => {
								inquiryResult = null;
								inquiryOpen = true;
							}}
						>
							<Send class="size-3"></Send>
							Send Inquiry
						</Button>
					</CardContent>
				</Card>
			</aside>
		</div>

		<RelatedLinks
			title="More suppliers"
			items={(data.relatedSuppliers ?? []).map((s: any) => ({
				label: s.name,
				description: [s.businessType, s.country].filter(Boolean).join(' · '),
				href: `/supplier/${s.slug}`
			}))}
		/>
	</div>
{:else}
	<div class="flex min-h-[50vh] items-center justify-center">
		<div class="space-y-4 text-center">
			<p class="text-lg text-muted-foreground">Supplier not found.</p>
			<Button href={localizeHref('/suppliers')} variant="outline">Browse Suppliers</Button>
		</div>
	</div>
{/if}

<!-- Inquiry Dialog -->
<Dialog bind:open={inquiryOpen}>
	<DialogContent class="sm:max-w-md">
		<DialogHeader>
			<DialogTitle>Contact Supplier</DialogTitle>
			<DialogDescription>
				Send an inquiry to {item?.name ?? 'this supplier'}.
			</DialogDescription>
		</DialogHeader>

		{#if inquiryResult}
			<div
				class={`rounded-lg px-3 py-2 text-sm ${inquiryResult.type === 'success' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}
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
				<Input type="text" bind:value={inquirySubject} placeholder="Inquiry about products..." />
			</Field>
		<Field>
			<FieldLabel>Message</FieldLabel>
			<Textarea
				bind:value={inquiryMessage}
				placeholder="I'm interested in..."
				rows={4}
			/>
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
