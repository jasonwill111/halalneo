<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import Share2 from '@lucide/svelte/icons/share-2';
	import Link2 from '@lucide/svelte/icons/link-2';
	import Check from '@lucide/svelte/icons/check';

	let {
		title = '',
		text = '',
		class: className = ''
	}: {
		title?: string;
		text?: string;
		class?: string;
	} = $props();

	let copied = $state(false);
	let canNativeShare = $state(false);

	onMount(() => {
		canNativeShare = typeof navigator !== 'undefined' && 'share' in navigator;
	});

	function pageUrl(): string {
		if (typeof window === 'undefined') return 'https://halalneo.com';
		return window.location.href.split('#')[0];
	}

	function shareUrl(network: 'x' | 'linkedin' | 'whatsapp' | 'facebook'): string {
		const url = encodeURIComponent(pageUrl());
		const t = encodeURIComponent(title || document.title);
		switch (network) {
			case 'x':
				return `https://twitter.com/intent/tweet?text=${t}&url=${url}`;
			case 'linkedin':
				return `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
			case 'whatsapp':
				return `https://wa.me/?text=${t}%20${url}`;
			case 'facebook':
				return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
		}
	}

	type ShareCapableNavigator = Navigator & {
		share?: (data: { title?: string; text?: string; url?: string }) => Promise<unknown>;
	};

	async function nativeShare() {
		try {
			const nav = navigator as unknown as ShareCapableNavigator;
			await nav.share?.call(nav, { title, text: text || title, url: pageUrl() });
		} catch {
			// user dismissed — no-op
		}
	}

	async function copyLink() {
		try {
			await navigator.clipboard.writeText(pageUrl());
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			// clipboard unavailable — no-op
		}
	}

	const networks = [
		{ id: 'x', label: 'Share on X', mark: 'X' },
		{ id: 'linkedin', label: 'Share on LinkedIn', mark: 'in' },
		{ id: 'whatsapp', label: 'Share on WhatsApp', mark: 'WA' },
		{ id: 'facebook', label: 'Share on Facebook', mark: 'f' }
	] as const;
</script>

<div class={`flex flex-wrap items-center gap-1.5 sm:gap-2 ${className}`}>
	{#if canNativeShare}
		<Button variant="outline" size="sm" class="sm:hidden" onclick={nativeShare} aria-label="Share">
			<Share2 class="size-3.5" />
		</Button>
		<Button variant="outline" size="sm" class="hidden sm:inline-flex" onclick={nativeShare}>
			<Share2 class="size-3.5" />
			Share
		</Button>
	{/if}
	{#each networks as n (n.id)}
		<Button
			variant="outline"
			size="sm"
			class="w-7 justify-center px-0 sm:w-auto sm:px-2.5"
			href={shareUrl(n.id)}
			target="_blank"
			rel="noopener"
			aria-label={n.label}
		>
			<span class="sm:hidden">{n.mark}</span>
			<span class="hidden sm:inline"
				>{n.id === 'x' ? 'X' : n.id.charAt(0).toUpperCase() + n.id.slice(1)}</span
			>
		</Button>
	{/each}
	<Button variant="outline" size="sm" onclick={copyLink} aria-label="Copy link">
		{#if copied}
			<Check class="size-3.5 text-success" />
			<span class="hidden sm:inline">Copied</span>
		{:else}
			<Link2 class="size-3.5" />
			<span class="hidden sm:inline">Copy link</span>
		{/if}
	</Button>
</div>
