<script lang="ts">
	import { contentBlockSchema, type ContentBlock } from '#lib/schemas/blocks.js';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import StatTile from '#lib/components/site/stat-tile.svelte';
	import Accordion from '#lib/components/ui/accordion/accordion.svelte';
	import AccordionContent from '#lib/components/ui/accordion/accordion-content.svelte';
	import AccordionItem from '#lib/components/ui/accordion/accordion-item.svelte';
	import AccordionTrigger from '#lib/components/ui/accordion/accordion-trigger.svelte';
	import Badge from '#lib/components/ui/badge/badge.svelte';
	import Button from '#lib/components/ui/button/button.svelte';
	import Card from '#lib/components/ui/card/card.svelte';
	import CardDescription from '#lib/components/ui/card/card-description.svelte';
	import CardHeader from '#lib/components/ui/card/card-header.svelte';
	import CardTitle from '#lib/components/ui/card/card-title.svelte';
	import Table from '#lib/components/ui/table/table.svelte';
	import TableBody from '#lib/components/ui/table/table-body.svelte';
	import TableCell from '#lib/components/ui/table/table-cell.svelte';
	import TableHead from '#lib/components/ui/table/table-head.svelte';
	import TableHeader from '#lib/components/ui/table/table-header.svelte';
	import TableRow from '#lib/components/ui/table/table-row.svelte';

	type CardItem = {
		title: string;
		description?: string | null;
		href?: string;
		badge?: string | null;
	};

	type ContentAction = {
		label: string;
		href: string;
	};

	interface Props {
		blocks: ContentBlock[];
	}

	let { blocks }: Props = $props();

	const validBlocks = $derived(
		blocks.flatMap((block) => {
			const parsed = contentBlockSchema.safeParse(block);
			return parsed.success ? [parsed.data] : [];
		})
	);

	function isExternalHref(href: string): boolean {
		return /^(?:https?:)?\/\//i.test(href);
	}

	function isSafeHref(href: string): boolean {
		return (
			/^(?:https?:\/\/|\/\/|mailto:|tel:)/i.test(href) || /^(?:\/|#|\?|\.\/|\.\.\/)/.test(href)
		);
	}

	function resolveHref(href: string): string | null {
		if (!isSafeHref(href)) return null;
		if (isExternalHref(href) || /^(?:mailto:|tel:)/i.test(href)) return href;
		if (href.startsWith('#')) return href;
		try {
			return localizeHref(href);
		} catch {
			return null;
		}
	}

	function isLinkableHref(href: string): boolean {
		return resolveHref(href) !== null;
	}

	function isNumericValue(value: string): boolean {
		const normalized = value.trim().replace(/[$€£¥,%\s]/g, '');
		return normalized.length > 0 && Number.isFinite(Number(normalized));
	}
</script>

{#snippet action(contentAction: ContentAction, variant: 'default' | 'outline' = 'default')}
	{#if isLinkableHref(contentAction.href)}
		<Button
			href={resolveHref(contentAction.href)}
			{variant}
			class="w-full sm:w-auto"
			target={isExternalHref(contentAction.href) ? '_blank' : undefined}
			rel={isExternalHref(contentAction.href) ? 'noopener noreferrer' : undefined}
		>
			{contentAction.label}
		</Button>
	{/if}
{/snippet}

{#snippet cardContents(item: CardItem)}
	<Card size="sm" class="h-full" hoverable={Boolean(item.href)}>
		<CardHeader>
			{#if item.badge}
				<Badge variant="secondary" class="max-w-full truncate text-2xs">{item.badge}</Badge>
			{/if}
			<CardTitle class="min-w-0 truncate">
				<h3 class="truncate">{item.title}</h3>
			</CardTitle>
		</CardHeader>
		{#if item.description}
			<CardDescription class="hidden text-xs leading-relaxed sm:line-clamp-3 sm:block">
				{item.description}
			</CardDescription>
		{/if}
	</Card>
{/snippet}

{#snippet contentCard(item: CardItem)}
	{#if item.href && isLinkableHref(item.href)}
		<a
			href={resolveHref(item.href)}
			class="block min-w-0"
			target={isExternalHref(item.href) ? '_blank' : undefined}
			rel={isExternalHref(item.href) ? 'noopener noreferrer' : undefined}
		>
			{@render cardContents(item)}
		</a>
	{:else}
		{@render cardContents(item)}
	{/if}
{/snippet}

<div class="space-y-4 sm:space-y-6">
	{#each validBlocks as block (block.id)}
		{#if block.type === 'richText'}
			<div class="max-w-3xl space-y-3">
				{#each block.data.paragraphs as paragraph, index (`${block.id}-paragraph-${index}`)}
					<p class="text-sm leading-relaxed text-foreground">{paragraph}</p>
				{/each}
			</div>
		{:else if block.type === 'hero'}
			<section
				aria-labelledby={`${block.id}-title`}
				class="pattern-girih overflow-hidden rounded-xl border border-border bg-card p-4 sm:p-6"
			>
				<div class="relative z-10 max-w-3xl">
					{#if block.data.eyebrow}
						<p class="mb-2 text-2xs font-semibold tracking-wide text-primary uppercase">
							{block.data.eyebrow}
						</p>
					{/if}
					<h2 id={`${block.id}-title`} class="text-xl font-semibold sm:text-3xl">
						{block.data.title}
					</h2>
					{#if block.data.description}
						<p class="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
							{block.data.description}
						</p>
					{/if}
					{#if block.data.primaryAction || block.data.secondaryAction}
						<div class="mt-4 flex flex-col gap-2 sm:flex-row">
							{#if block.data.primaryAction}
								{@render action(block.data.primaryAction)}
							{/if}
							{#if block.data.secondaryAction}
								{@render action(block.data.secondaryAction, 'outline')}
							{/if}
						</div>
					{/if}
				</div>
			</section>
		{:else if block.type === 'statGrid'}
			<ul class="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
				{#each block.data.items as item, index (`${block.id}-stat-${index}`)}
					<li class="min-w-0">
						<StatTile value={item.value} label={item.label} hint={item.hint ?? undefined} />
					</li>
				{/each}
			</ul>
		{:else if block.type === 'cardGrid'}
			<ul class="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
				{#each block.data.items as item, index (`${block.id}-card-${index}`)}
					<li class="min-w-0">
						{@render contentCard(item)}
					</li>
				{/each}
			</ul>
		{:else if block.type === 'timeline'}
			<ol class="space-y-2">
				{#each block.data.items as item, index (`${block.id}-timeline-${index}`)}
					<li>
						<Card size="sm">
							<CardHeader class="gap-2 sm:grid-cols-[1fr_auto] sm:items-start">
								<CardTitle>
									<h3>{item.title}</h3>
								</CardTitle>
								{#if item.status}
									<Badge variant="secondary" class="text-2xs">{item.status}</Badge>
								{/if}
							</CardHeader>
							{#if item.description}
								<CardDescription class="text-xs leading-relaxed sm:text-sm">
									{item.description}
								</CardDescription>
							{/if}
						</Card>
					</li>
				{/each}
			</ol>
		{:else if block.type === 'faq'}
			<Accordion type="single" class="rounded-lg border border-border bg-card px-3">
				{#each block.data.items as item, index (`${block.id}-faq-${index}`)}
					<AccordionItem value={`${block.id}-${index}`}>
						<AccordionTrigger class="min-h-11 text-start text-pretty sm:text-sm">
							{item.question}
						</AccordionTrigger>
						<AccordionContent class="text-sm leading-relaxed text-pretty text-muted-foreground">
							<p>{item.answer}</p>
						</AccordionContent>
					</AccordionItem>
				{/each}
			</Accordion>
		{:else if block.type === 'quote'}
			<figure class="rounded-xl border-s-4 border-primary bg-muted/40 p-4 sm:p-5">
				<blockquote class="text-sm leading-relaxed font-medium italic sm:text-base">
					{block.data.text}
				</blockquote>
				{#if block.data.attribution}
					<figcaption class="mt-3 text-end text-2xs text-muted-foreground sm:text-xs">
						{block.data.attribution}
					</figcaption>
				{/if}
			</figure>
		{:else if block.type === 'cta'}
			<aside aria-labelledby={`${block.id}-title`}>
				<Card class="gap-3 p-4 sm:p-5">
					<CardHeader>
						<CardTitle>
							<h2 id={`${block.id}-title`} class="text-base sm:text-lg">
								{block.data.title}
							</h2>
						</CardTitle>
						{#if block.data.description}
							<CardDescription class="text-sm leading-relaxed">
								{block.data.description}
							</CardDescription>
						{/if}
					</CardHeader>
					<div class="px-(--card-spacing)">
						{@render action(block.data.action)}
					</div>
				</Card>
			</aside>
		{:else if block.type === 'image'}
			<figure class="mx-auto max-w-6xl">
				<img
					src={block.data.src}
					alt={block.data.alt}
					loading="lazy"
					decoding="async"
					class="max-h-2xl mx-auto w-auto max-w-full rounded-xl object-contain"
				/>
				{#if block.data.caption}
					<figcaption class="mt-2 text-center text-2xs text-muted-foreground sm:text-xs">
						{block.data.caption}
					</figcaption>
				{/if}
			</figure>
		{:else if block.type === 'relatedContent'}
			<section aria-label="Related content">
				<ul class="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
					{#each block.data.items as item, index (`${block.id}-related-${index}`)}
						<li class="min-w-0">
							{@render contentCard(item)}
						</li>
					{/each}
				</ul>
			</section>
		{:else if block.type === 'table'}
			<Table>
				<TableHeader>
					<TableRow>
						{#each block.data.columns as column, index (`${block.id}-column-${index}`)}
							<TableHead scope="col" class="text-xs sm:text-sm">{column}</TableHead>
						{/each}
					</TableRow>
				</TableHeader>
				<TableBody>
					{#each block.data.rows as row, rowIndex (`${block.id}-row-${rowIndex}`)}
						<TableRow>
							{#each row as cell, cellIndex (`${block.id}-row-${rowIndex}-cell-${cellIndex}`)}
								<TableCell
									class={isNumericValue(cell)
										? 'text-xs tabular-nums sm:text-sm'
										: 'text-xs whitespace-normal sm:text-sm'}
								>
									{cell}
								</TableCell>
							{/each}
						</TableRow>
					{/each}
				</TableBody>
			</Table>
		{/if}
	{/each}
</div>
