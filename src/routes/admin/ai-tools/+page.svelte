<script lang="ts">
	import {
		adminData,
		upsertItem,
		deleteItem,
		resetCollection
	} from '$lib/stores/admin-data.svelte';
	import type { AiTool } from '$lib/data/types';
	import { Button } from '$lib/components/ui/button';
	import { Input } from '$lib/components/ui/input';
	import { Textarea } from '$lib/components/ui/textarea';
	import { Badge } from '$lib/components/ui/badge';
	import { Field, FieldLabel } from '$lib/components/ui/field';
	import {
		Table,
		TableBody,
		TableCell,
		TableHead,
		TableHeader,
		TableRow
	} from '$lib/components/ui/table';
	import {
		Dialog,
		DialogContent,
		DialogDescription,
		DialogFooter,
		DialogHeader,
		DialogTitle
	} from '$lib/components/ui/dialog';
	import { Select, SelectContent, SelectItem, SelectTrigger } from '$lib/components/ui/select';
	import Plus from '@lucide/svelte/icons/plus';
	import Pencil from '@lucide/svelte/icons/pencil';
	import Trash2 from '@lucide/svelte/icons/trash-2';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import Bot from '@lucide/svelte/icons/bot';
	import { localizeHref } from '$lib/paraglide/runtime.js';

	let dialogOpen = $state(false);
	let editing = $state<AiTool | null>(null);

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
	let formError = $state('');

	const categoryLabels: Record<AiTool['category'], string> = {
		assistant: 'Assistant',
		compliance: 'Compliance',
		sourcing: 'Sourcing',
		documentation: 'Documentation'
	};

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
		formError = '';
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
		formError = '';
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
		if (!form.name.trim()) {
			formError = 'Tool name is required.';
			return;
		}
		const slug = form.slug || normalizeId(form.name);
		if (reservedSlugs.includes(slug)) {
			formError = `"${slug}" is a reserved route and cannot be used as a tool slug.`;
			return;
		}
		const dup = adminData.aiTools.some((t) => t.slug === slug && t.slug !== editing?.slug);
		if (dup) {
			formError = 'A tool with that slug already exists.';
			return;
		}
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
	}

	function remove(t: AiTool) {
		if (window.confirm(`Delete tool ${t.name}?`)) {
			deleteItem('aiTools', t.slug);
		}
	}
</script>

<svelte:head><title>AI Tools — HalalNeo Admin</title></svelte:head>

<div class="space-y-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div class="space-y-1">
			<h1 class="text-3xl font-semibold tracking-tight">AI Tools</h1>
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

	<div class="rounded-xl ring-1 ring-foreground/10">
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
	<DialogContent class="sm:max-w-md">
		<DialogHeader>
			<DialogTitle>{editing ? 'Edit tool' : 'New tool'}</DialogTitle>
			<DialogDescription>Register or update an AI tool offered on the platform.</DialogDescription>
		</DialogHeader>
		<div class="space-y-4">
			<Field>
				<FieldLabel>Name</FieldLabel>
				<Input bind:value={form.name} placeholder="Certification Checker" />
			</Field>
			<Field>
				<FieldLabel>Slug</FieldLabel>
				<Input bind:value={form.slug} placeholder="certification-checker" disabled={!!editing} />
				<p class="text-xs text-muted-foreground">
					Unique URL segment — auto-derived from the name when left blank.
				</p>
			</Field>
			<Field>
				<FieldLabel>Category</FieldLabel>
				<Select bind:value={form.category} type="single">
					<SelectTrigger class="w-full">{categoryLabels[form.category]}</SelectTrigger>
					<SelectContent>
						{#each Object.entries(categoryLabels) as [value, label] (value)}
							<SelectItem {value}>{label}</SelectItem>
						{/each}
					</SelectContent>
				</Select>
			</Field>
			<Field>
				<FieldLabel>Status</FieldLabel>
				<Select bind:value={form.status} type="single">
					<SelectTrigger class="w-full">{form.status}</SelectTrigger>
					<SelectContent>
						<SelectItem value="active">active</SelectItem>
						<SelectItem value="disabled">disabled</SelectItem>
					</SelectContent>
				</Select>
			</Field>
			<Field>
				<FieldLabel>Short description</FieldLabel>
				<Textarea bind:value={form.description} rows={2} placeholder="What the tool does…" />
			</Field>
			<Field>
				<FieldLabel>Long description</FieldLabel>
				<Textarea
					bind:value={form.longDescription}
					rows={3}
					placeholder="Page-level description shown on the tool's dedicated page…"
				/>
			</Field>
			<Field>
				<FieldLabel>Features</FieldLabel>
				<Textarea
					bind:value={form.features}
					rows={3}
					placeholder="Comma-separated features shown on the tool page…"
				/>
			</Field>
			{#if formError}
				<p class="text-sm text-destructive">{formError}</p>
			{/if}
		</div>
		<DialogFooter>
			<Button variant="outline" onclick={() => (dialogOpen = false)}>Cancel</Button>
			<Button variant="default" onclick={save}>{editing ? 'Save changes' : 'Create tool'}</Button>
		</DialogFooter>
	</DialogContent>
</Dialog>
