<script lang="ts">
	import type { PageProps } from './$types';
	import { navigating } from '$app/state';
	import { invalidateAll } from '$app/navigation';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '#lib/components/ui/table/index.js';
	import {
		Empty,
		EmptyContent,
		EmptyDescription,
		EmptyHeader,
		EmptyTitle
	} from '#lib/components/ui/empty/index.js';
	import BrandedEmptyMedia from '#lib/components/site/branded-empty-media.svelte';
	import Paginator from '#lib/components/site/paginator.svelte';
	import Search from '@lucide/svelte/icons/search';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';
	import Users from '@lucide/svelte/icons/users';

	// Rows come from `+page.server.ts` (the Better Auth `user` table), so there is
	// no client fetch and no fake write path on this screen.
	let { data }: PageProps = $props();

	const PAGE_SIZE = 20;

	let search = $state('');
	let currentPage = $state(1);

	// A new filter must never leave the operator on an out-of-range page.
	$effect(() => {
		void search;
		currentPage = 1;
	});

	const currentEmail = $derived((data.adminUser?.email ?? '').toLowerCase());

	const filtered = $derived.by(() => {
		const query = search.trim().toLowerCase();
		if (!query) return data.users;
		return data.users.filter((account) =>
			`${account.name} ${account.email} ${account.supplierName ?? ''}`.toLowerCase().includes(query)
		);
	});

	const totalPages = $derived(Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)));
	const paged = $derived(filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE));

	/** The server caps the list at 100 rows, so a larger `total` means truncation. */
	const truncated = $derived(data.total > data.users.length);

	function formatDate(value: number): string {
		if (!value) return '—';
		return new Date(value).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}

	async function refresh() {
		await invalidateAll(); // re-run the server load — nothing is cached in the browser
	}
</script>

<svelte:head>
	<title>Users — HalalNeo Admin</title>
</svelte:head>

<div class="space-y-4 sm:space-y-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div class="space-y-1">
			<h1 class="text-xl font-semibold tracking-tight sm:text-2xl">Users</h1>
			<p class="max-w-2xl text-xs text-muted-foreground sm:text-sm">
				Accounts stored by Better Auth — buyer sign-ups and admin logins share this table. Seller
				profiles and their team memberships are managed under Suppliers.
			</p>
		</div>
		<Badge variant="secondary">{data.total} total</Badge>
	</div>

	<div class="flex items-center gap-2">
		<div class="relative max-w-sm flex-1">
			<Search
				class="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
			></Search>
			<Input
				bind:value={search}
				type="search"
				placeholder="Search name, email or company..."
				class="ps-9"
				aria-label="Search users"
			/>
		</div>
		<Button variant="outline" size="icon" aria-label="Refresh" onclick={refresh}>
			<RefreshCw class="size-4 {navigating.to ? 'animate-spin' : ''}"></RefreshCw>
		</Button>
	</div>

	{#if truncated}
		<p class="rounded-lg bg-info/10 px-3 py-2 text-xs text-info">
			Showing the {data.users.length} most recent accounts of {data.total}. Use search to narrow the
			list.
		</p>
	{/if}

	{#if filtered.length === 0}
		<Empty class="border">
			<EmptyHeader>
				<BrandedEmptyMedia variant="icon">
					<Users />
				</BrandedEmptyMedia>
				<EmptyTitle>
					{data.users.length === 0 ? 'No accounts yet' : 'No users found'}
				</EmptyTitle>
				<EmptyDescription>
					{data.users.length === 0
						? 'Accounts appear here as soon as someone signs up on the site.'
						: 'Try a different name, email or company.'}
				</EmptyDescription>
			</EmptyHeader>
			<EmptyContent>
				{#if search.trim()}
					<Button variant="outline" size="sm" onclick={() => (search = '')}>Clear search</Button>
				{:else}
					<Button variant="outline" size="sm" onclick={refresh}>
						<RefreshCw class="size-4"></RefreshCw>
						Refresh users
					</Button>
				{/if}
			</EmptyContent>
		</Empty>
	{:else}
		<div class="min-w-0 overflow-x-auto rounded-xl ring-1 ring-foreground/10">
			<Table class="min-w-[56rem]">
				<TableHeader>
					<TableRow class="hover:bg-transparent">
						<TableHead class="whitespace-nowrap">Name</TableHead>
						<TableHead class="whitespace-nowrap">Email</TableHead>
						<TableHead class="whitespace-nowrap">Email status</TableHead>
						<TableHead class="whitespace-nowrap">Company</TableHead>
						<TableHead class="whitespace-nowrap">Joined</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{#each paged as account (account.id)}
						<TableRow>
							<TableCell class="font-medium">
								<div class="flex items-center gap-2">
									<span class="truncate">{account.name || '—'}</span>
									{#if account.email.toLowerCase() === currentEmail}
										<Badge variant="secondary">you</Badge>
									{/if}
								</div>
							</TableCell>
							<TableCell class="whitespace-nowrap text-muted-foreground">{account.email}</TableCell>
							<TableCell>
								{#if account.emailVerified}
									<Badge
										variant="secondary"
										class="bg-success/10 px-1.5 py-0.5 text-2xs text-success">Verified</Badge
									>
								{:else}
									<Badge variant="secondary" class="px-1.5 py-0.5 text-2xs text-muted-foreground"
										>Unverified</Badge
									>
								{/if}
							</TableCell>
							<TableCell>
								{#if account.supplierName}
									<a href="/admin/suppliers" class="text-primary hover:underline">
										{account.supplierName}
									</a>
								{:else}
									<span class="text-muted-foreground">—</span>
								{/if}
							</TableCell>
							<TableCell class="text-muted-foreground">{formatDate(account.createdAt)}</TableCell>
						</TableRow>
					{/each}
				</TableBody>
			</Table>
		</div>

		<div class="flex justify-center">
			<Paginator bind:page={currentPage} {totalPages} />
		</div>
	{/if}
</div>
