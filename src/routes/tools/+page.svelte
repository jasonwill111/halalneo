<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Card, CardContent } from '#lib/components/ui/card/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import FlaskConical from '@lucide/svelte/icons/flask-conical';
	import Calculator from '@lucide/svelte/icons/calculator';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import FileText from '@lucide/svelte/icons/file-text';
	import Bot from '@lucide/svelte/icons/bot';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import Wrench from '@lucide/svelte/icons/wrench';

	let { data } = $props();

	const tools = [
		{
			href: '/tools/ingredient-checker',
			icon: FlaskConical,
			tone: 'bg-info/10 text-info',
			name: 'Ingredient Checker',
			desc: 'Paste any ingredient list and get an AI halal, haram or mashbooh verdict per ingredient.',
			badge: 'Live'
		},
		{
			href: '/tools/certification-cost',
			icon: Calculator,
			tone: 'bg-warn/10 text-warn',
			name: 'Certification Cost Estimator',
			desc: 'Estimate halal certification cost and timeline by certifier, category and company size.',
			badge: 'Live'
		},
		{
			href: '/tools/landed-cost',
			icon: Calculator,
			tone: 'bg-success/10 text-success',
			name: 'Landed Cost Calculator',
			desc: 'CIF, duty, VAT, clearance and amortised certification cost — true per-unit cost per shipment.',
			badge: 'New'
		},
		{
			href: '/tools/rfq-builder',
			icon: FileText,
			tone: 'bg-accent-purple/10 text-accent-purple',
			name: 'RFQ Builder',
			desc: 'Assemble a halal-ready request for quotation with cert, label and document requirements.',
			badge: 'New'
		},
		{
			href: '/verify',
			icon: ShieldCheck,
			tone: 'bg-primary/10 text-primary',
			name: 'Verify Certificate',
			desc: 'Check a halal certificate number against supplier and product records.',
			badge: 'Live'
		},
		{
			href: '/tools/ai-chat',
			icon: Bot,
			tone: 'bg-accent-rose/10 text-accent-rose',
			name: 'HalalNeo AI',
			desc: 'Plain-language answers grounded in certifier data. In preparation.',
			badge: 'Soon'
		}
	];
</script>

<svelte:head>
	<!-- Title + description render once via root layout from loader `seo`. -->
</svelte:head>

<Breadcrumb items={[{ label: 'Tools', href: '/tools' }]} />

<section class="space-y-4 sm:space-y-6">
	<div class="max-w-2xl space-y-2">
		<div class="flex items-center gap-2 text-sm font-medium text-muted-foreground">
			<Wrench class="size-4" />
			Halal Trade Tools
		</div>
		<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Free tools for halal buyers</h1>
		<p class="text-muted-foreground">
			Estimate costs, check compliance and draft sourcing documents — no account needed.
		</p>
	</div>

		<div class="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
		{#each tools as tool}
			<a href={localizeHref(tool.href)} class="group h-full">
				<Card class="h-full p-3 transition-all hover:shadow-md hover:-translate-y-0.5 sm:p-4">
					<CardContent class="space-y-2 p-0 sm:space-y-2.5">
						<div class="flex items-center justify-between">
							<div class={`flex size-8 items-center justify-center rounded-lg sm:size-9 ${tool.tone}`}>
								<tool.icon class="size-4" />
							</div>
							<Badge variant={tool.badge === 'Live' ? 'secondary' : 'outline'} class="text-[10px]">
								{tool.badge}
							</Badge>
						</div>
						<div>
							<h2 class="flex items-center gap-1 text-xs font-semibold transition-colors group-hover:text-primary sm:text-sm">
								{tool.name}
								<ArrowUpRight class="size-3.5 text-muted-foreground transition-colors group-hover:text-primary" />
							</h2>
							<p class="mt-0.5 line-clamp-2 text-[11px] leading-snug text-muted-foreground sm:text-xs sm:leading-relaxed">{tool.desc}</p>
						</div>
					</CardContent>
				</Card>
			</a>
		{/each}
	</div>
</section>
