<script lang="ts">
	import { page } from '$app/state';
	import { localizeHref, deLocalizeUrl } from '#lib/paraglide/runtime.js';
	import { cn } from '#lib/utils.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { fade } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
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

	let showExplore = $state(false);
	let showMenu = $state(false);
	let exploreBtnEl = $state<HTMLElement | null>(null);
	let menuBtnEl = $state<HTMLElement | null>(null);
	let explorePos = $state({ left: 0, top: 0 });
	let menuPos = $state({ right: 0, top: 0 });
	let indicatorX = $state(0);
	let indicatorWidth = $state(0);
	let tabRefs = $state<Record<string, HTMLElement | null>>({});

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

	function calcPos(btn: HTMLElement) {
		const rect = btn.getBoundingClientRect();
		return {
			left: rect.left + rect.width / 2,
			right: window.innerWidth - rect.right,
			top: rect.top - 8
		};
	}

	function updateIndicator(key: string) {
		// explore/menu are <Button> refs, not part of tabRefs
		const el = key === 'explore' ? exploreBtnEl : key === 'menu' ? menuBtnEl : tabRefs[key];
		if (el && el.parentElement) {
			const rect = el.getBoundingClientRect();
			const parentRect = el.parentElement.getBoundingClientRect();
			indicatorX = rect.left - parentRect.left;
			indicatorWidth = rect.width;
		}
	}

	function toggleExplore() {
		if (showExplore) {
			showExplore = false;
		} else {
			showMenu = false;
			if (exploreBtnEl) explorePos = calcPos(exploreBtnEl);
			showExplore = true;
			updateIndicator('explore');
		}
	}

	function toggleMenu() {
		if (showMenu) {
			showMenu = false;
		} else {
			showExplore = false;
			if (menuBtnEl) {
				const pos = calcPos(menuBtnEl);
				menuPos = { right: pos.right, top: pos.top };
			}
			showMenu = true;
			updateIndicator('menu');
		}
	}

	function closeAll() {
		showExplore = false;
		showMenu = false;
	}

	// Materialize transition — scale + opacity together (Apple §12: "Materialize, don't just fade")
	const materialize = (node: HTMLElement) => {
		return {
			duration: 250,
			easing: cubicOut,
			css: (t: number) => `opacity: ${t}; transform: scale(${0.92 + 0.08 * t});`
		};
	};

	function handleClickOutside(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (!target.closest('[data-popover]') && !target.closest('[data-popover-panel]')) {
			closeAll();
		}
	}

	// Robust pill sync: always recompute from the live DOM so it works on
	// first hydration (refs not yet bound) and on every route change.
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

	$effect(() => {
		const path = deLocalizeUrl(page.url.href).pathname;
		const showE = showExplore;
		const showM = showMenu;
		void path;
		void showE;
		void showM;

		if (showM) {
			requestAnimationFrame(() => positionPill('menu'));
			return;
		}
		if (showE) {
			requestAnimationFrame(() => positionPill('explore'));
			return;
		}

		const keys = ['/', '/categories', '/products'];
		let target = '/';
		for (const key of keys) {
			if (key === '/' ? path === '/' : path.startsWith(key)) {
				target = key;
				break;
			}
		}
		requestAnimationFrame(() => positionPill(target));
	});
</script>

<svelte:document onclickcapture={handleClickOutside} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->

<!-- Backdrop -->
{#if showExplore || showMenu}
	<div
		class="fixed inset-0 z-40 bg-foreground/10 backdrop-blur-xs md:hidden"
		in:fade={{ duration: 200, easing: cubicOut }}
		out:fade={{ duration: 150, easing: cubicOut }}
		onclick={closeAll}
	></div>
{/if}

<!-- Explore Popover -->
{#if showExplore}
	<div
		class="glass-strong fixed z-50 max-h-[60vh] w-60 overflow-y-auto rounded-xl p-2 md:hidden"
		in:materialize
		out:materialize
		style="left: {explorePos.left}px; top: {explorePos.top}px; transform: translate(-50%, -100%) scale(0.92);"
		data-popover-panel
	>
		<div class="space-y-2">
			{#each exploreGroups as group (group.label)}
				<div>
					<p
						class="px-2 pb-1 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase"
					>
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
		class="glass-strong fixed z-50 max-h-[55vh] w-80 overflow-y-auto rounded-xl p-2 md:hidden"
		in:materialize
		out:materialize
		style="right: {menuPos.right}px; top: {menuPos.top}px; transform: translateY(-100%) scale(0.92);"
		data-popover-panel
	>
		<div class="grid grid-cols-3 gap-1.5">
			{#each menuItems as item (item.href)}
				<a
					href={localizeHref(item.href)}
					onclick={closeAll}
					class={cn(
						'flex flex-col items-center gap-1 rounded-lg border p-2 text-[10px] font-medium transition-colors',
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
<nav
	class="fixed bottom-1.5 left-1/2 z-50 -translate-x-1/2 md:hidden"
	aria-label="Mobile navigation"
>
	<div
		data-tab-bar
		class="relative flex items-center justify-evenly rounded-xl border border-foreground/20 bg-background/70 px-2 py-1 shadow-lg backdrop-blur-xl dark:border-foreground/10"
		style="width: min(90vw, 360px);"
	>
		<!-- Sliding indicator pill (Apple signature pattern) -->
		<div
			class="tab-indicator pointer-events-none absolute top-0.5 h-[calc(100%-4px)] rounded-lg bg-primary/12"
			style="transform: translateX({indicatorX}px); width: {indicatorWidth}px;"
		></div>

		<!-- Home -->
		<a
			data-tab="home"
			href={localizeHref('/')}
			onclick={closeAll}
			bind:this={tabRefs['/']}
			class={cn(
				'relative z-10 flex flex-col items-center gap-px rounded-lg px-2 py-0.5 text-[10px] font-medium transition-colors duration-200',
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
			bind:this={tabRefs['/categories']}
			class={cn(
				'relative z-10 flex flex-col items-center gap-px rounded-lg px-2 py-0.5 text-[10px] font-medium transition-colors duration-200',
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
			bind:this={tabRefs['/products']}
			class={cn(
				'relative z-10 flex flex-col items-center gap-px rounded-lg px-2 py-0.5 text-[10px] font-medium transition-colors duration-200',
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
			class={cn(
				'relative z-10 h-auto flex-col items-center gap-px rounded-lg px-2 py-0.5 text-[10px] font-medium transition-colors duration-200',
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
			class={cn(
				'relative z-10 h-auto flex-col items-center gap-px rounded-lg px-2 py-0.5 text-[10px] font-medium transition-colors duration-200',
				showMenu ? 'text-primary' : 'text-muted-foreground'
			)}
			data-popover
		>
			<MenuIcon class="size-4" strokeWidth={showMenu ? 2.2 : 1.8} />
			<span>Menu</span>
		</Button>
	</div>
</nav>
