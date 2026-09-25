<script lang="ts">
	import { onMount } from 'svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import Check from '@lucide/svelte/icons/check';
	import Link2 from '@lucide/svelte/icons/link-2';
	import Mail from '@lucide/svelte/icons/mail';
	import Share2 from '@lucide/svelte/icons/share-2';
	import {
		siFacebook,
		siLine,
		siPinterest,
		siReddit,
		siTelegram,
		siThreads,
		siTiktok,
		siVk,
		siWhatsapp,
		siX
	} from 'simple-icons';

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

	onMount((): void => {
		canNativeShare = typeof navigator !== 'undefined' && 'share' in navigator;
	});

	function pageUrl(): string {
		if (typeof window === 'undefined') return 'https://halalneo.com';
		return window.location.href.split('#')[0];
	}

	function shareContent(): string {
		return title || text || 'HalalNeo';
	}

	type ShareNetwork =
		| 'x'
		| 'facebook'
		| 'linkedin'
		| 'whatsapp'
		| 'reddit'
		| 'telegram'
		| 'email'
		| 'pinterest'
		| 'tiktok'
		| 'threads'
		| 'line'
		| 'vk';

	const brandIcons = {
		x: siX,
		facebook: siFacebook,
		whatsapp: siWhatsapp,
		reddit: siReddit,
		telegram: siTelegram,
		pinterest: siPinterest,
		tiktok: siTiktok,
		threads: siThreads,
		line: siLine,
		vk: siVk
	} as const;

	function brandPath(network: ShareNetwork): string {
		if (network === 'email' || network === 'linkedin') return '';
		return brandIcons[network].path;
	}

	function shareUrl(network: ShareNetwork): string {
		const url = encodeURIComponent(pageUrl());
		const content = encodeURIComponent(shareContent());
		const body = encodeURIComponent(`${shareContent()}\n\n${pageUrl()}`);

		switch (network) {
			case 'x':
				return `https://twitter.com/intent/tweet?text=${content}&url=${url}`;
			case 'facebook':
				return `https://www.facebook.com/sharer/sharer.php?u=${url}`;
			case 'linkedin':
				return `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
			case 'whatsapp':
				return `https://wa.me/?text=${content}%20${url}`;
			case 'reddit':
				return `https://www.reddit.com/submit?url=${url}&title=${content}`;
			case 'telegram':
				return `https://t.me/share/url?url=${url}&text=${content}`;
			case 'email':
				return `mailto:?subject=${content}&body=${body}`;
			case 'pinterest':
				return `https://www.pinterest.com/pin/create/button/?url=${url}&description=${content}`;
			case 'tiktok':
				return `https://www.tiktok.com/share?url=${url}`;
			case 'threads':
				return `https://www.threads.net/intent/post?text=${encodeURIComponent(`${shareContent()} ${pageUrl()}`)}`;
			case 'line':
				return `https://line.me/R/msg/text/?text=${encodeURIComponent(`${shareContent()}\n${pageUrl()}`)}`;
			case 'vk':
				return `https://vk.com/share.php?url=${url}&title=${content}`;
		}
	}

	type ShareCapableNavigator = Navigator & {
		share?: (data: { title?: string; text?: string; url?: string }) => Promise<unknown>;
	};

	async function nativeShare(): Promise<void> {
		try {
			const nav = navigator as unknown as ShareCapableNavigator;
			await nav.share?.call(nav, { title, text: text || title, url: pageUrl() });
		} catch {
			return;
		}
	}

	async function copyLink(): Promise<void> {
		try {
			await navigator.clipboard.writeText(pageUrl());
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			return;
		}
	}

	const networks: readonly { id: ShareNetwork; label: string }[] = [
		{ id: 'x', label: 'Share on X' },
		{ id: 'facebook', label: 'Share on Facebook' },
		{ id: 'linkedin', label: 'Share on LinkedIn' },
		{ id: 'whatsapp', label: 'Share on WhatsApp' },
		{ id: 'reddit', label: 'Share on Reddit' },
		{ id: 'telegram', label: 'Share on Telegram' },
		{ id: 'email', label: 'Share by email' },
		{ id: 'pinterest', label: 'Share on Pinterest' },
		{ id: 'tiktok', label: 'Share on TikTok' },
		{ id: 'threads', label: 'Share on Threads' },
		{ id: 'line', label: 'Share on LINE' },
		{ id: 'vk', label: 'Share on VK' }
	];
</script>

<div class={`flex flex-wrap items-center gap-1.5 sm:gap-2 ${className}`}>
	{#if canNativeShare}
		<Button variant="outline" size="sm" class="sm:hidden" onclick={nativeShare} aria-label="Share">
			<Share2 aria-hidden="true" class="size-3.5" />
		</Button>
		<Button variant="outline" size="sm" class="hidden sm:inline-flex" onclick={nativeShare}>
			<Share2 aria-hidden="true" class="size-3.5" />
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
			rel="noopener noreferrer"
			aria-label={n.label}
		>
			{#if n.id === 'linkedin'}
				<svg
					aria-hidden="true"
					viewBox="0 0 24 24"
					fill="currentColor"
					fill-rule="evenodd"
					class="size-3.5"
				>
					<path
						d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0z"
					/>
				</svg>
			{:else if n.id === 'email'}
				<Mail aria-hidden="true" class="size-3.5" />
			{:else}
				<svg aria-hidden="true" viewBox="0 0 24 24" fill="currentColor" class="size-3.5">
					<path d={brandPath(n.id)} />
				</svg>
			{/if}
		</Button>
	{/each}
	<Button
		variant="outline"
		size="sm"
		onclick={copyLink}
		aria-label={copied ? 'Link copied' : 'Copy link'}
	>
		{#if copied}
			<Check aria-hidden="true" class="size-3.5 text-success" />
			<span class="hidden sm:inline">Copied</span>
		{:else}
			<Link2 aria-hidden="true" class="size-3.5" />
			<span class="hidden sm:inline">Copy link</span>
		{/if}
	</Button>
</div>
