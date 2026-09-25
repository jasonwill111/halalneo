<script lang="ts">
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Progress } from '#lib/components/ui/progress/index.js';
	import * as ToggleGroup from '#lib/components/ui/toggle-group/index.js';
	import ArrowDown from '@lucide/svelte/icons/arrow-down';
	import ArrowUp from '@lucide/svelte/icons/arrow-up';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import Download from '@lucide/svelte/icons/download';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';

	interface DataCounts {
		overall?: string;
		lastUpdated: number;
		[key: string]: string | number | undefined;
	}

	interface QualityMetric {
		type: string;
		score: number;
		trend: number;
		isPositive: boolean;
		verified: number;
		total: number;
	}

	let { dataCounts, qualityMetrics }: { dataCounts: DataCounts; qualityMetrics: QualityMetric[] } =
		$props();

	let selectedTab = $state('all');
	const tabOptions = [
		'all',
		'suppliers',
		'products',
		'market_guides',
		'success_stories',
		'promotions'
	];
</script>

<div class="space-y-4 sm:space-y-6">
	<div
		class="flex flex-col gap-3 border-b border-border/60 pb-4 sm:flex-row sm:items-end sm:justify-between"
	>
		<div class="min-w-0">
			<h1 class="truncate text-xl font-semibold text-foreground sm:text-2xl">
				Data Quality Dashboard
			</h1>
			<p class="mt-1 text-2xs-plus text-muted-foreground sm:text-sm">
				Real-time validation and reporting for all content types
			</p>
		</div>
		<div class="flex shrink-0 flex-wrap gap-2">
			<Button variant="outline">
				<Download class="size-4" />
				Export Report
			</Button>
			<Button onclick={() => window.location.reload()}>
				<RefreshCw class="size-4" />
				Refresh Data
			</Button>
		</div>
	</div>

	<div class="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
		{#each Object.keys(dataCounts) as key (key)}
			{@const metric = qualityMetrics.find(
				(m) => m.type.toLowerCase().replace(/\s+/g, '_') === key
			)}
			{#if key !== 'overall' && key !== 'lastUpdated'}
				<div class="min-w-0 rounded-xl bg-card p-2 ring-1 ring-foreground/10 sm:p-4">
					<div class="flex items-start justify-between gap-1.5">
						<div class="flex min-w-0 items-center gap-2">
							<div
								class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 sm:size-9"
							>
								<CircleCheck class="size-3.5 text-primary sm:size-5" />
							</div>
							<div class="min-w-0">
								<p class="truncate text-2xs text-muted-foreground sm:text-xs">
									{key
										.replace(/_/g, ' ')
										.split(' ')
										.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
										.join(' ')}
								</p>
								<p class="truncate text-base font-bold text-foreground tabular-nums sm:text-2xl">
									{dataCounts[key]}
								</p>
							</div>
						</div>
						{#if metric}
							<Badge
								variant="secondary"
								class="h-5 border-transparent px-1.5 text-4xs font-semibold tabular-nums {metric.score >=
								80
									? 'bg-success/10 text-success'
									: metric.score >= 60
										? 'bg-warn/10 text-warn'
										: 'bg-destructive/10 text-destructive'}"
							>
								{metric.score}%
							</Badge>
						{/if}
					</div>
				</div>
			{/if}
		{/each}
	</div>

	<div
		class="-mx-1 snap-x scrollbar-none overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible"
	>
		<ToggleGroup.Root
			type="single"
			bind:value={selectedTab}
			aria-label="Content type filter"
			class="w-full flex-nowrap gap-2 sm:w-fit sm:flex-wrap"
		>
			{#each tabOptions as tab (tab)}
				<ToggleGroup.Item
					value={tab}
					class="h-8 shrink-0 snap-start rounded-4xl px-3 text-2xs-plus text-muted-foreground data-[state=on]:bg-primary data-[state=on]:text-primary-foreground"
				>
					{tab.charAt(0).toUpperCase() + tab.slice(1)}
				</ToggleGroup.Item>
			{/each}
		</ToggleGroup.Root>
	</div>

	<div class="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
		{#each qualityMetrics as metric (metric.type)}
			<div class="min-w-0 rounded-xl bg-card p-3 ring-1 ring-foreground/10 sm:p-5">
				<div class="flex items-start justify-between gap-2">
					<div class="min-w-0">
						<h2 class="truncate text-sm font-semibold text-foreground">{metric.type}</h2>
						<p class="text-2xs text-muted-foreground tabular-nums">
							{metric.total} records
						</p>
					</div>
					<Badge
						variant="ghost"
						class="h-5 gap-1 bg-transparent px-0 text-2xs-plus font-semibold tabular-nums {metric.isPositive
							? 'text-success'
							: 'text-destructive'}"
					>
						{metric.trend}%
						{#if metric.isPositive}
							<ArrowUp class="size-3.5" />
						{:else}
							<ArrowDown class="size-3.5" />
						{/if}
					</Badge>
				</div>

				<div class="mt-4 flex items-center justify-between text-2xs-plus sm:text-xs">
					<span class="text-muted-foreground">Quality Score</span>
					<span class="font-semibold text-foreground tabular-nums">{metric.score}%</span>
				</div>
				<Progress
					value={metric.score}
					max={100}
					aria-label="{metric.type} quality score"
					class="mt-1.5 h-1.5 {metric.score >= 90
						? '[&>[data-slot=progress-indicator]]:bg-success'
						: metric.score >= 80
							? '[&>[data-slot=progress-indicator]]:bg-info'
							: metric.score >= 70
								? '[&>[data-slot=progress-indicator]]:bg-warn'
								: '[&>[data-slot=progress-indicator]]:bg-destructive'}"
				/>

				<div
					class="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-2xs-plus sm:text-xs"
				>
					<span class="text-muted-foreground">Validated</span>
					<span class="font-medium text-foreground tabular-nums">
						{metric.verified}/{metric.total}
					</span>
				</div>
			</div>
		{/each}
	</div>

	<p class="pt-2 text-center text-2xs text-muted-foreground sm:text-xs">
		Last updated: {new Date(dataCounts.lastUpdated).toLocaleString()}
	</p>
</div>
