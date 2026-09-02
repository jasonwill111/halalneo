<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '#lib/components/ui/button/index.js';

	let status = $derived(page.status);
	let error = $derived(page.error);
</script>

<svelte:head>
	<title>{status === 404 ? 'Page not found' : 'Something went wrong'} — HalalNeo</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="flex-1 flex items-center justify-center px-4 py-16">
	<div class="text-center max-w-md">
		<p class="text-8xl font-heading font-bold text-primary/20 select-none leading-none">{status}</p>
		<h1 class="mt-4 text-lg sm:text-2xl font-heading font-semibold tracking-tight">
			{status === 404 ? 'Page not found' : 'Something went wrong'}
		</h1>
		<p class="mt-2 text-sm text-muted-foreground leading-relaxed">
			{status === 404
				? "The page you're looking for doesn't exist or has been moved."
				: 'An unexpected error occurred. Please try again.'}
		</p>
		<Button href="/" class="mt-6">
			Back to Home
		</Button>
	</div>
</div>
