<script lang="ts">
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Field, FieldDescription, FieldLabel } from '$lib/components/ui/field';
	import Mail from '@lucide/svelte/icons/mail';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Clock from '@lucide/svelte/icons/clock';
	import Send from '@lucide/svelte/icons/send';
	import CheckCircle from '@lucide/svelte/icons/check-circle';

	let name = $state('');
	let email = $state('');
	let company = $state('');
	let topic = $state('Sourcing a product');
	let message = $state('');
	let sent = $state(false);

	const topics = [
		'Sourcing a product',
		'Supplier verification',
		'Supplier listing',
		'Partnership',
		'General enquiry'
	];

	function submit() {
		if (!name.trim() || !email.trim() || !message.trim()) return;
		sent = true;
	}
</script>

<svelte:head><title>Contact — HalalNeo</title></svelte:head>

<section class="space-y-8">
	<div class="max-w-2xl space-y-2">
		<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Contact HalalNeo</h1>
		<p class="text-muted-foreground">
			Questions about certification, sourcing, or listing your products — send us a message and
			we'll point you in the right direction.
		</p>
	</div>

	<div class="grid gap-8 lg:grid-cols-5">
		<div class="space-y-4 lg:col-span-2">
			<div class="flex items-start gap-3">
				<Mail class="mt-0.5 size-5 text-primary" data-icon="header" />
				<div>
					<p class="text-sm font-medium">Email</p>
					<p class="text-sm text-muted-foreground">hello@halalneo.example</p>
				</div>
			</div>
			<div class="flex items-start gap-3">
				<Clock class="mt-0.5 size-5 text-primary" data-icon="header" />
				<div>
					<p class="text-sm font-medium">Response time</p>
					<p class="text-sm text-muted-foreground">Within one business day, Mon–Fri 09:00–18:00 (GMT+8)</p>
				</div>
			</div>
			<div class="flex items-start gap-3">
				<MapPin class="mt-0.5 size-5 text-primary" data-icon="header" />
				<div>
					<p class="text-sm font-medium">Office</p>
					<p class="text-sm text-muted-foreground">
						HalalNeo Pte. Ltd. — a distributed team serving buyers and suppliers across
						Southeast Asia, the Gulf and Europe.
					</p>
				</div>
			</div>
			<div class="rounded-xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
				<strong class="font-semibold text-foreground">Prototype note:</strong> this form is a
				demonstration. No message is sent anywhere — use the email above for a real response.
			</div>
		</div>

		<div class="rounded-xl border border-border p-5 sm:p-6 lg:col-span-3">
			{#if sent}
				<div class="flex h-full min-h-72 flex-col items-center justify-center gap-3 text-center">
					<CheckCircle class="size-10 text-primary" data-icon="header" />
					<h2 class="text-lg font-semibold">Message received</h2>
					<p class="max-w-sm text-sm text-muted-foreground">
						Thanks, {name.split(' ')[0] || 'there'}. A member of our team will get back to
						you at <span class="font-medium text-foreground">{email}</span> within one
						business day.
					</p>
					<Button variant="outline" size="sm" onclick={() => (sent = false)}>
						Send another message
					</Button>
				</div>
			{:else}
				<form class="space-y-4" onsubmit={(e) => { e.preventDefault(); submit(); }}>
					<div class="grid gap-4 sm:grid-cols-2">
						<Field>
							<FieldLabel>Full name</FieldLabel>
							<Input bind:value={name} placeholder="Jane Doe" required />
						</Field>
						<Field>
							<FieldLabel>Work email</FieldLabel>
							<Input type="email" bind:value={email} placeholder="jane@company.com" required />
						</Field>
					</div>
					<Field>
						<FieldLabel>Company (optional)</FieldLabel>
						<Input bind:value={company} placeholder="Your company" />
					</Field>
					<Field>
						<FieldLabel>Topic</FieldLabel>
						<select
							bind:value={topic}
							class="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none transition-colors focus-visible:ring-1 focus-visible:ring-ring"
						>
							{#each topics as t}
								<option value={t}>{t}</option>
							{/each}
						</select>
					</Field>
					<Field>
						<FieldLabel>Message</FieldLabel>
						<Textarea bind:value={message} rows={5} placeholder="Tell us what you need…" required />
						<FieldDescription>
							Include your certifying body or standard if your question is about verification.
						</FieldDescription>
					</Field>
					<Button type="submit" class="w-full sm:w-auto">
						Send message
						<Send class="size-4" data-icon="inline-end" />
					</Button>
				</form>
			{/if}
		</div>
	</div>
</section>