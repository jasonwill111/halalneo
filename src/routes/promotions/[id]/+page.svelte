<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Card } from '#lib/components/ui/card/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import { Field, FieldLabel, FieldError } from '#lib/components/ui/field/index.js';
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
	import RelatedLinks from '#lib/components/site/related-links.svelte';
	import { z } from 'zod';
	import { toast } from 'svelte-sonner';
	import { focusFirstInvalid, mergeServerDetails } from '#lib/utils/forms.js';
	import Loader2 from '@lucide/svelte/icons/loader-2';
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
	let inquiryFieldErrors = $state<Record<string, string>>({});
	let inquiryFormEl = $state<HTMLFormElement | undefined>(undefined);

	const inquirySchema = z.object({
		inquiryEmail: z
			.string()
			.trim()
			.optional()
			.refine((v) => !v || z.string().email().safeParse(v).success, {
				message: 'Please enter a valid email.'
			}),
		inquirySubject: z.string().trim().min(1, 'Subject is required.'),
		inquiryMessage: z.string().trim().min(10, 'Message must be at least 10 characters.')
	});

	async function submitInquiry() {
		if (inquirySending) return;
		inquiryFieldErrors = {};
		const parsed = inquirySchema.safeParse({ inquiryEmail, inquirySubject, inquiryMessage });
		if (!parsed.success) {
			for (const issue of parsed.error.issues) {
				const key = String(issue.path[0] ?? '');
				if (key && !inquiryFieldErrors[key])
					inquiryFieldErrors = { ...inquiryFieldErrors, [key]: issue.message };
			}
			focusFirstInvalid(inquiryFormEl);
			return;
		}
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
			const j = (await res.json().catch(() => ({}))) as {
				error?: string;
				details?: Record<string, string[]>;
			};
			if (res.ok) {
				inquiryResult = { type: 'success', message: 'Inquiry sent successfully!' };
				inquirySubject = '';
				inquiryMessage = '';
				inquiryEmail = '';
				inquiryFieldErrors = {};
				toast.success('Inquiry sent. The supplier will reply by email.');
			} else {
				const failMessage = j.error ?? 'Failed to send inquiry.';
				inquiryResult = { type: 'error', message: failMessage };
				toast.error(failMessage);
				if (res.status === 400 && j.details) {
					inquiryFieldErrors = mergeServerDetails(inquiryFieldErrors, {
						inquirySubject: j.details.subject,
						inquiryMessage: j.details.message,
						inquiryEmail: j.details.buyerSlug ?? j.details.supplierSlug
					});
					focusFirstInvalid(inquiryFormEl);
				}
			}
		} catch {
			inquiryResult = { type: 'error', message: 'Network error. Please try again.' };
			toast.error('Network error. Please try again.');
		} finally {
			inquirySending = false;
		}
	}

	interface PromotionPriceFields {
		priceMin?: string | number | null;
		priceMax?: string | number | null;
		priceUnit?: string | null;
	}

	function priceText(p: PromotionPriceFields): string {
		if (!p?.priceMin) return 'Price on request';
		const range = p.priceMax ? `$${p.priceMin}–$${p.priceMax}` : `$${p.priceMin}`;
		return p.priceUnit ? `${range}/${p.priceUnit}` : range;
	}

	const moreDeals = $derived(
		(data.otherPromos ?? []).map((p) => ({
			label: p.title,
			description: priceText(p),
			href: `/promotions/${p.id}`
		}))
	);
</script>

<svelte:head>
	{@html `\u003cscript type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'Offer',
		name: promo?.title ?? '',
		description: promo?.description ?? '',
		price: promo?.priceMin ?? '',
		priceCurrency: 'USD',
		url: `https://halalneo.com/promotions/${promo?.id ?? ''}`
	})}\u003c/script>`}
</svelte:head>

{#if promo}
	<div class="mx-auto max-w-6xl space-y-4 sm:space-y-6">
		<Breadcrumb
			items={[{ label: 'Quick Deals', href: '/promotions' }, { label: promo.title ?? 'Deal' }]}
		/>

		<div class="grid gap-4 lg:grid-cols-[1fr_320px]">
			<div class="min-w-0 space-y-4">
				<div class="space-y-2">
					<div class="flex flex-wrap items-center gap-1.5">
						<Badge class="bg-success/15 text-2xs text-success">Deal</Badge>
						{#if promo.discountPct}
							<Badge variant="destructive" class="text-2xs">-{promo.discountPct}%</Badge>
						{/if}
					</div>
					<h1 class="text-xl font-bold tracking-tight sm:text-2xl">{promo.title}</h1>
					{#if promo.description}
						<p class="text-sm leading-relaxed text-muted-foreground">{promo.description}</p>
					{/if}
				</div>

				<div class="space-y-3 rounded-xl bg-card p-3 sm:p-4">
					<div class="text-lg font-bold text-primary sm:text-2xl">{priceText(promo)}</div>
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
							inquiryFieldErrors = {};
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

		<RelatedLinks title="More quick deals" items={moreDeals} />
	</div>
{:else}
	<div class="flex min-h-[50vh] items-center justify-center">
		<div class="space-y-4 text-center">
			<p class="text-sm text-muted-foreground">Deal not found.</p>
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
			bind:this={inquiryFormEl}
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
					aria-invalid={inquiryFieldErrors.inquiryEmail ? true : undefined}
					oninput={() => {
						if (inquiryFieldErrors.inquiryEmail)
							inquiryFieldErrors = { ...inquiryFieldErrors, inquiryEmail: '' };
					}}
				/>
				{#if inquiryFieldErrors.inquiryEmail}<FieldError
						>{inquiryFieldErrors.inquiryEmail}</FieldError
					>{/if}
			</Field>
			<Field>
				<FieldLabel>Subject</FieldLabel>
				<Input
					type="text"
					bind:value={inquirySubject}
					placeholder="Interested in this deal..."
					aria-invalid={inquiryFieldErrors.inquirySubject ? true : undefined}
					oninput={() => {
						if (inquiryFieldErrors.inquirySubject)
							inquiryFieldErrors = { ...inquiryFieldErrors, inquirySubject: '' };
					}}
				/>
				{#if inquiryFieldErrors.inquirySubject}<FieldError
						>{inquiryFieldErrors.inquirySubject}</FieldError
					>{/if}
			</Field>
			<Field>
				<FieldLabel>Message</FieldLabel>
				<Textarea
					bind:value={inquiryMessage}
					placeholder="Quantity, delivery terms..."
					rows={4}
					aria-invalid={inquiryFieldErrors.inquiryMessage ? true : undefined}
					oninput={() => {
						if (inquiryFieldErrors.inquiryMessage)
							inquiryFieldErrors = { ...inquiryFieldErrors, inquiryMessage: '' };
					}}
				/>
				{#if inquiryFieldErrors.inquiryMessage}<FieldError
						>{inquiryFieldErrors.inquiryMessage}</FieldError
					>{/if}
			</Field>
			<DialogFooter>
				<Button
					type="submit"
					disabled={inquirySending || !inquirySubject.trim() || !inquiryMessage.trim()}
					aria-busy={inquirySending}
				>
					{#if inquirySending}
						<Loader2 class="size-3.5 animate-spin" />
						Sending...
					{:else}
						Send Inquiry
					{/if}
				</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>
