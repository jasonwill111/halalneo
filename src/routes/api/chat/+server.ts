import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { handleChatStream } from '@mastra/ai-sdk';
import { createUIMessageStreamResponse } from 'ai';
import { createMastra } from '#lib/server/mastra/index.js';
import { getBindings } from '#lib/server/bindings.js';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	let apiKey: string | undefined;
	try {
		apiKey = getBindings().AGNES_API_KEY;
	} catch {
		apiKey = undefined;
	}
	if (!apiKey) {
		return json({ error: 'AI service unavailable' }, { status: 503 });
	}

	try {
		const body = (await request.json().catch(() => null)) as any;
		if (!body || !Array.isArray(body.messages)) {
			return json({ error: 'Invalid request: messages array required' }, { status: 400 });
		}

		const params = { messages: body.messages.slice(-20) };

		const mastra = createMastra(apiKey);

		const stream = await handleChatStream({
			mastra,
			agentId: 'halal-agent',
			params
		});

		// @mastra/ai-sdk v1 stream chunks vs ai package UIMessageChunk types
		// drifted; the wire protocol is compatible — cast at the boundary.
		return createUIMessageStreamResponse({ stream: stream as any });
	} catch {
		return json({ error: 'Service temporarily unavailable' }, { status: 500 });
	}
};
