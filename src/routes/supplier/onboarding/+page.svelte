<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label, FieldError } from '#lib/components/ui/field/index.js';
	import { Card, CardContent } from '#lib/components/ui/card/index.js';
	import {
		Select,
		SelectContent,
		SelectGroup,
		SelectItem,
		SelectTrigger
	} from '#lib/components/ui/select/index.js';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import Globe from '@lucide/svelte/icons/globe';
	import BarChart3 from '@lucide/svelte/icons/bar-chart-3';
	import Users from '@lucide/svelte/icons/users';
	import Sparkles from '@lucide/svelte/icons/sparkles';
	import CheckCircle2 from '@lucide/svelte/icons/check-circle-2';
	import { z } from 'zod';
	import { toast } from 'svelte-sonner';
	import { focusFirstInvalid, mergeServerDetails } from '#lib/utils/forms.js';

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

	const businessTypes = [
		{ value: 'manufacturer', label: 'Manufacturer' },
		{ value: 'wholesaler', label: 'Wholesaler' },
		{ value: 'trader', label: 'Trader' }
	];

	let company = $state('');
	let country = $state('');
	let bizType = $state('');
	let products = $state('');
	let email = $state('');
	let cert = $state('');
	let regNo = $state('');
	let website = $state('');
	let fieldErrors = $state<Record<string, string>>({});
	let formEl = $state<HTMLDivElement | undefined>(undefined);

	const canContinue = $derived(
		step === 1
			? company.trim() !== '' && country.trim() !== '' && businessTypes.some((t) => t.value === bizType)
			: true
	);

	const businessTypeError = $derived(
		step === 1 && bizType && !businessTypes.some((t) => t.value === bizType) ? 'Choose manufacturer, wholesaler, or trader.' : ''
	);

	const step1Schema = z.object({
		company: z.string().trim().min(2, 'Please enter your company legal name.').max(200, 'Company name must be at most 200 characters.'),
		country: z.string().trim().min(2, 'Please enter your country.').max(100, 'Country must be at most 100 characters.'),
		bizType: z
			.string()
			.min(1, 'Please choose a business type.')
			.refine((v) => businessTypes.some((t) => t.value === v), 'Choose manufacturer, wholesaler, or trader.'),
		products: z.string().trim().max(300, 'Primary products must be at most 300 characters.'),
		email: z
			.string()
			.trim()
			.min(1, 'Contact email is required so we can follow up.')
			.email('Please enter a valid email.')
			.max(200, 'Email must be at most 200 characters.')
	});

	const step2Schema = z.object({
		cert: z.string().trim().max(200, 'Certification must be at most 200 characters.'),
		regNo: z.string().trim().max(100, 'Registration number must be at most 100 characters.'),
		website: z.string().trim().max(300, 'Website must be at most 300 characters.')
	});

	const STEP1_KEYS = new Set(['company', 'country', 'bizType', 'products', 'email']);

	// Server `details` use API field names — remap to the client state keys above.
	const SERVER_TO_CLIENT: Record<string, string> = {
		company: 'company',
		country: 'country',
		businessType: 'bizType',
		primaryProducts: 'products',
		contactEmail: 'email',
		halalCertification: 'cert',
		registrationNo: 'regNo',
		website: 'website'
	};

	function applyIssues(issues: Array<{ key: string; message: string }>) {
		for (const { key, message } of issues) {
			if (key && message && !fieldErrors[key]) fieldErrors = { ...fieldErrors, [key]: message };
		}
	}

	function validateStep1(): boolean {
		fieldErrors = {};
		const parsed = step1Schema.safeParse({ company, country, bizType, products, email });
		if (parsed.success) return true;
		applyIssues(parsed.error.issues.map((i) => ({ key: String(i.path[0] ?? ''), message: i.message })));
		focusFirstInvalid(formEl);
		return false;
	}

	function validateStep2(): boolean {
		fieldErrors = {};
		const parsed = step2Schema.safeParse({ cert, regNo, website });
		if (parsed.success) return true;
		applyIssues(parsed.error.issues.map((i) => ({ key: String(i.path[0] ?? ''), message: i.message })));
		focusFirstInvalid(formEl);
		return false;
	}

	async function next() {
		submitError = '';
		if (step === 1 && !validateStep1()) return;
		if (step === 2 && !validateStep2()) return;
		if (step < 3) {
			step += 1;
			return;
		}
		if (step > 3 || sending) return;
		fieldErrors = {};
		const issues = [
			...step1Schema.safeParse({ company, country, bizType, products, email }).error?.issues.map((i) => ({ key: String(i.path[0] ?? ''), message: i.message })) ?? [],
			...step2Schema.safeParse({ cert, regNo, website }).error?.issues.map((i) => ({ key: String(i.path[0] ?? ''), message: i.message })) ?? []
		];
		if (issues.length > 0) {
			applyIssues(issues);
			step = issues.some((i) => STEP1_KEYS.has(i.key)) ? 1 : 2;
			focusFirstInvalid(formEl);
			return;
		}
		sending = true;
		try {
			const res = await fetch('/api/supplier-applications', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					company: company.trim(),
					country: country.trim(),
					businessType: businessTypes.some((t) => t.value === bizType) ? bizType : 'manufacturer',
					primaryProducts: products.trim(),
					contactEmail: email.trim(),
					halalCertification: cert.trim(),
					registrationNo: regNo.trim(),
					website: website.trim()
				})
			});
			const data = (await res.json().catch(() => ({}))) as {
				error?: string;
				message?: string;
				details?: Record<string, string[] | string>;
			};
			if (!res.ok) {
				if (res.status === 400 && data?.details) {
					const remapped: Record<string, string[] | string> = {};
					for (const [k, v] of Object.entries(data.details)) remapped[SERVER_TO_CLIENT[k] ?? k] = v;
					fieldErrors = mergeServerDetails(fieldErrors, remapped);
					step = Object.keys(fieldErrors).some((k) => STEP1_KEYS.has(k)) ? 1 : 2;
					focusFirstInvalid(formEl);
				}
				const message = data?.error ?? 'Could not submit your application. Please try again.';
				submitError = message;
				toast.error(message);
				return;
			}
			submitError = '';
			step = 4;
			toast.success(
				data?.message ??
					'Application submitted — our team will review it within 1–3 business days.'
			);
		} catch {
			submitError = 'Could not submit your application. Please check your connection and try again.';
			toast.error(submitError);
		} finally {
			sending = false;
		}
	}
</script>

<svelte:head>
	<title>Become a Supplier — HalalNeo</title>
	<meta name="description" content="Apply to list your halal-certified products on HalalNeo and reach global buyers.">
</svelte:head>

<section class="mx-auto max-w-6xl">
		<div class="mb-4 text-center">
		<h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">Become a HalalNeo supplier</h1>
		<p class="mx-auto mt-1 max-w-xl text-sm text-muted-foreground">
			List certified products, get verified, and reach international buyers. One application, ongoing opportunities.
		</p>
		<p class="mx-auto mt-2 inline-flex items-center gap-1.5 rounded-full border border-info/30 bg-info/10 px-2.5 py-0.5 text-2xs font-medium text-info">
			<Sparkles class="size-3"></Sparkles>
			Supplier test mode — no payment required while we onboard our first suppliers
		</p>
	</div>

	<section class="mb-4 grid grid-cols-2 sm:grid-cols-2 gap-3">
		{#each benefits as b (b.title)}
			<Card class="p-3">
				<CardContent class="space-y-1 p-0">
				<div class="mx-auto mb-1 flex size-8 items-center justify-center rounded-lg {b.color}">
					<b.icon class="size-4"></b.icon>
				</div>
					<h3 class="text-2xs-plus font-semibold leading-tight text-center">{b.title}</h3>
					<p class="text-center text-2xs text-muted-foreground">{b.desc}</p>
				</CardContent>
			</Card>
		{/each}
	</section>

	<Card class="mx-auto p-3">
		<CardContent class="space-y-4 p-0">
			<div class="mb-3 flex items-center justify-between" role="list" aria-label="Application progress">
				{#each steps as s, i (s)}
					<div class="flex flex-1 items-center" role="listitem" aria-current={step === i + 1 ? 'step' : undefined}>
						<div class="flex flex-col items-center">
							<div class="flex size-7 items-center justify-center rounded-full text-2xs font-semibold {step > i ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}">
								{i + 1}
							</div>
							<span class="mt-1 text-2xs {step > i ? 'text-foreground' : 'text-muted-foreground'}">Step {i + 1}: {s}</span>
						</div>
						{#if i < steps.length - 1}
							<div class="mx-2 h-px flex-1 bg-border"></div>
						{/if}
					</div>
				{/each}
			</div>

			<div bind:this={formEl}>
			{#if step === 1}
				<div class="space-y-2">
					<div class="space-y-0.5">
						<Label class="mb-1 block text-2xs">Company Legal Name <span class="text-destructive">*</span></Label>
						<Input
							type="text"
							class="w-full"
							placeholder="e.g. Nusantara Foods Sdn Bhd"
							bind:value={company}
							aria-invalid={fieldErrors.company ? true : undefined}
							oninput={() => { if (fieldErrors.company) fieldErrors = { ...fieldErrors, company: '' }; }}
						/>
						{#if fieldErrors.company}<FieldError class="text-2xs">{fieldErrors.company}</FieldError>{/if}
					</div>
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
						<div class="space-y-0.5">
							<Label class="mb-1 block text-2xs">Country <span class="text-destructive">*</span></Label>
							<Input
								type="text"
								placeholder="Country"
								bind:value={country}
								aria-invalid={fieldErrors.country ? true : undefined}
								oninput={() => { if (fieldErrors.country) fieldErrors = { ...fieldErrors, country: '' }; }}
							/>
							{#if fieldErrors.country}<FieldError class="text-2xs">{fieldErrors.country}</FieldError>{/if}
						</div>
				<div class="space-y-0.5">
						<Label class="mb-1 block text-2xs">Business Type <span class="text-destructive">*</span></Label>
						<Select type="single" bind:value={bizType}>
							<SelectTrigger class="w-full" aria-invalid={fieldErrors.bizType ? true : undefined}>
								{bizType ? businessTypes.find((t) => t.value === bizType)?.label : 'Select…'}
							</SelectTrigger>
							<SelectContent>
								<SelectGroup>
									{#each businessTypes as t (t.value)}
										<SelectItem value={t.value}>{t.label}</SelectItem>
									{/each}
								</SelectGroup>
							</SelectContent>
						</Select>
						{#if fieldErrors.bizType}
							<p class="text-2xs text-destructive">{fieldErrors.bizType}</p>
						{:else if businessTypeError}
							<p class="text-2xs text-destructive">{businessTypeError}</p>
						{/if}
					</div>
					</div>
					<div class="space-y-0.5">
						<Label class="mb-1 block text-2xs">Primary Products</Label>
						<Input
							type="text"
							placeholder="e.g. Food ingredients, cosmetics, pharmaceuticals"
							bind:value={products}
							aria-invalid={fieldErrors.products ? true : undefined}
							oninput={() => { if (fieldErrors.products) fieldErrors = { ...fieldErrors, products: '' }; }}
						/>
						{#if fieldErrors.products}<FieldError class="text-2xs">{fieldErrors.products}</FieldError>{/if}
					</div>
					<div class="space-y-0.5">
						<Label class="mb-1 block text-2xs">Contact Email <span class="text-destructive">*</span></Label>
						<Input
							type="email"
							placeholder="you@company.com"
							bind:value={email}
							aria-invalid={fieldErrors.email ? true : undefined}
							oninput={() => { if (fieldErrors.email) fieldErrors = { ...fieldErrors, email: '' }; }}
						/>
						{#if fieldErrors.email}<FieldError class="text-2xs">{fieldErrors.email}</FieldError>{/if}
					</div>
				</div>
			{:else if step === 2}
				<div class="space-y-2">
					<div class="space-y-0.5">
						<Label class="mb-1 block text-2xs">Halal Certification</Label>
						<Input
							type="text"
							placeholder="e.g. JAKIM, MUI, MUIS, IFANCA"
							bind:value={cert}
							aria-invalid={fieldErrors.cert ? true : undefined}
							oninput={() => { if (fieldErrors.cert) fieldErrors = { ...fieldErrors, cert: '' }; }}
						/>
						{#if fieldErrors.cert}<FieldError class="text-2xs">{fieldErrors.cert}</FieldError>{/if}
					</div>
					<div class="space-y-0.5">
						<Label class="mb-1 block text-2xs">License / Registration No.</Label>
						<Input
							type="text"
							placeholder="Business registration number"
							bind:value={regNo}
							aria-invalid={fieldErrors.regNo ? true : undefined}
							oninput={() => { if (fieldErrors.regNo) fieldErrors = { ...fieldErrors, regNo: '' }; }}
						/>
						{#if fieldErrors.regNo}<FieldError class="text-2xs">{fieldErrors.regNo}</FieldError>{/if}
					</div>
					<div class="space-y-0.5">
						<Label class="mb-1 block text-2xs">Website</Label>
						<Input
							type="text"
							placeholder="https://"
							bind:value={website}
							aria-invalid={fieldErrors.website ? true : undefined}
							oninput={() => { if (fieldErrors.website) fieldErrors = { ...fieldErrors, website: '' }; }}
						/>
						{#if fieldErrors.website}<FieldError class="text-2xs">{fieldErrors.website}</FieldError>{/if}
					</div>
				</div>
			{:else if step === 3}
				<div class="space-y-2">
					<p class="text-2xs-plus font-medium">Review your application</p>
					<dl class="space-y-1 rounded-lg bg-muted/50 p-3 text-2xs-plus">
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
					<CheckCircle2 class="mx-auto mb-2 size-6 text-primary"></CheckCircle2>
					<p class="text-2xs-plus font-medium text-primary">Application submitted</p>
					<p class="mt-1 text-2xs text-muted-foreground">
						Our team will review your details and respond within 1–3 business days. We will email you at the
						address you provided.
					</p>
					<div class="mt-3 flex flex-col items-center gap-1 text-2xs text-muted-foreground">
						<a href="/pricing" class="underline underline-offset-2 hover:text-foreground">View pricing details</a>
						<a href="/faq" class="underline underline-offset-2 hover:text-foreground">Read the supplier FAQ</a>
					</div>
				</div>
			{/if}
			</div>

			{#if submitError}
				<p class="text-center text-xs text-destructive">{submitError}</p>
			{/if}

			{#if step < 4}
				<div class="flex items-center justify-end gap-2">
					{#if step > 1}
						<Button variant="outline" size="sm" onclick={() => { fieldErrors = {}; step -= 1; }}>Back</Button>
					{/if}
					<Button size="sm" onclick={next} disabled={sending || !canContinue}>
						{sending ? 'Submitting...' : step === 3 ? 'Submit Application' : 'Continue'}
					</Button>
				</div>
			{/if}
		</CardContent>
	</Card>
</section>
