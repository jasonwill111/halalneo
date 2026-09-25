<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { authClient } from '#lib/auth-client.js';
	import { z } from 'zod';
	import { toast } from 'svelte-sonner';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import { Alert, AlertDescription } from '#lib/components/ui/alert/index.js';
	import { Card, CardContent } from '#lib/components/ui/card/index.js';
	import { Field, FieldLabel, FieldError } from '#lib/components/ui/field/index.js';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '#lib/components/ui/select/index.js';
	import { focusFirstInvalid, mergeServerDetails, readAuthErrorDetails } from '#lib/utils/forms.js';
	import Building2 from '@lucide/svelte/icons/building-2';
	import Mail from '@lucide/svelte/icons/mail';
	import Lock from '@lucide/svelte/icons/lock';
	import Globe from '@lucide/svelte/icons/globe';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import CheckCircle2 from '@lucide/svelte/icons/check-circle-2';

	type BusinessType = 'manufacturer' | 'wholesaler' | 'trader';

	const businessTypes: Array<{ value: BusinessType; label: string }> = [
		{ value: 'manufacturer', label: 'Manufacturer' },
		{ value: 'wholesaler', label: 'Wholesaler' },
		{ value: 'trader', label: 'Trader' }
	];

	const registrationSchema = z.object({
		name: z.string().trim().min(2, 'Company name is required.').max(200),
		email: z.string().trim().min(1, 'Email is required.').email('Please enter a valid email.'),
		password: z.string().min(8, 'Password must be at least 8 characters.'),
		country: z.string().trim().min(2, 'Country is required.').max(100),
		businessType: z.enum(['manufacturer', 'wholesaler', 'trader'], {
			error: 'Please choose a business type.'
		}),
		description: z.string().trim().max(4000, 'Description must be at most 4000 characters.'),
		website: z.string().trim().max(500, 'Website must be at most 500 characters.')
	});

	let name = $state('');
	let email = $state('');
	let password = $state('');
	let country = $state('');
	let businessType = $state<BusinessType | ''>('');
	let description = $state('');
	let website = $state('');
	let fieldErrors = $state<Record<string, string>>({});
	let formError = $state('');
	let formEl = $state<HTMLFormElement | undefined>(undefined);
	let busy = $state(false);
	let accountCreated = $state(false);
	let pendingApproval = $state(false);

	function captureFormElement(node: HTMLFormElement): () => void {
		formEl = node;
		return () => {
			if (formEl === node) formEl = undefined;
		};
	}

	function parseServerMessage(data: unknown, fallback: string): string {
		if (data && typeof data === 'object' && 'error' in data && typeof data.error === 'string') {
			return data.error;
		}
		return fallback;
	}

	async function signOutSafely(): Promise<void> {
		try {
			await authClient.signOut();
		} catch {
			return;
		}
	}

	async function signInAndRegister(): Promise<boolean> {
		const { error: signInError } = await authClient.signIn.email({
			email: email.trim(),
			password
		});
		if (signInError) {
			const details = readAuthErrorDetails(signInError);
			if (details) fieldErrors = mergeServerDetails(fieldErrors, details);
			formError = 'Your account was created, but we could not sign you in. Try again below.';
			return false;
		}
		try {
			const response = await fetch('/api/supplier-register', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: name.trim(),
					country: country.trim(),
					businessType,
					description: description.trim() || null,
					website: website.trim() || null
				})
			});
			if (!response.ok) {
				const data: unknown = await response.json().catch(() => ({}));
				const message = parseServerMessage(data, 'We could not create your supplier registration.');
				await signOutSafely();
				formError = `${message} Your details are still here. Please retry.`;
				return false;
			}
		} catch {
			await signOutSafely();
			formError =
				'We could not reach the supplier registration service. Your details are still here. Please retry.';
			return false;
		}
		await signOutSafely();
		pendingApproval = true;
		return true;
	}

	async function retryRegistration(): Promise<void> {
		if (busy) return;
		busy = true;
		formError = '';
		try {
			if (await signInAndRegister()) {
				toast.success('Supplier registration submitted for Admin approval.');
			} else {
				toast.warning(formError);
			}
		} finally {
			busy = false;
		}
	}

	async function submit(): Promise<void> {
		if (busy) return;
		fieldErrors = {};
		formError = '';
		const parsed = registrationSchema.safeParse({
			name,
			email,
			password,
			country,
			businessType,
			description,
			website
		});
		if (!parsed.success) {
			for (const issue of parsed.error.issues) {
				const key = String(issue.path[0] ?? '');
				if (key && !fieldErrors[key]) fieldErrors = { ...fieldErrors, [key]: issue.message };
			}
			focusFirstInvalid(formEl);
			return;
		}
		busy = true;
		try {
			if (!accountCreated) {
				const { error: signUpError } = await authClient.signUp.email({
					email: email.trim(),
					password,
					name: name.trim()
				});
				if (signUpError) {
					const details = readAuthErrorDetails(signUpError, 'email');
					if (details) fieldErrors = mergeServerDetails(fieldErrors, details);
					formError = signUpError.message ?? 'We could not create your account. Please try again.';
					toast.error(formError);
					focusFirstInvalid(formEl);
					return;
				}
				accountCreated = true;
			}
			if (await signInAndRegister()) {
				toast.success('Supplier registration submitted for Admin approval.');
			} else {
				toast.warning(formError);
			}
		} catch {
			formError = 'Something went wrong while creating your supplier account. Please try again.';
			toast.error(formError);
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head>
	<title>Supplier Registration — HalalNeo</title>
	<meta name="description" content="Register your halal supplier business for Admin approval." />
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main class="flex min-h-dvh items-start justify-center px-4 py-6 sm:items-center sm:py-8">
	<div class="w-full max-w-xl">
		<div class="mb-5 text-center">
			<div
				class="mx-auto mb-2 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary"
			>
				<Building2 class="size-6" />
			</div>
			<h1 class="text-xl font-bold tracking-tight sm:text-2xl">Supplier registration</h1>
			<p class="mt-1 text-xs text-muted-foreground sm:text-sm">
				Create your supplier account. Our Admin team reviews every registration before portal access
				is approved.
			</p>
		</div>

		{#if pendingApproval}
			<Card class="p-5 sm:p-6">
				<CardContent class="flex flex-col items-center p-0 text-center">
					<div
						class="mb-3 flex size-12 items-center justify-center rounded-full bg-success/10 text-success"
					>
						<CheckCircle2 class="size-6" />
					</div>
					<h2 class="text-lg font-semibold">Registration submitted</h2>
					<p class="mt-2 max-w-sm text-sm text-muted-foreground">
						Your supplier registration is pending Admin approval. We will review your business
						details and contact you at {email} when a decision is made.
					</p>
					<p class="mt-3 text-xs text-muted-foreground">
						You cannot access the supplier portal until your registration is approved.
					</p>
					<div class="mt-5 flex flex-wrap justify-center gap-2">
						<Button href={localizeHref('/supplier/login')} variant="outline" size="sm">
							Supplier sign in
						</Button>
						<Button href={localizeHref('/supplier/onboarding')} size="sm">
							Supplier introduction
						</Button>
					</div>
				</CardContent>
			</Card>
		{:else}
			<Card class="p-4 sm:p-5">
				<CardContent class="p-0">
					<div class="mb-4 rounded-lg bg-info/10 p-3 text-xs text-info">
						Supplier accounts require Admin approval. Your portal access stays unavailable while
						your registration is pending or rejected.
					</div>
					<form
						{@attach captureFormElement}
						class="grid gap-3 sm:grid-cols-2"
						aria-busy={busy}
						onsubmit={(event) => {
							event.preventDefault();
							void submit();
						}}
					>
						<Field data-invalid={Boolean(fieldErrors.name)} class="sm:col-span-2">
							<FieldLabel for="supplier-company">Company name</FieldLabel>
							<Input
								id="supplier-company"
								bind:value={name}
								type="text"
								placeholder="Your legal company name"
								autocomplete="organization"
								aria-invalid={fieldErrors.name ? true : undefined}
								aria-describedby={fieldErrors.name ? 'supplier-company-error' : undefined}
								oninput={() => {
									if (fieldErrors.name) fieldErrors = { ...fieldErrors, name: '' };
								}}
							/>
							{#if fieldErrors.name}
								<FieldError id="supplier-company-error">{fieldErrors.name}</FieldError>
							{/if}
						</Field>

						<Field data-invalid={Boolean(fieldErrors.email)}>
							<FieldLabel for="supplier-email">Email</FieldLabel>
							<div class="relative min-w-0">
								<Mail
									class="pointer-events-none absolute start-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
								/>
								<Input
									id="supplier-email"
									bind:value={email}
									type="email"
									placeholder="you@company.com"
									class="ps-9"
									autocomplete="email"
									aria-invalid={fieldErrors.email ? true : undefined}
									aria-describedby={fieldErrors.email ? 'supplier-email-error' : undefined}
									oninput={() => {
										if (fieldErrors.email) fieldErrors = { ...fieldErrors, email: '' };
									}}
								/>
							</div>
							{#if fieldErrors.email}
								<FieldError id="supplier-email-error">{fieldErrors.email}</FieldError>
							{/if}
						</Field>

						<Field data-invalid={Boolean(fieldErrors.password)}>
							<FieldLabel for="supplier-password">Password</FieldLabel>
							<div class="relative min-w-0">
								<Lock
									class="pointer-events-none absolute start-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
								/>
								<Input
									id="supplier-password"
									bind:value={password}
									type="password"
									placeholder="Min. 8 characters"
									class="ps-9"
									autocomplete="new-password"
									aria-invalid={fieldErrors.password ? true : undefined}
									aria-describedby={fieldErrors.password ? 'supplier-password-error' : undefined}
									oninput={() => {
										if (fieldErrors.password) fieldErrors = { ...fieldErrors, password: '' };
									}}
								/>
							</div>
							{#if fieldErrors.password}
								<FieldError id="supplier-password-error">{fieldErrors.password}</FieldError>
							{/if}
						</Field>

						<Field data-invalid={Boolean(fieldErrors.country)}>
							<FieldLabel for="supplier-country">Country</FieldLabel>
							<div class="relative min-w-0">
								<Globe
									class="pointer-events-none absolute start-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
								/>
								<Input
									id="supplier-country"
									bind:value={country}
									type="text"
									placeholder="Country"
									class="ps-9"
									aria-invalid={fieldErrors.country ? true : undefined}
									aria-describedby={fieldErrors.country ? 'supplier-country-error' : undefined}
									oninput={() => {
										if (fieldErrors.country) fieldErrors = { ...fieldErrors, country: '' };
									}}
								/>
							</div>
							{#if fieldErrors.country}
								<FieldError id="supplier-country-error">{fieldErrors.country}</FieldError>
							{/if}
						</Field>

						<Field data-invalid={Boolean(fieldErrors.businessType)}>
							<FieldLabel for="supplier-business-type">Business type</FieldLabel>
							<Select
								type="single"
								bind:value={businessType}
								onValueChange={() => {
									if (fieldErrors.businessType) {
										fieldErrors = { ...fieldErrors, businessType: '' };
									}
								}}
							>
								<SelectTrigger
									id="supplier-business-type"
									class="w-full"
									aria-invalid={fieldErrors.businessType ? true : undefined}
									aria-describedby={fieldErrors.businessType
										? 'supplier-business-type-error'
										: undefined}
								>
									{businessType
										? businessTypes.find((item) => item.value === businessType)?.label
										: 'Select…'}
								</SelectTrigger>
								<SelectContent>
									{#each businessTypes as item (item.value)}
										<SelectItem value={item.value}>{item.label}</SelectItem>
									{/each}
								</SelectContent>
							</Select>
							{#if fieldErrors.businessType}
								<FieldError id="supplier-business-type-error">{fieldErrors.businessType}</FieldError
								>
							{/if}
						</Field>

						<Field data-invalid={Boolean(fieldErrors.description)} class="sm:col-span-2">
							<FieldLabel for="supplier-description">Business description</FieldLabel>
							<Textarea
								id="supplier-description"
								bind:value={description}
								rows={3}
								placeholder="Tell buyers about your products and halal business"
								class="min-h-24"
								aria-invalid={fieldErrors.description ? true : undefined}
								aria-describedby={fieldErrors.description
									? 'supplier-description-error'
									: undefined}
								oninput={() => {
									if (fieldErrors.description) fieldErrors = { ...fieldErrors, description: '' };
								}}
							/>
							{#if fieldErrors.description}
								<FieldError id="supplier-description-error">{fieldErrors.description}</FieldError>
							{/if}
						</Field>

						<Field data-invalid={Boolean(fieldErrors.website)} class="sm:col-span-2">
							<FieldLabel for="supplier-website"
								>Website <span class="font-normal text-muted-foreground">(optional)</span
								></FieldLabel
							>
							<Input
								id="supplier-website"
								bind:value={website}
								type="url"
								placeholder="https://example.com"
								aria-invalid={fieldErrors.website ? true : undefined}
								aria-describedby={fieldErrors.website ? 'supplier-website-error' : undefined}
								oninput={() => {
									if (fieldErrors.website) fieldErrors = { ...fieldErrors, website: '' };
								}}
							/>
							{#if fieldErrors.website}
								<FieldError id="supplier-website-error">{fieldErrors.website}</FieldError>
							{/if}
						</Field>

						{#if formError && !Object.keys(fieldErrors).length}
							<Alert variant="destructive" class="sm:col-span-2">
								<AlertDescription class="text-xs sm:text-sm">{formError}</AlertDescription>
							</Alert>
						{/if}
						{#if accountCreated && formError && !busy}
							<Button
								type="button"
								variant="outline"
								class="sm:col-span-2"
								disabled={busy}
								onclick={() => void retryRegistration()}
							>
								Retry supplier registration
							</Button>
						{/if}

						<Button type="submit" class="h-11 sm:col-span-2" disabled={busy} aria-busy={busy}>
							{#if busy}
								<Loader2 class="size-3.5 animate-spin" data-icon="inline-start" />
								Submitting…
							{:else}
								Submit for Admin approval
								<ArrowRight class="size-3.5 rtl:rotate-180" data-icon="inline-end" />
							{/if}
						</Button>
					</form>
				</CardContent>
			</Card>
		{/if}

		<div class="mt-4 space-y-1 text-center text-xs text-muted-foreground">
			<p>
				Already registered?
				<a href={localizeHref('/supplier/login')} class="font-semibold text-primary hover:underline"
					>Supplier sign in</a
				>
			</p>
			<p>
				Want to learn how HalalNeo works first?
				<a href={localizeHref('/supplier/onboarding')} class="text-primary hover:underline"
					>Read the supplier introduction</a
				>
			</p>
		</div>
	</div>
</main>
