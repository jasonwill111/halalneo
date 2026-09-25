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

	let email = $state('');
	let password = $state('');
	let rememberMe = $state(false);
	let error = $state('');
	let fieldErrors = $state<Record<string, string>>({});
	let formEl = $state<HTMLFormElement | undefined>(undefined);
	let busy = $state(false);

	const loginSchema = z.object({
		email: z.string().trim().min(1, 'Email is required.').email('Please enter a valid email.'),
		password: z.string().min(1, 'Password is required.')
	});

	async function submit() {
		if (busy) return;
		fieldErrors = {};
		error = '';
		const parsed = loginSchema.safeParse({ email, password });
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
			const { error: signInError } = await authClient.signIn.email({
				email: email.trim(),
				password,
				rememberMe
			});
			if (signInError) {
				// better-auth shape: `{ message, status, body }`. Prefer the server's
				// `{ error, details }` field map (§3.4), keep the typed credentials.
				const details = readAuthErrorDetails(signInError);
				if (details) fieldErrors = mergeServerDetails(fieldErrors, details);
				error = signInError.message ?? 'Invalid email or password.';
				toast.error(error);
				focusFirstInvalid(formEl);
				return;
			}
			toast.success('Signed in. Welcome back.');
			await invalidateAll(); // refresh session-derived layout data (/account guard)
			await goto(safeNextPath(page.url.searchParams.get('next'), localizeHref('/account')));
		} catch {
			error = 'Something went wrong while signing you in. Please try again.';
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
	class="login-pattern pattern-girih flex min-h-[calc(100vh-4rem)] items-start justify-center px-4 py-6 pb-16 sm:items-center sm:px-5 sm:py-8"
>
	<div class="w-full max-w-lg">
		<div class="mb-4 text-center sm:mb-5">
			<div
				class="mx-auto mb-2 flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground sm:size-12"
			>
				<Mark class="size-6 sm:size-7" />
			</div>
			<h1 class="text-xl font-bold tracking-tight text-foreground sm:text-2xl">Welcome back</h1>
			<p class="mt-1 text-xs text-muted-foreground sm:text-sm">Sign in to your HalalNeo account</p>
		</div>

		<Card class="p-4 sm:p-5">
			<CardContent class="p-0">
				<form
					bind:this={formEl}
					class="grid gap-3 sm:grid-cols-2"
					aria-busy={busy}
					onsubmit={(e) => {
						e.preventDefault();
						void submit();
					}}
				>
					<Field data-invalid={Boolean(fieldErrors.email)}>
						<FieldLabel for="login-email">Email</FieldLabel>
						<div class="relative min-w-0">
							<MailIcon
								class="pointer-events-none absolute start-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
							></MailIcon>
							<Input
								id="login-email"
								bind:value={email}
								type="email"
								placeholder="you@company.com"
								class="h-11 min-w-0 ps-9 text-sm"
								autocomplete="email"
								aria-invalid={fieldErrors.email ? true : undefined}
								aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
								oninput={() => {
									if (fieldErrors.email) fieldErrors = { ...fieldErrors, email: '' };
								}}
							/>
						</div>
						{#if fieldErrors.email}
							<FieldError id="login-email-error">{fieldErrors.email}</FieldError>
						{/if}
					</Field>

					<Field data-invalid={Boolean(fieldErrors.password)}>
						<FieldLabel for="login-password">Password</FieldLabel>
						<div class="relative min-w-0">
							<LockIcon
								class="pointer-events-none absolute start-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
							></LockIcon>
							<Input
								id="login-password"
								bind:value={password}
								type="password"
								placeholder="Enter your password"
								class="h-11 min-w-0 ps-9 text-sm"
								autocomplete="current-password"
								aria-invalid={fieldErrors.password ? true : undefined}
								aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
								oninput={() => {
									if (fieldErrors.password) fieldErrors = { ...fieldErrors, password: '' };
								}}
							/>
						</div>
						{#if fieldErrors.password}
							<FieldError id="login-password-error">{fieldErrors.password}</FieldError>
						{/if}
					</Field>

					<div class="flex min-h-11 items-center gap-2 sm:col-span-2">
						<Checkbox bind:checked={rememberMe} id="remember" class="after:-inset-3.5" />
						<label for="remember" class="text-xs text-muted-foreground sm:text-sm"
							>Remember me</label
						>
					</div>

					{#if error && !Object.keys(fieldErrors).length}
						<Alert variant="destructive" class="sm:col-span-2">
							<AlertDescription class="text-xs sm:text-sm">{error}</AlertDescription>
						</Alert>
					{/if}

					<Button type="submit" class="h-11 w-full sm:col-span-2" disabled={busy} aria-busy={busy}>
						{#if busy}
							<Loader2 class="size-3.5 animate-spin" data-icon="inline-start" />
							Signing in…
						{:else}
							Sign In
							<ArrowRight class="size-3.5 rtl:rotate-180" data-icon="inline-end" />
						{/if}
					</Button>
				</form>
			</CardContent>
		</Card>

		<div class="mt-3 text-center sm:mt-5">
			<p class="text-xs text-muted-foreground sm:text-sm">
				Don't have an account?
				<a
					href={localizeHref('/register')}
					class="inline-flex min-h-11 items-center font-semibold text-primary hover:underline"
				>
					Sign up
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
	:global(.login-pattern) {
		background-image:
			radial-gradient(
				circle at 20% 50%,
				color-mix(in oklab, var(--primary) 4%, transparent) 0%,
				transparent 50%
			),
			radial-gradient(
				circle at 80% 20%,
				color-mix(in oklab, var(--primary) 3%, transparent) 0%,
				transparent 50%
			),
			radial-gradient(
				circle at 60% 80%,
				color-mix(in oklab, var(--primary) 2%, transparent) 0%,
				transparent 50%
			);
	}
	:global(.dark .login-pattern) {
		background-image:
			radial-gradient(
				circle at 20% 50%,
				color-mix(in oklab, var(--primary) 6%, transparent) 0%,
				transparent 50%
			),
			radial-gradient(
				circle at 80% 20%,
				color-mix(in oklab, var(--primary) 4%, transparent) 0%,
				transparent 50%
			),
			radial-gradient(
				circle at 60% 80%,
				color-mix(in oklab, var(--primary) 3%, transparent) 0%,
				transparent 50%
			);
	}
</style>
