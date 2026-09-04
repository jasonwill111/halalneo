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
	import { Input } from '#lib/components/ui/input/index.js';

	type Faq = { q: string; a: string };
	let search = $state('');

	const filteredFaqs = $derived(
		search.trim()
			? faqs.filter(
					(f) =>
						f.q.toLowerCase().includes(search.toLowerCase()) ||
						f.a.toLowerCase().includes(search.toLowerCase())
				)
			: faqs
	);

	const faqs: Faq[] = [
		{
			q: "What makes a supplier 'verified'?",
			a: 'Every supplier on HalalNeo holds a halal certificate issued by a recognised certifying body (e.g. JAKIM, BPJPH, MUIS, SFDA, MOIAT, IFANCA). Each profile shows the certifying body, the standard it certifies against and the scope of the certificate, so you can check it applies to the exact product you are buying.'
		},
		{
			q: 'Which certifying bodies does HalalNeo recognise?',
			a: 'We primarily recognise certificates issued under the major national and multilateral systems: JAKIM (Malaysia), BPJPH/MUI (Indonesia), MUIS (Singapore), SFDA (Saudi Arabia), MOIAT (UAE), IFANCA (US), GIMDES (Türkiye) and SANHA (South Africa), among others.'
		},
		{
			q: 'Is HalalNeo itself a certifying body?',
			a: "No. HalalNeo is a marketplace and trade-intelligence platform. Certification is always issued independently by the listed certifying bodies. We publish the certificate details on each supplier's profile so buyers can verify claims against the issuing body before purchase."
		},
		{
			q: 'How do I confirm a certificate is valid?',
			a: 'Check three things on the supplier profile: the certifying body, the standard (e.g. MS 1500:2019) and the certificate scope and expiry. For critical orders, contact the issuing body directly —most publish a public verification lookup.'
		},
		{
			q: 'Do you vet product ingredients or manufacturing sites?',
			a: 'We publish the certificate scope as issued by the certifying body. Whether a specific product falls within that scope is ultimately a matter between the buyer, supplier and certifying body. The knowledge base explains exactly how to read a scope.'
		},
		{
			q: 'Is HalalNeo free to use?',
			a: 'Yes. Browsing suppliers, products and the knowledge base is free. Buyer accounts —shortlisting and messaging suppliers —are free. Supplier listing is by invitation; contact us to be considered.'
		},
		{
			q: 'How do I get in touch with a supplier?',
			a: 'Each product and supplier profile includes a request-information option. Register as a buyer to build a shortlist and contact suppliers directly.'
		},
		{
			q: 'Is the product data on this site real?',
			a: 'Certifying bodies and certification standards referenced on HalalNeo are real and current. Supplier and product listings are illustrative examples to demonstrate the platform. Always verify directly with the certifying body before entering into any commercial agreement.'
		}
	];

	const faqSchema = {
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		mainEntity: faqs.map((faq) => ({
			'@type': 'Question',
			name: faq.q,
			acceptedAnswer: {
				'@type': 'Answer',
				text: faq.a
			}
		}))
	};
</script>

<svelte:head>
	{@html `<script type="application/ld+json">${JSON.stringify({
		'@context': 'https://schema.org',
		'@type': 'FAQPage',
		'name': 'FAQ — HalalNeo',
		'description': 'Frequently asked questions about halal certification, supplier verification and how HalalNeo works for buyers and suppliers.',
		'url': 'https://halalneo.com/faq',
		mainEntity: faqs.map((faq) => ({
			'@type': 'Question',
			name: faq.q,
			acceptedAnswer: {
				'@type': 'Answer',
				text: faq.a
			}
		}))
	})}</script>`}
</svelte:head>

<Breadcrumb items={[{ label: 'FAQ', href: '/faq' }]} />

<section class="mx-auto max-w-3xl space-y-6">
	<div class="rounded-xl bg-card p-6 text-center space-y-4">
		<h2 class="text-lg font-semibold">How can we help?</h2>
		<div class="relative mx-auto max-w-md">
			<SearchIcon class="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
			<Input
				type="search"
				placeholder="Search questions..."
				class="pl-9"
				bind:value={search}
			/>
		</div>
	</div>

	<div class="space-y-2 text-center">
		<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Frequently asked questions</h1>
		<p class="text-muted-foreground">
			Everything buyers ask us about certification, verification and how HalalNeo works.
		</p>
	</div>

	<Accordion type="multiple">
		{#each filteredFaqs as faq, i}
			<AccordionItem value={String(i)}>
				<AccordionTrigger>{faq.q}</AccordionTrigger>
				<AccordionContent>{faq.a}</AccordionContent>
			</AccordionItem>
		{/each}
	</Accordion>

	<div class="rounded-xl border border-border p-6 text-center">
		<MessageCircle class="mx-auto size-7 text-primary" data-icon="header" />
		<h2 class="mt-3 text-lg font-semibold">Still have a question?</h2>
		<p class="mt-1 text-sm text-muted-foreground">
			Talk to our team —we reply within one business day.
		</p>
		<div class="mt-4">
			<Button href={localizeHref('/contact')} variant="outline">Contact us</Button>
		</div>
	</div>
</section>
