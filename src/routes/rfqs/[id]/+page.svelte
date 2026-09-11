<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Card } from '#lib/components/ui/card/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import { Field, FieldLabel, FieldDescription } from '#lib/components/ui/field/index.js';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '#lib/components/ui/select/index.js';
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

	let { data } = $props();
	const rfq = $derived(data.rfq);

	let quoteOpen = $state(false);
	let mySuppliers = $state<any[]>([]);
	let quoteSupplier = $state('');
	let quoteMessage = $state('');
	let quoteSending = $state(false);
	let quoteResult = $state<{ type: 'success' | 'error'; message: string } | null>(null);

	async function openQuote() {
		quoteResult = null;
		quoteMessage = '';
		try {
			const res = await fetch('/api/supplier-memberships');
			if (res.ok) {
				const j = (await res.json()) as any;
				mySuppliers = j.items ?? [];
				quoteSupplier = mySuppliers[0]?.supplierSlug ?? '';
			}
		} catch {
			mySuppliers = [];
		}
		quoteOpen = true;
	}

	async function submitQuote() {
		if (!quoteSupplier || !quoteMessage.trim()) return;
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
			const j = (await res.json().catch(() => ({}))) as any;
			if (res.ok) {
				quoteResult = { type: 'success', message: 'Quote sent to the buyer!' };
				quoteMessage = '';
			} else {
				quoteResult = { type: 'error', message: j.error ?? 'Failed to send quote.' };
			}
		} catch {
			quoteResult = { type: 'error', message: 'Network error. Please try again.' };
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

{#if rfq}
	<div class="mx-auto max-w-6xl space-y-4 sm:space-y-6">
		<Breadcrumb items={[{ label: 'Buying Requests', href: '/rfqs' }, { label: rfq.title ?? 'Request' }]} />

		<div class="grid gap-4 lg:grid-cols-[1fr_320px]">
			<div class="min-w-0 space-y-4">
				<div class="space-y-2">
					<div class="flex flex-wrap items-center gap-1.5">
						<Badge class="bg-success/15 text-success text-[10px]">Open</Badge>
						{#if rfq.categorySlug}
							<Badge variant="outline" class="text-[10px]">{rfq.categorySlug.replace(/-/g, ' ')}</Badge>
						{/if}
					</div>
					<h1 class="text-xl font-bold tracking-tight sm:text-2xl">{rfq.title}</h1>
					<p class="text-xs text-muted-foreground">
						Posted {fmtDate(rfq.createdAt)}{#if rfq.destination} · ships to {rfq.destination}{/if}
					</p>
				</div>

				<Card class="p-4">
					<h2 class="mb-2 text-sm font-semibold">What the buyer needs</h2>
					<div class="prose prose-sm max-w-none text-sm leading-relaxed">
						{@html sanitizeHtml(rfq.description ?? 'No details provided.')}
					</div>
				</Card>

				<div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
					<div class="rounded-xl bg-muted/50 px-3 py-2">
						<div class="text-xs text-muted-foreground">Quantity</div>
						<div class="text-sm font-medium">{rfq.quantity ?? '—'}</div>
					</div>
					<div class="rounded-xl bg-muted/50 px-3 py-2">
						<div class="text-xs text-muted-foreground">Target price</div>
						<div class="text-sm font-medium">{rfq.targetPrice ?? '—'}</div>
					</div>
					<div class="rounded-xl bg-muted/50 px-3 py-2">
						<div class="text-xs text-muted-foreground">Destination</div>
						<div class="text-sm font-medium">{rfq.destination ?? '—'}</div>
					</div>
					<div class="rounded-xl bg-muted/50 px-3 py-2">
						<div class="text-xs text-muted-foreground">Buyer country</div>
						<div class="text-sm font-medium">{rfq.buyerCountry ?? '—'}</div>
					</div>
				</div>

				<div class="flex items-center gap-2">
					<span class="text-xs text-muted-foreground">Share:</span>
					<ShareButtons title={rfq.title ?? 'HalalNeo RFQ'} text={rfq.description ?? ''} />
				</div>
			</div>

			<aside class="min-w-0 space-y-3 lg:sticky lg:top-20 lg:self-start">
				<Card class="p-4">
					<h3 class="mb-1 text-sm font-semibold">Quote this request</h3>
					<p class="mb-3 text-xs leading-relaxed text-muted-foreground">
						Supplier on HalalNeo? Send your quote directly — the buyer sees it in their inbox.
					</p>
					<Button class="w-full" onclick={openQuote}>Send a quote</Button>
				</Card>
				<Card class="p-4">
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

		<RelatedLinks
			title="More buying requests"
			items={(data.related ?? []).map((r: any) => ({
				label: r.title,
				description: r.quantity ?? r.destination,
				href: `/rfqs/${r.id}`
			}))}
		/>
	</div>
{:else}
	<div class="flex min-h-[50vh] items-center justify-center">
		<div class="space-y-4 text-center">
			<p class="text-lg text-muted-foreground">Buying request not found.</p>
			<Button href={localizeHref('/rfqs')} variant="outline">Browse Requests</Button>
		</div>
	</div>
{/if}

<Dialog bind:open={quoteOpen}>
	<DialogContent class="sm:max-w-md">
		<DialogHeader>
			<DialogTitle>Quote: {rfq?.title}</DialogTitle>
			<DialogDescription>Quotes go straight to the buyer's inbox.</DialogDescription>
		</DialogHeader>

		{#if quoteResult}
			<div
				class={`rounded-xl px-3 py-2 text-sm ${quoteResult.type === 'success' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}
			>
				{quoteResult.message}
			</div>
		{/if}

		{#if mySuppliers.length === 0}
			<p class="rounded-xl bg-muted/60 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
				No supplier profile is linked to your account yet. Ask an admin to link your
				company after your supplier application is approved — then you can quote.
			</p>
		{:else}
			<form
				class="space-y-3"
				onsubmit={(e) => {
					e.preventDefault();
					submitQuote();
				}}
			>
				<Field>
					<FieldLabel>Quoting as</FieldLabel>
					<Select type="single" bind:value={quoteSupplier}>
						<SelectTrigger class="w-full text-sm">
							{quoteSupplier || 'Select supplier profile'}
						</SelectTrigger>
						<SelectContent>
							{#each mySuppliers as m (m.supplierSlug)}
								<SelectItem value={m.supplierSlug}>{m.supplierSlug}</SelectItem>
							{/each}
						</SelectContent>
					</Select>
				</Field>
				<Field>
					<FieldLabel>Your quote</FieldLabel>
					<Textarea
						bind:value={quoteMessage}
						placeholder="Price, MOQ, lead time, certifications..."
						rows={4}
					/>
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
