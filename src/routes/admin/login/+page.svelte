<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { goto } from '$app/navigation';
	import { authClient } from '#lib/auth-client.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Field, FieldLabel, FieldError } from '#lib/components/ui/field/index.js';
	import MailIcon from '@lucide/svelte/icons/mail';
	import LockIcon from '@lucide/svelte/icons/lock';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import { z } from 'zod';
	import { focusFirstInvalid } from '#lib/utils/forms.js';

	let email = $state('');
	let password = $state('');
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
		const parsed = loginSchema.safeParse({ email, password });
		if (!parsed.success) {
			for (const issue of parsed.error.issues) {
				const key = String(issue.path[0] ?? '');
				if (key && !fieldErrors[key]) fieldErrors = { ...fieldErrors, [key]: issue.message };
			}
			focusFirstInvalid(formEl);
			return;
		}
		error = '';
		busy = true;
		try {
			const { error: signInError } = await authClient.signIn.email({
				email: email.trim(),
				password
			});
			if (signInError) {
				error = signInError.message ?? 'Invalid email or password.';
				return;
			}
			await goto(localizeHref('/admin'));
		} catch {
			error = 'Could not sign in. Please try again.';
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head>
	<title>Admin Sign In — HalalNeo</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main class="flex min-h-[calc(100vh-4rem)] items-center justify-center px-5 pb-20 pt-8">
	<div class="w-full max-w-md">
		<div class="mb-5 text-center">
			<div
				class="bg-primary text-primary-foreground mx-auto mb-2 flex size-12 items-center justify-center rounded-xl"
			>
				<ShieldCheck class="size-6"></ShieldCheck>
			</div>
			<h1 class="text-lg font-bold tracking-tight text-foreground">Admin sign in</h1>
			<p class="mt-1 text-xs text-muted-foreground">Restricted to authorised staff accounts</p>
		</div>

		<div class="rounded-xl bg-card p-5 ring-1 ring-foreground/10">
			<form bind:this={formEl} class="space-y-3" onsubmit={(e) => { e.preventDefault(); submit(); }}>
				<Field>
					<FieldLabel>Email</FieldLabel>
					<div class="relative">
						<MailIcon
							class="pointer-events-none absolute top-1/2 start-3 size-3.5 -translate-y-1/2 text-muted-foreground"
						></MailIcon>
						<Input
							bind:value={email}
							type="email"
							placeholder="admin@halalneo.com"
							class="ps-9"
							aria-invalid={fieldErrors.email ? true : undefined}
							oninput={() => { if (fieldErrors.email) fieldErrors = { ...fieldErrors, email: '' }; }}
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
							placeholder="••••••••"
							class="ps-9"
							aria-invalid={fieldErrors.password ? true : undefined}
							oninput={() => { if (fieldErrors.password) fieldErrors = { ...fieldErrors, password: '' }; }}
						/>
					</div>
					{#if fieldErrors.password}<FieldError>{fieldErrors.password}</FieldError>{/if}
				</Field>
				{#if error && !Object.keys(fieldErrors).length}
					<p class="text-xs text-destructive">{error}</p>
				{/if}
				<Button type="submit" class="w-full" disabled={busy}>
					{busy ? 'Signing in…' : 'Sign in'}
				</Button>
			</form>
		</div>
	</div>
</main>
