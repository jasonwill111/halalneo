<svelte:head>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { goto } from '$app/navigation';
	import { registerAccount } from '#lib/stores/auth.svelte.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Checkbox } from '#lib/components/ui/checkbox/index.js';
	import { Field, FieldLabel } from '#lib/components/ui/field/index.js';
	import MailIcon from '@lucide/svelte/icons/mail';
	import LockIcon from '@lucide/svelte/icons/lock';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';

	let firstName = $state('');
	let lastName = $state('');
	let company = $state('');
	let email = $state('');
	let password = $state('');
	let termsAccepted = $state(false);
	let error = $state('');

	function submit() {
		if (!firstName.trim() || !lastName.trim() || !email.trim() || !password) {
			error = 'Please fill in all required fields.';
			return;
		}
		if (!termsAccepted) {
			error = 'Please agree to the Terms of Service and Privacy Policy.';
			return;
		}
		registerAccount({
			email: email.trim(),
			fullName: `${firstName.trim()} ${lastName.trim()}`.trim(),
			company: company.trim() || undefined,
			password,
			type: 'buyer'
		});
		goto(localizeHref('/account'));
	}
</script>

<main
	class="register-pattern flex min-h-[calc(100vh-4rem)] items-center justify-center px-5 pb-20 pt-8"
>
	<div class="w-full max-w-md">
		<div class="mb-5 text-center">
			<div
				class="bg-primary text-primary-foreground mx-auto mb-2 flex size-12 items-center justify-center rounded-xl text-lg font-bold"
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
						class="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-full text-[10px] font-semibold"
					>
						1
					</div>
					<span class="text-primary text-[10px] font-medium">Account</span>
				</div>
				<div class="h-px w-6 bg-border"></div>
				<div class="flex items-center gap-1.5">
					<div
						class="bg-muted text-muted-foreground flex size-6 items-center justify-center rounded-full text-[10px] font-semibold"
					>
						2
					</div>
					<span class="text-[10px] text-muted-foreground">Verify</span>
				</div>
			</div>

			<!-- Supplier banner -->
			<div class="bg-muted/50 mb-3 rounded-lg px-3 py-2 text-center">
				<p class="text-[10px] text-muted-foreground">
					Want to sell products?
					<a
						href={localizeHref('/supplier/onboarding')}
						class="text-primary font-semibold hover:underline"
					>
						Apply as a Supplier
					</a>
				</p>
			</div>

			<form class="space-y-2.5" onsubmit={(e) => { e.preventDefault(); submit(); }}>
				<div class="grid grid-cols-2 gap-2.5">
					<Field>
						<FieldLabel>First Name</FieldLabel>
						<Input bind:value={firstName} type="text" placeholder="John" />
					</Field>
					<Field>
						<FieldLabel>Last Name</FieldLabel>
						<Input bind:value={lastName} type="text" placeholder="Doe" />
					</Field>
				</div>

				<Field>
					<FieldLabel>Company Name</FieldLabel>
					<Input bind:value={company} type="text" placeholder="Your company" />
				</Field>

				<Field>
					<FieldLabel>Email</FieldLabel>
					<div class="relative">
						<MailIcon
							class="pointer-events-none absolute top-1/2 left-3 size-3.5 -translate-y-1/2 text-muted-foreground"
						></MailIcon>
						<Input bind:value={email} type="email" placeholder="you@company.com" class="pl-9" />
					</div>
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
						/>
					</div>
				</Field>

				<div class="flex items-start gap-2">
					<Checkbox bind:checked={termsAccepted} class="mt-0.5" />
					<label for="terms" class="text-xs leading-snug text-muted-foreground">
						I agree to the
						<span class="text-primary font-medium">Terms of Service</span>
						and
						<span class="text-primary font-medium">Privacy Policy</span>
					</label>
				</div>

				{#if error}
					<p class="text-center text-sm text-destructive">{error}</p>
				{/if}

				<Button type="submit" class="w-full" onclick={submit}>
					<span class="inline-flex items-center gap-2">
						Create Account
						<ArrowRight class="size-3.5" />
					</span>
				</Button>
			</form>


		</div>

		<div class="mt-5 text-center">
			<p class="text-xs text-muted-foreground">
				Already have an account?
				<a href={localizeHref('/login')} class="text-primary font-semibold hover:underline">
					Sign in
				</a>
			</p>
			<p class="text-muted-foreground mt-1.5 text-[10px]">
				<a href={localizeHref('/')} class="hover:text-primary transition-colors">
					&larr; Back to home
				</a>
			</p>
		</div>
	</div>
</main>

<style>
	:global(.register-pattern) {
		background-image:
			radial-gradient(circle at 80% 50%, oklch(0.42 0.12 155 / 0.04) 0%, transparent 50%),
			radial-gradient(circle at 20% 80%, oklch(0.42 0.12 155 / 0.03) 0%, transparent 50%);
	}
	:global(.dark .register-pattern) {
		background-image:
			radial-gradient(circle at 80% 50%, oklch(0.65 0.15 155 / 0.06) 0%, transparent 50%),
			radial-gradient(circle at 20% 80%, oklch(0.65 0.15 155 / 0.04) 0%, transparent 50%);
	}
</style>
