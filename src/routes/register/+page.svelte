<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import { authClient } from '#lib/auth-client.js';
	import { safeNextPath } from '#lib/utils/redirect.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Checkbox } from '#lib/components/ui/checkbox/index.js';
	import { Alert, AlertDescription } from '#lib/components/ui/alert/index.js';
	import { Card, CardContent } from '#lib/components/ui/card/index.js';
	import { Field, FieldLabel, FieldError } from '#lib/components/ui/field/index.js';
	import { z } from 'zod';
	import { toast } from 'svelte-sonner';
	import { focusFirstInvalid, mergeServerDetails, readAuthErrorDetails } from '#lib/utils/forms.js';
	import MailIcon from '@lucide/svelte/icons/mail';
	import LockIcon from '@lucide/svelte/icons/lock';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import Mark from '#lib/components/site/mark.svelte';

	let firstName = $state('');
	let lastName = $state('');
	let email = $state('');
	let password = $state('');
	let termsAccepted = $state(false);
	let error = $state('');
	let fieldErrors = $state<Record<string, string>>({});
	let formEl = $state<HTMLFormElement | undefined>(undefined);
	let busy = $state(false);
	let accountCreated = $state(false);

	function captureFormElement(node: HTMLFormElement): () => void {
		formEl = node;
		return () => {
			if (formEl === node) formEl = undefined;
		};
	}

	const registerSchema = z.object({
		firstName: z.string().trim().min(1, 'First name is required.'),
		lastName: z.string().trim().min(1, 'Last name is required.'),
		email: z.string().trim().min(1, 'Email is required.').email('Please enter a valid email.'),
		password: z.string().min(8, 'Password must be at least 8 characters.'),
		termsAccepted: z.literal(true, {
			error: 'Please agree to the Terms of Service and Privacy Policy.'
		})
	});

	async function signInAndCreateBuyerProfile(): Promise<boolean> {
		const { error: signInError } = await authClient.signIn.email({
			email: email.trim(),
			password
		});
		if (signInError) {
			const details = readAuthErrorDetails(signInError);
			if (details) fieldErrors = mergeServerDetails(fieldErrors, details);
			error = 'Your account was created, but we could not sign you in. Try again below.';
			return false;
		}
		try {
			const response = await fetch('/api/buyers', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({})
			});
			if (!response.ok) {
				const data: unknown = await response.json().catch(() => ({}));
				const message =
					data && typeof data === 'object' && 'error' in data && typeof data.error === 'string'
						? data.error
						: 'The Buyer profile could not be created.';
				await authClient.signOut();
				error = `Your account was created, but ${message.toLowerCase()} Please retry — your details are still here.`;
				return false;
			}
		} catch {
			await authClient.signOut();
			error =
				'Your account was created, but the Buyer profile could not be reached. Please retry — your details are still here.';
			return false;
		}
		return true;
	}

	async function retryBuyerSetup(): Promise<void> {
		if (busy) return;
		busy = true;
		error = '';
		try {
			if (!(await signInAndCreateBuyerProfile())) {
				toast.error(error);
				return;
			}
			toast.success('Buyer account ready. Welcome to HalalNeo.');
			await invalidateAll();
			await goto(safeNextPath(page.url.searchParams.get('next'), localizeHref('/account')));
		} finally {
			busy = false;
		}
	}

	async function submit() {
		if (busy) return;
		fieldErrors = {};
		error = '';
		const parsed = registerSchema.safeParse({
			firstName,
			lastName,
			email,
			password,
			termsAccepted
		});
		if (!parsed.success) {
			for (const issue of parsed.error.issues) {
				const key = String(issue.path[0] ?? '');
				if (key && !fieldErrors[key]) fieldErrors = { ...fieldErrors, [key]: issue.message };
			}
			focusFirstInvalid(formEl);
			return;
		}
		const normalizedEmail = email.trim();
		busy = true;
		try {
			if (!accountCreated) {
				const { error: signUpError } = await authClient.signUp.email({
					email: normalizedEmail,
					password,
					name: `${firstName.trim()} ${lastName.trim()}`.trim()
				});
				if (signUpError) {
					const details = readAuthErrorDetails(signUpError, 'email');
					if (details) fieldErrors = mergeServerDetails(fieldErrors, details);
					error = signUpError.message ?? 'We could not create your account. Please try again.';
					toast.error(error);
					focusFirstInvalid(formEl);
					return;
				}
				accountCreated = true;
			}
			if (!(await signInAndCreateBuyerProfile())) {
				toast.warning(error);
				return;
			}
			toast.success('Buyer account ready. Welcome to HalalNeo.');
			await invalidateAll();
			await goto(safeNextPath(page.url.searchParams.get('next'), localizeHref('/account')));
		} catch {
			error = 'We could not create your account. Please try again.';
			toast.error(error);
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main
	class="register-pattern pattern-girih flex min-h-[calc(100vh-4rem)] items-start justify-center px-4 py-6 pb-16 sm:items-center sm:px-5 sm:py-8"
>
	<div class="w-full max-w-lg">
		<div class="mb-4 text-center sm:mb-5">
			<div
				class="mx-auto mb-2 flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground sm:size-12"
			>
				<Mark class="size-6 sm:size-7" />
			</div>
			<h1 class="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
				Buyer registration
			</h1>
			<p class="mt-1 text-xs text-muted-foreground sm:text-sm">
				Create a Buyer account to source halal products from the global trade network
			</p>
		</div>

		<Card class="p-4 sm:p-5">
			<CardContent class="p-0">
				<!-- Step indicator -->
				<div class="mb-4 flex items-center justify-center gap-1.5 sm:mb-5">
					<div class="flex items-center gap-1.5">
						<div
							class="flex size-6 items-center justify-center rounded-full bg-primary text-2xs font-semibold text-primary-foreground"
						>
							1
						</div>
						<span class="text-2xs font-medium text-primary">Account</span>
					</div>
					<div class="h-px w-6 bg-border"></div>
					<div class="flex items-center gap-1.5">
						<div
							class="flex size-6 items-center justify-center rounded-full bg-muted text-2xs font-semibold text-muted-foreground"
						>
							2
						</div>
						<span class="text-2xs text-muted-foreground">Verify</span>
					</div>
				</div>

				<!-- Supplier banner -->
				<div class="mb-3 rounded-lg bg-muted/50 px-3 py-2 text-center">
					<p class="text-2xs text-muted-foreground">
						Want to sell products?
						<a
							href={localizeHref('/supplier/register')}
							class="inline-flex min-h-11 items-center font-semibold text-primary hover:underline"
						>
							Start Supplier registration
						</a>
					</p>
				</div>

				<form
					{@attach captureFormElement}
					class="grid gap-3"
					aria-busy={busy}
					onsubmit={(e) => {
						e.preventDefault();
						void submit();
					}}
				>
					<div class="grid gap-3 sm:grid-cols-2">
						<Field data-invalid={Boolean(fieldErrors.firstName)}>
							<FieldLabel for="first-name">First Name</FieldLabel>
							<Input
								id="first-name"
								bind:value={firstName}
								type="text"
								placeholder="John"
								class="h-11 min-w-0 text-sm"
								autocomplete="given-name"
								aria-invalid={fieldErrors.firstName ? true : undefined}
								aria-describedby={fieldErrors.firstName ? 'first-name-error' : undefined}
								oninput={() => {
									if (fieldErrors.firstName) fieldErrors = { ...fieldErrors, firstName: '' };
								}}
							/>
							{#if fieldErrors.firstName}
								<FieldError id="first-name-error">{fieldErrors.firstName}</FieldError>
							{/if}
						</Field>
						<Field data-invalid={Boolean(fieldErrors.lastName)}>
							<FieldLabel for="last-name">Last Name</FieldLabel>
							<Input
								id="last-name"
								bind:value={lastName}
								type="text"
								placeholder="Doe"
								class="h-11 min-w-0 text-sm"
								autocomplete="family-name"
								aria-invalid={fieldErrors.lastName ? true : undefined}
								aria-describedby={fieldErrors.lastName ? 'last-name-error' : undefined}
								oninput={() => {
									if (fieldErrors.lastName) fieldErrors = { ...fieldErrors, lastName: '' };
								}}
							/>
							{#if fieldErrors.lastName}
								<FieldError id="last-name-error">{fieldErrors.lastName}</FieldError>
							{/if}
						</Field>
					</div>

					<div class="grid gap-3 sm:grid-cols-2">
						<Field data-invalid={Boolean(fieldErrors.email)}>
							<FieldLabel for="register-email">Email</FieldLabel>
							<div class="relative min-w-0">
								<MailIcon
									class="pointer-events-none absolute start-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
								></MailIcon>
								<Input
									id="register-email"
									bind:value={email}
									type="email"
									placeholder="you@company.com"
									class="h-11 min-w-0 ps-9 text-sm"
									autocomplete="email"
									aria-invalid={fieldErrors.email ? true : undefined}
									aria-describedby={fieldErrors.email ? 'register-email-error' : undefined}
									oninput={() => {
										if (fieldErrors.email) fieldErrors = { ...fieldErrors, email: '' };
									}}
								/>
							</div>
							{#if fieldErrors.email}
								<FieldError id="register-email-error">{fieldErrors.email}</FieldError>
							{/if}
						</Field>

						<Field data-invalid={Boolean(fieldErrors.password)}>
							<FieldLabel for="register-password">Password</FieldLabel>
							<div class="relative min-w-0">
								<LockIcon
									class="pointer-events-none absolute start-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
								></LockIcon>
								<Input
									id="register-password"
									bind:value={password}
									type="password"
									placeholder="Min. 8 characters"
									class="h-11 min-w-0 ps-9 text-sm"
									autocomplete="new-password"
									aria-invalid={fieldErrors.password ? true : undefined}
									aria-describedby={fieldErrors.password ? 'register-password-error' : undefined}
									oninput={() => {
										if (fieldErrors.password) fieldErrors = { ...fieldErrors, password: '' };
									}}
								/>
							</div>
							{#if fieldErrors.password}
								<FieldError id="register-password-error">{fieldErrors.password}</FieldError>
							{/if}
						</Field>
					</div>

					<Field data-invalid={Boolean(fieldErrors.termsAccepted)}>
						<div class="flex min-h-11 items-start gap-2">
							<Checkbox
								id="terms"
								bind:checked={termsAccepted}
								class="mt-0.5 after:-inset-3.5"
								aria-required="true"
								aria-invalid={fieldErrors.termsAccepted ? true : undefined}
								aria-describedby={fieldErrors.termsAccepted ? 'terms-error' : undefined}
								onCheckedChange={() => {
									if (fieldErrors.termsAccepted)
										fieldErrors = { ...fieldErrors, termsAccepted: '' };
								}}
							/>
							<label for="terms" class="text-xs leading-snug text-muted-foreground sm:text-sm">
								I agree to the
								<span class="font-medium text-primary">Terms of Service</span>
								and
								<span class="font-medium text-primary">Privacy Policy</span>
							</label>
						</div>
						{#if fieldErrors.termsAccepted}
							<FieldError id="terms-error">{fieldErrors.termsAccepted}</FieldError>
						{/if}
					</Field>

					{#if error && !Object.keys(fieldErrors).length}
						<Alert variant="destructive">
							<AlertDescription class="text-xs sm:text-sm">{error}</AlertDescription>
						</Alert>
					{/if}
					{#if accountCreated && error && !busy}
						<Button
							type="button"
							variant="outline"
							class="h-10 w-full"
							disabled={busy}
							onclick={() => void retryBuyerSetup()}
						>
							Retry Buyer setup
						</Button>
					{/if}

					<Button type="submit" class="h-11 w-full" disabled={busy} aria-busy={busy}>
						{#if busy}
							<Loader2 class="size-3.5 animate-spin" data-icon="inline-start" />
							Creating…
						{:else}
							Create Account
							<ArrowRight class="size-3.5 rtl:rotate-180" data-icon="inline-end" />
						{/if}
					</Button>
				</form>
			</CardContent>
		</Card>

		<div class="mt-3 text-center sm:mt-5">
			<p class="text-xs text-muted-foreground sm:text-sm">
				Already have an account?
				<a
					href={localizeHref('/login')}
					class="inline-flex min-h-11 items-center font-semibold text-primary hover:underline"
				>
					Sign in
				</a>
			</p>
			<a
				href={localizeHref('/')}
				class="inline-flex min-h-11 items-center text-2xs text-muted-foreground transition-colors hover:text-primary"
			>
				&larr; Back to home
			</a>
		</div>
	</div>
</main>

<style>
	:global(.register-pattern) {
		background-image:
			radial-gradient(
				circle at 80% 50%,
				color-mix(in oklab, var(--primary) 4%, transparent) 0%,
				transparent 50%
			),
			radial-gradient(
				circle at 20% 80%,
				color-mix(in oklab, var(--primary) 3%, transparent) 0%,
				transparent 50%
			);
	}
	:global(.dark .register-pattern) {
		background-image:
			radial-gradient(
				circle at 80% 50%,
				color-mix(in oklab, var(--primary) 6%, transparent) 0%,
				transparent 50%
			),
			radial-gradient(
				circle at 20% 80%,
				color-mix(in oklab, var(--primary) 4%, transparent) 0%,
				transparent 50%
			);
	}
</style>
