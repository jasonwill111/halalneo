<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { authClient } from '#lib/auth-client.js';
	import { mode } from 'mode-watcher';
	import { switchTheme } from '#lib/utils/theme-toggle.js';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { cn } from '#lib/utils.js';
	import Mark from '#lib/components/site/mark.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Avatar, AvatarFallback } from '#lib/components/ui/avatar/index.js';
	import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
	import Boxes from '@lucide/svelte/icons/boxes';
	import ClipboardList from '@lucide/svelte/icons/clipboard-list';
	import UserRound from '@lucide/svelte/icons/user-round';
	import Building2 from '@lucide/svelte/icons/building-2';
	import Sun from '@lucide/svelte/icons/sun';
	import Moon from '@lucide/svelte/icons/moon';
	import LogOut from '@lucide/svelte/icons/log-out';
	import Home from '@lucide/svelte/icons/home';

	type PortalUser = { name?: string | null; email?: string | null; image?: string | null } | null;
	type PortalProfile = {
		slug: string;
		name: string;
		status: string | null;
		logoInitials: string | null;
	} | null;

	interface Props {
		variant: 'desktop' | 'mobile';
		user?: PortalUser;
		profile?: PortalProfile;
		onNavigate?: () => void;
	}

	let { variant, user = null, profile = null, onNavigate }: Props = $props();

	const nav = [
		{ label: 'Dashboard', href: '/supplier/dashboard', icon: LayoutDashboard },
		{ label: 'My Products', href: '/supplier/products', icon: Boxes },
		{ label: 'Inquiries', href: '/supplier/orders', icon: ClipboardList },
		{ label: 'Account', href: '/supplier/profile', icon: UserRound },
		{ label: 'Company Profile', href: '/supplier/manage', icon: Building2 }
	];

	const supplierName = $derived(profile?.name ?? 'Supplier account');
	const supplierInitials = $derived(profile?.logoInitials || initials(profile?.name ?? ''));

	// Session role/status is derived from the linked supplier record, never hardcoded.
	const statusLabel = $derived.by(() => {
		switch (profile?.status) {
			case 'active':
				return 'Verified supplier';
			case 'pending':
				return 'Application under review';
			case 'suspended':
				return 'Account suspended';
			case 'rejected':
				return 'Application declined';
			default:
				return profile?.slug ? 'Supplier account' : 'No supplier profile linked';
		}
	});

	function initials(name: string): string {
		return (
			name
				.split(/\s+/)
				.map((p) => p[0])
				.filter(Boolean)
				.slice(0, 2)
				.join('')
				.toUpperCase() || 'SU'
		);
	}

	function isActive(href: string): boolean {
		return localizeHref(href) === page.url.pathname || href === page.url.pathname;
	}

	function handleToggleTheme() {
		switchTheme();
	}

	async function handleSignOut() {
		try {
			await authClient.signOut();
		} catch {
			// ignore — proceed to the supplier login screen regardless
		}
		await goto(localizeHref('/supplier/login'));
	}
</script>

{#snippet brandBar()}
	<!-- Mobile renders inside a Sheet whose close button is absolutely
	     positioned top-right — reserve space for it there only. -->
	<div
		class={cn(
			'pattern-girih flex h-14 shrink-0 items-center gap-2 border-b border-border/50 px-4 sm:h-16',
			variant === 'mobile' && 'pe-10'
		)}
	>
		<Mark class="size-5 shrink-0 text-sidebar-primary" />
		<span class="truncate text-base font-bold tracking-tight text-primary">Supplier Portal</span>
	</div>
{/snippet}

{#snippet companyCard()}
	<div class="flex items-center gap-2.5 border-b border-border/50 px-2.5 py-3">
		<Avatar class="size-8">
			<AvatarFallback class="bg-primary/15 text-xs font-semibold text-primary">
				{supplierInitials}
			</AvatarFallback>
		</Avatar>
		<div class="min-w-0 flex-1">
			<p class="truncate text-sm font-medium">{supplierName}</p>
			<p class="truncate text-xs text-muted-foreground">{statusLabel}</p>
		</div>
	</div>
{/snippet}

{#snippet navLinks()}
	<nav class="flex-1 space-y-0.5 overflow-y-auto px-3 py-3" aria-label="Supplier pages">
		{#each nav as item (item.href)}
			<Button
				href={localizeHref(item.href)}
				variant={isActive(item.href) ? 'secondary' : 'ghost'}
				class={cn('w-full justify-start gap-2.5 text-sm')}
				aria-current={isActive(item.href) ? 'page' : undefined}
				onclick={onNavigate}
			>
				<item.icon class="size-4 shrink-0" />
				{item.label}
			</Button>
		{/each}
	</nav>
{/snippet}

{#snippet iconButtons()}
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
		href={localizeHref('/')}
		variant="ghost"
		size="icon"
		aria-label="Back to homepage"
		class="size-8"
		onclick={onNavigate}
	>
		<Home class="size-4" />
	</Button>
	<Button variant="ghost" size="icon" aria-label="Sign out" class="size-8" onclick={handleSignOut}>
		<LogOut class="size-4" />
	</Button>
{/snippet}

{#snippet accountBlock()}
	<!-- §4.2: fixed bottom block = name + email + theme + home + sign out -->
	<div class="shrink-0 border-t border-border/50 px-3 py-3">
		<div class="flex items-center gap-2.5 rounded-lg px-2 py-2">
			<Avatar class="size-8">
				<AvatarFallback class="bg-primary/15 text-xs font-semibold text-primary">
					{initials(user?.name ?? '')}
				</AvatarFallback>
			</Avatar>
			<div class="min-w-0 flex-1">
				<p class="truncate text-sm font-medium">{user?.name ?? 'Not signed in'}</p>
				{#if user?.email}
					<p class="truncate text-xs text-muted-foreground">{user.email}</p>
				{/if}
			</div>
		</div>
		<div class="flex items-center gap-1 border-t border-border/50 pt-2">
			{@render iconButtons()}
		</div>
	</div>
{/snippet}

{@render brandBar()}
{@render companyCard()}
{@render navLinks()}
{@render accountBlock()}
