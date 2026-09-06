<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import AccountNav from '#lib/components/site/account-nav.svelte';

	let { children } = $props();
</script>

<div class="mx-auto w-full max-w-7xl px-4 pb-24 pt-3 sm:px-6 sm:pb-10 sm:pt-6">
	<nav class="mb-2 flex items-center gap-1 text-[10px] text-muted-foreground">
		<a href={localizeHref('/')} class="hover:text-primary transition-colors">Home</a>
		<span class="text-foreground font-medium">My Account</span>
	</nav>

	<AccountNav variant="mobile" />

	<div class="flex gap-4">
		<AccountNav variant="desktop" />

		<div class="flex-1 min-w-0">
			{@render children()}
		</div>
	</div>
</div>
