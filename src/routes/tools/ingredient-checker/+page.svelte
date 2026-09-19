<script lang="ts">
	import { Card, CardContent } from '#lib/components/ui/card/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import { Alert, AlertDescription } from '#lib/components/ui/alert/index.js';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';
	import FlaskConicalIcon from '@lucide/svelte/icons/flask-conical';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import AlertTriangleIcon from '@lucide/svelte/icons/alert-triangle';
	import Loader2 from '@lucide/svelte/icons/loader-2';
	import LogIn from '@lucide/svelte/icons/log-in';
	import { Chat, type UIMessage } from '@ai-sdk/svelte';
	import { DefaultChatTransport } from 'ai';

	let { data } = $props();

	let ingredientInput = $state('');

	// AI SDK consumer for /api/chat (Mastra halal-agent streaming UIMessage protocol).
	const chat = new Chat<UIMessage>({
		transport: new DefaultChatTransport({ api: '/api/chat' })
	});

	const analysisPrompt = `Analyze this ingredient list for halal compliance. Return a structured verdict.

For EACH ingredient, classify as:
- HALAL (permitted)
- HARAM (forbidden)
- MASHBOOH (doubtful — needs clarification)
- UNKNOWN (insufficient information)

Also provide an OVERALL verdict for the entire product.

Format your response as:

## Overall Verdict: [HALAL / HARAM / MASHBOOH]

## Ingredient Analysis

| Ingredient | Status | Reason |
|-----------|--------|--------|
| ... | ... | ... |

## Key Concerns
- [list any problematic ingredients]

## Recommendations
- [actionable advice]

Ingredient list:
`;

	const loading = $derived(chat.status === 'submitted' || chat.status === 'streaming');
	const result = $derived.by(() => {
		const msgs = chat.messages;
		for (let i = msgs.length - 1; i >= 0; i--) {
			const m = msgs[i];
			if (m.role !== 'assistant') continue;
			return m.parts
				.filter((p) => p.type === 'text')
				.map((p) => ('text' in p ? p.text : ''))
				.join('');
		}
		return '';
	});
	const failed = $derived(chat.status === 'error');

	async function analyze() {
		if (!ingredientInput.trim() || loading) return;
		await chat
			.sendMessage({
				role: 'user',
				parts: [{ type: 'text', text: analysisPrompt + ingredientInput.trim() }]
			})
			.catch(() => {});
	}
</script>

<Breadcrumb
	items={[
		{ label: 'Tools', href: '/tools' },
		{ label: 'Ingredient Checker', href: '/tools/ingredient-checker' }
	]}
/>

<section class="space-y-4 sm:space-y-6">
	<div class="max-w-2xl space-y-2">
		<div class="flex items-center gap-2 text-sm font-medium text-muted-foreground">
			<FlaskConicalIcon class="size-4"></FlaskConicalIcon>
			Ingredient Checker
		</div>
		<h1 class="text-3xl font-semibold tracking-tight sm:text-4xl">Halal ingredient analysis</h1>
		<p class="text-xs text-muted-foreground sm:text-sm">
			Paste any ingredient list and get an instant AI-powered halal, haram, or mashbooh verdict for
			each ingredient.
		</p>
	</div>

	{#if !data.signedIn}
		<Card>
			<CardContent class="flex flex-col items-center gap-3 p-8 text-center">
				<div class="flex size-12 items-center justify-center rounded-xl bg-primary/10">
					<LogIn class="size-6 text-primary" />
				</div>
				<p class="text-sm font-medium">Sign in to use the Ingredient Checker</p>
				<p class="max-w-sm text-sm text-muted-foreground">
					This AI tool is available to registered users. Create a free account or sign in to
					continue.
				</p>
				<div class="flex gap-2">
					<Button size="sm" href="/login">Sign in</Button>
					<Button size="sm" variant="outline" href="/register">Create account</Button>
				</div>
			</CardContent>
		</Card>
	{:else}
		<div class="space-y-3">
			<Textarea
				class="min-h-[120px]"
				placeholder="Paste ingredient list here... (e.g., Water, Sugar, Cocoa Butter, Milk Powder, Soy Lecithin)"
				bind:value={ingredientInput}
			/>
			<div class="flex flex-wrap items-center justify-between gap-2">
				<p class="text-xs text-muted-foreground">Or try an example:</p>
				<div class="flex flex-wrap gap-1.5">
					{#each ['Water, Sugar, Cocoa Butter, Milk Powder, Soy Lecithin, Vanilla Extract, Salt', 'Flour, Sugar, Eggs, Butter, Baking Powder, Vanilla, Salt, Artificial Flavor', 'Chicken Breast, Olive Oil, Garlic, Lemon Juice, Turmeric, Cumin, Salt'] as ex, i (ex)}
						<Button
							variant="outline"
							size="sm"
							class="h-7 text-2xs"
							onclick={() => (ingredientInput = ex)}
						>
							Example {i + 1}
						</Button>
					{/each}
				</div>
			</div>
			<Button
				onclick={analyze}
				disabled={loading || !ingredientInput.trim()}
				aria-busy={loading}
				class="w-full sm:w-auto"
			>
				{#if loading}
					<Loader2 class="size-4 animate-spin" data-icon="inline-start" />
					Analyzing…
				{:else}
					<SparklesIcon class="size-4" data-icon="inline-start" />
					Analyze Ingredients
				{/if}
			</Button>
		</div>

		{#if failed}
			<Alert variant="destructive">
				<AlertDescription>Unable to analyze ingredients. Please try again.</AlertDescription>
			</Alert>
		{:else if result}
			<Card class="bg-card">
				<CardContent class="p-5">
					<div class="overflow-x-auto">
						<div class="content-body content-body-sm whitespace-pre-wrap">{result}</div>
					</div>
				</CardContent>
			</Card>
		{/if}
	{/if}

	<div class="rounded-xl border border-dashed border-border p-6 text-center text-muted-foreground">
		<AlertTriangleIcon class="mx-auto mb-2 size-8 opacity-40" />
		<p class="text-xs">
			This tool provides AI-generated guidance only. Always verify with an accredited halal
			certification body for official compliance decisions.
		</p>
	</div>
</section>
