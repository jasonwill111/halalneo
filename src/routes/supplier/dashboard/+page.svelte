<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageProps } from './$types';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '#lib/components/ui/table/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import { Field, FieldLabel, FieldError } from '#lib/components/ui/field/index.js';
	import { Skeleton } from '#lib/components/ui/skeleton/index.js';
	import { toast } from 'svelte-sonner';
	import Plus from '@lucide/svelte/icons/plus';
	import MessageCircle from '@lucide/svelte/icons/message-circle';
	import Package from '@lucide/svelte/icons/package';
	import Eye from '@lucide/svelte/icons/eye';
	import BarChart3 from '@lucide/svelte/icons/bar-chart-3';
	import Tag from '@lucide/svelte/icons/tag';
	import ShieldQuestion from '@lucide/svelte/icons/shield-question';
	import { z } from 'zod';
	import { focusFirstInvalid, mergeServerDetails } from '#lib/utils/forms.js';
	import StatTile from '#lib/components/site/stat-tile.svelte';
	import ErrorRetry from '#lib/components/site/error-retry.svelte';
	import { describeFetchFailure, describeThrownFailure, type LoadFailure } from '#lib/utils/load-error.js';
	import type { InquiryDto, InquiryListResponse } from '#lib/schemas/inquiries.js';

	let { data }: PageProps = $props();

	// ---- Session-derived identity (src/routes/supplier/+layout.server.ts) ----
	const supplierSlug = $derived(data.supplierSlug);
	const profile = $derived(data.supplierProfile);
	const greetingName = $derived(profile?.name ?? data.supplierUser?.name ?? 'Supplier');

	const VERIFICATION: Record<string, { label: string; note: string }> = {
		active: { label: 'verified', note: 'Your public profile is live and searchable.' },
		pending: {
			label: 'under review',
			note: 'Your profile is not public yet — the HalalNeo team is reviewing it.'
		},
		suspended: {
			label: 'suspended',
			note: 'Your public profile is hidden. Contact HalalNeo support to restore it.'
		},
		rejected: {
			label: 'declined',
			note: 'Your application was declined. Contact HalalNeo support for the reason.'
		}
	};
	const verification = $derived(VERIFICATION[profile?.status ?? ''] ?? null);

	// ---- Live counts (real endpoints, projection-only list calls) ----
	let activeListings = $state<number | null>(null);
	let inquiryTotal = $state<number | null>(null);
	let pendingInquiries = $state<number | null>(null);
	let recent = $state<InquiryDto[]>([]);
	let analytics = $state<ViewsAnalytics | null>(null);
	let loading = $state(true);
	let loadFailure = $state<LoadFailure | null>(null);
	let analyticsFailed = $state(false);

	type ViewsAnalytics = {
		profileViewsTotal: number;
		profileViews30d: number;
		daily: { day: string; views: number }[];
		topProducts: { slug: string; name: string; views: number | null }[];
	};

	let requestId = 0;

	const maxDaily = $derived(Math.max(1, ...(analytics?.daily ?? []).map((d) => d.views)));

	/** Never rejects: a failed/unreachable request comes back as a `LoadFailure`. */
	async function getJson<T>(url: string): Promise<{ data: T | null; failure: LoadFailure | null }> {
		try {
			const res = await fetch(url);
			if (!res.ok) return { data: null, failure: describeFetchFailure(res) };
			return { data: (await res.json()) as T, failure: null };
		} catch (e) {
			return { data: null, failure: describeThrownFailure(e) };
		}
	}

	async function loadDashboard(slug: string) {
		const id = ++requestId;
		const qs = encodeURIComponent(slug);
		loading = true;
		loadFailure = null;
		analyticsFailed = false;

		// `limit=1` everywhere we only need `total` — both products and inquiries
		// count queries are indexed on supplier_slug.
		const [products, inquiries, pending, views] = await Promise.all([
			getJson<{ total?: number }>(
				`/api/products?supplierSlug=${qs}&status=active&limit=1`
			),
			getJson<InquiryListResponse>(`/api/inquiries?supplierSlug=${qs}&limit=5`),
			getJson<{ total?: number }>(
				`/api/inquiries?supplierSlug=${qs}&status=pending&limit=1`
			),
			// Membership-checked server-side (supplier_members).
			getJson<ViewsAnalytics>(`/api/views?supplierSlug=${qs}`)
		]);
		if (id !== requestId) return; // a newer load won the race

		activeListings = products.data?.total ?? null;
		inquiryTotal = inquiries.data?.total ?? null;
		recent = inquiries.data?.items ?? [];
		pendingInquiries = pending.data?.total ?? null;
		analytics = views.data;
		analyticsFailed = views.failure !== null;
		loadFailure = products.failure ?? inquiries.failure ?? pending.failure;
		loading = false;
	}

	$effect(() => {
		const slug = supplierSlug;
		if (!slug) {
			loading = false;
			return;
		}
		void loadDashboard(slug);
	});

	function formatDate(raw: string | null | undefined): string {
		if (!raw) return '—';
		const d = new Date(raw);
		return Number.isNaN(d.getTime())
			? '—'
			: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	}

	function humanize(slug: string | null | undefined, fallback: string): string {
		if (!slug) return fallback;
		return slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
	}

	// ---- Quick-deal publish form (supplier member + weekly quota, POST /api/promotions) ----
	let dealTitle = $state('');
	let dealDesc = $state('');
	let dealDiscount = $state('');
	let dealPrice = $state('');
	let dealMoq = $state('');
	let dealValid = $state('');
	let dealSending = $state(false);
	let dealFieldErrors = $state<Record<string, string>>({});
	let dealFormEl = $state<HTMLFormElement | undefined>(undefined);

	const dealClientSchema = z.object({
		title: z
			.string()
			.trim()
			.min(5, 'Deal title needs at least 5 characters.')
			.max(200, 'Deal title must be at most 200 characters.'),
		description: z.string().trim().max(5000, 'Details must be at most 5000 characters.'),
		discountPct: z.preprocess(
			(v) => (v === '' || v == null ? null : Number(v)),
			z
				.number()
				.int('Discount must be a whole number.')
				.min(1, 'Discount must be between 1 and 99.')
				.max(99, 'Discount must be between 1 and 99.')
				.nullable()
		),
		priceMin: z.string().trim().max(50, 'Price must be at most 50 characters.'),
		moq: z.string().trim().max(200, 'MOQ must be at most 200 characters.'),
		validUntil: z.string().max(30, 'Date must be at most 30 characters.')
	});

	// Server `details` use API field names — remap to the deal form state keys.
	const DEAL_SERVER_TO_CLIENT: Record<string, string> = {
		title: 'dealTitle',
		description: 'dealDesc',
		discountPct: 'dealDiscount',
		priceMin: 'dealPrice',
		moq: 'dealMoq',
		validUntil: 'dealValid'
	};

	async function publishDeal() {
		const slug = supplierSlug;
		if (!slug || dealSending) return; // double-submit guard (§3.4)
		dealFieldErrors = {};
		const parsed = dealClientSchema.safeParse({
			title: dealTitle,
			description: dealDesc,
			discountPct: dealDiscount,
			priceMin: dealPrice,
			moq: dealMoq,
			validUntil: dealValid
		});
		if (!parsed.success) {
			for (const issue of parsed.error.issues) {
				const key = DEAL_SERVER_TO_CLIENT[String(issue.path[0] ?? '')] ?? '';
				if (key && !dealFieldErrors[key]) dealFieldErrors = { ...dealFieldErrors, [key]: issue.message };
			}
			focusFirstInvalid(dealFormEl);
			return;
		}
		dealSending = true;
		try {
			const res = await fetch('/api/promotions', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					supplierSlug: slug,
					title: dealTitle.trim(),
					description: dealDesc.trim() || null,
					discountPct: dealDiscount ? Number(dealDiscount) : null,
					priceMin: dealPrice.trim() || null,
					moq: dealMoq.trim() || null,
					validUntil: dealValid || null
				})
			});
			const json = (await res.json().catch(() => ({}))) as {
				error?: string;
				details?: Record<string, string[] | string>;
				remaining?: number;
			};
			if (!res.ok) {
				if (json.details) {
					const remapped: Record<string, string[] | string> = {};
					for (const [k, v] of Object.entries(json.details)) {
						remapped[DEAL_SERVER_TO_CLIENT[k] ?? k] = v;
					}
					dealFieldErrors = mergeServerDetails(dealFieldErrors, remapped);
					focusFirstInvalid(dealFormEl);
				}
				toast.error(json.error ?? 'Failed to publish deal.');
				return;
			}
			dealTitle = '';
			dealDesc = '';
			dealDiscount = '';
			dealPrice = '';
			dealMoq = '';
			dealValid = '';
			toast.success(
				typeof json.remaining === 'number'
					? `Deal published — ${json.remaining} left this week.`
					: 'Deal published to the public board.'
			);
		} catch {
			toast.error('Network error — the deal was not published. Please try again.');
		} finally {
			dealSending = false;
		}
	}
</script>

<svelte:head>
	<title>Supplier Dashboard — HalalNeo</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

{#if !supplierSlug}
	<div class="rounded-xl bg-card p-6 ring-1 ring-foreground/10">
		<div class="flex items-start gap-3">
			<div class="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
				<ShieldQuestion class="size-5 text-primary" />
			</div>
			<div class="space-y-1">
				<h1 class="text-lg font-semibold tracking-tight">Welcome, {data.supplierUser?.name ?? 'there'}</h1>
				<p class="max-w-md text-sm text-muted-foreground">
					Your account isn't linked to a supplier company yet, so there is no dashboard data
					to show. Apply for access and an administrator will connect this account to your
					company profile.
				</p>
				<div class="flex flex-wrap gap-2 pt-1">
					<Button size="sm" href={localizeHref('/supplier/onboarding')}>
						Apply to become a supplier
					</Button>
					<Button size="sm" variant="outline" href={localizeHref('/contact')}>
						Contact support
					</Button>
				</div>
			</div>
		</div>
	</div>
{:else}
	<div
		class="rounded-xl border p-3 {verification?.label === 'verified'
			? 'border-success/20 bg-success/5'
			: 'border-border/50 bg-card'}"
	>
		<div class="flex flex-wrap items-center gap-2">
			<Eye class="size-4 text-muted-foreground" />
			<span class="text-xs font-medium">Welcome back, {greetingName}!</span>
			{#if verification}
				<Badge variant="secondary" class="text-2xs capitalize">{verification.label}</Badge>
				<span class="text-2xs-plus text-muted-foreground">{verification.note}</span>
			{:else}
				<span class="text-2xs-plus text-muted-foreground">Profile status unavailable.</span>
			{/if}
		</div>
	</div>

	<div class="mt-3 flex flex-wrap gap-2">
		<StatTile
			value={activeListings ?? '—'}
			label="Active listings"
			tone="primary"
			hint="public products"
			loading={loading}
		>
			{#snippet icon()}
				<Package class="size-4" />
			{/snippet}
		</StatTile>
		<StatTile
			value={inquiryTotal ?? '—'}
			label="Inquiries"
			tone="info"
			hint="all time"
			loading={loading}
		>
			{#snippet icon()}
				<MessageCircle class="size-4" />
			{/snippet}
		</StatTile>
		<StatTile
			value={pendingInquiries ?? '—'}
			label="Awaiting reply"
			tone="warn"
			hint="pending status"
			loading={loading}
		>
			{#snippet icon()}
				<Tag class="size-4" />
			{/snippet}
		</StatTile>
		<StatTile
			value={analytics ? analytics.profileViewsTotal : '—'}
			label="Profile views"
			tone="success"
			hint={analytics ? `${analytics.profileViews30d} in last 30 days` : 'live beacon data'}
			loading={loading}
		>
			{#snippet icon()}
				<BarChart3 class="size-4" />
			{/snippet}
		</StatTile>
	</div>

	<div class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
		<Button
			variant="outline"
			class="flex items-center justify-start gap-2 rounded-xl p-3"
			href={localizeHref('/supplier/products')}
		>
			<div class="flex size-8 items-center justify-center rounded-lg bg-primary/10">
				<Package class="size-4 text-primary" />
			</div>
			<div class="text-start">
				<div class="text-2xs-plus font-medium">My products</div>
				<div class="text-2xs text-muted-foreground">See every listing and its status</div>
			</div>
		</Button>
		<Button
			variant="outline"
			class="flex items-center justify-start gap-2 rounded-xl p-3"
			href={localizeHref('/supplier/orders')}
		>
			<div class="flex size-8 items-center justify-center rounded-lg bg-primary/10">
				<MessageCircle class="size-4 text-primary" />
			</div>
			<div class="text-start">
				<div class="text-2xs-plus font-medium">View messages</div>
				<div class="text-2xs text-muted-foreground">
					{pendingInquiries === null ? 'Buyer inquiries' : `${pendingInquiries} awaiting reply`}
				</div>
			</div>
		</Button>
	</div>

	<ErrorRetry
		failure={loadFailure}
		subject="your dashboard"
		onretry={() => loadDashboard(supplierSlug ?? '')}
	/>

	<!-- Recent inquiries -->
	<div class="mt-3 rounded-xl bg-card p-3 ring-1 ring-foreground/10">
		<div class="mb-2 flex items-center justify-between gap-2">
			<h2 class="text-sm font-semibold">Recent inquiries</h2>
			<Button
				variant="ghost"
				size="sm"
				class="text-2xs text-primary"
				onclick={() => void goto(localizeHref('/supplier/orders'))}
			>
				View all
			</Button>
		</div>
		<div class="overflow-x-auto">
			{#if loading}
				<div class="space-y-2" aria-label="Loading recent inquiries">
					{#each [0, 1, 2] as i (i)}
						<Skeleton class="h-8 w-full" />
					{/each}
				</div>
			{:else if loadFailure}
				<p class="py-6 text-center text-xs text-muted-foreground">
					Inquiries unavailable — use “Try again” above.
				</p>
			{:else if recent.length === 0}
				<p class="py-6 text-center text-xs text-muted-foreground">
					No inquiries yet — buyers reach you from your public profile and listings.
				</p>
			{:else}
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead class="text-2xs">Subject</TableHead>
							<TableHead class="text-2xs">Buyer</TableHead>
							<TableHead class="text-2xs">Product</TableHead>
							<TableHead class="text-2xs">Date</TableHead>
							<TableHead class="text-2xs">Status</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{#each recent as inquiry (inquiry.id)}
							<TableRow>
								<TableCell class="max-w-[220px] truncate text-2xs-plus font-medium" title={inquiry.subject}>
									{inquiry.subject}
								</TableCell>
								<TableCell class="text-2xs">{humanize(inquiry.buyerSlug, '—')}</TableCell>
								<TableCell class="text-2xs text-muted-foreground">
									{humanize(inquiry.productSlug, 'General inquiry')}
								</TableCell>
								<TableCell class="text-2xs text-muted-foreground">
									{formatDate(inquiry.createdAt)}
								</TableCell>
								<TableCell>
									<Badge variant="secondary" class="capitalize text-2xs">
										{inquiry.status}
									</Badge>
								</TableCell>
							</TableRow>
						{/each}
					</TableBody>
				</Table>
			{/if}
		</div>
	</div>

	<!-- Live profile analytics (GET /api/views, membership-scoped on the server) -->
	<div class="mt-3 rounded-xl bg-card p-3 ring-1 ring-foreground/10">
		<div class="mb-2 flex items-center gap-1.5">
			<BarChart3 class="size-3.5 text-muted-foreground" />
			<h2 class="text-sm font-semibold">Profile analytics</h2>
			<Badge variant="secondary" class="ms-auto text-2xs">{supplierSlug}</Badge>
		</div>
		{#if loading && !analytics}
			<div class="grid grid-cols-2 gap-2" aria-label="Loading analytics">
				{#each [0, 1] as i (i)}
					<div class="space-y-1.5 rounded-xl bg-muted/50 px-3 py-2">
						<Skeleton class="h-3 w-20" />
						<Skeleton class="h-6 w-14" />
					</div>
				{/each}
				<Skeleton class="col-span-2 h-16 w-full" />
			</div>
		{:else if analyticsFailed || !analytics}
			<p class="rounded-xl bg-muted/40 px-3 py-4 text-center text-2xs-plus text-muted-foreground">
				Analytics are unavailable right now. They are only served for the supplier company
				your account is a member of.
			</p>
		{:else}
			<div class="mb-2 grid grid-cols-2 gap-2">
				<div class="rounded-xl bg-muted/50 px-3 py-2">
					<div class="text-2xs text-muted-foreground">Total views</div>
					<div class="text-lg font-bold tabular-nums">{analytics.profileViewsTotal}</div>
				</div>
				<div class="rounded-xl bg-muted/50 px-3 py-2">
					<div class="text-2xs text-muted-foreground">Last 30 days</div>
					<div class="text-lg font-bold tabular-nums">{analytics.profileViews30d}</div>
				</div>
			</div>
			{#if analytics.daily.length > 0}
				<div class="flex h-16 items-end gap-1" aria-hidden="true">
					{#each analytics.daily as d (d.day)}
						<div
							class="min-w-0 flex-1 rounded-sm bg-primary/70"
							style="height: {Math.max(6, Math.round((d.views / maxDaily) * 100))}%"
							title="{d.day}: {d.views} views"
						></div>
					{/each}
				</div>
				<p class="mt-1 text-2xs text-muted-foreground">Daily profile views over the last 30 days.</p>
			{/if}
			{#if analytics.topProducts.length > 0}
				<h3 class="mb-1 mt-3 text-2xs font-semibold text-muted-foreground">
					Top products by views
				</h3>
				<div class="space-y-1">
					{#each analytics.topProducts as p (p.slug)}
						<div class="flex items-center justify-between gap-2 text-2xs-plus">
							<span class="truncate font-medium">{p.name}</span>
							<span class="shrink-0 tabular-nums text-muted-foreground">{p.views ?? 0} views</span>
						</div>
					{/each}
				</div>
			{/if}
		{/if}
	</div>

	<!-- Publish a Quick Deal (1/week free) -->
	<div class="mt-3 rounded-xl bg-card p-3 ring-1 ring-foreground/10">
		<div class="mb-2 flex items-center gap-1.5">
			<Tag class="size-3.5 text-muted-foreground" />
			<h2 class="text-sm font-semibold">Publish a Quick Deal</h2>
		</div>
		<form
			class="space-y-2"
			bind:this={dealFormEl}
			onsubmit={(e) => {
				e.preventDefault();
				void publishDeal();
			}}
		>
			<Field>
				<FieldLabel for="deal-title">Deal title *</FieldLabel>
				<Input
					id="deal-title"
					type="text"
					bind:value={dealTitle}
					placeholder="e.g. 20% off frozen chicken cartons"
					maxlength={200}
					class="text-xs"
					aria-invalid={dealFieldErrors.dealTitle ? true : undefined}
					oninput={() => {
						if (dealFieldErrors.dealTitle) dealFieldErrors = { ...dealFieldErrors, dealTitle: '' };
					}}
				/>
				{#if dealFieldErrors.dealTitle}
					<FieldError>{dealFieldErrors.dealTitle}</FieldError>
				{/if}
			</Field>
			<Field>
				<FieldLabel for="deal-desc">Details</FieldLabel>
				<Textarea
					id="deal-desc"
					bind:value={dealDesc}
					placeholder="Stock quantity, terms..."
					rows={2}
					maxlength={5000}
					class="text-xs"
					aria-invalid={dealFieldErrors.dealDesc ? true : undefined}
					oninput={() => {
						if (dealFieldErrors.dealDesc) dealFieldErrors = { ...dealFieldErrors, dealDesc: '' };
					}}
				/>
				{#if dealFieldErrors.dealDesc}
					<FieldError>{dealFieldErrors.dealDesc}</FieldError>
				{/if}
			</Field>
			<div class="grid grid-cols-2 gap-2 sm:grid-cols-4">
				<Field>
					<FieldLabel for="deal-discount">Discount %</FieldLabel>
					<Input
						id="deal-discount"
						type="number"
						min={1}
						max={99}
						bind:value={dealDiscount}
						placeholder="20"
						class="text-xs"
						aria-invalid={dealFieldErrors.dealDiscount ? true : undefined}
						oninput={() => {
							if (dealFieldErrors.dealDiscount)
								dealFieldErrors = { ...dealFieldErrors, dealDiscount: '' };
						}}
					/>
					{#if dealFieldErrors.dealDiscount}
						<FieldError>{dealFieldErrors.dealDiscount}</FieldError>
					{/if}
				</Field>
				<Field>
					<FieldLabel for="deal-price">Price</FieldLabel>
					<Input
						id="deal-price"
						type="text"
						bind:value={dealPrice}
						placeholder="$4.10/kg"
						maxlength={50}
						class="text-xs"
						aria-invalid={dealFieldErrors.dealPrice ? true : undefined}
						oninput={() => {
							if (dealFieldErrors.dealPrice) dealFieldErrors = { ...dealFieldErrors, dealPrice: '' };
						}}
					/>
					{#if dealFieldErrors.dealPrice}
						<FieldError>{dealFieldErrors.dealPrice}</FieldError>
					{/if}
				</Field>
				<Field>
					<FieldLabel for="deal-moq">MOQ</FieldLabel>
					<Input
						id="deal-moq"
						type="text"
						bind:value={dealMoq}
						placeholder="100 cartons"
						maxlength={200}
						class="text-xs"
						aria-invalid={dealFieldErrors.dealMoq ? true : undefined}
						oninput={() => {
							if (dealFieldErrors.dealMoq) dealFieldErrors = { ...dealFieldErrors, dealMoq: '' };
						}}
					/>
					{#if dealFieldErrors.dealMoq}
						<FieldError>{dealFieldErrors.dealMoq}</FieldError>
					{/if}
				</Field>
				<Field>
					<FieldLabel for="deal-valid">Valid until</FieldLabel>
					<Input
						id="deal-valid"
						type="date"
						bind:value={dealValid}
						maxlength={30}
						class="text-xs"
						aria-invalid={dealFieldErrors.dealValid ? true : undefined}
						oninput={() => {
							if (dealFieldErrors.dealValid) dealFieldErrors = { ...dealFieldErrors, dealValid: '' };
						}}
					/>
					{#if dealFieldErrors.dealValid}
						<FieldError>{dealFieldErrors.dealValid}</FieldError>
					{/if}
				</Field>
			</div>
			<div class="flex items-center justify-between gap-2">
				<p class="text-2xs text-muted-foreground">Free plan: 1 deal per week.</p>
				<Button type="submit" size="sm" class="gap-1.5" disabled={dealSending || !dealTitle.trim()}>
					<Plus class="size-3.5" />
					{dealSending ? 'Publishing…' : 'Publish deal'}
				</Button>
			</div>
		</form>
	</div>
{/if}
