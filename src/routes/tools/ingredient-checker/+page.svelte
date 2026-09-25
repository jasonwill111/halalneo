<script lang="ts">
	import { Card, CardContent } from '#lib/components/ui/card/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import { Field, FieldLabel } from '#lib/components/ui/field/index.js';
	import { Skeleton } from '#lib/components/ui/skeleton/index.js';
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

	// AI SDK consumer for /api/chat (streamText streaming UIMessage protocol).
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
		<h1 class="text-xl font-semibold tracking-tight sm:text-2xl">Halal ingredient analysis</h1>
		<p class="max-w-2xl text-xs text-muted-foreground sm:text-sm">
			Paste any ingredient list and get an instant AI-powered halal, haram, or mashbooh verdict for
			each ingredient.
		</p>
	</div>

	{#if !data.signedIn}
		<Card>
			<CardContent class="flex flex-col items-center gap-3 p-6 text-center sm:p-8">
				<div class="flex size-12 items-center justify-center rounded-xl bg-primary/10">
					<LogIn class="size-6 text-primary" />
				</div>
				<p class="text-sm font-medium">Sign in to use the Ingredient Checker</p>
				<p class="max-w-sm text-xs text-muted-foreground sm:text-sm">
					This AI tool is available to registered users. Create a free account or sign in to
					continue.
				</p>
				<div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
					<Button class="min-h-11" href="/login">Sign in</Button>
					<Button class="min-h-11" variant="outline" href="/register">Create account</Button>
				</div>
			</CardContent>
		</Card>
	{:else}
		<Card>
			<CardContent class="space-y-4 p-4 sm:p-5">
				<Field>
					<FieldLabel for="ingredient-list" class="sr-only">Ingredient list</FieldLabel>
					<Textarea
						id="ingredient-list"
						class="min-h-40 min-w-0 resize-y"
						placeholder="Paste ingredient list here... (e.g., Water, Sugar, Cocoa Butter, Milk Powder, Soy Lecithin)"
						bind:value={ingredientInput}
					/>
				</Field>
				<div
					class="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between"
				>
					<p class="text-xs text-muted-foreground">Or try an example:</p>
					<div class="grid grid-cols-3 gap-1.5 sm:flex sm:flex-wrap">
						{#each ['Water, Sugar, Cocoa Butter, Milk Powder, Soy Lecithin, Vanilla Extract, Salt', 'Flour, Sugar, Eggs, Butter, Baking Powder, Vanilla, Salt, Artificial Flavor', 'Chicken Breast, Olive Oil, Garlic, Lemon Juice, Turmeric, Cumin, Salt'] as ex, i (ex)}
							<Button
								variant="outline"
								size="sm"
								class="h-11 min-w-0 px-2 text-2xs sm:h-7"
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
					class="min-h-11 w-full sm:w-auto"
				>
					{#if loading}
						<Loader2 class="size-4 animate-spin" data-icon="inline-start" />
						Analyzing…
					{:else}
						<SparklesIcon class="size-4" data-icon="inline-start" />
						Analyze Ingredients
					{/if}
				</Button>
			</CardContent>
		</Card>

		{#if failed}
			<Alert variant="destructive">
				<AlertTriangleIcon class="size-4" />
				<AlertDescription
					class="flex flex-col items-start gap-2 text-xs sm:flex-row sm:items-center sm:justify-between sm:text-sm"
				>
					<span>Unable to analyze ingredients. Check your connection and try again.</span>
					<Button class="min-h-11 sm:min-h-7" size="sm" variant="outline" onclick={analyze}>
						Try again
					</Button>
				</AlertDescription>
			</Alert>
		{:else if loading && !result}
			<Card class="bg-card" aria-label="Analyzing ingredients" aria-busy="true">
				<CardContent class="space-y-3 p-4 sm:p-5">
					<Skeleton class="h-4 w-2/5" />
					<Skeleton class="h-3 w-full" />
					<Skeleton class="h-3 w-11/12" />
					<Skeleton class="h-3 w-4/5" />
				</CardContent>
			</Card>
		{:else if result}
			<Card class="min-w-0 bg-card">
				<CardContent class="min-w-0 p-4 sm:p-5">
					<div
						class="content-body content-body-sm max-w-full min-w-0 [overflow-wrap:anywhere] break-words whitespace-pre-wrap"
					>
						{result}
					</div>
				</CardContent>
			</Card>
		{/if}
	{/if}

	<Alert class="border-dashed bg-muted/20 p-4 text-center">
		<AlertTriangleIcon class="mx-auto size-6 opacity-50" />
		<AlertDescription class="mx-auto max-w-2xl text-xs sm:text-sm">
			This tool provides AI-generated guidance only. Always verify with an accredited halal
			certification body for official compliance decisions.
		</AlertDescription>
	</Alert>
</section>
