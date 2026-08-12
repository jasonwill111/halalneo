<script lang="ts">
	import { localizeHref } from '$lib/paraglide/runtime.js';
	import { adminData } from '$lib/stores/admin-data.svelte';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import Bot from '@lucide/svelte/icons/bot';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';

	const tools = $derived(adminData.aiTools.filter((t) => t.status === 'active'));

	const categoryLabels: Record<string, string> = {
		assistant: 'Assistant',
		compliance: 'Compliance',
		sourcing: 'Sourcing',
		documentation: 'Documentation'
	};
</script>

<svelte:head><title>AI Tools — HalalNeo</title></svelte:head>

<section class="space-y-8">
	<div class="max-w-2xl space-y-2">
		<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">AI tools</h1>
		<p class="text-muted-foreground">
			Hands-on tools that turn halal trade intelligence into action — verification, sourcing,
			compliance and market research.
		</p>
	</div>

	{#if tools.length === 0}
		<div
			class="rounded-xl border border-border bg-muted/40 p-12 text-center text-sm text-muted-foreground"
		>
			No AI tools are available yet.
		</div>
	{:else}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each tools as tool (tool.slug)}
				<Card hoverable>
					<CardHeader class="gap-3">
						<div class="flex items-center justify-between">
							<div class="flex size-11 items-center justify-center rounded-xl bg-primary/15">
								<Bot class="size-5 text-primary"></Bot>
							</div>
							<Badge variant="secondary">{categoryLabels[tool.category] ?? tool.category}</Badge>
						</div>
						<div class="space-y-1">
							<CardTitle class="text-base">{tool.name}</CardTitle>
							<CardDescription class="line-clamp-2">{tool.description}</CardDescription>
						</div>
					</CardHeader>
					<CardContent>
						<Button href={localizeHref(`/${tool.slug}`)} variant="outline" size="sm" class="w-full">
							Open tool
							<ArrowUpRight class="size-4" data-icon="inline-end"></ArrowUpRight>
						</Button>
					</CardContent>
				</Card>
			{/each}
		</div>
	{/if}
</section>
