<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Card, CardContent } from '#lib/components/ui/card/index.js';
	import { Badge } from '#lib/components/ui/badge/index.js';
	import BotIcon from '@lucide/svelte/icons/bot';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import Search from '@lucide/svelte/icons/search';
	import FileText from '@lucide/svelte/icons/file-text';
</script>

<div class="grid items-center gap-8 py-10 lg:grid-cols-2 lg:gap-12 lg:py-16">
	<div class="flex flex-col items-start gap-4 text-left">
		<Badge variant="secondary" class="gap-1.5">
			<SparklesIcon class="size-3" />
			Coming soon
		</Badge>
		<div class="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
			<BotIcon class="size-7 text-primary" />
		</div>
		<div>
			<h1 class="text-2xl font-bold tracking-tight sm:text-3xl">HalalNeo AI</h1>
			<p class="mt-2 max-w-md text-muted-foreground">
				Your intelligent assistant for halal certification, sourcing, and compliance.
				Ask in plain language — get answers grounded in certifier data.
			</p>
		</div>
		<div class="flex flex-wrap gap-2">
			<Button href={localizeHref('/register')}>Join the waitlist</Button>
			<Button href={localizeHref('/tools/ingredient-checker')} variant="outline">
				Try the Ingredient Checker
			</Button>
		</div>
	</div>
	<div class="grid gap-2 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
		{#each [
			{ icon: ShieldCheck, title: 'Certification answers', desc: 'Which certifier covers your product and market.' },
			{ icon: Search, title: 'Supplier discovery', desc: 'Find verified suppliers by capability and region.' },
			{ icon: FileText, title: 'Document drafting', desc: 'RFQs, ingredient declarations, audit checklists.' },
			{ icon: SparklesIcon, title: 'Market briefs', desc: 'Regulation changes summarized for your products.' }
		] as f (f.title)}
			<Card class="p-3">
				<CardContent class="flex items-start gap-2.5 p-0">
					<div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
						<f.icon class="size-4" />
					</div>
					<div class="min-w-0">
						<h2 class="text-xs font-semibold">{f.title}</h2>
						<p class="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">{f.desc}</p>
					</div>
				</CardContent>
			</Card>
		{/each}
	</div>
</div>
