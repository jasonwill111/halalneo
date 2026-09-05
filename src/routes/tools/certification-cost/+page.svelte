<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Card, CardContent } from '#lib/components/ui/card/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { ToggleGroup } from '#lib/components/ui/toggle-group/index.js';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import CalculatorIcon from '@lucide/svelte/icons/calculator';
	import ClockIcon from '@lucide/svelte/icons/clock';
	import DollarSignIcon from '@lucide/svelte/icons/dollar-sign';
	import AlertTriangleIcon from '@lucide/svelte/icons/alert-triangle';

	const certifiers = [
		{
			id: 'jakim',
			name: 'JAKIM',
			country: 'Malaysia',
			baseFeeUsd: 2000,
			timelineWeeks: '12–24',
			validityYears: 2,
			requirements: ['Facility audit', 'Ingredient review', 'Slaughterhouse inspection (if applicable)'],
			notes: 'Gold standard. Recognized by Middle East, ASEAN, OIC countries. 5-year extension for clean record holders.'
		},
		{
			id: 'bpjph',
			name: 'BPJPH / MUI',
			country: 'Indonesia',
			baseFeeUsd: 1500,
			timelineWeeks: '8–16',
			validityYears: 4,
			requirements: ['Document submission', 'On-site audit', 'Laboratory testing'],
			notes: 'Mandatory for F&B since Oct 2024. Free for SMEs (subsidized). World\'s largest halal market.'
		},
		{
			id: 'moiat',
			name: 'MOIAT',
			country: 'UAE',
			baseFeeUsd: 3000,
			timelineWeeks: '3–8',
			validityYears: 1,
			requirements: ['Application review', 'Facility inspection', 'Product testing'],
			notes: 'Mandatory for imported poultry, meat, supplements, cosmetics with animal-origin ingredients. UAE Halal National Mark available.'
		},
		{
			id: 'saber',
			name: 'SABER / SASO',
			country: 'Gulf States',
			baseFeeUsd: 2500,
			timelineWeeks: '6–12',
			validityYears: 1,
			requirements: ['Application', 'Audit', 'Product analysis'],
			notes: 'Gulf Accreditation Center. GCC-wide recognition. Required for Saudi market.'
		},
		{
			id: 'ifanca',
			name: 'IFANCA',
			country: 'USA',
			baseFeeUsd: 4000,
			timelineWeeks: '8–16',
			validityYears: 1,
			requirements: ['Application', 'Facility audit', 'Annual renewal'],
			notes: 'Islamic Food and Nutrition Council of America. Primary US halal certifier. Required for US halal market access.'
		},
		{
			id: 'sfda',
			name: 'SFDA',
			country: 'Saudi Arabia',
			baseFeeUsd: 2800,
			timelineWeeks: '6–12',
			validityYears: 1,
			requirements: ['Product registration', 'Facility audit', 'Lab testing'],
			notes: 'Saudi Food and Drug Authority. Mandatory for food imports to Saudi Arabia.'
		},
		{
			id: 'muis',
			name: 'MUIS',
			country: 'Singapore',
			baseFeeUsd: 2200,
			timelineWeeks: '8–12',
			validityYears: 1,
			requirements: ['Application', 'Audit', 'Product review'],
			notes: 'Majlis Ugama Islam Singapura. Recognized across ASEAN and Middle East.'
		}
	];

	const categories = [
		{ id: 'food', name: 'Food & Beverages', multiplier: 1.0 },
		{ id: 'cosmetics', name: 'Cosmetics & Personal Care', multiplier: 0.8 },
		{ id: 'pharmaceuticals', name: 'Pharmaceuticals', multiplier: 1.3 },
		{ id: 'meat', name: 'Meat & Poultry (Slaughterhouse)', multiplier: 1.5 },
		{ id: 'logistics', name: 'Logistics & Warehousing', multiplier: 0.7 },
		{ id: 'packaging', name: 'Packaging Materials', multiplier: 0.6 }
	];

	const companySizes = [
		{ id: 'micro', name: 'Micro (1–9 employees)', multiplier: 0.7 },
		{ id: 'small', name: 'Small (10–49 employees)', multiplier: 1.0 },
		{ id: 'medium', name: 'Medium (50–249 employees)', multiplier: 1.3 },
		{ id: 'large', name: 'Large (250+ employees)', multiplier: 1.8 }
	];

	let selectedCertifier = $state('jakim');
	let selectedCategory = $state('food');
	let selectedSize = $state('small');

	const certifier = $derived(certifiers.find((c) => c.id === selectedCertifier) ?? certifiers[0]);
	const category = $derived(categories.find((c) => c.id === selectedCategory) ?? categories[0]);
	const size = $derived(companySizes.find((s) => s.id === selectedSize) ?? companySizes[0]);

	const estimatedCost = $derived(
		Math.round(certifier.baseFeeUsd * category.multiplier * size.multiplier)
	);

	const costRange = $derived({
		low: Math.round(estimatedCost * 0.8),
		high: Math.round(estimatedCost * 1.4)
	});
</script>

<Breadcrumb
	items={[
		{ label: 'Tools', href: '/tools' },
		{ label: 'Certification Cost', href: '/tools/certification-cost' }
	]}
/>

<section class="space-y-6">
	<div class="max-w-2xl space-y-2">
		<div class="flex items-center gap-2 text-sm font-medium text-muted-foreground">
			<CalculatorIcon class="size-4"></CalculatorIcon>
			Certification Cost Estimator
		</div>
		<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Estimate certification costs</h1>
		<p class="text-muted-foreground">
			Select your certifier, product category, and company size to get an estimated cost range and
			timeline for halal certification.
		</p>
	</div>

	<div class="grid gap-6 lg:grid-cols-[1fr_auto]">
		<div class="space-y-6">
			<div class="space-y-2">
				<span class="text-sm font-medium" id="certifier-label">Certifying Body</span>
				<ToggleGroup
					type="single"
					bind:value={selectedCertifier}
					variant="outline"
					spacing={2}
					class="grid w-full gap-2 sm:grid-cols-2"
					aria-labelledby="certifier-label"
				>
					{#each certifiers as c}
						<ToggleGroup.Item value={c.id} class="h-auto flex-col items-start gap-0.5 p-3 text-left">
							<span class="font-medium">{c.name}</span>
							<span class="text-xs text-muted-foreground">{c.country}</span>
						</ToggleGroup.Item>
					{/each}
				</ToggleGroup>
			</div>

			<div class="space-y-2">
				<span class="text-sm font-medium" id="category-label">Product Category</span>
				<ToggleGroup
					type="single"
					bind:value={selectedCategory}
					variant="outline"
					spacing={2}
					class="grid w-full gap-2 sm:grid-cols-2"
					aria-labelledby="category-label"
				>
					{#each categories as cat}
						<ToggleGroup.Item value={cat.id} class="h-auto justify-start p-3 text-left text-sm">
							{cat.name}
						</ToggleGroup.Item>
					{/each}
				</ToggleGroup>
			</div>

			<div class="space-y-2">
				<span class="text-sm font-medium" id="size-label">Company Size</span>
				<ToggleGroup
					type="single"
					bind:value={selectedSize}
					variant="outline"
					spacing={2}
					class="grid w-full gap-2 sm:grid-cols-2"
					aria-labelledby="size-label"
				>
					{#each companySizes as s}
						<ToggleGroup.Item value={s.id} class="h-auto justify-start p-3 text-left text-sm">
							{s.name}
						</ToggleGroup.Item>
					{/each}
				</ToggleGroup>
			</div>
		</div>

		<div class="space-y-4 lg:sticky lg:top-24 lg:h-fit">
			<Card class="bg-card">
				<CardContent class="space-y-4 p-5">
					<div class="text-center">
						<p class="text-xs text-muted-foreground">Estimated Total Cost</p>
						<p class="text-4xl font-bold text-primary">
							${costRange.low.toLocaleString()}–${costRange.high.toLocaleString()}
						</p>
						<p class="text-xs text-muted-foreground">USD (approximate)</p>
					</div>

					<div class="grid grid-cols-2 gap-3 text-center">
						<div class="rounded-xl bg-muted/50 p-3">
							<ClockIcon class="mx-auto mb-1 size-4 text-muted-foreground" />
							<p class="text-sm font-semibold">{certifier.timelineWeeks} weeks</p>
							<p class="text-[10px] text-muted-foreground">Typical timeline</p>
						</div>
						<div class="rounded-xl bg-muted/50 p-3">
							<DollarSignIcon class="mx-auto mb-1 size-4 text-muted-foreground" />
							<p class="text-sm font-semibold">{certifier.validityYears} year{certifier.validityYears > 1 ? 's' : ''}</p>
							<p class="text-[10px] text-muted-foreground">Certificate validity</p>
						</div>
					</div>

					<div class="space-y-2">
						<p class="text-xs font-medium text-muted-foreground">Requirements</p>
						<ul class="space-y-1">
							{#each certifier.requirements as req}
								<li class="flex items-start gap-1.5 text-xs text-muted-foreground">
									<span class="mt-0.5 size-1.5 shrink-0 rounded-full bg-primary"></span>
									{req}
								</li>
							{/each}
						</ul>
					</div>

					<p class="text-xs leading-relaxed text-muted-foreground">{certifier.notes}</p>

					<div class="rounded-xl bg-muted/50 p-3 text-center text-xs text-muted-foreground">
						<Button href={localizeHref(`/certifying-bodies/${certifier.id}`)} variant="outline" size="sm" class="w-full">
							View {certifier.name} Details
						</Button>
					</div>
				</CardContent>
			</Card>

			<div class="rounded-xl border border-dashed border-border p-4 text-center text-muted-foreground">
				<AlertTriangleIcon class="mx-auto mb-2 size-6 opacity-40" />
				<p class="text-[11px] leading-relaxed">
					Estimates are based on publicly available fee structures and may vary. Contact the
					certifier directly for an exact quote.
				</p>
			</div>
		</div>
	</div>
</section>
