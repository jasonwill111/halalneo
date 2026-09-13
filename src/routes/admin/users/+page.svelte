<script lang="ts">
	import {
		listAccounts,
		createAccount,
		updateAccount,
		deleteAccount,
		getCurrentAccount
	} from '#lib/stores/auth.svelte.js';
	import { z } from 'zod';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import { FieldError } from '#lib/components/ui/field/index.js';
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '#lib/components/ui/select/index.js';
	import { focusFirstInvalid } from '#lib/utils/forms.js';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '#lib/components/ui/table/index.js';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle
	} from '#lib/components/ui/dialog/index.js';
	import { Empty } from '#lib/components/ui/empty/index.js';
	import ConfirmDialog from '#lib/components/site/confirm-dialog.svelte';
	import { toast } from 'svelte-sonner';
	import type { DemoAccount } from '#lib/stores/auth.svelte.js';
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
	let form = $state<{ fullName: string; email: string; company: string; password: string; role: 'buyer' | 'seller' }>({
		fullName: '',
		email: '',
		company: '',
		password: '',
		role: 'buyer'
	});
	let formError = $state('');
	let fieldErrors = $state<Record<string, string>>({});
	let formEl = $state<HTMLFormElement | undefined>(undefined);

	const userSchema = z.object({
		fullName: z.string().trim().min(1, 'Full name is required.'),
		email: z.string().trim().min(1, 'Email is required.').email('Please enter a valid email.'),
		role: z.enum(['buyer', 'seller'], { message: 'Role is required.' }),
		password: z.string().min(1, 'Password is required.')
	});
	let refreshTick = $state(0);
	let confirmEmail = $state<string | null>(null);

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
		form = { fullName: '', email: '', company: '', password: '', role: 'buyer' };
		formError = '';
		fieldErrors = {};
		dialogOpen = true;
	}

	function openEdit(account: DemoAccount) {
		editing = account;
		form = {
			fullName: account.fullName,
			email: account.email,
			company: account.company ?? '',
			password: account.password,
			role: 'buyer'
		};
		formError = '';
		fieldErrors = {};
		dialogOpen = true;
	}

	function refreshAccounts() {
		accounts = listAccounts().filter((a) => a.type === 'buyer');
		refreshTick += 1;
	}

	function save() {
		const result = userSchema.safeParse({
			fullName: form.fullName,
			email: form.email,
			role: form.role,
			password: form.password
		});

		if (!result.success) {
			const flat = result.error.flatten().fieldErrors;
			fieldErrors = {
				fullName: flat.fullName?.[0] ?? '',
				email: flat.email?.[0] ?? '',
				role: flat.role?.[0] ?? '',
				password: flat.password?.[0] ?? ''
			};
			focusFirstInvalid(formEl);
			return;
		}

		fieldErrors = {};
		formError = '';

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
				type: form.role
			});
			if (!ok) {
				formError = 'An account with that email already exists.';
				return;
			}
		}
		refreshAccounts();
		dialogOpen = false;
		toast.success(editing ? 'Buyer updated' : 'Buyer created');
	}

	function remove(email: string) {
		if (email === currentAccount?.email) return;
		confirmEmail = email;
	}

	function confirmedRemove() {
		if (!confirmEmail) return;
		deleteAccount(confirmEmail);
		refreshAccounts();
		toast.success(`Buyer ${confirmEmail} deleted`);
		confirmEmail = null;
	}
</script>

<svelte:head><title>Users — HalalNeo Admin</title></svelte:head>

<div class="space-y-4 sm:space-y-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div class="space-y-1">
			<h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">Users</h1>
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
			<Search
				class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
			></Search>
			<Input bind:value={search} placeholder="Search buyers..." class="pl-9" />
		</div>
		<Button variant="outline" size="icon" aria-label="Refresh" onclick={refreshAccounts}>
			<RefreshCw class="size-4"></RefreshCw>
		</Button>
	</div>

	{#if filtered.length === 0}
		<Empty>
			<div class="space-y-1">
				<p class="font-medium">No buyers found</p>
				<p class="text-sm text-muted-foreground">
					Try a different search term, or create a new buyer account.
				</p>
			</div>
		</Empty>
	{:else}
		<div class="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
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
					{#each filtered as account (account.email)}
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
									<Button
										variant="ghost"
										size="icon"
										aria-label="Edit"
										onclick={() => openEdit(account)}
										disabled={account.email === currentAccount?.email}
									>
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
	<DialogContent class="sm:max-w-lg">
		<DialogHeader>
			<DialogTitle>{editing ? 'Edit buyer' : 'New buyer'}</DialogTitle>
			<DialogDescription>
				{editing
					? `Update details for ${editing.email}.`
					: 'Create a buyer account on the demo platform.'}
			</DialogDescription>
		</DialogHeader>
		<div class="space-y-4">
			<form
				bind:this={formEl}
				onsubmit={(e) => {
					e.preventDefault();
					save();
				}}
				class="space-y-4"
			>
				<Field.Field>
					<Field.FieldLabel>Full name</Field.FieldLabel>
					<Input
						value={form.fullName}
						oninput={(e) => {
							form.fullName = (e.currentTarget as HTMLInputElement).value;
							if (fieldErrors.fullName) fieldErrors = { ...fieldErrors, fullName: '' };
						}}
						placeholder="Aisha Rahman"
						aria-invalid={!!fieldErrors.fullName || undefined}
					/>
					{#if fieldErrors.fullName}<FieldError>{fieldErrors.fullName}</FieldError>{/if}
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Email</Field.FieldLabel>
					<Input
						value={form.email}
						type="email"
						oninput={(e) => {
							form.email = (e.currentTarget as HTMLInputElement).value;
							if (fieldErrors.email) fieldErrors = { ...fieldErrors, email: '' };
						}}
						placeholder="aisha@company.com"
						disabled={!!editing}
						aria-invalid={!!fieldErrors.email || undefined}
					/>
					{#if fieldErrors.email}<FieldError>{fieldErrors.email}</FieldError>{/if}
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Company (optional)</Field.FieldLabel>
					<Input bind:value={form.company} placeholder="Company name" />
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Role</Field.FieldLabel>
					<Select
						bind:value={form.role}
						type="single"
						onOpenChange={(open) => {
							if (!open && fieldErrors.role) fieldErrors = { ...fieldErrors, role: '' };
						}}
					>
						<SelectTrigger class="w-full" aria-invalid={!!fieldErrors.role || undefined}
							>{form.role === 'seller' ? 'Seller' : 'Buyer'}</SelectTrigger
						>
						<SelectContent>
							<SelectItem value="buyer">Buyer</SelectItem>
							<SelectItem value="seller">Seller</SelectItem>
						</SelectContent>
					</Select>
					{#if fieldErrors.role}<FieldError>{fieldErrors.role}</FieldError>{/if}
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Password</Field.FieldLabel>
					<Input
						value={form.password}
						type="password"
						oninput={(e) => {
							form.password = (e.currentTarget as HTMLInputElement).value;
							if (fieldErrors.password) fieldErrors = { ...fieldErrors, password: '' };
						}}
						placeholder="•••••••••••••••••"
						aria-invalid={!!fieldErrors.password || undefined}
					/>
					{#if fieldErrors.password}<FieldError>{fieldErrors.password}</FieldError>{/if}
					<Field.FieldDescription>Demo only — stored in local storage.</Field.FieldDescription>
				</Field.Field>
				{#if formError}
					<p class="text-sm text-destructive">{formError}</p>
				{/if}
				<DialogFooter>
					<Button variant="outline" type="button" onclick={() => (dialogOpen = false)}>Cancel</Button>
					<Button variant="default" type="submit">{editing ? 'Save changes' : 'Create buyer'}</Button>
				</DialogFooter>
			</form>
		</div>
	</DialogContent>
</Dialog>

<ConfirmDialog
	open={confirmEmail !== null}
	title="Delete buyer?"
	description={confirmEmail
		? `Delete ${confirmEmail}? This cannot be undone.`
		: undefined}
	confirmLabel="Delete"
	onconfirm={confirmedRemove}
/>
