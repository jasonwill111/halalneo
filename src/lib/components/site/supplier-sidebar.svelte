<script lang="ts">
	import { signOut } from '#lib/stores/auth.svelte.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { page } from '$app/state';
	import LayoutDashboard from '@lucide/svelte/icons/layout-dashboard';
	import Boxes from '@lucide/svelte/icons/boxes';
	import ClipboardList from '@lucide/svelte/icons/clipboard-list';
	import ChartColumn from '@lucide/svelte/icons/chart-column';
	import UserRound from '@lucide/svelte/icons/user-round';
	import Settings from '@lucide/svelte/icons/settings';
	import LogOut from '@lucide/svelte/icons/log-out';

	interface Props {
		variant: 'desktop' | 'mobile';
		supplierName: string;
		supplierInitials: string;
		onNavigate?: () => void;
	}

	let { variant, supplierName, supplierInitials, onNavigate }: Props = $props();

	const nav = [
		{ label: 'Dashboard', href: '/supplier/dashboard', icon: LayoutDashboard },
		{ label: 'My Products', href: '/supplier/products', icon: Boxes },
		{ label: 'Orders', href: '/supplier/orders', icon: ClipboardList },
		{ label: 'Analytics', href: '/supplier/analytics', icon: ChartColumn },
		{ label: 'Profile', href: '/supplier/profile', icon: UserRound },
		{ label: 'Settings', href: '/supplier/settings', icon: Settings }
	];

	function isActive(href: string): boolean {
		return page.url.pathname === href;
	}
</script>

{#snippet profileHeader(bordered: boolean)}
	<div class="flex items-center gap-2.5 px-2.5 {bordered ? 'border-b border-border' : ''} py-3">
		<div
			class="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-xs font-bold text-primary"
		>
			{supplierInitials}
		</div>
		<div class="min-w-0">
			<p class="truncate text-[11px] font-semibold">{supplierName}</p>
			<p class="text-[10px] text-muted-foreground">Premium Supplier</p>
		</div>
	</div>
{/snippet}

{#snippet navLinks()}
	{#each nav as item}
		<a
			href={item.href}
			onclick={onNavigate}
			class={`flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-[11px] font-medium transition-colors ${isActive(item.href) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent'}`}
		>
			<item.icon class="size-3.5"></item.icon>
			{item.label}
		</a>
	{/each}
{/snippet}

{#if variant === 'desktop'}
	{@render profileHeader(true)}
	{@render navLinks()}
	<div class="my-0.5 border-t border-border"></div>
	<Button
		variant="ghost"
		size="sm"
		class="w-full justify-start gap-2.5 text-[11px] text-destructive"
		onclick={() => signOut()}
	>
		<LogOut class="size-3.5"></LogOut>
		Sign Out
	</Button>
{:else}
	{@render profileHeader(true)}
	<nav class="space-y-0.5 px-3 py-3">
		{@render navLinks()}
	</nav>
{/if}
