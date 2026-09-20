<script lang="ts">
	import { page } from '$app/state';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import Mark from '#lib/components/site/mark.svelte';

	let status = $derived(page.status);
</script>

<svelte:head>
	<title>{status === 404 ? 'Page not found' : 'Something went wrong'} — HalalNeo</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="pattern-girih relative flex-1 flex items-center justify-center px-4 py-16">
	<div class="relative text-center max-w-md">
		<Mark variant="pattern" class="mx-auto mb-[-4rem] size-40 text-foreground" />
		<p class="text-8xl font-heading font-bold text-primary/20 select-none leading-none">{status}</p>
		<h1 class="mt-4 text-lg sm:text-2xl font-heading font-semibold tracking-tight">
			{status === 404 ? 'Page not found' : 'Something went wrong'}
		</h1>
		<p class="mt-2 text-sm text-muted-foreground leading-relaxed">
			{status === 404
				? "The page you're looking for doesn't exist or has been moved."
				: 'An unexpected error occurred. Please try again.'}
		</p>
		<Button href={localizeHref('/')} class="mt-6">
			Back to Home
		</Button>
	</div>
</div>
