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
	import { Field, FieldLabel, FieldError } from '#lib/components/ui/field/index.js';
	import { Skeleton } from '#lib/components/ui/skeleton/index.js';
	import { Alert, AlertDescription } from '#lib/components/ui/alert/index.js';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import { z } from 'zod';
	import { toast } from 'svelte-sonner';
	import { focusFirstInvalid, mergeServerDetails } from '#lib/utils/forms.js';
	import Loader2 from '@lucide/svelte/icons/loader-2';
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

	const certOptions = [
		'JAKIM',
		'BPJPH / MUI',
		'MUIS',
		'SFDA-recognised',
		'MOIAT-accredited',
		'IFANCA',
		'Any recognised body'
	];
	let selectedCerts = $state<string[]>(['Any recognised body']);

	const docOptions = [
		'Halal certificate (product scope)',
		'Certificate of analysis per batch',
		'Slaughter certificate (meat/poultry)',
		'Ingredient declaration',
		'Shelf-life & storage statement'
	];
	let selectedDocs = $state<string[]>([
		'Halal certificate (product scope)',
		'Certificate of analysis per batch'
	]);

	function toggle(list: string[], v: string): string[] {
		return list.includes(v) ? list.filter((x) => x !== v) : [...list, v];
	}

	let copied = $state(false);
	let fieldErrors = $state<Record<string, string>>({});
	let fieldsEl = $state<HTMLDivElement | undefined>(undefined);

	const builderSchema = z.object({
		product: z.string().trim().min(1, 'Enter a product name first.'),
		quantity: z.string().trim().max(200, 'Keep the quantity under 200 characters.'),
		contactEmail: z
			.string()
			.trim()
			.optional()
			.refine((v) => !v || z.string().email().safeParse(v).success, {
				message: 'Enter a valid email, or leave it blank.'
			})
	});

	/** §3.4 — validate the builder inputs and focus the first invalid one. */
	function validateBuilder(): boolean {
		fieldErrors = {};
		const parsed = builderSchema.safeParse({ product, quantity, contactEmail });
		if (parsed.success) return true;
		for (const issue of parsed.error.issues) {
			const key = String(issue.path[0] ?? '');
			if (key && !fieldErrors[key]) fieldErrors = { ...fieldErrors, [key]: issue.message };
		}
		focusFirstInvalid(fieldsEl);
		return false;
	}

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
			toast.success('RFQ copied to clipboard.');
		} catch {
			toast.error('Clipboard unavailable — select the preview text and copy manually.');
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
		toast.success('RFQ downloaded as .txt.');
	}

	let publishing = $state(false);
	let publishResult = $state<{
		type: 'success' | 'error';
		message: string;
		needsLogin?: boolean;
		id?: string;
	} | null>(null);

	// Publish the built RFQ to the public Buying Requests board
	// (1 free post/week; server enforces the quota + login).
	async function publishRfq() {
		if (publishing) return;
		if (!validateBuilder()) return;
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
			const j = (await res.json().catch(() => ({}))) as {
				id?: string;
				error?: string;
				details?: Record<string, string[]>;
			};
			if (res.ok && j.id) {
				publishResult = {
					type: 'success',
					message: 'Published! Suppliers can now quote.',
					id: j.id
				};
				toast.success('Buying request published. Suppliers can now quote.');
			} else {
				const failMessage = j.error ?? 'Failed to publish.';
				publishResult = {
					type: 'error',
					message: failMessage,
					needsLogin: res.status === 401
				};
				toast.error(failMessage);
				if (res.status === 400 && j.details) {
					fieldErrors = mergeServerDetails(fieldErrors, {
						product: j.details.title ?? j.details.description,
						quantity: j.details.quantity
					});
					focusFirstInvalid(fieldsEl);
				}
			}
		} catch {
			publishResult = { type: 'error', message: 'Network error. Please try again.' };
			toast.error('Network error. Please try again.');
		} finally {
			publishing = false;
		}
	}
</script>

<svelte:head>
	<!-- Title + description render once via root layout from loader `seo`. -->
</svelte:head>

<Breadcrumb
	items={[
		{ label: 'Tools', href: '/tools' },
		{ label: 'RFQ Builder', href: '/tools/rfq-builder' }
	]}
/>

<section class="space-y-4 sm:space-y-6">
	<div class="max-w-2xl space-y-2">
		<div class="flex items-center gap-2 text-sm font-medium text-muted-foreground">
			<FileText class="size-4" />
			RFQ Builder
		</div>
		<h1 class="text-xl font-semibold tracking-tight sm:text-2xl">RFQs suppliers answer</h1>
		<p class="max-w-2xl text-xs text-muted-foreground sm:text-sm">
			Vague RFQs get vague quotes. Specify certification, documents and delivery terms up front —
			then copy or download the finished text.
		</p>
	</div>

	<div class="grid min-w-0 gap-4 lg:grid-cols-2">
		<Card class="min-w-0 p-4 sm:p-5">
			<CardContent class="space-y-3 p-0">
				<CardTitle class="text-sm sm:text-base">Your requirements</CardTitle>
				<div class="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2" bind:this={fieldsEl}>
					<Field class="sm:col-span-2">
						<FieldLabel for="rfq-product">Product</FieldLabel>
						<Input
							id="rfq-product"
							class="min-h-11 sm:min-h-8"
							placeholder="e.g. Frozen boneless chicken breast"
							bind:value={product}
							maxlength={200}
							aria-invalid={fieldErrors.product ? true : undefined}
							oninput={() => {
								if (fieldErrors.product) fieldErrors = { ...fieldErrors, product: '' };
							}}
						/>
						{#if fieldErrors.product}<FieldError>{fieldErrors.product}</FieldError>{/if}
					</Field>
					<Field class="sm:col-span-2">
						<FieldLabel for="rfq-specs">Key specifications</FieldLabel>
						<Textarea
							id="rfq-specs"
							class="min-h-24 min-w-0 resize-y"
							rows={2}
							placeholder="Grade, size, packaging, shelf life…"
							bind:value={specs}
						/>
					</Field>
					<Field>
						<FieldLabel for="rfq-quantity">Quantity</FieldLabel>
						<Input
							id="rfq-quantity"
							class="min-h-11 sm:min-h-8"
							placeholder="e.g. 20ft container / 12 MT"
							bind:value={quantity}
							maxlength={200}
							aria-invalid={fieldErrors.quantity ? true : undefined}
							oninput={() => {
								if (fieldErrors.quantity) fieldErrors = { ...fieldErrors, quantity: '' };
							}}
						/>
						{#if fieldErrors.quantity}<FieldError>{fieldErrors.quantity}</FieldError>{/if}
					</Field>
					<Field>
						<FieldLabel for="rfq-target-price">Target price (optional)</FieldLabel>
						<Input
							id="rfq-target-price"
							class="min-h-11 sm:min-h-8"
							placeholder="e.g. USD 2,400 / MT CIF"
							bind:value={targetPrice}
							maxlength={200}
						/>
					</Field>
					<Field>
						<FieldLabel for="rfq-destination">Destination market</FieldLabel>
						<Select type="single" bind:value={destination}>
							<SelectTrigger id="rfq-destination" class="min-h-11 sm:min-h-8">
								{destination}
							</SelectTrigger>
							<SelectContent>
								{#each destinations as d (d)}
									<SelectItem value={d}>{d}</SelectItem>
								{/each}
							</SelectContent>
						</Select>
					</Field>
					<Field>
						<FieldLabel for="rfq-incoterm">Incoterm</FieldLabel>
						<Select type="single" bind:value={incoterm}>
							<SelectTrigger id="rfq-incoterm" class="min-h-11 sm:min-h-8">
								{incoterm}
							</SelectTrigger>
							<SelectContent>
								{#each ['EXW', 'FOB', 'CFR', 'CIF', 'DAP', 'DDP'] as t (t)}
									<SelectItem value={t}>{t}</SelectItem>
								{/each}
							</SelectContent>
						</Select>
					</Field>
					<Field>
						<FieldLabel for="rfq-timeline">Required timeline</FieldLabel>
						<Input
							id="rfq-timeline"
							class="min-h-11 sm:min-h-8"
							placeholder="e.g. shipment before Ramadan"
							bind:value={timeline}
						/>
					</Field>
					<Field>
						<FieldLabel for="rfq-email">Contact email</FieldLabel>
						<Input
							id="rfq-email"
							class="min-h-11 sm:min-h-8"
							type="email"
							placeholder="you@company.com"
							bind:value={contactEmail}
							autocomplete="email"
							maxlength={200}
							aria-invalid={fieldErrors.contactEmail ? true : undefined}
							oninput={() => {
								if (fieldErrors.contactEmail) fieldErrors = { ...fieldErrors, contactEmail: '' };
							}}
						/>
						{#if fieldErrors.contactEmail}
							<FieldError>{fieldErrors.contactEmail}</FieldError>
						{/if}
					</Field>
				</div>
				<div>
					<FieldLabel class="mb-1.5 block">Accepted certification</FieldLabel>
					<div class="flex flex-wrap gap-1.5">
						{#each certOptions as c (c)}
							<label
								class="flex min-h-11 cursor-pointer items-center gap-1.5 rounded-md border border-border px-2 py-1.5 text-xs transition-colors sm:min-h-8 {selectedCerts.includes(
									c
								)
									? 'border-primary bg-primary/5'
									: 'hover:bg-muted'}"
							>
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
						{#each docOptions as d (d)}
							<label
								class="flex min-h-11 cursor-pointer items-center gap-1.5 rounded-md border border-border px-2 py-1.5 text-xs transition-colors sm:min-h-8 {selectedDocs.includes(
									d
								)
									? 'border-primary bg-primary/5'
									: 'hover:bg-muted'}"
							>
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

		<div class="min-w-0 space-y-4 lg:sticky lg:top-24 lg:h-fit">
			<Card class="min-w-0 p-4 sm:p-5">
				<CardContent class="min-w-0 space-y-3 p-0">
					<div class="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<CardTitle class="text-sm sm:text-base">Preview</CardTitle>
						<div class="grid min-w-0 grid-cols-3 gap-1.5 sm:flex">
							<Button
								variant="outline"
								size="sm"
								class="h-11 min-w-0 px-2 text-xs sm:h-7"
								onclick={copyRfq}
							>
								{#if copied}
									<Check class="size-3.5 text-success" /> Copied
								{:else}
									<Copy class="size-3.5" /> Copy
								{/if}
							</Button>
							<Button
								variant="outline"
								size="sm"
								class="h-11 min-w-0 px-2 text-xs sm:h-7"
								onclick={downloadRfq}
							>
								<Download class="size-3.5" /> .txt
							</Button>
							<Button
								size="sm"
								class="h-11 min-w-0 px-2 text-xs sm:h-7"
								disabled={publishing}
								aria-busy={publishing}
								onclick={publishRfq}
							>
								{#if publishing}
									<Loader2 class="size-3.5 animate-spin" />
								{:else}
									<Send class="size-3.5" />
								{/if}
								{publishing ? 'Publishing...' : 'Publish'}
							</Button>
						</div>
					</div>
					{#if publishing}
						<div class="space-y-2" aria-label="Publishing RFQ" aria-busy="true">
							<Skeleton class="h-3 w-24" />
							<Skeleton class="h-3 w-full" />
							<Skeleton class="h-3 w-4/5" />
						</div>
					{/if}
					<pre
						class="max-h-[420px] max-w-full overflow-x-hidden overflow-y-auto rounded-lg bg-muted/60 p-3 font-mono text-2xs-plus leading-relaxed [overflow-wrap:anywhere] break-words whitespace-pre-wrap">{rfqText}</pre>
					{#if publishResult}
						<Alert variant={publishResult.type === 'error' ? 'destructive' : 'default'}>
							<AlertDescription class="text-xs sm:text-sm">
								<span>{publishResult.message}</span>
								{#if publishResult.id}
									<a href={localizeHref(`/rfqs/${publishResult.id}`)} class="ms-1 font-semibold">
										View request
									</a>
								{/if}
								{#if publishResult.needsLogin}
									<a href={localizeHref('/login')} class="ms-1 font-semibold">Sign in</a>
								{/if}
							</AlertDescription>
						</Alert>
					{/if}
				</CardContent>
			</Card>
			<Card class="p-4">
				<CardContent class="flex flex-wrap items-center justify-between gap-2 p-0">
					<div class="text-xs text-muted-foreground">Price it before you send it.</div>
					<Button
						href={localizeHref('/tools/landed-cost')}
						variant="outline"
						size="sm"
						class="min-h-11 sm:min-h-7"
					>
						Landed cost calculator
						<ArrowRight class="size-3.5 rtl:rotate-180" />
					</Button>
				</CardContent>
			</Card>
		</div>
	</div>
</section>
