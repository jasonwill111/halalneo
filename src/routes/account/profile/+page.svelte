<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { getCurrentAccount } from '#lib/stores/auth.svelte.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/field/index.js';
	import { Card, CardContent } from '#lib/components/ui/card/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '#lib/components/ui/select/index.js';
	import Camera from '@lucide/svelte/icons/camera';

	let account = $derived(getCurrentAccount());

	const initials = $derived(
		(account?.fullName ?? 'U').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() || 'U'
	);
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
					<div class="absolute inset-0 flex items-center justify-center rounded-xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
						<Camera class="size-4 text-white"></Camera>
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
			<form class="p-3 space-y-2">
				<div class="grid gap-2 sm:grid-cols-2">
					<div class="space-y-0.5">
						<Label class="text-[10px]">First Name</Label>
						<Input type="text" value={(account.fullName ?? '').split(' ')[0]} class="h-8 text-[11px]" />
					</div>
					<div class="space-y-0.5">
						<Label class="text-[10px]">Last Name</Label>
						<Input type="text" value={(account.fullName ?? '').split(' ').slice(1).join(' ')} class="h-8 text-[11px]" />
					</div>
				</div>
				<div class="space-y-0.5">
					<Label class="text-[10px]">Company</Label>
					<Input type="text" value={account.company ?? ''} class="h-8 text-[11px]" />
				</div>
				<div class="space-y-0.5">
					<Label class="text-[10px]">Email</Label>
					<Input type="email" value={account.email} class="h-8 text-[11px]" />
				</div>
				<div class="space-y-0.5">
					<Label class="text-[10px]">Phone</Label>
					<Input type="tel" placeholder="+1 (555) 000-0000" class="h-8 text-[11px]" />
				</div>
				<div class="grid gap-2 sm:grid-cols-2">
					<div class="space-y-0.5">
						<Label class="text-[10px]">Country</Label>
						<Select type="single">
							<SelectTrigger class="h-8 w-full text-[11px]">
								United States
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="us">United States</SelectItem>
								<SelectItem value="my">Malaysia</SelectItem>
								<SelectItem value="id">Indonesia</SelectItem>
								<SelectItem value="ae">UAE</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div class="space-y-0.5">
						<Label class="text-[10px]">Industry Interest</Label>
						<Select type="single">
							<SelectTrigger class="h-8 w-full text-[11px]">
								Pharmaceuticals
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="pharma">Pharmaceuticals</SelectItem>
								<SelectItem value="food">Food & Beverages</SelectItem>
								<SelectItem value="cosmetics">Cosmetics</SelectItem>
								<SelectItem value="textiles">Textiles</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
				<div class="flex items-center gap-1.5 pt-0.5">
					<Button size="sm" class="h-7 text-[10px]">Save Changes</Button>
					<Button variant="outline" size="sm" class="h-7 text-[10px]">Cancel</Button>
				</div>
			</form>
		</div>
	</div>
{/if}
