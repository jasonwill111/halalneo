<script lang="ts">
	import { adminSettings, updateSettings } from '$lib/stores/admin-data.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Field, FieldLabel, FieldDescription } from '$lib/components/ui/field';
	import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '$lib/components/ui/card';

	let form = $state({ ...adminSettings });
	let saved = $state(false);

	function save() {
		updateSettings({
			siteName: form.siteName.trim(),
			tagline: form.tagline.trim(),
			supportEmail: form.supportEmail.trim(),
			contactEmail: form.contactEmail.trim(),
			enableDemoNotice: form.enableDemoNotice,
			enableMaintenanceMode: form.enableMaintenanceMode
		});
		saved = true;
		setTimeout(() => (saved = false), 2000);
	}
</script>

<svelte:head><title>Settings — HalalNeo Admin</title></svelte:head>

<div class="space-y-6">
	<div class="space-y-1">
		<h1 class="text-3xl font-semibold tracking-tight">Settings</h1>
		<p class="max-w-2xl text-sm text-muted-foreground">
			Site-wide configuration used across the public pages.
		</p>
	</div>

	<div class="grid gap-4 lg:grid-cols-2">
		<Card>
			<CardHeader>
				<CardTitle>Brand</CardTitle>
				<CardDescription>Name and tagline shown in the header, footer and hero.</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<Field>
					<FieldLabel>Site name</FieldLabel>
					<Input bind:value={form.siteName} placeholder="HalalNeo" />
				</Field>
				<Field>
					<FieldLabel>Tagline</FieldLabel>
					<Input bind:value={form.tagline} placeholder="Halal trade intelligence for buyers and suppliers" />
				</Field>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Contact</CardTitle>
				<CardDescription>Email addresses surfaced on the contact page and footer.</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<Field>
					<FieldLabel>Support email</FieldLabel>
					<Input bind:value={form.supportEmail} type="email" placeholder="support@halalneo.example" />
				</Field>
				<Field>
					<FieldLabel>Contact email</FieldLabel>
					<Input bind:value={form.contactEmail} type="email" placeholder="hello@halalneo.example" />
				</Field>
			</CardContent>
		</Card>

		<Card class="lg:col-span-2">
			<CardHeader>
				<CardTitle>Flags</CardTitle>
				<CardDescription>Feature toggles applied across the site.</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<label class="flex items-start gap-3">
					<input type="checkbox" bind:checked={form.enableDemoNotice} class="mt-1 size-4 rounded-sm border-border" />
					<div>
						<p class="text-sm font-medium">Demo notice</p>
						<p class="text-sm text-muted-foreground">Show the "for demonstration only" disclaimer in the footer.</p>
					</div>
				</label>
				<label class="flex items-start gap-3">
					<input type="checkbox" bind:checked={form.enableMaintenanceMode} class="mt-1 size-4 rounded-sm border-border" />
					<div>
						<p class="text-sm font-medium">Maintenance mode</p>
						<p class="text-sm text-muted-foreground">Placeholder flag — not yet enforced in the demo.</p>
					</div>
				</label>
			</CardContent>
		</Card>
	</div>

	<div class="flex items-center gap-3">
		<Button variant="default" onclick={save}>Save settings</Button>
		{#if saved}
			<p class="text-sm text-primary">Saved.</p>
		{/if}
	</div>
</div>