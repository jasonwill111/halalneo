<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { Card } from '#lib/components/ui/card/index.js';
	import {
		Accordion,
		AccordionContent,
		AccordionItem,
		AccordionTrigger
	} from '#lib/components/ui/accordion/index.js';
	import * as ToggleGroup from '#lib/components/ui/toggle-group/index.js';
	import Check from '@lucide/svelte/icons/check';
	import X from '@lucide/svelte/icons/x';

	let billing = $state('monthly');

	const plans = [
		{
			name: 'Free',
			description: 'Get started exploring',
			price: '$0',
			highlight: false,
			features: [
				{ text: '3 product listings', included: true },
				{ text: 'Basic profile', included: true },
				{ text: 'Receive inquiries', included: true },
				{ text: 'AI descriptions', included: false },
				{ text: 'Analytics', included: false }
			]
		},
		{
			name: 'Starter',
			description: 'For growing suppliers',
			price: '$49',
			highlight: false,
			features: [
				{ text: '30 product listings', included: true },
				{ text: 'Enhanced profile', included: true },
				{ text: 'AI 100/mo', included: true },
				{ text: 'Basic analytics', included: true },
				{ text: 'CSV export', included: false },
				{ text: 'Priority support', included: false }
			]
		},
		{
			name: 'Business',
			description: 'For established exporters',
			price: '$99',
			highlight: true,
			features: [
				{ text: '80 product listings', included: true },
				{ text: 'Premium profile', included: true },
				{ text: 'AI 500/mo', included: true },
				{ text: 'Full analytics + CSV', included: true },
				{ text: 'Priority support', included: true },
				{ text: 'API access', included: false },
				{ text: 'Dedicated manager', included: false }
			]
		},
		{
			name: 'Enterprise',
			description: 'For large-scale operations',
			price: '$199',
			highlight: false,
			features: [
				{ text: '200 product listings', included: true },
				{ text: 'Enterprise profile', included: true },
				{ text: 'Unlimited AI', included: true },
				{ text: 'Full analytics + API', included: true },
				{ text: 'Dedicated manager', included: true }
			]
		}
	];

	const pricingFaqs = [
		{
			q: 'Can I switch plans after signing up?',
			a: 'Yes. Upgrade or downgrade anytime. Upgrades are prorated; downgrades take effect at next billing period.'
		},
		{
			q: 'What payment methods do you accept?',
			a: 'All major credit cards, debit cards, and bank transfers. Enterprise customers can pay via invoice with NET 30 terms.'
		},
		{
			q: 'Is there a free trial for paid plans?',
			a: 'Yes — all paid plans come with a 14-day free trial. No credit card required. You will only be charged after the trial ends.'
		}
	];
</script>

<div class="max-w-2xl mx-auto mb-4">
	<h1 class="text-2xl font-semibold tracking-tight sm:text-3xl text-center">Simple, transparent pricing</h1>
	<p class="mt-1 text-sm text-muted-foreground text-center">
		Start free and grow with HalalNeo. Upgrade when you need more products, AI and analytics.
	</p>
</div>

<div class="flex justify-center mb-4">
	<div class="inline-flex items-center gap-1.5">
		<ToggleGroup.Root type="single" bind:value={billing} size="sm" variant="outline" aria-label="Billing period">
			<ToggleGroup.Item value="monthly">Monthly</ToggleGroup.Item>
			<ToggleGroup.Item value="annual">Annual</ToggleGroup.Item>
		</ToggleGroup.Root>
		<span class="ml-1 text-[10px] text-muted-foreground">Save 20%</span>
	</div>
</div>

<div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
	{#each plans as plan}
		<Card class={`relative overflow-visible ${plan.highlight ? 'border-2 border-primary' : ''} p-2.5 space-y-2`}>
			{#if plan.highlight}
				<span class="absolute -top-2.5 left-1/2 -translate-x-1/2 inline-flex items-center rounded-full bg-primary px-2 py-0.5 text-[10px] font-medium text-primary-foreground">
					Most popular
				</span>
			{/if}
			<div>
				<h3 class="font-semibold text-sm">{plan.name}</h3>
				<p class="text-[11px] text-muted-foreground">{plan.description}</p>
			</div>
			<div>
				<span class="text-lg font-bold">{plan.price}</span>
				<span class="text-muted-foreground text-[11px]">/mo</span>
			</div>
			<Button
				class="w-full"
				size="sm"
				variant={plan.highlight || plan.name !== 'Free' ? 'default' : 'outline'}
			>
				{plan.name === 'Free' ? 'Get Started' : plan.name === 'Enterprise' ? 'Contact Sales' : 'Start Free Trial'}
			</Button>
			<ul class="space-y-1 text-xs">
				{#each plan.features as feature}
					<li class="flex items-center gap-1.5">
						{#if feature.included}
							<Check class="size-3 shrink-0 text-muted-foreground"></Check>
						{:else}
							<X class="size-3 shrink-0 text-muted-foreground/50"></X>
						{/if}
						<span class={feature.included ? '' : 'text-muted-foreground/60'}>{feature.text}</span>
					</li>
				{/each}
			</ul>
		</Card>
	{/each}
</div>

<div class="mt-6 rounded-lg bg-card p-3">
	<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
		<div class="space-y-1">
			<h2 class="text-sm font-semibold">Brand URL Add-on</h2>
			<p class="text-xs text-muted-foreground">
				Custom branded page at <span class="font-medium text-foreground">halalneo.com/your-brand</span>. Showcase your full catalog and story.
			</p>
		</div>
		<div class="flex items-center gap-2 shrink-0">
			<div class="text-right">
				<span class="text-sm font-bold">$49</span>
				<span class="text-muted-foreground text-[11px]">/mo</span>
			</div>
			<Button size="sm">Add to Plan</Button>
		</div>
	</div>
</div>

<div class="mt-8 max-w-2xl mx-auto">
	<h2 class="text-sm font-semibold text-center mb-3">FAQ</h2>
	<Accordion type="single">
		{#each pricingFaqs as faq, i}
			<AccordionItem value={`faq-${i}`}>
				<AccordionTrigger class="text-xs">{faq.q}</AccordionTrigger>
				<AccordionContent class="text-[11px]">{faq.a}</AccordionContent>
			</AccordionItem>
		{/each}
	</Accordion>
</div>
