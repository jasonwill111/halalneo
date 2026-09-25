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
			tone: 'bg-teal/10 text-teal',
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
			tone: 'bg-gold/10 text-gold',
			name: 'HalalNeo AI',
			desc: 'Plain-language answers grounded in certifier data. In preparation.',
			badge: 'Soon'
		}
	];
</script>

<svelte:head>
	{@html `\u003cscript type="application/ld+json">${JSON.stringify(data.itemList ?? {})}\u003c/script>`}
</svelte:head>

<Breadcrumb items={[{ label: 'Tools', href: '/tools' }]} />

<section class="mx-auto flex w-full max-w-7xl min-w-0 flex-col gap-3 sm:gap-4">
	<div class="flex min-w-0 flex-col gap-1.5">
		<div class="flex items-center gap-2 text-xs font-medium text-muted-foreground sm:text-sm">
			<Wrench class="size-4" />
			Halal Trade Tools
		</div>
		<h1 class="max-w-3xl text-xl font-semibold tracking-tight sm:text-2xl">
			Free tools for halal buyers
		</h1>
		<p class="max-w-[65ch] text-xs text-muted-foreground sm:text-sm">
			Estimate costs, check compliance and draft sourcing documents — no account needed.
		</p>
	</div>

	<div class="grid min-w-0 grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
		{#each tools as tool (tool.href)}
			<a href={localizeHref(tool.href)} class="group h-full min-w-0">
				<Card
					class="press-scale h-full min-w-0 overflow-hidden p-2.5 transition-[transform,box-shadow] duration-base ease-spring hover:-translate-y-0.5 hover:shadow-md sm:p-3"
				>
					<CardContent class="flex flex-col gap-2 p-0 sm:gap-2.5">
						<div class="flex min-w-0 items-center justify-between gap-1.5">
							<div
								class={`flex size-8 shrink-0 items-center justify-center rounded-lg sm:size-9 ${tool.tone}`}
							>
								<tool.icon class="size-4" />
							</div>
							<Badge
								variant={tool.badge === 'Live' ? 'secondary' : 'outline'}
								class="max-w-full shrink-0 truncate text-2xs"
							>
								{tool.badge}
							</Badge>
						</div>
						<div class="min-w-0">
							<h2
								class="flex min-w-0 items-start gap-1 text-xs font-semibold transition-colors group-hover:text-primary sm:text-sm"
							>
								<span class="line-clamp-2 min-w-0">{tool.name}</span>
								<ArrowUpRight
									class="mt-0.5 size-3.5 shrink-0 text-muted-foreground transition-colors group-hover:text-primary"
								/>
							</h2>
							<p
								class="mt-0.5 line-clamp-2 hidden text-xs leading-relaxed text-muted-foreground sm:block"
							>
								{tool.desc}
							</p>
						</div>
					</CardContent>
				</Card>
			</a>
		{/each}
	</div>
</section>
