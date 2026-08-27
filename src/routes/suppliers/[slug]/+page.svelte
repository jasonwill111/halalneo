<script lang="ts">
	import { Badge } from '#lib/components/ui/badge/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
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
				<h1 class="text-3xl font-bold tracking-tight">{data.item.name}</h1>
				<div class="flex flex-wrap gap-2">
					{#each data.item.certifications as cert}
						<Badge variant="secondary">{cert}</Badge>
					{/each}
				</div>
			</header>

			<div class="grid gap-6 md:grid-cols-2">
				<Card>
					<CardHeader>
						<CardTitle>Company Overview</CardTitle>
					</CardHeader>
					<CardContent class="space-y-3">
						<p class="text-muted-foreground">{data.item.description}</p>
						<div class="grid grid-cols-2 gap-4 text-sm">
							<div>
								<p class="text-muted-foreground">Location</p>
								<p class="font-medium">{data.item.location}</p>
							</div>
							<div>
								<p class="text-muted-foreground">Founded</p>
								<p class="font-medium">{data.item.founded}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardHeader>
						<CardTitle>Contact</CardTitle>
					</CardHeader>
					<CardContent class="space-y-3">
						<Button variant="outline" class="w-full">Request Quote</Button>
						<Button variant="outline" class="w-full">Send Message</Button>
					</CardContent>
				</Card>
			</div>

			<section class="space-y-4">
				<h2 class="text-xl font-semibold">Products</h2>
				<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{#each data.item.products as product}
						<Card>
							<CardContent class="p-4">
								<p class="font-medium">{product.name}</p>
								<Button href={`/products/${product.slug}`} variant="link" size="sm" class="mt-2 px-0">
									View
								</Button>
							</CardContent>
						</Card>
					{/each}
				</div>
			</section>
		</article>
	{:else}
		<div class="flex min-h-[50vh] items-center justify-center">
			<div class="text-center space-y-4">
				<p class="text-muted-foreground text-lg">Supplier profile coming soon.</p>
				<Button href="/suppliers" variant="outline">Browse Suppliers</Button>
			</div>
		</div>
	{/if}
</div>
