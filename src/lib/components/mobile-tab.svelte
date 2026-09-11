<script lang="ts">
	import { page } from '$app/state';
	import { localizeHref, deLocalizeUrl } from '#lib/paraglide/runtime.js';
	import { cn } from '#lib/utils.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { fade } from 'svelte/transition';
	import HomeIcon from '@lucide/svelte/icons/home';
	import MenuIcon from '@lucide/svelte/icons/menu';
	import Grid2x2Icon from '@lucide/svelte/icons/grid-2x2';
	import BoxIcon from '@lucide/svelte/icons/box';
	import CompassIcon from '@lucide/svelte/icons/compass';
	import BookOpenIcon from '@lucide/svelte/icons/book-open';
	import GlobeIcon from '@lucide/svelte/icons/globe';
	import CalendarIcon from '@lucide/svelte/icons/calendar';
	import PenIcon from '@lucide/svelte/icons/pen';
	import GraduationCapIcon from '@lucide/svelte/icons/graduation-cap';
	import UsersIcon from '@lucide/svelte/icons/users';
	import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';
	import FlaskConicalIcon from '@lucide/svelte/icons/flask-conical';
	import CalculatorIcon from '@lucide/svelte/icons/calculator';
	import FileTextIcon from '@lucide/svelte/icons/file-text';
	import ScaleIcon from '@lucide/svelte/icons/scale';
	import HandshakeIcon from '@lucide/svelte/icons/handshake';
	import BanknoteIcon from '@lucide/svelte/icons/banknote';
	import HelpCircleIcon from '@lucide/svelte/icons/circle-question-mark';
	import InfoIcon from '@lucide/svelte/icons/info';
	import MailIcon from '@lucide/svelte/icons/mail';
	import LogInIcon from '@lucide/svelte/icons/log-in';
	import UserPlusIcon from '@lucide/svelte/icons/user-plus';
	import NewspaperIcon from '@lucide/svelte/icons/newspaper';
	import MessageCircleIcon from '@lucide/svelte/icons/message-circle';
	import TagsIcon from '@lucide/svelte/icons/tags';

	let showExplore = $state(false);
	let showMenu = $state(false);
	let exploreBtnEl = $state<HTMLElement | null>(null);
	let menuBtnEl = $state<HTMLElement | null>(null);
	let explorePos = $state({ left: 0, top: 0 });
	let menuPos = $state({ right: 0, top: 0 });

	const exploreGroups = [
		{
			label: 'Resources',
			items: [
				{ label: 'Knowledge Base', href: '/knowledge-base', icon: BookOpenIcon },
				{ label: 'Market Guides', href: '/market-guides', icon: GlobeIcon },
				{ label: 'Trade Shows', href: '/trade-shows', icon: CalendarIcon },
				{ label: 'Blog', href: '/blog', icon: PenIcon },
				{ label: 'Glossary', href: '/glossary', icon: GraduationCapIcon }
			]
		},
		{
			label: 'Halal Tools',
			items: [
				{ label: 'All Tools', href: '/tools', icon: CalculatorIcon },
				{ label: 'Verify Certificate', href: '/verify', icon: ShieldCheckIcon },
				{ label: 'Ingredient Checker', href: '/tools/ingredient-checker', icon: FlaskConicalIcon },
				{ label: 'Certification Cost', href: '/tools/certification-cost', icon: CalculatorIcon },
				{ label: 'Landed Cost', href: '/tools/landed-cost', icon: BanknoteIcon },
				{ label: 'RFQ Builder', href: '/tools/rfq-builder', icon: FileTextIcon }
			]
		},
		{
			label: 'Ecosystem',
			items: [
				{ label: 'Certifying Bodies', href: '/certifying-bodies', icon: ScaleIcon },
				{ label: 'Service Providers', href: '/service-providers', icon: HandshakeIcon }
			]
		}
	];

	const menuItems = [
		{ label: 'Suppliers', href: '/suppliers', icon: UsersIcon },
		{ label: 'Pricing', href: '/pricing', icon: BanknoteIcon },
		{ label: 'FAQ', href: '/faq', icon: HelpCircleIcon },
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

	function toggleExplore() {
		if (showExplore) {
			showExplore = false;
		} else {
			showMenu = false;
			if (exploreBtnEl) explorePos = calcPos(exploreBtnEl);
			showExplore = true;
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
		}
	}

	function closeAll() {
		showExplore = false;
		showMenu = false;
	}

	function handleClickOutside(e: MouseEvent) {
		const target = e.target as HTMLElement;
		if (!target.closest('[data-popover]') && !target.closest('[data-popover-panel]')) {
			closeAll();
		}
	}
</script>

<svelte:document onclickcapture={handleClickOutside} />

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->

<!-- Backdrop -->
{#if showExplore || showMenu}
	<div
		class="fixed inset-0 z-40 md:hidden"
		onclick={closeAll}
		transition:fade={{ duration: 150 }}
	></div>
{/if}

<!-- Explore Popover (fixed, rendered outside tab bar) -->
{#if showExplore}
	<div
		class="glass-strong fixed z-50 max-h-[60vh] w-60 overflow-y-auto rounded-xl p-2 md:hidden"
		style="left: {explorePos.left}px; top: {explorePos.top}px; transform: translate(-50%, -100%);"
		data-popover-panel
	>
		<div class="space-y-2">
			{#each exploreGroups as group (group.label)}
				<div>
					<p class="px-2 pb-1 text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
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

<!-- Menu Popover (fixed, rendered outside tab bar) -->
{#if showMenu}
	<div
		class="glass-strong fixed z-50 max-h-[55vh] w-80 overflow-y-auto rounded-xl p-2 md:hidden"
		style="right: {menuPos.right}px; top: {menuPos.top}px; transform: translateY(-100%);"
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

<!-- Bottom Tab Bar (App Dock �?all breakpoints) -->
<nav
	class="fixed bottom-1.5 left-1/2 z-50 -translate-x-1/2 md:hidden"
	aria-label="Mobile navigation"
>
	<div
		class="flex items-center justify-evenly rounded-xl border border-white/20 bg-background/70 px-2 py-1 shadow-lg backdrop-blur-xl dark:border-white/10"
		style="width: min(90vw, 360px);"
	>
		<!-- Home -->
		<a
			href={localizeHref('/')}
			onclick={closeAll}
			class={cn(
				'flex flex-col items-center gap-px rounded-lg px-2 py-0.5 text-[10px] font-medium transition-all duration-200',
				isActive('/') ? 'bg-primary/15 text-primary' : 'text-muted-foreground'
			)}
		>
			<HomeIcon class="size-4" strokeWidth={isActive('/') ? 2.2 : 1.8} />
			<span>Home</span>
		</a>

		<!-- Categories -->
		<a
			href={localizeHref('/categories')}
			onclick={closeAll}
			class={cn(
				'flex flex-col items-center gap-px rounded-lg px-2 py-0.5 text-[10px] font-medium transition-all duration-200',
				isActive('/categories') ? 'bg-primary/15 text-primary' : 'text-muted-foreground'
			)}
		>
			<Grid2x2Icon class="size-4" strokeWidth={isActive('/categories') ? 2.2 : 1.8} />
			<span>Categories</span>
		</a>

		<!-- Products -->
		<a
			href={localizeHref('/products')}
			onclick={closeAll}
			class={cn(
				'flex flex-col items-center gap-px rounded-lg px-2 py-0.5 text-[10px] font-medium transition-all duration-200',
				isActive('/products') ? 'bg-primary/15 text-primary' : 'text-muted-foreground'
			)}
		>
			<BoxIcon class="size-4" strokeWidth={isActive('/products') ? 2.2 : 1.8} />
			<span>Products</span>
		</a>

		<!-- Explore -->
		<Button
			variant="ghost"
			bind:ref={exploreBtnEl}
			onclick={(e) => { e.stopPropagation(); toggleExplore(); }}
			class={cn(
				'h-auto flex-col items-center gap-px rounded-lg px-2 py-0.5 text-[10px] font-medium transition-all duration-200',
				showExplore ? 'bg-primary/15 text-primary' : 'text-muted-foreground'
			)}
			data-popover
		>
			<CompassIcon class="size-4" strokeWidth={showExplore ? 2.2 : 1.8} />
			<span>Explore</span>
		</Button>

		<!-- Menu -->
		<Button
			variant="ghost"
			bind:ref={menuBtnEl}
			onclick={(e) => { e.stopPropagation(); toggleMenu(); }}
			class={cn(
				'h-auto flex-col items-center gap-px rounded-lg px-2 py-0.5 text-[10px] font-medium transition-all duration-200',
				showMenu ? 'bg-primary/15 text-primary' : 'text-muted-foreground'
			)}
			data-popover
		>
			<MenuIcon class="size-4" strokeWidth={showMenu ? 2.2 : 1.8} />
			<span>Menu</span>
		</Button>
	</div>
</nav>
