<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Card } from '#lib/components/ui/card/index.js';
	import { Alert, AlertDescription } from '#lib/components/ui/alert/index.js';
	import {
		Empty,
		EmptyHeader,
		EmptyTitle,
		EmptyDescription,
		EmptyContent
	} from '#lib/components/ui/empty/index.js';
	import BrandedEmptyMedia from '#lib/components/site/branded-empty-media.svelte';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import { Field, FieldLabel, FieldError } from '#lib/components/ui/field/index.js';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '#lib/components/ui/select/index.js';
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
	import { sanitizeHtml } from '#lib/sanitize.js';
	import { z } from 'zod';
	import { focusFirstInvalid, mergeServerDetails } from '#lib/utils/forms.js';
	import { toast } from 'svelte-sonner';
	import type { ApiList, SupplierMembershipItem } from '#lib/types/api.js';
	import FileTextIcon from '@lucide/svelte/icons/file-text';

	let { data } = $props();

	interface RelatedRequest {
		id: string;
		title: string;
		quantity?: string | null;
		destination?: string | null;
	}

	const rfq = $derived(data.rfq);
	const related = $derived((data.related ?? []) as RelatedRequest[]);

	let quoteOpen = $state(false);
	let mySuppliers = $state<SupplierMembershipItem[]>([]);
	let quoteSupplier = $state('');
	let quoteMessage = $state('');
	let quoteSending = $state(false);
	let quoteResult = $state<{ message: string } | null>(null);
	let fieldErrors = $state<Record<string, string>>({});
	let formEl = $state<HTMLFormElement | undefined>(undefined);

	const quoteClientSchema = z.object({
		supplierSlug: z.string().min(1, 'Select the supplier profile to quote as.'),
		message: z
			.string()
			.trim()
			.min(10, 'Please add at least 10 characters — price, MOQ, lead time.')
			.max(5000, 'Quote must be at most 5000 characters.')
	});

	async function openQuote() {
		quoteResult = null;
		quoteMessage = '';
		try {
			const res = await fetch('/api/supplier-memberships');
			if (res.ok) {
				const j = (await res.json()) as ApiList<SupplierMembershipItem>;
				mySuppliers = j.items ?? [];
				quoteSupplier = mySuppliers[0]?.supplierSlug ?? '';
			}
		} catch {
			mySuppliers = [];
		}
		quoteOpen = true;
	}

	async function submitQuote() {
		if (quoteSending) return;
		fieldErrors = {};
		const parsed = quoteClientSchema.safeParse({
			supplierSlug: quoteSupplier,
			message: quoteMessage
		});
		if (!parsed.success) {
			for (const issue of parsed.error.issues) {
				const key = String(issue.path[0] ?? '');
				if (key && !fieldErrors[key]) fieldErrors = { ...fieldErrors, [key]: issue.message };
			}
			focusFirstInvalid(formEl);
			return;
		}
		quoteSending = true;
		quoteResult = null;
		try {
			const res = await fetch('/api/inquiries', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					buyerSlug: 'rfq-' + rfq.id,
					supplierSlug: quoteSupplier,
					productSlug: null,
					subject: `Re: ${rfq.title}`,
					message: quoteMessage.trim()
				})
			});
			const j = (await res.json().catch(() => ({}))) as {
				error?: string;
				details?: Record<string, string[] | string | undefined>;
			};
			if (res.ok) {
				quoteMessage = '';
				quoteOpen = false;
				toast.success('Quote sent to the buyer!');
			} else {
				quoteResult = { message: j.error ?? 'Failed to send quote.' };
				if (res.status === 400 && j.details) {
					fieldErrors = mergeServerDetails(fieldErrors, j.details);
					focusFirstInvalid(formEl);
				}
			}
		} catch {
			quoteResult = { message: 'Network error. Please try again.' };
		} finally {
			quoteSending = false;
		}
	}

	function fmtDate(v: unknown): string {
		if (!v) return '';
		const d = new Date(String(v));
		return isNaN(d.getTime())
			? ''
			: d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
	}
</script>

<svelte:head>
	{@html `\u003cscript type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'BuyAction',
		name: rfq?.title ?? '',
		description: rfq?.description ?? '',
		url: `https://halalneo.com/rfqs/${rfq?.id ?? ''}`
	})}\u003c/script>`}
</svelte:head>

{#if rfq}
	<div class="mx-auto max-w-6xl space-y-4 sm:space-y-6">
		<Breadcrumb
			items={[{ label: 'Buying Requests', href: '/rfqs' }, { label: rfq.title ?? 'Request' }]}
		/>

		<div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
			<div class="max-w-2xl min-w-0 space-y-4">
				<div class="space-y-2">
					<div class="flex min-w-0 flex-wrap items-center gap-1.5">
						<Badge class="max-w-full truncate bg-success/15 text-2xs text-success">Open</Badge>
						{#if rfq.categorySlug}
							<Badge variant="outline" class="max-w-full truncate text-2xs"
								>{rfq.categorySlug.replace(/-/g, ' ')}</Badge
							>
						{/if}
					</div>
					<h1 class="line-clamp-2 text-xl font-bold tracking-tight sm:text-2xl">{rfq.title}</h1>
					<p
						class="flex min-w-0 flex-wrap items-center gap-1 text-xs text-muted-foreground tabular-nums"
					>
						<span>Posted {fmtDate(rfq.createdAt)}</span>
						{#if rfq.destination}
							<span>· ships to <span class="min-w-0 truncate">{rfq.destination}</span></span>
						{/if}
					</p>
				</div>

				<Card class="p-3 sm:p-4">
					<h2 class="mb-2 text-sm font-semibold">What the buyer needs</h2>
					<div class="content-body content-body-sm max-w-[65ch]">
						{@html sanitizeHtml(rfq.description ?? 'No details provided.')}
					</div>
				</Card>

				<div class="grid grid-cols-2 gap-1.5 sm:grid-cols-4 sm:gap-2">
					<div class="min-w-0 rounded-lg bg-muted/50 px-2.5 py-2">
						<div class="truncate text-2xs text-muted-foreground">Quantity</div>
						<div class="truncate text-sm font-medium tabular-nums">{rfq.quantity ?? '—'}</div>
					</div>
					<div class="min-w-0 rounded-lg bg-muted/50 px-2.5 py-2">
						<div class="truncate text-2xs text-muted-foreground">Target price</div>
						<div class="truncate text-sm font-medium tabular-nums">{rfq.targetPrice ?? '—'}</div>
					</div>
					<div class="min-w-0 rounded-lg bg-muted/50 px-2.5 py-2">
						<div class="truncate text-2xs text-muted-foreground">Destination</div>
						<div class="truncate text-sm font-medium">{rfq.destination ?? '—'}</div>
					</div>
					<div class="min-w-0 rounded-lg bg-muted/50 px-2.5 py-2">
						<div class="truncate text-2xs text-muted-foreground">Buyer country</div>
						<div class="truncate text-sm font-medium">{rfq.buyerCountry ?? '—'}</div>
					</div>
				</div>

				<div class="flex flex-wrap items-center gap-2">
					<span class="text-xs text-muted-foreground">Share:</span>
					<ShareButtons title={rfq.title ?? 'HalalNeo RFQ'} text={rfq.description ?? ''} />
				</div>

				<RelatedLinks
					title="More buying requests"
					items={related.map((r) => ({
						label: r.title,
						description: r.quantity ?? r.destination ?? '',
						href: `/rfqs/${r.id}`
					}))}
				/>
			</div>

			<aside class="min-w-0 space-y-3 lg:sticky lg:top-20 lg:self-start">
				<Card class="p-3 sm:p-4">
					<h3 class="mb-1 text-sm font-semibold">Quote this request</h3>
					<p class="mb-3 text-xs leading-relaxed text-muted-foreground">
						Supplier on HalalNeo? Send your quote directly — the buyer sees it in their inbox.
					</p>
					<Button class="w-full" onclick={openQuote}>Send a quote</Button>
				</Card>
				<Card class="p-3 sm:p-4">
					<h3 class="mb-1 text-sm font-semibold">Sourcing yourself?</h3>
					<p class="mb-3 text-xs leading-relaxed text-muted-foreground">
						Post your own buying request — free, 1 per week.
					</p>
					<Button href={localizeHref('/rfqs/new')} variant="outline" class="w-full" size="sm">
						Post a request
					</Button>
				</Card>
			</aside>
		</div>
	</div>
{:else}
	<Empty class="min-h-[50vh] border border-dashed">
		<EmptyHeader>
			<BrandedEmptyMedia><FileTextIcon class="size-6 text-muted-foreground" /></BrandedEmptyMedia>
			<EmptyTitle>Buying request not found</EmptyTitle>
			<EmptyDescription
				>This buying request may have been removed or is no longer available.</EmptyDescription
			>
		</EmptyHeader>
		<EmptyContent>
			<Button href={localizeHref('/rfqs')} size="sm">Browse buying requests</Button>
		</EmptyContent>
	</Empty>
{/if}

<Dialog bind:open={quoteOpen}>
	<DialogContent class="sm:max-w-md">
		<DialogHeader>
			<DialogTitle>Quote: {rfq?.title}</DialogTitle>
			<DialogDescription>Quotes go straight to the buyer's inbox.</DialogDescription>
		</DialogHeader>

		{#if quoteResult}
			<Alert variant="destructive">
				<AlertDescription>{quoteResult.message}</AlertDescription>
			</Alert>
		{/if}

		{#if mySuppliers.length === 0}
			<Alert>
				<AlertDescription>
					No supplier profile is linked to your account yet. Ask an admin to link your company after
					your supplier application is approved — then you can quote.
				</AlertDescription>
			</Alert>
		{:else}
			<form
				class="space-y-3"
				bind:this={formEl}
				onsubmit={(e) => {
					e.preventDefault();
					submitQuote();
				}}
			>
				<Field>
					<FieldLabel>Quoting as</FieldLabel>
					<Select type="single" bind:value={quoteSupplier}>
						<SelectTrigger
							class="w-full text-sm"
							aria-invalid={fieldErrors.supplierSlug ? true : undefined}
						>
							{quoteSupplier || 'Select supplier profile'}
						</SelectTrigger>
						<SelectContent>
							{#each mySuppliers as m (m.supplierSlug)}
								<SelectItem value={m.supplierSlug}>{m.supplierSlug}</SelectItem>
							{/each}
						</SelectContent>
					</Select>
					{#if fieldErrors.supplierSlug}<FieldError>{fieldErrors.supplierSlug}</FieldError>{/if}
				</Field>
				<Field>
					<FieldLabel>Your quote</FieldLabel>
					<Textarea
						bind:value={quoteMessage}
						placeholder="Price, MOQ, lead time, certifications..."
						rows={4}
						aria-invalid={fieldErrors.message ? true : undefined}
						oninput={() => {
							if (fieldErrors.message) fieldErrors = { ...fieldErrors, message: '' };
						}}
					/>
					{#if fieldErrors.message}<FieldError>{fieldErrors.message}</FieldError>{/if}
				</Field>
				<DialogFooter>
					<Button type="submit" disabled={quoteSending || !quoteMessage.trim()}>
						{quoteSending ? 'Sending...' : 'Send quote'}
					</Button>
				</DialogFooter>
			</form>
		{/if}
	</DialogContent>
</Dialog>
