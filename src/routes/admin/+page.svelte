<script lang="ts">
	import { adminData } from '#lib/stores/admin-data.svelte.js';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '#lib/components/ui/card/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle
	} from '#lib/components/ui/dialog/index.js';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import Users from '@lucide/svelte/icons/users';
	import Store from '@lucide/svelte/icons/store';
	import Package from '@lucide/svelte/icons/package';
	import FolderTree from '@lucide/svelte/icons/folder-tree';
	import BadgeCheck from '@lucide/svelte/icons/badge-check';
	import Inbox from '@lucide/svelte/icons/inbox';
	import Mail from '@lucide/svelte/icons/mail';
	import Clock from '@lucide/svelte/icons/clock';
	import Check from '@lucide/svelte/icons/check';
	import X from '@lucide/svelte/icons/x';
	import Globe from '@lucide/svelte/icons/globe';

	let { data } = $props();

	const activeSuppliers = $derived(adminData.suppliers.filter((s) => s.status === 'active').length);
	const pendingSuppliers = $derived(
		adminData.suppliers.filter((s) => s.status === 'pending').length
	);
	const certifiedProducts = $derived(
		adminData.products.filter((s) => s.certStatus === 'certified').length
	);
	const pendingProducts = $derived(
		adminData.products.filter((s) => s.certStatus === 'pending').length
	);
	const notCertifiedProducts = $derived(
		adminData.products.filter((s) => s.certStatus === 'not-certified').length
	);

	interface ApplicationRow {
		slug: string;
		name: string;
		country: string;
		businessType: string;
		email: string | null;
		website: string | null;
		adminNotes: string | null;
		createdAt: number | string;
		applicationText: string | null;
	}

	let liveApplications = $state<ApplicationRow[]>([]);
	let livePendingCount = $state(0);
	let loaded = $state(false);

	$effect(() => {
		liveApplications = ((data.applications ?? []) as ApplicationRow[]).map((a) => ({ ...a }));
		livePendingCount = data.pendingCount ?? 0;
		loaded = true;
	});

	// Review dialog state
	let reviewOpen = $state(false);
	let reviewTarget = $state<ApplicationRow | null>(null);
	let reviewFeedback = $state('');
	let reviewError = $state('');
	let reviewBusy = $state(false);

	function openReview(app: ApplicationRow) {
		reviewTarget = app;
		reviewFeedback = '';
		reviewError = '';
		reviewOpen = true;
	}

	async function review(decision: 'active' | 'rejected') {
		if (!reviewTarget || reviewBusy) return;
		if (decision === 'rejected' && !reviewFeedback.trim()) {
			reviewError = 'Please include a reason when rejecting an application.';
			return;
		}
		reviewBusy = true;
		reviewError = '';
		try {
			const res = await fetch(`/api/suppliers/${reviewTarget.slug}`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					status: decision,
					adminNotes: reviewFeedback.trim() || null
				})
			});
			if (!res.ok) {
				const body = (await res.json().catch(() => ({}))) as { error?: string };
				throw new Error(body?.error ?? `Failed to ${decision === 'active' ? 'approve' : 'reject'}`);
			}
			// Optimistically remove from the pending list and decrement the count.
			liveApplications = liveApplications.filter((a) => a.slug !== reviewTarget!.slug);
			livePendingCount = Math.max(0, livePendingCount - 1);
			reviewOpen = false;
			reviewTarget = null;
		} catch (e: any) {
			reviewError = e?.message ?? 'Something went wrong. Please try again.';
		} finally {
			reviewBusy = false;
		}
	}

	function formatTime(ts: number | string): string {
		const d = new Date(ts);
		const now = Date.now();
		const diff = now - d.getTime();
		const minutes = Math.floor(diff / 60_000);
		if (minutes < 1) return 'just now';
		if (minutes < 60) return `${minutes}m ago`;
		const hours = Math.floor(minutes / 60);
		if (hours < 24) return `${hours}h ago`;
		const days = Math.floor(hours / 24);
		if (days < 7) return `${days}d ago`;
		return d.toISOString().slice(0, 10);
	}
</script>

<div class="space-y-4 sm:space-y-8">
	<div class="space-y-1">
		<h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">Dashboard</h1>
		<p class="max-w-2xl text-sm text-muted-foreground">
			Operational overview of the HalalNeo demo dataset.
		</p>
	</div>

	{#if livePendingCount > 0}
		<Card class="border-info/30 bg-info/5">
			<CardHeader>
				<div class="flex items-center justify-between gap-3">
					<div class="flex items-center gap-2">
						<Inbox class="size-5 text-info"></Inbox>
						<CardTitle class="text-lg">Recent supplier applications</CardTitle>
					</div>
					<Badge variant="secondary">{livePendingCount} pending</Badge>
				</div>
				<CardDescription>
					New applications submitted through <a href="/supplier/onboarding" class="underline underline-offset-2 hover:text-foreground">/supplier/onboarding</a>. Approve to make the supplier public, or reject with feedback. Both actions update the live D1 record.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<ul class="divide-y divide-border">
					{#each liveApplications as app (app.slug)}
						<li class="flex items-center gap-3 py-2.5">
							<div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-xs font-semibold text-primary">
								{app.name
									.split(/\s+/)
									.map((p) => p[0])
									.filter(Boolean)
									.slice(0, 2)
									.join('')
									.toUpperCase()}
							</div>
							<div class="min-w-0 flex-1">
								<p class="truncate text-sm font-medium">{app.name}</p>
								<p class="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
									<span>{app.country}</span>
									<span aria-hidden="true">·</span>
									<span class="capitalize">{app.businessType}</span>
									{#if app.email}
										<span aria-hidden="true">·</span>
										<a href="mailto:{app.email}" class="inline-flex items-center gap-1 hover:text-foreground">
											<Mail class="size-3"></Mail>
											{app.email}
										</a>
									{/if}
								</p>
							</div>
							<div class="flex shrink-0 items-center gap-1 text-[10px] text-muted-foreground">
								<Clock class="size-3"></Clock>
								{formatTime(app.createdAt)}
							</div>
							<Button variant="outline" size="sm" class="shrink-0 text-[10px]" onclick={() => openReview(app)}>
								Review
							</Button>
						</li>
					{/each}
				</ul>
				{#if liveApplications.length < livePendingCount}
					<p class="mt-3 text-[10px] text-muted-foreground">
						Showing {liveApplications.length} of {livePendingCount} pending applications.
					</p>
				{/if}
			</CardContent>
		</Card>
	{/if}

	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
		<Card>
			<CardHeader class="gap-2">
				<Users class="size-5 text-primary"></Users>
				<CardTitle class="text-2xl">{adminData.suppliers.length}</CardTitle>
				<CardDescription>Suppliers (sellers)</CardDescription>
			</CardHeader>
		</Card>
		<Card>
			<CardHeader class="gap-2">
				<Package class="size-5 text-primary"></Package>
				<CardTitle class="text-2xl">{adminData.products.length}</CardTitle>
				<CardDescription>Products (SKUs)</CardDescription>
			</CardHeader>
		</Card>
		<Card>
			<CardHeader class="gap-2">
				<FolderTree class="size-5 text-primary"></FolderTree>
				<CardTitle class="text-2xl">{adminData.categories.length}</CardTitle>
				<CardDescription>Categories</CardDescription>
			</CardHeader>
		</Card>
		<Card>
			<CardHeader class="gap-2">
				<BadgeCheck class="size-5 text-primary"></BadgeCheck>
				<CardTitle class="text-2xl">{adminData.certifyingBodies.length}</CardTitle>
				<CardDescription>Certifying bodies</CardDescription>
			</CardHeader>
		</Card>
	</div>

	<div class="grid gap-4 lg:grid-cols-2">
		<Card>
			<CardHeader>
				<CardTitle>Supplier status</CardTitle>
				<CardDescription>{activeSuppliers} active · {pendingSuppliers} pending</CardDescription>
			</CardHeader>
			<CardContent class="flex flex-wrap items-center gap-2">
				<Badge variant="default">Active {activeSuppliers}</Badge>
				<Badge variant="secondary">Pending {pendingSuppliers}</Badge>
			</CardContent>
		</Card>
		<Card>
			<CardHeader>
				<CardTitle>Product certification</CardTitle>
				<CardDescription>
					{certifiedProducts} verified · {pendingProducts} pending · {notCertifiedProducts} not certified
				</CardDescription>
			</CardHeader>
			<CardContent class="flex flex-wrap items-center gap-2">
				<Badge variant="default">Certified {certifiedProducts}</Badge>
				<Badge variant="secondary">Pending {pendingProducts}</Badge>
				<Badge variant="destructive">Not certified {notCertifiedProducts}</Badge>
			</CardContent>
		</Card>
	</div>

	<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
		<Card>
			<CardHeader>
				<CardTitle class="text-lg">Knowledge base</CardTitle>
				<CardDescription
					>{adminData.kbSections.length} sections · {adminData.kbArticles.length} articles</CardDescription
				>
			</CardHeader>
			<CardContent>
				<Button href={localizeHref('/admin/knowledge')} variant="outline" size="sm"
					>Manage articles</Button
				>
			</CardContent>
		</Card>
		<Card>
			<CardHeader>
				<CardTitle class="text-lg">Content</CardTitle>
				<CardDescription
					>{adminData.glossary.length} glossary terms · {adminData.blogPosts.length} blog posts</CardDescription
				>
			</CardHeader>
			<CardContent>
				<Button href={localizeHref('/admin/blog')} variant="outline" size="sm">Manage blog</Button>
			</CardContent>
		</Card>
		<Card>
			<CardHeader>
				<CardTitle class="text-lg">AI tools</CardTitle>
				<CardDescription
					>{adminData.aiTools.filter((t) => t.status === 'active').length} of {adminData.aiTools
						.length} enabled</CardDescription
				>
			</CardHeader>
			<CardContent>
				<Button href={localizeHref('/admin/ai-tools')} variant="outline" size="sm"
					>Manage tools</Button
				>
			</CardContent>
		</Card>
	</div>
</div>

<Dialog bind:open={reviewOpen}>
	<DialogContent class="max-h-[85dvh] overflow-y-auto sm:max-w-lg">
		<DialogHeader>
			<DialogTitle>Review application</DialogTitle>
			<DialogDescription>
				{reviewTarget?.name ?? ''} — {reviewTarget?.country ?? ''}
			</DialogDescription>
		</DialogHeader>

		{#if reviewTarget}
			<div class="space-y-3">
				<div class="flex flex-wrap items-center gap-2 text-xs">
					<Badge variant="secondary" class="capitalize">{reviewTarget.businessType}</Badge>
					{#if reviewTarget.email}
						<a href="mailto:{reviewTarget.email}" class="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
							<Mail class="size-3"></Mail>
							{reviewTarget.email}
						</a>
					{/if}
					{#if reviewTarget.website}
						<a href={reviewTarget.website} target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
							<Globe class="size-3"></Globe>
							Website
						</a>
					{/if}
					<span class="inline-flex items-center gap-1 text-muted-foreground">
						<Clock class="size-3"></Clock>
						{formatTime(reviewTarget.createdAt)}
					</span>
				</div>

				<div class="max-h-48 overflow-y-auto rounded-lg bg-muted/50 p-3">
					<p class="mb-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Application details</p>
					{#if reviewTarget.applicationText}
						<pre class="whitespace-pre-wrap font-sans text-[11px] leading-relaxed">{reviewTarget.applicationText}</pre>
					{:else}
						<p class="text-[11px] text-muted-foreground">No application text available.</p>
					{/if}
				</div>

				<div class="space-y-1">
					<p class="text-[11px] font-medium">Feedback to the applicant</p>
					<Textarea
						bind:value={reviewFeedback}
						placeholder="Optional for approval. Required when rejecting — this is recorded as the review note."
						class="min-h-20 text-xs"
					></Textarea>
					{#if reviewTarget.adminNotes}
						<p class="text-[10px] text-muted-foreground">Previous note: {reviewTarget.adminNotes}</p>
					{/if}
				</div>

				{#if reviewError}
					<p class="text-xs text-destructive">{reviewError}</p>
				{/if}
			</div>
		{/if}

		<DialogFooter class="gap-2 sm:gap-0">
			<Button variant="outline" size="sm" disabled={reviewBusy} onclick={() => (reviewOpen = false)}>
				Cancel
			</Button>
			<Button
				variant="destructive"
				size="sm"
				disabled={reviewBusy}
				onclick={() => review('rejected')}
			>
				<X class="size-3.5"></X>
				Reject
			</Button>
			<Button
				size="sm"
				disabled={reviewBusy}
				onclick={() => review('active')}
			>
				<Check class="size-3.5"></Check>
				Approve
			</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
