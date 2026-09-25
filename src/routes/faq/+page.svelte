<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import {
		Accordion,
		AccordionContent,
		AccordionItem,
		AccordionTrigger
	} from '#lib/components/ui/accordion/index.js';
	import MessageCircle from '@lucide/svelte/icons/message-circle';
	import SearchIcon from '@lucide/svelte/icons/search';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import FilterPills from '#lib/components/site/filter-pills.svelte';
	import { Input } from '#lib/components/ui/input/index.js';

	type Faq = { q: string; a: string; category: string };
	let search = $state('');
	let category = $state('All');

	const faqs: Faq[] = [
		{
			q: "What makes a supplier 'verified'?",
			category: 'Certification',
			a: 'Every supplier on HalalNeo holds a halal certificate issued by a recognised certifying body (e.g. JAKIM, BPJPH, MUIS, SFDA, MOIAT, IFANCA). Each profile shows the certifying body, the standard it certifies against and the scope of the certificate, so you can check it applies to the exact product you are buying.'
		},
		{
			q: 'Which certifying bodies does HalalNeo recognise?',
			category: 'Certification',
			a: 'We primarily recognise certificates issued under the major national and multilateral systems: JAKIM (Malaysia), BPJPH/MUI (Indonesia), MUIS (Singapore), SFDA (Saudi Arabia), MOIAT (UAE), IFANCA (US), GIMDES (Türkiye) and SANHA (South Africa), among others.'
		},
		{
			q: 'Is HalalNeo itself a certifying body?',
			category: 'General',
			a: "No. HalalNeo is a marketplace and trade-intelligence platform. Certification is always issued independently by the listed certifying bodies. We publish the certificate details on each supplier's profile so buyers can verify claims against the issuing body before purchase."
		},
		{
			q: 'How do I confirm a certificate is valid?',
			category: 'Certification',
			a: 'Check three things on the supplier profile: the certifying body, the standard (e.g. MS 1500:2019) and the certificate scope and expiry. For critical orders, contact the issuing body directly —most publish a public verification lookup.'
		},
		{
			q: 'Do you vet product ingredients or manufacturing sites?',
			category: 'Sourcing',
			a: 'We publish the certificate scope as issued by the certifying body. Whether a specific product falls within that scope is ultimately a matter between the buyer, supplier and certifying body. The knowledge base explains exactly how to read a scope.'
		},
		{
			q: 'Is HalalNeo free to use?',
			category: 'General',
			a: 'Yes. Browsing suppliers, products and the knowledge base is free. Buyer accounts — shortlisting and messaging suppliers — are free. While we are in supplier test mode, every supplier plan tier is also free. We will give every active supplier at least 30 days’ notice before any paid plan is introduced.'
		},
		{
			q: 'How can my company become a supplier on HalalNeo?',
			category: 'Account',
			a: 'Apply through our supplier onboarding form. We will review your company details, country and halal certification. Most applications are processed within 1–3 business days.'
		},
		{
			q: 'How do I get in touch with a supplier?',
			category: 'Sourcing',
			a: 'Each product and supplier profile includes a request-information option. Register as a buyer to build a shortlist and contact suppliers directly.'
		},
		{
			q: 'Is the product data on this site real?',
			category: 'General',
			a: 'Certifying bodies and certification standards referenced on HalalNeo are real and current. Supplier and product listings are illustrative examples to demonstrate the platform. Always verify directly with the certifying body before entering into any commercial agreement.'
		}
	];

	const categories = $derived(['All', ...new Set(faqs.map((f) => f.category))]);

	const filterOptions = $derived(
		categories.map((c) => ({
			value: c,
			label: c,
			count: c === 'All' ? faqs.length : faqs.filter((f) => f.category === c).length
		}))
	);

	const filteredFaqs = $derived(
		faqs.filter(
			(f) =>
				(category === 'All' || f.category === category) &&
				(!search.trim() ||
					f.q.toLowerCase().includes(search.toLowerCase()) ||
					f.a.toLowerCase().includes(search.toLowerCase()))
		)
	);

	// Single source of truth: the inline svelte:head block below renders the FAQPage schema.
</script>

<svelte:head>
	{@html `\u003cscript type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		name: 'FAQ — HalalNeo',
		description:
			'Frequently asked questions about halal certification, supplier verification and how HalalNeo works for buyers and suppliers.',
		url: 'https://halalneo.com/faq',
		mainEntity: faqs.map((faq) => ({
			'@type': 'Question',
			name: faq.q,
			acceptedAnswer: {
				'@type': 'Answer',
				text: faq.a
			}
		}))
	})}\u003c/script>`}
</svelte:head>

<Breadcrumb items={[{ label: 'FAQ', href: '/faq' }]} />

<section class="mx-auto flex w-full max-w-7xl flex-col gap-4 sm:gap-6">
	<div class="mx-auto flex w-full max-w-2xl flex-col gap-1.5 text-center">
		<h1 class="text-xl font-semibold tracking-tight text-pretty sm:text-2xl">
			Frequently asked questions
		</h1>
		<p
			class="mx-auto max-w-[60ch] text-xs leading-relaxed text-pretty text-muted-foreground sm:text-sm"
		>
			Everything buyers ask us about certification, verification and how HalalNeo works.
		</p>
	</div>

	<div
		class="mx-auto flex w-full max-w-2xl flex-col gap-2.5 rounded-xl bg-card p-3 text-center sm:p-4"
	>
		<h2 class="text-sm font-semibold sm:text-base">How can we help?</h2>
		<div class="relative mx-auto w-full max-w-md">
			<SearchIcon class="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
			<Input type="search" placeholder="Search questions..." class="ps-9" bind:value={search} />
		</div>
	</div>

	<div class="overflow-x-auto pb-1 sm:flex sm:justify-center sm:overflow-visible sm:pb-0">
		<FilterPills
			options={filterOptions}
			bind:value={category}
			ariaLabel="Filter questions by category"
			class="w-max min-w-full justify-start sm:w-auto sm:min-w-0 sm:justify-center"
		/>
	</div>

	<div class="w-full max-w-[65ch]">
		<Accordion type="multiple" class="w-full">
			{#each filteredFaqs as faq (faq.q)}
				<AccordionItem value={faq.q} class="px-2 sm:px-3">
					<AccordionTrigger class="min-h-11 text-pretty sm:min-h-10">{faq.q}</AccordionTrigger>
					<AccordionContent class="text-pretty">{faq.a}</AccordionContent>
				</AccordionItem>
			{/each}
		</Accordion>
	</div>

	<div
		class="mx-auto flex w-full max-w-md flex-col gap-2 rounded-xl border border-border p-3 text-center sm:p-4"
	>
		<MessageCircle class="mx-auto size-6 text-primary" data-icon="header" />
		<h2 class="text-sm font-semibold sm:text-base">Still have a question?</h2>
		<p class="text-xs leading-relaxed text-muted-foreground">
			Talk to our team —we reply within one business day.
		</p>
		<div class="mt-1">
			<Button href={localizeHref('/contact')} variant="outline" class="w-full sm:w-auto"
				>Contact us</Button
			>
		</div>
	</div>
</section>
