<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import { Field, FieldDescription, FieldLabel } from '#lib/components/ui/field/index.js';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '#lib/components/ui/select/index.js';
	import {
		Card,
		CardContent,
		CardHeader,
		CardTitle
	} from '#lib/components/ui/card/index.js';
	import Mail from '@lucide/svelte/icons/mail';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Clock from '@lucide/svelte/icons/clock';
	import Send from '@lucide/svelte/icons/send';
	import CheckCircle from '@lucide/svelte/icons/check-circle';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';

	const offices = [
		{ city: 'Dubai, UAE', address: 'Business Bay', email: 'dubai@halalneo.com' },
		{ city: 'Istanbul, Türkiye', address: 'Levent, Maslak District', email: 'istanbul@halalneo.com' },
		{ city: 'Jakarta, Indonesia', address: 'SCBD, Sudirman Center', email: 'jakarta@halalneo.com' }
	];

	let name = $state('');
	let email = $state('');
	let company = $state('');
	let topic = $state('Sourcing a product');
	let message = $state('');
	let sent = $state(false);
	let sending = $state(false);
	let submitError = $state('');

	const topics = [
		'Sourcing a product',
		'Supplier verification',
		'Supplier listing',
		'Partnership',
		'General enquiry'
	];

	async function submit() {
		if (!name.trim() || !email.trim() || !message.trim()) return;
		sending = true;
		submitError = '';
		try {
			const res = await fetch('/api/inquiries', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					buyerSlug: email.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
					supplierSlug: 'contact-form',
					subject: `[Contact] ${topic}`,
					message: `Name: ${name.trim()}\nEmail: ${email.trim()}\nCompany: ${company.trim()}\n\n${message.trim()}`
				})
			});
			if (!res.ok) {
				let errBody: any = {};
				try {
					errBody = (await res.json()) as any;
				} catch {
					errBody = {};
				}
				throw new Error(errBody.error || 'Failed to send message');
			}
			sent = true;
		} catch (e: any) {
			submitError = e?.message || 'Something went wrong. Please try again.';
		} finally {
			sending = false;
		}
	}
</script>

<svelte:head>
	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'ContactPage',
		'name': 'Contact Us — HalalNeo',
		'description': 'Get in touch with HalalNeo for questions about halal certification, product sourcing, supplier verification or partnerships.',
		'url': 'https://halalneo.com/contact',
		'mainEntity': {
			'@type': 'Organization',
			'name': 'HalalNeo',
			'url': 'https://halalneo.com',
			'email': 'contact@halalneo.com',
			'address': {
				'@type': 'PostalAddress',
				'addressLocality': 'Kuala Lumpur',
				'addressCountry': 'MY'
			},
			'contactPoint': {
				'@type': 'ContactPoint',
				'email': 'contact@halalneo.com',
				'contactType': 'customer service',
				'availableLanguage': ['English']
			}
		}
	})}</script>`}
</svelte:head>

<Breadcrumb items={[{ label: 'Contact', href: '/contact' }]} />

<section class="space-y-4 sm:space-y-6">
	<div class="max-w-2xl space-y-2">
		<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Contact HalalNeo</h1>
		<p class="text-muted-foreground">
			Questions about certification, sourcing, or listing your products —send us a message and
			we'll point you in the right direction.
		</p>
	</div>

	<div class="grid gap-8 lg:grid-cols-5">
		<div class="space-y-4 lg:col-span-2">
			<!-- Global Headquarters -->
			<Card>
				<CardHeader class="pb-2">
					<div class="flex items-center gap-2">
						<MapPin class="size-4 text-primary" />
						<CardTitle class="text-sm">Global Headquarters</CardTitle>
					</div>
				</CardHeader>
				<CardContent class="space-y-1.5 text-sm text-muted-foreground">
					<p class="flex items-start gap-1.5">
						<MapPin class="mt-0.5 size-3.5 shrink-0 text-primary"></MapPin>
						Kuala Lumpur, Malaysia
					</p>
					<p class="flex items-center gap-1.5">
						<Mail class="size-3.5 shrink-0 text-primary"></Mail>
						contact@halalneo.com
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader class="pb-2">
					<div class="flex items-center gap-2">
						<MapPin class="size-4 text-primary" />
						<CardTitle class="text-sm">Regional Offices</CardTitle>
					</div>
				</CardHeader>
				<CardContent class="space-y-3">
					{#each offices as office}
						<div>
							<p class="text-sm font-medium">{office.city}</p>
							<p class="text-sm text-muted-foreground">{office.address}</p>
						</div>
					{/each}
				</CardContent>
			</Card>

			<Card>
				<CardHeader class="pb-2">
					<div class="flex items-center gap-2">
						<Clock class="size-4 text-primary" />
						<CardTitle class="text-sm">Office Hours</CardTitle>
					</div>
				</CardHeader>
				<CardContent class="space-y-1.5 text-sm text-muted-foreground">
					<p>Monday — Friday: 9:00 AM — 6:00 PM (GMT+8)</p>
					<p>Saturday: 9:00 AM — 1:00 PM</p>
				</CardContent>
			</Card>
		</div>

		<div class="rounded-xl bg-card p-5 sm:p-6 lg:col-span-3">
			<h2 class="mb-4 text-sm font-bold text-foreground">Send a Message</h2>
			{#if sent}
				<div class="flex h-full min-h-72 flex-col items-center justify-center gap-3 text-center">
					<CheckCircle class="size-10 text-primary" data-icon="header" />
					<h2 class="text-lg font-semibold">Message received</h2>
					<p class="max-w-sm text-sm text-muted-foreground">
						Thanks, {name.split(' ')[0] || 'there'}. A member of our team will get back to you at
						<span class="font-medium text-foreground">{email}</span> within one business day.
					</p>
					<Button variant="outline" size="sm" onclick={() => (sent = false)}>
						Send another message
					</Button>
				</div>
			{:else}
				{#if submitError}
					<div class="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
						{submitError}
					</div>
				{/if}
				<form
					class="space-y-4"
					onsubmit={(e) => {
						e.preventDefault();
						submit();
					}}
				>
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
						<Select type="single" bind:value={topic}>
							<SelectTrigger class="w-full text-sm">
								Select a topic
							</SelectTrigger>
							<SelectContent>
								{#each topics as t}
									<SelectItem value={t}>{t}</SelectItem>
								{/each}
							</SelectContent>
						</Select>
					</Field>
					<Field>
						<FieldLabel>Message</FieldLabel>
						<Textarea bind:value={message} rows={5} placeholder="Tell us what you need..." required />
						<FieldDescription>
							Include your certifying body or standard if your question is about verification.
						</FieldDescription>
					</Field>
					<Button type="submit" class="w-full sm:w-auto" disabled={sending}>
						{#if sending}
							Sending...
						{:else}
							Send message
							<Send class="size-4" data-icon="inline-end" />
						{/if}
					</Button>
				</form>
			{/if}
		</div>
	</div>
</section>
