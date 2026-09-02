<script lang="ts">
	import { onMount } from 'svelte';
	import {
		createEditor,
		$getRoot as lexGetRoot,
		$getSelection as lexGetSelection,
		$createParagraphNode as lexCreateParagraphNode,
		$createTextNode as lexCreateTextNode,
		FORMAT_TEXT_COMMAND,
		SELECTION_CHANGE_COMMAND,
		type LexicalEditor,
		type RangeSelection
	} from 'lexical';
	import { createEmptyHistoryState, registerHistory } from '@lexical/history';
	import {
		$createHeadingNode as lexCreateHeadingNode,
		$createQuoteNode as lexCreateQuoteNode,
		type HeadingTagType
	} from '@lexical/rich-text';
	import {
		$createListNode as lexCreateListNode,
		INSERT_UNORDERED_LIST_COMMAND,
		INSERT_ORDERED_LIST_COMMAND,
		REMOVE_LIST_COMMAND
	} from '@lexical/list';
	import { $createLinkNode as lexCreateLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link';
	import {
		$generateNodesFromDOM as lexGenerateNodesFromDOM,
		$generateHtmlFromNodes as lexGenerateHtmlFromNodes
	} from '@lexical/html';
	import { mergeRegister } from '@lexical/utils';
	import { $createCodeNode as lexCreateCodeNode } from '@lexical/code';
	import Toolbar from './toolbar.svelte';

	let {
		initialHtml = '',
		placeholder = 'Start writing...',
		oninput = undefined,
		editable = true
	}: {
		initialHtml?: string;
		placeholder?: string;
		oninput?: (html: string) => void;
		editable?: boolean;
	} = $props();

	let editorRef = $state<HTMLDivElement | null>(null);
	let editor = $state<LexicalEditor | null>(null);
	let activeEditor = $state<LexicalEditor | null>(null);
	let isEmpty = $state(true);
	let historyState = $state(createEmptyHistoryState());

	function setHTML(html: string) {
		if (!activeEditor) return;
		const ed = activeEditor;
		ed.update(() => {
			const root = lexGetRoot();
			root.clear();
			if (html) {
				const parser = new DOMParser();
				const dom = parser.parseFromString(html, 'text/html');
				const nodes = lexGenerateNodesFromDOM(ed, dom);
				root.append(...nodes);
			}
		});
	}

	function getHTML(): string {
		if (!activeEditor) return '';
		let html = '';
		const ed = activeEditor;
		ed.update(() => {
			html = lexGenerateHtmlFromNodes(ed, null);
		});
		return html;
	}

	function updateIsEmpty() {
		if (!activeEditor) return;
		activeEditor.update(() => {
			const root = lexGetRoot();
			const children = root.getChildren();
			if (children.length === 1) {
				const first = children[0];
				isEmpty = first.getTextContent().trim() === '';
			} else {
				isEmpty = children.length === 0;
			}
		});
	}

	function formatText(type: 'bold' | 'italic' | 'underline' | 'strikethrough' | 'code') {
		activeEditor?.dispatchCommand(FORMAT_TEXT_COMMAND, type);
	}

	function formatHeading(tag: HeadingTagType) {
		activeEditor?.update(() => {
			const selection = lexGetSelection();
			if (!selection) return;
			const nodes = selection.getNodes();
			for (const node of nodes) {
				const parent = node.getParent();
				if (!parent) continue;
				if (parent.__type === 'heading') {
					parent.replace(lexCreateParagraphNode());
				}
			}
			for (const node of nodes) {
				const parent = node.getParent();
				if (!parent) continue;
				const heading = lexCreateHeadingNode(tag);
				parent.insertAfter(heading);
				heading.append(node);
			}
		});
	}

	function formatQuote() {
		activeEditor?.update(() => {
			const selection = lexGetSelection();
			if (!selection) return;
			const nodes = selection.getNodes();
			for (const node of nodes) {
				const parent = node.getParent();
				if (!parent) continue;
				const quote = lexCreateQuoteNode();
				parent.insertAfter(quote);
				quote.append(node);
			}
		});
	}

	function formatUnorderedList() {
		activeEditor?.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
	}

	function formatOrderedList() {
		activeEditor?.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
	}

	function removeList() {
		activeEditor?.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
	}

	function formatCodeBlock() {
		activeEditor?.update(() => {
			const sel = lexGetSelection();
			if (!sel || !('anchor' in sel)) return;
			const selection = sel as RangeSelection;
			const textContent = selection.getTextContent();
			const codeNode = lexCreateCodeNode();
			const textNode = lexCreateTextNode(textContent);
			codeNode.append(textNode);
			const selectionNode = selection.anchor.getNode();
			const parent = selectionNode.getParent();
			if (parent) {
				parent.insertAfter(codeNode);
			}
		});
	}

	function toggleLink(url: string) {
		activeEditor?.dispatchCommand(TOGGLE_LINK_COMMAND, url || null);
	}

	function handleInput() {
		updateIsEmpty();
		if (oninput) {
			const html = getHTML();
			oninput(html);
		}
	}

	onMount(() => {
		if (!editorRef) return;

		const config = {
			theme: {
				text: {
					bold: 'font-bold',
					italic: 'italic',
					underline: 'underline',
					strikethrough: 'line-through',
					code: 'rounded bg-muted px-1 py-0.5 text-sm font-mono'
				},
				heading: {
					h1: 'text-3xl font-bold',
					h2: 'text-2xl font-bold',
					h3: 'text-xl font-bold',
					h4: 'text-lg font-bold'
				},
				quote: 'border-l-4 border-primary/30 pl-4 italic text-muted-foreground',
				list: {
					ul: 'list-disc pl-6',
					ol: 'list-decimal pl-6'
				},
				listitem: 'mb-1',
				code: 'rounded bg-muted px-1 py-0.5 text-sm font-mono',
				codeHighlight: {
					'attr-name': 'text-primary',
					'attr-value': 'text-green-600',
					'punctuation': 'text-muted-foreground',
					'keyword': 'text-blue-600',
					'string': 'text-green-600',
					'function': 'text-purple-600',
					'class-name': 'text-yellow-600',
					'boolean': 'text-orange-600'
				}
			},
			namespace: 'HalalNeoEditor',
			nodes: [],
			onError: (error: Error) => {
				console.error('[Lexical Editor]', error);
			},
			history: historyState
		};

		editor = createEditor(config);
		activeEditor = editor;

		editor.setRootElement(editorRef);

		if (initialHtml) {
			setHTML(initialHtml);
		}

		const unregister = mergeRegister(
			editor.registerUpdateListener(({ editorState }) => {
				editorState.read(() => {
					updateIsEmpty();
					if (oninput && editor) {
						const ed = editor;
						const html = lexGenerateHtmlFromNodes(ed, null);
						oninput(html);
					}
				});
			}),
			registerHistory(editor, historyState, 1000)
		);

		return () => {
			unregister();
			editor = null;
			activeEditor = null;
		};
	});

	export function getEditor(): LexicalEditor | null {
		return activeEditor;
	}

	export function getHtml(): string {
		return getHTML();
	}

	export function setHtml(html: string) {
		setHTML(html);
	}

	export function focus() {
		activeEditor?.focus();
	}
</script>

<div class="lexical-editor flex flex-col rounded-lg border border-border bg-background">
	{#if editable}
		<Toolbar
			onFormatText={formatText}
			onFormatHeading={formatHeading}
			onFormatQuote={formatQuote}
			onFormatUnorderedList={formatUnorderedList}
			onFormatOrderedList={formatOrderedList}
			onRemoveList={removeList}
			onFormatCodeBlock={formatCodeBlock}
			onToggleLink={toggleLink}
		/>
	{/if}

	<div class="relative min-h-[200px]">
		{#if isEmpty}
			<div class="pointer-events-none absolute left-3 top-3 text-sm text-muted-foreground">
				{placeholder}
			</div>
		{/if}
		<div
			bind:this={editorRef}
			class="prose prose-sm max-w-none px-3 py-2 focus:outline-none"
			contenteditable={editable}
			oninput={handleInput}
			role="textbox"
			aria-multiline="true"
			aria-label="Rich text editor"
		></div>
	</div>
</div>

<style>
	.lexical-editor :global(.ProseMirror) {
		outline: none;
		min-height: 200px;
	}
	.lexical-editor :global(h1) {
		font-size: 1.875rem;
		font-weight: 700;
		line-height: 1.2;
		margin: 0.5em 0;
	}
	.lexical-editor :global(h2) {
		font-size: 1.5rem;
		font-weight: 700;
		line-height: 1.3;
		margin: 0.5em 0;
	}
	.lexical-editor :global(h3) {
		font-size: 1.25rem;
		font-weight: 700;
		line-height: 1.4;
		margin: 0.5em 0;
	}
	.lexical-editor :global(p) {
		margin: 0.25em 0;
	}
	.lexical-editor :global(blockquote) {
		border-left: 3px solid oklch(0.45 0.14 155 / 0.3);
		padding-left: 1rem;
		font-style: italic;
		color: oklch(0.5 0 0);
		margin: 0.5em 0;
	}
	.lexical-editor :global(ul) {
		list-style-type: disc;
		padding-left: 1.5rem;
		margin: 0.25em 0;
	}
	.lexical-editor :global(ol) {
		list-style-type: decimal;
		padding-left: 1.5rem;
		margin: 0.25em 0;
	}
	.lexical-editor :global(code) {
		background: oklch(0.95 0.005 85);
		border-radius: 4px;
		padding: 0.1em 0.3em;
		font-size: 0.875em;
		font-family: ui-monospace, monospace;
	}
	.lexical-editor :global(pre) {
		background: oklch(0.16 0.015 250);
		color: oklch(0.9 0 0);
		border-radius: 8px;
		padding: 1rem;
		overflow-x: auto;
		margin: 0.5em 0;
	}
	.lexical-editor :global(pre code) {
		background: transparent;
		color: inherit;
		padding: 0;
		font-size: 0.875em;
	}
	.lexical-editor :global(a) {
		color: oklch(0.45 0.14 155);
		text-decoration: underline;
		cursor: pointer;
	}
	.lexical-editor :global(strong) {
		font-weight: 700;
	}
	.lexical-editor :global(em) {
		font-style: italic;
	}
</style>
