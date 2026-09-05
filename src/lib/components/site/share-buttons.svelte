<script lang="ts">
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

	$effect(() => {
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

	async function nativeShare() {
		try {
			await (navigator as any).share({ title, text: text || title, url: pageUrl() });
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
		{ id: 'x', label: 'Share on X' },
		{ id: 'linkedin', label: 'Share on LinkedIn' },
		{ id: 'whatsapp', label: 'Share on WhatsApp' },
		{ id: 'facebook', label: 'Share on Facebook' }
	] as const;
</script>

<div class={`flex flex-wrap items-center gap-2 ${className}`}>
	{#if canNativeShare}
		<Button variant="outline" size="sm" onclick={nativeShare}>
			<Share2 class="size-3.5" />
			Share
		</Button>
	{/if}
	{#each networks as n (n.id)}
		<Button
			variant="outline"
			size="sm"
			href={shareUrl(n.id)}
			target="_blank"
			rel="noopener"
			aria-label={n.label}
		>
			{n.id === 'x' ? 'X' : n.id.charAt(0).toUpperCase() + n.id.slice(1)}
		</Button>
	{/each}
	<Button variant="outline" size="sm" onclick={copyLink} aria-label="Copy link">
		{#if copied}
			<Check class="size-3.5 text-success" />
			Copied
		{:else}
			<Link2 class="size-3.5" />
			Copy link
		{/if}
	</Button>
</div>
