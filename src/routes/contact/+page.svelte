<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import {
		Field,
		FieldDescription,
		FieldError,
		FieldLabel
	} from '#lib/components/ui/field/index.js';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '#lib/components/ui/select/index.js';
	import { Card, CardContent, CardHeader, CardTitle } from '#lib/components/ui/card/index.js';
	import { Alert, AlertDescription } from '#lib/components/ui/alert/index.js';
	import Mail from '@lucide/svelte/icons/mail';
	import MapPin from '@lucide/svelte/icons/map-pin';
	import Phone from '@lucide/svelte/icons/phone';
	import Clock from '@lucide/svelte/icons/clock';
	import Send from '@lucide/svelte/icons/send';
	import CheckCircle from '@lucide/svelte/icons/check-circle';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import { z } from 'zod';
	import { toast } from 'svelte-sonner';
	import { focusFirstInvalid, mergeServerDetails } from '#lib/utils/forms.js';
	import Loader2 from '@lucide/svelte/icons/loader-2';

	const offices = [
		{ city: 'Dubai, UAE', address: 'Business Bay', email: 'dubai@halalneo.com' },
		{
			city: 'Istanbul, Türkiye',
			address: 'Levent, Maslak District',
			email: 'istanbul@halalneo.com'
		},
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
	let fieldErrors = $state<Record<string, string>>({});
	let formEl = $state<HTMLFormElement | undefined>(undefined);

	const contactSchema = z.object({
		name: z
			.string()
			.trim()
			.min(1, 'Please enter your name.')
			.max(200, 'Please keep your name shorter.'),
		email: z
			.string()
			.trim()
			.min(1, 'Please enter your email.')
			.email('Please enter a valid email.'),
		message: z
			.string()
			.trim()
			.min(1, 'Please tell us what you need.')
			.max(5000, 'Message must be at most 5000 characters.')
	});

	const topics = [
		'Sourcing a product',
		'Supplier verification',
		'Supplier listing',
		'Partnership',
		'General enquiry'
	];

	async function submit() {
		if (sending) return;
		fieldErrors = {};
		const parsed = contactSchema.safeParse({ name, email, message });
		if (!parsed.success) {
			for (const issue of parsed.error.issues) {
				const key = String(issue.path[0] ?? '');
				if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
			}
			focusFirstInvalid(formEl);
			return;
		}
		sending = true;
		submitError = '';
		try {
			const res = await fetch('/api/inquiries', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					buyerSlug: email
						.trim()
						.toLowerCase()
						.replace(/[^a-z0-9]+/g, '-'),
					subject: `[Contact] ${topic}`,
					message: `Name: ${name.trim()}\nEmail: ${email.trim()}\nCompany: ${company.trim()}\n\n${message.trim()}`
				})
			});
			if (!res.ok) {
				const errBody = (await res.json().catch(() => ({}))) as {
					error?: string;
					details?: Record<string, string[]>;
				};
				const failMessage = errBody.error || 'Failed to send message. Please try again.';
				submitError = failMessage;
				if (errBody.details) {
					fieldErrors = mergeServerDetails(fieldErrors, errBody.details);
				}
				toast.error(failMessage);
				focusFirstInvalid(formEl);
				return;
			}
			sent = true;
			toast.success('Message sent. We will reply within one business day.');
		} catch {
			submitError = 'Network error. Please try again.';
			toast.error(submitError);
		} finally {
			sending = false;
		}
	}
</script>

<svelte:head>
	{@html `\u003cscript type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'ContactPage',
		name: 'Contact Us — HalalNeo',
		description:
			'Get in touch with HalalNeo for questions about halal certification, product sourcing, supplier verification or partnerships.',
		url: 'https://halalneo.com/contact',
		mainEntity: {
			'@type': 'Organization',
			name: 'HalalNeo',
			url: 'https://halalneo.com',
			email: 'contact@halalneo.com',
			address: {
				'@type': 'PostalAddress',
				addressLocality: 'Kuala Lumpur',
				addressCountry: 'MY'
			},
			contactPoint: {
				'@type': 'ContactPoint',
				email: 'contact@halalneo.com',
				contactType: 'customer service',
				availableLanguage: ['English']
			}
		}
	})}\u003c/script>`}
</svelte:head>

<Breadcrumb items={[{ label: 'Contact', href: '/contact' }]} />

<section class="flex flex-col gap-4 sm:gap-6">
	<div class="max-w-2xl">
		<h1 class="text-xl font-semibold tracking-tight sm:text-2xl">Contact HalalNeo</h1>
		<p class="mt-1 text-xs text-muted-foreground sm:text-sm">
			Questions about certification, sourcing, or listing your products —send us a message and we'll
			point you in the right direction.
		</p>
	</div>

	<div
		class="grid min-w-0 items-start gap-3 sm:gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:gap-3"
	>
		<div class="flex min-w-0 flex-col gap-3">
			<Card size="sm" class="min-w-0">
				<CardHeader class="pb-2">
					<div class="flex items-center gap-2">
						<MapPin class="size-4 text-primary" />
						<CardTitle class="text-sm">Global Headquarters</CardTitle>
					</div>
				</CardHeader>
				<CardContent class="flex flex-col gap-1.5 text-xs text-muted-foreground sm:text-sm">
					<p class="flex items-start gap-1.5">
						<MapPin class="mt-0.5 size-3.5 shrink-0 text-primary"></MapPin>
						<span>Kuala Lumpur, Malaysia</span>
					</p>
					<p class="flex items-center gap-1.5">
						<Phone class="size-3.5 shrink-0 text-primary"></Phone>
						<a href="tel:+603XXXXXXXX" class="transition-colors hover:text-foreground">
							+60 3-XXXX XXXX
						</a>
					</p>
					<p class="flex min-w-0 items-center gap-1.5">
						<Mail class="size-3.5 shrink-0 text-primary"></Mail>
						<a
							href="mailto:contact@halalneo.com"
							class="min-w-0 break-all transition-colors hover:text-foreground sm:break-normal"
						>
							contact@halalneo.com
						</a>
					</p>
				</CardContent>
			</Card>

			<Card size="sm" class="min-w-0">
				<CardHeader class="pb-2">
					<div class="flex items-center gap-2">
						<MapPin class="size-4 text-primary" />
						<CardTitle class="text-sm">Regional Offices</CardTitle>
					</div>
				</CardHeader>
				<CardContent class="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
					{#each offices as office (office.city)}
						<div class="min-w-0">
							<p class="text-xs font-medium sm:text-sm">{office.city}</p>
							<p class="text-xs text-muted-foreground sm:text-sm">{office.address}</p>
						</div>
					{/each}
				</CardContent>
			</Card>

			<Card size="sm" class="min-w-0">
				<CardHeader class="pb-2">
					<div class="flex items-center gap-2">
						<Clock class="size-4 text-primary" />
						<CardTitle class="text-sm">Office Hours</CardTitle>
					</div>
				</CardHeader>
				<CardContent class="flex flex-col gap-1.5 text-xs text-muted-foreground sm:text-sm">
					<p>Monday — Friday: 9:00 AM — 6:00 PM (GMT+8)</p>
					<p>Saturday: 9:00 AM — 1:00 PM</p>
				</CardContent>
			</Card>
		</div>

		<Card size="sm" class="min-w-0">
			<CardHeader>
				<CardTitle>Send a Message</CardTitle>
			</CardHeader>
			<CardContent>
				{#if sent}
					<div class="flex h-full min-h-64 flex-col items-center justify-center gap-3 text-center">
						<CheckCircle class="size-10 text-primary" data-icon="header" />
						<h2 class="text-base font-semibold sm:text-lg">Message received</h2>
						<p class="max-w-sm text-xs text-muted-foreground sm:text-sm">
							Thanks, {name.split(' ')[0] || 'there'}. A member of our team will get back to you at
							<span class="font-medium break-all text-foreground sm:break-normal">{email}</span> within
							one business day.
						</p>
						<Button variant="outline" class="h-11" onclick={() => (sent = false)}>
							Send another message
						</Button>
					</div>
				{:else}
					{#if submitError}
						<Alert variant="destructive" class="mb-3">
							<AlertDescription class="text-xs sm:text-sm">{submitError}</AlertDescription>
						</Alert>
					{/if}
					<form
						class="grid min-w-0 gap-3"
						bind:this={formEl}
						aria-busy={sending}
						onsubmit={(e) => {
							e.preventDefault();
							void submit();
						}}
					>
						<div class="grid min-w-0 gap-3 sm:grid-cols-2">
							<Field data-invalid={Boolean(fieldErrors.name)}>
								<FieldLabel for="contact-name">Full name</FieldLabel>
								<Input
									id="contact-name"
									bind:value={name}
									placeholder="Jane Doe"
									class="h-11 min-w-0 text-sm"
									autocomplete="name"
									maxlength={200}
									required
									aria-invalid={fieldErrors.name ? true : undefined}
									aria-describedby={fieldErrors.name ? 'contact-name-error' : undefined}
									oninput={() => {
										if (fieldErrors.name) fieldErrors = { ...fieldErrors, name: '' };
									}}
								/>
								{#if fieldErrors.name}
									<FieldError id="contact-name-error">{fieldErrors.name}</FieldError>
								{/if}
							</Field>
							<Field data-invalid={Boolean(fieldErrors.email)}>
								<FieldLabel for="contact-email">Work email</FieldLabel>
								<Input
									id="contact-email"
									type="email"
									bind:value={email}
									placeholder="jane@company.com"
									class="h-11 min-w-0 text-sm"
									autocomplete="email"
									maxlength={200}
									required
									aria-invalid={fieldErrors.email ? true : undefined}
									aria-describedby={fieldErrors.email ? 'contact-email-error' : undefined}
									oninput={() => {
										if (fieldErrors.email) fieldErrors = { ...fieldErrors, email: '' };
									}}
								/>
								{#if fieldErrors.email}
									<FieldError id="contact-email-error">{fieldErrors.email}</FieldError>
								{/if}
							</Field>
						</div>
						<div class="grid min-w-0 gap-3 sm:grid-cols-2">
							<Field>
								<FieldLabel for="contact-company">Company (optional)</FieldLabel>
								<Input
									id="contact-company"
									bind:value={company}
									placeholder="Your company"
									class="h-11 min-w-0 text-sm"
									autocomplete="organization"
									maxlength={200}
								/>
							</Field>
							<Field>
								<FieldLabel for="contact-topic">Topic</FieldLabel>
								<Select type="single" bind:value={topic}>
									<SelectTrigger id="contact-topic" class="h-11 w-full min-w-0 text-sm">
										Select a topic
									</SelectTrigger>
									<SelectContent>
										{#each topics as t (t)}
											<SelectItem value={t}>{t}</SelectItem>
										{/each}
									</SelectContent>
								</Select>
							</Field>
						</div>
						<Field data-invalid={Boolean(fieldErrors.message)}>
							<FieldLabel for="contact-message">Message</FieldLabel>
							<Textarea
								id="contact-message"
								bind:value={message}
								rows={5}
								placeholder="Tell us what you need..."
								class="max-h-80 min-h-28 w-full max-w-full resize-y overflow-auto text-sm"
								maxlength={5000}
								required
								aria-invalid={fieldErrors.message ? true : undefined}
								aria-describedby={fieldErrors.message
									? 'contact-message-error contact-message-description'
									: 'contact-message-description'}
								oninput={() => {
									if (fieldErrors.message) fieldErrors = { ...fieldErrors, message: '' };
								}}
							/>
							{#if fieldErrors.message}
								<FieldError id="contact-message-error">{fieldErrors.message}</FieldError>
							{/if}
							<FieldDescription id="contact-message-description">
								Include your certifying body or standard if your question is about verification.
							</FieldDescription>
						</Field>
						<Button
							type="submit"
							class="h-11 w-full sm:w-auto"
							disabled={sending}
							aria-busy={sending}
						>
							{#if sending}
								<Loader2 class="size-4 animate-spin" data-icon="inline-start" />
								Sending...
							{:else}
								Send message
								<Send class="size-4" data-icon="inline-end" />
							{/if}
						</Button>
					</form>
				{/if}
			</CardContent>
		</Card>
	</div>
</section>
