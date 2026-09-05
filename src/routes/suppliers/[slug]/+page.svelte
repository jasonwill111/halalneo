<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Avatar, AvatarFallback } from '#lib/components/ui/avatar/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import { Field, FieldLabel } from '#lib/components/ui/field/index.js';
	import StatTile from '#lib/components/site/stat-tile.svelte';
	import ShareButtons from '#lib/components/site/share-buttons.svelte';
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
	import Star from '@lucide/svelte/icons/star';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import { getRegion, regionBadgeClass } from '#lib/utils/region.js';
	import { isFavorite, toggleFavorite } from '#lib/favorites.js';

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

	const baseUrl = 'https://halalneo.com';

	const supplierSchema = $derived(
		item
			? {
					'@context': 'https://schema.org',
					'@type': 'Organization',
					name: item.name,
					description: item.description ?? '',
					url: `${baseUrl}/suppliers/${data.slug}`,
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
				item: `${baseUrl}/suppliers/${data.slug}`
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
				return [{ name: raw, bodyId: '', country: '', standard: '', expiry: '', status: 'certified' }];
			}
		} else {
			arr = raw;
		}
		if (!Array.isArray(arr)) return [];
		return arr.map((c: any) => {
			if (typeof c === 'string')
				return { name: c, bodyId: '', country: '', standard: '', expiry: '', status: 'certified' };
			return {
				name: c.body?.name ?? c.name ?? c.bodyId ?? 'Certified',
				bodyId: c.body?.id ?? c.bodyId ?? '',
				country: c.body?.country ?? c.country ?? '',
				standard: c.body?.standard ?? '',
				expiry: c.expiry ?? '',
				status: c.status ?? 'certified'
			};
		});
	});
</script>

<svelte:head>
	<title>{item?.name ?? 'Supplier'} — HalalNeo</title>
	<meta
		name="description"
		content={item?.description?.slice(0, 160) ??
			`Halal-certified supplier ${item?.name ?? ''} from ${item?.country ?? ''}.`}
	/>
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
	<div class="relative mx-auto -mt-8 max-w-4xl">
		<div class="mb-3 flex items-end gap-4">
			<div
				class="flex size-12 items-center justify-center rounded-2xl border-4 border-background bg-primary/10 text-lg font-bold text-primary shadow-sm"
			>
				{item.logoInitials ?? item.name?.slice(0, 2) ?? '?'}
			</div>
			<div class="min-w-0 flex-1">
				<h1 class="text-xl font-bold tracking-tight">{item.name}</h1>
				<p class="mt-0.5 text-[10px] text-muted-foreground">
					{item.country} · {item.businessType} · Est. {item.yearEstablished ?? '—'}
				</p>
				<div class="mt-1 flex flex-wrap gap-1">
					{#if item.status === 'active'}
						<Badge variant="secondary" class="gap-0.5 text-[10px]">
							<ShieldCheck class="size-2 text-success"></ShieldCheck>
							Verified
						</Badge>
					{/if}
					{#each certifications as cert}
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
				</div>
			</div>
		</div>

		<!-- Action buttons -->
		<div class="mb-3 flex gap-1">
			<Button variant="outline" size="sm" class="h-7 flex-1 gap-1 text-[10px]" onclick={toggleSave}>
				<Heart class="size-2.5" fill={saved ? 'currentColor' : 'none'}></Heart>
				{saved ? 'Saved' : 'Save'}
			</Button>
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
		<div class="mb-3 grid grid-cols-2 gap-1 sm:grid-cols-4">
			<StatTile value={products.length} label="Products" tone="primary" />
			<StatTile value={item.rating ? `${item.rating}` : 'N/A'} label="Rating" tone="warn" />
			<StatTile value={item.mainMarkets?.length ?? '—'} label="Markets" tone="info" />
			<StatTile value={item.yearEstablished ?? '—'} label="Est." tone="success" />
		</div>

		<!-- About -->
		<div class="mb-4">
			<h2 class="mb-1 text-sm font-semibold">About</h2>
			<div class="text-xs leading-relaxed text-foreground/80">
				<p>{item.description ?? 'No description available.'}</p>
			</div>
		</div>

		<!-- Certifications -->
		{#if certifications.length > 0}
			<div class="mb-3">
				<h2 class="mb-1 text-sm font-semibold">Certifications</h2>
				<div class="grid gap-1.5 sm:grid-cols-3">
					{#each certifications as cert}
						<a
							href={cert.bodyId ? localizeHref(`/certifying-bodies/${cert.bodyId}`) : undefined}
							class="rounded-xl bg-card p-1.5 ring-1 ring-foreground/10 transition-all {cert.bodyId
								? 'hover:shadow-md'
								: ''}"
						>
							<div class="flex items-center gap-1.5">
								<div
									class="flex size-6 shrink-0 items-center justify-center rounded-lg bg-success/10 text-success"
								>
									<ShieldCheck class="size-3.5"></ShieldCheck>
								</div>
								<div class="min-w-0 flex-1">
									<h3
										class="truncate text-[10px] font-medium {cert.bodyId
											? 'hover:text-primary'
											: ''}"
									>
										{cert.name}
									</h3>
									<p class="text-[10px] text-muted-foreground">
										{cert.country}{cert.standard ? ` · ${cert.standard}` : ''}
									</p>
								</div>
							</div>
						</a>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Products -->
		<div class="mb-3">
			<div class="mb-1 flex items-center justify-between">
				<h2 class="text-sm font-semibold">Products</h2>
				<a
					href={localizeHref(`/suppliers/${item.slug}/products`)}
					class="text-[10px] font-medium text-primary hover:underline">View all →</a
				>
			</div>
			<div class="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
				{#each products.slice(0, 4) as product}
					<a
						href={localizeHref(`/products/${product.slug}`)}
						class="group rounded-xl bg-card p-1.5 ring-1 ring-foreground/10 transition-all hover:shadow-md"
					>
						<div
							class="mb-1 flex aspect-square items-center justify-center rounded bg-muted text-[10px] text-muted-foreground"
						>
							{#if product.image}
								<img
									src={product.image}
									alt={product.name}
									class="h-full w-full rounded object-cover"
									loading="lazy"
								/>
							{:else}
								No img
							{/if}
						</div>
						<h3 class="truncate text-[10px] font-medium transition-colors group-hover:text-primary">
							{product.name}
						</h3>
						<p class="text-[10px] text-muted-foreground">{product.moq ?? ''}</p>
					</a>
				{/each}
			</div>
		</div>
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
