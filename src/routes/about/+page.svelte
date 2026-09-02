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
	import { Avatar, AvatarFallback } from '#lib/components/ui/avatar/index.js';
	import { Separator } from '#lib/components/ui/separator/index.js';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import Globe from '@lucide/svelte/icons/globe';
	import Users from '@lucide/svelte/icons/users';
	import Package from '@lucide/svelte/icons/package';
	import Search from '@lucide/svelte/icons/search';
	import Target from '@lucide/svelte/icons/target';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';

	let { data } = $props();

	const milestones = [
		{
			year: '2024',
			title: 'Platform Launch',
			description:
				'HalalNeo goes live as a B2B marketplace connecting certified halal suppliers with global buyers.',
			step: 1
		},
		{
			year: '2025',
			title: 'Global Expansion',
			description:
				'Expanded to 85+ countries with regional offices in Dubai, Istanbul and Jakarta.',
			step: 2
		},
		{
			year: '2025',
			title: 'AI Integration',
			description:
				'Launched AI-powered trade intelligence tools for halal certification analysis and sourcing.',
			step: 3
		},
		{
			year: '2026',
			title: 'Trade Assurance',
			description:
				'Introduced trade assurance program with verified suppliers and $2.1B in annual trade volume.',
			step: 4
		}
	];

	const team = [
		{
			name: 'Ahmad Khan',
			role: 'CEO & Co-founder',
			initials: 'AK',
			description:
				'Former halal certification auditor with 15 years of experience in global halal trade.'
		},
		{
			name: 'Sarah Lim',
			role: 'CTO',
			initials: 'SL',
			description:
				'Full-stack engineer who previously built supply-chain platforms across Southeast Asia.'
		},
		{
			name: 'Mohammed Rahman',
			role: 'Head of Partnerships',
			initials: 'MR',
			description:
				'Connects HalalNeo with certifying bodies, industry associations and trade governments.'
		}
	];
</script>

<Breadcrumb items={[{ label: 'About', href: '/about' }]} />

<section class="space-y-12">
	<div class="max-w-3xl space-y-4">
		<h1 class="text-3xl font-semibold tracking-tight sm:text-5xl">
			Halal trade, without the guesswork
		</h1>
		<p class="text-lg text-muted-foreground">
			HalalNeo is a trade-intelligence layer for the halal economy. We connect certified suppliers
			with B2B buyers, and back every listing with a knowledge base on certification, logistics and
			market entry.
		</p>
	</div>

	<!-- Our Mission -->
	<div class="rounded-xl bg-card p-6">
		<h2 class="mb-2 text-lg font-bold text-foreground">Our Mission</h2>
		<p class="text-sm text-muted-foreground leading-relaxed">
			HalalNeo is the leading B2B marketplace connecting halal-certified manufacturers, suppliers,
			and buyers across the globe. We simplify halal trade by providing verified supplier profiles,
			certified product catalogs, and AI-powered trade intelligence tools.
		</p>
	</div>

	<div class="grid gap-4 sm:grid-cols-3">
		<Card>
			<CardHeader class="gap-2">
				<ShieldCheck class="size-8 text-primary" data-icon="header" />
				<CardTitle class="text-base">Verification first</CardTitle>
			</CardHeader>
			<CardContent>
				<p class="text-sm text-muted-foreground">
					Every supplier on the platform carries independently issued halal certification — with
					certifying body, standard and scope shown up front.
				</p>
			</CardContent>
		</Card>
		<Card>
			<CardHeader class="gap-2">
				<BookOpen class="size-8 text-primary" data-icon="header" />
				<CardTitle class="text-base">Knowledge, not noise</CardTitle>
			</CardHeader>
			<CardContent>
				<p class="text-sm text-muted-foreground">
					{(data.kbSections ?? []).length} guide sections cover certification, trade, logistics, packaging,
					due diligence and country market entry —written for real B2B buyers.
				</p>
			</CardContent>
		</Card>
		<Card>
			<CardHeader class="gap-2">
				<Globe class="size-8 text-primary" data-icon="header" />
				<CardTitle class="text-base">Built for cross-border</CardTitle>
			</CardHeader>
			<CardContent>
				<p class="text-sm text-muted-foreground">
					Supplier profiles, certification scopes and market guides are organised around the regions
					buyers actually import into —from Southeast Asia to the Gulf.
				</p>
			</CardContent>
		</Card>
	</div>

	<div class="space-y-6">
		<div class="max-w-2xl space-y-2">
			<h2 class="text-2xl font-semibold tracking-tight">Why HalalNeo exists</h2>
			<p class="text-muted-foreground">
				The halal economy is valued in the trillions, yet B2B sourcing still runs on spreadsheets,
				unverifiable PDF certificates and word of mouth. Buyers can't easily tell which suppliers
				are genuinely certified, and vetted suppliers struggle to stand out.
			</p>
		</div>
		<div class="grid gap-4 sm:grid-cols-3">
			<Card>
				<CardHeader class="gap-3">
					<Search class="size-6 text-primary" data-icon="header" />
					<CardTitle class="text-base">01 · Source</CardTitle>
					<CardDescription
						>Browse certified suppliers and halal products by category, market and certifying body.</CardDescription
					>
				</CardHeader>
			</Card>
			<Card>
				<CardHeader class="gap-3">
					<Target class="size-6 text-primary" data-icon="header" />
					<CardTitle class="text-base">02 · Verify</CardTitle>
					<CardDescription
						>Check certification scope, standard and expiry before you commit —no chasing down
						documents.</CardDescription
					>
				</CardHeader>
			</Card>
			<Card>
				<CardHeader class="gap-3">
					<Package class="size-6 text-primary" data-icon="header" />
					<CardTitle class="text-base">03 · Ship</CardTitle>
					<CardDescription
						>Move forward with logistics and compliance guides written for halal trade specifically.</CardDescription
					>
				</CardHeader>
			</Card>
		</div>
	</div>

	<div class="rounded-xl bg-muted/40 shadow-sm p-6 sm:p-10">
		<div class="grid gap-8 sm:grid-cols-2 sm:items-center">
			<div class="space-y-3">
				<h2 class="text-2xl font-semibold tracking-tight">Today on the platform</h2>
				<p class="text-muted-foreground">
					A working snapshot of the HalalNeo marketplace, updated as suppliers and products are
					onboarded.
				</p>
				<div class="flex flex-wrap gap-2 pt-2">
					<Badge variant="secondary">In-memory demo data</Badge>
					<Badge variant="secondary">Prototype</Badge>
				</div>
			</div>
			<div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
				<div class="rounded-xl bg-card/70 p-4 backdrop-blur-sm">
					<p class="text-3xl font-semibold text-primary">{data.stats.supplierCount}</p>
					<p class="text-sm text-muted-foreground">verified suppliers</p>
				</div>
				<div class="rounded-xl bg-card/70 p-4 backdrop-blur-sm">
					<p class="text-3xl font-semibold text-primary">{data.stats.productCount}</p>
					<p class="text-sm text-muted-foreground">certified products</p>
				</div>
				<div class="rounded-xl bg-card/70 p-4 backdrop-blur-sm">
					<p class="text-3xl font-semibold text-primary">{data.stats.marketCountries}</p>
					<p class="text-sm text-muted-foreground">supplier countries</p>
				</div>
				<div class="rounded-xl bg-card/70 p-4 backdrop-blur-sm">
					<p class="text-3xl font-semibold text-primary">{data.stats.kbSectionCount}</p>
					<p class="text-sm text-muted-foreground">knowledge sections</p>
				</div>
				<div class="rounded-xl bg-card/70 p-4 backdrop-blur-sm">
					<p class="text-3xl font-semibold text-primary">{data.stats.certifierCount}</p>
					<p class="text-sm text-muted-foreground">certifying bodies</p>
				</div>
				<div class="rounded-xl bg-card/70 p-4 backdrop-blur-sm">
					<p class="text-3xl font-semibold text-primary">
						{data.stats.totalListings}
					</p>
					<p class="text-sm text-muted-foreground">listings &amp; guides</p>
				</div>
			</div>
		</div>
	</div>

	<div class="space-y-6">
		<div class="max-w-2xl space-y-2">
			<h2 class="text-2xl font-semibold tracking-tight">Certification, spelled out</h2>
			<p class="text-muted-foreground">
				We recognise certificates issued under the world's major halal assurance systems, so you can
				compare scope across markets without decoding a dozen different standards.
			</p>
		</div>
		<div class="flex flex-wrap gap-2">
			{#each (data.certifiers ?? []) as body}
				<Badge variant="outline">{body.name} · {body.standard}</Badge>
			{/each}
		</div>
	</div>

	<div class="space-y-6">
		<div class="max-w-2xl space-y-2">
			<h2 class="text-2xl font-semibold tracking-tight">Our Journey</h2>
			<p class="text-muted-foreground">
				From a small idea to a global halal trade network — the milestones that brought us here.
			</p>
		</div>
		<div class="space-y-4">
			{#each milestones as m}
				<div class="flex gap-4">
					<div class="flex flex-col items-center">
						<div
							class="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground"
						>
							{m.step}
						</div>
						{#if m.step < milestones.length}
							<div class="w-px flex-1 bg-border"></div>
						{/if}
					</div>
					<div class="pb-6">
						<p class="text-sm font-semibold text-primary">{m.year}</p>
						<p class="text-base font-medium text-foreground">{m.title}</p>
						<p class="mt-1 max-w-lg text-sm text-muted-foreground">{m.description}</p>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<Separator />

	<div class="space-y-6">
		<div class="max-w-2xl space-y-2">
			<h2 class="text-2xl font-semibold tracking-tight">Leadership Team</h2>
			<p class="text-muted-foreground">
				The people building the infrastructure for halal trade.
			</p>
		</div>
		<div class="grid gap-4 sm:grid-cols-3">
			{#each team as member}
				<Card>
					<CardHeader class="items-center text-center">
						<Avatar size="lg">
							<AvatarFallback>{member.initials}</AvatarFallback>
						</Avatar>
						<CardTitle class="text-base">{member.name}</CardTitle>
						<CardDescription>{member.role}</CardDescription>
					</CardHeader>
					<CardContent class="text-center">
						<p class="text-sm text-muted-foreground">{member.description}</p>
					</CardContent>
				</Card>
			{/each}
		</div>
	</div>

	<div class="rounded-xl shadow-sm p-6 text-center sm:p-10">
		<Users class="mx-auto size-8 text-primary" data-icon="header" />
		<h2 class="mt-4 text-2xl font-semibold tracking-tight">Ready to source with confidence?</h2>
		<p class="mx-auto mt-2 max-w-xl text-muted-foreground">
			Create a buyer account to shortlist suppliers, or explore the knowledge base to prepare for
			your next import.
		</p>
		<div class="mt-6 flex flex-wrap items-center justify-center gap-3">
			<Button href={localizeHref('/register')}>Create account</Button>
			<Button href={localizeHref('/knowledge-base')} variant="outline">Read the guides</Button>
		</div>
	</div>
</section>
