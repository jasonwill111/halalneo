<script lang="ts">
	import { goto } from '$app/navigation';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Card, CardContent } from '#lib/components/ui/card/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import {
		Field,
		FieldError,
		FieldLabel,
		FieldDescription
	} from '#lib/components/ui/field/index.js';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '#lib/components/ui/select/index.js';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import { z } from 'zod';
	import { toast } from 'svelte-sonner';
	import { focusFirstInvalid, mergeServerDetails } from '#lib/utils/forms.js';
	import Loader2 from '@lucide/svelte/icons/loader-2';

	let { data } = $props();

	let title = $state('');
	let categorySlug = $state('');
	let quantity = $state('');
	let targetPrice = $state('');
	let destination = $state('');
	let buyerCountry = $state('');
	let description = $state('');
	let sending = $state(false);
	let result = $state<{ type: 'success' | 'error'; message: string; needsLogin?: boolean } | null>(
		null
	);
	let fieldErrors = $state<Record<string, string>>({});
	let formEl = $state<HTMLFormElement | undefined>(undefined);

	const rfqClientSchema = z.object({
		title: z
			.string()
			.trim()
			.min(5, 'Title must be at least 5 characters.')
			.max(200, 'Title must be at most 200 characters.'),
		description: z
			.string()
			.trim()
			.min(10, 'Describe what you need (min 10 characters).')
			.max(5000, 'Description must be at most 5000 characters.')
	});

	async function submit() {
		if (sending) return;
		fieldErrors = {};
		const parsed = rfqClientSchema.safeParse({ title, description });
		if (!parsed.success) {
			for (const issue of parsed.error.issues) {
				const key = String(issue.path[0] ?? '');
				if (key && !fieldErrors[key]) fieldErrors = { ...fieldErrors, [key]: issue.message };
			}
			focusFirstInvalid(formEl);
			return;
		}
		sending = true;
		result = null;
		try {
			const res = await fetch('/api/rfqs', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					title: title.trim(),
					description: description.trim(),
					categorySlug: categorySlug || null,
					quantity: quantity.trim() || null,
					targetPrice: targetPrice.trim() || null,
					destination: destination.trim() || null,
					buyerCountry: buyerCountry.trim() || null
				})
			});
			const j = (await res.json().catch(() => ({}))) as {
				id?: string;
				error?: string;
				details?: Record<string, string[]>;
			};
			if (res.ok && j.id) {
				result = { type: 'success', message: 'Request published.' };
				toast.success('Buying request published. Suppliers can now quote.');
				goto(localizeHref(`/rfqs/${j.id}`));
				return;
			}
			const failMessage = j.error ?? 'Failed to publish.';
			result = {
				type: 'error',
				message: failMessage,
				needsLogin: res.status === 401
			};
			toast.error(failMessage);
			if (res.status === 400 && j.details) {
				fieldErrors = mergeServerDetails(fieldErrors, j.details);
				focusFirstInvalid(formEl);
			}
		} catch {
			result = { type: 'error', message: 'Network error. Please try again.' };
			toast.error('Network error. Please try again.');
		} finally {
			sending = false;
		}
	}
</script>

<Breadcrumb items={[{ label: 'Buying Requests', href: '/rfqs' }, { label: 'Post a request' }]} />

<div class="mx-auto flex w-full max-w-7xl gap-6">
	<div class="min-w-0 flex-1 space-y-4">
		<div class="space-y-2">
			<h1 class="text-2xl font-bold tracking-tight sm:text-3xl">Post a buying request</h1>
			<p class="text-sm text-muted-foreground">
				Describe what you need — suppliers quote directly. Free plan: 1 request per week.
			</p>
		</div>

		{#if result}
			<div
				class={`rounded-xl px-3 py-2 text-sm ${result.type === 'success' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}
			>
				{result.message}
				{#if result.needsLogin}
					<Button href={localizeHref('/login')} variant="outline" size="sm" class="ms-2">
						Sign in
					</Button>
				{/if}
			</div>
		{/if}

		<Card class="p-4 sm:p-5">
			<form
				class="space-y-3"
				bind:this={formEl}
				onsubmit={(e) => {
					e.preventDefault();
					submit();
				}}
			>
				<Field>
					<FieldLabel>What do you need? *</FieldLabel>
					<Input
						type="text"
						bind:value={title}
						placeholder="e.g. Frozen halal chicken, 500 cartons monthly"
						maxlength={200}
						aria-invalid={fieldErrors.title ? true : undefined}
						oninput={() => {
							if (fieldErrors.title) fieldErrors = { ...fieldErrors, title: '' };
						}}
					/>
					{#if fieldErrors.title}<FieldError>{fieldErrors.title}</FieldError>{/if}
				</Field>
				<div class="grid gap-3 sm:grid-cols-2">
					<Field>
						<FieldLabel>Category</FieldLabel>
						<Select type="single" bind:value={categorySlug}>
							<SelectTrigger class="w-full text-sm">
								{(data.categories ?? []).find((c) => c.slug === categorySlug)?.name ??
									'Select category'}
							</SelectTrigger>
							<SelectContent>
								{#each data.categories ?? [] as c (c.slug)}
									<SelectItem value={c.slug}>{c.name}</SelectItem>
								{/each}
							</SelectContent>
						</Select>
					</Field>
					<Field>
						<FieldLabel>Quantity</FieldLabel>
						<Input
							type="text"
							bind:value={quantity}
							placeholder="e.g. 500kg monthly"
							maxlength={200}
						/>
					</Field>
					<Field>
						<FieldLabel>Target price</FieldLabel>
						<Input
							type="text"
							bind:value={targetPrice}
							placeholder="e.g. $4.20/kg CIF"
							maxlength={200}
						/>
					</Field>
					<Field>
						<FieldLabel>Destination</FieldLabel>
						<Input
							type="text"
							bind:value={destination}
							placeholder="e.g. Port Klang, Malaysia"
							maxlength={200}
						/>
					</Field>
				</div>
				<Field>
					<FieldLabel>Your country</FieldLabel>
					<Input
						type="text"
						bind:value={buyerCountry}
						placeholder="e.g. United Arab Emirates"
						maxlength={200}
					/>
				</Field>
				<Field>
					<FieldLabel>Details *</FieldLabel>
					<FieldDescription>Specs, certifications required, packaging, timeline.</FieldDescription>
					<Textarea
						bind:value={description}
						placeholder="Grade, specs, required certifications (JAKIM/ESMA/...), packaging, delivery timeline..."
						rows={5}
						maxlength={5000}
						aria-invalid={fieldErrors.description ? true : undefined}
						oninput={() => {
							if (fieldErrors.description) fieldErrors = { ...fieldErrors, description: '' };
						}}
					/>
					{#if fieldErrors.description}<FieldError>{fieldErrors.description}</FieldError>{/if}
				</Field>
				<Button
					type="submit"
					class="w-full"
					disabled={sending || !title.trim() || !description.trim()}
					aria-busy={sending}
				>
					{#if sending}
						<Loader2 class="size-4 animate-spin" />
						Publishing...
					{:else}
						Publish request
					{/if}
				</Button>
			</form>
		</Card>
	</div>
	<aside class="hidden w-72 shrink-0 space-y-4 lg:block">
		<Card>
			<CardContent class="space-y-3 p-4">
				<h2 class="text-sm font-semibold">What happens next</h2>
				<ol class="space-y-2 text-xs text-muted-foreground">
					<li>1. Matched suppliers see your request in their dashboard.</li>
					<li>2. Quotes arrive in your account's inquiries list.</li>
					<li>3. Compare prices and certifications, then reply to the best one.</li>
				</ol>
			</CardContent>
		</Card>
		<Card>
			<CardContent class="space-y-3 p-4">
				<h2 class="text-sm font-semibold">Requests that get quotes</h2>
				<ul class="list-disc space-y-1.5 ps-4 text-xs text-muted-foreground">
					<li>Exact grade, spec and cert standard (JAKIM, BPJPH, ESMA…)</li>
					<li>Packaging format and pallet or container quantity</li>
					<li>Destination port and delivery window</li>
					<li>Whether samples or an audit are required</li>
				</ul>
				<Button variant="outline" size="sm" href={localizeHref('/tools/rfq-builder')} class="w-full"
					>Build with the RFQ wizard</Button
				>
			</CardContent>
		</Card>
	</aside>
</div>
