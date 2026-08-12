<script lang="ts">
	import { localizeHref } from '$lib/paraglide/runtime.js';
	import { goto } from '$app/navigation';
	import { registerAccount } from '$lib/stores/auth.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Input } from '$lib/components/ui/input';
	import { Field, FieldLabel } from '$lib/components/ui/field';
	import { cn } from '$lib/utils.js';
	import StoreIcon from '@lucide/svelte/icons/store';
	import PackageSearchIcon from '@lucide/svelte/icons/package-search';

	let fullName = $state('');
	let company = $state('');
	let email = $state('');
	let password = $state('');
	let error = $state('');
	let accountType = $state<'buyer' | 'seller'>('buyer');

	function submit() {
		if (!fullName.trim() || !email.trim() || !password) {
			error = 'Please fill in all required fields.';
			return;
		}
		registerAccount({
			email: email.trim(),
			fullName: fullName.trim(),
			company: accountType === 'seller' ? company.trim() : undefined,
			password,
			type: accountType
		});
		goto(localizeHref('/account'));
	}
</script>

<svelte:head><title>Create account — HalalNeo</title></svelte:head>

<section class="mx-auto flex min-h-[70dvh] w-full max-w-md flex-col items-center justify-center py-8">
	<Card class="w-full">
		<CardHeader class="text-center">
			<CardTitle class="text-2xl tracking-tight">Create your account</CardTitle>
			<CardDescription>Join the halal trade network — free for certified businesses</CardDescription>
		</CardHeader>
		<CardContent class="space-y-4">
			<div class="grid grid-cols-2 gap-3">
				<button
					type="button"
					class={cn(
						'flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
						accountType === 'buyer'
							? 'border-primary bg-primary/5 text-primary'
							: 'border-border text-muted-foreground hover:bg-muted'
					)}
					aria-pressed={accountType === 'buyer'}
					onclick={() => (accountType = 'buyer')}
				>
					<PackageSearchIcon class="size-5"></PackageSearchIcon>
					Buyer
				</button>
				<button
					type="button"
					class={cn(
						'flex flex-col items-center gap-2 rounded-xl border p-4 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50',
						accountType === 'seller'
							? 'border-primary bg-primary/5 text-primary'
							: 'border-border text-muted-foreground hover:bg-muted'
					)}
					aria-pressed={accountType === 'seller'}
					onclick={() => (accountType = 'seller')}
				>
					<StoreIcon class="size-5"></StoreIcon>
					Seller
				</button>
			</div>

			<Field>
				<FieldLabel>Full name</FieldLabel>
				<Input bind:value={fullName} type="text" placeholder="Amina Yusuf"></Input>
			</Field>

			{#if accountType === 'seller'}
				<Field>
					<FieldLabel>Company name</FieldLabel>
					<Input bind:value={company} type="text" placeholder="Amina Foods Ltd."></Input>
				</Field>
			{/if}

			<Field>
				<FieldLabel>Email</FieldLabel>
				<Input bind:value={email} type="email" placeholder="you@company.com"></Input>
			</Field>

			<Field>
				<FieldLabel>Password</FieldLabel>
				<Input bind:value={password} type="password" placeholder="••••••••"></Input>
			</Field>
		</CardContent>
		<CardFooter class="flex flex-col gap-3">
			{#if error}
				<p class="w-full text-center text-sm text-destructive">{error}</p>
			{/if}
			<Button variant="default" class="w-full" onclick={submit}>Create {accountType} account</Button>
			<p class="text-center text-sm text-muted-foreground">
				Already have an account?
				<a href={localizeHref('/login')} class="font-medium text-primary hover:underline">Sign in</a>
			</p>
			<p class="text-center text-xs text-muted-foreground">
				Demo only — auth not connected yet.
			</p>
		</CardFooter>
	</Card>
</section>