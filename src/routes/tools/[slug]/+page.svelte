<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Card, CardContent, CardHeader, CardTitle } from '#lib/components/ui/card/index.js';

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.seo.title}</title>
	<meta name="description" content={data.seo.description} />
</svelte:head>

<div class="container mx-auto max-w-7xl px-4 py-8">
	{#if data.item}
		<article class="space-y-8">
			<header class="space-y-2">
				<div class="flex flex-wrap items-center gap-3">
					<h1 class="text-3xl font-bold tracking-tight">{data.item.name}</h1>
					<Badge variant="secondary">{data.item.category}</Badge>
				</div>
				<p class="text-muted-foreground">{data.item.description}</p>
			</header>

			<div class="grid gap-6 lg:grid-cols-3">
				<div class="lg:col-span-2">
					<Card>
						<CardHeader>
							<CardTitle>Tool Interface</CardTitle>
						</CardHeader>
						<CardContent>
							<div class="flex min-h-[300vh] items-center justify-center rounded-md border border-dashed p-8">
								<p class="text-muted-foreground">Tool content will appear here.</p>
							</div>
						</CardContent>
					</Card>
				</div>

				<div class="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle class="text-lg">About</CardTitle>
						</CardHeader>
						<CardContent>
							<p class="text-sm text-muted-foreground">{data.item.about}</p>
						</CardContent>
					</Card>

					<div class="flex flex-col gap-2">
						<Button href="/tools" variant="outline">All Tools</Button>
						<Button variant="outline">Share</Button>
					</div>
				</div>
			</div>
		</article>
	{:else}
		<div class="flex min-h-[50vh] items-center justify-center">
			<div class="text-center space-y-4">
				<p class="text-muted-foreground text-lg">Tool coming soon.</p>
				<Button href="/tools" variant="outline">Browse Tools</Button>
			</div>
		</div>
	{/if}
</div>
