<script lang="ts">
	import { localizeHref } from '$lib/paraglide/runtime.js';
	import { getCurrentAccount, signOut } from '$lib/stores/auth.svelte';
	import { adminData } from '$lib/stores/admin-data.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import LogOut from '@lucide/svelte/icons/log-out';
	import PackageSearch from '@lucide/svelte/icons/package-search';
	import Store from '@lucide/svelte/icons/store';
	import Package from '@lucide/svelte/icons/package';
	import FileText from '@lucide/svelte/icons/file-text';
	import ClipboardCheck from '@lucide/svelte/icons/clipboard-check';

	const verifiedSuppliers = $derived(adminData.merchants.filter((m) => m.status === 'active'));
	const certifiedSkus = $derived(adminData.skus.filter((s) => s.certStatus === 'certified'));
	let currentAccount = $derived(getCurrentAccount());
</script>

<svelte:head><title>Account — HalalNeo</title></svelte:head>

{#if !currentAccount}
	<section class="mx-auto flex min-h-[70dvh] w-full max-w-md flex-col items-center justify-center py-8">
		<Card class="w-full">
			<CardHeader class="text-center">
				<CardTitle class="text-2xl tracking-tight">Account</CardTitle>
				<CardDescription>Sign in to view your buyer or seller dashboard</CardDescription>
			</CardHeader>
			<CardContent class="flex flex-col gap-3">
				<Button href={localizeHref('/login')} variant="default" class="w-full">
					Sign in
				</Button>
				<Button href={localizeHref('/register')} variant="outline" class="w-full">
					Create an account
				</Button>
			</CardContent>
		</Card>
	</section>
{:else}
	<section class="space-y-8">
		<div class="flex flex-wrap items-end justify-between gap-4">
			<div class="space-y-1">
				<div class="flex items-center gap-3">
					{#if currentAccount.type === 'seller'}
						<div class="flex size-12 items-center justify-center rounded-2xl bg-primary/15">
							<Store class="size-6 text-primary"></Store>
						</div>
					{:else}
						<div class="flex size-12 items-center justify-center rounded-2xl bg-primary/15">
							<PackageSearch class="size-6 text-primary"></PackageSearch>
						</div>
					{/if}
					<h1 class="text-3xl font-semibold tracking-tight">Hi, {currentAccount.fullName}</h1>
				</div>
				<div class="flex flex-wrap items-center gap-2 pt-2">
					<Badge variant={currentAccount.type === 'seller' ? 'default' : 'secondary'}>
						{currentAccount.type}
					</Badge>
					{#if currentAccount.company}
						<Badge variant="outline">{currentAccount.company}</Badge>
					{/if}
					<span class="text-sm text-muted-foreground">{currentAccount.email}</span>
				</div>
			</div>
			<Button variant="outline" size="sm" onclick={signOut}>
				<LogOut class="size-4"></LogOut>
				Sign out
			</Button>
		</div>

		{#if currentAccount.type === 'buyer'}
			<div class="grid gap-4 sm:grid-cols-3">
				<Card>
					<CardHeader class="gap-2">
						<PackageSearch class="size-5 text-primary"></PackageSearch>
						<CardTitle class="text-2xl">{verifiedSuppliers.length}</CardTitle>
						<CardDescription>Verified suppliers to source from</CardDescription>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader class="gap-2">
						<Package class="size-5 text-primary"></Package>
						<CardTitle class="text-2xl">{certifiedSkus.length}</CardTitle>
						<CardDescription>Certified products available</CardDescription>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader class="gap-2">
						<FileText class="size-5 text-primary"></FileText>
						<CardTitle class="text-2xl">6</CardTitle>
						<CardDescription>Knowledge guides for your sourcing team</CardDescription>
					</CardHeader>
				</Card>
			</div>

			<div class="space-y-4">
				<div class="flex items-baseline justify-between">
					<h2 class="text-lg font-semibold">Recommended suppliers</h2>
					<Button href={localizeHref('/suppliers')} variant="ghost" size="sm">
						Browse all
						<ArrowUpRight class="size-4"></ArrowUpRight>
					</Button>
				</div>
				<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{#each verifiedSuppliers.slice(0, 3) as merchant}
					<Card hoverable>
						<CardHeader class="gap-3">
							<div class="flex items-center gap-3">
								<div class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-sm font-semibold text-primary">
									{merchant.logoInitials}
								</div>
								<div class="min-w-0">
									<CardTitle class="text-base">{merchant.name}</CardTitle>
									<CardDescription>
										{merchant.country} · {merchant.certifications.length} cert(s)
									</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent>
							<Button href={localizeHref(`/suppliers/${merchant.slug}`)} variant="outline" size="sm" class="w-full">
								View profile
								<ArrowUpRight class="size-4" data-icon="inline-end"></ArrowUpRight>
							</Button>
						</CardContent>
					</Card>
					{/each}
				</div>
			</div>

			<div class="space-y-4">
				<h2 class="text-lg font-semibold">Your next steps</h2>
				<div class="grid gap-4 sm:grid-cols-3">
					<Button href={localizeHref('/products')} variant="outline" class="h-auto justify-start gap-3 p-4">
						<PackageSearch class="size-5 shrink-0 text-primary"></PackageSearch>
						<span class="flex min-w-0 flex-col items-start gap-1 whitespace-normal">
							<span class="font-medium">Browse products</span>
							<span class="text-xs font-normal text-muted-foreground">
								Filter by certification status, MOQ and origin
							</span>
						</span>
					</Button>
					<Button href={localizeHref('/suppliers')} variant="outline" class="h-auto justify-start gap-3 p-4">
						<Store class="size-5 shrink-0 text-primary"></Store>
						<span class="flex min-w-0 flex-col items-start gap-1 whitespace-normal">
							<span class="font-medium">Find suppliers</span>
							<span class="text-xs font-normal text-muted-foreground">
								Verify certificates before you buy
							</span>
						</span>
					</Button>
					<Button href={localizeHref('/knowledge-base')} variant="outline" class="h-auto justify-start gap-3 p-4">
						<FileText class="size-5 shrink-0 text-primary"></FileText>
						<span class="flex min-w-0 flex-col items-start gap-1 whitespace-normal">
							<span class="font-medium">Read the knowledge base</span>
							<span class="text-xs font-normal text-muted-foreground">
								Certification, logistics and market guides
							</span>
						</span>
					</Button>
				</div>
			</div>
		{:else}
			<div class="grid gap-4 sm:grid-cols-3">
				<Card>
					<CardHeader class="gap-2">
						<Package class="size-5 text-primary"></Package>
						<CardTitle class="text-2xl">{certifiedSkus.length}</CardTitle>
						<CardDescription>Certified products in your markets</CardDescription>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader class="gap-2">
						<Store class="size-5 text-primary"></Store>
						<CardTitle class="text-2xl">{verifiedSuppliers.length}</CardTitle>
						<CardDescription>Suppliers on the network</CardDescription>
					</CardHeader>
				</Card>
				<Card>
					<CardHeader class="gap-2">
						<ClipboardCheck class="size-5 text-primary"></ClipboardCheck>
						<CardTitle class="text-2xl">100%</CardTitle>
						<CardDescription>Certification checks published</CardDescription>
					</CardHeader>
				</Card>
			</div>

			<Card>
				<CardContent class="flex flex-col gap-4 pt-6 sm:flex-row sm:items-center sm:justify-between">
					<div class="space-y-1">
						<h2 class="font-semibold">Your company profile</h2>
						<p class="text-sm text-muted-foreground">
							{currentAccount.company ?? 'Add a company name to represent on the network.'}
						</p>
					</div>
					<Button href={localizeHref('/suppliers')} variant="outline" size="sm">
						See how suppliers appear
						<ArrowUpRight class="size-4" data-icon="inline-end"></ArrowUpRight>
					</Button>
				</CardContent>
			</Card>

			<div class="space-y-4">
				<h2 class="text-lg font-semibold">Seller toolkit</h2>
				<div class="grid gap-4 sm:grid-cols-3">
					<Button href={localizeHref('/suppliers')} variant="outline" class="h-auto justify-start gap-3 p-4">
						<Store class="size-5 shrink-0 text-primary"></Store>
						<span class="flex min-w-0 flex-col items-start gap-1 whitespace-normal">
							<span class="font-medium">Manage your listings</span>
							<span class="text-xs font-normal text-muted-foreground">
								Products, MOQ and pricing
							</span>
						</span>
					</Button>
					<Button href={localizeHref('/knowledge-base/halal-certification')} variant="outline" class="h-auto justify-start gap-3 p-4">
						<ClipboardCheck class="size-5 shrink-0 text-primary"></ClipboardCheck>
						<span class="flex min-w-0 flex-col items-start gap-1 whitespace-normal">
							<span class="font-medium">Track certification</span>
							<span class="text-xs font-normal text-muted-foreground">
								Upload and verify certificates
							</span>
						</span>
					</Button>
					<Button href={localizeHref('/knowledge-base/due-diligence')} variant="outline" class="h-auto justify-start gap-3 p-4">
						<FileText class="size-5 shrink-0 text-primary"></FileText>
						<span class="flex min-w-0 flex-col items-start gap-1 whitespace-normal">
							<span class="font-medium">Due diligence guides</span>
							<span class="text-xs font-normal text-muted-foreground">
								Prepare for buyer verification
							</span>
						</span>
					</Button>
				</div>
			</div>
		{/if}

		<Separator />

		<p class="text-sm text-muted-foreground">
			Demo auth — accounts are stored locally in your browser. Connect better-auth + D1 for
			persistent accounts.
		</p>
	</section>
{/if}