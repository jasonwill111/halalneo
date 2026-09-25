<script lang="ts">
	import type { PageProps } from './$types';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Alert } from '#lib/components/ui/alert/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Card, CardContent, CardHeader, CardTitle } from '#lib/components/ui/card/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import { Field, FieldLabel, FieldError } from '#lib/components/ui/field/index.js';
	import { Skeleton } from '#lib/components/ui/skeleton/index.js';
	import {
		Empty,
		EmptyContent,
		EmptyDescription,
		EmptyHeader,
		EmptyTitle
	} from '#lib/components/ui/empty/index.js';
	import BrandedEmptyMedia from '#lib/components/site/branded-empty-media.svelte';
	import Save from '@lucide/svelte/icons/save';
	import Building2 from '@lucide/svelte/icons/building-2';
	import Users from '@lucide/svelte/icons/users';
	import BadgeCheck from '@lucide/svelte/icons/badge-check';
	import ShieldQuestion from '@lucide/svelte/icons/shield-question';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import { toast } from 'svelte-sonner';
	import { z } from 'zod';
	import { focusFirstInvalid, mergeServerDetails } from '#lib/utils/forms.js';

	let { data }: PageProps = $props();

	const supplierSlug = $derived(data.supplierSlug);

	type SupplierDetail = {
		slug: string;
		name: string;
		country: string;
		businessType: string | null;
		status: string | null;
		description: string | null;
		website: string | null;
		email: string | null;
		yearEstablished: number | null;
		certifications: string | unknown[] | null;
		createdAt: string | null;
	};

	let detail = $state<SupplierDetail | null>(null);
	let loading = $state(true);
	let loadError = $state('');
	let activeProducts = $state<number | null>(null);

	let companyName = $state('');
	let country = $state('');
	let description = $state('');
	let yearEstablished = $state('');
	let website = $state('');
	let fieldErrors = $state<Record<string, string>>({});
	let formError = $state('');
	let saving = $state(false);
	let formEl = $state<HTMLFormElement | undefined>(undefined);

	const currentYear = new Date().getFullYear();

	const profileSchema = z.object({
		name: z
			.string()
			.trim()
			.min(2, 'Company name must be at least 2 characters.')
			.max(200, 'Company name must be at most 200 characters.'),
		country: z
			.string()
			.trim()
			.min(2, 'Country is required.')
			.max(100, 'Country must be at most 100 characters.'),
		yearEstablished: z
			.string()
			.trim()
			.refine((v) => v === '' || /^\d{4}$/.test(v), 'Enter a 4-digit year.')
			.refine(
				(v) => v === '' || (Number(v) >= 1900 && Number(v) <= currentYear),
				`Year must be between 1900 and ${currentYear}.`
			),
		website: z
			.string()
			.trim()
			.max(300, 'Website must be at most 300 characters.')
			.refine(
				(v) => v === '' || /^https?:\/\/\S+\.\S+/.test(v),
				'Enter a full URL starting with https://'
			),
		description: z.string().trim().max(2000, 'Description must be at most 2000 characters.')
	});

	const statusMeta: Record<string, { label: string; cls: string }> = {
		active: { label: 'Verified', cls: 'bg-success/10 text-success' },
		pending: { label: 'Under review', cls: 'bg-warn/10 text-warn' },
		suspended: { label: 'Suspended', cls: 'bg-destructive/10 text-destructive' },
		rejected: { label: 'Declined', cls: 'bg-destructive/10 text-destructive' }
	};

	const certificationList = $derived.by(() => {
		const raw = detail?.certifications;
		if (!raw) return [] as Array<{ name: string; scope: string }>;
		let arr: unknown = raw;
		if (typeof raw === 'string') {
			try {
				arr = JSON.parse(raw);
			} catch {
				return [{ name: raw, scope: '' }];
			}
		}
		if (!Array.isArray(arr)) return [];
		return arr
			.map((c) => {
				if (!c || typeof c !== 'object') return null;
				const rec = c as Record<string, unknown>;
				const name =
					typeof rec.name === 'string'
						? rec.name
						: typeof rec.bodyName === 'string'
							? rec.bodyName
							: '';
				if (!name) return null;
				return { name, scope: typeof rec.scope === 'string' ? rec.scope : '' };
			})
			.filter((c): c is { name: string; scope: string } => c !== null);
	});

	const memberSince = $derived.by(() => {
		const raw = detail?.createdAt;
		if (!raw) return '—';
		const d = new Date(raw);
		return Number.isNaN(d.getTime())
			? '—'
			: d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
	});

	function hydrate(row: SupplierDetail): void {
		companyName = row.name ?? '';
		country = row.country ?? '';
		description = row.description ?? '';
		yearEstablished = row.yearEstablished ? String(row.yearEstablished) : '';
		website = row.website ?? '';
	}

	function errorMessage(e: unknown, fallback: string): string {
		return e instanceof Error && e.message ? e.message : fallback;
	}

	async function loadProfile(): Promise<void> {
		if (!supplierSlug) {
			loading = false;
			return;
		}
		loading = true;
		loadError = '';
		try {
			const res = await fetch(`/api/suppliers/${encodeURIComponent(supplierSlug)}`);
			if (!res.ok) {
				throw new Error(
					res.status === 404
						? 'Supplier profile not found.'
						: 'Could not load your company details.'
				);
			}
			const row = (await res.json()) as SupplierDetail;
			detail = row;
			hydrate(row);
		} catch (e) {
			loadError = errorMessage(e, 'Could not load your company details.');
		} finally {
			loading = false;
		}
	}

	async function loadProductCount(): Promise<void> {
		if (!supplierSlug) return;
		try {
			// limit=1 → we only need `total` (indexed supplier_slug + status).
			const res = await fetch(
				`/api/products?supplierSlug=${encodeURIComponent(supplierSlug)}&status=active&limit=1`
			);
			if (!res.ok) return;
			const json = (await res.json()) as { total?: number };
			activeProducts = typeof json.total === 'number' ? json.total : null;
		} catch {
			activeProducts = null;
		}
	}

	$effect(() => {
		if (!supplierSlug) return;
		void loadProfile();
		void loadProductCount();
	});

	async function save() {
		if (!supplierSlug || saving) return; // double-submit guard (§3.4)
		formError = '';
		fieldErrors = {};
		const parsed = profileSchema.safeParse({
			name: companyName,
			country,
			yearEstablished,
			website,
			description
		});
		if (!parsed.success) {
			for (const issue of parsed.error.issues) {
				const key = String(issue.path[0] ?? '');
				if (key && !fieldErrors[key]) fieldErrors = { ...fieldErrors, [key]: issue.message };
			}
			focusFirstInvalid(formEl);
			return;
		}
		saving = true;
		try {
			const res = await fetch(`/api/suppliers/${encodeURIComponent(supplierSlug)}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: companyName.trim(),
					country: country.trim(),
					yearEstablished: yearEstablished.trim() ? Number(yearEstablished.trim()) : null,
					website: website.trim() || null,
					description: description.trim()
				})
			});
			const json = (await res.json().catch(() => ({}))) as {
				error?: string;
				details?: Record<string, string[] | string>;
			};
			if (!res.ok) {
				if (json.details) fieldErrors = mergeServerDetails(fieldErrors, json.details);
				formError = json.error ?? 'Could not save your changes. Please try again.';
				toast.error(formError);
				focusFirstInvalid(formEl);
				return;
			}
			const updated = json as unknown as Partial<SupplierDetail>;
			if (detail) {
				// Keep only what we sent — the PUT response echoes every column
				// (including admin-only `adminNotes`), which must not leak into state.
				detail = {
					...detail,
					name: updated.name ?? companyName.trim(),
					country: updated.country ?? country.trim(),
					description: updated.description ?? description.trim(),
					yearEstablished:
						updated.yearEstablished ??
						(yearEstablished.trim() ? Number(yearEstablished.trim()) : null),
					website: updated.website ?? (website.trim() || null)
				};
			}
			formError = '';
			toast.success('Company profile updated.');
		} catch {
			formError = 'Could not save your changes. Please check your connection and try again.';
			toast.error(formError);
		} finally {
			saving = false;
		}
	}
</script>

<svelte:head>
	<title>Manage Supplier — HalalNeo</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="mb-3 space-y-1">
	<nav class="flex items-center gap-1.5 text-2xs text-muted-foreground">
		<a href={localizeHref('/')} class="transition-colors hover:text-foreground">Home</a>
		<span>/</span>
		<a href={localizeHref('/supplier/account')} class="transition-colors hover:text-foreground"
			>Supplier</a
		>
		<span>/</span>
		<span class="font-medium text-foreground">Manage</span>
	</nav>
	<h1 class="text-xl font-semibold tracking-tight sm:text-2xl">Company Profile</h1>
	<p class="text-xs text-muted-foreground sm:text-sm">
		Manage the company information buyers see on your public profile.
	</p>
</div>

{#if !supplierSlug}
	<Card class="p-3 ring-1 ring-foreground/10">
		<CardContent class="p-0">
			<Empty>
				<BrandedEmptyMedia
					><ShieldQuestion class="size-6 text-muted-foreground" /></BrandedEmptyMedia
				>
				<div class="space-y-1">
					<p class="font-medium">No supplier profile linked</p>
					<p class="text-sm text-muted-foreground">
						Your account isn't linked to a supplier company yet. Apply for access and an
						administrator will connect this account to your profile.
					</p>
				</div>
				<Button class="mt-2" size="sm" href={localizeHref('/supplier/onboarding')}>
					Apply to become a supplier
				</Button>
			</Empty>
		</CardContent>
	</Card>
{:else if loading}
	<div class="grid gap-3 sm:gap-4 lg:grid-cols-3">
		<div class="space-y-4 lg:col-span-2">
			<Card size="sm">
				<CardHeader class="pb-3"><CardTitle class="text-sm">Company Details</CardTitle></CardHeader>
				<CardContent class="space-y-4">
					<div class="grid gap-4 sm:grid-cols-2">
						{#each [0, 1, 2, 3] as i (i)}
							<div class="space-y-2">
								<Skeleton class="h-3 w-24" />
								<Skeleton class="h-9 w-full" />
							</div>
						{/each}
					</div>
					<Skeleton class="h-20 w-full" />
				</CardContent>
			</Card>
		</div>
		<div class="space-y-4">
			<Card size="sm">
				<CardHeader class="pb-3"><CardTitle class="text-sm">Account Status</CardTitle></CardHeader>
				<CardContent class="space-y-3">
					{#each [0, 1, 2] as i (i)}
						<Skeleton class="h-4 w-full" />
					{/each}
				</CardContent>
			</Card>
		</div>
	</div>
{:else if loadError}
	<Alert variant="destructive" class="border-destructive/20 bg-destructive/5">
		<TriangleAlert class="size-4" />
		<div>
			<p class="text-xs font-medium">Could not load your company details</p>
			<p class="text-2xs text-muted-foreground">{loadError}</p>
		</div>
		<div class="col-start-2">
			<Button size="sm" variant="outline" onclick={() => void loadProfile()}>Try again</Button>
		</div>
	</Alert>
{:else}
	<div class="grid gap-3 sm:gap-4 lg:grid-cols-3">
		<div class="space-y-4 lg:col-span-2">
			<Card size="sm">
				<CardHeader class="pb-3">
					<CardTitle class="flex items-center gap-2 text-sm">
						<Building2 class="size-4 text-muted-foreground"></Building2>
						Company Details
					</CardTitle>
				</CardHeader>
				<CardContent class="p-3 sm:p-4">
					<form
						class="space-y-3 sm:space-y-4"
						bind:this={formEl}
						onsubmit={(e) => {
							e.preventDefault();
							void save();
						}}
					>
						<div class="grid gap-3 sm:grid-cols-2 sm:gap-4">
							<Field>
								<FieldLabel for="company-name">Company Name</FieldLabel>
								<Input
									id="company-name"
									bind:value={companyName}
									maxlength={200}
									placeholder="Company name"
									aria-invalid={fieldErrors.name ? true : undefined}
									oninput={() => {
										if (fieldErrors.name) fieldErrors = { ...fieldErrors, name: '' };
									}}
								/>
								{#if fieldErrors.name}<FieldError>{fieldErrors.name}</FieldError>{/if}
							</Field>
							<Field>
								<FieldLabel for="country">Country</FieldLabel>
								<Input
									id="country"
									bind:value={country}
									maxlength={100}
									placeholder="Country"
									aria-invalid={fieldErrors.country ? true : undefined}
									oninput={() => {
										if (fieldErrors.country) fieldErrors = { ...fieldErrors, country: '' };
									}}
								/>
								{#if fieldErrors.country}<FieldError>{fieldErrors.country}</FieldError>{/if}
							</Field>
						</div>
						<div class="grid gap-3 sm:grid-cols-2 sm:gap-4">
							<Field>
								<FieldLabel for="year">Year Established</FieldLabel>
								<Input
									id="year"
									bind:value={yearEstablished}
									type="number"
									min="1900"
									max={String(currentYear)}
									inputmode="numeric"
									aria-invalid={fieldErrors.yearEstablished ? true : undefined}
									oninput={() => {
										if (fieldErrors.yearEstablished)
											fieldErrors = { ...fieldErrors, yearEstablished: '' };
									}}
								/>
								{#if fieldErrors.yearEstablished}<FieldError
										>{fieldErrors.yearEstablished}</FieldError
									>{/if}
							</Field>
							<Field>
								<FieldLabel for="website">Website</FieldLabel>
								<Input
									id="website"
									bind:value={website}
									type="url"
									placeholder="https://..."
									maxlength={300}
									aria-invalid={fieldErrors.website ? true : undefined}
									oninput={() => {
										if (fieldErrors.website) fieldErrors = { ...fieldErrors, website: '' };
									}}
								/>
								{#if fieldErrors.website}<FieldError>{fieldErrors.website}</FieldError>{/if}
							</Field>
						</div>
						<Field>
							<FieldLabel for="description">Description</FieldLabel>
							<Textarea
								id="description"
								bind:value={description}
								rows={3}
								maxlength={2000}
								placeholder="Company description..."
								aria-invalid={fieldErrors.description ? true : undefined}
								oninput={() => {
									if (fieldErrors.description) fieldErrors = { ...fieldErrors, description: '' };
								}}
							/>
							{#if fieldErrors.description}<FieldError>{fieldErrors.description}</FieldError>{/if}
						</Field>
						{#if formError && Object.keys(fieldErrors).length === 0}
							<Alert variant="destructive" class="border-destructive/20 bg-destructive/5">
								<TriangleAlert class="size-4" />
								<div>
									<p class="text-xs font-medium">Could not save your changes</p>
									<p class="text-2xs text-muted-foreground">{formError}</p>
								</div>
							</Alert>
						{/if}
						<div class="flex justify-end">
							<Button type="submit" size="sm" class="w-full gap-1.5 sm:w-auto" disabled={saving}>
								<Save class="size-3.5" />
								{saving ? 'Saving…' : 'Save Changes'}
							</Button>
						</div>
					</form>
				</CardContent>
			</Card>

			<Card size="sm">
				<CardHeader class="pb-3">
					<CardTitle class="flex items-center gap-2 text-sm">
						<Users class="size-4 text-muted-foreground"></Users>
						Team &amp; access
					</CardTitle>
				</CardHeader>
				<CardContent class="space-y-3">
					<div class="flex items-center gap-3 rounded-lg bg-muted/40 px-3 py-2">
						<div
							class="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary"
						>
							{(data.supplierUser?.name ?? 'S')
								.split(/\s+/)
								.map((p) => p[0])
								.filter(Boolean)
								.slice(0, 2)
								.join('')
								.toUpperCase() || 'S'}
						</div>
						<div class="min-w-0 flex-1">
							<p class="truncate text-2xs-plus font-medium">{data.supplierUser?.name ?? '—'}</p>
							<p class="truncate text-2xs text-muted-foreground">
								{data.supplierUser?.email ?? '—'}
							</p>
						</div>
						<Badge variant="secondary" class="text-2xs">Owner</Badge>
					</div>
					<p class="text-2xs text-muted-foreground">
						Additional team members are linked to this company by HalalNeo support —
						<a href={localizeHref('/contact')} class="text-primary hover:underline">contact us</a>
						to grant access to a colleague's account.
					</p>
				</CardContent>
			</Card>
		</div>

		<div class="space-y-4">
			<Card size="sm">
				<CardHeader class="pb-3">
					<CardTitle class="text-sm">Account Status</CardTitle>
				</CardHeader>
				<CardContent class="space-y-3">
					<div class="flex items-center justify-between text-2xs-plus">
						<span class="text-muted-foreground">Verification</span>
						{#if detail}
							<Badge
								class="text-2xs {(
									statusMeta[detail.status ?? ''] ?? { cls: 'bg-muted text-muted-foreground' }
								).cls}"
							>
								{(statusMeta[detail.status ?? ''] ?? { label: 'Unknown', cls: '' }).label}
							</Badge>
						{:else}
							<span class="text-muted-foreground">—</span>
						{/if}
					</div>
					<div class="flex items-center justify-between text-2xs-plus">
						<span class="text-muted-foreground">Business type</span>
						<span class="font-medium capitalize">{detail?.businessType ?? '—'}</span>
					</div>
					<div class="flex items-center justify-between text-2xs-plus">
						<span class="text-muted-foreground">Active products</span>
						<a
							href={localizeHref('/supplier/products')}
							class="font-medium text-primary hover:underline"
						>
							{activeProducts === null ? '—' : activeProducts}
						</a>
					</div>
					<div class="flex items-center justify-between text-2xs-plus">
						<span class="text-muted-foreground">Listed as</span>
						<span class="max-w-[60%] truncate font-medium" title={detail?.slug}>{detail?.slug}</span
						>
					</div>
					<div class="flex items-center justify-between text-2xs-plus">
						<span class="text-muted-foreground">Member since</span>
						<span class="font-medium">{memberSince}</span>
					</div>
				</CardContent>
			</Card>

			<Card size="sm">
				<CardHeader class="pb-3">
					<CardTitle class="flex items-center gap-2 text-sm">
						<BadgeCheck class="size-4 text-muted-foreground"></BadgeCheck>
						Certifications
					</CardTitle>
				</CardHeader>
				<CardContent class="space-y-2">
					{#if certificationList.length > 0}
						{#each certificationList as cert (cert.name)}
							<div class="flex items-center gap-2 rounded-lg bg-muted/40 px-2.5 py-2 text-2xs-plus">
								<Badge class="bg-success/10 text-2xs text-success">{cert.name}</Badge>
								<span class="truncate text-muted-foreground">{cert.scope}</span>
							</div>
						{/each}
					{:else}
						<Empty class="border-0 p-0">
							<BrandedEmptyMedia
								><BadgeCheck class="size-6 text-muted-foreground" /></BrandedEmptyMedia
							>
							<EmptyHeader>
								<EmptyTitle>No certifications on file</EmptyTitle>
								<EmptyDescription>
									Send your certificate details to HalalNeo support and our team will add them after
									verification.
								</EmptyDescription>
							</EmptyHeader>
							<EmptyContent>
								<Button variant="outline" size="sm" href={localizeHref('/contact')}>
									Contact support
								</Button>
							</EmptyContent>
						</Empty>
					{/if}
					{#if certificationList.length > 0}
						<Button
							variant="outline"
							size="sm"
							class="mt-2 w-full text-2xs"
							href={localizeHref('/contact')}
						>
							Contact support
						</Button>
					{/if}
				</CardContent>
			</Card>
		</div>
	</div>
{/if}
