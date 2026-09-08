<script lang="ts">
	import { adminSettings, updateSettings } from '#lib/stores/admin-data.svelte.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Switch } from '#lib/components/ui/switch/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '#lib/components/ui/card/index.js';

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

<div class="space-y-4 sm:space-y-6">
	<div class="space-y-1">
		<h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">Settings</h1>
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
				<Field.Field>
					<Field.FieldLabel>Site name</Field.FieldLabel>
					<Input bind:value={form.siteName} placeholder="HalalNeo" />
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Tagline</Field.FieldLabel>
					<Input
						bind:value={form.tagline}
						placeholder="Halal trade intelligence for buyers and suppliers"
					/>
				</Field.Field>
			</CardContent>
		</Card>

		<Card>
			<CardHeader>
				<CardTitle>Contact</CardTitle>
				<CardDescription>Email addresses surfaced on the contact page and footer.</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<Field.Field>
					<Field.FieldLabel>Support email</Field.FieldLabel>
					<Input
						bind:value={form.supportEmail}
						type="email"
						placeholder="support@halalneo.example"
					/>
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Contact email</Field.FieldLabel>
					<Input bind:value={form.contactEmail} type="email" placeholder="hello@halalneo.example" />
				</Field.Field>
			</CardContent>
		</Card>

		<Card class="lg:col-span-2">
			<CardHeader>
				<CardTitle>Flags</CardTitle>
				<CardDescription>Feature toggles applied across the site.</CardDescription>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="flex items-center justify-between gap-3">
					<div>
						<p class="text-sm font-medium">Demo notice</p>
						<p class="text-sm text-muted-foreground">
							Show the "for demonstration only" disclaimer in the footer.
						</p>
					</div>
					<Switch
						checked={form.enableDemoNotice}
						onCheckedChange={(v) => (form.enableDemoNotice = v)}
					/>
				</div>
				<div class="flex items-center justify-between gap-3">
					<div>
						<p class="text-sm font-medium">Maintenance mode</p>
						<p class="text-sm text-muted-foreground">
							Placeholder flag — not yet enforced in the demo.
						</p>
					</div>
					<Switch
						checked={form.enableMaintenanceMode}
						onCheckedChange={(v) => (form.enableMaintenanceMode = v)}
					/>
				</div>
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
