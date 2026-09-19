<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { page } from '$app/state';
	import { goto, invalidateAll } from '$app/navigation';
	import { authClient } from '#lib/auth-client.js';
	import { mode, toggleMode } from 'mode-watcher';
	import { toast } from 'svelte-sonner';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Avatar, AvatarFallback } from '#lib/components/ui/avatar/index.js';
	import UserRound from '@lucide/svelte/icons/user-round';
	import Mail from '@lucide/svelte/icons/mail';
	import Heart from '@lucide/svelte/icons/heart';
	import LogOut from '@lucide/svelte/icons/log-out';
	import Sun from '@lucide/svelte/icons/sun';
	import Moon from '@lucide/svelte/icons/moon';

	interface Props {
		variant: 'mobile' | 'desktop';
		/** Session user resolved by `src/routes/account/+layout.server.ts`. */
		user: { name: string; email: string };
	}

	let { variant, user }: Props = $props();

	const navItems = [
		{ label: 'My Profile', href: '/account/profile', icon: UserRound },
		{ label: 'My Inquiries', href: '/account/inquiries', icon: Mail },
		{ label: 'Saved Items', href: '/account/saved', icon: Heart }
	];

	function isActive(href: string): boolean {
		return page.url.pathname === href;
	}

	function initials(name?: string | null): string {
		return (
			(name ?? '')
				.split(/\s+/)
				.map((p) => p[0])
				.filter(Boolean)
				.slice(0, 2)
				.join('')
				.toUpperCase() || 'ME'
		);
	}

	// Same cross-fade as the site header (src/routes/+layout.svelte).
	function handleToggleTheme() {
		document.documentElement.classList.add('theme-transitioning');
		toggleMode();
		setTimeout(() => document.documentElement.classList.remove('theme-transitioning'), 400);
	}

	let signingOut = $state(false);

	async function handleSignOut() {
		if (signingOut) return; // double-submit guard (§3.4)
		signingOut = true;
		try {
			await authClient.signOut();
			toast.success('Signed out. See you again.');
		} catch {
			toast.error('Could not reach the auth service — leaving this page anyway.');
		} finally {
			signingOut = false;
		}
		// Drop the cached session data before navigating, so no /account payload
		// survives in the SPA cache.
		await invalidateAll();
		await goto(localizeHref('/'));
	}
</script>

{#snippet identity()}
	<div class="flex min-w-0 items-center gap-2.5">
		<Avatar class="size-8 shrink-0">
			<AvatarFallback class="bg-primary/15 text-xs font-semibold text-primary">
				{initials(user.name)}
			</AvatarFallback>
		</Avatar>
		<div class="min-w-0">
			<p class="truncate text-sm font-medium">{user.name || 'Member'}</p>
			{#if user.email}
				<p class="truncate text-xs text-muted-foreground">{user.email}</p>
			{/if}
		</div>
	</div>
{/snippet}

{#snippet actions()}
	<Button
		variant="ghost"
		size="icon"
		aria-label="Toggle theme"
		class="size-8"
		onclick={handleToggleTheme}
	>
		{#if mode.current === 'dark'}
			<Sun class="size-4" />
		{:else}
			<Moon class="size-4" />
		{/if}
	</Button>
	<Button
		variant="ghost"
		size="icon"
		aria-label="Sign out"
		class="size-8 text-destructive hover:bg-destructive/10 hover:text-destructive"
		disabled={signingOut}
		onclick={handleSignOut}
	>
		<LogOut class="size-4" />
	</Button>
{/snippet}

{#if variant === 'mobile'}
	<div class="mb-3 space-y-2 lg:hidden">
		<div class="flex gap-1 overflow-x-auto pb-1">
			{#each navItems as item (item.href)}
				<a
					href={localizeHref(item.href)}
					class={isActive(item.href)
						? 'shrink-0 rounded-full bg-primary px-2.5 py-1.5 text-2xs font-medium text-primary-foreground'
						: 'shrink-0 rounded-full border border-border bg-card px-2.5 py-1.5 text-2xs font-medium text-muted-foreground'}
				>
					{item.label}
				</a>
			{/each}
		</div>
		<div class="flex items-center justify-between gap-2 rounded-xl bg-card px-2.5 py-2 ring-1 ring-foreground/10">
			{@render identity()}
			<div class="flex shrink-0 items-center gap-1">
				{@render actions()}
			</div>
		</div>
	</div>
{:else}
	<aside class="hidden w-52 shrink-0 lg:block">
		<div class="sticky top-20 z-10 space-y-1 rounded-xl bg-card p-1.5 ring-1 ring-foreground/10">
			<div class="space-y-0.5">
				{#each navItems as item (item.href)}
					<a
						href={localizeHref(item.href)}
						class={isActive(item.href)
							? 'flex items-center gap-2.5 rounded-xl bg-primary/10 px-2.5 py-1.5 text-2xs-plus font-medium text-primary'
							: 'flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-2xs-plus font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground'}
					>
						<item.icon class="size-3.5"></item.icon>
						{item.label}
					</a>
				{/each}
			</div>
			<div class="border-t border-border pt-1.5">
				<div class="px-1.5 py-1">
					{@render identity()}
				</div>
				<div class="flex items-center gap-1 border-t border-border px-1 pt-1.5">
					{@render actions()}
				</div>
			</div>
		</div>
	</aside>
{/if}
