<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { getCurrentAccount, updateAccount } from '#lib/stores/auth.svelte.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label, FieldError } from '#lib/components/ui/field/index.js';
	import { Card, CardContent } from '#lib/components/ui/card/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '#lib/components/ui/select/index.js';
	import { z } from 'zod';
	import { focusFirstInvalid } from '#lib/utils/forms.js';
	import Camera from '@lucide/svelte/icons/camera';

	let account = $derived(getCurrentAccount());

	const initials = $derived(
		(account?.fullName ?? 'U').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'U'
	);

	let firstName = $state('');
	let lastName = $state('');
	let company = $state('');
	let email = $state('');
	let phone = $state('');
	let country = $state('us');
	let industry = $state('pharma');
	let initialized = $state(false);
	let fieldErrors = $state<Record<string, string>>({});
	let formEl = $state<HTMLFormElement | undefined>(undefined);
	let saved = $state(false);

	$effect(() => {
		if (account && !initialized) {
			const parts = (account.fullName ?? '').split(' ');
			firstName = parts[0] ?? '';
			lastName = parts.slice(1).join(' ');
			company = account.company ?? '';
			email = account.email ?? '';
			initialized = true;
		}
	});

	const profileClientSchema = z.object({
		firstName: z.string().trim().min(1, 'First name is required.').max(100, 'First name must be at most 100 characters.'),
		lastName: z.string().trim().max(100, 'Last name must be at most 100 characters.'),
		company: z.string().trim().max(200, 'Company must be at most 200 characters.'),
		email: z.string().trim().min(1, 'Email is required.').email('Please enter a valid email.').max(200, 'Email must be at most 200 characters.'),
		phone: z
			.string()
			.trim()
			.max(30, 'Phone must be at most 30 characters.')
			.refine((v) => v === '' || /^[+()\-.\s\d]{7,}$/.test(v), 'Please enter a valid phone number.'),
		country: z.enum(['us', 'my', 'id', 'ae']),
		industry: z.enum(['pharma', 'food', 'cosmetics', 'textiles'])
	});

	function resetForm() {
		if (!account) return;
		const parts = (account.fullName ?? '').split(' ');
		firstName = parts[0] ?? '';
		lastName = parts.slice(1).join(' ');
		company = account.company ?? '';
		email = account.email ?? '';
		phone = '';
		country = 'us';
		industry = 'pharma';
		fieldErrors = {};
		saved = false;
	}

	function submit() {
		fieldErrors = {};
		saved = false;
		const parsed = profileClientSchema.safeParse({ firstName, lastName, company, email, phone, country, industry });
		if (!parsed.success) {
			for (const issue of parsed.error.issues) {
				const key = String(issue.path[0] ?? '');
				if (key && !fieldErrors[key]) fieldErrors = { ...fieldErrors, [key]: issue.message };
			}
			focusFirstInvalid(formEl);
			return;
		}
		if (account) {
			const fullName = `${firstName.trim()}${lastName.trim() ? ' ' + lastName.trim() : ''}`;
			updateAccount(account.email, { fullName, company: company.trim() });
		}
		saved = true;
	}
</script>

<svelte:head>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

{#if !account}
	<div class="rounded-xl bg-card p-6 ring-1 ring-foreground/10 text-center">
		<h2 class="text-sm font-bold">Not signed in</h2>
		<p class="mt-1 text-[10px] text-muted-foreground">Sign in to view your account profile.</p>
		<Button href={localizeHref('/login')} class="mt-3">Sign in</Button>
	</div>
{:else}
	<div class="space-y-4">
		<!-- Account card -->
		<div class="mb-3 rounded-xl bg-card p-3 ring-1 ring-foreground/10">
			<div class="flex items-center gap-3">
				<div class="relative group">
					<div class="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-sm font-bold text-primary">
						{initials}
					</div>
					<div class="absolute inset-0 flex items-center justify-center rounded-xl bg-foreground/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
						<Camera class="size-4 text-background"></Camera>
					</div>
				</div>
				<div>
					<div class="flex items-center gap-1.5">
						<h2 class="text-xs font-bold text-foreground">{account.fullName}</h2>
						<Badge variant="secondary" class="px-1.5 py-0.5 text-[10px]">
							<span class="size-1 rounded-full bg-success"></span>
							Active
						</Badge>
					</div>
					<p class="text-[10px] text-muted-foreground">{account.email}</p>
					<p class="text-[10px] text-muted-foreground">{account.company ?? '—'}</p>
				</div>
			</div>
		</div>

		<!-- Profile settings form -->
		<div class="rounded-xl bg-card ring-1 ring-foreground/10 overflow-hidden">
			<div class="border-b border-border px-3 py-2">
				<h3 class="text-[11px] font-bold text-foreground">Profile Settings</h3>
				<p class="mt-0.5 text-[10px] text-muted-foreground">Manage your personal and company information.</p>
			</div>
			<form
				class="p-3 space-y-2"
				bind:this={formEl}
				onsubmit={(e) => {
					e.preventDefault();
					submit();
				}}
			>
				{#if saved && Object.keys(fieldErrors).length === 0}
					<p class="rounded-xl bg-success/10 px-3 py-2 text-xs text-success">Profile updated.</p>
				{/if}
				<div class="grid grid-cols-2 gap-2 sm:grid-cols-2">
					<div class="space-y-0.5">
						<Label class="text-[10px]">First Name</Label>
						<Input
							type="text"
							bind:value={firstName}
							class="h-8 text-[11px]"
							aria-invalid={fieldErrors.firstName ? true : undefined}
							oninput={() => { if (fieldErrors.firstName) fieldErrors = { ...fieldErrors, firstName: '' }; }}
						/>
						{#if fieldErrors.firstName}<FieldError>{fieldErrors.firstName}</FieldError>{/if}
					</div>
					<div class="space-y-0.5">
						<Label class="text-[10px]">Last Name</Label>
						<Input
							type="text"
							bind:value={lastName}
							class="h-8 text-[11px]"
							aria-invalid={fieldErrors.lastName ? true : undefined}
							oninput={() => { if (fieldErrors.lastName) fieldErrors = { ...fieldErrors, lastName: '' }; }}
						/>
						{#if fieldErrors.lastName}<FieldError>{fieldErrors.lastName}</FieldError>{/if}
					</div>
				</div>
				<div class="space-y-0.5">
					<Label class="text-[10px]">Company</Label>
					<Input
						type="text"
						bind:value={company}
						class="h-8 text-[11px]"
						aria-invalid={fieldErrors.company ? true : undefined}
						oninput={() => { if (fieldErrors.company) fieldErrors = { ...fieldErrors, company: '' }; }}
					/>
					{#if fieldErrors.company}<FieldError>{fieldErrors.company}</FieldError>{/if}
				</div>
				<div class="space-y-0.5">
					<Label class="text-[10px]">Email</Label>
					<Input
						type="email"
						bind:value={email}
						class="h-8 text-[11px]"
						aria-invalid={fieldErrors.email ? true : undefined}
						oninput={() => { if (fieldErrors.email) fieldErrors = { ...fieldErrors, email: '' }; }}
					/>
					{#if fieldErrors.email}<FieldError>{fieldErrors.email}</FieldError>{/if}
				</div>
				<div class="space-y-0.5">
					<Label class="text-[10px]">Phone</Label>
					<Input
						type="tel"
						placeholder="+1 (555) 000-0000"
						bind:value={phone}
						class="h-8 text-[11px]"
						aria-invalid={fieldErrors.phone ? true : undefined}
						oninput={() => { if (fieldErrors.phone) fieldErrors = { ...fieldErrors, phone: '' }; }}
					/>
					{#if fieldErrors.phone}<FieldError>{fieldErrors.phone}</FieldError>{/if}
				</div>
				<div class="grid grid-cols-2 gap-2 sm:grid-cols-2">
					<div class="space-y-0.5">
						<Label class="text-[10px]">Country</Label>
						<Select type="single" bind:value={country}>
							<SelectTrigger class="h-8 w-full text-[11px]" aria-invalid={fieldErrors.country ? true : undefined}>
								{{ us: 'United States', my: 'Malaysia', id: 'Indonesia', ae: 'UAE' }[country] ?? 'United States'}
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="us">United States</SelectItem>
								<SelectItem value="my">Malaysia</SelectItem>
								<SelectItem value="id">Indonesia</SelectItem>
								<SelectItem value="ae">UAE</SelectItem>
							</SelectContent>
						</Select>
						{#if fieldErrors.country}<FieldError>{fieldErrors.country}</FieldError>{/if}
					</div>
					<div class="space-y-0.5">
						<Label class="text-[10px]">Industry Interest</Label>
						<Select type="single" bind:value={industry}>
							<SelectTrigger class="h-8 w-full text-[11px]" aria-invalid={fieldErrors.industry ? true : undefined}>
								{{ pharma: 'Pharmaceuticals', food: 'Food & Beverages', cosmetics: 'Cosmetics', textiles: 'Textiles' }[industry] ?? 'Pharmaceuticals'}
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="pharma">Pharmaceuticals</SelectItem>
								<SelectItem value="food">Food & Beverages</SelectItem>
								<SelectItem value="cosmetics">Cosmetics</SelectItem>
								<SelectItem value="textiles">Textiles</SelectItem>
							</SelectContent>
						</Select>
						{#if fieldErrors.industry}<FieldError>{fieldErrors.industry}</FieldError>{/if}
					</div>
				</div>
				<div class="flex items-center gap-1.5 pt-0.5">
					<Button type="submit" size="sm" class="h-7 text-[10px]">Save Changes</Button>
					<Button type="button" variant="outline" size="sm" class="h-7 text-[10px]" onclick={resetForm}>Cancel</Button>
				</div>
			</form>
		</div>
	</div>
{/if}
