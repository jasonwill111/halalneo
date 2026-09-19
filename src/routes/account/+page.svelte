<script lang="ts">
	import type { PageProps } from './$types';
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Card, CardContent } from '#lib/components/ui/card/index.js';
	import UserRound from '@lucide/svelte/icons/user-round';
	import Heart from '@lucide/svelte/icons/heart';
	import Mail from '@lucide/svelte/icons/mail';
	import ArrowUpRight from '@lucide/svelte/icons/arrow-up-right';

	// `data.user` is guaranteed by src/routes/account/+layout.server.ts, which
	// redirects anonymous visitors to /login?next=/account.
	let { data }: PageProps = $props();

	const firstName = $derived(
		(data.user.name.trim() || data.user.email.split('@')[0] || 'there').split(/\s+/)[0]
	);

	const links = [
		{
			label: 'Profile',
			href: '/account/profile',
			icon: UserRound,
			description: 'Manage your personal and company information.'
		},
		{
			label: 'Saved Items',
			href: '/account/saved',
			icon: Heart,
			description: 'View your saved products and manufacturers.'
		},
		{
			label: 'Inquiries',
			href: '/account/inquiries',
			icon: Mail,
			description: 'Track your product inquiries and messages.'
		}
	];
</script>

<svelte:head>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="space-y-5">
	<div>
		<h1 class="text-sm font-bold text-foreground">Welcome back, {firstName}</h1>
		<p class="mt-0.5 text-2xs text-muted-foreground">
			Here's a quick overview of your account.
		</p>
	</div>

	<div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
		{#each links as link (link.href)}
			<a href={localizeHref(link.href)} class="group block">
				<Card class="h-full transition-colors group-hover:border-primary/30 group-hover:shadow-md">
					<CardContent class="flex flex-col gap-2.5 p-4">
						<div class="flex items-center justify-between">
							<div class="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
								<link.icon class="size-4"></link.icon>
							</div>
							<ArrowUpRight class="size-3.5 text-muted-foreground transition-colors group-hover:text-primary"></ArrowUpRight>
						</div>
						<div>
							<h3 class="text-2xs-plus font-bold text-foreground">{link.label}</h3>
							<p class="mt-0.5 text-2xs leading-relaxed text-muted-foreground">
								{link.description}
							</p>
						</div>
					</CardContent>
				</Card>
			</a>
		{/each}
	</div>
</div>
