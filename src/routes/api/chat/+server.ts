import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { convertToModelMessages, createUIMessageStreamResponse, streamText, type UIMessage } from 'ai';
import { z } from 'zod';
import { createAgnes, AGNES_MODEL_ID } from '#lib/server/ai/agnes.js';
import { HALAL_SYSTEM_PROMPT } from '#lib/server/ai/system-prompt.js';
import { getBindings } from '#lib/server/bindings.js';

/** Structural guard for inbound UIMessages (§6.1) — full part payloads stay
 *  `unknown`; AI SDK owns their shape on the wire. */
const uiMessageSchema = z.object({
	id: z.string().optional(),
	role: z.enum(['system', 'user', 'assistant']),
	parts: z.array(z.record(z.string(), z.unknown()))
});

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
		const body = (await request.json().catch(() => null)) as { messages?: unknown } | null;
		if (!body || !Array.isArray(body.messages)) {
			return json({ error: 'Invalid request: messages array required' }, { status: 400 });
		}

		const parsed = z.array(uiMessageSchema).safeParse(body.messages.slice(-20));
		if (!parsed.success) {
			return json({ error: 'Invalid request: malformed messages' }, { status: 400 });
		}

		const result = streamText({
			model: createAgnes(apiKey).chat(AGNES_MODEL_ID),
			system: HALAL_SYSTEM_PROMPT,
			messages: await convertToModelMessages(parsed.data as UIMessage[]),
			// §5.10.7 — external calls need a timeout so a hung upstream cannot
			// pin this Worker isolate until the platform kills it.
			abortSignal: AbortSignal.timeout(60_000)
		});

		return createUIMessageStreamResponse({ stream: result.toUIMessageStream() });
	} catch {
		return json({ error: 'Service temporarily unavailable' }, { status: 500 });
	}
};
