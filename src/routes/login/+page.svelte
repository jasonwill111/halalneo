<svelte:head>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { goto } from '$app/navigation';
	import { signIn } from '#lib/stores/auth.svelte.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Checkbox } from '#lib/components/ui/checkbox/index.js';
	import { Field, FieldLabel } from '#lib/components/ui/field/index.js';
	import MailIcon from '@lucide/svelte/icons/mail';
	import LockIcon from '@lucide/svelte/icons/lock';

	let email = $state('');
	let password = $state('');
	let rememberMe = $state(false);
	let error = $state('');

	function submit() {
		if (!email.trim() || !password) {
			error = 'Please enter your email and password.';
			return;
		}
		if (!signIn(email.trim(), password)) {
			error = 'Invalid email or password. No account found for this demo session.';
			return;
		}
		goto(localizeHref('/account'));
	}
</script>

<main
	class="login-pattern flex min-h-[calc(100vh-4rem)] items-center justify-center px-5 pb-20 pt-8"
>
	<div class="w-full max-w-md">
		<div class="mb-5 text-center">
			<div
				class="bg-primary text-primary-foreground mx-auto mb-2 flex size-12 items-center justify-center rounded-2xl text-lg font-bold shadow-lg shadow-primary/20"
			>
				H
			</div>
			<h1 class="text-lg font-bold tracking-tight text-foreground">Welcome back</h1>
			<p class="mt-1 text-xs text-muted-foreground">Sign in to your HalalNeo account</p>
		</div>

		<div class="rounded-2xl bg-card p-5 shadow-sm">
			<form class="space-y-3" onsubmit={(e) => { e.preventDefault(); submit(); }}>
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
							placeholder="Enter your password"
							class="pl-9"
						/>
					</div>
				</Field>

				<div class="flex items-center gap-2">
					<Checkbox bind:checked={rememberMe} />
					<label for="remember" class="text-xs text-muted-foreground">Remember me</label>
				</div>

				{#if error}
					<p class="text-center text-sm text-destructive">{error}</p>
				{/if}

				<Button type="submit" class="w-full" onclick={submit}>
					<span class="inline-flex items-center gap-2">
						Sign In
						<svg
							class="size-3.5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="2"
							><path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M13 7l5 5m0 0l-5 5m5-5H6"
							/></svg
						>
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
			<p class="text-muted-foreground mt-1.5 text-[10px]">
				<a href={localizeHref('/')} class="hover:text-primary transition-colors">
					&larr; Back to home
				</a>
			</p>
		</div>
	</div>
</main>

<style>
	:global(.login-pattern) {
		background-image:
			radial-gradient(circle at 20% 50%, oklch(0.42 0.12 155 / 0.04) 0%, transparent 50%),
			radial-gradient(circle at 80% 20%, oklch(0.42 0.12 155 / 0.03) 0%, transparent 50%),
			radial-gradient(circle at 60% 80%, oklch(0.42 0.12 155 / 0.02) 0%, transparent 50%);
	}
	:global(.dark .login-pattern) {
		background-image:
			radial-gradient(circle at 20% 50%, oklch(0.65 0.15 155 / 0.06) 0%, transparent 50%),
			radial-gradient(circle at 80% 20%, oklch(0.65 0.15 155 / 0.04) 0%, transparent 50%),
			radial-gradient(circle at 60% 80%, oklch(0.65 0.15 155 / 0.03) 0%, transparent 50%);
	}
</style>
