<script lang="ts">
	let { dataCounts, qualityMetrics }: { dataCounts: any; qualityMetrics: any } = $props();
	
	let selectedTab = $state('all');
	const tabOptions = ['all', 'suppliers', 'products', 'market_guides', 'success_stories', 'promotions'];
	
	// Calculate quality score based on field completeness
	function calcQualityScore(date: string): number {
		// Placeholder for actual scoring logic
		return Math.floor(Math.random() * 20) + 80;
	}
	
	// Get quality trend for a type
	function getQualityTrend(type: string): { score: number; isPositive: boolean } {
		const base = Math.floor(Math.random() * 30) + 70;
		return { score: base, isPositive: Math.random() > 0.5 };
	}
</script>

<div class="admin-dashboard-container">
	<!-- Header -->
	<div class="admin-dashboard-header">
		<div>
			<h1 class="text-2xl font-semibold text-foreground">Data Quality Dashboard</h1>
			<p class="text-sm text-muted-foreground mt-1">
				Real-time validation and reporting for all content types
			</p>
		</div>
		<div class="flex gap-2">
			<button class="btn-outline">
				<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
				</svg>
				Export Report
			</button>
			<button class="btn-primary" onclick={window.location.reload()}>
				<svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
				</svg>
				Refresh Data
			</button>
		</div>
	</div>

	<!-- Summary Cards -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
		{#each Object.keys(dataCounts) as key}
			{#if key !== 'overall' && key !== 'lastUpdated'}
			<div class="card hover:shadow-lg transition-shadow">
				<div class="card-content">
					<div class="flex items-center justify-between">
						<div class="flex items-center gap-3">
							<div class="p-2 bg-primary/10 rounded-lg">
								<svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<div>
								<p class="text-sm font-medium text-muted-foreground">
									{key.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
								</p>
								<p class="text-2xl font-bold text-foreground">{dataCounts[key]}</p>
							</div>
						</div>
						{#if qualityMetrics[key]}
							<span class={`badge ${qualityMetrics[key] >= 80 ? 'badge-success' : qualityMetrics[key] >= 60 ? 'badge-warning' : 'badge-danger'}`}>
								{qualityMetrics[key]}%
							</span>
						{/if}
					</div>
				</div>
			</div>
			{/if}
		{/each}
	</div>

	<!-- Tabs -->
	<div class="tabs">
		{#each tabOptions as tab}
			<button
				class={`tab ${selectedTab === tab ? 'active' : ''}`}
				onclick={() => selectedTab = tab}
			>
				{tab.charAt(0).toUpperCase() + tab.slice(1)}
			</button>
		{/each}
	</div>

	<!-- Quality Grid -->
	<div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
		{#each qualityMetrics as metric}
			<div class="card">
				<div class="card-content">
					<div class="flex items-center justify-between mb-4">
						<div>
							<h3 class="font-medium text-foreground">{metric.type}</h3>
							<p class="text-sm text-muted-foreground">
								{metric.total} records
							</p>
						</div>
						<div class="flex items-center gap-2">
							<span class={metric.isPositive ? 'text-success' : 'text-danger'}>
								{metric.trend}%
							</span>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={metric.isPositive ? 'M5 10l7-7m0 0l7 7m-7-7v18' : 'M19 14l-7 7m0 0l-7-7m7 7V3'} />
							</svg>
						</div>
					</div>
					
					<!-- Quality Score -->
					<div class="flex items-center justify-between mb-2">
						<span class="text-sm text-muted-foreground">Quality Score</span>
						<span class="text-sm font-semibold text-foreground">{metric.score}%</span>
					</div>
					<div class="w-full bg-muted rounded-full h-2">
						<div 
							class="transition-all rounded-full"
							style:width={metric.score + '%'}
							style:background-color={
							metric.score >= 90 ? 'var(--success)' :
							metric.score >= 80 ? 'var(--info)' :
							metric.score >= 70 ? 'var(--warn)' :
							'var(--destructive)'
							}
						></div>
					</div>
					
					<!-- Validation Errors -->
					<div class="mt-4 pt-4 border-t border-border">
						<div class="flex items-center justify-between text-sm">
							<span class="text-muted-foreground">Validated</span>
							<span class="text-foreground font-medium">
								{metric.validated}/{metric.total}
							</span>
						</div>
					</div>
				</div>
			</div>
		{/each}
	</div>

	<!-- Last Updated -->
	<div class="mt-6 text-sm text-muted-foreground text-center">
		Last updated: {new Date(dataCounts.lastUpdated).toLocaleString()}
	</div>
</div>

<style>
	:global(.admin-dashboard-container) {
		max-width: 1280px;
		margin: 0 auto;
		padding: 24px;
	}
	
	:global(.admin-dashboard-header) {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 24px;
		padding-bottom: 16px;
		border-bottom: 1px solid var(--border);
	}
	
	:global(.btn-primary) {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 16px;
		background-color: var(--primary);
		color: var(--primary-foreground);
		border: none;
		border-radius: var(--radius);
		font-size: 14px;
		cursor: pointer;
		transition: opacity 0.2s;
	}
	
	:global(.btn-primary:hover) {
		opacity: 0.9;
	}
	
	:global(.btn-outline) {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 16px;
		background-color: transparent;
		color: var(--foreground);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		font-size: 14px;
		cursor: pointer;
		transition: background-color 0.2s;
	}
	
	:global(.btn-outline:hover) {
		background-color: var(--muted);
	}
	
	:global(.icon) {
		width: 16px;
		height: 16px;
	}
	
	:global(.badge) {
		padding: 4px 8px;
		border-radius: var(--radius);
		font-size: 12px;
		font-weight: 500;
	}
	
	:global(.badge-success) {
		background-color: rgba(34, 197, 94, 0.1);
		color: rgb(34, 197, 94);
	}
	
	:global(.badge-warning) {
		background-color: rgba(249, 115, 22, 0.1);
		color: rgb(249, 115, 22);
	}
	
	:global(.badge-danger) {
		background-color: rgba(239, 68, 68, 0.1);
		color: rgb(239, 68, 68);
	}
	
	:global(.tmp-tabs) {
		display: flex;
		gap: 16px;
		margin-bottom: 24px;
		border-bottom: 1px solid var(--border);
		padding-bottom: 16px;
	}
	
	:global(.tmp-tab) {
		padding: 8px 16px;
		border: none;
		background: transparent;
		font-size: 14px;
		color: var(--muted-foreground);
		cursor: pointer;
		transition: color 0.2s;
		bottom: -1px;
		border-bottom: 2px solid transparent;
	}
	
	:global(.tmp-tab:hover) {
		color: var(--foreground);
	}
	
	:global(.tmp-tab.active) {
		color: var(--primary);
		border-bottom-color: var(--primary);
	}
	
	:global(.tmp-card) {
		background-color: var(--card);
		border: 1px solid var(--border);
		border-radius: var(--radius);
		overflow: hidden;
		transition: box-shadow 0.2s;
	}
	
	:global(.tmp-card) {
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
	}
	
	:global(.tmp-card:hover) {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}
	
	:global(.tmp-card-content) {
		padding: 20px;
	}
	
	:global(.tmp-gradient) {
		overflow: hidden;
	}
	
	:global(.tmp-progress) {
		transition: width 0.3s ease-out;
	}
</style>
