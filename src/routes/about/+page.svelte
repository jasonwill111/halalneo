<script lang="ts">
	import { localizeHref } from '$lib/paraglide/runtime.js';
	import { adminData } from '$lib/stores/admin-data.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import BookOpen from '@lucide/svelte/icons/book-open';
	import Globe from '@lucide/svelte/icons/globe';
	import Users from '@lucide/svelte/icons/users';
	import Package from '@lucide/svelte/icons/package';
	import Search from '@lucide/svelte/icons/search';
	import Target from '@lucide/svelte/icons/target';

	const supplierCount = $derived(adminData.merchants.filter((m) => m.status === 'active').length);
	const marketCountries = $derived([...new Set(adminData.merchants.map((m) => m.country))].length);
</script>

<svelte:head><title>About �?HalalNeo</title></svelte:head>

<section class="space-y-12">
	<div class="max-w-3xl space-y-4">
		<h1 class="text-3xl font-semibold tracking-tight sm:text-5xl">Halal trade, without the guesswork</h1>
		<p class="text-lg text-muted-foreground">
			HalalNeo is a trade-intelligence layer for the halal economy. We connect certified
			suppliers with B2B buyers, and back every listing with a knowledge base on certification,
			logistics and market entry.
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
					Every supplier on the platform carries independently issued halal certification �?					with certifying body, standard and scope shown up front.
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
					{adminData.kbSections.length} guide sections cover certification, trade, logistics,
					packaging, due diligence and country market entry �?written for real B2B buyers.
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
					Supplier profiles, certification scopes and market guides are organised around the
					regions buyers actually import into �?from Southeast Asia to the Gulf.
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
					<CardDescription>Browse certified suppliers and halal products by category, market and certifying body.</CardDescription>
				</CardHeader>
			</Card>
			<Card>
				<CardHeader class="gap-3">
					<Target class="size-6 text-primary" data-icon="header" />
					<CardTitle class="text-base">02 · Verify</CardTitle>
					<CardDescription>Check certification scope, standard and expiry before you commit �?no chasing down documents.</CardDescription>
				</CardHeader>
			</Card>
			<Card>
				<CardHeader class="gap-3">
					<Package class="size-6 text-primary" data-icon="header" />
					<CardTitle class="text-base">03 · Ship</CardTitle>
					<CardDescription>Move forward with logistics and compliance guides written for halal trade specifically.</CardDescription>
				</CardHeader>
			</Card>
		</div>
	</div>

	<div class="rounded-xl border border-border bg-muted/40 p-6 sm:p-10">
		<div class="grid gap-8 sm:grid-cols-2 sm:items-center">
			<div class="space-y-3">
				<h2 class="text-2xl font-semibold tracking-tight">Today on the platform</h2>
				<p class="text-muted-foreground">
					A working snapshot of the HalalNeo marketplace, updated as suppliers and products
					are onboarded.
				</p>
				<div class="flex flex-wrap gap-2 pt-2">
					<Badge variant="secondary">In-memory demo data</Badge>
					<Badge variant="secondary">Prototype</Badge>
				</div>
			</div>
			<div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
				<div class="rounded-xl bg-card/70 p-4 backdrop-blur-sm">
					<p class="text-3xl font-semibold text-primary">{supplierCount}</p>
					<p class="text-sm text-muted-foreground">verified suppliers</p>
				</div>
				<div class="rounded-xl bg-card/70 p-4 backdrop-blur-sm">
					<p class="text-3xl font-semibold text-primary">{adminData.skus.length}</p>
					<p class="text-sm text-muted-foreground">certified products</p>
				</div>
				<div class="rounded-xl bg-card/70 p-4 backdrop-blur-sm">
					<p class="text-3xl font-semibold text-primary">{marketCountries}</p>
					<p class="text-sm text-muted-foreground">supplier countries</p>
				</div>
				<div class="rounded-xl bg-card/70 p-4 backdrop-blur-sm">
					<p class="text-3xl font-semibold text-primary">{adminData.kbSections.length}</p>
					<p class="text-sm text-muted-foreground">knowledge sections</p>
				</div>
				<div class="rounded-xl bg-card/70 p-4 backdrop-blur-sm">
					<p class="text-3xl font-semibold text-primary">{adminData.certifyingBodies.length}</p>
					<p class="text-sm text-muted-foreground">certifying bodies</p>
				</div>
				<div class="rounded-xl bg-card/70 p-4 backdrop-blur-sm">
					<p class="text-3xl font-semibold text-primary">{adminData.skus.length + adminData.kbSections.length}</p>
					<p class="text-sm text-muted-foreground">listings &amp; guides</p>
				</div>
			</div>
		</div>
	</div>

	<div class="space-y-6">
		<div class="max-w-2xl space-y-2">
			<h2 class="text-2xl font-semibold tracking-tight">Certification, spelled out</h2>
			<p class="text-muted-foreground">
				We recognise certificates issued under the world's major halal assurance systems, so you
				can compare scope across markets without decoding a dozen different standards.
			</p>
		</div>
		<div class="flex flex-wrap gap-2">
			{#each adminData.certifyingBodies as body}
				<Badge variant="outline">{body.name} · {body.standard}</Badge>
			{/each}
		</div>
	</div>

	<div class="rounded-xl border border-border p-6 text-center sm:p-10">
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
