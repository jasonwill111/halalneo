<script lang="ts">
	import { localizeHref } from '$lib/paraglide/runtime.js';
	import { listAccounts, createAccount, updateAccount, deleteAccount, getCurrentAccount } from '$lib/stores/auth.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Badge } from '$lib/components/ui/badge';
	import { Field, FieldLabel, FieldDescription } from '$lib/components/ui/field';
	import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '$lib/components/ui/table';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
	import { Empty } from '$lib/components/ui/empty';
	import type { DemoAccount } from '$lib/stores/auth.svelte';
	import Search from '@lucide/svelte/icons/search';
	import Plus from '@lucide/svelte/icons/plus';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import RefreshCw from '@lucide/svelte/icons/refresh-cw';

	let accounts = $state(listAccounts().filter((a) => a.type === 'buyer'));
	let currentAccount = $derived(getCurrentAccount());

	let search = $state('');
	let dialogOpen = $state(false);
	let editing = $state<DemoAccount | null>(null);
	let form = $state<{ fullName: string; email: string; company: string; password: string }>({
		fullName: '',
		email: '',
		company: '',
		password: ''
	});
	let formError = $state('');
	let refreshTick = $state(0);

	let filtered = $derived.by(() => {
		void refreshTick;
		return accounts.filter((a) => {
			if (!search.trim()) return true;
			const q = search.toLowerCase();
			return (
				a.fullName.toLowerCase().includes(q) ||
				a.email.toLowerCase().includes(q) ||
				(a.company ?? '').toLowerCase().includes(q)
			);
		});
	});

	function openCreate() {
		editing = null;
		form = { fullName: '', email: '', company: '', password: '' };
		formError = '';
		dialogOpen = true;
	}

	function openEdit(account: DemoAccount) {
		editing = account;
		form = {
			fullName: account.fullName,
			email: account.email,
			company: account.company ?? '',
			password: account.password
		};
		formError = '';
		dialogOpen = true;
	}

	function refreshAccounts() {
		accounts = listAccounts().filter((a) => a.type === 'buyer');
		refreshTick += 1;
	}

	function save() {
		if (!form.fullName.trim() || !form.email.trim() || !form.password.trim()) {
			formError = 'Full name, email and password are required.';
			return;
		}
		if (editing) {
			updateAccount(editing.email, {
				fullName: form.fullName.trim(),
				company: form.company.trim() || undefined,
				password: form.password
			});
		} else {
			const ok = createAccount({
				fullName: form.fullName.trim(),
				email: form.email.trim(),
				company: form.company.trim() || undefined,
				password: form.password,
				type: 'buyer'
			});
			if (!ok) {
				formError = 'An account with that email already exists.';
				return;
			}
		}
		refreshAccounts();
		dialogOpen = false;
	}

	function remove(email: string) {
		if (email === currentAccount?.email) return;
		if (window.confirm(`Delete buyer ${email}? This cannot be undone.`)) {
			deleteAccount(email);
			refreshAccounts();
		}
	}
</script>

<svelte:head><title>Users — HalalNeo Admin</title></svelte:head>

<div class="space-y-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div class="space-y-1">
			<h1 class="text-3xl font-semibold tracking-tight">Users</h1>
			<p class="max-w-2xl text-sm text-muted-foreground">
				Buyer accounts registered on the demo platform. Sellers are managed under Suppliers.
			</p>
		</div>
		<Button variant="default" onclick={openCreate}>
			<Plus class="size-4"></Plus>
			New buyer
		</Button>
	</div>

	<div class="flex items-center gap-2">
		<div class="relative max-w-sm flex-1">
			<Search class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"></Search>
			<Input bind:value={search} placeholder="Search buyers…" class="pl-9" />
		</div>
		<Button variant="outline" size="icon" aria-label="Refresh" onclick={refreshAccounts}>
			<RefreshCw class="size-4"></RefreshCw>
		</Button>
	</div>

	{#if filtered.length === 0}
		<Empty>
			<div class="space-y-1">
				<p class="font-medium">No buyers found</p>
				<p class="text-sm text-muted-foreground">Try a different search term, or create a new buyer account.</p>
			</div>
		</Empty>
	{:else}
		<div class="rounded-xl ring-1 ring-foreground/10">
			<Table>
				<TableHeader>
					<TableRow class="hover:bg-transparent">
						<TableHead>Name</TableHead>
						<TableHead>Email</TableHead>
						<TableHead>Company</TableHead>
						<TableHead class="text-right">Actions</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{#each filtered as account}
						<TableRow>
							<TableCell class="font-medium">
								<div class="flex items-center gap-2">
									{account.fullName}
									{#if account.email === currentAccount?.email}
										<Badge variant="secondary">you</Badge>
									{/if}
								</div>
							</TableCell>
							<TableCell class="text-muted-foreground">{account.email}</TableCell>
							<TableCell>
								{#if account.company}
									{account.company}
								{:else}
									<span class="text-muted-foreground">—</span>
								{/if}
							</TableCell>
							<TableCell class="text-right">
								<div class="flex items-center justify-end gap-1">
									<Button variant="ghost" size="icon" aria-label="Edit" onclick={() => openEdit(account)} disabled={account.email === currentAccount?.email}>
										<Pencil class="size-4" />
									</Button>
									<Button
										variant="ghost"
										size="icon"
										aria-label="Delete"
										class="hover:bg-destructive/10 hover:text-destructive"
										disabled={account.email === currentAccount?.email}
										onclick={() => remove(account.email)}
									>
										<Trash2 class="size-4" />
									</Button>
								</div>
							</TableCell>
						</TableRow>
					{/each}
				</TableBody>
			</Table>
		</div>
	{/if}
</div>

<Dialog bind:open={dialogOpen}>
	<DialogContent class="sm:max-w-md">
		<DialogHeader>
			<DialogTitle>{editing ? 'Edit buyer' : 'New buyer'}</DialogTitle>
			<DialogDescription>
				{editing
					? `Update details for ${editing.email}.`
					: 'Create a buyer account on the demo platform.'}
			</DialogDescription>
		</DialogHeader>
		<div class="space-y-4">
			<Field>
				<FieldLabel>Full name</FieldLabel>
				<Input bind:value={form.fullName} placeholder="Aisha Rahman" />
			</Field>
			<Field>
				<FieldLabel>Email</FieldLabel>
				<Input bind:value={form.email} type="email" placeholder="aisha@company.com" disabled={!!editing} />
			</Field>
			<Field>
				<FieldLabel>Company (optional)</FieldLabel>
				<Input bind:value={form.company} placeholder="Company name" />
			</Field>
			<Field>
				<FieldLabel>Password</FieldLabel>
				<Input bind:value={form.password} type="password" placeholder="••••••••" />
				<FieldDescription>Demo only — stored in local storage.</FieldDescription>
			</Field>
			{#if formError}
				<p class="text-sm text-destructive">{formError}</p>
			{/if}
		</div>
		<DialogFooter>
			<Button variant="outline" onclick={() => (dialogOpen = false)}>Cancel</Button>
			<Button variant="default" onclick={save}>{editing ? 'Save changes' : 'Create buyer'}</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>