<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { goto } from '$app/navigation';
	import { authClient } from '#lib/auth-client.js';
	import { toast } from 'svelte-sonner';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Alert, AlertDescription } from '#lib/components/ui/alert/index.js';
	import { Card, CardContent } from '#lib/components/ui/card/index.js';
	import { Field, FieldLabel, FieldError } from '#lib/components/ui/field/index.js';
	import { z } from 'zod';
	import { focusFirstInvalid, mergeServerDetails, readAuthErrorDetails } from '#lib/utils/forms.js';
	import Building2 from '@lucide/svelte/icons/building-2';
	import Mail from '@lucide/svelte/icons/mail';
	import Lock from '@lucide/svelte/icons/lock';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Loader2 from '@lucide/svelte/icons/loader-2';

	type SupplierStatus = 'active' | 'pending' | 'rejected' | 'suspended' | 'inactive';
	type AccessState = 'idle' | SupplierStatus | 'missing';

	let email = $state('');
	let password = $state('');
	let fieldErrors = $state<Record<string, string>>({});
	let formError = $state('');
	let accessState = $state<AccessState>('idle');
	let formEl = $state<HTMLFormElement | undefined>(undefined);
	let busy = $state(false);

	function captureFormElement(node: HTMLFormElement): () => void {
		formEl = node;
		return () => {
			if (formEl === node) formEl = undefined;
		};
	}

	const loginSchema = z.object({
		email: z.string().trim().min(1, 'Email is required.').email('Please enter a valid email.'),
		password: z.string().min(1, 'Password is required.')
	});

	async function signOutSafely(): Promise<void> {
		try {
			await authClient.signOut();
		} catch {
			return;
		}
	}

	function getStatus(data: unknown): SupplierStatus | null {
		if (!data || typeof data !== 'object' || !('supplier' in data)) return null;
		const supplier = data.supplier;
		if (!supplier || typeof supplier !== 'object' || !('status' in supplier)) return null;
		const status = supplier.status;
		return status === 'active' ||
			status === 'pending' ||
			status === 'rejected' ||
			status === 'suspended' ||
			status === 'inactive'
			? status
			: null;
	}

	async function submit(): Promise<void> {
		if (busy) return;
		fieldErrors = {};
		formError = '';
		accessState = 'idle';
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
				const details = readAuthErrorDetails(signInError);
				if (details) fieldErrors = mergeServerDetails(fieldErrors, details);
				formError = signInError.message ?? 'Invalid email or password.';
				toast.error(formError);
				focusFirstInvalid(formEl);
				return;
			}
			const response = await fetch('/api/supplier-register');
			const data: unknown = await response.json().catch(() => ({}));
			if (!response.ok) {
				await signOutSafely();
				accessState = response.status === 404 ? 'missing' : 'idle';
				formError =
					response.status === 404
						? 'No supplier registration was found for this account. Register your business first.'
						: 'We could not check your supplier registration. Please try again.';
				toast.warning(formError);
				return;
			}
			const status = getStatus(data);
			if (
				status === 'pending' ||
				status === 'rejected' ||
				status === 'suspended' ||
				status === 'inactive'
			) {
				await signOutSafely();
				accessState = status;
				formError =
					status === 'rejected'
						? 'Your supplier registration was rejected. Admin approval is required before you can use the supplier portal.'
						: 'Admin approval is required before you can use the supplier portal.';
				toast.warning(formError);
				return;
			}
			if (status === 'active') {
				await goto(localizeHref('/supplier/account'));
				return;
			}
			await signOutSafely();
			formError =
				'Your supplier registration status is unavailable. Please contact the HalalNeo Admin team.';
			toast.error(formError);
		} catch {
			await signOutSafely();
			formError = 'Could not sign in. Please try again.';
			toast.error(formError);
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head>
	<title>Supplier Sign In — HalalNeo</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<main class="flex min-h-dvh items-center justify-center px-4 pt-6 pb-10">
	<div class="mx-auto w-full max-w-md animate-fade-in">
		<div class="mb-5">
			<div
				class="mx-auto mb-2 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary"
			>
				<Building2 class="size-6" />
			</div>
			<h1 class="text-center text-xl font-bold tracking-tight sm:text-2xl">Supplier sign in</h1>
			<p class="mt-1 text-center text-xs text-muted-foreground">
				Sign in to manage your supplier listings and orders after Admin approval.
			</p>
		</div>

		<Card class="p-5">
			<CardContent class="space-y-3 p-0">
				{#if accessState === 'pending' || accessState === 'rejected' || accessState === 'suspended' || accessState === 'inactive'}
					<Alert variant="destructive">
						<AlertDescription class="text-xs sm:text-sm">{formError}</AlertDescription>
					</Alert>
				{:else if formError && !Object.keys(fieldErrors).length}
					<Alert variant="destructive">
						<AlertDescription class="text-xs sm:text-sm">{formError}</AlertDescription>
					</Alert>
				{/if}

				<form
					{@attach captureFormElement}
					class="space-y-3"
					aria-busy={busy}
					onsubmit={(event) => {
						event.preventDefault();
						void submit();
					}}
				>
					<Field data-invalid={Boolean(fieldErrors.email)}>
						<FieldLabel for="supplier-login-email">Email</FieldLabel>
						<div class="relative min-w-0">
							<Mail
								class="pointer-events-none absolute start-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
							/>
							<Input
								id="supplier-login-email"
								bind:value={email}
								type="email"
								autocomplete="email"
								placeholder="you@company.com"
								class="h-9 ps-9 text-2xs-plus"
								aria-invalid={fieldErrors.email ? true : undefined}
								aria-describedby={fieldErrors.email ? 'supplier-login-email-error' : undefined}
								oninput={() => {
									if (fieldErrors.email) fieldErrors = { ...fieldErrors, email: '' };
								}}
							/>
						</div>
						{#if fieldErrors.email}
							<FieldError id="supplier-login-email-error">{fieldErrors.email}</FieldError>
						{/if}
					</Field>

					<Field data-invalid={Boolean(fieldErrors.password)}>
						<FieldLabel for="supplier-login-password">Password</FieldLabel>
						<div class="relative min-w-0">
							<Lock
								class="pointer-events-none absolute start-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"
							/>
							<Input
								id="supplier-login-password"
								bind:value={password}
								type="password"
								autocomplete="current-password"
								placeholder="Enter your password"
								class="h-9 ps-9 text-2xs-plus"
								aria-invalid={fieldErrors.password ? true : undefined}
								aria-describedby={fieldErrors.password
									? 'supplier-login-password-error'
									: undefined}
								oninput={() => {
									if (fieldErrors.password) fieldErrors = { ...fieldErrors, password: '' };
								}}
							/>
						</div>
						{#if fieldErrors.password}
							<FieldError id="supplier-login-password-error">{fieldErrors.password}</FieldError>
						{/if}
					</Field>

					<Button type="submit" class="h-10 w-full" disabled={busy} aria-busy={busy}>
						{#if busy}
							<Loader2 class="size-3.5 animate-spin" data-icon="inline-start" />
							Checking approval…
						{:else}
							Sign in
							<ArrowRight class="size-3.5 rtl:rotate-180" data-icon="inline-end" />
						{/if}
					</Button>
				</form>
			</CardContent>
		</Card>

		<div class="mt-5 space-y-1.5 text-center">
			<p class="text-2xs-plus text-muted-foreground">
				New to selling on HalalNeo?
				<a
					href={localizeHref('/supplier/register')}
					class="font-semibold text-primary hover:underline">Register your supplier business</a
				>
			</p>
			<p class="text-2xs text-muted-foreground">
				Want to learn more first?
				<a href={localizeHref('/supplier/onboarding')} class="text-primary hover:underline"
					>Read the supplier introduction</a
				>
			</p>
			<p class="text-2xs text-muted-foreground">
				Looking to source?
				<a href={localizeHref('/login')} class="text-primary hover:underline">Buyer sign in</a>
			</p>
		</div>
	</div>
</main>
