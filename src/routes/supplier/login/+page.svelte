<script lang="ts">
	import { localizeHref } from '#lib/paraglide/runtime.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/field/index.js';
	import { Card, CardContent } from '#lib/components/ui/card/index.js';
	import Building2 from '@lucide/svelte/icons/building-2';
	import Mail from '@lucide/svelte/icons/mail';
	import Lock from '@lucide/svelte/icons/lock';
</script>

<svelte:head>
	<title>Supplier Login — HalalNeo</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="w-full max-w-md animate-fade-in mx-auto pt-6">
	<div class="mb-5">
		<div class="mx-auto mb-2 flex size-12 items-center justify-center rounded-2xl bg-primary/10">
			<Building2 class="size-6 text-primary"></Building2>
		</div>
		<h1 class="text-center text-xl font-bold tracking-tight sm:text-2xl">Supplier Portal</h1>
		<p class="mt-1 text-center text-xs text-muted-foreground">Access your supplier dashboard to manage listings and orders.</p>
	</div>

	<Card class="p-5 shadow-sm">
		<CardContent class="space-y-3 p-0">
			<form class="space-y-3">
				<div class="space-y-1">
					<Label class="text-[10px] font-medium">Email</Label>
					<div class="relative">
						<Mail class="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"></Mail>
						<Input type="email" placeholder="you@company.com" class="h-9 pl-9 text-[11px]" />
					</div>
				</div>
				<div class="space-y-1">
					<div class="flex items-center justify-between">
						<Label class="text-[10px] font-medium">Password</Label>
						<a href="/supplier/login" class="text-[10px] text-primary hover:underline">Forgot password?</a>
					</div>
					<div class="relative">
						<Lock class="absolute left-3 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground"></Lock>
						<Input type="password" placeholder="••••••••" class="h-9 pl-9 text-[11px]" />
					</div>
				</div>
				<div class="flex items-center gap-2">
					<input type="checkbox" id="remember" class="size-3.5 rounded border border-border" />
					<label for="remember" class="text-[10px] text-muted-foreground">Remember me</label>
				</div>
				<Button type="submit" class="relative w-full">Sign in</Button>
			</form>

			<div class="my-4 flex items-center gap-3">
				<div class="h-px flex-1 bg-border"></div>
				<span class="text-[10px] text-muted-foreground">or continue with</span>
				<div class="h-px flex-1 bg-border"></div>
			</div>
			<Button variant="outline" class="w-full">Continue with Google</Button>
		</CardContent>
	</Card>

	<div class="mt-5 space-y-1.5 text-center">
		<p class="text-[11px] text-muted-foreground">
			New to selling on HalalNeo?
			<a href={localizeHref('/supplier/onboarding')} class="text-primary hover:underline">Apply to become a supplier</a>
		</p>
		<p class="text-[10px] text-muted-foreground">
			Looking to source? <a href={localizeHref('/login')} class="text-primary hover:underline">Buyer sign in</a>
		</p>
	</div>
</div>
