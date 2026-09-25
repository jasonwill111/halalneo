<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '#lib/components/ui/card/index.js';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import Globe from '@lucide/svelte/icons/globe';
	import Users from '@lucide/svelte/icons/users';
	import Package from '@lucide/svelte/icons/package';
	import Search from '@lucide/svelte/icons/search';
	import Target from '@lucide/svelte/icons/target';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import StatTile from '#lib/components/site/stat-tile.svelte';

	let { data } = $props();
</script>

<svelte:head>
	<link rel="preload" as="image" href="/api/media/about-hero.webp" fetchpriority="high" />
</svelte:head>

<Breadcrumb items={[{ label: 'About', href: '/about' }]} />

<section class="flex min-w-0 flex-col gap-4 sm:gap-6">
	<div class="flex max-w-2xl min-w-0 flex-col gap-2">
		<h1 class="text-xl font-semibold tracking-tight sm:text-3xl">
			Halal trade, without the guesswork
		</h1>
		<p class="max-w-[65ch] text-xs text-muted-foreground sm:text-sm">
			HalalNeo is a trade-intelligence layer for the halal economy. We connect certified suppliers
			with B2B buyers, and back every listing with a knowledge base on certification, logistics and
			market entry.
		</p>
	</div>

	<div class="relative min-w-0 overflow-hidden rounded-xl">
		<img
			src="/api/media/about-hero.webp"
			alt="Global halal trade"
			class="aspect-[3/1] w-full object-cover"
			loading="eager"
			fetchpriority="high"
			decoding="async"
			width="1200"
			height="400"
		/>
		<div class="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
	</div>

	<Card class="min-w-0 p-3 sm:p-5">
		<h2 class="mb-1.5 text-sm font-bold text-foreground sm:text-lg">Our Mission</h2>
		<p class="max-w-[65ch] text-xs leading-relaxed text-muted-foreground sm:text-sm">
			HalalNeo simplifies halal trade by providing verified supplier profiles, certified product
			catalogs, and comprehensive trade intelligence — all in one platform. We help buyers find
			genuinely certified suppliers and verify certifications before committing to a shipment.
		</p>
	</Card>

	<div class="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
		<Card class="min-w-0 p-2.5 sm:p-3">
			<CardHeader class="min-w-0 gap-1.5 sm:gap-2">
				<ShieldCheck class="size-5 text-primary sm:size-6" data-icon="header" />
				<CardTitle class="line-clamp-2 text-xs leading-snug sm:text-sm"
					>Verification first</CardTitle
				>
			</CardHeader>
			<CardContent>
				<p class="max-w-[65ch] text-xs leading-relaxed text-muted-foreground sm:text-sm">
					Every supplier on the platform carries independently issued halal certification — with
					certifying body, standard and scope shown up front.
				</p>
			</CardContent>
		</Card>
		<Card class="p-2.5 sm:p-3">
			<CardHeader class="min-w-0 gap-1.5 sm:gap-2">
				<BookOpen class="size-5 text-primary sm:size-6" data-icon="header" />
				<CardTitle class="line-clamp-2 text-xs leading-snug sm:text-sm"
					>Knowledge, not noise</CardTitle
				>
			</CardHeader>
			<CardContent>
				<p class="max-w-[65ch] text-xs leading-relaxed text-muted-foreground sm:text-sm">
					{(data.kbSections ?? []).length} guide sections cover certification, trade, logistics, packaging,
					due diligence and country market entry —written for real B2B buyers.
				</p>
			</CardContent>
		</Card>
		<Card class="p-2.5 sm:p-3">
			<CardHeader class="min-w-0 gap-1.5 sm:gap-2">
				<Globe class="size-5 text-primary sm:size-6" data-icon="header" />
				<CardTitle class="line-clamp-2 text-xs leading-snug sm:text-sm"
					>Built for cross-border</CardTitle
				>
			</CardHeader>
			<CardContent>
				<p class="max-w-[65ch] text-xs leading-relaxed text-muted-foreground sm:text-sm">
					Supplier profiles, certification scopes and market guides are organised around the regions
					buyers actually import into —from Southeast Asia to the Gulf.
				</p>
			</CardContent>
		</Card>
	</div>

	<div class="flex min-w-0 flex-col gap-3 sm:gap-4">
		<div class="flex max-w-2xl flex-col gap-1.5">
			<h2 class="text-sm font-semibold tracking-tight sm:text-xl">Why HalalNeo exists</h2>
			<p class="max-w-[65ch] text-xs text-muted-foreground sm:text-sm">
				The halal economy is valued in the trillions, yet B2B sourcing still runs on spreadsheets,
				unverifiable PDF certificates and word of mouth. Buyers can't easily tell which suppliers
				are genuinely certified, and vetted suppliers struggle to stand out.
			</p>
		</div>
		<div class="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
			<Card class="p-2.5 sm:p-3">
				<CardHeader class="min-w-0 gap-1.5 sm:gap-2">
					<Search class="size-5 text-primary sm:size-6" data-icon="header" />
					<CardTitle class="line-clamp-2 text-xs leading-snug sm:text-sm">01 · Source</CardTitle>
					<CardDescription class="max-w-[65ch] text-xs sm:text-sm"
						>Browse certified suppliers and halal products by category, market and certifying body.</CardDescription
					>
				</CardHeader>
			</Card>
			<Card class="p-2.5 sm:p-3">
				<CardHeader class="min-w-0 gap-1.5 sm:gap-2">
					<Target class="size-5 text-primary sm:size-6" data-icon="header" />
					<CardTitle class="line-clamp-2 text-xs leading-snug sm:text-sm">02 · Verify</CardTitle>
					<CardDescription class="max-w-[65ch] text-xs sm:text-sm"
						>Check certification scope, standard and expiry before you commit —no chasing down
						documents.</CardDescription
					>
				</CardHeader>
			</Card>
			<Card class="p-2.5 sm:p-3">
				<CardHeader class="min-w-0 gap-1.5 sm:gap-2">
					<Package class="size-5 text-primary sm:size-6" data-icon="header" />
					<CardTitle class="line-clamp-2 text-xs leading-snug sm:text-sm">03 · Ship</CardTitle>
					<CardDescription class="max-w-[65ch] text-xs sm:text-sm"
						>Move forward with logistics and compliance guides written for halal trade specifically.</CardDescription
					>
				</CardHeader>
			</Card>
		</div>
	</div>

	<div class="min-w-0 rounded-xl bg-muted/40 p-3 sm:p-4">
		<div class="grid min-w-0 gap-3 sm:grid-cols-2 sm:items-center sm:gap-4">
			<div class="flex max-w-2xl flex-col gap-1.5">
				<h2 class="text-sm font-semibold tracking-tight sm:text-xl">What's on the platform</h2>
				<p class="max-w-[65ch] text-xs text-muted-foreground sm:text-sm">
					Researched knowledge base, trade tools, and market intelligence — built for halal B2B
					buyers and suppliers.
				</p>
			</div>
			<div class="grid min-w-0 grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
				<StatTile value={data.stats.kbSectionCount} label="knowledge sections" tone="info" />
				<StatTile value={data.stats.certifierCount} label="certifying bodies" tone="warn" />
				<StatTile value={3} label="trade tools" tone="success" />
				<StatTile value={data.stats.guideCount} label="market guides" tone="teal" />
				<StatTile value="80+" label="glossary terms" tone="gold" />
				<StatTile value={data.stats.showCount} label="trade shows" tone="info" />
			</div>
		</div>
	</div>

	<Card class="min-w-0 p-3 sm:p-5">
		<h2 class="mb-1.5 text-sm font-bold text-foreground sm:text-lg">How we source data</h2>
		<p class="max-w-[65ch] text-xs leading-relaxed text-muted-foreground sm:text-sm">
			All certification data on HalalNeo is sourced from publicly available registers of accredited
			halal certifying bodies — JAKIM, MUI/LPPOM, ESMA, SFDA, IFANCA, and others. We cross-reference
			certificate numbers, issuing organisations and scope details against each body's published
			records. Supplier and product listings are illustrative examples to demonstrate the platform;
			always verify directly with the certifying body before entering into any commercial agreement.
		</p>
	</Card>

	<div class="flex min-w-0 flex-col gap-3 sm:gap-4">
		<div class="flex max-w-2xl flex-col gap-1.5">
			<h2 class="text-sm font-semibold tracking-tight sm:text-xl">Certification, spelled out</h2>
			<p class="max-w-[65ch] text-xs text-muted-foreground sm:text-sm">
				We recognise certificates issued under the world's major halal assurance systems, so you can
				compare scope across markets without decoding a dozen different standards.
			</p>
		</div>
		<div class="flex min-w-0 flex-wrap gap-2">
			{#each data.certifiers ?? [] as body (body.id)}
				<div class="max-w-full min-w-0">
					<Badge variant="outline" class="max-w-full truncate">{body.name} · {body.standard}</Badge>
				</div>
			{/each}
		</div>
	</div>

	<div class="min-w-0 rounded-xl p-3 text-center sm:p-4">
		<Users class="mx-auto size-6 text-primary" data-icon="header" />
		<h2 class="mt-2 text-sm font-semibold tracking-tight sm:text-xl">
			Ready to source with confidence?
		</h2>
		<p class="mx-auto mt-1.5 max-w-[65ch] text-xs text-muted-foreground sm:text-sm">
			Create a buyer account to shortlist suppliers, or explore the knowledge base to prepare for
			your next import.
		</p>
		<div class="mt-3 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
			<Button href={localizeHref('/register')} size="sm" class="w-full sm:w-auto"
				>Create account</Button
			>
			<Button
				href={localizeHref('/knowledge-base')}
				variant="outline"
				size="sm"
				class="w-full sm:w-auto">Read the guides</Button
			>
		</div>
	</div>
</section>
