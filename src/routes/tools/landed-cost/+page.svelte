<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Card, CardContent, CardTitle } from '#lib/components/ui/card/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Alert, AlertDescription } from '#lib/components/ui/alert/index.js';
	import { Field, FieldLabel } from '#lib/components/ui/field/index.js';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import StatTile from '#lib/components/site/stat-tile.svelte';
	import Calculator from '@lucide/svelte/icons/calculator';
	import AlertTriangle from '@lucide/svelte/icons/triangle-alert';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';

	let goodsValue = $state(10000);
	let freight = $state(1200);
	let insurance = $state(150);
	let dutyRate = $state(5);
	let vatRate = $state(5);
	let clearance = $state(400);
	let annualCertCost = $state(3000);
	let shipmentsPerYear = $state(12);
	let quantity = $state(1000);

	const num = (v: number) => (Number.isFinite(v) && v >= 0 ? v : 0);

	const cif = $derived(num(goodsValue) + num(freight) + num(insurance));
	const duty = $derived((cif * num(dutyRate)) / 100);
	const vat = $derived(((cif + duty) * num(vatRate)) / 100);
	const certPerShipment = $derived(
		num(shipmentsPerYear) > 0 ? num(annualCertCost) / num(shipmentsPerYear) : 0
	);
	const total = $derived(cif + duty + vat + num(clearance) + certPerShipment);
	const perUnit = $derived(num(quantity) > 0 ? total / num(quantity) : 0);

	const fmt = (v: number) =>
		v.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });

	const breakdown = $derived([
		{ label: 'Goods value', value: num(goodsValue), tone: 'bg-primary' },
		{ label: 'Freight + insurance', value: num(freight) + num(insurance), tone: 'bg-info' },
		{ label: `Duty (${num(dutyRate)}%)`, value: duty, tone: 'bg-warn' },
		{ label: `VAT (${num(vatRate)}%)`, value: vat, tone: 'bg-teal' },
		{ label: 'Clearance & handling', value: num(clearance), tone: 'bg-gold' },
		{ label: 'Certification share', value: certPerShipment, tone: 'bg-success' }
	]);
	const maxBreak = $derived(Math.max(1, ...breakdown.map((b) => b.value)));
</script>

<svelte:head>
	<!-- Title + description render once via root layout from loader `seo`. -->
</svelte:head>

<Breadcrumb
	items={[
		{ label: 'Tools', href: '/tools' },
		{ label: 'Landed Cost', href: '/tools/landed-cost' }
	]}
/>

<section class="space-y-4 sm:space-y-6">
	<div class="max-w-2xl space-y-2">
		<div class="flex items-center gap-2 text-sm font-medium text-muted-foreground">
			<Calculator class="size-4" />
			Landed Cost Calculator
		</div>
		<h1 class="text-xl font-semibold tracking-tight sm:text-2xl">True cost per unit, landed</h1>
		<p class="max-w-2xl text-xs text-muted-foreground sm:text-sm">
			Supplier quotes are FOB. Add freight, duty, VAT, clearance — and the halal certification share
			most buyers forget — to see what a unit really costs at your warehouse.
		</p>
	</div>

	<div class="grid min-w-0 gap-4 lg:grid-cols-2">
		<Card class="min-w-0 p-4 sm:p-5">
			<CardContent class="space-y-3 p-0">
				<CardTitle class="text-sm sm:text-base">Shipment inputs</CardTitle>
				<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
					<Field>
						<FieldLabel>Goods value (USD)</FieldLabel>
						<Input class="min-h-11 sm:min-h-8" type="number" min="0" bind:value={goodsValue} />
					</Field>
					<Field>
						<FieldLabel>Quantity (units)</FieldLabel>
						<Input class="min-h-11 sm:min-h-8" type="number" min="1" bind:value={quantity} />
					</Field>
					<Field>
						<FieldLabel>Freight (USD)</FieldLabel>
						<Input class="min-h-11 sm:min-h-8" type="number" min="0" bind:value={freight} />
					</Field>
					<Field>
						<FieldLabel>Insurance (USD)</FieldLabel>
						<Input class="min-h-11 sm:min-h-8" type="number" min="0" bind:value={insurance} />
					</Field>
					<Field>
						<FieldLabel>Import duty (%)</FieldLabel>
						<Input
							class="min-h-11 sm:min-h-8"
							type="number"
							min="0"
							max="100"
							step="0.5"
							bind:value={dutyRate}
						/>
					</Field>
					<Field>
						<FieldLabel>VAT / GST (%)</FieldLabel>
						<Input
							class="min-h-11 sm:min-h-8"
							type="number"
							min="0"
							max="100"
							step="0.5"
							bind:value={vatRate}
						/>
					</Field>
					<Field>
						<FieldLabel>Clearance & handling (USD)</FieldLabel>
						<Input class="min-h-11 sm:min-h-8" type="number" min="0" bind:value={clearance} />
					</Field>
					<Field>
						<FieldLabel>Annual cert. cost (USD)</FieldLabel>
						<Input class="min-h-11 sm:min-h-8" type="number" min="0" bind:value={annualCertCost} />
					</Field>
				</div>
				<Field>
					<FieldLabel>Shipments per year (amortises certification)</FieldLabel>
					<Input class="min-h-11 sm:min-h-8" type="number" min="1" bind:value={shipmentsPerYear} />
				</Field>
				<p class="text-2xs-plus leading-relaxed text-muted-foreground">
					Duty and VAT rates vary by HS code and destination — confirm with your broker. VAT here
					applies to CIF + duty, the common GCC treatment.
				</p>
			</CardContent>
		</Card>

		<div class="min-w-0 space-y-4 lg:sticky lg:top-24 lg:h-fit">
			<div class="grid min-w-0 grid-cols-2 gap-2">
				<div class="min-w-0">
					<StatTile value={fmt(total)} label="Total landed cost" tone="primary" />
				</div>
				<div class="min-w-0">
					<StatTile value={fmt(perUnit)} label="Cost per unit" tone="success" />
				</div>
			</div>
			<Card class="p-4 sm:p-5">
				<CardContent class="space-y-2.5 p-0">
					<CardTitle class="text-sm sm:text-base">Cost breakdown</CardTitle>
					{#each breakdown as b (b.label)}
						<div>
							<div class="mb-1 flex min-w-0 items-center justify-between gap-2 text-xs">
								<span class="min-w-0 break-words text-muted-foreground">{b.label}</span>
								<span class="shrink-0 font-semibold tabular-nums">{fmt(b.value)}</span>
							</div>
							<div class="h-1.5 overflow-hidden rounded-full bg-muted">
								<div
									class={`${b.tone} h-full rounded-full transition-[width]`}
									style={`width: ${(b.value / maxBreak) * 100}%`}
								></div>
							</div>
						</div>
					{/each}
					<p class="pt-1 text-2xs-plus text-muted-foreground">
						Certification share: {fmt(certPerShipment)} per shipment — invisible in quotes, real in margins.
					</p>
				</CardContent>
			</Card>
			<Card class="p-4">
				<CardContent class="flex flex-wrap items-center justify-between gap-2 p-0">
					<div class="text-xs text-muted-foreground">
						Next: make sure the label survives the port.
					</div>
					<Button
						href={localizeHref(
							'/knowledge-base/packaging-labeling/gso-193-labelling-claims-checklist'
						)}
						variant="outline"
						size="sm"
						class="min-h-11 sm:min-h-7"
					>
						GSO 9 labelling checklist
						<ArrowRight class="size-3.5 rtl:rotate-180" />
					</Button>
				</CardContent>
			</Card>
		</div>
	</div>

	<Alert class="border-dashed bg-muted/20 p-4 text-center">
		<AlertTriangle class="mx-auto size-6 opacity-50" />
		<AlertDescription class="mx-auto max-w-2xl text-xs leading-relaxed sm:text-sm">
			Estimates only — duty depends on HS classification and trade agreements, VAT rules differ by
			market. Confirm with your customs broker before contracting.
		</AlertDescription>
	</Alert>
</section>
