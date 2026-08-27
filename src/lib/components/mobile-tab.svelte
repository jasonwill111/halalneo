<script lang="ts">
	import { page } from '$app/state';
	import { localizeHref, deLocalizeUrl } from '#lib/paraglide/runtime.js';
	import { cn } from '#lib/utils.js';
	import HomeIcon from '@lucide/svelte/icons/home';
	import SearchIcon from '@lucide/svelte/icons/search';
	import Grid2x2Icon from '@lucide/svelte/icons/grid-2x2';
	import BoxIcon from '@lucide/svelte/icons/box';
	import UserIcon from '@lucide/svelte/icons/user';

	const tabs = [
		{ id: 'home', label: 'Home', href: '/', icon: HomeIcon },
		{ id: 'categories', label: 'Categories', href: '/categories', icon: Grid2x2Icon },
		{ id: 'products', label: 'Products', href: '/products', icon: BoxIcon },
		{ id: 'search', label: 'Search', href: '/search', icon: SearchIcon },
		{ id: 'account', label: 'Account', href: '/account', icon: UserIcon }
	];

	function isActive(href: string): boolean {
		const path = deLocalizeUrl(page.url.href).pathname;
		if (href === '/') return path === '/';
		return path.startsWith(href);
	}
</script>

<nav class="fixed bottom-3 left-1/2 z-50 -translate-x-1/2 md:hidden" aria-label="Mobile navigation">
	<div
		class="flex items-center justify-around gap-1 rounded-2xl border border-white/20 bg-background/70 px-2 py-2 shadow-lg backdrop-blur-xl dark:border-white/10"
		style="width: min(90vw, 360px);"
	>
		{#each tabs as tab}
			{@const active = isActive(tab.href)}
			<a
				href={localizeHref(tab.href)}
				class={cn(
					'flex flex-col items-center gap-0.5 rounded-xl px-3 py-1.5 text-[10px] font-medium transition-all duration-200',
					active
						? 'bg-primary/10 text-primary'
						: 'text-muted-foreground hover:bg-muted hover:text-foreground'
				)}
			>
				<tab.icon class="size-5" strokeWidth={active ? 2.2 : 1.8} />
				<span>{tab.label}</span>
			</a>
		{/each}
	</div>
</nav>
