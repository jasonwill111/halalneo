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
	class="login-pattern pattern-girih flex min-h-[calc(100vh-4rem)] items-center justify-center px-5 pt-8 pb-20"
>
	<div class="w-full max-w-md">
		<div class="mb-5 text-center">
			<div
				class="mx-auto mb-2 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground"
			>
				<Mark class="size-7" />
			</div>
			<h1 class="text-lg font-bold tracking-tight text-foreground">Welcome back</h1>
			<p class="mt-1 text-xs text-muted-foreground">Sign in to your HalalNeo account</p>
		</div>

		<div class="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
			<form
				bind:this={formEl}
				class="space-y-3"
				onsubmit={(e) => {
					e.preventDefault();
					void submit();
				}}
			>
				<Field>
					<FieldLabel>Email</FieldLabel>
					<div class="relative">
						<MailIcon
							class="pointer-events-none absolute top-1/2 start-3 size-3.5 -translate-y-1/2 text-muted-foreground"
						></MailIcon>
						<Input
							bind:value={email}
							type="email"
							placeholder="you@company.com"
							class="ps-9"
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
							class="pointer-events-none absolute top-1/2 start-3 size-3.5 -translate-y-1/2 text-muted-foreground"
						></LockIcon>
						<Input
							bind:value={password}
							type="password"
							placeholder="Enter your password"
							class="ps-9"
							autocomplete="current-password"
							aria-invalid={fieldErrors.password ? true : undefined}
							oninput={() => {
								if (fieldErrors.password) fieldErrors = { ...fieldErrors, password: '' };
							}}
						/>
					</div>
					{#if fieldErrors.password}<FieldError>{fieldErrors.password}</FieldError>{/if}
				</Field>

				<div class="flex items-center gap-2">
					<Checkbox bind:checked={rememberMe} id="remember" />
					<label for="remember" class="text-xs text-muted-foreground">Remember me</label>
				</div>

				{#if error && !Object.keys(fieldErrors).length}
					<FieldError class="rounded-md bg-destructive/10 px-3 py-2 text-center">
						{error}
					</FieldError>
				{/if}

				<Button type="submit" class="w-full" disabled={busy} aria-busy={busy}>
					<span class="inline-flex items-center gap-2">
						{#if busy}
							<Loader2 class="size-3.5 animate-spin" />
							Signing in…
						{:else}
							Sign In
							<ArrowRight class="size-3.5 rtl:rotate-180" />
						{/if}
					</span>
				</Button>
			</form>
		</div>

		<div class="mt-5 text-center">
			<p class="text-xs text-muted-foreground">
				Don't have an account?
				<a href={localizeHref('/register')} class="font-semibold text-primary hover:underline">
					Sign up
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
