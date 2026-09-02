<script lang="ts">
	import BotIcon from '@lucide/svelte/icons/bot';
	import SparklesIcon from '@lucide/svelte/icons/sparkles';
</script>

<div class="mx-auto flex max-w-3xl flex-col items-center gap-6 py-20 text-center">
	<div class="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
		<BotIcon class="size-8 text-primary" />
	</div>
	<div>
		<h1 class="text-2xl font-bold">HalalNeo AI</h1>
		<p class="mt-2 text-muted-foreground">
			Your intelligent assistant for halal certification, sourcing, and compliance.
		</p>
	</div>
	<div class="flex items-center gap-2 rounded-full border border-dashed border-border px-4 py-2 text-sm text-muted-foreground">
		<SparklesIcon class="size-4" />
		Coming soon
	</div>
	<p class="max-w-md text-sm text-muted-foreground/70">
		We're preparing an AI-powered assistant to help you navigate the halal ecosystem.
		Check back soon.
	</p>
</div>
