<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Card, CardContent, CardHeader, CardTitle } from '#lib/components/ui/card/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import { Field, FieldLabel } from '#lib/components/ui/field/index.js';
	import Save from '@lucide/svelte/icons/save';
	import Plus from '@lucide/svelte/icons/plus';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import Building2 from '@lucide/svelte/icons/building-2';
	import Users from '@lucide/svelte/icons/users';
	import { adminData } from '#lib/stores/admin-data.svelte.js';

	// TODO: Replace with authenticated user's supplier slug from session/load function
	const SUPPLIER_SLUG = 'nusantara-foods';
	const supplier = $derived(adminData.suppliers.find((s) => s.slug === SUPPLIER_SLUG));
	const supplierProductCount = $derived(adminData.products.filter((p) => p.supplierSlug === SUPPLIER_SLUG).length);

	let companyName = $state('');
	let description = $state('');
	let country = $state('');
	let yearEstablished = $state('');
	let website = $state('');

	// Initialize form fields once per supplier — never overwrite user edits
	// when the underlying store updates.
	let initializedSlug = $state('');

	$effect(() => {
		if (supplier && supplier.slug !== initializedSlug) {
			initializedSlug = supplier.slug;
			companyName = supplier.name;
			description = supplier.description;
			country = supplier.country;
			yearEstablished = String(supplier.yearEstablished);
			website = supplier.website ?? '';
		}
	});

	let teamMembers = $state<{ name: string; email: string; role: string; initials: string }[]>([]);

	let newMemberName = $state('');
	let newMemberEmail = $state('');

	function addMember() {
		if (!newMemberName.trim() || !newMemberEmail.trim()) return;
		const initials = newMemberName
			.split(' ')
			.map((p) => p[0])
			.filter(Boolean)
			.slice(0, 2)
			.join('')
			.toUpperCase();
		teamMembers = [...teamMembers, { name: newMemberName, email: newMemberEmail, role: 'Member', initials }];
		newMemberName = '';
		newMemberEmail = '';
	}

	function removeMember(index: number) {
		teamMembers = teamMembers.filter((_, i) => i !== index);
	}
</script>

<svelte:head>
	<title>Manage Supplier — HalalNeo</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="space-y-1 mb-4">
	<nav class="flex items-center gap-1.5 text-[10px] text-muted-foreground">
		<a href={localizeHref('/')} class="hover:text-foreground transition-colors">Home</a>
		<span>/</span>
		<a href={localizeHref('/supplier/dashboard')} class="hover:text-foreground transition-colors">Supplier</a>
		<span>/</span>
		<span class="text-foreground font-medium">Manage</span>
	</nav>
	<h1 class="text-2xl font-bold tracking-tight">Company Profile</h1>
	<p class="text-sm text-muted-foreground">Manage your company information and team members.</p>
</div>

<div class="grid gap-4 lg:grid-cols-3">
	<div class="lg:col-span-2 space-y-4">
		<Card>
			<CardHeader class="pb-3">
				<CardTitle class="flex items-center gap-2 text-sm">
					<Building2 class="size-4 text-muted-foreground"></Building2>
					Company Details
				</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="grid gap-4 sm:grid-cols-2">
					<Field>
						<FieldLabel>Company Name</FieldLabel>
						<Input bind:value={companyName} placeholder="Company name" />
					</Field>
					<Field>
						<FieldLabel>Country</FieldLabel>
						<Input bind:value={country} placeholder="Country" />
					</Field>
				</div>
				<div class="grid gap-4 sm:grid-cols-2">
					<Field>
						<FieldLabel>Year Established</FieldLabel>
						<Input bind:value={yearEstablished} type="number" min="1900" max="2030" />
					</Field>
					<Field>
						<FieldLabel>Website</FieldLabel>
						<Input bind:value={website} placeholder="https://..." />
					</Field>
				</div>
				<Field>
					<FieldLabel>Description</FieldLabel>
					<Textarea bind:value={description} rows={3} placeholder="Company description..." />
				</Field>
				<div class="flex justify-end">
					<Button size="sm" class="gap-1.5">
						<Save class="size-3.5"></Save>
						Save Changes
					</Button>
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="pb-3">
				<CardTitle class="flex items-center gap-2 text-sm">
					<Users class="size-4 text-muted-foreground"></Users>
					Team Members
				</CardTitle>
			</CardHeader>
			<CardContent class="space-y-3">
				{#each teamMembers as member, i (member.email)}
					<div class="flex items-center gap-3 rounded-lg bg-muted/40 px-3 py-2">
						<div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
							{member.initials}
						</div>
						<div class="min-w-0 flex-1">
							<p class="truncate text-[11px] font-medium">{member.name}</p>
							<p class="truncate text-[10px] text-muted-foreground">{member.email}</p>
						</div>
						<Badge variant="secondary" class="text-[10px]">{member.role}</Badge>
						{#if member.role !== 'Owner'}
							<Button
								variant="ghost"
								size="icon"
								class="size-7 hover:bg-destructive/10 hover:text-destructive"
								onclick={() => removeMember(i)}
							>
								<Trash2 class="size-3.5"></Trash2>
							</Button>
						{/if}
					</div>
				{/each}

				<div class="flex items-end gap-2 border-t border-border pt-3">
					<div class="flex-1 space-y-2">
						<Input bind:value={newMemberName} placeholder="Member name" class="h-8 text-[11px]" />
						<Input bind:value={newMemberEmail} placeholder="Email address" class="h-8 text-[11px]" />
					</div>
					<Button size="sm" class="h-8 gap-1 text-[10px]" onclick={addMember}>
						<Plus class="size-3"></Plus>
						Add
					</Button>
				</div>
			</CardContent>
		</Card>
	</div>

	<div class="space-y-4">
		<Card>
			<CardHeader class="pb-3">
				<CardTitle class="text-sm">Account Status</CardTitle>
			</CardHeader>
			<CardContent class="space-y-3">
				<div class="flex items-center justify-between text-[11px]">
					<span class="text-muted-foreground">Verification</span>
					<Badge class="bg-success/10 text-success text-[10px]">Verified</Badge>
				</div>
				<div class="flex items-center justify-between text-[11px]">
					<span class="text-muted-foreground">Plan</span>
					<Badge variant="secondary" class="text-[10px]">Business</Badge>
				</div>
				<div class="flex items-center justify-between text-[11px]">
					<span class="text-muted-foreground">Products</span>
					<span class="font-medium">{supplierProductCount} / 80</span>
				</div>
				<div class="h-1.5 w-full rounded-full bg-muted overflow-hidden">
					<div class="h-full rounded-full bg-primary" style="width: {Math.min((supplierProductCount / 80) * 100, 100)}%"></div>
				</div>
				<div class="flex items-center justify-between text-[11px]">
					<span class="text-muted-foreground">Member since</span>
					<span class="font-medium">Jan 2024</span>
				</div>
			</CardContent>
		</Card>

		<Card>
			<CardHeader class="pb-3">
				<CardTitle class="text-sm">Certifications</CardTitle>
			</CardHeader>
			<CardContent class="space-y-2">
				{#if supplier && supplier.certifications.length > 0}
					{#each supplier.certifications as cert (cert.bodyName)}
						<div class="flex items-center gap-2 rounded-lg bg-muted/40 px-2.5 py-2 text-[11px]">
							<Badge class="bg-success/10 text-success text-[10px]">{cert.bodyName}</Badge>
							<span class="text-muted-foreground">{cert.scope}</span>
						</div>
					{/each}
				{:else}
					<p class="text-[10px] text-muted-foreground">No certifications added yet.</p>
				{/if}
				<Button variant="outline" size="sm" class="w-full mt-2 gap-1 text-[10px]">
					<Plus class="size-3"></Plus>
					Add Certification
				</Button>
			</CardContent>
		</Card>
	</div>
</div>
