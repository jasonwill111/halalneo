<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { goto, invalidateAll } from '$app/navigation';
	import { page } from '$app/state';
	import { authClient } from '#lib/auth-client.js';
	import { safeNextPath } from '#lib/utils/redirect.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Checkbox } from '#lib/components/ui/checkbox/index.js';
	import { Field, FieldLabel, FieldError } from '#lib/components/ui/field/index.js';
	import { z } from 'zod';
	import { toast } from 'svelte-sonner';
	import { focusFirstInvalid, mergeServerDetails, readAuthErrorDetails } from '#lib/utils/forms.js';
	import MailIcon from '@lucide/svelte/icons/mail';
	import LockIcon from '@lucide/svelte/icons/lock';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Loader2 from '@lucide/svelte/icons/loader-2';

	let firstName = $state('');
	let lastName = $state('');
	let email = $state('');
	let password = $state('');
	let termsAccepted = $state(false);
	let error = $state('');
	let fieldErrors = $state<Record<string, string>>({});
	let formEl = $state<HTMLFormElement | undefined>(undefined);
	let busy = $state(false);

	const registerSchema = z.object({
		firstName: z.string().trim().min(1, 'First name is required.'),
		lastName: z.string().trim().min(1, 'Last name is required.'),
		email: z.string().trim().min(1, 'Email is required.').email('Please enter a valid email.'),
		password: z.string().min(8, 'Password must be at least 8 characters.'),
		termsAccepted: z.literal(true, {
			error: 'Please agree to the Terms of Service and Privacy Policy.'
		})
	});

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
			const { error: signUpError } = await authClient.signUp.email({
				email: normalizedEmail,
				password,
				name: `${firstName.trim()} ${lastName.trim()}`.trim()
			});
			if (signUpError) {
				// better-auth reports "user already exists" as a 4xx with the email in
				// the message; `readAuthErrorDetails` lands it on the email field.
				const details = readAuthErrorDetails(signUpError, 'email');
				if (details) fieldErrors = mergeServerDetails(fieldErrors, details);
				error = signUpError.message ?? 'We could not create your account. Please try again.';
				toast.error(error);
				focusFirstInvalid(formEl);
				return;
			}
			// Sign up only *may* return a session (email verification, plugins), so
			// exchange the credentials explicitly to guarantee a cookie is set.
			const { error: signInError } = await authClient.signIn.email({
				email: normalizedEmail,
				password
			});
			if (signInError) {
				const details = readAuthErrorDetails(signInError);
				if (details) fieldErrors = mergeServerDetails(fieldErrors, details);
				error = 'Account created, but we could not sign you in. Please sign in manually.';
				toast.warning(error);
				await goto(localizeHref('/login'));
				return;
			}
			toast.success('Account created. Welcome to HalalNeo.');
			await invalidateAll(); // refresh session-derived layout data
			await goto(safeNextPath(page.url.searchParams.get('next'), localizeHref('/account')));
		} catch {
			// Network / unexpected failure: one form-level error, input preserved.
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
	class="register-pattern flex min-h-[calc(100vh-4rem)] items-center justify-center px-5 pt-8 pb-20"
>
	<div class="w-full max-w-md">
		<div class="mb-5 text-center">
			<div
				class="mx-auto mb-2 flex size-12 items-center justify-center rounded-xl bg-primary text-lg font-bold text-primary-foreground"
			>
				H
			</div>
			<h1 class="text-lg font-bold tracking-tight text-foreground">Create your account</h1>
			<p class="mt-1 text-xs text-muted-foreground">Join the global halal trade network</p>
		</div>

		<div class="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
			<!-- Step indicator -->
			<div class="mb-5 flex items-center justify-center gap-1.5">
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
						href={localizeHref('/supplier/onboarding')}
						class="font-semibold text-primary hover:underline"
					>
						Apply as a Supplier
					</a>
				</p>
			</div>

			<form
				bind:this={formEl}
				class="space-y-2.5"
				onsubmit={(e) => {
					e.preventDefault();
					void submit();
				}}
			>
				<div class="grid grid-cols-2 gap-2.5">
					<Field>
						<FieldLabel>First Name</FieldLabel>
						<Input
							bind:value={firstName}
							type="text"
							placeholder="John"
							autocomplete="given-name"
							aria-invalid={fieldErrors.firstName ? true : undefined}
							oninput={() => {
								if (fieldErrors.firstName) fieldErrors = { ...fieldErrors, firstName: '' };
							}}
						/>
						{#if fieldErrors.firstName}<FieldError>{fieldErrors.firstName}</FieldError>{/if}
					</Field>
					<Field>
						<FieldLabel>Last Name</FieldLabel>
						<Input
							bind:value={lastName}
							type="text"
							placeholder="Doe"
							autocomplete="family-name"
							aria-invalid={fieldErrors.lastName ? true : undefined}
							oninput={() => {
								if (fieldErrors.lastName) fieldErrors = { ...fieldErrors, lastName: '' };
							}}
						/>
						{#if fieldErrors.lastName}<FieldError>{fieldErrors.lastName}</FieldError>{/if}
					</Field>
				</div>

				<Field>
					<FieldLabel>Email</FieldLabel>
					<div class="relative">
						<MailIcon
							class="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground"
						></MailIcon>
						<Input
							bind:value={email}
							type="email"
							placeholder="you@company.com"
							class="pl-9"
							autocomplete="email"
							aria-invalid={fieldErrors.email ? true : undefined}
							oninput={() => {
								if (fieldErrors.email) fieldErrors = { ...fieldErrors, email: '' };
							}}
						/>
					</div>
					{#if fieldErrors.email}<FieldError>{fieldErrors.email}</FieldError>{/if}
				</Field>

				<Field>
					<FieldLabel>Password</FieldLabel>
					<div class="relative">
						<LockIcon
							class="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground"
						></LockIcon>
						<Input
							bind:value={password}
							type="password"
							placeholder="Min. 8 characters"
							class="pl-9"
							autocomplete="new-password"
							aria-invalid={fieldErrors.password ? true : undefined}
							oninput={() => {
								if (fieldErrors.password) fieldErrors = { ...fieldErrors, password: '' };
							}}
						/>
					</div>
					{#if fieldErrors.password}<FieldError>{fieldErrors.password}</FieldError>{/if}
				</Field>

				<div class="flex items-start gap-2">
					<Checkbox
						id="terms"
						bind:checked={termsAccepted}
						class="mt-0.5"
						aria-required="true"
						aria-invalid={fieldErrors.termsAccepted ? true : undefined}
						onCheckedChange={() => {
							if (fieldErrors.termsAccepted) fieldErrors = { ...fieldErrors, termsAccepted: '' };
						}}
					/>
					<label for="terms" class="text-xs leading-snug text-muted-foreground">
						I agree to the
						<span class="font-medium text-primary">Terms of Service</span>
						and
						<span class="font-medium text-primary">Privacy Policy</span>
					</label>
				</div>
				{#if fieldErrors.termsAccepted}<FieldError>{fieldErrors.termsAccepted}</FieldError>{/if}

				{#if error && !Object.keys(fieldErrors).length}
					<FieldError class="rounded-md bg-destructive/10 px-3 py-2 text-center">
						{error}
					</FieldError>
				{/if}

				<Button type="submit" class="w-full" disabled={busy} aria-busy={busy}>
					<span class="inline-flex items-center gap-2">
						{#if busy}
							<Loader2 class="size-3.5 animate-spin" />
							Creating…
						{:else}
							Create Account
							<ArrowRight class="size-3.5" />
						{/if}
					</span>
				</Button>
			</form>
		</div>

		<div class="mt-5 text-center">
			<p class="text-xs text-muted-foreground">
				Already have an account?
				<a href={localizeHref('/login')} class="font-semibold text-primary hover:underline">
					Sign in
				</a>
			</p>
			<p class="mt-1.5 text-2xs text-muted-foreground">
				<a href={localizeHref('/')} class="transition-colors hover:text-primary">
					&larr; Back to home
				</a>
			</p>
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
