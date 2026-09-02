<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Card, CardContent, CardHeader, CardTitle } from '#lib/components/ui/card/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Avatar, AvatarFallback } from '#lib/components/ui/avatar/index.js';
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
	import Share2 from '@lucide/svelte/icons/share-2';
	import Star from '@lucide/svelte/icons/star';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';

	let { data } = $props();

	// Save/favorite state
	let saved = $state(false);

	function toggleSave() {
		const favorites = JSON.parse(localStorage.getItem('saved_suppliers') || '[]');
		const idx = favorites.indexOf(data.item.slug);
		if (idx > -1) {
			favorites.splice(idx, 1);
			saved = false;
		} else {
			favorites.push(data.item.slug);
			saved = true;
		}
		localStorage.setItem('saved_suppliers', JSON.stringify(favorites));
	}

	// Initialize saved state from localStorage
	$effect(() => {
		if (data.item?.slug) {
			const favorites = JSON.parse(localStorage.getItem('saved_suppliers') || '[]');
			saved = favorites.includes(data.item.slug);
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
				const errBody = await res.json();
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
					address: item.country ? { '@type': 'PostalAddress', addressCountry: item.country } : undefined,
					employeeCount: item.employeeCount ?? undefined,
					numberOfEmployees: item.employeeCount ? { '@type': 'QuantitativeValue', value: item.employeeCount } : undefined
				}
			: null
	);

	const breadcrumbSchema = $derived({
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement: [
			{ '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
			{ '@type': 'ListItem', position: 2, name: 'Suppliers', item: `${baseUrl}/suppliers` },
			{ '@type': 'ListItem', position: 3, name: item?.name ?? 'Supplier', item: `${baseUrl}/suppliers/${data.slug}` }
		]
	});

	const certifications = $derived.by(() => {
		const raw = item?.certifications;
		if (!raw) return [];
		let arr: any[];
		if (typeof raw === 'string') {
			try { arr = JSON.parse(raw); } catch { return [{ name: raw, country: '', standard: '', expiry: '', status: 'certified' }]; }
		} else {
			arr = raw;
		}
		if (!Array.isArray(arr)) return [];
		return arr.map((c: any) => {
			if (typeof c === 'string') return { name: c, country: '', standard: '', expiry: '', status: 'certified' };
			return {
				name: c.body?.name ?? c.name ?? c.bodyId ?? 'Certified',
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
	<meta name="description" content={item?.description?.slice(0, 160) ?? `Halal-certified supplier ${item?.name ?? ''} from ${item?.country ?? ''}.`} />
	{#if supplierSchema}
		{@html `<script type="application/ld+json">${JSON.stringify(supplierSchema)}</script>`}
	{/if}
	{@html `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`}
</svelte:head>

{#if item}
	<Breadcrumb items={[{ label: 'Suppliers', href: '/suppliers' }, { label: item.name ?? 'Supplier' }]} />

	<!-- Cover image -->
	<div class="relative h-48 sm:h-64 w-full rounded-xl bg-muted overflow-hidden">
		{#if item.coverImage}
			<img src={item.coverImage} alt={`${item.name} cover image`} class="h-full w-full object-cover" loading="lazy" decoding="async" width="1200" height="640" onerror={(e) => { e.currentTarget.style.display='none'; }} />
		{:else}
			<div class="h-full w-full bg-gradient-to-br from-primary/10 to-muted"></div>
		{/if}
	</div>

	<!-- Company info -->
	<div class="relative -mt-8 mx-auto max-w-4xl">
		<div class="flex items-end gap-4 mb-3">
			<div class="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-lg font-bold text-primary border-4 border-background shadow-sm">
				{item.logoInitials ?? item.name?.slice(0, 2) ?? '?'}
			</div>
			<div class="flex-1 min-w-0">
				<h1 class="text-xl font-bold tracking-tight">{item.name}</h1>
				<p class="mt-0.5 text-[10px] text-muted-foreground">{item.country} · {item.businessType} · Est. {item.yearEstablished ?? '—'}</p>
				<div class="mt-1 flex flex-wrap gap-1">
					{#if item.status === 'active'}
						<Badge variant="secondary" class="gap-0.5 text-[9px]">
							<ShieldCheck class="size-2 text-green-600"></ShieldCheck>
							Verified
						</Badge>
					{/if}
					{#each certifications as cert}
						<Badge variant="secondary" class="text-[9px]">{cert.name}</Badge>
					{/each}
				</div>
			</div>
		</div>

		<!-- Action buttons -->
		<div class="mb-3 flex gap-1">
			<Button variant="outline" size="sm" class="flex-1 gap-1 h-7 text-[10px]" onclick={toggleSave}>
				<Heart class="size-2.5" fill={saved ? 'currentColor' : 'none'}></Heart>
				{saved ? 'Saved' : 'Save'}
			</Button>
			<Button variant="outline" size="sm" class="flex-1 gap-1 h-7 text-[10px]">
				<Share2 class="size-2.5"></Share2>
				Share
			</Button>
			<Button size="sm" class="flex-[2] h-7 text-[10px]" onclick={() => { inquiryResult = null; inquiryOpen = true; }}>
				<Send class="size-2.5"></Send>
				Contact Supplier
			</Button>
		</div>

		<!-- Stats row -->
		<div class="mb-3 grid grid-cols-4 gap-1">
			<div class="rounded-lg bg-card shadow-sm p-1.5 text-center">
				<div class="text-xs font-bold text-primary">{products.length}</div>
				<div class="text-[8px] text-muted-foreground">Products</div>
			</div>
			<div class="rounded-lg bg-card shadow-sm p-1.5 text-center">
				<div class="text-xs font-bold text-primary">{item.rating ?? 'N/A'}{item.rating ? '★' : ''}</div>
				<div class="text-[8px] text-muted-foreground">Rating</div>
			</div>
			<div class="rounded-lg bg-card shadow-sm p-1.5 text-center">
				<div class="text-xs font-bold text-primary">{item.mainMarkets?.length ?? '—'}</div>
				<div class="text-[8px] text-muted-foreground">Markets</div>
			</div>
			<div class="rounded-lg bg-card shadow-sm p-1.5 text-center">
				<div class="text-xs font-bold text-primary">{item.yearEstablished ?? '—'}</div>
				<div class="text-[8px] text-muted-foreground">Est.</div>
			</div>
		</div>

		<!-- About -->
		<div class="mb-4">
			<h2 class="mb-1 text-sm font-semibold">About</h2>
			<div class="text-xs text-muted-foreground leading-relaxed">
				<p>{item.description ?? 'No description available.'}</p>
			</div>
		</div>

		<!-- Certifications -->
		{#if certifications.length > 0}
			<div class="mb-3">
				<h2 class="mb-1 text-sm font-semibold">Certifications</h2>
				<div class="grid gap-1.5 sm:grid-cols-3">
					{#each certifications as cert}
						<div class="rounded-lg bg-card shadow-sm p-1.5">
							<div class="flex items-center gap-1.5">
								<div class="flex size-6 shrink-0 items-center justify-center rounded-lg bg-green-500/10 text-green-600">
									<ShieldCheck class="size-3.5"></ShieldCheck>
								</div>
								<div class="min-w-0 flex-1">
									<h3 class="text-[10px] font-medium truncate">{cert.name}</h3>
									<p class="text-[9px] text-muted-foreground">{cert.country}{cert.standard ? ` · ${cert.standard}` : ''}</p>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Products -->
		<div class="mb-3">
			<div class="mb-1 flex items-center justify-between">
				<h2 class="text-sm font-semibold">Products</h2>
				<a href={localizeHref(`/suppliers/${item.slug}/products`)} class="text-[10px] font-medium text-primary hover:underline">View all →</a>
			</div>
			<div class="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
				{#each products.slice(0, 4) as product}
					<a href={localizeHref(`/products/${product.slug}`)} class="group rounded-lg bg-card shadow-sm p-1.5 transition-all hover:shadow-md">
						<div class="mb-1 aspect-square rounded bg-muted flex items-center justify-center text-[10px] text-muted-foreground">
							{#if product.image}
								<img src={product.image} alt={product.name} class="h-full w-full rounded object-cover" loading="lazy" />
							{:else}
								No img
							{/if}
						</div>
						<h3 class="text-[10px] font-medium truncate group-hover:text-primary transition-colors">{product.name}</h3>
						<p class="text-[9px] text-muted-foreground">{product.moq ?? ''}</p>
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
				class={`rounded-lg px-3 py-2 text-sm ${inquiryResult.type === 'success' ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive'}`}
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
				<Input
					type="email"
					bind:value={inquiryEmail}
					placeholder="you@company.com"
				/>
			</Field>
			<Field>
				<FieldLabel>Subject</FieldLabel>
				<Input
					type="text"
					bind:value={inquirySubject}
					placeholder="Inquiry about products..."
				/>
			</Field>
			<Field>
				<FieldLabel>Message</FieldLabel>
				<textarea
					bind:value={inquiryMessage}
					placeholder="I'm interested in..."
					rows={4}
					class="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
				></textarea>
			</Field>
			<DialogFooter>
				<Button type="submit" disabled={inquirySending || !inquirySubject.trim() || !inquiryMessage.trim()}>
					{inquirySending ? 'Sending...' : 'Send Inquiry'}
				</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>
