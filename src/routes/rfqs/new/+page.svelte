<script lang="ts">
	import { goto } from '$app/navigation';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Card } from '#lib/components/ui/card/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import { Field, FieldLabel, FieldDescription } from '#lib/components/ui/field/index.js';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '#lib/components/ui/select/index.js';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';

	let { data } = $props();

	let title = $state('');
	let categorySlug = $state('');
	let quantity = $state('');
	let targetPrice = $state('');
	let destination = $state('');
	let buyerCountry = $state('');
	let description = $state('');
	let sending = $state(false);
	let result = $state<{ type: 'success' | 'error'; message: string; needsLogin?: boolean } | null>(null);

	async function submit() {
		if (!title.trim() || !description.trim()) return;
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
			const j = (await res.json().catch(() => ({}))) as any;
			if (res.ok && j.id) {
				goto(localizeHref(`/rfqs/${j.id}`));
				return;
			}
			result = {
				type: 'error',
				message: j.error ?? 'Failed to publish.',
				needsLogin: res.status === 401
			};
		} catch {
			result = { type: 'error', message: 'Network error. Please try again.' };
		} finally {
			sending = false;
		}
	}
</script>

<Breadcrumb items={[{ label: 'Buying Requests', href: '/rfqs' }, { label: 'Post a request' }]} />

<div class="mx-auto max-w-2xl space-y-4">
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
				<Button href={localizeHref('/login')} variant="outline" size="sm" class="ml-2">
					Sign in
				</Button>
			{/if}
		</div>
	{/if}

	<Card class="p-4 sm:p-5">
		<form
			class="space-y-3"
			onsubmit={(e) => {
				e.preventDefault();
				submit();
			}}
		>
			<Field>
				<FieldLabel>What do you need? *</FieldLabel>
				<Input type="text" bind:value={title} placeholder="e.g. Frozen halal chicken, 500 cartons monthly" maxlength={200} />
			</Field>
			<div class="grid gap-3 sm:grid-cols-2">
				<Field>
					<FieldLabel>Category</FieldLabel>
					<Select type="single" bind:value={categorySlug}>
						<SelectTrigger class="w-full text-sm">
							{(data.categories ?? []).find((c: any) => c.slug === categorySlug)?.name ?? 'Select category'}
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
					<Input type="text" bind:value={quantity} placeholder="e.g. 500kg monthly" maxlength={200} />
				</Field>
				<Field>
					<FieldLabel>Target price</FieldLabel>
					<Input type="text" bind:value={targetPrice} placeholder="e.g. $4.20/kg CIF" maxlength={200} />
				</Field>
				<Field>
					<FieldLabel>Destination</FieldLabel>
					<Input type="text" bind:value={destination} placeholder="e.g. Port Klang, Malaysia" maxlength={200} />
				</Field>
			</div>
			<Field>
				<FieldLabel>Your country</FieldLabel>
				<Input type="text" bind:value={buyerCountry} placeholder="e.g. United Arab Emirates" maxlength={200} />
			</Field>
			<Field>
				<FieldLabel>Details *</FieldLabel>
				<FieldDescription>Specs, certifications required, packaging, timeline.</FieldDescription>
				<Textarea
					bind:value={description}
					placeholder="Grade, specs, required certifications (JAKIM/ESMA/...), packaging, delivery timeline..."
					rows={5}
				/>
			</Field>
			<Button type="submit" class="w-full" disabled={sending || !title.trim() || !description.trim()}>
				{sending ? 'Publishing...' : 'Publish request'}
			</Button>
		</form>
	</Card>
</div>
