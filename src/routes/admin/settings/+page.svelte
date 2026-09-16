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
	import { z } from 'zod';
	import { focusFirstInvalid, mergeServerDetails } from '#lib/utils/forms.js';

	// Zod schema for settings validation
	const settingsSchema = z.object({
		siteName: z.string().min(1, 'Site name is required'),
		tagline: z.string().min(1, 'Tagline is required'),
		supportEmail: z.string().min(1, 'Support email is required').email('Invalid email address'),
		contactEmail: z.string().min(1, 'Contact email is required').email('Invalid email address'),
		enableDemoNotice: z.boolean(),
		enableMaintenanceMode: z.boolean()
	});

	let form = $state({ ...adminSettings });
	let errors = $state<Record<string, string>>({});
	let formEl = $state<HTMLFormElement | null>(null);
	let saved = $state(false);
	let busy = $state(false);

	function save() {
		// Reset errors
		errors = {};

		// Validate against schema
		const result = settingsSchema.safeParse(form);

		if (!result.success) {
			// Map Zod errors to field errors
			const fieldErrors: Record<string, string> = {};
			for (const issue of result.error.issues) {
				// Only handle issues where the first path segment is a string
				if (issue.path.length > 0 && typeof issue.path[0] === 'string') {
					fieldErrors[issue.path[0]] = issue.message;
				}
			}
			errors = fieldErrors;

			// Focus first invalid field
			if (formEl) {
				focusFirstInvalid(formEl);
			}
			return;
		}

		busy = true;
		updateSettings({
			siteName: result.data.siteName.trim(),
			tagline: result.data.tagline.trim(),
			supportEmail: result.data.supportEmail.trim(),
			contactEmail: result.data.contactEmail.trim(),
			enableDemoNotice: result.data.enableDemoNotice,
			enableMaintenanceMode: result.data.enableMaintenanceMode
		});

		// Simulate async operation
		setTimeout(() => {
			saved = true;
			busy = false;
			setTimeout(() => (saved = false), 2000);
		}, 500);
	}

	// Handle server errors (if updateSettings returns per-field errors)
	type ServerError = { error?: string; details?: Record<string, string[]> };
	function handleServerError(serverError: ServerError | null) {
		if (serverError?.details) {
			errors = mergeServerDetails(errors, serverError.details);
			if (formEl) {
				focusFirstInvalid(formEl);
			}
		}
	}

	$effect(() => {
		// Reset form on adminSettings change
		const defaultSettings = adminSettings;
		form = {
			siteName: defaultSettings.siteName,
			tagline: defaultSettings.tagline,
			supportEmail: defaultSettings.supportEmail,
			contactEmail: defaultSettings.contactEmail,
			enableDemoNotice: defaultSettings.enableDemoNotice,
			enableMaintenanceMode: defaultSettings.enableMaintenanceMode
		};
	});

</script>

<svelte:head><title>Settings — HalalNeo Admin</title></svelte:head>

<form onsubmit={save} class="space-y-4 sm:space-y-6" bind:this={formEl}>
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
					<Input
						bind:value={form.siteName}
						placeholder="HalalNeo"
						aria-invalid={!!errors.siteName}
						aria-describedby={errors.siteName ? 'siteName-error' : undefined}
					/>
					{#if errors.siteName}
						<span id="siteName-error" class="text-sm text-destructive">{errors.siteName}</span>
					{/if}
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Tagline</Field.FieldLabel>
					<Input
						bind:value={form.tagline}
						placeholder="Halal trade intelligence for buyers and suppliers"
						aria-invalid={!!errors.tagline}
						aria-describedby={errors.tagline ? 'tagline-error' : undefined}
					/>
					{#if errors.tagline}
						<span id="tagline-error" class="text-sm text-destructive">{errors.tagline}</span>
					{/if}
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
						aria-invalid={!!errors.supportEmail}
						aria-describedby={errors.supportEmail ? 'supportEmail-error' : undefined}
					/>
					{#if errors.supportEmail}
						<span id="supportEmail-error" class="text-sm text-destructive">{errors.supportEmail}</span>
					{/if}
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Contact email</Field.FieldLabel>
					<Input
						bind:value={form.contactEmail}
						type="email"
						placeholder="hello@halalneo.example"
						aria-invalid={!!errors.contactEmail}
						aria-describedby={errors.contactEmail ? 'contactEmail-error' : undefined}
					/>
					{#if errors.contactEmail}
						<span id="contactEmail-error" class="text-sm text-destructive">{errors.contactEmail}</span>
					{/if}
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
						onCheckedChange={(v) => {
							form.enableDemoNotice = v;
							// Clear email error if it was marked invalid
							if (errors.enableDemoNotice) {
								errors = { ...errors, enableDemoNotice: '' };
							}
						}}
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
						onCheckedChange={(v) => {
							form.enableMaintenanceMode = v;
							if (errors.enableMaintenanceMode) {
								errors = { ...errors, enableMaintenanceMode: '' };
							}
						}}
					/>
				</div>
			</CardContent>
		</Card>
	</div>

	<div class="flex items-center gap-3">
		<Button variant="default" type="submit" disabled={busy}>Save settings</Button>
		{#if saved}
			<p class="text-sm text-primary">Saved.</p>
		{/if}
	</div>
</form>
