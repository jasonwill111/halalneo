<script lang="ts">
	import type { PageProps } from './$types';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { authClient } from '#lib/auth-client.js';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Avatar, AvatarFallback } from '#lib/components/ui/avatar/index.js';
	import Building2 from '@lucide/svelte/icons/building-2';
	import Mail from '@lucide/svelte/icons/mail';
	import ShieldQuestion from '@lucide/svelte/icons/shield-question';
	import LogOut from '@lucide/svelte/icons/log-out';

	let { data }: PageProps = $props();

	const user = $derived(data.supplierUser);
	const profile = $derived(data.supplierProfile);

	const STATUS: Record<string, { label: string; cls: string }> = {
		active: { label: 'Verified supplier', cls: 'bg-success/10 text-success' },
		pending: { label: 'Application under review', cls: 'bg-warn/10 text-warn' },
		suspended: { label: 'Account suspended', cls: 'bg-destructive/10 text-destructive' },
		rejected: { label: 'Application declined', cls: 'bg-destructive/10 text-destructive' }
	};
	const status = $derived(STATUS[profile?.status ?? ''] ?? null);

	const userInitials = $derived(
		(user?.name ?? '')
			.split(/\s+/)
			.map((p) => p[0])
			.filter(Boolean)
			.slice(0, 2)
			.join('')
			.toUpperCase() || 'ME'
	);

	let signingOut = $state(false);

	async function signOut() {
		if (signingOut) return; // double-submit guard (§3.4)
		signingOut = true;
		try {
			await authClient.signOut();
			toast.success('Signed out.');
		} catch {
			toast.error('Could not reach the auth service — trying to leave this page anyway.');
		} finally {
			signingOut = false;
		}
		await goto(localizeHref('/supplier/login'));
	}
</script>

<svelte:head>
	<title>Account — HalalNeo</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="space-y-1">
	<h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">Account</h1>
	<p class="text-sm text-muted-foreground">
		Your login, the company it is linked to, and where to change each of them.
	</p>
</div>

<div class="mt-4 grid gap-3 sm:gap-4 lg:grid-cols-2">
	<section class="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
		<h2 class="mb-3 flex items-center gap-2 text-sm font-semibold">
			<Mail class="size-4 text-muted-foreground" />
			Your login
		</h2>
		{#if user}
			<div class="flex items-center gap-3">
				<Avatar class="size-10 shrink-0">
					<AvatarFallback class="bg-primary/15 text-sm font-semibold text-primary">
						{userInitials}
					</AvatarFallback>
				</Avatar>
				<div class="min-w-0">
					<p class="truncate text-sm font-medium">{user.name}</p>
					<p class="truncate text-xs text-muted-foreground">{user.email}</p>
				</div>
			</div>
			<p class="mt-3 text-2xs-plus text-muted-foreground">
				Name and email come from your signed-in session. To change them, sign in again after
				updating your account details with HalalNeo support.
			</p>
			<Button
				variant="outline"
				size="sm"
				class="mt-3 gap-1.5 text-destructive"
				disabled={signingOut}
				onclick={signOut}
			>
				<LogOut class="size-3.5" />
				{signingOut ? 'Signing out…' : 'Sign out'}
			</Button>
		{:else}
			<p class="text-sm text-muted-foreground">You are not signed in.</p>
			<Button size="sm" class="mt-3" href={localizeHref('/supplier/login')}>Sign in</Button>
		{/if}
	</section>

	<section class="rounded-xl bg-card p-4 ring-1 ring-foreground/10">
		<h2 class="mb-3 flex items-center gap-2 text-sm font-semibold">
			{#if profile}
				<Building2 class="size-4 text-muted-foreground" />
				Linked company
			{:else}
				<ShieldQuestion class="size-4 text-muted-foreground" />
				No company linked
			{/if}
		</h2>
		{#if profile}
			<dl class="space-y-2 text-2xs-plus">
				<div class="flex items-center justify-between gap-3">
					<dt class="text-muted-foreground">Company</dt>
					<dd class="min-w-0 truncate font-medium text-right" title={profile.name}>
						{profile.name}
					</dd>
				</div>
				<div class="flex items-center justify-between gap-3">
					<dt class="text-muted-foreground">Listed as</dt>
					<dd class="min-w-0 truncate text-right">
						<a
							href={localizeHref(`/supplier/${profile.slug}`)}
							class="font-medium text-primary hover:underline"
						>
							/supplier/{profile.slug}
						</a>
					</dd>
				</div>
				<div class="flex items-center justify-between gap-3">
					<dt class="text-muted-foreground">Country</dt>
					<dd class="font-medium">{profile.country || '—'}</dd>
				</div>
				<div class="flex items-center justify-between gap-3">
					<dt class="text-muted-foreground">Business type</dt>
					<dd class="font-medium capitalize">{profile.businessType ?? '—'}</dd>
				</div>
				<div class="flex items-center justify-between gap-3">
					<dt class="text-muted-foreground">Status</dt>
					<dd>
						{#if status}
							<Badge variant="secondary" class="text-2xs {status.cls}">{status.label}</Badge>
						{:else}
							<span class="font-medium">Unknown</span>
						{/if}
					</dd>
				</div>
			</dl>
			<div class="mt-3 flex flex-wrap gap-2">
				<Button size="sm" href={localizeHref('/supplier/manage')}>Edit company profile</Button>
				<Button size="sm" variant="outline" href={localizeHref('/supplier/products')}>
					My products
				</Button>
			</div>
			<p class="mt-3 text-2xs-plus text-muted-foreground">
				Extra team members are linked to this company by HalalNeo support —
				<a href={localizeHref('/contact')} class="text-primary hover:underline">contact us</a>
				to grant a colleague access to this account.
			</p>
		{:else if user}
			<div class="space-y-2">
				<p class="text-sm font-medium">Your account isn't linked to a supplier company yet</p>
				<p class="text-2xs-plus text-muted-foreground">
					Apply for supplier access and an administrator will connect this account to your
					company profile; the rest of the portal unlocks at that point.
				</p>
				<Button size="sm" class="mt-1" href={localizeHref('/supplier/onboarding')}>
					Apply to become a supplier
				</Button>
			</div>
		{:else}
			<p class="text-sm text-muted-foreground">Sign in to see your linked company.</p>
		{/if}
	</section>
</div>
