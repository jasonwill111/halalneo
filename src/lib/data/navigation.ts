import type { Component } from 'svelte';
import BookOpenIcon from '@lucide/svelte/icons/book-open';
import Grid2x2Icon from '@lucide/svelte/icons/grid-2x2';
import UsersIcon from '@lucide/svelte/icons/users';
import BoxIcon from '@lucide/svelte/icons/box';
import PenIcon from '@lucide/svelte/icons/pen';
import CalendarIcon from '@lucide/svelte/icons/calendar';
import GlobeIcon from '@lucide/svelte/icons/globe';
import ShieldCheckIcon from '@lucide/svelte/icons/shield-check';
import FlaskConicalIcon from '@lucide/svelte/icons/flask-conical';
import CalculatorIcon from '@lucide/svelte/icons/calculator';
import FileTextIcon from '@lucide/svelte/icons/file-text';
import InfoIcon from '@lucide/svelte/icons/info';
import NewspaperIcon from '@lucide/svelte/icons/newspaper';
import HandshakeIcon from '@lucide/svelte/icons/handshake';
import GraduationCapIcon from '@lucide/svelte/icons/graduation-cap';
import ScaleIcon from '@lucide/svelte/icons/scale';
import MessageCircleIcon from '@lucide/svelte/icons/message-circle';
import MailIcon from '@lucide/svelte/icons/mail';
import BanknoteIcon from '@lucide/svelte/icons/banknote';
import TagsIcon from '@lucide/svelte/icons/tags';
import SparklesIcon from '@lucide/svelte/icons/sparkles';
import UserPlusIcon from '@lucide/svelte/icons/user-plus';
import LogInIcon from '@lucide/svelte/icons/log-in';
import HelpCircleIcon from '@lucide/svelte/icons/circle-question-mark';
import HomeIcon from '@lucide/svelte/icons/home';
import UserIcon from '@lucide/svelte/icons/user';
import SearchIcon from '@lucide/svelte/icons/search';
import TrophyIcon from '@lucide/svelte/icons/trophy';

export interface NavItem {
	label: string;
	href: string;
	icon: Component<{ class?: string }>;
}

export interface NavGroup {
	label: string;
	items: NavItem[];
}

/**
 * Platform navigation — single source of truth.
 * Header (desktop) renders primary + group triggers; the mobile menu sheet
 * and the footer render the full tree so every link stays reachable on
 * every breakpoint.
 */

/** Primary nav — always visible in the header on desktop/tablet. */
export const primaryNav: NavItem[] = [
	{ label: 'Categories', href: '/categories', icon: Grid2x2Icon },
	{ label: 'Suppliers', href: '/suppliers', icon: UsersIcon },
	{ label: 'Products', href: '/products', icon: BoxIcon }
];

/** Grouped nav — rendered as dropdowns (header) and sections (mobile menu / footer). */
/* NOTE: group order = header dropdown order (left→right) and mobile Explore
   popover order (top→bottom). Trade leads because it carries transactions. */
export const navGroups: NavGroup[] = [
	{
		label: 'Trade',
		items: [
			{ label: 'Buying Requests', href: '/rfqs', icon: FileTextIcon },
			{ label: 'Quick Deals', href: '/promotions', icon: TagsIcon },
			{ label: 'Success Stories', href: '/success-stories', icon: TrophyIcon }
		]
	},
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
			{ label: 'Service Providers', href: '/service-providers', icon: HandshakeIcon },
			{ label: 'Become a Supplier', href: '/supplier/onboarding', icon: UserPlusIcon },
			{ label: 'Pricing', href: '/pricing', icon: BanknoteIcon },
			{ label: 'FAQ', href: '/faq', icon: HelpCircleIcon }
		]
	},
	{
		label: 'Company',
		items: [
			{ label: 'About', href: '/about', icon: InfoIcon },
			{ label: 'Contact', href: '/contact', icon: MailIcon }
		]
	}
];

/** Utility links — header icons (desktop) and mobile menu. */
export const utilityNav: NavItem[] = [
	{ label: 'Search', href: '/search', icon: SparklesIcon },
	{ label: 'Sign in', href: '/login', icon: LogInIcon },
	{ label: 'Create account', href: '/register', icon: UserPlusIcon }
];

/** Footer-only links (rarely needed in main nav, still must be reachable). */
export const footerOnlyNav: NavItem[] = [
	{ label: 'Saved Items', href: '/account/saved', icon: NewspaperIcon },
	{ label: 'My Inquiries', href: '/account/inquiries', icon: MessageCircleIcon },
	{ label: 'Become a Supplier', href: '/supplier/onboarding', icon: UserPlusIcon },
	{ label: 'Supplier Sign In', href: '/supplier/login', icon: TagsIcon }
];

/** Mobile tab bar labels — icons resolved in the component. */
export const mobileTabs: NavItem[] = [
	{ label: 'Home', href: '/', icon: HomeIcon },
	{ label: 'Categories', href: '/categories', icon: Grid2x2Icon },
	{ label: 'Products', href: '/products', icon: BoxIcon },
	{ label: 'Search', href: '/search', icon: SparklesIcon },
	{ label: 'Account', href: '/account', icon: UserIcon }
];

/** Every routable public link, flattened — used for coverage checks. */
export function allNavItems(): NavItem[] {
	return [
		...primaryNav,
		...navGroups.flatMap((g) => g.items),
		...utilityNav,
		...footerOnlyNav
	];
}
