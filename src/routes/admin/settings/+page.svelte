<script lang="ts">
	import { tick } from 'svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Switch } from '#lib/components/ui/switch/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
	import { FieldError } from '#lib/components/ui/field/index.js';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '#lib/components/ui/card/index.js';
	import { Skeleton } from '#lib/components/ui/skeleton/index.js';
	import { Alert, AlertDescription } from '#lib/components/ui/alert/index.js';
	import ErrorRetry from '#lib/components/site/error-retry.svelte';
	import TriangleAlert from '@lucide/svelte/icons/triangle-alert';
	import SettingsIcon from '@lucide/svelte/icons/settings';
	import { toast } from 'svelte-sonner';
	import {
		focusFirstInvalid,
		mergeServerDetails,
		type ServerFieldDetails
	} from '#lib/utils/forms.js';
	import {
		describeFetchFailure,
		describeThrownFailure,
		type LoadFailure
	} from '#lib/utils/load-error.js';
	import {
		DEFAULT_SITE_SETTINGS,
		siteSettingsSchema,
		type SiteSettingsForm
	} from '#lib/schemas/settings.js';

	interface SettingsPayload {
		settings?: Partial<SiteSettingsForm>;
	}

	let form = $state<SiteSettingsForm>({ ...DEFAULT_SITE_SETTINGS });
	let fieldErrors = $state<Record<string, string>>({});
	let formError = $state('');
	let formEl = $state<HTMLFormElement | undefined>(undefined);
	let loading = $state(true);
	let loadFailure = $state<LoadFailure | null>(null);
	let busy = $state(false);
	let saved = $state(false);

	/** Site settings are read/written through D1 (`site_settings`) via the API. */
	async function loadSettings() {
		loading = true;
		loadFailure = null;
		try {
			const res = await fetch('/api/settings');
			if (!res.ok) {
				loadFailure = describeFetchFailure(res);
				return;
			}
			const data = (await res.json().catch(() => null)) as SettingsPayload | null;
			form = { ...DEFAULT_SITE_SETTINGS, ...(data?.settings ?? {}) };
		} catch (error: unknown) {
			loadFailure = describeThrownFailure(error);
		} finally {
			loading = false;
		}
	}

	$effect(() => {
		void loadSettings();
	});

	async function showFieldErrors(details: ServerFieldDetails) {
		fieldErrors = mergeServerDetails({}, details);
		await tick();
		focusFirstInvalid(formEl);
	}

	async function save(e: SubmitEvent) {
		e.preventDefault();
		if (busy) return;
		fieldErrors = {};
		formError = '';
		saved = false;

		const parsed = siteSettingsSchema.safeParse(form);
		if (!parsed.success) {
			await showFieldErrors(parsed.error.flatten().fieldErrors);
			return;
		}

		busy = true;
		try {
			const res = await fetch('/api/settings', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(parsed.data)
			});
			if (res.ok) {
				const data = (await res.json().catch(() => null)) as SettingsPayload | null;
				if (data?.settings) form = { ...DEFAULT_SITE_SETTINGS, ...data.settings };
				toast.success('Settings saved');
				saved = true;
				return;
			}
			// Failed write: every input keeps its value (§3.4).
			const body = (await res.json().catch(() => ({}))) as {
				error?: string;
				details?: ServerFieldDetails;
			};
			if (res.status === 400 && body.details) {
				await showFieldErrors(body.details);
			}
			formError = body.error || 'Could not save settings.';
			toast.error(formError);
		} catch {
			formError = 'Network error — your changes were not saved.';
			toast.error(formError);
		} finally {
			busy = false;
		}
	}
</script>

<svelte:head><title>Settings — HalalNeo Admin</title></svelte:head>

{#if loading}
	<div class="space-y-4 sm:space-y-6">
		<div class="space-y-2">
			<Skeleton class="h-8 w-40" />
			<Skeleton class="h-4 w-72 max-w-full" />
		</div>
		<div class="grid gap-4 lg:grid-cols-2">
			{#each [0, 1] as card (card)}
				<Card>
					<CardHeader>
						<Skeleton class="h-5 w-24" />
						<Skeleton class="h-4 w-56 max-w-full" />
					</CardHeader>
					<CardContent class="space-y-4">
						<Skeleton class="h-9 w-full" />
						<Skeleton class="h-9 w-full" />
					</CardContent>
				</Card>
			{/each}
		</div>
	</div>
{:else if loadFailure}
	<div class="space-y-4 sm:space-y-6">
		<div class="space-y-1">
			<h1 class="text-xl font-semibold tracking-tight sm:text-2xl">Settings</h1>
			<p class="max-w-2xl text-xs text-muted-foreground sm:text-sm">
				Site-wide configuration used across the public pages.
			</p>
		</div>
		<ErrorRetry failure={loadFailure} subject="settings" onretry={loadSettings} />
	</div>
{:else}
	<form bind:this={formEl} onsubmit={save} class="space-y-4 sm:space-y-6">
		<div class="space-y-1">
			<h1 class="text-xl font-semibold tracking-tight sm:text-2xl">Settings</h1>
			<p class="max-w-2xl text-xs text-muted-foreground sm:text-sm">
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
							disabled={busy}
							aria-invalid={!!fieldErrors.siteName}
							oninput={() => {
								fieldErrors.siteName = '';
								formError = '';
							}}
						/>
						{#if fieldErrors.siteName}<FieldError>{fieldErrors.siteName}</FieldError>{/if}
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel>Tagline</Field.FieldLabel>
						<Input
							bind:value={form.tagline}
							placeholder="Halal trade intelligence for buyers and suppliers"
							disabled={busy}
							aria-invalid={!!fieldErrors.tagline}
							oninput={() => {
								fieldErrors.tagline = '';
								formError = '';
							}}
						/>
						{#if fieldErrors.tagline}<FieldError>{fieldErrors.tagline}</FieldError>{/if}
					</Field.Field>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Contact</CardTitle>
					<CardDescription>Email addresses surfaced on the contact page and footer.</CardDescription
					>
				</CardHeader>
				<CardContent class="space-y-4">
					<Field.Field>
						<Field.FieldLabel>Support email</Field.FieldLabel>
						<Input
							bind:value={form.supportEmail}
							type="email"
							placeholder="support@halalneo.com"
							disabled={busy}
							aria-invalid={!!fieldErrors.supportEmail}
							oninput={() => {
								fieldErrors.supportEmail = '';
								formError = '';
							}}
						/>
						{#if fieldErrors.supportEmail}<FieldError>{fieldErrors.supportEmail}</FieldError>{/if}
					</Field.Field>
					<Field.Field>
						<Field.FieldLabel>Contact email</Field.FieldLabel>
						<Input
							bind:value={form.contactEmail}
							type="email"
							placeholder="hello@halalneo.com"
							disabled={busy}
							aria-invalid={!!fieldErrors.contactEmail}
							oninput={() => {
								fieldErrors.contactEmail = '';
								formError = '';
							}}
						/>
						{#if fieldErrors.contactEmail}<FieldError>{fieldErrors.contactEmail}</FieldError>{/if}
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
							disabled={busy}
							onCheckedChange={(v) => {
								form.enableDemoNotice = v;
								fieldErrors.enableDemoNotice = '';
							}}
						/>
					</div>
					{#if fieldErrors.enableDemoNotice}<FieldError>{fieldErrors.enableDemoNotice}</FieldError
						>{/if}
					<div class="flex items-center justify-between gap-3">
						<div>
							<p class="text-sm font-medium">Maintenance mode</p>
							<p class="text-sm text-muted-foreground">
								Placeholder flag — not yet enforced on the public site.
							</p>
						</div>
						<Switch
							checked={form.enableMaintenanceMode}
							disabled={busy}
							onCheckedChange={(v) => {
								form.enableMaintenanceMode = v;
								fieldErrors.enableMaintenanceMode = '';
							}}
						/>
					</div>
					{#if fieldErrors.enableMaintenanceMode}<FieldError
							>{fieldErrors.enableMaintenanceMode}</FieldError
						>{/if}
				</CardContent>
			</Card>
		</div>

		{#if formError}
			<Alert variant="destructive">
				<TriangleAlert />
				<AlertDescription>{formError}</AlertDescription>
			</Alert>
		{/if}

		<div class="flex items-center gap-3">
			<Button variant="default" type="submit" disabled={busy}>
				{busy ? 'Saving…' : 'Save settings'}
			</Button>
			{#if saved}
				<p class="flex items-center gap-2 text-sm text-success">
					<SettingsIcon class="size-4"></SettingsIcon>
					Saved.
				</p>
			{/if}
		</div>
	</form>
{/if}
