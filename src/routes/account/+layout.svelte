<script lang="ts">
	import AccountNav from '#lib/components/site/account-nav.svelte';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';

	let { children } = $props();
</script>

<div class="mx-auto w-full max-w-7xl px-4 pb-24 pt-3 sm:px-6 sm:pb-10 sm:pt-6">
	<Breadcrumb items={[{ label: 'My Account', href: '/account' }]} />

	<AccountNav variant="mobile" />

	<div class="flex gap-4">
		<AccountNav variant="desktop" />

		<div class="flex-1 min-w-0">
			{@render children()}
		</div>
	</div>
</div>
