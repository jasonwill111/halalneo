<script lang="ts">
	import type { PageProps } from './$types';
	import { invalidateAll } from '$app/navigation';
	import { authClient } from '#lib/auth-client.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label, FieldError } from '#lib/components/ui/field/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { z } from 'zod';
	import { toast } from 'svelte-sonner';
	import { focusFirstInvalid, mergeServerDetails, readAuthErrorDetails } from '#lib/utils/forms.js';
	import Loader2 from '@lucide/svelte/icons/loader-2';

	// Guaranteed by src/routes/account/+layout.server.ts (session guard).
	let { data }: PageProps = $props();
	const user = $derived(data.user);

	/** Split a Better Auth `user.name` back into the form's two inputs. */
	function splitName(fullName: string): { first: string; last: string } {
		const parts = fullName.trim().split(/\s+/);
		return { first: parts[0] ?? '', last: parts.slice(1).join(' ') };
	}

	const initials = $derived(
		(user.name || 'U')
			.split(/\s+/)
			.map((w) => w[0])
			.filter(Boolean)
			.join('')
			.slice(0, 2)
			.toUpperCase() || 'U'
	);

	let firstName = $state('');
	let lastName = $state('');
	let fieldErrors = $state<Record<string, string>>({});
	let formEl = $state<HTMLFormElement | undefined>(undefined);
	let saved = $state(false);
	let saving = $state(false);

	// Seed (and re-seed after a successful save + `invalidateAll()`) from the
	// server-provided name, so the inputs always mirror the stored value.
	$effect(() => {
		const parts = splitName(user.name);
		firstName = parts.first;
		lastName = parts.last;
	});

	const profileClientSchema = z.object({
		firstName: z
			.string()
			.trim()
			.min(1, 'First name is required.')
			.max(100, 'First name must be at most 100 characters.'),
		lastName: z.string().trim().max(100, 'Last name must be at most 100 characters.')
	});

	function resetForm() {
		const parts = splitName(user.name);
		firstName = parts.first;
		lastName = parts.last;
		fieldErrors = {};
		saved = false;
	}

	async function submit() {
		if (saving) return; // double-submit guard (§3.4)
		fieldErrors = {};
		saved = false;
		const parsed = profileClientSchema.safeParse({ firstName, lastName });
		if (!parsed.success) {
			for (const issue of parsed.error.issues) {
				const key = String(issue.path[0] ?? '');
				if (key && !fieldErrors[key]) fieldErrors = { ...fieldErrors, [key]: issue.message };
			}
			focusFirstInvalid(formEl);
			return;
		}
		const name = `${firstName.trim()}${lastName.trim() ? ' ' + lastName.trim() : ''}`;
		if (name === user.name.trim()) {
			toast.info('No changes to save.');
			return;
		}
		saving = true;
		try {
			const { error: updateError } = await authClient.updateUser({ name });
			if (updateError) {
				const details = readAuthErrorDetails(updateError, 'firstName');
				if (details) fieldErrors = mergeServerDetails(fieldErrors, details);
				const message = updateError.message ?? 'Could not save your profile.';
				toast.error(message);
				focusFirstInvalid(formEl);
				return;
			}
			saved = true;
			toast.success('Profile saved.');
			await invalidateAll(); // refresh data.user (account card + sidebar identity)
		} catch {
			toast.error('Network error — could not save your profile. Please try again.');
		} finally {
			saving = false;
		}
	}
</script>

<svelte:head>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="space-y-4">
	<!-- Account card -->
	<div class="mb-3 rounded-xl bg-card p-3 ring-1 ring-foreground/10">
		<div class="flex items-center gap-3">
			<div
				class="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-sm font-bold text-primary"
			>
				{initials}
			</div>
			<div class="min-w-0">
				<div class="flex items-center gap-1.5">
					<h2 class="truncate text-xs font-bold text-foreground">{user.name || user.email}</h2>
					<Badge variant="secondary" class="px-1.5 py-0.5 text-2xs">
						<span class="size-1 rounded-full bg-success"></span>
						Active
					</Badge>
				</div>
				<p class="truncate text-2xs text-muted-foreground">{user.email}</p>
			</div>
		</div>
	</div>

	<!-- Profile settings form -->
	<div class="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
		<div class="border-b border-border px-3 py-2">
			<h3 class="text-2xs-plus font-bold text-foreground">Profile Settings</h3>
			<p class="mt-0.5 text-2xs text-muted-foreground">
				Manage the name shown on your HalalNeo account.
			</p>
		</div>
		<form
			class="space-y-2 p-3"
			bind:this={formEl}
			onsubmit={(e) => {
				e.preventDefault();
				void submit();
			}}
		>
			{#if saved && Object.keys(fieldErrors).length === 0}
				<p class="rounded-xl bg-success/10 px-3 py-2 text-xs text-success">Profile updated.</p>
			{/if}
			<div class="grid grid-cols-2 gap-2 sm:grid-cols-2">
				<div class="space-y-0.5">
					<Label class="text-2xs" for="profile-first-name">First Name</Label>
					<Input
						id="profile-first-name"
						type="text"
						bind:value={firstName}
						class="h-8 text-2xs-plus"
						autocomplete="given-name"
						aria-invalid={fieldErrors.firstName ? true : undefined}
						oninput={() => {
							if (fieldErrors.firstName) fieldErrors = { ...fieldErrors, firstName: '' };
						}}
					/>
					{#if fieldErrors.firstName}<FieldError>{fieldErrors.firstName}</FieldError>{/if}
				</div>
				<div class="space-y-0.5">
					<Label class="text-2xs" for="profile-last-name">Last Name</Label>
					<Input
						id="profile-last-name"
						type="text"
						bind:value={lastName}
						class="h-8 text-2xs-plus"
						autocomplete="family-name"
						aria-invalid={fieldErrors.lastName ? true : undefined}
						oninput={() => {
							if (fieldErrors.lastName) fieldErrors = { ...fieldErrors, lastName: '' };
						}}
					/>
					{#if fieldErrors.lastName}<FieldError>{fieldErrors.lastName}</FieldError>{/if}
				</div>
			</div>
			<div class="space-y-0.5">
				<Label class="text-2xs" for="profile-email">Email</Label>
				<Input
					id="profile-email"
					type="email"
					value={user.email}
					class="h-8 text-2xs-plus"
					autocomplete="email"
					disabled
				/>
				<p class="text-2xs text-muted-foreground">
					Your sign-in email can’t be changed here — contact HalalNeo support to move an account.
				</p>
			</div>
			<div class="flex items-center gap-1.5 pt-0.5">
				<Button
					type="submit"
					size="sm"
					class="h-7 text-2xs"
					disabled={saving}
					aria-busy={saving}
				>
					{#if saving}
						<Loader2 class="size-3 animate-spin" />
						Saving...
					{:else}
						Save Changes
					{/if}
				</Button>
				<Button
					type="button"
					variant="outline"
					size="sm"
					class="h-7 text-2xs"
					disabled={saving}
					onclick={resetForm}
				>
					Cancel
				</Button>
			</div>
		</form>
	</div>
</div>
