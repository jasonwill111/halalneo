<script lang="ts">
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import { localizeHref, deLocalizeUrl } from '#lib/paraglide/runtime.js';
	import { cn } from '#lib/utils.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { onMount } from 'svelte';
	import HomeIcon from '@lucide/svelte/icons/home';
	import MenuIcon from '@lucide/svelte/icons/menu';
	import Grid2x2Icon from '@lucide/svelte/icons/grid-2x2';
	import BoxIcon from '@lucide/svelte/icons/box';
	import CompassIcon from '@lucide/svelte/icons/compass';
	import InfoIcon from '@lucide/svelte/icons/info';
	import MailIcon from '@lucide/svelte/icons/mail';
	import LogInIcon from '@lucide/svelte/icons/log-in';
	import UserPlusIcon from '@lucide/svelte/icons/user-plus';
	import NewspaperIcon from '@lucide/svelte/icons/newspaper';
	import MessageCircleIcon from '@lucide/svelte/icons/message-circle';
	import TagsIcon from '@lucide/svelte/icons/tags';
	import { navGroups } from '#lib/data/navigation.js';

	const exploreGroups = navGroups.filter((g) => g.label !== 'Company');

	type PanelPosition = {
		inlineInset: number;
		blockInset: number;
		translateInline: '-50%' | '0%' | '50%';
	};

	let showExplore = $state(false);
	let showMenu = $state(false);
	let exploreBtnEl = $state<HTMLElement | null>(null);
	let menuBtnEl = $state<HTMLElement | null>(null);
	let explorePos = $state<PanelPosition>({
		inlineInset: 0,
		blockInset: 0,
		translateInline: '-50%'
	});
	let menuPos = $state<PanelPosition>({ inlineInset: 0, blockInset: 0, translateInline: '0%' });
	let indicatorX = $state(0);
	let indicatorWidth = $state(0);

	const menuItems = [
		{ label: 'About', href: '/about', icon: InfoIcon },
		{ label: 'Contact', href: '/contact', icon: MailIcon },
		{ label: 'Sign in', href: '/login', icon: LogInIcon },
		{ label: 'Create account', href: '/register', icon: UserPlusIcon },
		{ label: 'Saved Items', href: '/account/saved', icon: NewspaperIcon },
		{ label: 'My Inquiries', href: '/account/inquiries', icon: MessageCircleIcon },
		{ label: 'Supplier Sign In', href: '/supplier/login', icon: TagsIcon }
	];

	function isActive(href: string): boolean {
		const path = deLocalizeUrl(page.url.href).pathname;
		if (href === '/') return path === '/';
		return path === href || path.startsWith(href + '/');
	}

	function getPanelPosition(btn: HTMLElement, alignment: 'center' | 'end'): PanelPosition {
		const rect = btn.getBoundingClientRect();
		const isRtl = getComputedStyle(btn).direction === 'rtl';
		const inlineInset =
			alignment === 'center'
				? isRtl
					? window.innerWidth - rect.right
					: rect.left
				: isRtl
					? rect.left
					: window.innerWidth - rect.right;
		const translateInline: PanelPosition['translateInline'] =
			alignment === 'center' ? (isRtl ? '50%' : '-50%') : '0%';
		return { inlineInset, blockInset: rect.top - 8, translateInline };
	}

	function toggleExplore() {
		if (showExplore) {
			showExplore = false;
		} else {
			showMenu = false;
			if (exploreBtnEl) explorePos = getPanelPosition(exploreBtnEl, 'center');
			showExplore = true;
		}
		syncPill();
	}

	function toggleMenu() {
		if (showMenu) {
			showMenu = false;
		} else {
			showExplore = false;
			if (menuBtnEl) menuPos = getPanelPosition(menuBtnEl, 'end');
			showMenu = true;
		}
		syncPill();
	}

	function closeAll(): void {
		const hadOpenPanel = showExplore || showMenu;
		showExplore = false;
		showMenu = false;
		if (hadOpenPanel) syncPill();
	}

	// Materialize transition — scale + opacity together (Apple §12: "Materialize, don't just fade")
	const materialize = (_node: HTMLElement) => {
		return {
			duration: 250,
			easing: cubicOut,
			css: (t: number) => `opacity: ${t}; transform: scale(${0.92 + 0.08 * t});`
		};
	};

	function handleClickOutside(event: MouseEvent): void {
		const target = event.target;
		if (
			!(target instanceof Element) ||
			(!target.closest('[data-popover]') && !target.closest('[data-popover-panel]'))
		) {
			closeAll();
		}
	}

	function handleKeydown(event: KeyboardEvent): void {
		if (event.key !== 'Escape' || (!showExplore && !showMenu)) return;
		const focusTarget = showExplore ? exploreBtnEl : menuBtnEl;
		closeAll();
		focusTarget?.focus();
	}

	// Resolve which tab the pill should sit under for the current state.
	// Extracted so route-change effects, resize and font-ready handlers
	// all share one source of truth (stale pills were reported on mobile).
	function currentTarget(): string {
		if (showMenu) return 'menu';
		if (showExplore) return 'explore';
		const path = deLocalizeUrl(page.url.href).pathname;
		const keys = ['/', '/categories', '/products'];
		let target = '/';
		for (const key of keys) {
			if (key === '/' ? path === '/' : path.startsWith(key)) {
				target = key;
				break;
			}
		}
		return target;
	}

	function syncPill(): void {
		requestAnimationFrame(() => positionPill(currentTarget()));
	}

	onMount(() => {
		// Tab widths shift on viewport resize and when webfonts swap in —
		// re-anchor the pill so it never drifts from the active tab.
		window.addEventListener('resize', syncPill);
		document.fonts?.ready.then(() => syncPill()).catch(() => {});
		return () => window.removeEventListener('resize', syncPill);
	});
	function positionPill(targetKey: string) {
		const bar = document.querySelector('[data-tab-bar]');
		if (!bar) return;
		const sel =
			targetKey === '/'
				? 'a[data-tab="home"]'
				: targetKey === '/categories'
					? 'a[data-tab="categories"]'
					: targetKey === '/products'
						? 'a[data-tab="products"]'
						: targetKey === 'explore'
							? '[data-tab="explore"]'
							: '[data-tab="menu"]';
		const activeEl = bar.querySelector(sel);
		if (activeEl) {
			const r = activeEl.getBoundingClientRect();
			const pr = bar.getBoundingClientRect();
			indicatorX = r.left - pr.left;
			indicatorWidth = r.width;
		}
	}

	afterNavigate(() => syncPill());
</script>

<svelte:document onclickcapture={handleClickOutside} onkeydown={handleKeydown} />

<!-- Backdrop -->
{#if showExplore || showMenu}
	<div
		class="fixed inset-0 z-40 bg-foreground/10 backdrop-blur-xs lg:hidden"
		in:fade={{ duration: 200, easing: cubicOut }}
		out:fade={{ duration: 150, easing: cubicOut }}
	></div>
{/if}

<!-- Explore Popover -->
{#if showExplore}
	<div
		id="mobile-explore-panel"
		class="panel explore-panel glass-strong fixed z-50 max-h-[60vh] w-60 overflow-y-auto rounded-xl p-2 lg:hidden"
		in:materialize
		out:materialize
		style:--panel-inline-start={`${explorePos.inlineInset}px`}
		style:--panel-block-start={`${explorePos.blockInset}px`}
		style:--panel-translate-x={explorePos.translateInline}
		data-popover-panel
	>
		<div class="space-y-2">
			{#each exploreGroups as group (group.label)}
				<div>
					<p class="px-2 pb-1 text-2xs font-semibold tracking-wide text-muted-foreground uppercase">
						{group.label}
					</p>
					<div class="space-y-0.5">
						{#each group.items as item (item.href)}
							<a
								href={localizeHref(item.href)}
								onclick={closeAll}
								class={cn(
									'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors',
									isActive(item.href)
										? 'bg-primary/10 text-primary'
										: 'text-foreground hover:bg-muted'
								)}
							>
								<item.icon class="size-4 shrink-0 text-muted-foreground" />
								{item.label}
							</a>
						{/each}
					</div>
				</div>
			{/each}
		</div>
	</div>
{/if}

<!-- Menu Popover -->
{#if showMenu}
	<div
		id="mobile-menu-panel"
		class="panel menu-panel glass-strong fixed z-50 max-h-[55vh] w-80 overflow-y-auto rounded-xl p-2 lg:hidden"
		in:materialize
		out:materialize
		style:--panel-inline-end={`${menuPos.inlineInset}px`}
		style:--panel-block-start={`${menuPos.blockInset}px`}
		data-popover-panel
	>
		<div class="grid grid-cols-3 gap-1.5">
			{#each menuItems as item (item.href)}
				<a
					href={localizeHref(item.href)}
					onclick={closeAll}
					class={cn(
						'flex flex-col items-center gap-1 rounded-lg border p-2 text-2xs font-medium transition-colors',
						isActive(item.href)
							? 'border-primary/30 bg-primary/10 text-primary'
							: 'border-border/60 text-foreground hover:bg-muted'
					)}
				>
					<item.icon class="size-4 text-muted-foreground" />
					{item.label}
				</a>
			{/each}
		</div>
	</div>
{/if}

<!-- Bottom Tab Bar with Apple-style sliding indicator -->
<nav class="mobile-nav fixed bottom-1.5 z-50 lg:hidden" aria-label="Mobile navigation">
	<div
		data-tab-bar
		class="relative flex items-center justify-evenly rounded-xl border border-foreground/20 bg-background/70 px-2 py-1 shadow-lg backdrop-blur-xl dark:border-foreground/10"
		style="width: min(90vw, 360px);"
	>
		<!-- Sliding indicator pill (Apple signature pattern) -->
		<div
			class="tab-indicator pointer-events-none absolute top-0.5 left-0 h-[calc(100%-4px)] rounded-lg bg-primary/12"
			style="transform: translateX({indicatorX}px); width: {indicatorWidth}px;"
		></div>

		<!-- Home -->
		<a
			data-tab="home"
			href={localizeHref('/')}
			onclick={closeAll}
			aria-current={isActive('/') ? 'page' : undefined}
			class={cn(
				'relative z-10 flex flex-col items-center gap-px rounded-lg px-2 py-0.5 text-2xs font-medium transition-colors duration-base',
				isActive('/') ? 'text-primary' : 'text-muted-foreground'
			)}
		>
			<HomeIcon class="size-4" strokeWidth={isActive('/') ? 2.2 : 1.8} />
			<span>Home</span>
		</a>

		<!-- Categories -->
		<a
			data-tab="categories"
			href={localizeHref('/categories')}
			onclick={closeAll}
			aria-current={isActive('/categories') ? 'page' : undefined}
			class={cn(
				'relative z-10 flex flex-col items-center gap-px rounded-lg px-2 py-0.5 text-2xs font-medium transition-colors duration-base',
				isActive('/categories') ? 'text-primary' : 'text-muted-foreground'
			)}
		>
			<Grid2x2Icon class="size-4" strokeWidth={isActive('/categories') ? 2.2 : 1.8} />
			<span>Categories</span>
		</a>

		<!-- Products -->
		<a
			data-tab="products"
			href={localizeHref('/products')}
			onclick={closeAll}
			aria-current={isActive('/products') ? 'page' : undefined}
			class={cn(
				'relative z-10 flex flex-col items-center gap-px rounded-lg px-2 py-0.5 text-2xs font-medium transition-colors duration-base',
				isActive('/products') ? 'text-primary' : 'text-muted-foreground'
			)}
		>
			<BoxIcon class="size-4" strokeWidth={isActive('/products') ? 2.2 : 1.8} />
			<span>Products</span>
		</a>

		<!-- Explore -->
		<Button
			data-tab="explore"
			variant="ghost"
			bind:ref={exploreBtnEl}
			onclick={(e) => {
				e.stopPropagation();
				toggleExplore();
			}}
			aria-controls="mobile-explore-panel"
			aria-expanded={showExplore}
			aria-haspopup="true"
			class={cn(
				'relative z-10 h-auto flex-col items-center gap-px rounded-lg px-2 py-0.5 text-2xs font-medium transition-colors duration-base',
				showExplore ? 'text-primary' : 'text-muted-foreground'
			)}
			data-popover
		>
			<CompassIcon class="size-4" strokeWidth={showExplore ? 2.2 : 1.8} />
			<span>Explore</span>
		</Button>

		<!-- Menu -->
		<Button
			data-tab="menu"
			variant="ghost"
			bind:ref={menuBtnEl}
			onclick={(e) => {
				e.stopPropagation();
				toggleMenu();
			}}
			aria-controls="mobile-menu-panel"
			aria-expanded={showMenu}
			aria-haspopup="true"
			class={cn(
				'relative z-10 h-auto flex-col items-center gap-px rounded-lg px-2 py-0.5 text-2xs font-medium transition-colors duration-base',
				showMenu ? 'text-primary' : 'text-muted-foreground'
			)}
			data-popover
		>
			<MenuIcon class="size-4" strokeWidth={showMenu ? 2.2 : 1.8} />
			<span>Menu</span>
		</Button>
	</div>
</nav>

<style>
	.panel {
		inset-block-start: var(--panel-block-start);
	}

	.explore-panel {
		inset-inline-start: var(--panel-inline-start);
		transform: translateX(var(--panel-translate-x)) translateY(-100%) scale(0.92);
	}

	.menu-panel {
		inset-inline-end: var(--panel-inline-end);
		transform: translateY(-100%) scale(0.92);
	}

	.mobile-nav {
		inset-inline-start: 50%;
		transform: translateX(-50%);
	}
</style>
