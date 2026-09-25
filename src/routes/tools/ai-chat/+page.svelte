<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Card, CardContent } from '#lib/components/ui/card/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import {
		Empty,
		EmptyHeader,
		EmptyTitle,
		EmptyDescription,
		EmptyContent
	} from '#lib/components/ui/empty/index.js';
	import BrandedEmptyMedia from '#lib/components/site/branded-empty-media.svelte';
	import BotIcon from '@lucide/svelte/icons/bot';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import Search from '@lucide/svelte/icons/search';
	import FileText from '@lucide/svelte/icons/file-text';
</script>

<section class="mx-auto w-full max-w-6xl space-y-4 py-4 sm:space-y-6 sm:py-6 lg:py-8">
	<Empty class="min-w-0 border bg-card py-6 sm:py-8">
		<EmptyHeader class="max-w-2xl">
			<Badge variant="secondary" class="gap-1.5">
				<SparklesIcon class="size-3" />
				Coming soon
			</Badge>
			<BrandedEmptyMedia>
				<BotIcon class="size-7 text-primary" />
			</BrandedEmptyMedia>
			<EmptyTitle>
				<h1 class="text-xl font-semibold tracking-tight sm:text-2xl">HalalNeo AI</h1>
			</EmptyTitle>
			<EmptyDescription class="max-w-2xl text-xs sm:text-sm">
				Your intelligent assistant for halal certification, sourcing, and compliance. Ask in plain
				language — get answers grounded in certifier data.
			</EmptyDescription>
		</EmptyHeader>
		<EmptyContent class="w-full max-w-2xl">
			<div class="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
				<Button class="min-h-11 w-full sm:w-auto" href={localizeHref('/register')}>
					Join the waitlist
				</Button>
				<Button
					class="min-h-11 w-full sm:w-auto"
					href={localizeHref('/tools/ingredient-checker')}
					variant="outline"
				>
					Try the Ingredient Checker
				</Button>
			</div>
		</EmptyContent>
	</Empty>

	<div class="grid min-w-0 grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
		{#each [{ icon: ShieldCheck, title: 'Certification answers', desc: 'Which certifier covers your product and market.' }, { icon: Search, title: 'Supplier discovery', desc: 'Find verified suppliers by capability and region.' }, { icon: FileText, title: 'Document drafting', desc: 'RFQs, ingredient declarations, audit checklists.' }, { icon: SparklesIcon, title: 'Market briefs', desc: 'Regulation changes summarized for your products.' }] as feature (feature.title)}
			<Card class="h-full min-w-0 p-3 sm:p-4">
				<CardContent class="flex min-w-0 items-start gap-2.5 p-0">
					<div
						class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"
					>
						<feature.icon class="size-4" />
					</div>
					<div class="min-w-0">
						<h2 class="text-xs font-semibold">{feature.title}</h2>
						<p class="mt-0.5 text-2xs-plus leading-relaxed break-words text-muted-foreground">
							{feature.desc}
						</p>
					</div>
				</CardContent>
			</Card>
		{/each}
	</div>
</section>
