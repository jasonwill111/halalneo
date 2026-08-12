<script lang="ts">
	import { localizeHref } from '$lib/paraglide/runtime.js';
	import { goto } from '$app/navigation';
	import { signIn } from '$lib/stores/auth.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Field, FieldLabel, FieldDescription } from '$lib/components/ui/field';
	import MailIcon from '@lucide/svelte/icons/mail';
	import LockIcon from '@lucide/svelte/icons/lock';

	let email = $state('');
	let password = $state('');
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

<svelte:head><title>Sign in — HalalNeo</title></svelte:head>

<section class="mx-auto flex min-h-[70dvh] w-full max-w-md flex-col items-center justify-center py-8">
	<Card class="w-full">
		<CardHeader class="text-center">
			<CardTitle class="text-2xl tracking-tight">Welcome back</CardTitle>
			<CardDescription>Sign in to your HalalNeo account</CardDescription>
		</CardHeader>
		<CardContent class="space-y-4">
			<Field>
				<FieldLabel>Email</FieldLabel>
				<div class="relative">
					<MailIcon class="pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 left-3 text-muted-foreground"></MailIcon>
					<Input bind:value={email} type="email" placeholder="you@company.com" class="pl-9"></Input>
				</div>
				<FieldDescription>We’ll never share your email.</FieldDescription>
			</Field>

			<Field>
				<FieldLabel>Password</FieldLabel>
				<div class="relative">
					<LockIcon class="pointer-events-none absolute top-1/2 size-4 -translate-y-1/2 left-3 text-muted-foreground"></LockIcon>
					<Input bind:value={password} type="password" placeholder="••••••••" class="pl-9"></Input>
				</div>
			</Field>

			<div class="flex items-center justify-between gap-4">
				<button
					type="button"
					class="text-sm text-primary outline-none hover:underline focus-visible:underline"
				>
					Forgot password?
				</button>
			</div>
		</CardContent>
		<CardFooter class="flex flex-col gap-3">
			{#if error}
				<p class="w-full text-center text-sm text-destructive">{error}</p>
			{/if}
			<Button variant="default" class="w-full" onclick={submit}>Sign in</Button>
			<p class="text-center text-sm text-muted-foreground">
				New to HalalNeo?
				<a href={localizeHref('/register')} class="font-medium text-primary hover:underline">Create an account</a>
			</p>
			<p class="text-center text-xs text-muted-foreground">
				Demo only — auth not connected yet.
			</p>
		</CardFooter>
	</Card>
</section>