<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Card, CardContent, CardHeader, CardTitle } from '#lib/components/ui/card/index.js';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
import Breadcrumb from '#lib/components/site/breadcrumb.svelte';

	let { data } = $props();

	const certBodies = [
		{ name: 'JAKIM', country: 'Malaysia', standard: 'MS 1500' },
		{ name: 'BPJPH / MUI', country: 'Indonesia', standard: 'SNI 97112:2022' },
		{ name: 'MUIS', country: 'Singapore', standard: 'Singapore MUIS' },
		{ name: 'SFDA', country: 'Saudi Arabia', standard: 'SASO' },
		{ name: 'MOIAT', country: 'UAE', standard: 'ESMA' },
		{ name: 'IFANCA', country: 'United States', standard: 'IFANCA' },
		{ name: 'GIMDES', country: 'Türkiye', standard: 'GIMDES' },
		{ name: 'SANHA', country: 'South Africa', standard: 'SANHA' }
	];

	const businessTypes = [
		'Food Manufacturers',
		'Cosmetics & Personal Care',
		'Pharmaceutical',
		'Food Service & Catering',
		'Ingredients & Additives',
		'Packaging & Logistics'
	];
</script>

<Breadcrumb items={[{ label: 'Suppliers', href: '/suppliers' }]} />

<section class="space-y-8">
	<div class="max-w-2xl space-y-2">
		<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Supplier directory</h1>
		<p class="text-muted-foreground">
			Browse halal-certified suppliers by certification body, business type, or region.
		</p>
	</div>

	<!-- Marketplace Coming Soon -->
	<div class="rounded-xl ring-1 ring-foreground/10 bg-card p-6 text-center sm:p-8">
		<Badge variant="secondary" class="mb-3">Coming Soon</Badge>
		<h2 class="text-xl font-semibold tracking-tight">Verified supplier profiles</h2>
		<p class="mx-auto mt-2 max-w-xl text-muted-foreground">
			We're onboarding certified halal suppliers. Each profile will include certification details, scope, and verified contact information.
		</p>
		<div class="mt-4">
			<Button href={localizeHref('/register')} size="sm">Join the waitlist</Button>
		</div>
	</div>

	<!-- Certifying Bodies -->
	<div class="space-y-4">
		<div>
			<h2 class="text-lg font-semibold">Recognised certifying bodies</h2>
			<p class="text-xs text-muted-foreground">Suppliers on HalalNeo carry certificates from these recognised bodies.</p>
		</div>
		<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
			{#each certBodies as body}
				<div class="rounded-xl ring-1 ring-foreground/10 bg-card p-4">
					<div class="flex items-center gap-2 mb-2">
						<ShieldCheck class="size-4 text-primary" />
						<span class="text-sm font-semibold">{body.name}</span>
					</div>
					<p class="text-xs text-muted-foreground">{body.country}</p>
					<p class="text-xs text-muted-foreground">Standard: {body.standard}</p>
				</div>
			{/each}
		</div>
	</div>

	<!-- Business Types -->
	<div class="space-y-4">
		<div>
			<h2 class="text-lg font-semibold">Supplier categories</h2>
			<p class="text-xs text-muted-foreground">Halal-certified suppliers across these industries.</p>
		</div>
		<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
			{#each businessTypes as type}
				<div class="rounded-xl ring-1 ring-foreground/10 bg-card p-4">
					<h3 class="text-sm font-medium">{type}</h3>
					<p class="mt-1 text-xs text-muted-foreground">Coming soon</p>
				</div>
			{/each}
		</div>
	</div>
</section>
