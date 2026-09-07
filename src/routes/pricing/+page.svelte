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
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';

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
			q: 'Will I be charged during supplier test mode?',
			a: 'No. While HalalNeo is in supplier test mode, all plan tiers are free. We will give every active supplier at least 30 days’ written notice before any paid plan is introduced.'
		},
		{
			q: 'How much will plans cost after test mode?',
			a: 'Pricing above is the post-test-mode standard. During test mode there is no charge, and there is no obligation to subscribe when paid plans launch.'
		},
		{
			q: 'How do I apply?',
			a: 'Click "Apply" on any tier. Applications are reviewed manually and most are processed within 1–3 business days.'
		},
		{
			q: 'What payment methods will be accepted?',
			a: 'Major credit and debit cards, plus bank transfers. Enterprise customers will be able to pay by invoice with NET 30 terms.'
		},
		{
			q: 'Can I switch plans later?',
			a: 'Yes — you can upgrade, downgrade, or cancel at any time once paid plans are live.'
		}
	];
</script>

<div class="max-w-2xl mx-auto mb-3">
	<h1 class="text-2xl font-semibold tracking-tight sm:text-3xl text-center">Simple, transparent pricing</h1>
	<p class="mt-1 text-sm text-muted-foreground text-center">
		Start free and grow with HalalNeo. Upgrade when you need more products, AI and analytics.
	</p>
</div>

<div class="mx-auto mb-3 max-w-2xl rounded-lg border border-info/30 bg-info/10 p-3">
	<div class="flex items-start gap-2.5">
		<Sparkles class="mt-0.5 size-4 shrink-0 text-info"></Sparkles>
		<div class="flex-1 space-y-1">
			<p class="text-sm font-semibold text-info">Supplier test mode — all plans free</p>
			<p class="text-xs text-foreground/80">
				HalalNeo is currently onboarding its first suppliers. Every plan tier is free during this period, including
				AI tools and analytics. Pricing below shows what plans will cost once test mode ends.
			</p>
			<a
				href="/supplier/onboarding"
				class="mt-1 inline-flex items-center gap-1 text-xs font-medium text-info underline underline-offset-2 hover:text-info/80"
			>
				Apply to list on HalalNeo
				<ArrowRight class="size-3"></ArrowRight>
			</a>
		</div>
	</div>
</div>

<div class="flex justify-center mb-3">
	<div class="inline-flex items-center gap-1.5">
		<ToggleGroup.Root type="single" bind:value={billing} size="sm" variant="outline" aria-label="Billing period">
			<ToggleGroup.Item value="monthly">Monthly</ToggleGroup.Item>
			<ToggleGroup.Item value="annual">Annual</ToggleGroup.Item>
		</ToggleGroup.Root>
		<span class="ml-1 text-[10px] text-muted-foreground">Save 20%</span>
	</div>
</div>

<p class="mb-2 text-center text-[10px] text-muted-foreground">
	Pricing shown is the post-test-mode standard. During test mode, every tier is free — no card required.
</p>

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
				<p class="text-[10px] text-success">Free during test mode</p>
			</div>
			<Button
				class="w-full"
				size="sm"
				variant={plan.highlight || plan.name !== 'Free' ? 'default' : 'outline'}
				href="/supplier/onboarding"
			>
				{plan.name === 'Enterprise' ? 'Talk to our team' : 'Apply'}
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

<div class="mt-4 rounded-lg bg-card p-3 ring-1 ring-foreground/10">
	<div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
		<div class="space-y-1">
			<h2 class="text-sm font-semibold">Brand URL Add-on</h2>
			<p class="text-xs text-muted-foreground">
				Custom branded page at <span class="font-medium text-foreground">halalneo.com/your-brand</span>. Showcase your full catalog and story.
			</p>
			<p class="text-[10px] text-success">Free during test mode</p>
		</div>
		<div class="flex items-center gap-2 shrink-0">
			<div class="text-right">
				<span class="text-sm font-bold">$49</span>
				<span class="text-muted-foreground text-[11px]">/mo</span>
			</div>
			<Button size="sm" href="/supplier/onboarding">Apply</Button>
		</div>
	</div>
</div>

<div class="mt-6 max-w-2xl mx-auto">
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
