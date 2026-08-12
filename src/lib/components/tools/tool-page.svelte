<script lang="ts">
	import { localizeHref } from '$lib/paraglide/runtime.js';
	import { adminData } from '$lib/stores/admin-data.svelte';
	import type { AiTool } from '$lib/data/types';
	import { Button } from '$lib/components/ui/button';
	import { Badge } from '$lib/components/ui/badge';
	import {
		Card,
		CardContent,
		CardDescription,
		CardHeader,
		CardTitle
	} from '$lib/components/ui/card';
	import { Separator } from '$lib/components/ui/separator';
	import {
		Breadcrumb,
		BreadcrumbList,
		BreadcrumbItem,
		BreadcrumbLink,
		BreadcrumbSeparator,
		BreadcrumbPage
	} from '$lib/components/ui/breadcrumb';
	import Bot from '@lucide/svelte/icons/bot';
	import CheckCircle from '@lucide/svelte/icons/check-circle';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';
	import { error } from '@sveltejs/kit';

	let { slug, toolPath = '' }: { slug: string; toolPath?: string } = $props();

	const tool = $derived(adminData.aiTools.find((t) => t.slug === slug && t.status === 'active'));

	const categoryLabels: Record<string, string> = {
		assistant: 'Assistant',
		compliance: 'Compliance',
		sourcing: 'Sourcing',
		documentation: 'Documentation'
	};

	const href = (s: string) => (toolPath ? `${toolPath}/${s}` : `/${s}`);

	function findOthers(t: AiTool | undefined): AiTool[] {
		return t ? adminData.aiTools.filter((x) => x.slug !== t.slug && x.status === 'active') : [];
	}

	const others = $derived.by(() => findOthers(tool));

	$effect(() => {
		if (!tool) error(404, 'Tool not found');
	});
</script>

<svelte:head><title>{tool?.name ?? 'Tool'} — HalalNeo</title></svelte:head>

{#if tool}
	<section class="space-y-8">
		<Breadcrumb>
			<BreadcrumbList>
				<BreadcrumbItem>
					<BreadcrumbLink href={localizeHref('/tools')}>AI tools</BreadcrumbLink>
				</BreadcrumbItem>
				<BreadcrumbSeparator />
				<BreadcrumbItem>
					<BreadcrumbPage>{tool.name}</BreadcrumbPage>
				</BreadcrumbItem>
			</BreadcrumbList>
		</Breadcrumb>

		<div class="grid gap-8 lg:grid-cols-[1fr_360px]">
			<div class="space-y-6">
				<div class="space-y-3">
					<div class="flex items-center gap-2">
						<div class="flex size-11 items-center justify-center rounded-xl bg-primary/15">
							<Bot class="size-5 text-primary"></Bot>
						</div>
						<Badge variant="secondary">{categoryLabels[tool.category] ?? tool.category}</Badge>
					</div>
					<h1 class="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
						{tool.name}
					</h1>
					<p class="max-w-2xl text-lg text-muted-foreground">
						{tool.longDescription || tool.description}
					</p>
				</div>

				{#if tool.features.length > 0}
					<Card>
						<CardHeader>
							<CardTitle class="text-base">What it does</CardTitle>
						</CardHeader>
						<CardContent>
							<ul class="space-y-2.5">
								{#each tool.features as feature (feature)}
									<li class="flex items-start gap-2 text-sm text-muted-foreground">
										<CheckCircle class="mt-0.5 size-4 shrink-0 text-primary"></CheckCircle>
										<span>{feature}</span>
									</li>
								{/each}
							</ul>
						</CardContent>
					</Card>
				{/if}

				<Card>
					<CardHeader>
						<CardTitle class="text-base">Availability</CardTitle>
					</CardHeader>
					<CardContent>
						<div class="flex items-center gap-2 text-sm text-muted-foreground">
							<span>Status</span>
							<Separator orientation="vertical" class="h-4"></Separator>
							<span class="font-medium text-foreground">{tool.status}</span>
						</div>
					</CardContent>
				</Card>
			</div>

			<div class="space-y-4 lg:sticky lg:top-24 lg:self-start">
				<Card>
					<CardHeader>
						<CardTitle class="text-base">Try it out</CardTitle>
						<CardDescription>Running this tool is coming soon.</CardDescription>
					</CardHeader>
					<CardContent>
						<Button variant="default" class="w-full" disabled>
							Launch {tool.name}
							<ArrowUpRight class="size-4" data-icon="inline-end"></ArrowUpRight>
						</Button>
						<p class="mt-3 text-center text-xs text-muted-foreground">
							Demo only — tool execution arrives with the AI engine.
						</p>
					</CardContent>
				</Card>

				{#if others.length > 0}
					<Card>
						<CardHeader>
							<CardTitle class="text-base">More tools</CardTitle>
						</CardHeader>
						<CardContent class="space-y-2">
							{#each others as other (other.slug)}
								<Button
									href={localizeHref(href(other.slug))}
									variant="ghost"
									class="w-full justify-start"
								>
									{other.name}
									<ArrowUpRight class="size-4" data-icon="inline-end"></ArrowUpRight>
								</Button>
							{/each}
						</CardContent>
					</Card>
				{/if}
			</div>
		</div>

		<div>
			<Button href={localizeHref('/tools')} variant="ghost" size="sm">
				<ArrowLeft class="size-4"></ArrowLeft>
				All AI tools
			</Button>
		</div>
	</section>
{/if}
