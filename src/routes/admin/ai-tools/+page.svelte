<script lang="ts">
	import {
		adminData,
		upsertItem,
		deleteItem,
		resetCollection
	} from '#lib/stores/admin-data.svelte.js';
	import type { AiTool } from '#lib/data/types.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import * as Field from '#lib/components/ui/field/index.js';
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
	import {
		Select,
		SelectContent,
		SelectItem,
		SelectTrigger
	} from '#lib/components/ui/select/index.js';
	import Plus from '@lucide/svelte/icons/plus';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import Bot from '@lucide/svelte/icons/bot';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import ConfirmDialog from '#lib/components/site/confirm-dialog.svelte';
	import { toast } from 'svelte-sonner';
	import { z } from 'zod';
	import { focusFirstInvalid, mergeServerDetails } from '#lib/utils/forms.js';

	let dialogOpen = $state(false);
	let editing = $state<AiTool | null>(null);
	let confirmSlug = $state<string | null>(null);
	let confirmName = $state('');

	type ToolForm = {
		id: string;
		slug: string;
		name: string;
		description: string;
		longDescription: string;
		features: string;
		category: AiTool['category'];
		status: AiTool['status'];
	};
	let form = $state<ToolForm>({
		id: '',
		slug: '',
		name: '',
		description: '',
		longDescription: '',
		features: '',
		category: 'assistant',
		status: 'disabled'
	});
	let errors = $state<Record<string, string>>({});
	let formEl = $state<HTMLFormElement | null>(null);
	let busy = $state(false);

	const categoryLabels: Record<AiTool['category'], string> = {
		assistant: 'Assistant',
		compliance: 'Compliance',
		sourcing: 'Sourcing',
		documentation: 'Documentation'
	};

	// Zod schema for AI tool validation
	const toolSchema = z.object({
		name: z.string().min(1, 'Tool name is required'),
		slug: z.string().min(1, 'Slug is required'),
		category: z.enum(['assistant', 'compliance', 'sourcing', 'documentation']),
		status: z.enum(['active', 'disabled']),
		description: z.string().optional(),
		longDescription: z.string().optional(),
		features: z.string().optional()
	});

	function openCreate() {
		editing = null;
		form = {
			id: '',
			slug: '',
			name: '',
			description: '',
			longDescription: '',
			features: '',
			category: 'assistant',
			status: 'disabled'
		};
		errors = {};
		dialogOpen = true;
	}

	function openEdit(t: AiTool) {
		editing = t;
		form = {
			id: t.id,
			slug: t.slug,
			name: t.name,
			description: t.description,
			longDescription: t.longDescription,
			features: t.features.join(', '),
			category: t.category,
			status: t.status
		};
		errors = {};
		dialogOpen = true;
	}

	function normalizeId(s: string): string {
		return s
			.toLowerCase()
			.trim()
			.replace(/[^a-z0-9]+/g, '-')
			.replace(/(^-|-$)/g, '');
	}

	const reservedSlugs = [
		'about',
		'account',
		'admin',
		'blog',
		'categories',
		'contact',
		'faq',
		'glossary',
		'knowledge-base',
		'login',
		'products',
		'register',
		'search',
		'suppliers',
		'tools'
	];

	function save() {
		// Reset errors
		errors = {};

		// Validate with Zod
		const result = toolSchema.safeParse(form);

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

			if (formEl) {
				focusFirstInvalid(formEl);
			}
			return;
		}

		// Additional manual validations
		const slug = form.slug || normalizeId(form.name);
		if (reservedSlugs.includes(slug)) {
			errors.slug = `"${slug}" is a reserved route and cannot be used as a tool slug.`;
			if (formEl) {
				focusFirstInvalid(formEl);
			}
			return;
		}

		const dup = adminData.aiTools.some((t) => t.slug === slug && t.slug !== editing?.slug);
		if (dup) {
			errors.slug = 'A tool with that slug already exists.';
			if (formEl) {
				focusFirstInvalid(formEl);
			}
			return;
		}

		busy = true;
		const base: AiTool =
			editing ??
			({
				id: '',
				slug: '',
				name: '',
				description: '',
				longDescription: '',
				features: [],
				category: 'assistant',
				status: 'disabled'
			} as AiTool);

		// Simulate async operation
		setTimeout(() => {
			upsertItem<AiTool>(
				'aiTools',
				{
					...base,
					id: editing ? base.id : slug,
					slug,
					name: form.name.trim(),
					description: form.description.trim(),
					longDescription: form.longDescription.trim(),
					features: form.features
						.split(',')
						.map((f) => f.trim())
						.filter(Boolean),
					category: form.category,
					status: form.status
				},
				editing ?? undefined
			);
			dialogOpen = false;
			toast.success(editing ? 'Tool updated' : 'Tool created');
			busy = false;
		}, 300);
	}

	function remove(t: AiTool) {
		confirmSlug = t.slug;
		confirmName = t.name;
	}

	function confirmedRemove() {
		if (!confirmSlug) return;
		deleteItem('aiTools', confirmSlug);
		toast.success('Tool deleted');
		confirmSlug = null;
	}
</script>

<svelte:head><title>AI Tools — HalalNeo Admin</title></svelte:head>

<div class="space-y-4 sm:space-y-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div class="space-y-1">
			<h1 class="text-2xl font-semibold tracking-tight sm:text-3xl">AI Tools</h1>
			<p class="max-w-2xl text-sm text-muted-foreground">
				AI-powered tools offered to platform users. Enable or disable tool availability.
			</p>
		</div>
		<div class="flex items-center gap-2">
			<Button variant="outline" size="sm" onclick={() => resetCollection('aiTools')}>
				Reset to seed
			</Button>
			<Button variant="default" onclick={openCreate}>
				<Plus class="size-4"></Plus>
				New tool
			</Button>
		</div>
	</div>

	<div class="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
		<Table>
			<TableHeader>
				<TableRow class="hover:bg-transparent">
					<TableHead>Tool</TableHead>
					<TableHead>Slug</TableHead>
					<TableHead>Category</TableHead>
					<TableHead>Status</TableHead>
					<TableHead class="text-right">Actions</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{#each adminData.aiTools as t (t.slug)}
					<TableRow>
						<TableCell>
							<div class="flex items-center gap-3">
								<div
									class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15"
								>
									<Bot class="size-4 text-primary"></Bot>
								</div>
								<div class="min-w-0">
									<p class="truncate font-medium">{t.name}</p>
									<p class="truncate text-xs text-muted-foreground">{t.description}</p>
								</div>
							</div>
						</TableCell>
						<TableCell class="text-sm text-muted-foreground">{t.slug}</TableCell>
						<TableCell class="text-sm text-muted-foreground">{categoryLabels[t.category]}</TableCell
						>
						<TableCell>
							<Badge variant={t.status === 'active' ? 'default' : 'secondary'}>{t.status}</Badge>
						</TableCell>
						<TableCell class="text-right">
							<div class="flex items-center justify-end gap-1">
								{#if t.status === 'active'}
									<Button
										href={localizeHref(`/${t.slug}`)}
										variant="ghost"
										size="icon"
										aria-label="View tool page"
									>
										<ExternalLink class="size-4"></ExternalLink>
									</Button>
								{/if}
								<Button variant="ghost" size="icon" aria-label="Edit" onclick={() => openEdit(t)}>
									<Pencil class="size-4"></Pencil>
								</Button>
								<Button
									variant="ghost"
									size="icon"
									aria-label="Delete"
									class="hover:bg-destructive/10 hover:text-destructive"
									onclick={() => remove(t)}
								>
									<Trash2 class="size-4"></Trash2>
								</Button>
							</div>
						</TableCell>
					</TableRow>
				{/each}
			</TableBody>
		</Table>
	</div>
</div>

<Dialog bind:open={dialogOpen}>
	<DialogContent class="sm:max-w-lg">
		<DialogHeader>
			<DialogTitle>{editing ? 'Edit tool' : 'New tool'}</DialogTitle>
			<DialogDescription>Register or update an AI tool offered on the platform.</DialogDescription>
		</DialogHeader>
		<form
			onsubmit={save}
			class="space-y-4"
			bind:this={formEl}
		>
			<div class="space-y-4">
				<Field.Field>
					<Field.FieldLabel>Name</Field.FieldLabel>
					<Input
						bind:value={form.name}
						placeholder="Certification Checker"
						aria-invalid={!!errors.name}
						aria-describedby={errors.name ? 'name-error' : undefined}
					/>
					{#if errors.name}
						<span id="name-error" class="text-sm text-destructive">{errors.name}</span>
					{/if}
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Slug</Field.FieldLabel>
					<Input
						bind:value={form.slug}
						placeholder="certification-checker"
						disabled={!!editing}
						aria-invalid={!!errors.slug}
						aria-describedby={errors.slug ? 'slug-error' : undefined}
					/>
					<p class="text-xs text-muted-foreground">
						Unique URL segment —auto-derived from the name when left blank.
					</p>
					{#if errors.slug}
						<span id="slug-error" class="text-sm text-destructive">{errors.slug}</span>
					{/if}
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Category</Field.FieldLabel>
					<Select bind:value={form.category} type="single">
						<SelectTrigger class="w-full">{categoryLabels[form.category]}</SelectTrigger>
						<SelectContent>
							{#each Object.entries(categoryLabels) as [value, label] (value)}
								<SelectItem {value}>{label}</SelectItem>
							{/each}
						</SelectContent>
					</Select>
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Status</Field.FieldLabel>
					<Select bind:value={form.status} type="single">
						<SelectTrigger class="w-full">{form.status}</SelectTrigger>
						<SelectContent>
							<SelectItem value="active">active</SelectItem>
							<SelectItem value="disabled">disabled</SelectItem>
						</SelectContent>
					</Select>
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Short description</Field.FieldLabel>
					<Textarea
						bind:value={form.description}
						rows={2}
						placeholder="What the tool does..."
					/>
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Long description</Field.FieldLabel>
					<Textarea
						bind:value={form.longDescription}
						rows={3}
						placeholder="Page-level description shown on the tool's dedicated page"
					/>
				</Field.Field>
				<Field.Field>
					<Field.FieldLabel>Features</Field.FieldLabel>
					<Textarea
						bind:value={form.features}
						rows={3}
						placeholder="Comma-separated features shown on the tool page..."
					/>
				</Field.Field>
			</div>
			<DialogFooter>
				<Button variant="outline" type="button" onclick={() => (dialogOpen = false)}>Cancel</Button>
				<Button variant="default" type="submit" disabled={busy}>{editing ? 'Save changes' : 'Create tool'}</Button>
			</DialogFooter>
		</form>
	</DialogContent>
</Dialog>

<ConfirmDialog
	open={confirmSlug !== null}
	title="Delete AI tool?"
	description={`Delete tool "${confirmName}"? This cannot be undone.`}
	confirmLabel="Delete"
	onconfirm={confirmedRemove}
/>
