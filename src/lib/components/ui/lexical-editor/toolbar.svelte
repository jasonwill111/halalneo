<script lang="ts">
	import type { HeadingTagType } from '@lexical/rich-text';
	import BoldIcon from '@lucide/svelte/icons/bold';
	import ItalicIcon from '@lucide/svelte/icons/italic';
	import UnderlineIcon from '@lucide/svelte/icons/underline';
	import StrikethroughIcon from '@lucide/svelte/icons/strikethrough';
	import CodeIcon from '@lucide/svelte/icons/code';
	import Heading1Icon from '@lucide/svelte/icons/heading-1';
	import Heading2Icon from '@lucide/svelte/icons/heading-2';
	import Heading3Icon from '@lucide/svelte/icons/heading-3';
	import QuoteIcon from '@lucide/svelte/icons/quote';
	import ListIcon from '@lucide/svelte/icons/list';
	import ListOrderedIcon from '@lucide/svelte/icons/list-ordered';
	import LinkIcon from '@lucide/svelte/icons/link';
	import CodeBlockIcon from '@lucide/svelte/icons/file-code-2';
	import UndoIcon from '@lucide/svelte/icons/undo';
	import RedoIcon from '@lucide/svelte/icons/redo';

	let {
		onFormatText,
		onFormatHeading,
		onFormatQuote,
		onFormatUnorderedList,
		onFormatOrderedList,
		onRemoveList,
		onFormatCodeBlock,
		onToggleLink
	}: {
		onFormatText: (type: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code') => void;
		onFormatHeading: (tag: HeadingTagType) => void;
		onFormatQuote: () => void;
		onFormatUnorderedList: () => void;
		onFormatOrderedList: () => void;
		onRemoveList: () => void;
		onFormatCodeBlock: () => void;
		onToggleLink: (url: string) => void;
	} = $props();

	let showLinkInput = $state(false);
	let linkUrl = $state('');

	function handleLink() {
		if (showLinkInput) {
			onToggleLink(linkUrl);
			linkUrl = '';
			showLinkInput = false;
		} else {
			showLinkInput = true;
		}
	}

	function cancelLink() {
		linkUrl = '';
		showLinkInput = false;
	}
</script>

<div class="flex flex-wrap items-center gap-1 border-b border-border px-2 py-1.5">
	<div class="flex items-center gap-0.5">
		<button
			type="button"
			class="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
			onclick={() => onFormatText('bold')}
			title="Bold (Ctrl+B)"
		>
			<BoldIcon class="size-4" />
		</button>
		<button
			type="button"
			class="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
			onclick={() => onFormatText('italic')}
			title="Italic (Ctrl+I)"
		>
			<ItalicIcon class="size-4" />
		</button>
		<button
			type="button"
			class="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
			onclick={() => onFormatText('underline')}
			title="Underline (Ctrl+U)"
		>
			<UnderlineIcon class="size-4" />
		</button>
		<button
			type="button"
			class="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
			onclick={() => onFormatText('strikethrough')}
			title="Strikethrough"
		>
			<StrikethroughIcon class="size-4" />
		</button>
		<button
			type="button"
			class="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
			onclick={() => onFormatText('code')}
			title="Inline Code"
		>
			<CodeIcon class="size-4" />
		</button>
	</div>

	<div class="mx-1 h-4 w-px bg-border"></div>

	<div class="flex items-center gap-0.5">
		<button
			type="button"
			class="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
			onclick={() => onFormatHeading('h1')}
			title="Heading 1"
		>
			<Heading1Icon class="size-4" />
		</button>
		<button
			type="button"
			class="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
			onclick={() => onFormatHeading('h2')}
			title="Heading 2"
		>
			<Heading2Icon class="size-4" />
		</button>
		<button
			type="button"
			class="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
			onclick={() => onFormatHeading('h3')}
			title="Heading 3"
		>
			<Heading3Icon class="size-4" />
		</button>
		<button
			type="button"
			class="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
			onclick={onFormatQuote}
			title="Quote"
		>
			<QuoteIcon class="size-4" />
		</button>
	</div>

	<div class="mx-1 h-4 w-px bg-border"></div>

	<div class="flex items-center gap-0.5">
		<button
			type="button"
			class="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
			onclick={onFormatUnorderedList}
			title="Bullet List"
		>
			<ListIcon class="size-4" />
		</button>
		<button
			type="button"
			class="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
			onclick={onFormatOrderedList}
			title="Numbered List"
		>
			<ListOrderedIcon class="size-4" />
		</button>
		<button
			type="button"
			class="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
			onclick={onFormatCodeBlock}
			title="Code Block"
		>
			<CodeBlockIcon class="size-4" />
		</button>
		<button
			type="button"
			class="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
			onclick={handleLink}
			title="Insert Link"
		>
			<LinkIcon class="size-4" />
		</button>
	</div>
</div>

{#if showLinkInput}
	<div class="flex items-center gap-2 border-b border-border px-2 py-1.5">
		<input
			type="url"
			placeholder="https://..."
			class="flex-1 rounded border border-border bg-background px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
			bind:value={linkUrl}
			onkeydown={(e) => {
				if (e.key === 'Enter') handleLink();
				if (e.key === 'Escape') cancelLink();
			}}
		/>
		<button
			type="button"
			class="rounded bg-primary px-2 py-1 text-xs text-primary-foreground hover:bg-primary/90"
			onclick={handleLink}
		>
			Add
		</button>
		<button
			type="button"
			class="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-muted"
			onclick={cancelLink}
		>
			Cancel
		</button>
	</div>
{/if}
