<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Card, CardContent, CardTitle } from '#lib/components/ui/card/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import { Checkbox } from '#lib/components/ui/checkbox/index.js';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '#lib/components/ui/select/index.js';
	import { Field, FieldLabel } from '#lib/components/ui/field/index.js';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import FileText from '@lucide/svelte/icons/file-text';
	import Copy from '@lucide/svelte/icons/copy';
	import Check from '@lucide/svelte/icons/check';
import Download from '@lucide/svelte/icons/download';
import Send from '@lucide/svelte/icons/send';
import ArrowRight from '@lucide/svelte/icons/arrow-right';

	let product = $state('');
	let specs = $state('');
	let quantity = $state('');
	let targetPrice = $state('');
	let destination = $state('United Arab Emirates');
	let incoterm = $state('CIF');
	let timeline = $state('');
	let contactEmail = $state('');

	const destinations = [
		'United Arab Emirates',
		'Saudi Arabia',
		'Malaysia',
		'Indonesia',
		'Singapore',
		'Qatar',
		'Kuwait',
		'Bangladesh',
		'Egypt',
		'United States'
	];

	const certOptions = ['JAKIM', 'BPJPH / MUI', 'MUIS', 'SFDA-recognised', 'MOIAT-accredited', 'IFANCA', 'Any recognised body'];
	let selectedCerts = $state<string[]>(['Any recognised body']);

	const docOptions = ['Halal certificate (product scope)', 'Certificate of analysis per batch', 'Slaughter certificate (meat/poultry)', 'Ingredient declaration', 'Shelf-life & storage statement'];
	let selectedDocs = $state<string[]>(['Halal certificate (product scope)', 'Certificate of analysis per batch']);

	function toggle(list: string[], v: string): string[] {
		return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
	}

	let copied = $state(false);

	const rfqText = $derived(
		[
			`REQUEST FOR QUOTATION — HALAL PRODUCT`,
			``,
			`Product: ${product.trim() || '[product name]'}`,
			...(specs.trim() ? [`Specifications: ${specs.trim()}`] : []),
			`Quantity: ${quantity.trim() || '[quantity + unit]'}`,
			...(targetPrice.trim() ? [`Target price: ${targetPrice.trim()}`] : []),
			`Delivery: ${incoterm} ${destination}`,
			...(timeline.trim() ? [`Required timeline: ${timeline.trim()}`] : []),
			``,
			`Halal requirements:`,
			...(selectedCerts.length > 0
				? selectedCerts.map((c) => `- Halal certification recognised by ${c}`)
				: ['- Halal certification (recognised body)']),
			`Documents required with quotation:`,
			...(selectedDocs.length > 0 ? selectedDocs.map((d) => `- ${d}`) : ['- To be advised']),
			``,
			`Please confirm scope, validity dates and logo-use rights for the quoted SKUs.`,
			...(contactEmail.trim() ? [`Contact: ${contactEmail.trim()}`] : []),
			``,
			`Generated with HalalNeo RFQ Builder — verify all claims with the issuing certifying body.`
		].join('\n')
	);

	async function copyRfq() {
		try {
			await navigator.clipboard.writeText(rfqText);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			// clipboard unavailable
		}
	}

	function downloadRfq() {
		const blob = new Blob([rfqText], { type: 'text/plain;charset=utf-8' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `rfq-${(product.trim() || 'halal-product').toLowerCase().replace(/[^a-z0-9]+/g, '-')}.txt`;
		document.body.appendChild(a);
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
	}

	let publishing = $state(false);
	let publishResult = $state<{ type: 'success' | 'error'; message: string; needsLogin?: boolean; id?: string } | null>(null);

	// Publish the built RFQ to the public Buying Requests board
	// (1 free post/week; server enforces the quota + login).
	async function publishRfq() {
		if (!product.trim()) {
			publishResult = { type: 'error', message: 'Enter a product name first.' };
			return;
		}
		publishing = true;
		publishResult = null;
		try {
			const res = await fetch('/api/rfqs', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: `${product.trim()} — ${quantity.trim() || 'sourcing request'}`.slice(0, 200),
					description: rfqText.slice(0, 5000),
					quantity: quantity.trim() || null,
					targetPrice: targetPrice.trim() || null,
					destination: `${incoterm} ${destination}`.trim() || null
				})
			});
			const j = (await res.json().catch(() => ({}))) as any;
			if (res.ok && j.id) {
				publishResult = { type: 'success', message: 'Published! Suppliers can now quote.', id: j.id };
			} else {
				publishResult = {
					type: 'error',
					message: j.error ?? 'Failed to publish.',
					needsLogin: res.status === 401
				};
			}
		} catch {
			publishResult = { type: 'error', message: 'Network error. Please try again.' };
		} finally {
			publishing = false;
		}
	}
</script>

<svelte:head>
	<!-- Title + description render once via root layout from loader `seo`. -->
</svelte:head>

<Breadcrumb
	items={[{ label: 'Tools', href: '/tools' }, { label: 'RFQ Builder', href: '/tools/rfq-builder' }]}
/>

<section class="space-y-4 sm:space-y-6">
	<div class="max-w-2xl space-y-2">
		<div class="flex items-center gap-2 text-sm font-medium text-muted-foreground">
			<FileText class="size-4" />
			RFQ Builder
		</div>
		<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">RFQs suppliers answer</h1>
		<p class="text-muted-foreground">
			Vague RFQs get vague quotes. Specify certification, documents and delivery terms
			up front — then copy or download the finished text.
		</p>
	</div>

	<div class="grid gap-4 lg:grid-cols-2">
		<Card class="p-4 sm:p-5">
			<CardContent class="space-y-3 p-0">
				<CardTitle class="text-base">Your requirements</CardTitle>
				<div class="grid gap-3 sm:grid-cols-2">
					<Field class="sm:col-span-2">
						<FieldLabel>Product</FieldLabel>
						<Input placeholder="e.g. Frozen boneless chicken breast" bind:value={product} />
					</Field>
					<Field class="sm:col-span-2">
						<FieldLabel>Key specifications</FieldLabel>
						<Textarea rows={2} placeholder="Grade, size, packaging, shelf life…" bind:value={specs} />
					</Field>
					<Field>
						<FieldLabel>Quantity</FieldLabel>
						<Input placeholder="e.g. 20ft container / 12 MT" bind:value={quantity} />
					</Field>
					<Field>
						<FieldLabel>Target price (optional)</FieldLabel>
						<Input placeholder="e.g. USD 2,400 / MT CIF" bind:value={targetPrice} />
					</Field>
					<Field>
						<FieldLabel>Destination market</FieldLabel>
						<Select type="single" bind:value={destination}>
							<SelectTrigger>{destination}</SelectTrigger>
							<SelectContent>
								{#each destinations as d}
									<SelectItem value={d}>{d}</SelectItem>
								{/each}
							</SelectContent>
						</Select>
					</Field>
					<Field>
						<FieldLabel>Incoterm</FieldLabel>
						<Select type="single" bind:value={incoterm}>
							<SelectTrigger>{incoterm}</SelectTrigger>
							<SelectContent>
								{#each ['EXW', 'FOB', 'CFR', 'CIF', 'DAP', 'DDP'] as t}
									<SelectItem value={t}>{t}</SelectItem>
								{/each}
							</SelectContent>
						</Select>
					</Field>
					<Field>
						<FieldLabel>Required timeline</FieldLabel>
						<Input placeholder="e.g. shipment before Ramadan" bind:value={timeline} />
					</Field>
					<Field>
						<FieldLabel>Contact email</FieldLabel>
						<Input type="email" placeholder="you@company.com" bind:value={contactEmail} />
					</Field>
				</div>
				<div>
					<FieldLabel class="mb-1.5 block">Accepted certification</FieldLabel>
					<div class="flex flex-wrap gap-1.5">
						{#each certOptions as c}
							<label class="flex cursor-pointer items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs transition-colors {selectedCerts.includes(c) ? 'border-primary bg-primary/5' : 'hover:bg-muted'}">
								<Checkbox
									checked={selectedCerts.includes(c)}
									onCheckedChange={() => (selectedCerts = toggle(selectedCerts, c))}
								/>
								{c}
							</label>
						{/each}
					</div>
				</div>
				<div>
					<FieldLabel class="mb-1.5 block">Documents with quotation</FieldLabel>
					<div class="flex flex-wrap gap-1.5">
						{#each docOptions as d}
							<label class="flex cursor-pointer items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs transition-colors {selectedDocs.includes(d) ? 'border-primary bg-primary/5' : 'hover:bg-muted'}">
								<Checkbox
									checked={selectedDocs.includes(d)}
									onCheckedChange={() => (selectedDocs = toggle(selectedDocs, d))}
								/>
								{d}
							</label>
						{/each}
					</div>
				</div>
			</CardContent>
		</Card>

		<div class="space-y-4 lg:sticky lg:top-24 lg:h-fit">
			<Card class="p-4 sm:p-5">
				<CardContent class="space-y-3 p-0">
					<div class="flex items-center justify-between">
						<CardTitle class="text-base">Preview</CardTitle>
						<div class="flex gap-1.5">
							<Button variant="outline" size="sm" class="h-7 text-xs" onclick={copyRfq}>
								{#if copied}
									<Check class="size-3.5 text-success" /> Copied
								{:else}
									<Copy class="size-3.5" /> Copy
								{/if}
							</Button>
						<Button variant="outline" size="sm" class="h-7 text-xs" onclick={downloadRfq}>
							<Download class="size-3.5" /> .txt
						</Button>
						<Button size="sm" class="h-7 text-xs" disabled={publishing} onclick={publishRfq}>
							<Send class="size-3.5" />
							{publishing ? 'Publishing...' : 'Publish'}
						</Button>
					</div>
				</div>
				<pre class="max-h-[420px] overflow-auto rounded-lg bg-muted/60 p-3 font-mono text-[11px] leading-relaxed whitespace-pre-wrap">{rfqText}</pre>
				{#if publishResult}
					<div
						class={`rounded-xl px-3 py-2 text-xs ${publishResult.type === 'success' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}
					>
						{publishResult.message}
						{#if publishResult.id}
							<a href={localizeHref(`/rfqs/${publishResult.id}`)} class="ml-1 font-semibold underline">
								View request
							</a>
						{/if}
						{#if publishResult.needsLogin}
							<a href={localizeHref('/login')} class="ml-1 font-semibold underline"> Sign in </a>
						{/if}
					</div>
				{/if}
				</CardContent>
			</Card>
			<Card class="p-4">
				<CardContent class="flex flex-wrap items-center justify-between gap-2 p-0">
					<div class="text-xs text-muted-foreground">Price it before you send it.</div>
					<Button href={localizeHref('/tools/landed-cost')} variant="outline" size="sm">
						Landed cost calculator
						<ArrowRight class="size-3.5" />
					</Button>
				</CardContent>
			</Card>
		</div>
	</div>
</section>
