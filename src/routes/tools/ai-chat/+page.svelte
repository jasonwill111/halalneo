<script lang="ts">
	import { Chat } from '@ai-sdk/svelte';
	import { DefaultChatTransport } from 'ai';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import SendIcon from '@lucide/svelte/icons/send';
	import BotIcon from '@lucide/svelte/icons/bot';
	import UserIcon from '@lucide/svelte/icons/user';

	let input = $state('');

	const chat = new Chat({
		transport: new DefaultChatTransport({
			api: '/api/chat'
		})
	});

	function handleSubmit(event: SubmitEvent) {
		event.preventDefault();
		if (!input.trim()) return;
		chat.sendMessage({ text: input });
		input = '';
	}
</script>

<div class="mx-auto flex max-w-3xl flex-col gap-4">
	<div class="flex items-center gap-3">
		<div class="flex size-10 items-center justify-center rounded-xl bg-primary/15">
			<BotIcon class="size-5 text-primary" />
		</div>
		<div>
			<h1 class="text-xl font-bold">HalalNeo AI</h1>
			<p class="text-sm text-muted-foreground">
				Ask about halal certification, sourcing, or compliance
			</p>
		</div>
	</div>

	<div
		class="flex min-h-[50vh] flex-col gap-4 rounded-xl border border-border/50 bg-card/50 p-4 backdrop-blur-sm"
	>
		{#if chat.messages.length === 0}
			<div class="flex flex-1 items-center justify-center">
				<div class="text-center text-muted-foreground">
					<BotIcon class="mx-auto mb-3 size-12 opacity-30" />
					<p class="text-sm">How can I help you with halal trade today?</p>
				</div>
			</div>
		{:else}
			<div class="flex-1 space-y-4 overflow-y-auto">
				{#each chat.messages as message (message.id)}
					<div class="flex gap-3 {message.role === 'user' ? 'justify-end' : ''}">
						{#if message.role !== 'user'}
							<div
								class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15"
							>
								<BotIcon class="size-4 text-primary" />
							</div>
						{/if}
						<div
							class="max-w-[80%] rounded-xl px-4 py-3 text-sm {message.role === 'user'
								? 'bg-primary text-primary-foreground'
								: 'bg-muted'}"
						>
							{#each message.parts as part}
								{#if part.type === 'text'}
									{part.text}
								{/if}
							{/each}
						</div>
						{#if message.role === 'user'}
							<div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">
								<UserIcon class="size-4" />
							</div>
						{/if}
					</div>
				{/each}
				{#if chat.isLoading}
					<div class="flex gap-3">
						<div class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15">
							<BotIcon class="size-4 text-primary" />
						</div>
						<div class="rounded-xl bg-muted px-4 py-3 text-sm">
							<span class="animate-pulse">Thinking...</span>
						</div>
					</div>
				{/if}
			</div>
		{/if}
	</div>

	<form onsubmit={handleSubmit} class="flex gap-2">
		<Input
			bind:value={input}
			placeholder="Ask about halal certification, suppliers, compliance..."
			class="flex-1"
			disabled={chat.isLoading}
		/>
		<Button type="submit" size="icon" disabled={chat.isLoading || !input.trim()}>
			<SendIcon class="size-4" />
		</Button>
	</form>
</div>
