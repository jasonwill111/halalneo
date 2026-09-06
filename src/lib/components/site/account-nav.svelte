<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { page } from '$app/state';
	import { signOut } from '#lib/stores/auth.svelte.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import UserRound from '@lucide/svelte/icons/user-round';
	import Mail from '@lucide/svelte/icons/mail';
	import Heart from '@lucide/svelte/icons/heart';
	import LogOut from '@lucide/svelte/icons/log-out';

	interface Props {
		variant: 'mobile' | 'desktop';
	}

	let { variant }: Props = $props();

	const navItems = [
		{ label: 'My Profile', href: '/account/profile', icon: UserRound },
		{ label: 'My Inquiries', href: '/account/inquiries', icon: Mail },
		{ label: 'Saved Items', href: '/account/saved', icon: Heart }
	];

	function isActive(href: string): boolean {
		return page.url.pathname === href;
	}
</script>

{#if variant === 'mobile'}
	<div class="mb-3 flex gap-1 overflow-x-auto lg:hidden">
		{#each navItems as item}
			<a
				href={localizeHref(item.href)}
				class={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-medium ${isActive(item.href) ? 'bg-primary text-primary-foreground' : 'border border-border bg-card text-muted-foreground'}`}
			>
				{item.label}
			</a>
		{/each}
	</div>
{:else}
	<aside class="hidden w-52 shrink-0 lg:block">
		<div class="sticky top-20 space-y-0.5 rounded-xl bg-card p-1.5 ring-1 ring-foreground/10">
			{#each navItems as item}
				<a
					href={localizeHref(item.href)}
					class={`flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-[11px] font-medium transition-colors ${isActive(item.href) ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-accent'}`}
				>
					<item.icon class="size-3.5"></item.icon>
					{item.label}
				</a>
			{/each}
			<div class="my-0.5 border-t border-border"></div>
			<Button
				variant="ghost"
				onclick={() => signOut()}
				class="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-[11px] font-medium text-destructive transition-colors hover:bg-destructive/10"
			>
				<LogOut class="size-3.5"></LogOut>
				Sign Out
			</Button>
		</div>
	</aside>
{/if}
