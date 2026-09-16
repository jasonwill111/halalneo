<script lang="ts">
	import QualityDashboard from '$lib/components/admin/quality-dashboard.svelte';
	import type { PageData } from './$types';
	
	export let data: PageData;
	
	// Mock data for demonstration - will be replaced with real data from database
	const mockDataCounts = {
		overall: 'Excellent',
		lastUpdated: Date.now(),
		suppliers: 16,
		products: 25,
		market_guides: 16,
		success_stories: 5,
		promotions: 5,
		certifying_bodies: 8,
		categories: 10,
		service_providers: 12,
		knowledge_base: 20,
		page_views: 1500
	};
	
	const mockQualityMetrics = [
		{ 
			type: 'Suppliers', 
			score: 88, 
			trend: 12, 
			isPositive: true,
			verified: 14,
			total: 16 
		},
		{ 
			type: 'Products', 
			score: 92, 
			trend: 5, 
			isPositive: true,
			verified: 23,
			total: 25 
		},
		{ 
			type: 'Market Guides', 
			score: 95, 
			trend: 8, 
			isPositive: true,
			verified: 15,
			total: 16 
		},
		{ 
			type: 'Success Stories', 
			score: 78, 
			trend: -2, 
			isPositive: false,
			verified: 4,
			total: 5 
		},
		{ 
			type: 'Promotions', 
			score: 85, 
			trend: 15, 
			isPositive: true,
			verified: 4,
			total: 5 
		},
		{ 
			type: 'Certifying Bodies', 
			score: 100, 
			trend: 0, 
			isPositive: true,
			verified: 8,
			total: 8 
		}
	];
	
	// Function to fetch real quality metrics
	async function refreshData() {
		const response = await fetch('/api/admin/quality');
		if (response.ok) {
			const data = await response.json();
			// Update dataCounts and qualityMetrics with real data
		}
	}
</script>

<QualityDashboard 
	svelte:target={document.body}
	dataCounts={mockDataCounts}
	qualityMetrics={mockQualityMetrics}
	onrefresh={refreshData}
/>
