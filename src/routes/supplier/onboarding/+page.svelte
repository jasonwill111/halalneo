<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/field/index.js';
	import { Card, CardContent } from '#lib/components/ui/card/index.js';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import Globe from '@lucide/svelte/icons/globe';
	import BarChart3 from '@lucide/svelte/icons/bar-chart-3';
	import Users from '@lucide/svelte/icons/users';

	const benefits = [
		{ icon: Globe, title: 'Global buyer reach', desc: 'Connect with certified buyers across ASEAN, Gulf and Europe.', color: 'bg-info/10 text-info' },
		{ icon: ShieldCheck, title: 'Certification trust', desc: 'Showcase verified halal certificates buyers can check.', color: 'bg-success/10 text-success' },
		{ icon: BarChart3, title: 'Sales analytics', desc: 'Track inquiries, product views and market demand.', color: 'bg-warn/10 text-warn' },
		{ icon: Users, title: 'Direct inquiries', desc: 'Receive qualified RFQs directly in your dashboard.', color: 'bg-accent-purple/10 text-accent-purple' }
	];

	const steps = ['Company info', 'Verification', 'Approval'];
	let step = $state(1);
	let sending = $state(false);
	let submitError = $state('');

	let company = $state('');
	let country = $state('');
	let bizType = $state('');
	let products = $state('');
	let email = $state('');
	let cert = $state('');
	let regNo = $state('');
	let website = $state('');

	const canContinue = $derived(
		step === 1 ? company.trim() !== '' && country.trim() !== '' : true
	);

	async function next() {
		submitError = '';
		if (step < 3) {
			step += 1;
			return;
		}
		if (step > 3 || sending) return;
		if (!email.trim()) {
			submitError = 'Please add a contact email so we can follow up.';
			step = 1;
			return;
		}
		sending = true;
		try {
			const res = await fetch('/api/inquiries', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					buyerSlug: email.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
					supplierSlug: 'supplier-application',
					subject: `[Supplier Application] ${company.trim()}`,
					message: `Company: ${company.trim()}\nCountry: ${country.trim()}\nType: ${bizType.trim()}\nProducts: ${products.trim()}\nEmail: ${email.trim()}\nCertification: ${cert.trim()}\nReg No: ${regNo.trim()}\nWebsite: ${website.trim()}`
				})
			});
			if (!res.ok) throw new Error('submit failed');
			step = 4;
		} catch {
			submitError = 'Could not submit. Please try again.';
		} finally {
			sending = false;
		}
	}
</script>

<svelte:head>
	<title>Become a Supplier — HalalNeo</title>
	<meta name="description" content="Apply to list your halal-certified products on HalalNeo and reach global buyers.">
</svelte:head>

<section class="mx-auto max-w-4xl">
	<div class="mb-4 text-center">
		<h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">Become a HalalNeo supplier</h1>
		<p class="mx-auto mt-1 max-w-xl text-sm text-muted-foreground">
			List certified products, get verified, and reach international buyers. One application, ongoing opportunities.
		</p>
	</div>

	<section class="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
		{#each benefits as b}
			<Card class="p-3">
				<CardContent class="space-y-1 p-0">
				<div class="mx-auto mb-1 flex size-7 items-center justify-center rounded-lg {b.color}">
					<b.icon class="size-4"></b.icon>
				</div>
					<h3 class="text-[11px] font-semibold leading-tight text-center">{b.title}</h3>
					<p class="text-center text-[10px] text-muted-foreground">{b.desc}</p>
				</CardContent>
			</Card>
		{/each}
	</section>

	<Card class="mx-auto p-3">
		<CardContent class="space-y-4 p-0">
			<div class="mb-3 flex items-center justify-between" role="list" aria-label="Application progress">
				{#each steps as s, i}
					<div class="flex flex-1 items-center" role="listitem" aria-current={step === i + 1 ? 'step' : undefined}>
						<div class="flex flex-col items-center">
							<div class="flex size-7 items-center justify-center rounded-full text-[10px] font-semibold {step > i ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}">
								{i + 1}
							</div>
							<span class="mt-1 text-[10px] {step > i ? 'text-foreground' : 'text-muted-foreground'}">Step {i + 1}: {s}</span>
						</div>
						{#if i < steps.length - 1}
							<div class="mx-2 h-px flex-1 bg-border"></div>
						{/if}
					</div>
				{/each}
			</div>

			{#if step === 1}
				<div class="space-y-2">
					<div class="space-y-0.5">
						<Label class="mb-1 block text-[10px]">Company Legal Name <span class="text-destructive">*</span></Label>
						<Input type="text" class="w-full" placeholder="e.g. Nusantara Foods Sdn Bhd" bind:value={company} />
					</div>
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
						<div class="space-y-0.5">
							<Label class="mb-1 block text-[10px]">Country <span class="text-destructive">*</span></Label>
							<Input type="text" placeholder="Country" bind:value={country} />
						</div>
						<div class="space-y-0.5">
							<Label class="mb-1 block text-[10px]">Business Type <span class="text-destructive">*</span></Label>
							<Input type="text" placeholder="Manufacturer / Trader / Wholesaler" bind:value={bizType} />
						</div>
					</div>
					<div class="space-y-0.5">
						<Label class="mb-1 block text-[10px]">Primary Products</Label>
						<Input type="text" placeholder="e.g. Food ingredients, cosmetics, pharmaceuticals" bind:value={products} />
					</div>
					<div class="space-y-0.5">
						<Label class="mb-1 block text-[10px]">Contact Email <span class="text-destructive">*</span></Label>
						<Input type="email" placeholder="you@company.com" bind:value={email} />
					</div>
				</div>
			{:else if step === 2}
				<div class="space-y-2">
					<div class="space-y-0.5">
						<Label class="mb-1 block text-[10px]">Halal Certification</Label>
						<Input type="text" placeholder="e.g. JAKIM, MUI, MUIS, IFANCA" bind:value={cert} />
					</div>
					<div class="space-y-0.5">
						<Label class="mb-1 block text-[10px]">License / Registration No.</Label>
						<Input type="text" placeholder="Business registration number" bind:value={regNo} />
					</div>
					<div class="space-y-0.5">
						<Label class="mb-1 block text-[10px]">Website</Label>
						<Input type="text" placeholder="https://" bind:value={website} />
					</div>
				</div>
			{:else if step === 3}
				<div class="space-y-2">
					<p class="text-[11px] font-medium">Review your application</p>
					<dl class="space-y-1 rounded-lg bg-muted/50 p-3 text-[11px]">
						<div class="flex justify-between gap-2"><dt class="text-muted-foreground">Company</dt><dd class="font-medium">{company || '—'}</dd></div>
						<div class="flex justify-between gap-2"><dt class="text-muted-foreground">Country</dt><dd class="font-medium">{country || '—'}</dd></div>
						<div class="flex justify-between gap-2"><dt class="text-muted-foreground">Type</dt><dd class="font-medium">{bizType || '—'}</dd></div>
						<div class="flex justify-between gap-2"><dt class="text-muted-foreground">Products</dt><dd class="font-medium">{products || '—'}</dd></div>
						<div class="flex justify-between gap-2"><dt class="text-muted-foreground">Email</dt><dd class="font-medium">{email || '—'}</dd></div>
						<div class="flex justify-between gap-2"><dt class="text-muted-foreground">Certification</dt><dd class="font-medium">{cert || '—'}</dd></div>
					</dl>
				</div>
			{:else}
				<div class="rounded-lg bg-primary/5 p-4 text-center">
					<p class="text-[11px] font-medium text-primary">Application submitted</p>
					<p class="mt-1 text-[10px] text-muted-foreground">Our team will review your details and verify certification within 2 business days.</p>
				</div>
			{/if}

			{#if submitError}
				<p class="text-center text-xs text-destructive">{submitError}</p>
			{/if}

			{#if step < 4}
				<div class="flex items-center justify-end gap-2">
					{#if step > 1}
						<Button variant="outline" size="sm" onclick={() => (step -= 1)}>Back</Button>
					{/if}
					<Button size="sm" onclick={next} disabled={sending || !canContinue}>
						{sending ? 'Submitting...' : step === 3 ? 'Submit Application' : 'Continue'}
					</Button>
				</div>
			{/if}
		</CardContent>
	</Card>
</section>
