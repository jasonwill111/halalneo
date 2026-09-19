<script lang="ts">
	import { Card, CardContent, CardHeader, CardTitle } from '#lib/components/ui/card/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import FileTextIcon from '@lucide/svelte/icons/file-text';
	import DownloadIcon from '@lucide/svelte/icons/download';

	const templates = [
		{
			id: 'supplier-list',
			title: 'Supplier List Template',
			description: 'Export-ready list of halal suppliers with certification status',
			fields: ['supplierName', 'certifier', 'certificateNumber', 'scope', 'country', 'products'],
			format: 'xlsx'
		},
		{
			id: 'product-catalog',
			title: 'Halal Product Catalog',
			description: 'Structured product listings for halal-compliant items',
			fields: ['productName', 'supplier', 'certStatus', 'ingredients', 'packaging', 'origin'],
			format: 'xlsx'
		},
		{
			id: 'rfq-template',
			title: 'RFQ Template',
			description: 'Request for Quotation for halal products',
			fields: ['product', 'quantity', 'specifications', 'certificationRequirements'],
			format: 'docx'
		},
		{
			id: 'certificate-checklist',
			title: 'Certificate Verification Checklist',
			description: 'Due diligence checklist for halal certificates',
			fields: ['certificateNumber', 'certifier', 'issueDate', 'expiryDate', 'scope', 'verificationSteps'],
			format: 'pdf'
		},
		{
			id: 'import-documents',
			title: 'Import Documentation Checklist',
			description: 'Required documents for halal food imports',
			fields: ['invoice', 'billOfLading', 'certificate', 'labelApproval', 'customsForms'],
			format: 'pdf'
		}
	];

	function downloadTemplate(templateId: string) {
		const template = templates.find(t => t.id === templateId);
		if (!template) return;

		const content = JSON.stringify({ id: templateId, fields: template.fields }, null, 2);
		const blob = new Blob([content], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${template.title}.json`;
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<Breadcrumb items={[{ label: 'Export Docs', href: '/export-docs' }]} />

<section class="space-y-4 sm:space-y-6">
	<div class="max-w-2xl space-y-2">
		<div class="flex items-center gap-2 text-sm font-medium text-muted-foreground">
			<FileTextIcon class="size-4" />
			Export Docs
		</div>
		<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Halal trade documentation templates</h1>
		<p class="text-muted-foreground">
			Download ready-to-use templates for suppliers, importers, and certifying bodies.
		</p>
	</div>

	<div class="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
		{#each templates as template (template.id)}
			<Card class="group hover:shadow-md transition-shadow p-3 sm:p-4">
				<CardHeader class="p-4 sm:p-3 sm:pt-4">
					<CardTitle class="truncate text-sm font-medium">{template.title}</CardTitle>
					<p class="mt-1 text-xs text-muted-foreground line-clamp-2">
						{template.description}
					</p>
				</CardHeader>
				<CardContent class="px-4 pb-4 sm:px-3 sm:pb-3">
					<Button
						size="sm"
						class="w-full justify-start text-xs"
						onclick={() => downloadTemplate(template.id)}
					>
						<DownloadIcon class="size-3 mr-1.5" />
						Download
						<span class="ml-auto text-muted-foreground">.{template.format}</span>
					</Button>
				</CardContent>
			</Card>
		{/each}
	</div>
</section>