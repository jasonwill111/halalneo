<script lang="ts">
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

	let {
		dataCounts,
		qualityMetrics
	}: { dataCounts: DataCounts; qualityMetrics: QualityMetric[] } = $props();

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
	<!-- Header -->
	<div class="flex flex-col gap-3 border-b border-border/60 pb-4 sm:flex-row sm:items-end sm:justify-between">
		<div class="min-w-0">
			<h1 class="truncate text-xl font-semibold text-foreground sm:text-2xl">
				Data Quality Dashboard
			</h1>
			<p class="mt-1 text-2xs-plus text-muted-foreground sm:text-sm">
				Real-time validation and reporting for all content types
			</p>
		</div>
		<div class="flex shrink-0 flex-wrap gap-2">
			<button
				type="button"
				class="press-scale inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-md border border-border bg-background px-2.5 text-sm font-medium whitespace-nowrap text-foreground outline-none transition-colors duration-fast select-none hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 dark:bg-input/30 dark:hover:bg-input/50"
			>
				<svg
					aria-hidden="true"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
					/>
				</svg>
				Export Report
			</button>
			<button
				type="button"
				onclick={() => window.location.reload()}
				class="press-scale inline-flex h-8 shrink-0 items-center justify-center gap-1.5 rounded-md border border-transparent bg-primary px-2.5 text-sm font-medium whitespace-nowrap text-primary-foreground outline-none transition-colors duration-fast select-none hover:bg-primary/90 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0"
			>
				<svg
					aria-hidden="true"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					viewBox="0 0 24 24"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
					/>
				</svg>
				Refresh Data
			</button>
		</div>
	</div>

	<!-- Summary tiles -->
	<div class="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
		{#each Object.keys(dataCounts) as key (key)}
			{@const metric = qualityMetrics.find(
				(m) => m.type.toLowerCase().replace(/\s+/g, '_') === key
			)}
			{#if key !== 'overall' && key !== 'lastUpdated'}
				<div
					class="min-w-0 rounded-xl bg-card p-2 ring-1 ring-foreground/10 sm:p-4"
				>
					<div class="flex items-start justify-between gap-1.5">
						<div class="flex min-w-0 items-center gap-2">
							<div
								class="flex size-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 sm:size-9"
							>
								<svg
									aria-hidden="true"
									class="size-3.5 text-primary sm:size-5"
									fill="none"
									stroke="currentColor"
									stroke-width="2"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
							</div>
							<div class="min-w-0">
								<p class="truncate text-2xs text-muted-foreground sm:text-xs">
									{key
										.replace(/_/g, ' ')
										.split(' ')
										.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
										.join(' ')}
								</p>
								<p class="truncate text-base font-bold tabular-nums text-foreground sm:text-2xl">
									{dataCounts[key]}
								</p>
							</div>
						</div>
						{#if metric}
							<span
								class="inline-flex h-5 shrink-0 items-center rounded-4xl px-1.5 text-4xs font-semibold tabular-nums {metric.score >= 80
									? 'bg-success/10 text-success'
									: metric.score >= 60
										? 'bg-warn/10 text-warn'
										: 'bg-destructive/10 text-destructive'}"
							>
								{metric.score}%
							</span>
						{/if}
					</div>
				</div>
			{/if}
		{/each}
	</div>

	<!-- Type filter (mobile: horizontal swipe, desktop: wraps) -->
	<div
		class="scrollbar-none -mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible"
		role="group"
		aria-label="Content type filter"
	>
		{#each tabOptions as tab (tab)}
			<button
				type="button"
				aria-pressed={selectedTab === tab}
				onclick={() => (selectedTab = tab)}
				class="press-scale inline-flex h-8 shrink-0 snap-start items-center justify-center rounded-4xl px-3 text-2xs-plus font-medium whitespace-nowrap outline-none transition-colors duration-fast {selectedTab === tab
					? 'bg-primary text-primary-foreground'
					: 'bg-background text-muted-foreground ring-1 ring-border hover:bg-muted hover:text-foreground dark:bg-input/30'}"
			>
				{tab.charAt(0).toUpperCase() + tab.slice(1)}
			</button>
		{/each}
	</div>

	<!-- Quality grid -->
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
					<span
						class="inline-flex shrink-0 items-center gap-1 text-2xs-plus font-semibold tabular-nums {metric.isPositive
							? 'text-success'
							: 'text-destructive'}"
					>
						{metric.trend}%
						<svg
							aria-hidden="true"
							class="size-3.5"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							viewBox="0 0 24 24"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d={metric.isPositive
									? 'M5 10l7-7m0 0l7 7m-7-7v18'
									: 'M19 14l-7 7m0 0l-7-7m7 7V3'}
							/>
						</svg>
					</span>
				</div>

				<!-- Quality score meter -->
				<div class="mt-4 flex items-center justify-between text-2xs-plus sm:text-xs">
					<span class="text-muted-foreground">Quality Score</span>
					<span class="font-semibold text-foreground tabular-nums">{metric.score}%</span>
				</div>
				<div
					class="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-muted"
					role="progressbar"
					aria-valuenow={metric.score}
					aria-valuemin={0}
					aria-valuemax={100}
					aria-label="{metric.type} quality score"
				>
					<div
						class="h-full rounded-full {metric.score >= 90
							? 'bg-success'
							: metric.score >= 80
								? 'bg-info'
								: metric.score >= 70
									? 'bg-warn'
									: 'bg-destructive'}"
						style:width={metric.score + '%'}
					></div>
				</div>

				<!-- Validation coverage -->
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

	<!-- Last updated -->
	<p class="pt-2 text-center text-2xs text-muted-foreground sm:text-xs">
		Last updated: {new Date(dataCounts.lastUpdated).toLocaleString()}
	</p>
</div>
