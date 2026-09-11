<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Card } from '#lib/components/ui/card/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import { Field, FieldLabel } from '#lib/components/ui/field/index.js';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle
	} from '#lib/components/ui/dialog/index.js';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import ShareButtons from '#lib/components/site/share-buttons.svelte';
	import TagIcon from '@lucide/svelte/icons/tag';
	import Send from '@lucide/svelte/icons/send';

	let { data } = $props();
	const promo = $derived(data.promo);

	let inquiryOpen = $state(false);
	let inquiryEmail = $state('');
	let inquirySubject = $state('');
	let inquiryMessage = $state('');
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
					supplierSlug: promo?.supplierSlug ?? null,
					productSlug: promo?.productSlug ?? null,
					subject: inquirySubject.trim(),
					message: inquiryMessage.trim()
				})
			});
			const j = (await res.json().catch(() => ({}))) as any;
			if (res.ok) {
				inquiryResult = { type: 'success', message: 'Inquiry sent successfully!' };
				inquirySubject = '';
				inquiryMessage = '';
				inquiryEmail = '';
			} else {
				inquiryResult = { type: 'error', message: j.error ?? 'Failed to send inquiry.' };
			}
		} catch {
			inquiryResult = { type: 'error', message: 'Network error. Please try again.' };
		} finally {
			inquirySending = false;
		}
	}

	function priceText(p: any): string {
		if (!p?.priceMin) return 'Price on request';
		const range = p.priceMax ? `$${p.priceMin}–$${p.priceMax}` : `$${p.priceMin}`;
		return p.priceUnit ? `${range}/${p.priceUnit}` : range;
	}
</script>

{#if promo}
	<div class="mx-auto max-w-6xl space-y-4 sm:space-y-6">
		<Breadcrumb items={[{ label: 'Quick Deals', href: '/promotions' }, { label: promo.title ?? 'Deal' }]} />

		<div class="grid gap-4 lg:grid-cols-[1fr_320px]">
			<div class="min-w-0 space-y-4">
				<div class="space-y-2">
					<div class="flex flex-wrap items-center gap-1.5">
						<Badge class="bg-success/15 text-success text-[10px]">Deal</Badge>
						{#if promo.discountPct}
							<Badge variant="destructive" class="text-[10px]">-{promo.discountPct}%</Badge>
						{/if}
					</div>
					<h1 class="text-xl font-bold tracking-tight sm:text-2xl">{promo.title}</h1>
					{#if promo.description}
						<p class="text-sm leading-relaxed text-muted-foreground">{promo.description}</p>
					{/if}
				</div>

				<div class="space-y-3 rounded-xl bg-card p-4">
					<div class="text-2xl font-bold text-primary">{priceText(promo)}</div>
					{#if promo.moq}
						<div class="text-xs text-muted-foreground">MOQ: {promo.moq}</div>
					{/if}
					{#if promo.validUntil}
						<div class="flex items-center gap-1.5 text-xs text-muted-foreground">
							<TagIcon class="size-3.5" />
							Valid until {promo.validUntil}
						</div>
					{/if}
					<Button
						class="w-full gap-2"
						onclick={() => {
							inquiryResult = null;
							inquiryOpen = true;
						}}
					>
						<Send class="size-4" />
						Claim this deal
					</Button>
				</div>

				<div class="flex items-center gap-2">
					<span class="text-xs text-muted-foreground">Share:</span>
					<ShareButtons title={promo.title ?? 'HalalNeo deal'} text={promo.description ?? ''} />
				</div>
			</div>

			<aside class="min-w-0 space-y-3 lg:sticky lg:top-20 lg:self-start">
				<Card class="p-4">
					<h3 class="mb-1 text-sm font-semibold">Sold by</h3>
					<p class="truncate text-sm font-medium">{data.supplierName}</p>
					<Button
						href={localizeHref(`/supplier/${promo.supplierSlug}`)}
						variant="outline"
						size="sm"
						class="mt-3 w-full"
					>
						View Supplier Profile
					</Button>
				</Card>
			</aside>
		</div>
	</div>
{:else}
	<div class="flex min-h-[50vh] items-center justify-center">
		<div class="space-y-4 text-center">
			<p class="text-lg text-muted-foreground">Deal not found.</p>
			<Button href={localizeHref('/promotions')} variant="outline">Browse Deals</Button>
		</div>
	</div>
{/if}

<Dialog bind:open={inquiryOpen}>
	<DialogContent class="sm:max-w-md">
		<DialogHeader>
			<DialogTitle>Claim this deal</DialogTitle>
			<DialogDescription>
				Send an inquiry to {data.supplierName} about {promo?.title ?? 'this deal'}.
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
				<Input type="text" bind:value={inquirySubject} placeholder="Interested in this deal..." />
			</Field>
			<Field>
				<FieldLabel>Message</FieldLabel>
				<Textarea bind:value={inquiryMessage} placeholder="Quantity, delivery terms..." rows={4} />
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
