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

<div
	class="pattern-girih relative flex flex-1 items-center justify-center px-4 py-8 sm:px-6 sm:py-12"
>
	<div class="relative w-full max-w-md text-center">
		<Mark
			variant="pattern"
			class="mx-auto mb-[-2.5rem] size-28 text-foreground sm:mb-[-3rem] sm:size-36"
		/>
		<p class="font-heading text-6xl leading-none font-bold text-primary/20 select-none sm:text-8xl">
			{status}
		</p>
		<h1
			class="mt-3 font-heading text-xl font-semibold tracking-tight text-pretty sm:mt-4 sm:text-2xl"
		>
			{status === 404 ? 'Page not found' : 'Something went wrong'}
		</h1>
		<p class="mx-auto mt-2 max-w-[42ch] text-sm leading-relaxed text-pretty text-muted-foreground">
			{status === 404
				? "The page you're looking for doesn't exist or has been moved."
				: 'An unexpected error occurred. Please try again.'}
		</p>
		<Button href={localizeHref('/')} class="mt-5 w-full sm:mt-6 sm:w-auto">Back to Home</Button>
	</div>
</div>
