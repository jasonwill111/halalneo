<script lang="ts">
	import type { LayoutProps } from './$types';
	import AccountNav from '#lib/components/site/account-nav.svelte';
	import Breadcrumb from '#lib/components/site/breadcrumb.svelte';

	let { children, data }: LayoutProps = $props();
</script>

<div class="mx-auto w-full max-w-7xl px-3 pt-2 pb-20 sm:px-6 sm:pt-6 sm:pb-10">
	<Breadcrumb items={[{ label: 'My Account', href: '/account' }]} />

	<AccountNav variant="mobile" user={data.user} />

	<div
		class="grid min-w-0 grid-cols-1 items-start gap-3 sm:gap-4 lg:grid-cols-[13rem_minmax(0,1fr)]"
	>
		<AccountNav variant="desktop" user={data.user} />

		<div class="w-full min-w-0">
			{@render children()}
		</div>
	</div>
</div>
