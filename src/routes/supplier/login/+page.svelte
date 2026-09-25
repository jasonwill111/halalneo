<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { goto } from '$app/navigation';
	import { authClient } from '#lib/auth-client.js';
	import { toast } from 'svelte-sonner';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label, FieldError } from '#lib/components/ui/field/index.js';
	import { Card, CardContent } from '#lib/components/ui/card/index.js';
	import { z } from 'zod';
	import { focusFirstInvalid, mergeServerDetails } from '#lib/utils/forms.js';
	import Building2 from '@lucide/svelte/icons/building-2';
	import Mail from '@lucide/svelte/icons/mail';
	import Lock from '@lucide/svelte/icons/lock';

	let email = $state('');
	let password = $state('');
	let fieldErrors = $state<Record<string, string>>({});
	let formError = $state('');
	let busy = $state(false);
	let formEl = $state<HTMLFormElement | undefined>(undefined);

	const loginSchema = z.object({
		email: z.string().trim().min(1, 'Email is required.').email('Please enter a valid email.'),
		password: z.string().min(1, 'Password is required.')
	});

	/**
	 * Better-auth client errors arrive as `{ message, status, body }`. When the
	 * server replies with the project's `{ error, details: { field: [msg] } }`
	 * shape we merge those field messages (Project Rules §3.4); otherwise the
	 * message is mapped onto the field the user can actually act on.
	 */
	function readErrorDetails(err: unknown): Record<string, string[] | string> | null {
		if (!err || typeof err !== 'object') return null;
		const body = (err as { body?: unknown }).body;
		if (body && typeof body === 'object') {
			const details = (body as { details?: unknown }).details;
			if (details && typeof details === 'object') {
				return details as Record<string, string[] | string>;
			}
		}
		const { status, message } = err as { status?: number; message?: string };
		if (status && status >= 400 && message) {
			return /email/i.test(message) ? { email: message } : { password: message };
		}
		return null;
	}

	async function submit() {
		if (busy) return; // double-submit guard (§3.4)
		fieldErrors = {};
		formError = '';
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
				password
			});
			if (signInError) {
				const details = readErrorDetails(signInError);
				if (details) fieldErrors = mergeServerDetails(fieldErrors, details);
				formError = signInError.message ?? 'Invalid email or password.';
				toast.error(formError);
				focusFirstInvalid(formEl);
				return;
			}
			await goto(localizeHref('/supplier/dashboard'));
		} catch {
			formError = 'Could not sign in. Please try again.';
			toast.error(formError);
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head>
	<title>Supplier Login — HalalNeo</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main class="flex min-h-dvh items-center justify-center px-4 pt-6 pb-10">
	<div class="mx-auto w-full max-w-md animate-fade-in">
		<div class="mb-5">
			<div
				class="mx-auto mb-2 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary"
			>
				<Building2 class="size-6"></Building2>
			</div>
			<h1 class="text-center text-xl font-bold tracking-tight sm:text-2xl">Supplier Portal</h1>
			<p class="mt-1 text-center text-xs text-muted-foreground">
				Access your supplier dashboard to manage listings and orders.
			</p>
		</div>

		<Card class="p-5">
			<CardContent class="space-y-3 p-0">
				<form
					bind:this={formEl}
					class="space-y-3"
					onsubmit={(e) => {
						e.preventDefault();
						submit();
					}}
				>
					<div class="space-y-1">
						<Label class="text-2xs font-medium">Email</Label>
						<div class="relative">
							<Mail
								class="pointer-events-none absolute start-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
							></Mail>
							<Input
								bind:value={email}
								type="email"
								autocomplete="email"
								placeholder="you@company.com"
								class="h-9 ps-9 text-2xs-plus"
								aria-invalid={fieldErrors.email ? true : undefined}
								oninput={() => {
									if (fieldErrors.email) fieldErrors = { ...fieldErrors, email: '' };
								}}
							/>
						</div>
						{#if fieldErrors.email}<FieldError>{fieldErrors.email}</FieldError>{/if}
					</div>
					<div class="space-y-1">
						<Label class="text-2xs font-medium">Password</Label>
						<div class="relative">
							<Lock
								class="pointer-events-none absolute start-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
							></Lock>
							<Input
								bind:value={password}
								type="password"
								autocomplete="current-password"
								placeholder="••••••••"
								class="h-9 ps-9 text-2xs-plus"
								aria-invalid={fieldErrors.password ? true : undefined}
								oninput={() => {
									if (fieldErrors.password) fieldErrors = { ...fieldErrors, password: '' };
								}}
							/>
						</div>
						{#if fieldErrors.password}<FieldError>{fieldErrors.password}</FieldError>{/if}
					</div>
					{#if formError && Object.keys(fieldErrors).length === 0}
						<p class="text-2xs-plus text-destructive">{formError}</p>
					{/if}
					<Button type="submit" class="w-full" disabled={busy}>
						{busy ? 'Signing in…' : 'Sign in'}
					</Button>
				</form>
			</CardContent>
		</Card>

		<div class="mt-5 space-y-1.5 text-center">
			<p class="text-2xs-plus text-muted-foreground">
				New to selling on HalalNeo?
				<a href={localizeHref('/supplier/onboarding')} class="text-primary hover:underline"
					>Apply to become a supplier</a
				>
			</p>
			<p class="text-2xs text-muted-foreground">
				Looking to source?
				<a href={localizeHref('/login')} class="text-primary hover:underline">Buyer sign in</a>
			</p>
		</div>
	</div>
</main>
