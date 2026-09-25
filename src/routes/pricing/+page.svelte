<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
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

	let billing = $state<'monthly' | 'annual'>('monthly');

	const plans = [
		{
			name: 'Free',
			description: 'Get started exploring',
			monthly: 0,
			annual: 0,
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
			monthly: 49,
			annual: 39,
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
			monthly: 99,
			annual: 79,
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
			monthly: 199,
			annual: 159,
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

<div class="mx-auto flex max-w-6xl min-w-0 flex-col gap-3">
	<div class="mx-auto flex w-full max-w-2xl flex-col gap-1 text-center">
		<h1 class="text-xl font-semibold tracking-tight sm:text-2xl">Simple, transparent pricing</h1>
		<p class="max-w-[65ch] text-xs text-muted-foreground sm:text-sm">
			Start free and grow with HalalNeo. Upgrade when you need more products, AI and analytics.
		</p>
	</div>

	<div class="mx-auto w-full max-w-2xl min-w-0 rounded-xl border border-info/30 bg-info/10 p-3">
		<div class="flex min-w-0 items-start gap-2">
			<Sparkles class="mt-0.5 size-4 shrink-0 text-info"></Sparkles>
			<div class="flex min-w-0 flex-1 flex-col gap-1">
				<p class="text-xs font-semibold text-info sm:text-sm">
					Supplier test mode — all plans free
				</p>
				<p class="max-w-[65ch] text-xs leading-relaxed text-foreground/80">
					HalalNeo is currently onboarding its first suppliers. Every plan tier is free during this
					period, including AI tools and analytics. Pricing below shows what plans will cost once
					test mode ends.
				</p>
				<Button
					href="/supplier/onboarding"
					variant="link"
					size="xs"
					class="mt-1 self-start px-0 text-info hover:text-info/80"
				>
					Apply to list on HalalNeo
					<ArrowRight data-icon="inline-end" class="rtl:rotate-180"></ArrowRight>
				</Button>
			</div>
		</div>
	</div>

	<div class="flex w-full flex-wrap items-center justify-center gap-1.5 sm:w-auto sm:flex-nowrap">
		<ToggleGroup.Root
			type="single"
			bind:value={billing}
			size="sm"
			variant="outline"
			aria-label="Billing period"
		>
			<ToggleGroup.Item value="monthly">Monthly</ToggleGroup.Item>
			<ToggleGroup.Item value="annual">Annual</ToggleGroup.Item>
		</ToggleGroup.Root>
		<span class="text-2xs text-muted-foreground">Save 20%</span>
	</div>

	<p class="max-w-[65ch] text-center text-2xs text-muted-foreground">
		Pricing shown is the post-test-mode standard. During test mode, every tier is free — no card
		required.
	</p>

	<div class="grid min-w-0 grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-4">
		{#each plans as plan (plan.name)}
			<Card
				class={`relative min-w-0 gap-2 overflow-visible p-2.5 sm:p-3 ${plan.highlight ? 'border-2 border-primary' : ''}`}
			>
				{#if plan.highlight}
					<Badge class="absolute start-1/2 -top-2.5 -translate-x-1/2 px-2 text-2xs">
						Most popular
					</Badge>
				{/if}
				<div class="min-w-0">
					<h3 class="truncate text-sm font-semibold">{plan.name}</h3>
					<p class="text-2xs text-muted-foreground">{plan.description}</p>
				</div>
				<div class="flex min-w-0 flex-wrap items-baseline gap-x-1">
					<span class="text-base font-bold tabular-nums sm:text-lg">
						${billing === 'annual' ? plan.annual : plan.monthly}
					</span>
					<span class="text-2xs text-muted-foreground">/mo</span>
					{#if billing === 'annual' && plan.monthly > 0}
						<Badge variant="outline" class="h-4 px-1.5 text-2xs text-success">
							Save {Math.round((1 - plan.annual / plan.monthly) * 100)}%
						</Badge>
					{/if}
				</div>
				<div class="flex flex-col gap-0.5">
					{#if billing === 'annual' && plan.monthly > 0}
						<p class="text-2xs text-muted-foreground">billed annually</p>
					{/if}
					<p class="text-2xs text-success">Free during test mode</p>
				</div>
				<Button
					class="w-full"
					size="sm"
					variant={plan.highlight || plan.name !== 'Free' ? 'default' : 'outline'}
					href="/supplier/onboarding"
				>
					{plan.name === 'Enterprise' ? 'Talk to our team' : 'Apply'}
				</Button>
				<ul class="flex flex-col gap-1 text-2xs sm:text-xs">
					{#each plan.features as feature (feature.text)}
						<li class="flex min-w-0 items-start gap-1.5">
							{#if feature.included}
								<Check class="mt-0.5 size-3 shrink-0 text-muted-foreground"></Check>
							{:else}
								<X class="mt-0.5 size-3 shrink-0 text-muted-foreground/50"></X>
							{/if}
							<span
								class={`min-w-0 break-words ${feature.included ? '' : 'text-muted-foreground/60'}`}
							>
								{feature.text}
							</span>
						</li>
					{/each}
				</ul>
			</Card>
		{/each}
	</div>

	<div class="min-w-0 rounded-xl bg-card p-3 ring-1 ring-foreground/10">
		<div class="flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
			<div class="flex min-w-0 flex-col gap-0.5">
				<h2 class="text-sm font-semibold">Brand URL Add-on</h2>
				<p class="max-w-[65ch] text-xs text-muted-foreground">
					Custom branded page at <span class="font-medium text-foreground"
						>halalneo.com/your-brand</span
					>. Showcase your full catalog and story.
				</p>
				<p class="text-2xs text-success">Free during test mode</p>
			</div>
			<div class="flex shrink-0 items-center gap-2">
				<div class="text-end">
					<span class="text-sm font-bold tabular-nums">$49</span>
					<span class="text-2xs text-muted-foreground">/mo</span>
				</div>
				<Button size="sm" href="/supplier/onboarding">Apply</Button>
			</div>
		</div>
	</div>

	<div class="mx-auto flex w-full max-w-2xl min-w-0 flex-col gap-2">
		<h2 class="text-center text-sm font-semibold">FAQ</h2>
		<Accordion type="single">
			{#each pricingFaqs as faq (faq.q)}
				<AccordionItem value={faq.q}>
					<AccordionTrigger class="px-3 py-2 text-xs sm:py-2.5 sm:text-sm">{faq.q}</AccordionTrigger
					>
					<AccordionContent class="px-3 pb-2 text-xs leading-relaxed sm:text-sm"
						>{faq.a}</AccordionContent
					>
				</AccordionItem>
			{/each}
		</Accordion>
	</div>
</div>
